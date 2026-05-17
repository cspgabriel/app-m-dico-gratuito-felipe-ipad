import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import MercadoPagoConfig, { Preference } from "mercadopago";

dotenv.config();

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP for local development/preview compatibility
    })
  );

  // Gemini API Proxy
  app.post("/api/ai/process-anamnesis", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      const prompt = `
        Você é um assistente médico especializado em organização de prontuários.
        Transforme o seguinte texto (que pode ser uma fala de um médico ou anotações rápidas) em um prontuário estruturado.
        
        Texto recebido: "${text}"
        
        Retorne um JSON com exatamente estes campos em português:
        {
          "queixaPrincipal": "resumo da queixa",
          "hda": "história da doença atual detalhada",
          "antecedentes": "antecedentes pessoais e familiares",
          "exameFisico": "achados do exame físico",
          "hipoteseDiagnostica": "possíveis diagnósticos",
          "conduta": "plano de tratamento e próximas etapas"
        }
        Apenas o JSON, sem markdown.
      `;

      const response = await genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      let jsonText = response.text || "";
      jsonText = jsonText.replace(/```json|```/g, "").trim();
      res.json(JSON.parse(jsonText));
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to process medical text" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context, history } = req.body;
      
      const systemInstruction = `
        Você é o assistente virtual inteligente desta clínica.
        Sua missão é ajudar o médico com informações dos relatórios, responder dúvidas e dar suporte sobre os dados da clínica.
        Seja educado, objetivo e prestativo. Contexto atual do banco de dados (Apenas leitura):
        ${context || 'Nenhum dado fornecido'}
      `;

      let contents = [];
      if (history && Array.isArray(history)) {
        contents = history.map((item: any) => ({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.text }]
        }));
      }

      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // Mercado Pago – criar preferência de pagamento
  app.post("/api/payments/create-preference", async (req, res) => {
    try {
      const { planName, amount, email } = req.body;

      const preference = new Preference(mpClient);
      const result = await preference.create({
        body: {
          items: [
            {
              id: "clinica-pro-mensal",
              title: planName || "Clínica Pro – Mensal",
              quantity: 1,
              unit_price: amount || 149.0,
              currency_id: "BRL",
            },
          ],
          payer: email ? { email } : undefined,
          back_urls: {
            success: `${process.env.APP_URL || "http://localhost:3000"}/billing?status=success`,
            failure: `${process.env.APP_URL || "http://localhost:3000"}/billing?status=failure`,
            pending: `${process.env.APP_URL || "http://localhost:3000"}/billing?status=pending`,
          },
          auto_return: "approved",
        },
      });

      res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
      console.error("MercadoPago Error:", error);
      res.status(500).json({ error: "Failed to create payment preference" });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
