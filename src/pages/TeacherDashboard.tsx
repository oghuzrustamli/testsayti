// src/pages/TeacherDashboard.tsx
import React, { useEffect, useState } from 'react';
import { User, Test, TestSession } from '../types';
import { api } from '../lib/api';
import {
  FileQuestion,
  Users,
  Database,
  Award,
  PlusCircle,
  Share2,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  BarChart2,
  ExternalLink
} from 'lucide-react';
import { formatDuration } from '../lib/export-utils';

interface TeacherDashboardProps {
  user: User;
  onNavigate: (tab: any) => void;
  onShareTest: (test: Test) => void;
  onOpenTest: (testId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  onNavigate,
  onShareTest,
  onOpenTest,
}) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestSession[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [testsData, resultsData, questionsData] = await Promise.all([
          api.getTests(user.id),
          api.getResults({ teacher_id: user.id }),
          api.getQuestions({ teacher_id: user.id })
        ]);
        setTests(testsData || []);
        setResults(resultsData || []);
        setQuestionCount(questionsData ? questionsData.length : 0);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.id]);

  const activeTests = tests.filter(t => t.status === 'published' || t.status === 'ongoing');
  const avgClassScore = results.length > 0
    ? (results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(1)
    : '0';

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Sparkles className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
            <span>Xoş gəlmisiniz, {user.full_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            EDUNEX Quiz Creator Təhsil Portalı
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-2 leading-relaxed">
            Buraxılış, Blok və Lisey qəbul imtahanları üçün saniyələr ərzində peşəkar testlər hazırlayın, riyazi düstur və qrafikləri asanlıqla suallara daxil edin və nəticələri real vaxtda izləyin.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('create_test')}
              className="px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Yeni Test Yarat
            </button>
            <button
              onClick={() => onNavigate('question_bank')}
              className="px-5 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 font-bold text-xs rounded-xl border border-indigo-500/30 transition-all flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-indigo-300" />
              Sual Bankı
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Yayımlanan Testlər</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{activeTests.length}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Ümumi: {tests.length} test</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileQuestion className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sual Bankında</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{questionCount}</span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Riyazi & Qrafik suallar</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tamamlanmış İmtahan</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{results.length}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Şagird sessiyası</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Orta Müvəffəqiyyət</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{avgClassScore}%</span>
            <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">Bütün siniflər üzrə</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Split: Recent Tests & Recent Student Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Tests List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Aktiv və Son Testlərim</h3>
              </div>
              <button
                onClick={() => onNavigate('my_tests')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Hamısına bax &rarr;
              </button>
            </div>

            {tests.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Hələ heç bir test yaratmamısınız.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {tests.slice(0, 4).map((test) => (
                  <div
                    key={test.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {test.exam_model}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {test.subject}
                        </span>
                      </div>
                      <h4
                        onClick={() => onOpenTest(test.id)}
                        className="text-xs font-bold text-slate-800 hover:text-indigo-600 cursor-pointer truncate"
                      >
                        {test.title}
                      </h4>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        {test.total_questions} sual • {test.duration_minutes} dəq • {test.completed_attempts || 0} iştirakçı
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onShareTest(test)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                        title="Paylaşım linki"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('create_test')}
            className="w-full mt-4 py-2.5 border border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Yeni Test Əlavə Et
          </button>
        </div>

        {/* Right: Recent Student Results */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Son Nəticələr</h3>
              </div>
              <button
                onClick={() => onNavigate('results')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Cədvəl &rarr;
              </button>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Hələ imtahan verən şagird yoxdur.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {results.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {r.student_name} {r.student_surname}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[180px] block">
                        {r.test_title || 'Sınaq İmtahanı'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`font-black text-sm block ${
                        r.percentage >= 80 ? 'text-emerald-600' : r.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {r.score} bal ({r.percentage}%)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDuration(r.duration_seconds)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('statistics')}
            className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Sinif Analitikasına Bax
          </button>
        </div>
      </div>
    </div>
  );
};
