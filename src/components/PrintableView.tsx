// src/components/PrintableView.tsx
import React, { useState } from 'react';
import { Test, Question } from '../types';
import { MathRenderer } from './MathRenderer';
import { Printer, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface PrintableViewProps {
  test: Test;
  onBack: () => void;
}

export const PrintableView: React.FC<PrintableViewProps> = ({ test, onBack }) => {
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [showExplanations, setShowExplanations] = useState<boolean>(false);

  const questions = test.questions || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      {/* Control Toolbar (hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          onClick={onBack}
          className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri qayıt
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              showAnswerKey
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {showAnswerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            Cavab açarları {showAnswerKey ? '(Açıq)' : '(Gizli)'}
          </button>

          <button
            onClick={() => setShowExplanations(!showExplanations)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              showExplanations
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {showExplanations ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            Həll izahları
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            Çap et / PDF saxla
          </button>
        </div>
      </div>

      {/* A4 Paper Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-md rounded-xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-full">
        {/* Exam Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-indigo-950 uppercase tracking-wider">ATROQ Education</span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold border border-slate-200">
                  {test.exam_model}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-snug">
                {test.title}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Fənn: <strong>{test.subject}</strong> | Sinif / Qrup: <strong>{test.grade_group || 'Ümumi'}</strong> | İmtahan müddəti: <strong>{test.duration_minutes} dəqiqə</strong> | Sual sayı: <strong>{questions.length}</strong>
              </p>
            </div>

            {/* Student metadata fill box on paper */}
            <div className="border-2 border-slate-400 p-3 rounded-lg text-xs min-w-[240px] shrink-0 bg-slate-50/50">
              <div className="mb-2">
                <span className="text-slate-500 font-semibold text-[10px]">Şagirdin Adı, Soyadı:</span>
                <div className="border-b border-slate-400 h-4 mt-1"></div>
              </div>
              <div className="flex justify-between gap-2">
                <div className="w-1/2">
                  <span className="text-slate-500 font-semibold text-[10px]">Sinif / Qrup:</span>
                  <div className="border-b border-slate-400 h-4 mt-1"></div>
                </div>
                <div className="w-1/2">
                  <span className="text-slate-500 font-semibold text-[10px]">Toplanan Bal:</span>
                  <div className="border-b border-slate-400 h-4 mt-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex flex-col gap-6">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="pb-5 border-b border-slate-200 last:border-b-0 break-inside-avoid">
              <div className="flex items-start gap-2.5">
                <span className="font-black text-slate-900 text-sm sm:text-base min-w-[24px]">
                  {idx + 1}.
                </span>
                <div className="flex-1 text-slate-900 text-sm leading-relaxed">
                  <MathRenderer content={q.question_text} />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                  ({q.points} bal)
                </span>
              </div>

              {/* Embedded Graph if present */}
              {q.graph_data?.imageDataUrl && (
                <div className="my-3 flex justify-center">
                  <img
                    src={q.graph_data.imageDataUrl}
                    alt="Qrafik"
                    className="max-h-48 border border-slate-200 rounded object-contain"
                  />
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-8">
                {q.options.map((opt) => {
                  const isCorrect = q.correct_answer === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2 text-xs p-1.5 rounded ${
                        showAnswerKey && isCorrect
                          ? 'bg-emerald-50 border border-emerald-300 font-bold text-emerald-900'
                          : 'text-slate-800'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border border-slate-400 font-bold flex items-center justify-center text-[10px] shrink-0 ${
                        showAnswerKey && isCorrect ? 'bg-emerald-600 text-white border-emerald-600' : ''
                      }`}>
                        {opt.id}
                      </span>
                      <span className="leading-snug">
                        <MathRenderer content={opt.text} />
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation if enabled */}
              {showExplanations && q.explanation && (
                <div className="mt-3 ml-8 p-2.5 bg-indigo-50/50 border-l-2 border-indigo-500 rounded text-xs text-indigo-950">
                  <strong className="text-indigo-800 block mb-0.5">Həll izahı:</strong>
                  <MathRenderer content={q.explanation} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Answer Key Grid (at bottom of printout if toggled) */}
        {showAnswerKey && (
          <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-400 break-inside-avoid">
            <h3 className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-wider">
              Düzgün Cavablar Açarı:
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 text-xs text-center font-bold">
              {questions.map((q, idx) => (
                <div key={idx} className="p-1.5 border border-slate-300 rounded bg-slate-50">
                  <div className="text-[10px] text-slate-500">{idx + 1}</div>
                  <div className="text-indigo-700 text-sm">{q.correct_answer || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 flex items-center justify-between">
          <span>ATROQ Education Təhsil Sistemi</span>
          <span>Səhifə 1 / 1</span>
        </div>
      </div>
    </div>
  );
};
