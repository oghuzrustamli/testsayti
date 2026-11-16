// src/pages/StatisticsPage.tsx
import React, { useState, useEffect } from 'react';
import { User, Test } from '../types';
import { api } from '../lib/api';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  Users,
  CheckCircle,
  BarChart3,
  ArrowUpRight,
  HelpCircle
} from 'lucide-react';

interface StatisticsPageProps {
  user: User;
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({ user }) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTests() {
      try {
        setLoading(true);
        const data = await api.getTests(user.id);
        setTests(data || []);
        if (data && data.length > 0) {
          setSelectedTestId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, [user.id]);

  useEffect(() => {
    if (!selectedTestId) return;
    async function loadAnalytics() {
      try {
        setLoading(true);
        const data = await api.getTestAnalytics(selectedTestId);
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [selectedTestId]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header & Test Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Statistika və Təhsil Analitikası</h1>
          <p className="text-xs text-slate-500">
            Sinif üzrə orta göstəricilər, ən çox səhv edilən suallar və sual üzrə mənimsəmə faizi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">İmtahan seçin:</label>
          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {tests.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      </div>

      {loading || !analytics ? (
        <div className="p-12 text-center text-xs text-slate-400">Analitika məlumatları hesablanır...</div>
      ) : analytics.total_participants === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <p className="text-slate-600 font-bold text-sm mb-1">Bu test üçün hələ iştirakçı qeydə alınmayıb.</p>
          <p className="text-slate-400 text-xs">Şagirdlər imtahanı tamamladıqdan sonra bütün qrafik və göstəricilər burada formalaşacaq.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Key Metrics Cards (Section XII) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">İştirakçı Sayı</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{analytics.total_participants} nəfər</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">İmtahanı tamamlayanlar</span>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sinif üzrə Orta Nəticə</span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">{analytics.avg_score} bal</span>
              <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">Orta faiz: {analytics.avg_percentage}%</span>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ən Yüksək Nəticə</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{analytics.max_score} bal</span>
              <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Maksimum toplanan</span>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ən Aşağı Nəticə</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{analytics.min_score} bal</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Minimum toplanan</span>
            </div>
          </div>

          {/* Score Distribution Bars & Most Missed Questions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Score Distribution Histogram */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Bal Paylanması Histogramı</h3>
                </div>

                <div className="flex flex-col gap-3">
                  {Object.entries(analytics.score_distribution).map(([bracket, count]: [string, any]) => {
                    const pct = analytics.total_participants > 0 ? (count / analytics.total_participants) * 100 : 0;
                    return (
                      <div key={bracket} className="text-xs">
                        <div className="flex justify-between font-semibold text-slate-700 mb-1">
                          <span>{bracket}% bal aralığı</span>
                          <span>{count} şagird ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Şagirdlərin böyük əksəriyyəti 60-100% aralığında nəticə göstərmişdir.
              </div>
            </div>

            {/* Right: Most Failed Questions (Section XII) */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-slate-800 text-sm">Ən Çox Səhv Edilən Suallar</h3>
                </div>

                <div className="flex flex-col gap-2.5">
                  {analytics.most_failed_questions.map((q: any) => (
                    <div
                      key={q.question_id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-indigo-950 block">Sual №{q.order_index}</span>
                        <span className="text-[11px] text-slate-500 truncate block">{q.text_preview}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-rose-600 block">{q.accuracy_percentage}% düzgün</span>
                        <span className="text-[10px] text-slate-400">{q.correct_count} / {q.total_attempts} nəfər</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
                Tövsiyə: Aşağı mənimsəmə faizi olan mövzular üzrə təkrar dərs təşkil edin.
              </div>
            </div>
          </div>

          {/* Question by Question Accuracy Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-4">
              Bütün Suallar Üzrə Düzgün Cavablandırma Göstəricisi:
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {analytics.question_accuracy.map((q: any) => {
                const isGood = q.accuracy_percentage >= 70;
                const isMed = q.accuracy_percentage >= 40;
                return (
                  <div
                    key={q.question_id}
                    className={`p-3 rounded-xl border text-center ${
                      isGood ? 'bg-emerald-50/50 border-emerald-200' : isMed ? 'bg-amber-50/50 border-amber-200' : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-500 block mb-0.5">Sual {q.order_index}</span>
                    <strong className={`text-base font-black ${isGood ? 'text-emerald-700' : isMed ? 'text-amber-700' : 'text-rose-700'}`}>
                      {q.accuracy_percentage}%
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{q.correct_count} düzgün</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
