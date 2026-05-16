import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
