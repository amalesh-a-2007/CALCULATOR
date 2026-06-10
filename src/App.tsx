import React, { useState, useEffect, FormEvent } from "react";
import {
  History,
  RotateCcw,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Divide,
  Percent,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  LayoutGrid,
} from "lucide-react";
import { CalcMode, ActivePanel, Formula, HistoryItem } from "./types";
import { FormulaModal } from "./components/FormulaModal";
import { WorkoutSpace } from "./components/WorkoutSpace";
import { gpaHtmlContent } from "./gpaContent";

// Mathematical expression text formatter to human-friendly display rendering
const displayFormatter = (expr: string): string => {
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
    .replace(/\*\*/g, "ʸ")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
};

const solveNaturalLanguage = (
  text: string,
): { expression: string; result: number | string } | null => {
  const t = text.toLowerCase().trim();

  let m = t.match(/(?:what is\s*)?([\d\.]+)\s*%\s*of\s*([\d\.]+)/);
  if (m)
    return {
      expression: `${m[1]}% of ${m[2]}`,
      result: (parseFloat(m[1]) / 100) * parseFloat(m[2]),
    };

  m = t.match(
    /simple interest\s*on\s*([\d\.]+)\s*at\s*([\d\.]+)\s*%\s*for\s*([\d\.]+)\s*years?/,
  );
  if (m)
    return {
      expression: `SI on ${m[1]} at ${m[2]}% for ${m[3]}y`,
      result: (parseFloat(m[1]) * parseFloat(m[2]) * parseFloat(m[3])) / 100,
    };

  m = t.match(
    /compound interest\s*on\s*([\d\.]+)\s*at\s*([\d\.]+)\s*%\s*for\s*([\d\.]+)\s*years?/,
  );
  if (m)
    return {
      expression: `CI on ${m[1]} at ${m[2]}% for ${m[3]}y`,
      result:
        parseFloat(m[1]) *
          Math.pow(1 + parseFloat(m[2]) / 100, parseFloat(m[3])) -
        parseFloat(m[1]),
    };

  m = t.match(/area of (?:a )?circle\s*(?:with )?(?:radius )?([\d\.]+)/);
  if (m)
    return {
      expression: `Area of circle r=${m[1]}`,
      result: Math.PI * Math.pow(parseFloat(m[1]), 2),
    };

  return null;
};

const evaluateSafe = (expression: string): number => {
  if (!expression) return 0;

  // Clean trailing operators like +, -, *, /, %, **, ^
  let cleaned = expression.trim();
  while (cleaned.length > 0 && /[\+\-\*\/%\|\^\s]$/.test(cleaned)) {
    cleaned = cleaned.trim();
    if (/[\+\-\*\/%\|\^]$/.test(cleaned)) {
      cleaned = cleaned.substring(0, cleaned.length - 1);
    } else {
      break;
    }
  }

  // Also strip any hanging operators if double or nested (e.g. "5+3+  " -> "5+3")
  cleaned = cleaned.trim();
  while (cleaned.length > 0 && /[\+\-\*\/%\|\^]$/.test(cleaned)) {
    cleaned = cleaned.substring(0, cleaned.length - 1).trim();
  }

  if (!cleaned) return 0;

  // Implied multiplication formats:
  // digit( -> digit*(
  cleaned = cleaned.replace(/(\d)\(/g, "$1*(");
  // )digit -> )*digit
  cleaned = cleaned.replace(/\)(\d)/g, ")*$1");
  // )( -> )*(
  cleaned = cleaned.replace(/\)\(/g, ")*(");
  // digit pi -> digit*pi
  cleaned = cleaned.replace(/(\d)(Math\.PI|pi\b|π)/gi, "$1*$2");

  // Expose Math variables to the local scope of eval
  const {
    sin,
    cos,
    tan,
    asin,
    acos,
    atan,
    sinh,
    cosh,
    tanh,
    asinh,
    acosh,
    atanh,
    sqrt,
    cbrt,
    log,
    log10,
    log2,
    exp,
    abs,
    round,
    floor,
    ceil,
    trunc,
    sign,
    hypot,
    fround,
    PI,
    E,
  } = Math;

  const pi = Math.PI;
  const e = Math.E;
  const ln = Math.log;

  // Balance parentheses
  let openParentheses = (cleaned.match(/\(/g) || []).length;
  let closeParentheses = (cleaned.match(/\)/g) || []).length;
  while (openParentheses > closeParentheses) {
    cleaned += ")";
    closeParentheses++;
  }

  const result = eval(cleaned);

  if (typeof result !== "number" || isNaN(result)) {
    const num = Number(result);
    if (isNaN(num)) {
      throw new Error("Invalid output");
    }
    return num;
  }
  return result;
};

export default function App() {
  // ── CORE STATES ──
  const [expr, setExpr] = useState<string>("");
  const [typedInput, setTypedInput] = useState<string>("");
  const [prevExprString, setPrevExprString] = useState<string>("");
  const [mainResult, setMainResult] = useState<string>("0");
  const [isError, setIsError] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>("₹");

  // Memory, Mode, Active Panel, custom formulas list and history stack
  const [memory, setMemory] = useState<number | null>(null);
  const [mode, setMode] = useState<CalcMode>("standard");
  const [showGPA, setShowGPA] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>("main");
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // ── OVERLAY DIALOG STATES ──
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);
  const [isWorkoutOpen, setIsWorkoutOpen] = useState<boolean>(false);

  // Custom dialog overrides for GST/Discount inputs (avoiding standard browser prompts)
  const [accountingAction, setAccountingAction] = useState<string | null>(null);
  const [accountingValue, setAccountingValue] = useState<string>("");

  // Load custom formulas from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("oc_fmls");
      if (stored) {
        setFormulas(JSON.parse(stored));
      } else {
        // Boostrap initial empty formulas list
        setFormulas([]);
      }
    } catch {
      setFormulas([]);
    }
  }, []);

  // Update live preview calculations as user enters text
  useEffect(() => {
    if (!expr) {
      setTypedInput("");
      return;
    }
    try {
      // Evaluate expression on changes to update display expression preview
      const resultValue = evaluateSafe(expr);
      if (
        Number.isFinite(resultValue) &&
        String(resultValue) !== displayFormatter(expr)
      ) {
        // Display subtle live preview of evaluated results next to input lines
        setTypedInput("= " + +resultValue.toFixed(10));
      } else {
        setTypedInput("");
      }
    } catch {
      setTypedInput("");
    }
  }, [expr]);

  // Synchronize keydown entries directly to match desktop usage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside standard text areas / inputs manually
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isWorkoutOpen ||
        isFormulaModalOpen ||
        accountingAction !== null
      ) {
        return;
      }

      const key = e.key;
      if ("0123456789".includes(key)) {
        handleInsertCharacter(key);
      } else if (key === "+") {
        handleInsertCharacter("+");
      } else if (key === "-") {
        handleInsertCharacter("-");
      } else if (key === "*") {
        handleInsertCharacter("*");
      } else if (key === "/") {
        e.preventDefault();
        handleInsertCharacter("/");
      } else if (key === ".") {
        handleInsertCharacter(".");
      } else if (key === "(") {
        handleInsertCharacter("(");
      } else if (key === ")") {
        handleInsertCharacter(")");
      } else if (key === "Enter") {
        e.preventDefault();
        handleEvaluate();
      } else if (key === "Backspace") {
        handleBackspace();
      } else if (key === "Escape") {
        handleAllClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expr, isWorkoutOpen, isFormulaModalOpen, accountingAction]);

  // ── MATH EVALUATORS ──
  const handleInsertCharacter = (char: string) => {
    setIsError(false);
    setExpr((prev) => prev + char);
  };

  const handleBackspace = () => {
    setIsError(false);
    setExpr((prev) => prev.slice(0, -1));
  };

  const handleAllClear = () => {
    setExpr("");
    setTypedInput("");
    setMainResult("0");
    setIsError(false);
  };

  const handleEvaluate = () => {
    if (!expr) return;
    try {
      const naturalResult = solveNaturalLanguage(expr);
      let evaluationResult: number;
      let displayExpr: string;

      if (naturalResult !== null) {
        evaluationResult = Number(naturalResult.result);
        displayExpr = naturalResult.expression;
      } else {
        evaluationResult = evaluateSafe(expr);
        displayExpr = displayFormatter(expr);
      }

      const roundedResult = Number.isFinite(evaluationResult)
        ? +evaluationResult.toFixed(10)
        : evaluationResult;

      const newHistoryItem: HistoryItem = {
        e: displayExpr,
        r: roundedResult,
        t: new Date().toLocaleTimeString(),
      };

      setPrevExprString(displayExpr + " =");
      setHistory((prev) => [newHistoryItem, ...prev]);
      setMainResult(String(roundedResult));
      setIsEvaluating(true);
      setTimeout(() => setIsEvaluating(false), 320);

      // Save evaluated result for subsequent operational chaining
      setExpr(String(roundedResult));
      setIsError(false);
    } catch {
      setIsError(true);
      setMainResult("SYNTAX ERROR");
      setExpr("");
    }
  };

  // ── MEMORY FUNCTIONS ──
  const handleMemoryStore = () => {
    try {
      const val = evaluateSafe(expr) || 0;
      setMemory(Number(val));
    } catch {
      setMemory(0);
    }
  };

  const handleMemoryRecall = () => {
    if (memory !== null) {
      setIsError(false);
      setExpr((prev) => prev + String(memory));
    }
  };

  const handleMemoryClear = () => {
    setMemory(null);
  };

  const handleMemoryAdd = () => {
    try {
      const currentVal = evaluateSafe(expr) || 0;
      setMemory((prev) => (prev ?? 0) + Number(currentVal));
    } catch {}
  };

  const handleMemorySubtract = () => {
    try {
      const currentVal = evaluateSafe(expr) || 0;
      setMemory((prev) => (prev ?? 0) - Number(currentVal));
    } catch {}
  };

  // ── FORMULAS ACTION & MANAGEMENT ──
  const handleSaveFormula = (newFormula: Formula) => {
    const updated = [...formulas, newFormula];
    setFormulas(updated);
    localStorage.setItem("oc_fmls", JSON.stringify(updated));
  };

  const handleDeleteFormula = (idx: number) => {
    const updated = formulas.filter((_, i) => i !== idx);
    setFormulas(updated);
    localStorage.setItem("oc_fmls", JSON.stringify(updated));
  };

  // ── STATS ACCUMULATION ENGINE ──
  const [statsInput, setStatsInput] = useState<string>("");
  const [statsResult, setStatsResult] = useState<string>("");

  const handleCalculateStatistics = (operation: string) => {
    // Parse comma-separated inputs
    const numbers = statsInput
      .split(",")
      .map((n) => parseFloat(n.trim()))
      .filter((n) => !isNaN(n));

    if (numbers.length === 0) {
      setStatsResult("Please enter valid comma-separated values.");
      return;
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    let out = "";

    switch (operation) {
      case "mean": {
        const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        out = `Mean: ${+avg.toFixed(8)}`;
        break;
      }
      case "median": {
        const mid = Math.floor(sorted.length / 2);
        const med =
          sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
        out = `Median: ${med}`;
        break;
      }
      case "mode": {
        const freq: { [key: number]: number } = {};
        numbers.forEach((num) => {
          freq[num] = (freq[num] || 0) + 1;
        });
        const maxFreq = Math.max(...Object.values(freq));
        const modes = Object.keys(freq)
          .filter((key) => freq[Number(key)] === maxFreq)
          .map(Number);
        out = `Mode: ${modes.join(", ")}`;
        break;
      }
      case "range": {
        const r = sorted[sorted.length - 1] - sorted[0];
        out = `Range: ${r}`;
        break;
      }
      case "var": {
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const variance =
          numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          numbers.length;
        out = `Variance: ${+variance.toFixed(8)}`;
        break;
      }
      case "std": {
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const variance =
          numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          numbers.length;
        const sd = Math.sqrt(variance);
        out = `Std Dev: ${+sd.toFixed(8)}`;
        break;
      }
      case "sum": {
        const sumVal = numbers.reduce((a, b) => a + b, 0);
        out = `Sum: ${sumVal}`;
        break;
      }
      case "count": {
        out = `Count: ${numbers.length}`;
        break;
      }
      case "min": {
        out = `Min: ${sorted[0]}`;
        break;
      }
      case "max": {
        out = `Max: ${sorted[sorted.length - 1]}`;
        break;
      }
      case "geo": {
        const productVal = numbers.reduce((a, b) => a * b, 1);
        const gm = Math.pow(productVal, 1 / numbers.length);
        out = `Geo Mean: ${+gm.toFixed(8)}`;
        break;
      }
      case "harm": {
        const harmonicSum = numbers.reduce((sum, val) => sum + 1 / val, 0);
        const hm = numbers.length / harmonicSum;
        out = `Harmonic Mean: ${+hm.toFixed(8)}`;
        break;
      }
      default:
        break;
    }

    setStatsResult(out);

    // Trigger expression load if possible
    const numericPart = out.split(": ")[1];
    if (numericPart && !isNaN(parseFloat(numericPart))) {
      setIsError(false);
      setExpr(numericPart);
    }
  };

  // ── ACCOUNTING OPERATIONS ──
  const handleApplyGst = (rate: number) => {
    if (!expr) return;
    try {
      const val = evaluateSafe(expr);
      const computedGst = val * (rate / 100);
      setExpr(String(+computedGst.toFixed(4)));
      setIsError(false);
    } catch {
      setIsError(true);
      setMainResult("SYNTAX ERROR");
    }
  };

  const handleAccountingModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputs = accountingValue
      .split(",")
      .map((v) => parseFloat(v.trim()))
      .filter((n) => !isNaN(n));
    if (inputs.length === 0) return;
    const inputVal = inputs[0];

    try {
      const currentVal = evaluateSafe(expr || "0");
      let resultVal = "";

      switch (accountingAction) {
        case "discount":
          resultVal = String(+(currentVal * (1 - inputVal / 100)).toFixed(4));
          break;
        case "profit":
          // Profit Margin/Spread
          resultVal = String(
            +(((currentVal - inputVal) / inputVal) * 100).toFixed(4),
          );
          break;
        case "loss":
          // Loss Margin/Spread
          resultVal = String(
            +(((inputVal - currentVal) / inputVal) * 100).toFixed(4),
          );
          break;
        case "markup":
          // Markup Percent over Base Cost
          resultVal = String(
            +(((currentVal - inputVal) / inputVal) * 100).toFixed(4),
          );
          break;
        case "emi":
          if (inputs.length === 3) {
            const [p, r, t] = inputs;
            const monthlyRate = r / 12 / 100;
            const emi =
              (p * monthlyRate * Math.pow(1 + monthlyRate, t)) /
              (Math.pow(1 + monthlyRate, t) - 1);
            resultVal = String(+emi.toFixed(4));
          } else {
            throw new Error("Need P, R, T");
          }
          break;
        case "simple_interest":
          if (inputs.length === 3) {
            const [p, r, t] = inputs;
            resultVal = String(+((p * r * t) / 100).toFixed(4));
          } else {
            throw new Error("Need P, R, T");
          }
          break;
        case "compound_interest":
          if (inputs.length === 3) {
            const [p, r, t] = inputs;
            resultVal = String(+(p * Math.pow(1 + r / 100, t) - p).toFixed(4));
          } else {
            throw new Error("Need P, R, T");
          }
          break;
        case "gst":
          if (inputs.length === 2) {
            const [base, rate] = inputs;
            resultVal = String(+(base + base * (rate / 100)).toFixed(4));
          } else {
            throw new Error("Need Base, Rate");
          }
          break;
        default:
          break;
      }

      setExpr(resultVal);
      setIsError(false);
    } catch {
      setIsError(true);
      setMainResult("SYNTAX ERROR");
    } finally {
      setAccountingAction(null);
      setAccountingValue("");
    }
  };

  // Helper parser for custom input string bindings
  const handleManualInputString = (v: string) => {
    setIsError(false); // Reset error state immediately on continuous manual typing!
    let clean = v
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/asin\(/g, "Math.asin(")
      .replace(/acos\(/g, "Math.acos(")
      .replace(/atan\(/g, "Math.atan(")
      .replace(/sinh\(/g, "Math.sinh(")
      .replace(/cosh\(/g, "Math.cosh(")
      .replace(/tanh\(/g, "Math.tanh(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/log10\(/g, "Math.log10(")
      .replace(/log2\(/g, "Math.log2(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/sqrt\(/g, "Math.sqrt(")
      .replace(/cbrt\(/g, "Math.cbrt(")
      .replace(/exp\(/g, "Math.exp(")
      .replace(/abs\(/g, "Math.abs(")
      .replace(/round\(/g, "Math.round(")
      .replace(/floor\(/g, "Math.floor(")
      .replace(/ceil\(/g, "Math.ceil(")
      .replace(/trunc\(/g, "Math.trunc(")
      .replace(/π/g, "Math.PI")
      .replace(/\bpi\b/gi, "Math.PI")
      .replace(/\be\b/g, "Math.E")
      .replace(/\^/g, "**")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/√\(/g, "Math.sqrt(");
    setExpr(clean);
  };

  return (
    <div className="relative text-custom-text min-h-screen flex flex-col items-center">
      {/* HEADER SECTION */}
      <header className="w-full max-w-[960px] px-6 py-3.5 flex items-center justify-between relative z-10 select-none">
        <div>
          <div className="font-syne text-[18px] font-extrabold tracking-[4px] bg-gradient-to-r from-accent-custom via-accent2-custom to-green-custom bg-clip-text text-transparent animate-shimmer">
            ONLY CALCULATOR
          </div>
          <div className="text-[8px] text-dim-custom tracking-[3px] mt-0.5 uppercase font-bold">
            PRECISION &middot; POWER &middot; SIMPLICITY
          </div>
        </div>
        <button
          className="bg-gradient-to-br from-green-custom/10 to-green-custom/25 border border-green-custom/40 hover:border-green-custom text-green-custom font-syne text-[10px] font-bold tracking-[2px] py-2 px-4 rounded-lg transition-all cursor-pointer select-none duration-200 outline-none hover:-translate-y-0.5 shadow-[0_0_14px_rgba(46,204,138,0.12)] hover:shadow-[0_0_24px_rgba(46,204,138,0.25)]"
          onClick={() => setIsWorkoutOpen(true)}
          id="hdr-workout-open-btn"
        >
          ✦ ASK AI
        </button>
      </header>

      {/* CORE WRAPPED CALCULATOR MATRIX */}
      <div className="w-full max-w-[960px] px-6 pb-8 relative z-10 flex flex-col">
        {/* MODE NAVIGATION SELECTION SEGMENTS */}
        <div className="flex gap-1 mb-2.5 select-none" id="calc-mode-bar">
          {(["standard", "scientific", "account"] as CalcMode[]).map((m) => (
            <button
              key={m}
              className={`flex-1 py-1.5 bg-ink2 border font-mono text-[9px] tracking-[1.5px] rounded-lg transition-all cursor-pointer uppercase select-none ${
                mode === m && !showGPA
                  ? "bg-accent-custom/10 border-accent-custom/40 text-accent-custom shadow-[0_0_14px_rgba(79,142,255,0.12)] font-bold"
                  : "border-border-custom text-dim-custom hover:text-white hover:border-white/10"
              }`}
              onClick={() => {
                setShowGPA(false);
                setMode(m);
                if (m === "account") {
                  setActivePanel("main");
                }
              }}
            >
              {m === "account" ? "ACCOUNTING" : m}
            </button>
          ))}
          <button
            className={`flex-1 py-1.5 bg-ink2 border font-mono text-[9px] tracking-[1.5px] rounded-lg transition-all cursor-pointer uppercase select-none ${
              showGPA
                ? "bg-accent-custom/10 border-accent-custom/40 text-accent-custom shadow-[0_0_14px_rgba(79,142,255,0.12)] font-bold"
                : "border-border-custom text-dim-custom hover:text-white hover:border-white/10"
            }`}
            onClick={() => setShowGPA(true)}
          >
            GPA
          </button>
        </div>

        {/* DOUBLE COLUMN GRID LAYOUT (MAIN APP AREA VS SCIENTIFIC/ACCOUNTING SIDES) */}
        {showGPA ? (
          <div className="w-full h-[600px] rounded-2xl relative overflow-hidden shadow-lg border border-border-custom bg-black">
            <button
              onClick={() => setShowGPA(false)}
              className="absolute top-4 left-4 z-50 flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white border border-white/20 cursor-pointer shadow-lg"
              title="Close GPA Calculator"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <iframe
              srcDoc={gpaHtmlContent}
              className="w-full h-full border-0"
              title="GPA Calculator"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_210px] gap-2.5 items-start">
            {/* PRIMARY GRAPHICS COLUMN */}
            <div className="space-y-2.5">
              {/* LARGE DYNAMIC VISUAL SCREEN PANEL */}
              <div className="bg-ink2 border border-border-custom rounded-t-xl p-4 pb-3 relative overflow-hidden flex flex-col select-none border-b-0">
                {/* TOP RAINBOW ACCENT SHIMMER DECAL */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-accent-custom via-accent2-custom to-green-custom via-yellow-custom bg-clip-border animate-shimmer" />

                {/* HISTORIC PATH AND PREVIOUS STEPS LOG */}
                <div
                  className="text-[10px] text-dim-custom min-h-[16px] mb-0.5 text-right overflow-hidden text-ellipsis whitespace-nowrap"
                  id="display-steps-log"
                >
                  {prevExprString}
                </div>

                {/* LIVE DYNAMIC EXPR SYNCHRONIZATION */}
                <div
                  className="text-[12px] text-accent-custom/70 min-h-[18px] text-right overflow-hidden text-ellipsis whitespace-nowrap"
                  id="display-expr-sync"
                >
                  {displayFormatter(expr)}
                </div>

                {/* LARGE DOMINANT NUMBERS SCREEN */}
                <div
                  className={`text-[36px] font-light text-right text-white min-h-[46px] flex items-center justify-end break-all tracking-tight transition-all duration-200 select-all ${
                    isError ? "text-red-custom text-[18px] tracking-normal" : ""
                  } ${isEvaluating ? "animate-bounce-in" : ""}`}
                  id="display-main-screen"
                >
                  {isError
                    ? "SYNTAX ERROR"
                    : mode === "account"
                      ? `${currency}${mainResult}`
                      : mainResult}
                </div>

                {/* METADATA STATS DECALS & INDICATORS */}
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[8px] tracking-[2px] uppercase py-[2px] px-2 rounded bg-accent-custom/10 border border-accent-custom/25 text-accent-custom font-bold">
                    {mode.toUpperCase()}
                  </span>
                  <span
                    className={`text-[9px] font-mono tracking-wide transition-all ${
                      memory !== null
                        ? "text-yellow-custom drop-shadow-[0_0_10px_rgba(255,209,102,0.35)] font-bold"
                        : "text-dim-custom"
                    }`}
                    id="display-memory-slot"
                  >
                    {memory !== null ? `M: ${memory}` : "M: —"}
                  </span>
                </div>
              </div>

              {/* KEYBOARD WRAPPER & SWITCHABLE BUTTON TILES */}
              <div className="bg-ink2 border border-border-custom rounded-b-xl p-2.5 space-y-2.5">
                {/* TEXT FIELD INPUT EXPRESSION SLIDER */}
                <div className="flex gap-1.5 shadow-inner">
                  <input
                    id="typed-formula-input-field"
                    className="flex-grow bg-ink3 border border-border-custom rounded-lg text-white font-mono text-sm px-3.5 py-2.5 outline-none focus:border-accent-custom/50 focus:ring-1 focus:ring-accent-custom/15 transition-all placeholder-dim-custom"
                    placeholder="Type any expression... e.g. sin(45*pi/180) + sqrt(16)"
                    value={displayFormatter(expr)}
                    onChange={(e) => handleManualInputString(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleEvaluate();
                      }
                    }}
                  />
                  <button
                    className="bg-gradient-to-br from-accent-custom/11 to-accent-custom/30 border border-accent-custom/45 hover:border-accent-custom hover:bg-accent-custom/10 text-accent-custom font-syne font-bold py-2.5 px-4.5 rounded-lg active:scale-95 transition-all tracking-wider select-none outline-none"
                    onClick={handleEvaluate}
                  >
                    GO
                  </button>
                </div>

                {/* PANEL BAR NAVIGATION BUTTON GROUPS */}
                <div className="flex gap-1 select-none" id="keyboard-panel-bar">
                  {[
                    { id: "main", label: "MAIN" },
                    { id: "trig", label: "TRIG" },
                    { id: "log", label: "LOG/EXP" },
                    { id: "stats", label: "STATS" },
                    { id: "formulas", label: "FORMULAS" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      className={`flex-1 py-1.5 bg-ink3 border text-[9px] tracking-wider rounded-md transition-all cursor-pointer uppercase select-none ${
                        activePanel === p.id
                          ? "bg-yellow-custom/10 border-yellow-custom/35 text-yellow-custom font-bold"
                          : "border-border-custom text-dim-custom hover:text-white"
                      }`}
                      onClick={() => setActivePanel(p.id as ActivePanel)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* ────────────────── Active SUB BUTTON GRIDS ────────────────── */}

                {/* 1. MAIN standard controls grid block */}
                {activePanel === "main" && (
                  <div
                    className="grid grid-cols-5 gap-1.5 p-0.5 animate-bounce-in"
                    id="panel-kb-main"
                  >
                    {/* MEMORY STACK ROW ACTIONS */}
                    <button
                      className="calc-btn btn-mem py-3 bg-ink3 border border-border-custom text-[11px] font-mono hover:bg-ink4 transition-all rounded-md cursor-pointer text-yellow-custom hover:border-yellow-custom/40"
                      onClick={handleMemoryClear}
                    >
                      MC
                    </button>
                    <button
                      className="calc-btn btn-mem py-3 bg-ink3 border border-border-custom text-[11px] font-mono hover:bg-ink4 transition-all rounded-md cursor-pointer text-yellow-custom hover:border-yellow-custom/40"
                      onClick={handleMemoryRecall}
                    >
                      MR
                    </button>
                    <button
                      className="calc-btn btn-mem py-3 bg-ink3 border border-border-custom text-[11px] font-mono hover:bg-ink4 transition-all rounded-md cursor-pointer text-yellow-custom hover:border-yellow-custom/40"
                      onClick={handleMemoryStore}
                    >
                      MS
                    </button>
                    <button
                      className="calc-btn btn-mem py-3 bg-ink3 border border-border-custom text-[11px] font-mono hover:bg-ink4 transition-all rounded-md cursor-pointer text-yellow-custom hover:border-yellow-custom/40"
                      onClick={handleMemoryAdd}
                    >
                      M+
                    </button>
                    <button
                      className="calc-btn btn-mem py-3 bg-ink3 border border-border-custom text-[11px] font-mono hover:bg-ink4 transition-all rounded-md cursor-pointer text-yellow-custom hover:border-yellow-custom/40"
                      onClick={handleMemorySubtract}
                    >
                      M-
                    </button>

                    {/* CORE FUNCTIONS */}
                    <button
                      className="calc-btn btn-fn py-3 bg-ink3 border border-border-custom text-[11px] font-semibold text-green-custom hover:border-green-custom/40 transition-all rounded-md cursor-pointer"
                      onClick={() => handleInsertCharacter("Math.abs(")}
                    >
                      |x|
                    </button>
                    <button
                      className="calc-btn btn-fn py-3 bg-ink3 border border-border-custom text-[11px] font-semibold text-green-custom hover:border-green-custom/40 transition-all rounded-md cursor-pointer"
                      onClick={() => handleInsertCharacter("Math.round(")}
                    >
                      RND
                    </button>
                    <button
                      className="calc-btn btn-fn py-3 bg-ink3 border border-border-custom text-[11px] font-semibold text-green-custom hover:border-green-custom/40 transition-all rounded-md cursor-pointer"
                      onClick={() => handleInsertCharacter("Math.floor(")}
                    >
                      FLR
                    </button>
                    <button
                      className="calc-btn btn-fn py-3 bg-ink3 border border-border-custom text-[11px] font-semibold text-green-custom hover:border-green-custom/40 transition-all rounded-md cursor-pointer"
                      onClick={() => handleInsertCharacter("Math.ceil(")}
                    >
                      CEIL
                    </button>
                    <button
                      className="calc-btn btn-fn py-3 bg-ink3 border border-border-custom text-[11px] font-semibold text-green-custom hover:border-green-custom/40 transition-all rounded-md cursor-pointer"
                      onClick={() => handleInsertCharacter("%")}
                    >
                      MOD
                    </button>

                    <button
                      className="calc-btn bg-red-custom/5 border border-red-custom/15 text-red-custom/90 font-mono text-[11px] py-3 rounded-md hover:bg-red-custom/10 hover:border-red-custom cursor-pointer transition-all"
                      onClick={handleAllClear}
                    >
                      AC
                    </button>
                    <button
                      className="calc-btn bg-red-custom/5 border border-red-custom/15 text-red-custom/90 font-mono text-[11px] py-3 rounded-md hover:bg-red-custom/10 hover:border-red-custom cursor-pointer transition-all"
                      onClick={handleBackspace}
                    >
                      CE
                    </button>
                    <button
                      className="calc-btn cursor-pointer py-3 bg-ink3 border border-border-custom text-white hover:bg-ink4 rounded-md transition-all font-bold text-center"
                      onClick={handleBackspace}
                    >
                      ⌫
                    </button>
                    <button
                      className="calc-btn flex items-center justify-center cursor-pointer py-3 bg-accent-custom/5 border border-accent-custom/15 text-accent-custom hover:border-accent-custom hover:bg-ink4 rounded-md transition-all font-mono"
                      onClick={() => handleInsertCharacter("/")}
                    >
                      ÷
                    </button>
                    <button
                      className="calc-btn flex items-center justify-center cursor-pointer py-3 bg-accent-custom/5 border border-accent-custom/15 text-accent-custom hover:border-accent-custom hover:bg-ink4 rounded-md transition-all font-mono"
                      onClick={() => handleInsertCharacter("**")}
                    >
                      xʸ
                    </button>

                    {/* DIGIT TILE ROWS & BASIC OPERATORS */}
                    <button
                      className="calc-btn text-base py-3 bg-ink3 border border-border-custom font-medium hover:bg-ink4 transition-all rounded-md cursor-pointer text-white"
                      onClick={() => handleInsertCharacter("7")}
                    >
                      7
                    </button>
                    <button
                      className="calc-btn text-base py-3 bg-ink3 border border-border-custom font-medium hover:bg-ink4 transition-all rounded-md cursor-pointer text-white"
                      onClick={() => handleInsertCharacter("8")}
                    >
                      8
                    </button>
                    <button
                      className="calc-btn text-base py-3 bg-ink3 border border-border-custom font-medium hover:bg-ink4 transition-all rounded-md cursor-pointer text-white"
                      onClick={() => handleInsertCharacter("9")}
                    >
                      9
                    </button>
                    <button
                      className="calc-btn py-3 bg-accent-custom/5 border border-accent-custom/15 text-accent-custom hover:border-accent-custom hover:bg-ink4 rounded-md transition-all font-bold text-base flex items-center justify-center"
                      onClick={() => handleInsertCharacter("*")}
                    >
                      &times;
                    </button>
                    <button
                      className="calc-btn text-sm py-3 bg-ink3 border border-border-custom text-green-custom hover:bg-ink4 hover:border-green-custom/30 transition-all rounded-md cursor-pointer font-semibold"
                      onClick={() => handleInsertCharacter("Math.sqrt(")}
                    >
                      √
                    </button>

                    <button
                      className="calc-btn text-base py-3 bg-ink3 border border-border-custom font-medium hover:bg-ink4 transition-all rounded-md cursor-pointer text-white"
                      onClick={() => handleInsertCharacter("4")}
                    >
                      4
                    </button>
                    <button
                      className="calc-btn text-base py-3 bg-ink3 border border-border-custom font-medium hover:bg-ink4 transition-all rounded-md cursor-pointer text-white"
                      onClick={() => handleInsertCharacter("5")}
                    >
                      5
                    </button>
                    <button
                      className="calc-btn text-base py-3 bg-ink3 border border-border-custom font-medium hover:bg-ink4 transition-all rounded-md cursor-pointer text-white"
                      onClick={() => handleInsertCharacter("6")}
                    >
                      6
                    </button>
                    <button
                      className="calc-btn py-3 bg-accent-custom/5 border border-accent-custom/15 text-accent-custom hover:border-accent-custom hover:bg-ink4 rounded-md transition-all font-bold text-base flex items-center justify-center"
                      onClick={() => handleInsertCharacter("-")}
                    >
                      &minus;
                    </button>
                    <button
                      className="calc-btn text-sm py-3 bg-ink3 border border-border-custom text-green-custom hover:bg-ink4 hover:border-green-custom/30 transition-all rounded-md cursor-pointer font-semibold"
                      onClick={() => handleInsertCharacter("Math.cbrt(")}
                    >
                      ∛
                    </button>

                    <button
                      className="calc-btn text-base py-3 bg-ink3 border border-border-custom font-medium hover:bg-ink4 transition-all rounded-md cursor-pointer text-white"
                      onClick={() => handleInsertCharacter("1")}
                    >
                      1
                    </button>
                    <button
                      className="calc-btn text-base py-3 bg-ink3 border border-border-custom font-medium hover:bg-ink4 transition-all rounded-md cursor-pointer text-white"
                      onClick={() => handleInsertCharacter("2")}
                    >
                      2
                    </button>
                    <button
                      className="calc-btn text-base py-3 bg-ink3 border border-border-custom font-medium hover:bg-ink4 transition-all rounded-md cursor-pointer text-white"
                      onClick={() => handleInsertCharacter("3")}
                    >
                      3
                    </button>
                    <button
                      className="calc-btn py-3 bg-accent-custom/5 border border-accent-custom/15 text-accent-custom hover:border-accent-custom hover:bg-ink4 rounded-md transition-all font-bold text-base flex items-center justify-center"
                      onClick={() => handleInsertCharacter("+")}
                    >
                      +
                    </button>
                    <button
                      className="calc-btn text-[11px] py-3 bg-ink3 border border-border-custom text-green-custom hover:bg-ink4 hover:border-green-custom/30 transition-all rounded-md cursor-pointer font-semibold"
                      onClick={() => handleInsertCharacter("1/(")}
                    >
                      1/x
                    </button>

                    <button
                      className="calc-btn text-sm py-3 bg-ink3 border border-border-custom hover:bg-ink4 rounded-md cursor-pointer text-green-custom transition-all"
                      onClick={() => handleInsertCharacter("(")}
                    >
                      (
                    </button>
                    <button
                      className="calc-btn text-base py-3 bg-ink3 border border-border-custom font-semibold hover:bg-ink4 transition-all rounded-md cursor-pointer text-white"
                      onClick={() => handleInsertCharacter("0")}
                    >
                      0
                    </button>
                    <button
                      className="calc-btn text-base py-3 bg-ink3 border border-border-custom hover:bg-ink4 rounded-md cursor-pointer text-green-custom transition-all"
                      onClick={() => handleInsertCharacter(".")}
                    >
                      .
                    </button>
                    <button
                      className="calc-btn text-sm py-3 bg-ink3 border border-border-custom hover:bg-ink4 rounded-md cursor-pointer text-green-custom transition-all"
                      onClick={() => handleInsertCharacter(")")}
                    >
                      )
                    </button>

                    {/* MASTER EVALUATION ELEMENT */}
                    <button
                      className="calc-btn font-syne text-xl text-red-custom py-3 rounded-lg border border-red-custom/35 bg-red-custom/10 hover:bg-red-custom/20 hover:border-red-custom shadow-[0_0_12px_rgba(255,71,87,0.12)] hover:shadow-[0_0_20px_rgba(255,71,87,0.35)] cursor-pointer transition-all font-extrabold select-none outline-none"
                      onClick={handleEvaluate}
                    >
                      =
                    </button>
                  </div>
                )}

                {/* 2. TRIGONOMETRICAL PANEL TRIG */}
                {activePanel === "trig" && (
                  <div
                    className="grid grid-cols-6 gap-1.5 p-0.5 animate-bounce-in font-mono"
                    id="panel-kb-trig"
                  >
                    {[
                      { label: "sin", in: "Math.sin(" },
                      { label: "cos", in: "Math.cos(" },
                      { label: "tan", in: "Math.tan(" },
                      { label: "asin", in: "Math.asin(" },
                      { label: "acos", in: "Math.acos(" },
                      { label: "atan", in: "Math.atan(" },

                      { label: "sinh", in: "Math.sinh(" },
                      { label: "cosh", in: "Math.cosh(" },
                      { label: "tanh", in: "Math.tanh(" },
                      { label: "asinh", in: "Math.asinh(" },
                      { label: "acosh", in: "Math.acosh(" },
                      { label: "atanh", in: "Math.atanh(" },

                      { label: "°→rad", in: "(Math.PI/180)*" },
                      { label: "rad→°", in: "(180/Math.PI)*" },
                      { label: "π", in: "Math.PI" },
                      { label: "2π", in: "Math.PI*2" },
                      { label: "π/2", in: "Math.PI/2" },
                      { label: "e", in: "Math.E" },
                    ].map((btn, bidx) => (
                      <button
                        key={bidx}
                        className="calc-btn text-[10px] text-green-custom border border-border-custom bg-ink3 hover:border-green-custom/35 rounded-md cursor-pointer py-2.5 transition-all outline-none"
                        onClick={() => handleInsertCharacter(btn.in)}
                      >
                        {btn.label}
                      </button>
                    ))}

                    {/* MINI CLUSTER PAD FOR TRIG */}
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("7")}
                    >
                      7
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("8")}
                    >
                      8
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("9")}
                    >
                      9
                    </button>
                    <button
                      className="calc-btn text-sm text-accent-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4"
                      onClick={() => handleInsertCharacter("/")}
                    >
                      ÷
                    </button>
                    <button
                      className="calc-btn text-sm text-accent-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4"
                      onClick={() => handleInsertCharacter("*")}
                    >
                      &times;
                    </button>
                    <button
                      className="calc-btn text-sm text-accent-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4"
                      onClick={() => handleInsertCharacter("**")}
                    >
                      xʸ
                    </button>

                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("4")}
                    >
                      4
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("5")}
                    >
                      5
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("6")}
                    >
                      6
                    </button>
                    <button
                      className="calc-btn text-xs text-accent-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4"
                      onClick={() => handleInsertCharacter("-")}
                    >
                      &minus;
                    </button>
                    <button
                      className="calc-btn text-xs text-accent-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4"
                      onClick={() => handleInsertCharacter("+")}
                    >
                      +
                    </button>
                    <button
                      className="calc-btn text-xs text-green-custom border border-border-custom/50 py-2.5 rounded-md"
                      onClick={() => handleInsertCharacter("(")}
                    >
                      (
                    </button>

                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("1")}
                    >
                      1
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("2")}
                    >
                      2
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("3")}
                    >
                      3
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("0")}
                    >
                      0
                    </button>
                    <button
                      className="calc-btn text-sm text-green-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4"
                      onClick={() => handleInsertCharacter(".")}
                    >
                      .
                    </button>
                    <button
                      className="calc-btn bg-red-custom/10 text-red-custom text-sm font-bold border border-red-custom/35 rounded-lg active:scale-95"
                      onClick={handleEvaluate}
                    >
                      =
                    </button>

                    <button
                      className="col-span-2 calc-btn text-red-custom text-xs bg-ink3 border border-border-custom p-2 rounded-md hover:border-red-custom"
                      onClick={handleAllClear}
                    >
                      AC
                    </button>
                    <button
                      className="col-span-2 calc-btn text-red-custom text-xs bg-ink3 border border-border-custom p-2 rounded-md hover:border-red-custom"
                      onClick={handleBackspace}
                    >
                      ⌫
                    </button>
                    <button
                      className="col-span-2 calc-btn text-green-custom text-xs p-2"
                      onClick={() => handleInsertCharacter(")")}
                    >
                      )
                    </button>
                  </div>
                )}

                {/* 3. LOG/EXPONENTIAL PANEL LOG */}
                {activePanel === "log" && (
                  <div
                    className="grid grid-cols-6 gap-1.5 p-0.5 animate-bounce-in"
                    id="panel-kb-log"
                  >
                    {[
                      { label: "ln", in: "Math.log(" },
                      { label: "log₁₀", in: "Math.log10(" },
                      { label: "log₂", in: "Math.log2(" },
                      { label: "eˣ", in: "Math.exp(" },
                      { label: "10ˣ", in: "10**(" },
                      { label: "2ˣ", in: "2**(" },

                      { label: "e", in: "Math.E" },
                      { label: "π", in: "Math.PI" },
                      { label: "√", in: "Math.sqrt(" },
                      { label: "∛", in: "Math.cbrt(" },
                      { label: "x²", in: "**2" },
                      { label: "x³", in: "**3" },

                      { label: "sgn", in: "Math.sign(" },
                      { label: "hypot", in: "Math.hypot(" },
                      { label: "trunc", in: "Math.trunc(" },
                      { label: "fround", in: "Math.fround(" },
                      { label: "x½", in: "**0.5" },
                      { label: "||x||", in: "Math.abs(" },
                    ].map((btn, bidx) => (
                      <button
                        key={bidx}
                        className="calc-btn text-[10px] text-green-custom border border-border-custom bg-ink3 hover:border-green-custom/35 rounded-md cursor-pointer py-2.5 transition-all outline-none"
                        onClick={() => handleInsertCharacter(btn.in)}
                      >
                        {btn.label}
                      </button>
                    ))}

                    {/* DIGIT INJECT PANEL FOR LOG */}
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("7")}
                    >
                      7
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("8")}
                    >
                      8
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("9")}
                    >
                      9
                    </button>
                    <button
                      className="calc-btn text-sm text-accent-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4"
                      onClick={() => handleInsertCharacter("/")}
                    >
                      ÷
                    </button>
                    <button
                      className="calc-btn text-sm text-accent-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4"
                      onClick={() => handleInsertCharacter("*")}
                    >
                      &times;
                    </button>
                    <button
                      className="calc-btn text-sm text-red-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:border-red-custom"
                      onClick={handleBackspace}
                    >
                      ⌫
                    </button>

                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("4")}
                    >
                      4
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("5")}
                    >
                      5
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("6")}
                    >
                      6
                    </button>
                    <button
                      className="calc-btn text-xs text-accent-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4"
                      onClick={() => handleInsertCharacter("-")}
                    >
                      &minus;
                    </button>
                    <button
                      className="calc-btn text-xs text-accent-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4"
                      onClick={() => handleInsertCharacter("+")}
                    >
                      +
                    </button>
                    <button
                      className="calc-btn text-xs text-red-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-red-custom/10"
                      onClick={handleAllClear}
                    >
                      AC
                    </button>

                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("1")}
                    >
                      1
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("2")}
                    >
                      2
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("3")}
                    >
                      3
                    </button>
                    <button
                      className="calc-btn text-sm text-white py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4 transition-all"
                      onClick={() => handleInsertCharacter("0")}
                    >
                      0
                    </button>
                    <button
                      className="calc-btn text-sm text-green-custom py-2.5 bg-ink3 border border-border-custom rounded-md hover:bg-ink4"
                      onClick={() => handleInsertCharacter(".")}
                    >
                      .
                    </button>
                    <button
                      className="calc-btn bg-red-custom/10 text-red-custom text-sm font-bold border border-red-custom/35 rounded-lg active:scale-95"
                      onClick={handleEvaluate}
                    >
                      =
                    </button>
                  </div>
                )}

                {/* 4. STATISTICS PANEL STATS */}
                {activePanel === "stats" && (
                  <div
                    className="space-y-4 animate-bounce-in"
                    id="panel-kb-stats"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[9px] tracking-widest text-dim-custom uppercase block font-semibold">
                        Numbers Input (comma-separated lists)
                      </label>
                      <input
                        id="stats-collection-field"
                        className="w-full bg-ink3 border border-border-custom text-white font-mono text-[13px] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-green-custom/50 focus:ring-1 focus:ring-green-custom/15 transition-all outline-none"
                        placeholder="e.g. 4, 8, 15, 16, 23, 42"
                        value={statsInput}
                        onChange={(e) => setStatsInput(e.target.value)}
                      />
                    </div>

                    {/* STATISTICAL OPERATIONS BUTTON GRID */}
                    <div className="grid grid-cols-4 gap-1.5 font-mono">
                      {[
                        { op: "mean", txt: "MEAN" },
                        { op: "median", txt: "MEDIAN" },
                        { op: "mode", txt: "MODE" },
                        { op: "range", txt: "RANGE" },
                        { op: "var", txt: "VARIANCE" },
                        { op: "std", txt: "STD DEV" },
                        { op: "sum", txt: "SUM" },
                        { op: "count", txt: "COUNT" },
                        { op: "min", txt: "MIN" },
                        { op: "max", txt: "MAX" },
                        { op: "geo", txt: "GEO MEAN" },
                        { op: "harm", txt: "HARM MEAN" },
                      ].map((btn) => (
                        <button
                          key={btn.op}
                          className="calc-btn text-[10.5px] font-bold text-green-custom border border-border-custom bg-ink3 hover:border-green-custom hover:bg-green-custom/5 rounded-md cursor-pointer py-2 px-1 transition-all outline-none text-center"
                          onClick={() => handleCalculateStatistics(btn.op)}
                        >
                          {btn.txt}
                        </button>
                      ))}
                    </div>

                    {/* OUTPUT PANEL FIELD */}
                    <div
                      className="p-3 bg-ink3 border border-border-custom rounded-lg font-mono text-[14px] text-green-custom text-center min-h-[44px] flex items-center justify-center relative shadow-inner overflow-hidden select-all"
                      id="stats-output-visualizer"
                    >
                      {statsResult ||
                        "Enter values above, then run an operation"}
                    </div>
                  </div>
                )}

                {/* 5. FORMULAS DISPLAY LIST PANEL */}
                {activePanel === "formulas" && (
                  <div
                    className="space-y-4 animate-bounce-in"
                    id="panel-kb-formulas"
                  >
                    <div className="bg-ink3 border border-border-custom rounded-lg p-3 max-h-[220px] overflow-y-auto">
                      <div className="flex justify-between items-center mb-3 select-none">
                        <span className="text-[9px] tracking-widest text-dim-custom uppercase font-semibold">
                          📐 Custom Formula Bank
                        </span>
                        <button
                          className="bg-transparent border border-green-custom/35 hover:bg-green-custom/10 text-green-custom font-mono text-[10px] px-3 py-1.5 rounded cursor-pointer transition-all uppercase outline-none"
                          onClick={() => setIsFormulaModalOpen(true)}
                          id="formula-bank-add-btn"
                        >
                          + ADD
                        </button>
                      </div>

                      {/* DYNAMIC FORMULA CHIPS ROW CONTAINER */}
                      <div className="flex flex-wrap gap-1.5">
                        {formulas.map((item, fIdx) => (
                          <div
                            key={fIdx}
                            className="group bg-ink4/80 border border-border-custom text-yellow-custom font-mono text-[11px] px-3.5 py-2 rounded-lg cursor-pointer hover:border-yellow-custom hover:shadow-[0_0_10px_rgba(255,209,102,0.15)] flex items-center gap-2.5 select-none transition-all"
                            onClick={() => handleInsertCharacter(`(${item.e})`)}
                          >
                            <span>{item.n}</span>
                            <button
                              className="text-red-custom hover:scale-130 transition-all font-bold opacity-45 group-hover:opacity-100 p-0.5 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFormula(fIdx);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {formulas.length === 0 && (
                          <div className="text-center text-dim-custom text-[10px] tracking-wider py-4 w-full">
                            No formulas yet. Add your own!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BUILT-IN CORE FORMULAS CLUSTER MATRIX */}
                    <div className="space-y-2">
                      <div className="text-[9px] text-dim-custom tracking-widest uppercase font-semibold select-none">
                        BUILT-IN PRESETS
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 font-mono select-none">
                        {[
                          {
                            label: "½bh",
                            formula: "(1/2)*b*h",
                            desc: "Triangle Area",
                          },
                          {
                            label: "πr²",
                            formula: "Math.PI*r**2",
                            desc: "Circle Area",
                          },
                          {
                            label: "2πr",
                            formula: "2*Math.PI*r",
                            desc: "Circumference",
                          },
                          {
                            label: "C.I.",
                            formula: "p*(1+r/100)**t",
                            desc: "Compound Interest",
                          },
                          {
                            label: "S.I.",
                            formula: "(p*r*t)/100",
                            desc: "Simple Interest",
                          },
                          {
                            label: "Pyth.",
                            formula: "Math.sqrt(a**2+b**2)",
                            desc: "Hypotenuse",
                          },
                          {
                            label: "Sphere Vol",
                            formula: "(4/3)*Math.PI*r**3",
                            desc: "Volume Sphere",
                          },
                          {
                            label: "Cylinder Vol",
                            formula: "Math.PI*r**2*h",
                            desc: "Cylinder Volume",
                          },
                          {
                            label: "n(n+1)/2",
                            formula: "n*(n+1)/2",
                            desc: "Sum of natural numbers",
                          },
                          {
                            label: "l×b×h",
                            formula: "l*b*h",
                            desc: "Cuboid Volume",
                          },
                          {
                            label: "Cone Vol",
                            formula: "(1/3)*Math.PI*r**2*h",
                            desc: "Cone Volume",
                          },
                          {
                            label: "Cube SA",
                            formula: "6*a**2",
                            desc: "Cube Surface Area",
                          },
                        ].map((item, bidx) => (
                          <button
                            key={bidx}
                            title={item.desc}
                            className="calc-btn text-[11px] text-green-custom border border-border-custom bg-ink3 hover:border-green-custom/35 hover:bg-green-custom/5 py-2.5 rounded-lg cursor-pointer transition-all outline-none"
                            onClick={() =>
                              handleInsertCharacter(`(${item.formula})`)
                            }
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACCOUNTING EXTRAS OPTIONS (VISIBLE UNTIL CALCMODE SWITCH AWAY) */}
              {mode === "account" && (
                <div className="bg-ink2 border border-border-custom rounded-xl p-3.5 space-y-3 animate-bounce-in select-none">
                  <div className="flex justify-between items-center px-1">
                    <div className="text-[9px] text-dim-custom tracking-widest uppercase font-semibold font-mono">
                      ACCOUNTING EXTRACT OPERATIONS
                    </div>
                    <select
                      className="bg-ink3 border border-border-custom text-white text-[10px] py-1 px-2 rounded outline-none font-mono cursor-pointer"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="₹">₹ (INR)</option>
                      <option value="$">$ (USD)</option>
                      <option value="€">€ (EUR)</option>
                      <option value="£">£ (GBP)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <button
                      className="calc-btn text-[10px] text-green-custom hover:border-green-custom border border-border-custom py-2.5 rounded-md hover:bg-green-custom/5"
                      onClick={() => {
                        setAccountingAction("emi");
                        setAccountingValue("");
                      }}
                    >
                      EMI CALCULATOR
                    </button>
                    <button
                      className="calc-btn text-[10px] text-green-custom hover:border-green-custom border border-border-custom py-2.5 rounded-md hover:bg-green-custom/5"
                      onClick={() => {
                        setAccountingAction("simple_interest");
                        setAccountingValue("");
                      }}
                    >
                      SIMPLE INTEREST
                    </button>
                    <button
                      className="calc-btn text-[10px] text-green-custom hover:border-green-custom border border-border-custom py-2.5 rounded-md hover:bg-green-custom/5"
                      onClick={() => {
                        setAccountingAction("compound_interest");
                        setAccountingValue("");
                      }}
                    >
                      COMPOUND INTEREST
                    </button>
                    <button
                      className="calc-btn text-[10px] text-green-custom hover:border-green-custom border border-border-custom py-2.5 rounded-md hover:bg-green-custom/5"
                      onClick={() => {
                        setAccountingAction("discount");
                        setAccountingValue("");
                      }}
                    >
                      DISCOUNT
                    </button>
                    <button
                      className="calc-btn text-[10px] text-green-custom hover:border-green-custom border border-border-custom py-2.5 rounded-md hover:bg-green-custom/5"
                      onClick={() => {
                        setAccountingAction("profit");
                        setAccountingValue("");
                      }}
                    >
                      PROFIT MARGIN
                    </button>
                    <button
                      className="calc-btn text-[10px] text-green-custom hover:border-green-custom border border-border-custom py-2.5 rounded-md hover:bg-green-custom/5"
                      onClick={() => {
                        setAccountingAction("loss");
                        setAccountingValue("");
                      }}
                    >
                      LOSS MARGIN
                    </button>
                    <button
                      className="calc-btn text-[10px] text-green-custom hover:border-green-custom border border-border-custom py-2.5 rounded-md hover:bg-green-custom/5"
                      onClick={() => {
                        setAccountingAction("markup");
                        setAccountingValue("");
                      }}
                    >
                      MARKUP
                    </button>
                    <button
                      className="calc-btn text-[10px] text-green-custom hover:border-green-custom border border-border-custom py-2.5 rounded-md hover:bg-green-custom/5"
                      onClick={() => {
                        setAccountingAction("gst");
                        setAccountingValue("");
                      }}
                    >
                      GST (CUSTOM %)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECONDARY SIDE COLUMN: REAL-TIME CALCULATION HISTORY ARCHIVE */}
            <div
              className="bg-ink2 border border-border-custom rounded-xl overflow-hidden select-none sticky top-5"
              id="history-sidebar"
            >
              <div className="px-4.5 py-3 bg-ink3 border-b border-border-custom text-[9px] tracking-widest text-dim-custom font-semibold flex justify-between items-center uppercase">
                <span>CALC HISTORY</span>
                <button
                  className="text-red-custom hover:text-red-400 opacity-70 hover:opacity-100 font-mono text-[9px] cursor-pointer transition-all select-none bg-transparent border-0 outline-none uppercase font-bold"
                  onClick={() => setHistory([])}
                >
                  CLEAR
                </button>
              </div>

              <div className="max-h-[520px] overflow-y-auto p-2 space-y-1 scrollbar-thin">
                {history.map((h, hIdx) => (
                  <div
                    key={hIdx}
                    className="p-2 py-2.5 rounded-lg border border-transparent hover:bg-ink3 hover:border-border-custom transition-all cursor-pointer text-right group select-none"
                    onClick={() => {
                      setIsError(false);
                      setExpr(String(h.r));
                    }}
                  >
                    <div className="text-[10px] text-dim-custom mb-1 font-mono tracking-tighter truncate">
                      {h.e}
                    </div>
                    <div className="flex justify-between items-end gap-2">
                      <span className="text-[8px] text-dim-custom/50 font-mono select-none">
                        {h.t}
                      </span>
                      <span className="text-[15px] text-white font-semibold font-mono tracking-tight break-all">
                        {h.r}
                      </span>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="py-7 text-center text-dim-custom text-[10px] font-mono tracking-wider italic select-none">
                    No calculations yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECURE OVERLAY MODAL FOR DISCOUNT/PROFIT/LOSS INPUT ACTIONS */}
      {accountingAction && (
        <div className="fixed inset-0 bg-black/75 z-[2500] flex items-center justify-center backdrop-blur-md">
          <div className="bg-ink2 border border-white/10 border-t-2 border-t-accent-custom rounded-xl p-6.5 w-[380px] max-w-[90vw] shadow-2xl animate-bounce-in">
            <div className="font-syne text-[14px] text-accent-custom tracking-wider mb-4 font-bold uppercase">
              {accountingAction.toUpperCase()} CALCULATION
            </div>
            <form onSubmit={handleAccountingModalSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <span className="block text-[9px] tracking-widest text-dim-custom uppercase font-semibold">
                  {accountingAction === "discount"
                    ? "ENTER DISCOUNT PERCENTAGE"
                    : accountingAction === "emi"
                      ? "ENTER LOAN AMOUNT, RATE %, MONTHS (comma-separated)"
                      : accountingAction === "simple_interest" ||
                          accountingAction === "compound_interest"
                        ? "ENTER PRINCIPAL, RATE %, YEARS (comma-separated)"
                        : accountingAction === "gst"
                          ? "ENTER BASE AMOUNT, GST % (comma-separated)"
                          : "ENTER COST PRICE"}
                </span>
                <input
                  id="acc-modal-numeric-input"
                  type="text"
                  autoFocus
                  required
                  className="w-full bg-ink3 border border-border-custom text-white font-mono text-[14px] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-accent-custom/50 focus:ring-1 focus:ring-accent-custom/15 transition-all"
                  placeholder={
                    accountingAction === "discount"
                      ? "e.g. 15 for 15%"
                      : accountingAction === "emi"
                        ? "e.g. 100000, 8.5, 36"
                        : accountingAction === "simple_interest" ||
                            accountingAction === "compound_interest"
                          ? "e.g. 50000, 5, 2"
                          : accountingAction === "gst"
                            ? "e.g. 1000, 18"
                            : "e.g. 120.50"
                  }
                  value={accountingValue}
                  onChange={(e) => setAccountingValue(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-1.5">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-accent-custom/10 to-accent-custom/25 border border-accent-custom hover:bg-accent-custom/20 text-accent-custom font-syne text-[11px] font-bold tracking-widest py-2.5 rounded-lg cursor-pointer transition-all"
                  id="acc-modal-apply-btn"
                >
                  APPLY OUTCOME
                </button>
                <button
                  type="button"
                  className="bg-ink3 border border-border-custom text-dim-custom hover:text-white font-mono text-[11px] px-4 rounded-lg cursor-pointer transition-all"
                  onClick={() => {
                    setAccountingAction(null);
                    setAccountingValue("");
                  }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORMULA MODAL OVERLAY */}
      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        onSave={handleSaveFormula}
      />

      {/* WORKOUT SPACE DRAWING BOARD AND CO-PILOT CHAT INTERFACE OVERLAY */}
      <WorkoutSpace
        isOpen={isWorkoutOpen}
        onClose={() => setIsWorkoutOpen(false)}
        customFormulas={formulas}
        currExpr={expr}
        onInsertIntoCalculator={(val) => {
          setIsError(false);
          setExpr(val);
        }}
      />
    </div>
  );
}
