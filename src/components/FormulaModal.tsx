import React, { useState } from "react";
import { Formula } from "../types";

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formula: Formula) => void;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [expr, setExpr] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !expr.trim()) {
      alert("Please fill out both Name and Expression fields.");
      return;
    }
    onSave({ n: name.trim(), e: expr.trim() });
    setName("");
    setExpr("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-[2000] flex items-center justify-center backdrop-blur-md">
      <div 
        className="bg-ink2 border border-white/10 border-t-2 border-t-yellow-custom rounded-xl p-7 w-[420px] max-w-[92vw] shadow-2xl animate-bounce-in"
        id="fmodal-content"
      >
        <div className="font-syne text-[16px] text-yellow-custom tracking-[2px] mb-4.5 font-bold">
          + ADD FORMULA
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <span className="block text-[9px] tracking-[2px] text-dim-custom uppercase font-semibold">
              Formula Name / Label
            </span>
            <input
              id="fm-name-input"
              className="w-full bg-ink3 border border-white/10 text-white font-mono text-[13px] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-yellow-custom/50 focus:ring-1 focus:ring-yellow-custom/20 transition-all"
              placeholder="e.g. Area of Triangle"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <span className="block text-[9px] tracking-[2px] text-dim-custom uppercase font-semibold">
              Expression (JavaScript math syntax)
            </span>
            <input
              id="fm-expr-input"
              className="w-full bg-ink3 border border-white/10 text-white font-mono text-[13px] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-yellow-custom/50 focus:ring-1 focus:ring-yellow-custom/20 transition-all"
              placeholder="e.g. (1/2)*b*h or Math.PI*r**2"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              id="fm-save-btn"
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-custom/10 to-yellow-custom/25 border border-yellow-custom/50 hover:bg-yellow-custom/20 text-yellow-custom font-syne text-[11px] font-bold tracking-[2px] py-3 rounded-lg transition-all"
            >
              SAVE FORMULA
            </button>
            <button
              id="fm-cancel-btn"
              type="button"
              className="bg-ink3 border border-white/10 text-dim-custom hover:text-white font-mono text-[11px] px-4 rounded-lg transition-all"
              onClick={() => {
                setName("");
                setExpr("");
                onClose();
              }}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
