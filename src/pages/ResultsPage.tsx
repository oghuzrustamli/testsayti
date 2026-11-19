// src/pages/ResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { User, TestSession, StudentAnswerDetail } from '../types';
import { api } from '../lib/api';
import { exportMultiSubjectResultsToExcel, exportResultsToExcel, formatDuration } from '../lib/export-utils';
import { MultiSubjectResultsTable } from '../components/MultiSubjectResultsTable';
import { calculateMultiSubjectStats } from '../lib/multiSubjectAnalytics';
import { MathRenderer } from '../components/MathRenderer';
import {
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  HelpCircle,
  Eye,
  X,
  Award,
  Clock,
  ArrowUpDown
} from 'lucide-react';

interface ResultsPageProps {
  user: User;
  initialTestId?: string | null;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  user,
  initialTestId,
}) => {
  const [results, setResults] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const data = await api.getResults({
          teacher_id: user.id,
          test_id: initialTestId || undefined
        });
        setResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [user.id, initialTestId]);

  // Open detailed answer review
  const handleOpenDetail = async (sessionId: string) => {
    try {
      setSelectedSessionId(sessionId);
      setLoadingDetail(true);
      const data = await api.getExamSessionDetails(sessionId);
      setSessionDetail(data);
    } catch (err) {
      alert('Cavab təfərrüatları yüklənmədi');
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredResults = results.filter((r) => {
    const fullName = `${r.student_name} ${r.student_surname}`.toLowerCase();
    const testTitle = (r.test_title || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || testTitle.includes(query);
  });

  const handleExportExcel = () => {
    if (filteredResults.length === 0) {
      alert('İxrac etmək üçün heç bir nəticə yoxdur');
      return;
    }
    const title = initialTestId && filteredResults[0] ? filteredResults[0].test_title : 'ATROQ_Bütün_Nəticələr';
    exportResultsToExcel(filteredResults, title || 'Nəticələr');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">İmtahan Nəticələri</h1>
          <p className="text-xs text-slate-500">
            Şagirdlərin toplanan balları, düzgün/səhv sayı və ətraflı cavab kartları
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel-ə İxrac Et (.xlsx)
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            Çap et
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Şagird adı və ya test adı axtar..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          Ümumi: <strong>{filteredResults.length}</strong> şagird nəticəsi
        </span>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">№</th>
                <th className="py-3 px-4">Şagird</th>
                <th className="py-3 px-4">Testin Adı</th>
                <th className="py-3 px-4 text-center">Düz</th>
                <th className="py-3 px-4 text-center">Səhv</th>
                <th className="py-3 px-4 text-center">Boş</th>
                <th className="py-3 px-4 text-center">Bal</th>
                <th className="py-3 px-4 text-center">Faiz</th>
                <th className="py-3 px-4">Müddət</th>
                <th className="py-3 px-4 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">Yüklənir...</td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">Heç bir imtahan nəticəsi tapılmadı.</td>
                </tr>
              ) : (
                filteredResults.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 block">{r.student_name} {r.student_surname}</strong>
                      <span className="text-[10px] text-slate-400">{r.class_name || 'Standart'}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate">
                      {r.test_title || 'Sınaq'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">{r.correct_count}</td>
                    <td className="py-3 px-4 text-center font-bold text-rose-600">{r.incorrect_count}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{r.blank_count}</td>
                    <td className="py-3 px-4 text-center font-black text-slate-900 text-sm">
                      {r.score}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        r.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' : r.percentage >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {formatDuration(r.duration_seconds)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(r.id)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors"
                      >
                        Təhlil et
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answer Inspection Modal */}
      {selectedSessionId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="print-clean-area bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-3xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Şagird Cavab Kartı Təhlili
                </h3>
                {sessionDetail && (
                  <p className="text-xs text-slate-500">
                    {sessionDetail.session.student_name} {sessionDetail.session.student_surname} • Toplanan bal: <strong>{sessionDetail.session.score}</strong> ({sessionDetail.session.percentage}%)
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="no-print px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Çap et"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Çap Et</span>
                </button>
                <button
                  onClick={() => { setSelectedSessionId(null); setSessionDetail(null); }}
                  className="no-print p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  title="Bağla"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingDetail || !sessionDetail ? (
              <div className="py-12 text-center text-xs text-slate-400">Yüklənir...</div>
            ) : (() => {
              const questionsForStats = sessionDetail.answers.map((a: any) => ({
                id: a.question_id,
                subject: a.subject || sessionDetail.test?.subject || 'Ümumi',
                points: a.points || 1,
                correct_answer: a.correct_answer,
                question_text: a.question_text,
                question_type: 'single_choice' as any,
                options: a.options || []
              }));
              const answersForStats: Record<string, any> = {};
              sessionDetail.answers.forEach((a: any) => {
                answersForStats[a.question_id] = a.selected_answer;
              });
              const multiSubEval = calculateMultiSubjectStats(questionsForStats, answersForStats, sessionDetail.test?.grading_rule);

              return (
                <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {/* Fənlər Üzrə Nəticələr Cədvəli və Faiz Qrafikləri (Tələb 4) */}
                  <MultiSubjectResultsTable
                    evaluation={multiSubEval}
                    studentName={`${sessionDetail.session.student_name} ${sessionDetail.session.student_surname}`}
                    testTitle={sessionDetail.session.test_title}
                  />

                  {/* Sual-Sual Detallar */}
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mt-2">
                    Sual-Cavab Ətraflı Təhlili
                  </h4>
                  {sessionDetail.answers.map((ans: any, idx: number) => {
                    const isCorrect = ans.is_correct === 1;
                    const isOpenQuestion = ans.question_type === 'open_ended' || ans.question_type === 'numeric' || ans.question_type === 'situation' || (!ans.options || ans.options.length === 0);
                    const qPoints = ans.points || 4;

                    // Open-ended / Numeric / Situation questions: Omit question body to keep page compact and clean
                    if (isOpenQuestion) {
                      return (
                        <div
                          key={ans.question_id || idx}
                          className={`p-3 rounded-2xl border text-xs flex flex-col gap-2 ${
                            isCorrect ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' : 'bg-rose-50/40 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 dark:text-white">
                                Sual {idx + 1}
                              </span>
                              {ans.subject && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                                  {ans.subject}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800">
                                Açıq Sual
                              </span>
                            </div>

                            {/* QARŞISINDA Sualın Balı və Statusu */}
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2.5 py-0.5 rounded-lg font-black font-mono text-xs border ${
                                isCorrect
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                              }`}>
                                {isCorrect ? qPoints : 0} / {qPoints} bal
                              </span>
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                              }`}>
                                {isCorrect ? 'Düzgün Cavab' : 'Səhv Cavab'}
                              </span>
                            </div>
                          </div>

                          {/* Cavablar: Sualın öz mətni göstərilmir, YALNIZ cavablar */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">Şagirdin cavabı:</span>
                              <strong className={`font-mono text-xs ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {ans.selected_answer || 'Boş'}
                              </strong>
                            </div>
                            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">Düzgün cavab:</span>
                              <strong className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                                {ans.correct_answer || '—'}
                              </strong>
                            </div>
                          </div>

                          {ans.explanation && (
                            <div className="mt-1 p-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                              <strong>İzah:</strong> <MathRenderer content={ans.explanation} />
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Closed Multiple-Choice Questions: Render standard options and question
                    return (
                      <div
                        key={ans.question_id || idx}
                        className={`p-4 rounded-xl border text-xs ${
                          isCorrect ? 'bg-emerald-50/30 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' : 'bg-rose-50/30 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              Sual {idx + 1}:
                            </span>
                            {ans.subject && (
                              <span className="px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                                {ans.subject}
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                          }`}>
                            {isCorrect ? 'Düzgün Cavab' : 'Səhv Cavab'}
                          </span>
                        </div>

                      <div className="mb-2 text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        <MathRenderer content={ans.question_text} />
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        {ans.options?.map((o: any) => (
                          <div
                            key={o.id}
                            className={`p-1.5 rounded border text-[11px] flex items-center gap-1.5 ${
                              ans.selected_answer === o.id && isCorrect
                                ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                                : ans.selected_answer === o.id && !isCorrect
                                ? 'bg-rose-100 border-rose-400 font-bold text-rose-900 dark:bg-rose-900/60 dark:text-rose-200'
                                : ans.correct_answer === o.id
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="font-bold">{o.id}:</span>
                            <span className="truncate"><MathRenderer content={o.text} /></span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span>Şagirdin seçdiyi: <strong className={isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>{ans.selected_answer || 'Boş'}</strong></span>
                        <span>Düzgün variant: <strong className="text-emerald-700 dark:text-emerald-400">{ans.correct_answer}</strong></span>
                      </div>

                      {ans.explanation && (
                        <div className="mt-2 p-2 bg-white/80 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                          <strong>İzah:</strong> <MathRenderer content={ans.explanation} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
          </div>
        </div>
      )}
    </div>
  );
};
