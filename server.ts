import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Define __dirname in ES Modules context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Core Gemini API endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, modelId } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Missing or invalid 'messages' array in request body." });
        return;
      }

      const apiKey = process.env.CALC_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ 
          error: "API Key is not configured. Please add either 'CALC_API_KEY' or 'GEMINI_API_KEY' in the Secrets panel (the Settings gear icon at the top right of the screen)." 
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Map 'user' -> 'user' and 'bot'/'assistant' -> 'model'
      const formattedContents = messages.map((m: any) => {
        const role = m.role === "user" ? "user" : "model";
        return {
          role,
          parts: [{ text: m.content || "" }],
        };
      });

      // Construct a customized system prompt depending on chosen modelId
      let activeInstruction = "";
      const selectedModel = modelId || "gemini";

      if (selectedModel === "claude") {
        activeInstruction = 
          "You are Anthropic's Claude 3.5 (Precision Scholar) solver, integrated within the calculator ONLY CALCULATOR. " +
          "Your personality is deeply rigorous, scholarly, and exceptionally thorough. " +
          "When solving mathematical, proof-based, or science queries: " +
          "1. Provide rigorous proofs, symbolic derivations, and logical step-by-step breakdowns. " +
          "2. Format equations using clean, standard math syntax. Avoid raw backslashes or complex LaTeX macros. Use simple, easily readable notation. " +
          "3. Break down mathematical problems from first principles to help the user learn. " +
          "4. Keep formatting clean, avoiding raw astetisks, trailing bracket clutter, or weird LaTeX leftovers. " +
          "5. CRITICAL: Conclude with the final calculated numerical value or calculator expression on its own line at the absolute bottom inside a brackets format: [RESULT: 15.25]. Only raw expression inside.";
      } else if (selectedModel === "gpt") {
        activeInstruction = 
          "You are OpenAI's ChatGPT 4o (Business & Accounts Specialist), integrated within the calculator ONLY CALCULATOR. " +
          "Your personality is commercial, ledger-focused, and highly quantitative. " +
          "When solving business, financial, statistical, or accounting queries: " +
          "1. Specialize in compound interest schedules, amortization formulas, depreciation schedules, margins, markups, tax math, and double-entry book balancing. " +
          "2. Format financial schedules using compact, beautiful markdown tables. " +
          "3. Present calculations clearly (e.g. Net Present Value, Future Value, EBITDA, Gross Profit Margin, Standard Deviation). " +
          "4. Clean your text lines of unnecessary symbol clutter. " +
          "5. CRITICAL: Conclude with the final calculated numerical value or formula on its own line at the absolute bottom inside: [RESULT: 1250.50]. Only the raw value inside.";
      } else if (selectedModel === "perplexity") {
        activeInstruction = 
          "You are Perplexity (Fact-Grounded Math Engine), integrated within the calculator ONLY CALCULATOR. " +
          "Your personality is concise, factual, grounded, and prompt. " +
          "When handling conversions, physical constants, geographic arithmetic, or general knowledge: " +
          "1. Give direct answers with standard facts, constant measurements (e.g., speed of light in vacuum = 299792458 m/s, Earth gravity = 9.80665 m/s²), and verified conversion constants. " +
          "2. Show calculation steps clearly without introductory filler or conversational fluff. " +
          "3. Map values across common systems of units (metrics vs. imperial) side-by-side using tabular presentation. " +
          "4. Avoid unnecessary decorative markdown symbols. " +
          "5. CRITICAL: Conclude with the final calculated numerical value or expression on its own line at the absolute bottom inside: [RESULT: 2.54]. Only the raw expression inside.";
      } else {
        // default 'gemini'
        activeInstruction = 
          "You are Google's Gemini 2.0 (Analytical Visionary) solver, integrated within the calculator ONLY CALCULATOR. " +
          "Your personality is supportive, analytical, highly technical, and deeply accurate. " +
          "When solving advanced scientific, physics, calculus, or algebraic queries: " +
          "1. Focus deeply on precision. Show calculations clearly. " +
          "2. Provide step-by-step breakdowns for calculus, algebraic systems, and matrices. " +
          "3. State key formulas prominently. " +
          "4. Keep the output incredibly clean, deleting trailing brackets, stray symbols, or unformatted math scraps. " +
          "5. CRITICAL: Conclude with the final calculated numerical value or expression on its own line at the absolute bottom inside: [RESULT: 4.12]. Only the raw expression inside.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: activeInstruction + " Keep answers concise but structurally complete. Use rich Markdown elements (bold texts, lists, tables) for visual structures.",
        },
      });

      const reply = response.text || "Sorry, I was unable to generate a response.";
      res.json({ reply });
    } catch (error: any) {
      console.error("Gemini API Error in backend:", error);
      res.status(500).json({
        error: error.message || "An error occurred while connecting matching services.",
      });
    }
  });

  // Vite development vs Production static files
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
    console.log(`Server starting on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
