import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import crypto from "crypto";
import { MercadoPagoConfig, Preference, PreApproval, Payment } from "mercadopago";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

// Firebase Admin (uses service account env or Application Default Credentials)
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: firebaseConfig.projectId,
      });
    }
  } catch (err) {
    console.warn("[firebase-admin] Initialization failed — webhook/auth endpoints will be disabled:", (err as Error).message);
  }
}

const firestore = admin.apps.length
  ? (firebaseConfig.firestoreDatabaseId
      ? getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId)
      : getFirestore(admin.app()))
  : null;

// Mercado Pago client
const mpAccessToken = process.env.MP_ACCESS_TOKEN || "";
const mpWebhookSecret = process.env.MP_WEBHOOK_SECRET || "";
const mpClient = mpAccessToken ? new MercadoPagoConfig({ accessToken: mpAccessToken, options: { timeout: 10000 } }) : null;

// Plans (mirrored from src/lib/plans.ts — keep in sync)
const PLAN_PRICES: Record<string, { name: string; price: number }> = {
  basico: { name: "Básico", price: 0 },
  profissional: { name: "Profissional", price: 149 },
  multi: { name: "Multi-Clínicas", price: 349 },
};

async function verifyAuth(req: express.Request): Promise<admin.auth.DecodedIdToken | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length);
  if (!admin.apps.length) return null;
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

function getAppUrl(req: express.Request): string {
  return process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Webhook needs raw body for signature verification — register BEFORE express.json
  app.post("/api/billing/webhook", express.raw({ type: "*/*" }), async (req, res) => {
    try {
      if (!mpClient || !firestore) {
        console.warn("[webhook] MP or Firestore not configured");
        return res.status(200).send("ok");
      }

      const rawBody = (req.body as Buffer)?.toString("utf8") || "";

      // Signature verification (x-signature header: ts=...,v1=...)
      if (mpWebhookSecret) {
        const sig = (req.headers["x-signature"] as string) || "";
        const requestId = (req.headers["x-request-id"] as string) || "";
        const parts = Object.fromEntries(sig.split(",").map((p) => p.trim().split("=")));
        const ts = parts["ts"];
        const v1 = parts["v1"];
        const dataId = (req.query["data.id"] || req.query.id || "") as string;
        if (ts && v1) {
          const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
          const expected = crypto.createHmac("sha256", mpWebhookSecret).update(manifest).digest("hex");
          if (expected !== v1) {
            console.warn("[webhook] invalid signature");
            return res.status(401).send("invalid signature");
          }
        }
      }

      const payload = rawBody ? JSON.parse(rawBody) : {};
      const type = payload.type || payload.topic;
      const id = payload.data?.id || payload.id;

      if (!type || !id) return res.status(200).send("ignored");

      if (type === "subscription_preapproval" || type === "preapproval") {
        const pa = await new PreApproval(mpClient).get({ id: String(id) });
        const userId = pa.external_reference;
        if (userId) {
          await firestore.collection("subscriptions").doc(userId).set({
            userId,
            mpPreapprovalId: pa.id,
            status: mapPreapprovalStatus(pa.status),
            plan: pa.reason ? inferPlanFromReason(pa.reason) : undefined,
            amount: pa.auto_recurring?.transaction_amount || 0,
            currency: pa.auto_recurring?.currency_id || "BRL",
            payerEmail: pa.payer_email,
            nextPaymentDate: pa.next_payment_date,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          await firestore.collection("users").doc(userId).set({
            plan: inferPlanFromReason(pa.reason || ""),
            subscriptionStatus: mapPreapprovalStatus(pa.status),
          }, { merge: true });
        }
      } else if (type === "payment") {
        const payment = await new Payment(mpClient).get({ id: String(id) });
        const userId = payment.external_reference;
        if (userId) {
          const status = payment.status === "approved" ? "active" : payment.status === "pending" ? "pending" : "failed";
          await firestore.collection("subscriptions").doc(userId).set({
            userId,
            status,
            lastPaymentDate: payment.date_approved || payment.date_created,
            lastPaymentId: payment.id,
            amount: payment.transaction_amount || 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          if (status === "active") {
            await firestore.collection("users").doc(userId).set({ subscriptionStatus: "active" }, { merge: true });
          }
        }
      }

      res.status(200).send("ok");
    } catch (err) {
      console.error("[webhook] error:", err);
      res.status(200).send("ok"); // ack to avoid retries storm
    }
  });

  app.use(express.json());
  app.use(cors());
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // ---------- Mercado Pago endpoints ----------

  app.get("/api/billing/config", (_req, res) => {
    res.json({
      enabled: !!mpClient,
      publicKey: process.env.MP_PUBLIC_KEY || null,
    });
  });

  // One-time Checkout Pro preference (returns init_point for redirect)
  app.post("/api/billing/create-preference", async (req, res) => {
    try {
      if (!mpClient) return res.status(503).json({ error: "Mercado Pago não configurado." });
      const decoded = await verifyAuth(req);
      if (!decoded) return res.status(401).json({ error: "Não autenticado." });

      const { plan } = req.body as { plan: string };
      const planDef = PLAN_PRICES[plan];
      if (!planDef || planDef.price <= 0) return res.status(400).json({ error: "Plano inválido." });

      const appUrl = getAppUrl(req);
      const preference = await new Preference(mpClient).create({
        body: {
          items: [
            {
              id: plan,
              title: `Clinicafy — Plano ${planDef.name}`,
              description: `Assinatura mensal do plano ${planDef.name}`,
              quantity: 1,
              currency_id: "BRL",
              unit_price: planDef.price,
            },
          ],
          payer: { email: decoded.email || undefined },
          external_reference: decoded.uid,
          metadata: { userId: decoded.uid, plan },
          back_urls: {
            success: `${appUrl}/#/billing/success?plan=${plan}`,
            failure: `${appUrl}/#/billing/failure?plan=${plan}`,
            pending: `${appUrl}/#/billing/pending?plan=${plan}`,
          },
          auto_return: "approved",
          statement_descriptor: "Clinicafy",
          notification_url: `${appUrl}/api/billing/webhook`,
        },
      });

      if (firestore) {
        await firestore.collection("subscriptions").doc(decoded.uid).set({
          userId: decoded.uid,
          plan,
          status: "pending",
          mpPreferenceId: preference.id,
          mpInitPoint: preference.init_point,
          amount: planDef.price,
          currency: "BRL",
          payerEmail: decoded.email || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      res.json({ initPoint: preference.init_point, preferenceId: preference.id });
    } catch (err) {
      console.error("[create-preference] error:", err);
      res.status(500).json({ error: "Falha ao criar preferência." });
    }
  });

  // Recurring subscription (preapproval) — best for SaaS
  app.post("/api/billing/create-subscription", async (req, res) => {
    try {
      if (!mpClient) return res.status(503).json({ error: "Mercado Pago não configurado." });
      const decoded = await verifyAuth(req);
      if (!decoded) return res.status(401).json({ error: "Não autenticado." });

      const { plan, payerEmail } = req.body as { plan: string; payerEmail?: string };
      const planDef = PLAN_PRICES[plan];
      if (!planDef || planDef.price <= 0) return res.status(400).json({ error: "Plano inválido." });

      const email = payerEmail || decoded.email;
      if (!email) return res.status(400).json({ error: "E-mail do pagador é obrigatório." });

      const appUrl = getAppUrl(req);
      const preapproval = await new PreApproval(mpClient).create({
        body: {
          reason: `Clinicafy — Plano ${planDef.name}`,
          external_reference: decoded.uid,
          payer_email: email,
          back_url: `${appUrl}/#/billing/success?plan=${plan}`,
          status: "pending",
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: planDef.price,
            currency_id: "BRL",
          },
        },
      });

      if (firestore) {
        await firestore.collection("subscriptions").doc(decoded.uid).set({
          userId: decoded.uid,
          plan,
          status: mapPreapprovalStatus(preapproval.status),
          mpPreapprovalId: preapproval.id,
          mpInitPoint: preapproval.init_point,
          amount: planDef.price,
          currency: "BRL",
          payerEmail: email,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      res.json({ initPoint: preapproval.init_point, preapprovalId: preapproval.id });
    } catch (err) {
      console.error("[create-subscription] error:", err);
      res.status(500).json({ error: "Falha ao criar assinatura." });
    }
  });

  app.post("/api/billing/cancel-subscription", async (req, res) => {
    try {
      if (!mpClient || !firestore) return res.status(503).json({ error: "Serviço indisponível." });
      const decoded = await verifyAuth(req);
      if (!decoded) return res.status(401).json({ error: "Não autenticado." });

      const subSnap = await firestore.collection("subscriptions").doc(decoded.uid).get();
      const sub = subSnap.data();
      if (!sub?.mpPreapprovalId) return res.status(404).json({ error: "Assinatura não encontrada." });

      await new PreApproval(mpClient).update({
        id: sub.mpPreapprovalId,
        body: { status: "cancelled" },
      });

      await firestore.collection("subscriptions").doc(decoded.uid).set({
        status: "cancelled",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      await firestore.collection("users").doc(decoded.uid).set({
        subscriptionStatus: "cancelled",
        plan: "basico",
      }, { merge: true });

      res.json({ ok: true });
    } catch (err) {
      console.error("[cancel-subscription] error:", err);
      res.status(500).json({ error: "Falha ao cancelar assinatura." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`  Mercado Pago: ${mpClient ? "ENABLED" : "DISABLED (set MP_ACCESS_TOKEN)"}`);
    console.log(`  Firestore Admin: ${firestore ? "ENABLED" : "DISABLED"}`);
  });
}

function mapPreapprovalStatus(s?: string): string {
  switch (s) {
    case "authorized": return "active";
    case "paused": return "paused";
    case "cancelled": return "cancelled";
    case "pending": return "pending";
    default: return s || "pending";
  }
}

function inferPlanFromReason(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes("multi")) return "multi";
  if (r.includes("profissional")) return "profissional";
  return "basico";
}

startServer();
