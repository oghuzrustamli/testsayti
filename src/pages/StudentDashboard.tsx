// src/pages/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { User, Test, TestSession } from '../types';
import { api } from '../lib/api';
import {
  BookOpen,
  CheckCircle2,
  BarChart3,
  Key,
  GraduationCap,
  Clock,
  ArrowRight,
  Award,
  Sparkles
} from 'lucide-react';
import { formatDuration } from '../lib/export-utils';

interface StudentDashboardProps {
  user: User;
  onEnterTestCode: (code: string) => void;
  onTakeTest: (testId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onEnterTestCode,
  onTakeTest,
}) => {
  const [activeTab, setActiveTab] = useState<'enter_test' | 'active_tests' | 'completed_tests' | 'results' | 'profile'>('enter_test');
  const [testPin, setTestPin] = useState<string>('');
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [myResults, setMyResults] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [testsData, resultsData] = await Promise.all([
          api.getTests(undefined, 'published'),
          api.getResults()
        ]);
        setAvailableTests(testsData || []);
        // Filter student's sessions if matching student name
        setMyResults(resultsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPin.trim()) return;
    onEnterTestCode(testPin.trim().toUpperCase());
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-white to-sky-50/70 dark:from-indigo-950 dark:via-indigo-900 dark:to-slate-950 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white border border-indigo-100 dark:border-indigo-900 relative shadow-sm dark:shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-indigo-100 dark:bg-indigo-700 rounded-lg text-indigo-700 dark:text-white">
              <GraduationCap className="w-4 h-4" />
            </span>
            <span className="text-xs bg-indigo-50 dark:bg-white/10 text-indigo-700 dark:text-white border border-indigo-200/80 dark:border-white/10 px-2.5 py-0.5 rounded-full font-bold">
              Şagird Portalı
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Salam, {user.full_name}!
          </h1>
          <p className="text-slate-600 dark:text-indigo-200 text-xs sm:text-sm mt-1 leading-relaxed">
            Müəlliminizin göndərdiyi sınaq kodunu daxil edərək və ya aktiv imtahanlar siyahısından seçərək testə başlayın.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('enter_test')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'enter_test' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Testə Daxil Ol
        </button>
        <button
          onClick={() => setActiveTab('active_tests')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'active_tests' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Aktiv Testlər ({availableTests.length})
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'results' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Nəticələrim ({myResults.length})
        </button>
      </div>

      {/* TAB 1: Enter PIN */}
      {activeTab === 'enter_test' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs max-w-lg mx-auto w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Key className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">
            İmtahan Kodu ilə Giriş
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Müəlliminizin təqdim etdiyi unikal test kodunu (məsələn: <strong>EDX-DEMO-2026</strong>) daxil edin.
          </p>

          <form onSubmit={handlePinSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              required
              value={testPin}
              onChange={(e) => setTestPin(e.target.value.toUpperCase())}
              placeholder="EDX-XXXX-XXXX"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono font-black text-base tracking-widest text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all"
            >
              <span>İmtahana Keç</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Active Tests List */}
      {activeTab === 'active_tests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {availableTests.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 inline-block mb-2">
                  {t.exam_model}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{t.title}</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mb-4">
                  <span>Fənn: <strong>{t.subject}</strong></span>
                  <span>Sinif: <strong>{t.grade_group || 'Ümumi'}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">{t.duration_minutes} dəqiqə</span>
                <button
                  onClick={() => onTakeTest(t.id)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                >
                  Testə Başla
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Results */}
      {activeTab === 'results' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">İmtahan</th>
                <th className="py-3 px-4 text-center">Düzgün</th>
                <th className="py-3 px-4 text-center">Səhv</th>
                <th className="py-3 px-4 text-center">Toplanan Bal</th>
                <th className="py-3 px-4 text-center">Müvəffəqiyyət</th>
                <th className="py-3 px-4">Müddət</th>
                <th className="py-3 px-4">Tarix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myResults.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{r.test_title || 'Sınaq'}</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">{r.correct_count}</td>
                  <td className="py-3 px-4 text-center text-rose-600 font-bold">{r.incorrect_count}</td>
                  <td className="py-3 px-4 text-center font-black text-slate-900">{r.score}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {r.percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{formatDuration(r.duration_seconds)}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {r.completed_at ? new Date(r.completed_at).toLocaleDateString('az-AZ') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
