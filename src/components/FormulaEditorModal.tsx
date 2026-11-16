// src/components/FormulaEditorModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MathRenderer } from './MathRenderer';
import { X, Check, Calculator, Sparkles, RefreshCw, Trash2, Copy, BookOpen } from 'lucide-react';

interface FormulaEditorModalProps {
  isOpen: boolean;
  initialLatex?: string;
  onSave: (latex: string) => void;
  onClose: () => void;
}

export const FormulaEditorModal: React.FC<FormulaEditorModalProps> = ({
  isOpen,
  initialLatex = '',
  onSave,
  onClose,
}) => {
  // Clean initial formula (remove enclosing $ if present for editor input)
  const cleanInitial = (str: string) => {
    let s = str.trim();
    if (s.startsWith('$') && s.endsWith('$') && s.length > 2) {
      s = s.slice(1, -1);
    }
    return s;
  };

  const [latexInput, setLatexInput] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'fractions' | 'powers' | 'trig' | 'calculus' | 'matrices' | 'symbols'>('fractions');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLatexInput(cleanInitial(initialLatex) || '\\frac{a+b}{c}');
    }
  }, [isOpen, initialLatex]);

  if (!isOpen) return null;

  // Insert template at current cursor position
  const insertTemplate = (template: string) => {
    if (!inputRef.current) {
      setLatexInput(prev => prev + template);
      return;
    }
    const textarea = inputRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const nextVal = current.substring(0, start) + template + current.substring(end);
    setLatexInput(nextVal);

    // Restore focus and cursor position after insert
    setTimeout(() => {
      textarea.focus();
      const newPos = start + template.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 50);
  };

  const categories = [
    { id: 'fractions', label: 'Kəsrlər & Köklər' },
    { id: 'powers', label: 'Qüvvət & İndeks' },
    { id: 'trig', label: 'Triqonometriya' },
    { id: 'calculus', label: 'İnteqral, Cəm, Limit' },
    { id: 'matrices', label: 'Loqarifm & Matris' },
    { id: 'symbols', label: 'Yunan & Həndəsə' },
  ] as const;

  const templates: Record<string, { label: string; code: string; preview: string }[]> = {
    fractions: [
      { label: 'Kəsr (a/b)', code: '\\frac{a}{b}', preview: '\\frac{a}{b}' },
      { label: 'Mürəkkəb kəsr', code: '\\frac{a+b}{c}', preview: '\\frac{a+b}{c}' },
      { label: 'Kvadrat kök', code: '\\sqrt{x}', preview: '\\sqrt{x}' },
      { label: 'Kök altı ifadə', code: '\\sqrt{x^2+1}', preview: '\\sqrt{x^2+1}' },
      { label: 'n-ci dərəcə kök', code: '\\sqrt[n]{x}', preview: '\\sqrt[n]{x}' },
      { label: 'Kök və kəsr', code: '\\frac{\\sqrt{x^2+1}}{2a}', preview: '\\frac{\\sqrt{x^2+1}}{2a}' },
      { label: 'Mötərizəli kəsr', code: '\\left(\\frac{a}{b}\\right)', preview: '\\left(\\frac{a}{b}\\right)' },
    ],
    powers: [
      { label: 'Kvadrat', code: 'x^2', preview: 'x^2' },
      { label: 'Kub', code: 'x^3', preview: 'x^3' },
      { label: 'Qüvvət n', code: 'x^{n}', preview: 'x^{n}' },
      { label: 'Aşağı indeks', code: 'a_1', preview: 'a_1' },
      { label: 'İkiqat indeks', code: 'a_{n}^{2}', preview: 'a_{n}^{2}' },
      { label: 'Modul', code: '|x|', preview: '|x|' },
      { label: 'Kvadrat tənlik', code: 'ax^2 + bx + c = 0', preview: 'ax^2 + bx + c = 0' },
      { label: 'Kök düsturu', code: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', preview: 'x = \\frac{-b \\pm \\sqrt{D}}{2a}' },
    ],
    trig: [
      { label: 'Sinus', code: '\\sin(x)', preview: '\\sin(x)' },
      { label: 'Kosinus', code: '\\cos(x)', preview: '\\cos(x)' },
      { label: 'Tangens', code: '\\tan(x)', preview: '\\tan(x)' },
      { label: 'Kotangens', code: '\\cot(x)', preview: '\\cot(x)' },
      { label: 'Əsas eynilik', code: '\\sin^2(x) + \\cos^2(x) = 1', preview: '\\sin^2(x) + \\cos^2(x) = 1' },
      { label: 'Dərəcə', code: '45^\\circ', preview: '45^\\circ' },
      { label: 'Radian (Pi/2)', code: '\\frac{\\pi}{2}', preview: '\\frac{\\pi}{2}' },
      { label: 'Bucaq işarəsi', code: '\\angle ABC', preview: '\\angle ABC' },
    ],
    calculus: [
      { label: 'Müəyyən İnteqral', code: '\\int_{a}^{b} f(x) dx', preview: '\\int_{a}^{b} f(x) dx' },
      { label: 'Qeyri-müəyyən İnteqral', code: '\\int f(x) dx', preview: '\\int f(x) dx' },
      { label: 'Cəm işarəsi (Sum)', code: '\\sum_{i=1}^{n} x_i', preview: '\\sum_{i=1}^{n} x_i' },
      { label: 'Limit', code: '\\lim_{x \\to 0} f(x)', preview: '\\lim_{x \\to 0} f(x)' },
      { label: 'Sonsuz limit', code: '\\lim_{x \\to \\infty} \\frac{1}{x}', preview: '\\lim_{x \\to \\infty} \\frac{1}{x}' },
      { label: 'Törəmə', code: 'f\'(x) = \\frac{df}{dx}', preview: 'f\'(x) = \\frac{df}{dx}' },
      { label: 'Vektor', code: '\\vec{v}', preview: '\\vec{v}' },
    ],
    matrices: [
      { label: 'Onluq loqarifm', code: '\\lg(x)', preview: '\\lg(x)' },
      { label: 'Təbii loqarifm', code: '\\ln(x)', preview: '\\ln(x)' },
      { label: 'Əsaslı loqarifm', code: '\\log_{a}(b)', preview: '\\log_{a}(b)' },
      { label: '2x2 Matris', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', preview: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
      { label: 'Sistem tənlik', code: '\\begin{cases} x + y = 10 \\\\ x - y = 4 \\end{cases}', preview: '\\begin{cases} x + y = 10 \\\\ x - y = 4 \\end{cases}' },
    ],
    symbols: [
      { label: 'Plys-minus', code: '\\pm ', preview: '\\pm' },
      { label: 'Vurma', code: '\\cdot ', preview: '\\cdot' },
      { label: 'Çarpaz', code: '\\times ', preview: '\\times' },
      { label: 'Bərabər deyil', code: '\\neq ', preview: '\\neq' },
      { label: 'Təqribən', code: '\\approx ', preview: '\\approx' },
      { label: 'Kiçik-bərabər', code: '\\le ', preview: '\\le' },
      { label: 'Böyük-bərabər', code: '\\ge ', preview: '\\ge' },
      { label: 'Sonsuzluq', code: '\\infty ', preview: '\\infty' },
      { label: 'Alfa', code: '\\alpha ', preview: '\\alpha' },
      { label: 'Beta', code: '\\beta ', preview: '\\beta' },
      { label: 'Delta', code: '\\Delta ', preview: '\\Delta' },
      { label: 'Teta', code: '\\theta ', preview: '\\theta' },
      { label: 'Pi', code: '\\pi ', preview: '\\pi' },
      { label: 'Üçbucaq', code: '\\triangle ABC', preview: '\\triangle ABC' },
      { label: 'Perpendikulyar', code: '\\perp ', preview: '\\perp' },
      { label: 'Paralel', code: '\\parallel ', preview: '\\parallel' },
    ]
  };

  const handleSaveFormula = () => {
    const trimmed = latexInput.trim();
    if (!trimmed) {
      onSave('');
      onClose();
      return;
    }
    const finalVal = `$${trimmed}$`;
    onSave(finalVal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Riyazi Düstur Redaktoru
              </h3>
              <p className="text-[11px] text-slate-500">
                Düsturu daxil edin, klaviatura ilə dəyişin və canlı önizləmədə yoxlayın
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
          {/* 1. Live KaTeX Preview Box */}
          <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-slate-50 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center min-h-[90px] shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">
              Canlı Riyazi Önizləmə
            </span>
            <div className="text-base sm:text-xl font-bold text-slate-900 py-2">
              <MathRenderer content={`$${latexInput || '...'}$`} />
            </div>
          </div>

          {/* 2. Direct LaTeX Input Field (Editable via Keyboard) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>LaTeX Kodu (Klaviatura ilə sərbəst redaktə edin):</span>
              </label>
              <button
                type="button"
                onClick={() => setLatexInput('')}
                className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Təmizlə
              </button>
            </div>
            <textarea
              ref={inputRef}
              rows={3}
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              placeholder="Məsələn: \frac{x^2 + 4}{2a} və ya klaviaturadan yazın"
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            />
          </div>

          {/* 3. Visual Formula Category Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === c.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* 4. Formula Template Quick-Insert Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {templates[activeCategory]?.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => insertTemplate(tpl.code)}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group"
              >
                <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">
                  <MathRenderer content={`$${tpl.preview}$`} />
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-indigo-500 truncate max-w-full">
                  {tpl.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Ləğv et
          </button>
          <button
            type="button"
            onClick={handleSaveFormula}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Düsturu Tətbiq Et
          </button>
        </div>
      </div>
    </div>
  );
};
