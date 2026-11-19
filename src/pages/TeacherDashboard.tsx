// src/pages/TeacherDashboard.tsx
// ATROQ Education - Premium SaaS Teacher Management Dashboard

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
  ExternalLink,
  BookOpen,
  Printer,
  Edit3,
  Cpu,
  Layers,
  ChevronRight,
  CheckCircle2,
  Calendar,
  School
} from 'lucide-react';
import { formatDuration } from '../lib/export-utils';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

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
  const { t, language } = useThemeLanguage();

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

  const locale = language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'az-AZ';
  const todayStr = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto w-full select-none">
      {/* 1. HERO BANNER & TEZ BAŞLAMA PANESİ (Geniş, alçaq, işıqlı rejimdə tam açıq, qaranlıq rejimdə tünd) */}
      <div className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-50/90 via-white to-sky-50/70 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-white p-4 sm:p-5 lg:p-6 shadow-sm dark:shadow-xl border border-indigo-100 dark:border-indigo-900/40">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Sparkles className="w-72 h-72 text-indigo-400" />
        </div>

        <div className="relative z-10 w-full">
          {/* Üst zolaq: Tarix, Məktəb etiketləri və Rəsmi ATROQ Loqosu */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-2.5 border-b border-indigo-100 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white dark:bg-white/10 text-indigo-700 dark:text-indigo-200 text-[11px] font-semibold shadow-2xs border border-indigo-200/80 dark:border-white/10">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
                {todayStr}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold shadow-2xs border border-emerald-200/80 dark:border-emerald-500/30">
                <School className="w-3.5 h-3.5" />
                {user.school || 'ATROQ Education'}
              </span>
            </div>

            {/* Xoş gəlmisiniz panelinin yuxarı sağında rəsmi ATROQ Education Loqosu */}
            <div className="flex items-center gap-2">
              <img
                src="/assets/atroq-logo.png"
                alt="ATROQ Education"
                className="h-9 sm:h-10 w-auto object-contain dark:brightness-125 dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
              />
            </div>
          </div>

          <div className="mt-1 max-w-4xl">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              {t.welcome}, {user.full_name}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-[13px] mt-1 leading-relaxed">
              {t.welcomeSubtitle}
            </p>
          </div>

          {/* 4 Əsas Giriş Düyməsi (İşıqlı rejimdə tam ağ və açıq, Qaranlıq rejimdə tünd) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4 w-full">
            <button
              onClick={() => onNavigate('ai_test')}
              className="p-2.5 sm:p-3 rounded-xl bg-white hover:bg-violet-50/60 dark:bg-slate-950/85 dark:hover:bg-slate-900 border border-slate-200/90 hover:border-violet-300 dark:border-violet-500/30 dark:hover:border-violet-400 text-slate-900 dark:text-white text-left transition-all shadow-xs hover:shadow-md flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black block truncate leading-tight text-slate-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-200">{t.fastActionAi}</span>
                <span className="text-[10px] text-violet-600 dark:text-violet-300/70 font-semibold block truncate mt-0.5">Süni İntellekt</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('create_test')}
              className="p-2.5 sm:p-3 rounded-xl bg-white hover:bg-cyan-50/60 dark:bg-slate-950/85 dark:hover:bg-slate-900 border border-slate-200/90 hover:border-cyan-300 dark:border-cyan-500/30 dark:hover:border-cyan-400 text-slate-900 dark:text-white text-left transition-all shadow-xs hover:shadow-md flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Edit3 className="w-4 h-4 text-cyan-600 dark:text-cyan-300" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black block truncate leading-tight text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-200">{t.fastActionInteractive}</span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-300/70 font-semibold block truncate mt-0.5">Online Konstruktor</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('omr_test')}
              className="p-2.5 sm:p-3 rounded-xl bg-white hover:bg-emerald-50/60 dark:bg-slate-950/85 dark:hover:bg-slate-900 border border-slate-200/90 hover:border-emerald-300 dark:border-emerald-500/30 dark:hover:border-emerald-400 text-slate-900 dark:text-white text-left transition-all shadow-xs hover:shadow-md flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black block truncate leading-tight text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-200">{t.fastActionOmr}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-300/70 font-semibold block truncate mt-0.5">PDF & Cavab Kartı</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('regional_stats')}
              className="p-2.5 sm:p-3 rounded-xl bg-white hover:bg-amber-50/60 dark:bg-slate-950/85 dark:hover:bg-slate-900 border border-slate-200/90 hover:border-amber-300 dark:border-amber-500/30 dark:hover:border-amber-400 text-slate-900 dark:text-white text-left transition-all shadow-xs hover:shadow-md flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black block truncate leading-tight text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-200">{t.fastActionRegional}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-300/70 font-semibold block truncate mt-0.5">Naxçıvan MR Reytinqi</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATİSTİK GÖSTƏRİCİLƏR (METRICS KPI ROW) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{t.kpiPublishedTests}</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">{activeTests.length}</span>
            <span className="text-[10.5px] text-slate-500 mt-0.5 block">{tests.length} test</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileQuestion className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{t.kpiQuestionBank}</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">{questionCount}</span>
            <span className="text-[10.5px] text-emerald-600 font-semibold mt-0.5 block">KaTeX & Figures</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{t.kpiStudentSessions}</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">{results.length}</span>
            <span className="text-[10.5px] text-slate-500 mt-0.5 block">Sessions</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{t.kpiAverageScore}</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">{avgClassScore}%</span>
            <span className="text-[10.5px] text-indigo-600 font-semibold mt-0.5 block">Average</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. MÜASİR FUNKSİONAL BÖLMƏLƏR (GRID CARDS) */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          {t.catCoreSub}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Sınaq İmtahanları Portalı */}
          <div
            onClick={() => onNavigate('exams_hub')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {t.hubExamsTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.hubExamsDesc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>{t.allTests}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Bütün Testlərim & AI Arxivi */}
          <div
            onClick={() => onNavigate('my_tests')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileQuestion className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {t.hubMyTestsTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.hubMyTestsDesc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400">
              <span>{t.allTests}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Sinif və Şagird İdarəetməsi */}
          <div
            onClick={() => onNavigate('classes')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {t.hubClassesTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.hubClassesDesc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>{t.classesTitle}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Nəticələr və İmtahan Jurnalı */}
          <div
            onClick={() => onNavigate('results')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {t.hubResultsTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.hubResultsDesc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>{t.allResults}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Regional Statistika və Reytinq (Naxçıvan MR) */}
          <div
            onClick={() => onNavigate('regional_stats')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {t.hubRegionalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.hubRegionalDesc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
              <span>{t.fastActionRegional}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: ATROQ Education Haqqında */}
          <div
            onClick={() => onNavigate('about')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {t.hubAboutTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.hubAboutDesc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>{t.aboutTitle}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. SON TESTLƏR VƏ ŞAGİRD NƏTİCƏLƏRİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol: Son Testlərim */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-3.5">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-black text-slate-900 dark:text-white text-sm">{t.recentTests}</h3>
              </div>
              <button
                onClick={() => onNavigate('my_tests')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                {t.allTests} ({tests.length})
              </button>
            </div>

            {tests.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                {t.noTestsYet}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {tests.slice(0, 4).map((test) => (
                  <div
                    key={test.id}
                    className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                          {test.test_type === 'ai' || test.title.includes('AI') ? 'AI Test' : test.exam_model}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                          {test.subject}
                        </span>
                      </div>
                      <h4
                        onClick={() => onOpenTest(test.id)}
                        className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer truncate"
                      >
                        {test.title}
                      </h4>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        {test.total_questions} sual • {test.duration_minutes} dəq • {test.completed_attempts || 0} iştirakçı
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onShareTest(test)}
                        className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                        title={t.copyLink}
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
            className="w-full mt-4 py-2.5 border border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            {t.createInteractiveTitle}
          </button>
        </div>

        {/* Sağ: Son Nəticələr */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-3.5">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-black text-slate-900 dark:text-white text-sm">{t.recentSubmissions}</h3>
              </div>
              <button
                onClick={() => onNavigate('results')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {t.allResults} ({results.length})
              </button>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                {t.noSubmissionsYet}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {results.slice(0, 4).map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                        {session.student_name || 'Şagird'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {session.test_title || 'Sınaq İmtahanı'}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs font-black block ${
                        (session.score || 0) >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {session.score || 0} Bal
                      </span>
                      <span className="text-[9.5px] text-slate-400 block">
                        {session.correct_count || 0} düz / {session.total_questions || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="w-full mt-4 py-2.5 border border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-4 h-4" />
            {t.resultsTitle}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
