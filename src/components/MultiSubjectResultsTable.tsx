// src/components/MultiSubjectResultsTable.tsx
// EDUNEX Çoxfənli Test Nəticələri Cədvəli və Vizual Faiz Qrafikləri (Tələb 4)
import React from 'react';
import { SubjectStats, MultiSubjectEvaluation } from '../lib/multiSubjectAnalytics';
import {
  Layers,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface MultiSubjectResultsTableProps {
  evaluation: MultiSubjectEvaluation;
  studentName?: string;
  testTitle?: string;
}

export const MultiSubjectResultsTable: React.FC<MultiSubjectResultsTableProps> = ({
  evaluation,
  studentName,
  testTitle,
}) => {
  const { subjects, overall } = evaluation;

  // Color generator for subject progress bars
  const getSubjectColor = (index: number) => {
    const colors = [
      { bar: 'bg-indigo-600', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      { bar: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { bar: 'bg-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
      { bar: 'bg-sky-600', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
      { bar: 'bg-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
      { bar: 'bg-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col gap-5 w-full text-left">
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              Fənlər Üzrə Nəticə Hesabatı
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {subjects.length} Fənn
              </span>
            </h3>
            {studentName && (
              <p className="text-[11px] text-slate-500 font-medium">
                {studentName} {testTitle ? `• ${testTitle}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Overall Percentage Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 px-3.5 py-1.5 rounded-2xl border border-indigo-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-600">Yekun Nəticə:</span>
          <span className="text-base font-black text-indigo-700 font-mono">
            {overall.score} bal ({overall.percentage}%)
          </span>
        </div>
      </div>

      {/* 1. RƏSMİ CƏDVƏL (User Specification 4 Table) */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 sm:px-4">Fənn</th>
              <th className="py-3 px-3 text-center">Sual Sayı</th>
              <th className="py-3 px-3 text-center text-emerald-700">Düz</th>
              <th className="py-3 px-3 text-center text-rose-700">Səhv</th>
              <th className="py-3 px-3 text-center text-slate-500">Boş</th>
              <th className="py-3 px-3 text-center text-indigo-900 font-black">Bal</th>
              <th className="py-3 px-3 sm:px-4 text-right">Faiz</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
            {subjects.map((s, idx) => {
              const theme = getSubjectColor(idx);
              const isPassing = s.percentage >= 60;

              return (
                <tr key={s.subject} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span>{s.subject}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                    {s.total}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-black text-emerald-600">
                    {s.correct}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-rose-600">
                    {s.incorrect}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {s.blank}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-black text-indigo-900">
                    {s.score}
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-[11px] font-mono ${
                      s.percentage >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.percentage >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.percentage}%
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* ÜMUMİ YEKUN SƏTRİ (Total Row) */}
            <tr className="bg-slate-50/90 font-black text-slate-900 text-xs border-t-2 border-slate-300">
              <td className="py-3.5 px-3 sm:px-4 flex items-center gap-2 uppercase tracking-wide">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Ümumi</span>
              </td>
              <td className="py-3.5 px-3 text-center font-mono text-sm">
                {overall.total}
              </td>
              <td className="py-3.5 px-3 text-center font-mono text-sm text-emerald-600">
                {overall.correct}
              </td>
              <td className="py-3.5 px-3 text-center font-mono text-sm text-rose-600">
                {overall.incorrect}
              </td>
              <td className="py-3.5 px-3 text-center font-mono text-sm text-slate-500">
                {overall.blank}
              </td>
              <td className="py-3.5 px-3 text-center font-mono text-sm text-indigo-900">
                {overall.score}
              </td>
              <td className="py-3.5 px-3 sm:px-4 text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-600 text-white font-mono text-xs shadow-2xs">
                  {overall.percentage}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. VİZUAL DİAQRAM / PROGRESS BARLAR (Visual Progress Indicators) */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col gap-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
          Fənlər Üzrə Müvəffəqiyyət Faizləri
        </h4>

        <div className="flex flex-col gap-2.5">
          {subjects.map((s, idx) => {
            const theme = getSubjectColor(idx);
            return (
              <div key={s.subject} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${theme.bar}`} />
                    <span>{s.subject}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({s.correct} düz / {s.total} sual)
                    </span>
                  </span>
                  <span className="font-mono text-indigo-900 font-black">
                    {s.percentage}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${theme.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
