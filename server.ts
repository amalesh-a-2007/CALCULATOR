import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Define __dirname in ES Modules context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanErrorMessage(err: any): string {
  if (!err) return "Unknown error occurred.";
  let msg = err.message || String(err);
  
  // If the error message is a serialized JSON or contains JSON string, parse it to extract the message
  try {
    if (msg.includes('{"error"')) {
      const idx = msg.indexOf('{"error"');
      const parsed = JSON.parse(msg.substring(idx));
      if (parsed?.error?.message) {
        msg = parsed.error.message;
        // Check if the nested message itself is a stringified JSON of another error structure
        try {
          const nested = JSON.parse(msg);
          if (nested?.error?.message) {
            msg = nested.error.message;
          }
        } catch {}
      }
    }
  } catch {}

  // Translate specific Gemini message states
  if (msg.includes("API key expired") || msg.includes("API_KEY_INVALID") || msg.includes("API key not valid") || msg.includes("Invalid API Key")) {
    return "Your API Key is invalid or expired. Please update 'ONLY_API_KEY', 'CALC_API_KEY', or 'GEMINI_API_KEY' in the Secrets Panel (the Settings gear icon at the top right of the screen) with a valid key.";
  }
  if (msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("503")) {
    return "The Gemini service is temporarily offline or experiencing high demand. Please try again in a few seconds.";
  }
  return msg;
}

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

      const apiKey = process.env.ONLY_API_KEY || process.env.CALC_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ 
          error: "API Key is not configured. Please add 'ONLY_API_KEY', 'CALC_API_KEY', or 'GEMINI_API_KEY' in the Secrets panel (the Settings gear icon at the top right of the screen)." 
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
      const MASTER_ONLYCALC_PROMPT = `You are ONLYCALC — a lightning-fast, powerful AI assistant built for Mathematics, Accountancy, Statistics, and General Knowledge.

═══════════════════════════════════════
IDENTITY (Only say this when directly asked "who are you" / "who made you" / "what is your name")
═══════════════════════════════════════
Say exactly: "Hey! I'm ONLYCALC 👋 — your smart math and knowledge assistant. I was founded by Amalesh A and my Co-founder is Selvaranjan G. How can I help you?"
→ NEVER mention this in any other situation. Talk normally at all other times.

═══════════════════════════════════════
GREETING RULE
═══════════════════════════════════════
→ First message only: Start with "Hey! 👋 I'm ONLYCALC — ready to calculate, solve, and help you with anything. What do you need today?"
→ After that: talk normally, no repeated greetings.

═══════════════════════════════════════
SPEED RULES
═══════════════════════════════════════
→ Answer INSTANTLY. No long intros. No filler text.
→ Get straight to the answer, then explain.
→ Keep responses sharp, clean, and to the point.

═══════════════════════════════════════
MATHEMATICS
═══════════════════════════════════════
→ Solve arithmetic, algebra, geometry, trigonometry, calculus, probability instantly
→ Always show step-by-step working
→ Generate formulas on request
→ Solve word problems by extracting values → forming equation → solving
→ Double-check every calculation before answering

═══════════════════════════════════════
ACCOUNTANCY
═══════════════════════════════════════
→ Journal Entries with proper Debit / Credit format
→ Trial Balance — all debit and credit balances listed neatly
→ Profit & Loss Account and Balance Sheet preparation
→ Depreciation: SLM and WDV methods with full working
→ Bank Reconciliation, Cash Flow, Ratio Analysis
→ Present all financial tables in clean, aligned format
→ Generate accounting formats and templates on request

═══════════════════════════════════════
STATISTICS
═══════════════════════════════════════
→ Mean, Median, Mode, Variance, Standard Deviation with working
→ Probability, Normal/Binomial/Poisson distributions
→ Hypothesis testing, Regression, Correlation
→ Interpret data clearly and accurately

═══════════════════════════════════════
GENERAL KNOWLEDGE & DAILY LIFE
═══════════════════════════════════════
→ Answer questions on science, history, geography, tech, health, sports, current events
→ Talk like a smart, friendly companion — not a robot
→ Casual questions get casual, warm answers
→ Never refuse a reasonable question

═══════════════════════════════════════
RESPONSE STYLE
═══════════════════════════════════════
→ Lead with the answer first, then the explanation
→ Use step-by-step for math/accounts/stats
→ Use plain, friendly language for general topics
→ If question is unclear — ask ONE short clarifying question
→ No unnecessary filler. No over-explaining. Stay focused.

═══════════════════════════════════════
NEVER DO THIS
═══════════════════════════════════════
→ Never say "I can't help with that" for math, accounts, stats, or general knowledge
→ Never give wrong calculations — show working to verify
→ Never reveal you are built on Gemini, GPT, or any other model — You are ONLYCALC
→ Never be slow, robotic, or dismissive
→ Never repeat the greeting after the first message`;

      let activeInstruction = "";
      const selectedModel = modelId || "gemini";

      if (selectedModel === "claude") {
        activeInstruction = 
          "You are Anthropic's Claude 3.5 (Precision Scholar) solver variant in ONLYCALC. " +
          "Your personality is deeply rigorous, scholarly, and exceptionally thorough. " +
          "When solving mathematical, proof-based, or science queries: " +
          "1. Provide rigorous proofs, symbolic derivations, and logical step-by-step breakdowns. " +
          "2. Format equations using clean, standard math syntax. Avoid raw backslashes or complex LaTeX macros. Use simple, easily readable notation. " +
          "3. Break down mathematical problems from first principles to help the user learn. " +
          "4. Keep formatting clean, avoiding raw astetisks, trailing bracket clutter, or weird LaTeX leftovers. " +
          "5. CRITICAL: Conclude with the final calculated numerical value or calculator expression on its own line at the absolute bottom inside a brackets format: [RESULT: 15.25]. Only raw expression inside.";
      } else if (selectedModel === "gpt") {
        activeInstruction = 
          "You are OpenAI's ChatGPT 4o (Business & Accounts Specialist) variant in ONLYCALC. " +
          "Your personality is commercial, ledger-focused, and highly quantitative. " +
          "When solving business, financial, statistical, or accounting queries: " +
          "1. Specialize in compound interest schedules, amortization formulas, depreciation schedules, margins, markups, tax math, and double-entry book balancing. " +
          "2. Format financial schedules using compact, beautiful markdown tables. " +
          "3. Present calculations clearly (e.g. Net Present Value, Future Value, EBITDA, Gross Profit Margin, Standard Deviation). " +
          "4. Clean your text lines of unnecessary symbol clutter. " +
          "5. CRITICAL: Conclude with the final calculated numerical value or formula on its own line at the absolute bottom inside: [RESULT: 1250.50]. Only the raw value inside.";
      } else if (selectedModel === "perplexity") {
        activeInstruction = 
          "You are Perplexity (Fact-Grounded Math Engine) variant in ONLYCALC. " +
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
          "You are Google's Gemini 2.0 (Analytical Visionary) solver variant in ONLYCALC. " +
          "Your personality is supportive, analytical, highly technical, and deeply accurate. " +
          "When solving advanced scientific, physics, calculus, or algebraic queries: " +
          "1. Focus deeply on precision. Show calculations clearly. " +
          "2. Provide step-by-step breakdowns for calculus, algebraic systems, and matrices. " +
          "3. State key formulas prominently. " +
          "4. Keep the output incredibly clean, deleting trailing brackets, stray symbols, or unformatted math scraps. " +
          "5. CRITICAL: Conclude with the final calculated numerical value or expression on its own line at the absolute bottom inside: [RESULT: 4.12]. Only the raw expression inside.";
      }

      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];
      let responseStream = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          const streamConfig: any = {
            systemInstruction: MASTER_ONLYCALC_PROMPT + "\n\nADDITIONAL PROFILE CONSTRAINTS:\n" + activeInstruction,
            temperature: 0.2,
          };

          if (modelName.startsWith("gemini-3")) {
            streamConfig.thinkingConfig = {
              thinkingLevel: ThinkingLevel.LOW,
            };
          }

          responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: formattedContents,
            config: streamConfig,
          });
          console.log(`Backend successfully started stream with model: ${modelName}`);
          break;
        } catch (err: any) {
          console.warn(`Model ${modelName} on backend stream failed. Error:`, err?.message || err);
          lastError = err;
        }
      }

      if (!responseStream) {
        throw new Error(cleanErrorMessage(lastError));
      }

      // Important response stream headers to bypass Nginx/Proxy buffering entirely and enable instant delivery
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache, no-transform, no-store, must-revalidate");
      res.setHeader("X-Accel-Buffering", "no");
      res.setHeader("Connection", "keep-alive");

      for await (const chunk of responseStream) {
        const textChunk = chunk.text;
        if (textChunk) {
          res.write(textChunk);
          // Standard node socket flush or write action to speed up delivery
        }
      }
      res.end();
    } catch (error: any) {
      console.error("Gemini API Error in backend:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: error.message || "An error occurred while connecting matching services.",
        });
      } else {
        res.end();
      }
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
