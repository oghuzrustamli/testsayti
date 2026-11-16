// src/components/VisualMathKeyboard.tsx
import React, { useState } from 'react';
import { MathRenderer } from './MathRenderer';
import { Calculator, X, Sparkles, BookOpen, ChevronDown } from 'lucide-react';

interface VisualMathKeyboardProps {
  onInsert: (latex: string) => void;
  onClose?: () => void;
}

export const VisualMathKeyboard: React.FC<VisualMathKeyboardProps> = ({ onInsert, onClose }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'algebra' | 'trig' | 'calculus' | 'symbols'>('basic');
  const [previewSnippet, setPreviewSnippet] = useState<string>('\\frac{\\sqrt{x^2+1}}{2a}');

  const categories = [
    { id: 'basic', label: 'Əsas & Kəsrlər' },
    { id: 'algebra', label: 'Cəbr & Qüvvət' },
    { id: 'trig', label: 'Triqonometriya' },
    { id: 'calculus', label: 'Analiz & Cəm' },
    { id: 'symbols', label: 'Simvollar & Hərflər' },
  ] as const;

  const basicTemplates = [
    { label: 'Kəsr (a/b)', latex: '\\frac{a}{b}', display: '\\frac{a}{b}' },
    { label: 'Mürəkkəb kəsr', latex: '\\frac{a+b}{c}', display: '\\frac{a+b}{c}' },
    { label: 'Köklü kəsr', latex: '\\frac{\\sqrt{x^2+1}}{2a}', display: '\\frac{\\sqrt{x^2+1}}{2a}' },
    { label: 'Kvadrat kök', latex: '\\sqrt{x}', display: '\\sqrt{x}' },
    { label: 'Kök altı ifadə', latex: '\\sqrt{x^2+1}', display: '\\sqrt{x^2+1}' },
    { label: 'n-ci dərəcə kök', latex: '\\sqrt[n]{x}', display: '\\sqrt[n]{x}' },
    { label: 'Kök 6', latex: '\\sqrt{6}', display: '\\sqrt{6}' },
    { label: 'Mötərizəli kəsr', latex: '\\left(\\frac{a}{b}\\right)', display: '\\left(\\frac{a}{b}\\right)' },
  ];

  const algebraTemplates = [
    { label: 'Kvadrat', latex: 'x^2', display: 'x^2' },
    { label: 'Qüvvət (n)', latex: 'x^{n}', display: 'x^{n}' },
    { label: 'Aşağı indeks', latex: 'a_1', display: 'a_1' },
    { label: 'Aşağı-yuxarı indeks', latex: 'a_{n}^{2}', display: 'a_{n}^{2}' },
    { label: 'Modul', latex: '|x|', display: '|x|' },
    { label: 'Kvadrat tənlik', latex: 'ax^2 + bx + c = 0', display: 'ax^2 + bx + c = 0' },
    { label: 'Diskriminant', latex: 'D = b^2 - 4ac', display: 'D = b^2 - 4ac' },
    { label: 'Kök düsturu', latex: 'x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a}', display: 'x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a}' },
    { label: 'Sistem tənlik', latex: '\\begin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}', display: '\\begin{cases} x+y=5 \\\\ x-y=1 \\end{cases}' },
  ];

  const trigTemplates = [
    { label: 'Sinus', latex: '\\sin(x)', display: '\\sin(x)' },
    { label: 'Kosinus', latex: '\\cos(x)', display: '\\cos(x)' },
    { label: 'Tangens', latex: '\\tan(x)', display: '\\tan(x)' },
    { label: 'Kotangens', latex: '\\cot(x)', display: '\\cot(x)' },
    { label: 'Sinus kvadratı', latex: '\\sin^2(x) + \\cos^2(x) = 1', display: '\\sin^2(x) + \\cos^2(x) = 1' },
    { label: 'Bucaq (dərəcə)', latex: '30^\\circ', display: '30^\\circ' },
    { label: 'Pi bucaq', latex: '\\frac{\\pi}{2}', display: '\\frac{\\pi}{2}' },
  ];

  const calculusTemplates = [
    { label: 'Müəyyən İnteqral', latex: '\\int_{a}^{b} f(x) dx', display: '\\int_{a}^{b} f(x) dx' },
    { label: 'Qeyri-müəyyən İnteqral', latex: '\\int f(x) dx', display: '\\int f(x) dx' },
    { label: 'Cəm işarəsi', latex: '\\sum_{i=1}^{n} x_i', display: '\\sum_{i=1}^{n} x_i' },
    { label: 'Limit', latex: '\\lim_{x \\to 0} f(x)', display: '\\lim_{x \\to 0} f(x)' },
    { label: 'Törəmə', latex: 'f\'(x) = \\frac{df}{dx}', display: 'f\'(x) = \\frac{df}{dx}' },
    { label: 'Vektor', latex: '\\vec{v}', display: '\\vec{v}' },
  ];

  const symbolsTemplates = [
    { label: 'Plys-minus', latex: '\\pm', display: '\\pm' },
    { label: 'Vurma', latex: '\\cdot', display: '\\cdot' },
    { label: 'Çarpaz vurma', latex: '\\times', display: '\\times' },
    { label: 'Bölmə', latex: '\\div', display: '\\div' },
    { label: 'Bərabər deyil', latex: '\\neq', display: '\\neq' },
    { label: 'Təqribən', latex: '\\approx', display: '\\approx' },
    { label: 'Kiçik bərabər', latex: '\\le', display: '\\le' },
    { label: 'Böyük bərabər', latex: '\\ge', display: '\\ge' },
    { label: 'Sonsuzluq', latex: '\\infty', display: '\\infty' },
    { label: 'Alfa', latex: '\\alpha', display: '\\alpha' },
    { label: 'Beta', latex: '\\beta', display: '\\beta' },
    { label: 'Qamma', latex: '\\gamma', display: '\\gamma' },
    { label: 'Delta', latex: '\\Delta', display: '\\Delta' },
    { label: 'Teta', latex: '\\theta', display: '\\theta' },
    { label: 'Pi', latex: '\\pi', display: '\\pi' },
  ];

  const getActiveList = () => {
    switch (activeTab) {
      case 'basic': return basicTemplates;
      case 'algebra': return algebraTemplates;
      case 'trig': return trigTemplates;
      case 'calculus': return calculusTemplates;
      case 'symbols': return symbolsTemplates;
    }
  };

  const handleSelect = (item: { latex: string; label: string }) => {
    setPreviewSnippet(item.latex);
    // Wrap with $...$ if not already
    const insertVal = item.latex.startsWith('$') ? item.latex : `$${item.latex}$`;
    onInsert(insertVal);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden p-3.5 max-w-2xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Vizual Riyazi Düstur Paneli</h4>
            <p className="text-[11px] text-slate-500">Düstura klikləyin, mətndə kursorun olduğu yerə dərhal əlavə olunsun</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === cat.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of formula buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 my-3 max-h-52 overflow-y-auto pr-1">
        {getActiveList().map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelect(item)}
            onMouseEnter={() => setPreviewSnippet(item.latex)}
            className="group flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-center min-h-[54px]"
            title={item.latex}
          >
            <div className="text-slate-800 group-hover:text-indigo-700 font-medium text-sm transition-colors py-0.5">
              <MathRenderer content={`$${item.display}$`} />
            </div>
            <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 truncate max-w-full">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Live Preview Bar */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
        <div className="flex items-center gap-2 text-slate-600 truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="font-semibold text-slate-500 text-[11px]">Canlı baxış:</span>
          <div className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800 font-medium text-sm">
            <MathRenderer content={`$${previewSnippet}$`} />
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
          ${previewSnippet}$
        </span>
      </div>
    </div>
  );
};
