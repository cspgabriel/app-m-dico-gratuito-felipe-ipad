import express from "express";
import path from "path";
import { createRequire } from "module";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import crypto from "crypto";
import { MercadoPagoConfig, Preference, PreApproval, Payment } from "mercadopago";
import admin from "firebase-admin";
import { prisma } from "./src/lib/prisma.js";

const require = createRequire(import.meta.url);
const firebaseConfig = require("./firebase-applet-config.json");

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

// Mercado Pago client
const mpAccessToken = process.env.MP_ACCESS_TOKEN || "";
const mpWebhookSecret = process.env.MP_WEBHOOK_SECRET || "";
const mpClient = mpAccessToken ? new MercadoPagoConfig({ accessToken: mpAccessToken, options: { timeout: 10000 } }) : null;

// Plans (mirrored from src/lib/plans.ts — keep in sync)
const PLAN_PRICES: Record<string, { name: string; price: number }> = {
  basico: { name: "Básico", price: 0 },
  profissional: { name: "Profissional", price: 149 },
  vitalicio: { name: "Vitalício", price: 2497 },
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

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

  // Webhook needs raw body for signature verification — register BEFORE express.json
  app.post("/api/billing/webhook", express.raw({ type: "*/*" }), async (req, res) => {
    try {
      if (!mpClient) {
        console.warn("[webhook] MP not configured");
        return res.status(200).send("ok");
      }

      const rawBody = (req.body as Buffer)?.toString("utf8") || "";

      // Signature verification
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
          const plan = pa.reason ? inferPlanFromReason(pa.reason) : "basico";
          const status = mapPreapprovalStatus(pa.status);

          await prisma.subscription.upsert({
            where: { userId },
            update: {
              mpPreapprovalId: pa.id,
              status,
              plan,
              amount: pa.auto_recurring?.transaction_amount || 0,
              currency: pa.auto_recurring?.currency_id || "BRL",
              payerEmail: pa.payer_email,
              nextPaymentDate: pa.next_payment_date ? new Date(pa.next_payment_date).toISOString() : null,
            },
            create: {
              userId,
              mpPreapprovalId: pa.id,
              status,
              plan,
              amount: pa.auto_recurring?.transaction_amount || 0,
              currency: pa.auto_recurring?.currency_id || "BRL",
              payerEmail: pa.payer_email,
              nextPaymentDate: pa.next_payment_date ? new Date(pa.next_payment_date).toISOString() : null,
            }
          });

          await prisma.userProfile.upsert({
            where: { uid: userId },
            update: { plan, subscriptionStatus: status },
            create: {
              uid: userId,
              name: pa.payer_email || "Doutor",
              plan,
              subscriptionStatus: status,
              tenantId: userId,
              role: "doctor",
              onboardingComplete: false
            }
          });
        }
      } else if (type === "payment") {
        const payment = await new Payment(mpClient).get({ id: String(id) });
        const userId = payment.external_reference;
        if (userId) {
          const status = payment.status === "approved" ? "active" : payment.status === "pending" ? "pending" : "failed";
          const currentSub = await prisma.subscription.findUnique({ where: { userId } });
          const selectedPlan = currentSub?.plan || payment.metadata?.plan || "basico";

          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan: selectedPlan,
              status,
              lastPaymentDate: payment.date_approved || payment.date_created,
              lastPaymentId: String(payment.id),
              amount: payment.transaction_amount || 0,
            },
            create: {
              userId,
              plan: selectedPlan,
              status,
              lastPaymentDate: payment.date_approved || payment.date_created,
              lastPaymentId: String(payment.id),
              amount: payment.transaction_amount || 0,
            }
          });

          if (status === "active") {
            await prisma.userProfile.upsert({
              where: { uid: userId },
              update: { plan: selectedPlan, subscriptionStatus: "active" },
              create: {
                uid: userId,
                name: payment.payer?.email || "Doutor",
                plan: selectedPlan,
                subscriptionStatus: "active",
                tenantId: userId,
                role: "doctor",
                onboardingComplete: false
              }
            });
          }
        }
      }

      res.status(200).send("ok");
    } catch (err) {
      console.error("[webhook] error:", err);
      res.status(200).send("ok");
    }
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(cors());
  app.use(helmet({ contentSecurityPolicy: false }));

  // ---------- API CRUD Endpoints ----------

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "clinicafy-mysql" });
  });

  // UserProfile endpoints
  app.get("/api/users/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const profile = await prisma.userProfile.findUnique({ where: { uid } });
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      res.json(profile);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/users/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const profile = await prisma.userProfile.findFirst({
        where: { slug, onboardingComplete: true }
      });
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      res.json(profile);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { uid, name, title, crn, clinicName, logoUrl, slug, bio, whatsapp, instagram, geminiApiKey, role, tenantId, onboardingComplete, plan, subscriptionStatus } = req.body;
      const profile = await prisma.userProfile.upsert({
        where: { uid },
        update: { name, title, crn, clinicName, logoUrl, slug, bio, whatsapp, instagram, geminiApiKey, role, tenantId, onboardingComplete, plan, subscriptionStatus },
        create: { uid, name, title, crn, clinicName, logoUrl, slug, bio, whatsapp, instagram, geminiApiKey, role, tenantId, onboardingComplete, plan: plan || "basico", subscriptionStatus }
      });
      res.json(profile);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Pacientes endpoints
  app.get("/api/pacientes", async (req, res) => {
    try {
      const { userId } = req.query;
      const whereClause: any = {};
      if (userId) whereClause.userId = String(userId);

      const pacientes = await prisma.paciente.findMany({
        where: whereClause,
        orderBy: { nome: 'asc' }
      });
      res.json(pacientes);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/pacientes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const paciente = await prisma.paciente.findUnique({
        where: { id },
        include: {
          anamneses: true,
          consultas: true,
          exames: true
        }
      });
      if (!paciente) return res.status(404).json({ error: "Paciente not found" });
      res.json(paciente);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/pacientes", async (req, res) => {
    try {
      const { id, nome, cpf, telefone, nascimento, sexo, convenio, registroAns, planoSaude, numeroCarteira, validadeCarteira, alergias, medicacoes, historico, userId } = req.body;
      const data = { nome, cpf, telefone, nascimento, sexo, convenio, registroAns, planoSaude, numeroCarteira, validadeCarteira, alergias, medicacoes, historico, userId };
      if (id) {
        const paciente = await prisma.paciente.update({
          where: { id },
          data
        });
        res.json(paciente);
      } else {
        const paciente = await prisma.paciente.create({
          data
        });
        res.json(paciente);
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/pacientes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.paciente.delete({ where: { id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Anamneses endpoints
  app.get("/api/pacientes/:pacienteId/anamneses", async (req, res) => {
    try {
      const { pacienteId } = req.params;
      const anamneses = await prisma.anamnese.findMany({
        where: { pacienteId },
        orderBy: { createdAt: 'desc' }
      });
      res.json(anamneses);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/pacientes/:pacienteId/anamneses", async (req, res) => {
    try {
      const { pacienteId } = req.params;
      const { queixaPrincipal, hda, antecedentesPessoais, antecedentesFamiliares, habitosVida, userId } = req.body;
      const anamnese = await prisma.anamnese.create({
        data: { pacienteId, queixaPrincipal, hda, antecedentesPessoais, antecedentesFamiliares, habitosVida, userId }
      });
      res.json(anamnese);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/anamneses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.anamnese.delete({ where: { id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Consultas endpoints
  app.get("/api/pacientes/:pacienteId/consultas", async (req, res) => {
    try {
      const { pacienteId } = req.params;
      const consultas = await prisma.consulta.findMany({
        where: { pacienteId },
        orderBy: { data: 'desc' }
      });
      res.json(consultas);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/pacientes/:pacienteId/consultas", async (req, res) => {
    try {
      const { pacienteId } = req.params;
      const { data, queixa, exameFisico, conduta, cid10, tuss, userId } = req.body;
      const consulta = await prisma.consulta.create({
        data: { pacienteId, data, queixa, exameFisico, conduta, cid10, tuss, userId }
      });
      res.json(consulta);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/consultas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.consulta.delete({ where: { id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Exames endpoints
  app.get("/api/pacientes/:pacienteId/exames", async (req, res) => {
    try {
      const { pacienteId } = req.params;
      const exames = await prisma.exame.findMany({
        where: { pacienteId },
        orderBy: { dataUpload: 'desc' }
      });
      res.json(exames);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/pacientes/:pacienteId/exames", async (req, res) => {
    try {
      const { pacienteId } = req.params;
      const { nome, url, tipo, tamanho, userId, dataUpload } = req.body;
      const exame = await prisma.exame.create({
        data: { pacienteId, nome, url, tipo, tamanho: Number(tamanho), userId, dataUpload }
      });
      res.json(exame);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/exames/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.exame.delete({ where: { id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Agendamentos endpoints
  app.get("/api/agendamentos", async (req, res) => {
    try {
      const { userId } = req.query;
      const whereClause: any = {};
      if (userId) whereClause.userId = String(userId);

      const agendamentos = await prisma.agendamento.findMany({
        where: whereClause,
        orderBy: { data: 'asc' }
      });
      res.json(agendamentos);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/agendamentos", async (req, res) => {
    try {
      const { id, pacienteId, pacienteNome, data, duracao, tipo, status, local, observacoes, userId } = req.body;
      const dataObj = { pacienteId, pacienteNome, data, duracao: Number(duracao), tipo, status, local, observacoes, userId };
      if (id) {
        const agendamento = await prisma.agendamento.update({
          where: { id },
          data: dataObj
        });
        res.json(agendamento);
      } else {
        const agendamento = await prisma.agendamento.create({
          data: dataObj
        });
        res.json(agendamento);
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/agendamentos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.agendamento.delete({ where: { id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Recibos endpoints
  app.get("/api/recibos", async (req, res) => {
    try {
      const { userId } = req.query;
      const whereClause: any = {};
      if (userId) whereClause.userId = String(userId);

      const recibos = await prisma.recibo.findMany({
        where: whereClause,
        orderBy: { data: 'desc' }
      });
      res.json(recibos);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/recibos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const recibo = await prisma.recibo.findUnique({ where: { id } });
      if (!recibo) return res.status(404).json({ error: "Recibo not found" });
      res.json(recibo);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/recibos", async (req, res) => {
    try {
      const { id, pacienteId, pacienteNome, numero, data, valor, servico, prestador, tomador, formaPagamento, observacoes, retencaoINSS, retencaoIR, status, cancelledAt, userId } = req.body;
      const dataObj = {
        pacienteId,
        pacienteNome,
        numero,
        data,
        valor: Number(valor),
        servico,
        prestador,
        tomador,
        formaPagamento,
        observacoes,
        retencaoINSS: retencaoINSS ? Number(retencaoINSS) : null,
        retencaoIR: retencaoIR ? Number(retencaoIR) : null,
        status: status || "issued",
        cancelledAt,
        userId
      };
      if (id) {
        const recibo = await prisma.recibo.update({
          where: { id },
          data: dataObj
        });
        res.json(recibo);
      } else {
        const recibo = await prisma.recibo.create({
          data: dataObj
        });
        res.json(recibo);
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/recibos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.recibo.delete({ where: { id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Guias endpoints (TissGuide)
  app.get("/api/guias", async (req, res) => {
    try {
      const { userId } = req.query;
      const whereClause: any = {};
      if (userId) whereClause.userId = String(userId);

      const guias = await prisma.tissGuide.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });
      res.json(guias);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/guias/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const guia = await prisma.tissGuide.findUnique({ where: { id } });
      if (!guia) return res.status(404).json({ error: "Guia not found" });
      res.json(guia);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/guias", async (req, res) => {
    try {
      const { id, userId, pacienteId, consultaId, tipoGuia, status, numeroGuia, numeroGuiaOperadora, numeroGuiaPrincipal, operadora, registroAns, planoSaude, numeroCarteira, validadeCarteira, pacienteNome, pacienteCpf, dataAtendimento, cid10, tuss, indicacaoClinica, conduta, caraterAtendimento, tipoConsulta, senhaAutorizacao, dataAutorizacao, validadeSenha, valorTotal, loteId, protocolo, motivoGlosa } = req.body;
      const dataObj = {
        userId,
        pacienteId,
        consultaId,
        tipoGuia,
        status,
        numeroGuia,
        numeroGuiaOperadora,
        numeroGuiaPrincipal,
        operadora,
        registroAns,
        planoSaude,
        numeroCarteira,
        validadeCarteira,
        pacienteNome,
        pacienteCpf,
        dataAtendimento,
        cid10,
        tuss,
        indicacaoClinica,
        conduta,
        caraterAtendimento,
        tipoConsulta,
        senhaAutorizacao,
        dataAutorizacao,
        validadeSenha,
        valorTotal: valorTotal ? Number(valorTotal) : null,
        loteId,
        protocolo,
        motivoGlosa
      };
      if (id) {
        const guia = await prisma.tissGuide.update({
          where: { id },
          data: dataObj
        });
        res.json(guia);
      } else {
        const guia = await prisma.tissGuide.create({
          data: dataObj
        });
        res.json(guia);
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/guias/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.tissGuide.delete({ where: { id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Invites endpoints
  app.get("/api/invites", async (req, res) => {
    try {
      const { email, tenantId } = req.query;
      const whereClause: any = {};
      if (email) whereClause.email = String(email);
      if (tenantId) whereClause.tenantId = String(tenantId);

      const invites = await prisma.invite.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });
      res.json(invites);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/invites", async (req, res) => {
    try {
      const { email, tenantId, role, invitedBy } = req.body;
      const invite = await prisma.invite.upsert({
        where: { email },
        update: { tenantId, role, invitedBy },
        create: { email, tenantId, role, invitedBy }
      });
      res.json(invite);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/invites/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.invite.delete({ where: { id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- Mercado Pago endpoints ----------

  app.get("/api/billing/config", (_req, res) => {
    res.json({
      enabled: !!mpClient,
      publicKey: process.env.MP_PUBLIC_KEY || null,
    });
  });

  // One-time Checkout Pro preference
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
              description: `Assinatura do plano ${planDef.name}`,
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

      await prisma.subscription.upsert({
        where: { userId: decoded.uid },
        update: {
          plan,
          status: "pending",
          mpPreferenceId: preference.id,
          mpInitPoint: preference.init_point,
          amount: planDef.price,
          currency: "BRL",
          payerEmail: decoded.email || null,
        },
        create: {
          userId: decoded.uid,
          plan,
          status: "pending",
          mpPreferenceId: preference.id,
          mpInitPoint: preference.init_point,
          amount: planDef.price,
          currency: "BRL",
          payerEmail: decoded.email || null,
        }
      });

      res.json({ initPoint: preference.init_point, preferenceId: preference.id });
    } catch (err) {
      console.error("[create-preference] error:", err);
      res.status(500).json({ error: "Falha ao criar preferência." });
    }
  });

  // Recurring subscription
  app.post("/api/billing/create-subscription", async (req, res) => {
    try {
      if (!mpClient) return res.status(503).json({ error: "Mercado Pago não configurado." });
      const decoded = await verifyAuth(req);
      if (!decoded) return res.status(401).json({ error: "Não autenticado." });

      const { plan, payerEmail } = req.body as { plan: string; payerEmail?: string };
      const planDef = PLAN_PRICES[plan];
      if (!planDef || planDef.price <= 0) return res.status(400).json({ error: "Plano inválido." });
      if (plan === "vitalicio") return res.status(400).json({ error: "Plano Vitalício usa pagamento único." });

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

      const status = mapPreapprovalStatus(preapproval.status);

      await prisma.subscription.upsert({
        where: { userId: decoded.uid },
        update: {
          plan,
          status,
          mpPreapprovalId: preapproval.id,
          mpInitPoint: preapproval.init_point,
          amount: planDef.price,
          currency: "BRL",
          payerEmail: email,
        },
        create: {
          userId: decoded.uid,
          plan,
          status,
          mpPreapprovalId: preapproval.id,
          mpInitPoint: preapproval.init_point,
          amount: planDef.price,
          currency: "BRL",
          payerEmail: email,
        }
      });

      res.json({ initPoint: preapproval.init_point, preapprovalId: preapproval.id });
    } catch (err) {
      console.error("[create-subscription] error:", err);
      res.status(500).json({ error: "Falha ao criar assinatura." });
    }
  });

  app.post("/api/billing/cancel-subscription", async (req, res) => {
    try {
      if (!mpClient) return res.status(503).json({ error: "Serviço indisponível." });
      const decoded = await verifyAuth(req);
      if (!decoded) return res.status(401).json({ error: "Não autenticado." });

      const sub = await prisma.subscription.findUnique({ where: { userId: decoded.uid } });
      if (!sub?.mpPreapprovalId) return res.status(404).json({ error: "Assinatura não encontrada." });

      await new PreApproval(mpClient).update({
        id: sub.mpPreapprovalId,
        body: { status: "cancelled" },
      });

      await prisma.subscription.update({
        where: { userId: decoded.uid },
        data: { status: "cancelled" }
      });

      await prisma.userProfile.update({
        where: { uid: decoded.uid },
        data: { subscriptionStatus: "cancelled", plan: "basico" }
      });

      res.json({ ok: true });
    } catch (err) {
      console.error("[cancel-subscription] error:", err);
      res.status(500).json({ error: "Falha ao cancelar assinatura." });
    }
  });

  // Vite/Listen setup - skip when running on Vercel
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      import("vite").then(({ createServer: createViteServer }) => createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      })).then((vite) => {
        app.use(vite.middlewares);
        app.listen(PORT, "0.0.0.0", () => {
          console.log(`Dev server running on http://localhost:${PORT}`);
        });
      });
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Prod server running on http://localhost:${PORT}`);
      });
    }
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
  if (r.includes("vital")) return "vitalicio";
  if (r.includes("profissional")) return "profissional";
  return "basico";
}

