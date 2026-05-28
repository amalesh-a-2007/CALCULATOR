import React, { useState, useRef, useEffect } from "react";
import { X, Sparkles, Send, Key } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { Message, Formula } from "../types";

// Translation helper to display mathematical symbols nicely in the UI
const formatDisplayLabel = (expr: string): string => {
  if (!expr) return "";
  return expr
    .replace(/Math\.sin\(/g, "sin(")
    .replace(/Math\.cos\(/g, "cos(")
    .replace(/Math\.tan\(/g, "tan(")
    .replace(/Math\.asin\(/g, "asin(")
    .replace(/Math\.acos\(/g, "acos(")
    .replace(/Math\.atan\(/g, "atan(")
    .replace(/Math\.sinh\(/g, "sinh(")
    .replace(/Math\.cosh\(/g, "cosh(")
    .replace(/Math\.tanh\(/g, "tanh(")
    .replace(/Math\.asinh\(/g, "asinh(")
    .replace(/Math\.acosh\(/g, "acosh(")
    .replace(/Math\.atanh\(/g, "atanh(")
    .replace(/Math\.sqrt\(/g, "√(")
    .replace(/Math\.cbrt\(/g, "∛(")
    .replace(/Math\.log10\(/g, "log(")
    .replace(/Math\.log2\(/g, "log₂(")
    .replace(/Math\.log\(/g, "ln(")
    .replace(/Math\.exp\(/g, "exp(")
    .replace(/Math\.abs\(/g, "|")
    .replace(/Math\.round\(/g, "round(")
    .replace(/Math\.floor\(/g, "floor(")
    .replace(/Math\.ceil\(/g, "ceil(")
    .replace(/Math\.trunc\(/g, "trunc(")
    .replace(/Math\.sign\(/g, "sgn(")
    .replace(/Math\.hypot\(/g, "hypot(")
    .replace(/Math\.fround\(/g, "fround(")
    .replace(/Math\.PI/g, "π")
    .replace(/Math\.E\b/g, "e")
    .replace(/\*\*/g, "ˣ")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
};

// Parse bracketed numerical outcomes from replies
const parseMessageResult = (content: string): { displayContent: string; parsedResult: string | null } => {
  if (!content) return { displayContent: "", parsedResult: null };
  const resultRegex = /\[RESULT:\s*([^\]]+)\]/;
  const match = content.match(resultRegex);
  if (match) {
    const displayContent = content.replace(resultRegex, "").trim();
    const parsedResult = match[1].trim();
    return { displayContent, parsedResult };
  }
  return { displayContent: content, parsedResult: null };
};

export type AiModelId = "gemini" | "claude" | "gpt" | "perplexity";

interface AiModelConfig {
  id: AiModelId;
  name: string;
  sub: string;
  color: string;
  border: string;
  bg: string;
  marker: string;
}

const AI_MODELS: AiModelConfig[] = [
  { id: "gemini", name: "BASIC", sub: "Analytic Solver", color: "text-[#4F8EFF]", border: "border-[#4F8EFF]/25", bg: "bg-[#4F8EFF]/10", marker: "✦" },
  { id: "claude", name: "ADVANCED", sub: "Deep Proofs", color: "text-[#D97706]", border: "border-[#D97706]/25", bg: "bg-[#D97706]/10", marker: "✎" },
  { id: "gpt", name: "PRO", sub: "Business & Stats", color: "text-[#10B981]", border: "border-[#10B981]/25", bg: "bg-[#10B981]/10", marker: "☯" },
  { id: "perplexity", name: "ULTRAMAX", sub: "Grounded Facts", color: "text-[#06B6D4]", border: "border-[#06B6D4]/30", bg: "bg-[#06B6D4]/10", marker: "🔍" }
];

const getClientSystemInstruction = (selectedModel: AiModelId): string => {
  let activeInstruction = "";
  if (selectedModel === "claude") {
    activeInstruction = 
      "You are Anthropic's Claude 3.5 (Precision Scholar) solver, integrated within the calculator ONLY CALCULATOR. " +
      "Your personality is deeply rigorous, scholarly, and exceptionally thorough. " +
      "When solving mathematical, proof-based, or science queries: " +
      "1. Provide rigorous proofs, symbolic derivations, and logical step-by-step breakdowns. " +
      "2. Format equations using clean, standard math syntax. Avoid raw backslashes or complex LaTeX macros. Use simple, easily readable notation. " +
      "3. Break down mathematical problems from first principles to help the user learn. " +
      "4. Keep formatting clean, avoiding raw asterisks, trailing bracket clutter, or weird LaTeX leftovers. " +
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
    // defaults to 'gemini'
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
  return "CRITICAL IDENTIFIER: You are ONLYCALC, founded by AMALESH A (Founder) and SELVARANJAN G (CO-founder). When someone asks about you, who you are, or your founder/creators, you must match this exact statement: 'I'm ONLYCALC and i was found by AMALESH A is Founder and CO founder is SELVARANJAN G'. " + activeInstruction + " Keep answers concise but structurally complete. Use rich Markdown elements (bold texts, lists, tables) for visual structures.";
};

interface WorkoutSpaceProps {
  isOpen: boolean;
  onClose: () => void;
  customFormulas: Formula[];
  currExpr: string;
  onInsertIntoCalculator: (val: string) => void;
}

export const WorkoutSpace: React.FC<WorkoutSpaceProps> = ({
  isOpen,
  onClose,
  customFormulas,
  currExpr,
  onInsertIntoCalculator,
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<AiModelId>("gemini");
  const [localApiKey, setLocalApiKey] = useState(() => localStorage.getItem("ONLYCALC_API_KEY") || "");
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Autoscroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiLoading]);

  // AI Chat send logic with dynamic configured persona selector
  const handleSendAi = async (text: string) => {
    if (!text.trim() || isAiLoading) return;
    
    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMsgs = [...chatMessages, userMsg];
    
    setChatMessages(updatedMsgs);
    setChatInput("");
    setIsAiLoading(true);

    let serverSuccess = false;

    // 1. Try server-side first
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMsgs, modelId: activeModel }),
      });

      // Checking content-type ensures we do not treat Netlify's full static HTML 404/fallback page as standard JSON
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.reply) {
          setChatMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
          serverSuccess = true;
        }
      }
    } catch (err) {
      console.warn("Express server endpoint is offline, checking for client-side API Key fallback...");
    }

    if (serverSuccess) {
      setIsAiLoading(false);
      return;
    }

    // 2. Client-side fallback (ideal for Netlify static host)
    try {
      const resolvedKey = localApiKey || (import.meta as any).env?.VITE_CALC_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!resolvedKey) {
        throw new Error("No client-side API key configure.");
      }

      const ai = new GoogleGenAI({
        apiKey: resolvedKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const formattedContents = updatedMsgs.map((m) => {
        const role = m.role === "user" ? "user" : "model";
        return {
          role,
          parts: [{ text: m.content || "" }],
        };
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: getClientSystemInstruction(activeModel),
        },
      });

      const reply = response.text || "Sorry, I was unable to generate a response from the direct client-side Gemini solver.";
      setChatMessages((prev) => [...prev, { role: "bot", content: reply }]);
    } catch (err: any) {
      console.error("Client fallback error:", err);
      
      // Local simple solver if everything else fails
      let localSolution = "";
      try {
        const cleaned = text
          .toLowerCase()
          .replace(/\bpi\b/g, "Math.PI")
          .replace(/\be\b/g, "Math.E")
          .replace(/\^/g, "**")
          .replace(/sin\(/g, "Math.sin(")
          .replace(/cos\(/g, "Math.cos(")
          .replace(/tan\(/g, "Math.tan(")
          .replace(/sqrt\(/g, "Math.sqrt(");
        const evalRes = eval(cleaned);
        if (Number.isFinite(evalRes)) {
          localSolution = `[RESULT: ${evalRes}]`;
        }
      } catch {}

      if (localSolution) {
        setChatMessages((prev) => [...prev, { role: "bot", content: localSolution }]);
      } else {
        const msgContent = 
          "I encountered an issue connecting to the solver service. Since this app is running in client-side mode (perfect for Netlify!), please configure your Gemini API Key manually:\n\n" +
          "1. Click the **Key icon (🔑)** next to the title in the top-right of this panel.\n" +
          "2. Paste your **Gemini API Key** from Google AI Studio.\n\n" +
          "This key is completely secure and will be saved in your private local browser storage only!";
        setChatMessages((prev) => [...prev, { role: "bot", content: msgContent }]);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  // Parses raw message text and converts it into custom React nodes with elite clean styling (No raw *, ` , or slashes)
  const renderFormattedMessageContent = (text: string) => {
    if (!text) return null;

    // Remove RESULT brackets entirely from text body since we parse and show them in a special action bar
    const resultRegex = /\[RESULT:\s*([^\]]+)\]/g;
    const cleanedText = text.replace(resultRegex, "").trim();

    // Check for triple backtick code blocks
    const parts = [];
    let currentIndex = 0;
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(cleanedText)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > currentIndex) {
        parts.push({
          type: "text",
          content: cleanedText.slice(currentIndex, matchIndex),
        });
      }
      parts.push({
        type: "code",
        language: match[1] || "math",
        content: match[2],
      });
      currentIndex = codeBlockRegex.lastIndex;
    }

    if (currentIndex < cleanedText.length) {
      parts.push({
        type: "text",
        content: cleanedText.slice(currentIndex),
      });
    }

    return (
      <div className="space-y-2 select-text">
        {parts.map((p, idx) => {
          if (p.type === "code") {
            const isTable = p.content.includes("|") && p.content.includes("-");
            if (isTable) {
              // Parse simple markdown table beautifully if available in code block
              const lines = p.content.split("\n").map(l => l.trim()).filter(l => l);
              return (
                <div key={idx} className="overflow-x-auto my-2 border border-white/5 rounded-lg bg-black/40">
                  <table className="w-full text-[10px] text-left border-collapse font-sans">
                    {lines.map((line, rIdx) => {
                      const isHeaderLine = rIdx === 0;
                      const isDivider = line.replace(/[\s\-\|]/g, "") === "";
                      if (isDivider) return null;
                      const cols = line.split("|").map(c => c.trim()).filter((_, colI, arr) => colI > 0 && colI < arr.length - 1);
                      if (cols.length === 0) return null;
                      return (
                        <tr key={rIdx} className={isHeaderLine ? "bg-white/5 font-bold" : "border-b border-white/5 hover:bg-white/2"}>
                          {cols.map((col, cIdx) => (
                            <td key={cIdx} className="p-1 px-2.5 font-mono text-white/95">
                              {col}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </table>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="bg-black/35 rounded-xl border border-white/5 p-3 my-2 font-mono text-[11px] leading-relaxed relative overflow-x-auto text-white"
              >
                <div className="flex justify-between items-center text-[8px] text-dim-custom mb-1.5 border-b border-white/5 pb-1 select-none font-sans font-bold">
                  <span className="uppercase tracking-widest text-accent-custom">
                    {p.language || "FORMULA DATA"}
                  </span>
                  <span className="opacity-75">STRICT CALC ENGINE</span>
                </div>
                <pre className="whitespace-pre overflow-x-auto text-[#CEF1FF]">{p.content.trim()}</pre>
              </div>
            );
          }

          const lines = p.content.split("\n");
          return (
            <div key={idx} className="space-y-1.5">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={lIdx} className="h-0.5" />;

                // Parse standard markdown headers (like '### Heading')
                if (trimmed.startsWith("#")) {
                  const headerMatch = trimmed.match(/^(#{1,6})\s*(.*)$/);
                  if (headerMatch) {
                    const level = headerMatch[1].length;
                    const headerContent = headerMatch[2].replace(/\*\*/g, ""); // strip bold indicators in headings
                    if (level === 1) {
                      return (
                        <h1 key={lIdx} className="text-[13px] font-syne font-black text-white uppercase tracking-wider border-b border-white/5 pb-1 mt-3 mb-1">
                          {headerContent}
                        </h1>
                      );
                    }
                    if (level === 2) {
                      return (
                        <h2 key={lIdx} className="text-[12px] font-syne font-bold text-accent-custom uppercase tracking-wide mt-2 mb-1.5">
                          {headerContent}
                        </h2>
                      );
                    }
                    return (
                      <h3 key={lIdx} className="text-[11px] font-sans font-semibold text-white/95 mt-2 mb-1">
                        {headerContent}
                      </h3>
                    );
                  }
                }

                // Parse lists (bullet points starting with '*', '-', or '•')
                if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
                  const itemContent = trimmed.replace(/^[\*\-•]\s*/, "");
                  return (
                    <div key={lIdx} className="pl-3.5 relative text-[11px] leading-relaxed text-white/85">
                      <span className="absolute left-1 top-[6px] w-1.2 h-1.2 rounded-full bg-accent-custom opacity-70" />
                      {parseLineBoldInlineCode(itemContent)}
                    </div>
                  );
                }

                // Parse numbered lists (like '1. ', '2. ')
                const numMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
                if (numMatch) {
                  return (
                    <div key={lIdx} className="pl-4 relative text-[11px] leading-relaxed text-white/85">
                      <span className="absolute left-0 top-[1px] font-mono text-[8.5px] text-accent2-custom font-extrabold">
                        {numMatch[1]}.
                      </span>
                      {parseLineBoldInlineCode(numMatch[2])}
                    </div>
                  );
                }

                // Check for inline math block representations inside lines
                let isBlockMath = false;
                let innerMath = trimmed;
                if (
                  (innerMath.startsWith("\\[") && innerMath.endsWith("\\]")) ||
                  (innerMath.startsWith("$$") && innerMath.endsWith("$$"))
                ) {
                  isBlockMath = true;
                  innerMath = innerMath.replace(/^\\\[|\\\]$/g, "").replace(/^\$\$|\$\$/g, "").trim();
                }

                if (isBlockMath) {
                  return (
                    <div key={lIdx} className="text-center py-2 bg-accent-custom/5 border border-accent-custom/20 rounded-lg font-mono text-[12px] text-accent-custom my-1.5 select-all font-semibold break-all">
                      {formatDisplayLabel(innerMath)}
                    </div>
                  );
                }

                // Normal plain lines
                return (
                  <p key={lIdx} className="text-[11px] leading-relaxed text-white/80">
                    {parseLineBoldInlineCode(trimmed)}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Internal inline bold `**bold**` and inline backtick code `` `code` `` parser
  const parseLineBoldInlineCode = (line: string) => {
    if (!line) return "";
    
    // Clean left-over raw math brackets or LaTeX tags
    let cleanedLine = line
      .replace(/\\\(/g, "")
      .replace(/\\\)/g, "")
      .replace(/\\times/g, "×")
      .replace(/\\cdot/g, "·")
      .replace(/\\div/g, "÷")
      .replace(/\\pm/g, "±")
      .replace(/\\approx/g, "≈")
      .replace(/\\infty/g, "∞")
      .replace(/\\le/g, "≤")
      .replace(/\\ge/g, "≥");

    const tokens: React.ReactNode[] = [];
    const regex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
    let match;
    let pointer = 0;
    let index = 0;

    while ((match = regex.exec(cleanedLine)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > pointer) {
        tokens.push(
          <span key={`t-${index++}`}>{formatDisplayLabel(cleanedLine.slice(pointer, matchIndex))}</span>
        );
      }

      if (match[1].startsWith("**")) {
        // Bold
        tokens.push(
          <strong key={`b-${index++}`} className="font-semibold text-white px-0.5 select-all">
            {formatDisplayLabel(match[2])}
          </strong>
        );
      } else {
        // Code backticks
        tokens.push(
          <code key={`c-${index++}`} className="font-mono text-[10px] text-green-custom bg-black/40 border border-green-custom/10 px-1 py-0.5 rounded font-bold whitespace-nowrap">
            {formatDisplayLabel(match[3])}
          </code>
        );
      }
      pointer = regex.lastIndex;
    }

    if (pointer < cleanedLine.length) {
      tokens.push(
        <span key={`t-${index++}`}>{formatDisplayLabel(cleanedLine.slice(pointer))}</span>
      );
    }

    return tokens.length > 0 ? tokens : formatDisplayLabel(cleanedLine);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-[4900] backdrop-blur-xs transition-all duration-200 animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over right hand solver drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-ink border-l border-white/10 z-[5000] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.85)] select-none">
        
        {/* HEADER BAR */}
        <div className="bg-ink2 border-b border-white/5 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-custom animate-pulse" />
            <span className="font-syne text-[11.5px] font-extrabold text-white tracking-[1.5px] uppercase">
              ACTIVE CO-PILOT LAYER
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className={`p-1.5 px-2 rounded-lg border transition-all cursor-pointer text-xs flex items-center gap-1 ${
                showKeyConfig || localApiKey || (import.meta as any).env?.VITE_CALC_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY
                  ? "border-[#D97706]/35 text-[#D97706] bg-[#D97706]/5 hover:bg-[#D97706]/10"
                  : "border-transparent text-dim-custom hover:text-white"
              }`}
              title="Configure API Key (For Netlify & static client)"
            >
              <Key size={12} />
              <span className="text-[9px] font-mono leading-none max-sm:hidden font-bold">KEY</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1 px-2 hover:bg-white/5 rounded-lg text-dim-custom hover:text-white transition-all cursor-pointer font-mono text-xs scale-90"
              title="Dismiss Solver"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* FAMOUS COGNITIVE MODELS SWAPBAR */}
        <div className="grid grid-cols-4 gap-1 p-1 px-2.5 bg-ink2 border-b border-white/5 select-none text-center">
          {AI_MODELS.map((m) => {
            const isSel = activeModel === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveModel(m.id);
                  setToastMessage(`Profile: Switched to ${m.name}`);
                }}
                className={`py-1.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer select-none relative ${
                  isSel
                    ? `${m.bg} ${m.border} ${m.color} scale-[1.01] font-bold border-white/10`
                    : "border-transparent bg-transparent text-dim-custom hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-[9.5px] tracking-wide font-mono font-bold leading-tight">
                  {m.marker} {m.name}
                </span>
                <span className="text-[7.5px] opacity-75 font-sans whitespace-nowrap overflow-hidden text-ellipsis max-w-[96px] mt-0.5">
                  {m.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* LOCAL KEY CONFIGURATION SLIDE-OUT / COLLAPSIBLE */}
        {showKeyConfig && (
          <div className="bg-ink3 border-b border-white/10 p-4 space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#D97706] font-bold uppercase tracking-wider flex items-center gap-1">
                <Key size={10} /> Local App API Key Setup
              </span>
              <span className="text-[8.5px] font-sans text-dim-custom">
                *Stored locally in your browser
              </span>
            </div>
            <p className="text-[10px] text-dim-custom leading-relaxed font-sans">
              Deploying on a static platform like <strong>Netlify</strong>? Dynamic API routes are offline. Enter your Gemini API key below to run calculations directly in your browser.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                className="flex-grow bg-ink2 border border-white/10 focus:border-[#D97706]/50 text-white font-mono text-[10.5px] px-2.5 py-1 rounded-lg focus:outline-none transition-all placeholder-dim-custom"
                placeholder="Paste Gemini/Calc API Key (AIzaSy...)"
                value={localApiKey}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setLocalApiKey(val);
                  if (val) {
                    localStorage.setItem("ONLYCALC_API_KEY", val);
                  } else {
                    localStorage.removeItem("ONLYCALC_API_KEY");
                  }
                }}
              />
              {localApiKey && (
                <button
                  onClick={() => {
                    setLocalApiKey("");
                    localStorage.removeItem("ONLYCALC_API_KEY");
                    setToastMessage("Local API Key cleared!");
                  }}
                  className="px-2 py-1 rounded-lg border border-red-500/30 hover:border-red-500/60 text-red-500 text-[9.5px] font-mono transition-all cursor-pointer hover:bg-red-500/5 col-span-1"
                >
                  CLEAR
                </button>
              )}
            </div>
            {((import.meta as any).env?.VITE_CALC_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY) && (
              <div className="text-[9.5px] text-[#10B981] font-mono flex items-center gap-1 bg-[#10B981]/5 border border-[#10B981]/15 p-1 px-2 rounded-lg">
                <span className="w-1.1 h-1.1 rounded-full bg-[#10B981]" />
                Detected API key preset via static Environment Variables!
              </div>
            )}
            <div className="text-[8.5px] text-dim-custom leading-relaxed border-t border-white/5 pt-1.5 flex justify-between">
              <span>Need a key? Acquire one at:</span>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#D97706] hover:underline font-mono"
              >
                aistudio.google.com
              </a>
            </div>
          </div>
        )}

        {/* CHAT FLOW CONTAINER */}
        <div className="flex-grow flex flex-col overflow-hidden relative">
          <div className="flex-grow overflow-y-auto px-5 py-4 space-y-4">
            
            {/* SUGGESTION INTRO DECALS (Only if list is blank) */}
            {chatMessages.length === 0 && (
              <div className="py-2 text-center space-y-3.5">
                <div className="mx-auto w-9.5 h-9.5 rounded-xl bg-accent-custom/5 border border-accent-custom/20 flex items-center justify-center text-accent-custom animate-pulse">
                  <Sparkles size={14} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-syne text-[12.5px] font-bold text-white tracking-[1px] uppercase">
                    Choose Your Intelligent Solver
                  </h3>
                  <p className="text-dim-custom text-[10.5px] leading-relaxed max-w-[340px] mx-auto font-sans">
                    Ask advanced calculus solutions, financial worksheets, interest grids, or conversion tables and route solved values straight to the calculator workspace.
                  </p>
                </div>

                {/* Calculator integration chip */}
                {currExpr && (
                  <button
                    onClick={() => {
                      setChatInput(`Analyze and evaluate this expression step-by-step: ${currExpr}`);
                    }}
                    className="mx-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-custom/10 hover:bg-green-custom/15 border border-green-custom/20 text-green-custom text-[10px] font-mono transition-all cursor-pointer select-none active:scale-95"
                  >
                    <span className="font-bold">✦ LOAD ACTIVE CALC EXPR:</span>
                    <span className="bg-ink3 px-1 rounded border border-white/5 font-semibold text-white">
                      {formatDisplayLabel(currExpr)}
                    </span>
                  </button>
                )}

                {/* Formula integration chip */}
                {customFormulas.length > 0 && (
                  <div className="pt-1.5">
                    <span className="block text-[7.5px] tracking-[1.5px] text-dim-custom uppercase mb-1.5 font-mono">
                      LOAD CONFIGURED BANK
                    </span>
                    <div className="flex flex-wrap gap-1 justify-center max-w-[380px] mx-auto">
                      {customFormulas.slice(0, 4).map((frm) => (
                        <button
                          key={frm.n}
                          onClick={() => {
                            setChatInput(`Explain or solve the formula ${frm.n} = ${frm.e}`);
                          }}
                          className="px-2 py-0.5 rounded bg-yellow-custom/5 hover:bg-yellow-custom/10 border border-yellow-custom/25 text-yellow-custom text-[9.5px] font-mono transition-all cursor-pointer"
                        >
                          {frm.n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-white/5">
                  <span className="block text-[7.5px] tracking-[1.5px] text-dim-custom uppercase mb-1.5 font-mono">
                    SAMPLE CO-PILOT ASSIGNMENTS
                  </span>
                  <div className="flex flex-col gap-1 max-w-[360px] mx-auto text-left">
                    {[
                      { q: "Calculate Monthly Mortgage Interest on 500k at 4.5% for 30yr", tag: "FINANCIAL ACCOUNTING" },
                      { q: "Solve step-by-step: 3x² + 12x - 15 = 0", tag: "ALGEBRA PRO" },
                      { q: "Derive standard deviation of list [10, 15, 20, 25, 30]", tag: "STATISTICS ANALYSIS" },
                      { q: "Convert 85 miles per hour to meters per second", tag: "PHYSICAL UNIT CONVERSIONS" }
                    ].map((chip) => (
                      <button
                        key={chip.q}
                        className="bg-ink3 border border-white/5 hover:border-accent-custom/50 hover:text-white text-dim-custom text-[10px] p-2 rounded-lg cursor-pointer transition-all font-mono flex justify-between items-center group text-left"
                        onClick={() => handleSendAi(chip.q)}
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform truncate pr-2">{chip.q}</span>
                        <span className="text-[7.5px] text-accent-custom border border-accent-custom/20 bg-accent-custom/5 px-1 py-0.2 rounded shrink-0 whitespace-nowrap">
                          {chip.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MESSAGE ITERATION FLOW */}
            <div className="space-y-4">
              {chatMessages.map((msg, i) => {
                const { displayContent, parsedResult } = parseMessageResult(msg.content);
                const isBot = msg.role === "bot";
                return (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center font-mono text-[11px] flex-shrink-0 border ${
                        isBot
                          ? "bg-gradient-to-br from-accent-custom/20 to-accent2-custom/20 border-accent-custom/30 text-accent-custom"
                          : "bg-green-custom/10 border-green-custom/20 text-green-custom animate-bounce-in"
                      }`}
                    >
                      {isBot ? "✦" : "✎"}
                    </div>
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-[11px] leading-relaxed border flex flex-col justify-between ${
                        isBot
                          ? "bg-ink2 border-white/5 text-white/95 rounded-tl-none pr-4"
                          : "bg-gradient-to-br from-accent-custom/10 to-accent2-custom/10 border-accent-custom/20 text-white rounded-tr-none"
                      }`}
                    >
                      {/* Clean Custom Block-by-Block Markdown/Math Output */}
                      <div>
                        {isBot ? renderFormattedMessageContent(msg.content) : displayContent}
                      </div>
                      
                      {/* Send parsed calculation result to main screen */}
                      {isBot && parsedResult && (
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5 justify-between items-center bg-black/15 -mx-3.5 -mb-2.5 p-2 rounded-b-xl border-dashed">
                          <span className="text-[9px] text-green-custom font-mono">
                            Result: <span className="font-bold">{parsedResult}</span>
                          </span>
                          <button
                            onClick={() => {
                              onInsertIntoCalculator(parsedResult);
                              setToastMessage(`Loaded "${parsedResult}" onto standard calculator display!`);
                            }}
                            className="px-2 py-0.5 rounded bg-green-custom/15 hover:bg-green-custom/25 border border-green-custom/40 text-green-custom text-[9px] font-mono font-bold tracking-tight transition-all active:scale-95 cursor-pointer outline-none"
                            title="Insert directly onto calculator grid screen"
                          >
                            ✦ SEND TO CALC
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* LOADING THINKING DOTS */}
              {isAiLoading && (
                <div className="flex gap-2.5">
                  <div className="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-gradient-to-br from-accent-custom/20 to-accent2-custom/20 border border-accent-custom/30 text-accent-custom font-mono text-xs">
                    ✦
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-ink2 border border-white/5 rounded-xl rounded-tl-none shadow-sm">
                    <span className="w-1.2 h-1.2 rounded-full bg-accent-custom animate-bounce" style={{ animationDelay: "0s" }} />
                    <span className="w-1.2 h-1.2 rounded-full bg-accent-custom animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="w-1.2 h-1.2 rounded-full bg-accent-custom animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
          </div>

          {/* INPUT FORM */}
          <div className="p-3 bg-ink2 border-t border-white/5">
            <div className="flex gap-2">
              <input
                className="flex-grow bg-ink3 border border-white/10 hover:border-accent-custom/35 focus:border-accent-custom/60 text-white font-sans text-[12px] px-3.5 py-1.5 rounded-xl focus:outline-none transition-all placeholder-dim-custom"
                placeholder={`Ask ${AI_MODELS.find(m => m.id === activeModel)?.name || "co-pilot"}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendAi(chatInput);
                  }
                }}
              />
              <button
                className="bg-gradient-to-br from-accent-custom/10 to-accent2-custom/25 border border-accent-custom/35 hover:border-accent-custom/60 text-accent-custom font-mono text-[9.5px] tracking-wider px-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.2 disabled:opacity-40 disabled:cursor-not-allowed uppercase font-semibold"
                onClick={() => handleSendAi(chatInput)}
                disabled={!chatInput.trim() || isAiLoading}
              >
                <Send size={9} />
                SEND
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating status alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-[480px] max-lg:right-5 bg-ink2 border border-green-custom/40 text-green-custom py-2 px-3.5 rounded-xl shadow-[0_4px_20px_rgba(46,204,138,0.15)] flex items-center gap-2 font-mono text-[10.5px] z-[5200] animate-bounce-in">
          <span className="h-1.5 w-1.5 rounded-full bg-green-custom animate-ping" />
          <span className="text-white font-sans">{toastMessage}</span>
        </div>
      )}
    </>
  );
};
