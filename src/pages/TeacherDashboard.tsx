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

  const todayStr = new Intl.DateTimeFormat('az-AZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto w-full select-none">
      {/* 1. HERO BANNER & TEZ BAŞLAMA PANESİ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/40">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Sparkles className="w-96 h-96 text-indigo-400" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              {todayStr}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-xs border border-emerald-500/30">
              <School className="w-3.5 h-3.5" />
              {user.school || 'Naxçıvan Muxtar Respublikası Təhsil Portalı'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Xoş gəlmisiniz, {user.full_name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            ATROQ Education ilə Buraxılış, Blok və Lisey sınaqlarını süni intellektlə saniyələr ərzində hazırlayın, A4 formatında PDF sual kitabçası çıxarın və şagirdlərin nəticələrini real vaxtda izləyin.
          </p>

          {/* 4 Əsas Giriş Düyməsi (Tez Başlama Kartları) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
            <button
              onClick={() => onNavigate('ai_test')}
              className="p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-left transition-all shadow-md shadow-indigo-950 flex flex-col justify-between cursor-pointer group border border-violet-400/30"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-black block leading-tight">AI ilə Test Yarat</span>
                <span className="text-[10px] text-indigo-200 block mt-0.5">Süni İntellekt</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('create_test')}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-left transition-all backdrop-blur-xs flex flex-col justify-between cursor-pointer group border border-white/10"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Edit3 className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <span className="text-xs font-black block leading-tight">İnteraktiv Test</span>
                <span className="text-[10px] text-slate-300 block mt-0.5">Əl ilə Sual Tərtibi</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('omr_test')}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-left transition-all backdrop-blur-xs flex flex-col justify-between cursor-pointer group border border-white/10"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Printer className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <span className="text-xs font-black block leading-tight">OMR & Çap Testi</span>
                <span className="text-[10px] text-slate-300 block mt-0.5">PDF Kitabça</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('regional_stats')}
              className="p-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-white text-left transition-all backdrop-blur-xs flex flex-col justify-between cursor-pointer group border border-emerald-400/30"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <span className="text-xs font-black block leading-tight">Regional Statistika</span>
                <span className="text-[10px] text-emerald-200 block mt-0.5">Naxçıvan MR Reytinq</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATİSTİK GÖSTƏRİCİLƏR (METRICS KPI ROW) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Yayımlanan Testlər</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{activeTests.length}</span>
            <span className="text-[10.5px] text-slate-500 mt-0.5 block">Cəmi: {tests.length} test</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileQuestion className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sual Bankında</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{questionCount}</span>
            <span className="text-[10.5px] text-emerald-600 font-semibold mt-0.5 block">Düstur & Şəkillər</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Şagird Sessiyaları</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{results.length}</span>
            <span className="text-[10.5px] text-slate-500 mt-0.5 block">Tamamlanmış test</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Orta Müvəffəqiyyət</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{avgClassScore}%</span>
            <span className="text-[10.5px] text-indigo-600 font-semibold mt-0.5 block">Bütün siniflər üzrə</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. MÜASİR FUNKSİONAL BÖLMƏLƏR (GRID CARDS) */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Platformanın Əsas Funksional Bölmələri
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Sınaq İmtahanları Portalı */}
          <div
            onClick={() => onNavigate('exams_hub')}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                Sınaq İmtahanları Portalı
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Fənlər, siniflər və 4 əsas imtahan modeli (Buraxılış, Blok, KSQ/BSQ və Liseylər) üzrə hazır sınaqlar.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Sınaqlara Keç</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Bütün Testlərim & AI Arxivi */}
          <div
            onClick={() => onNavigate('my_tests')}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-violet-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileQuestion className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-violet-600 transition-colors">
                Bütün Testlərim & AI Arxivi
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Müəllimin yaratdığı bütün AI testləri, interaktiv sınaqlar və OMR kitabçaları. Paylaşım linklərinin idarəsi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-violet-600">
              <span>Testləri İdarə Et</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Sinif və Şagird İdarəetməsi */}
          <div
            onClick={() => onNavigate('classes')}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                Sinif və Şagirdlər
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Məktəb sinifləri, şagird siyahıları, UTİS kodları və hər sinif üzrə fərdi sınaq imtahanlarının təyinatı.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Siniflərə Bax</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Nəticələr və İmtahan Jurnalı */}
          <div
            onClick={() => onNavigate('results')}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                Nəticələr və Jurnal
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                İmtahan verən şagirdlərin dəqiq balları, cavab kartları, düz və səhv sual statistikası və Excel ixracı.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>Nəticələr Cədvəli</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Regional Statistika və Reytinq (Naxçıvan MR) */}
          <div
            onClick={() => onNavigate('regional_stats')}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                Regional Statistika (NMR)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Naxçıvan şəhəri və 7 rayon üzrə bütün ümumtəhsil məktəblərinin akademik reytinq cədvəli və müqayisəsi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
              <span>Reytinq Sistemini Aç</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: ATROQ Education Haqqında */}
          <div
            onClick={() => onNavigate('about')}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                ATROQ Haqqında & Video
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Platformanın müəllifi, yaradılma məqsədi və virtual qadın aparıcının Azərbaycan dilində rəsmi video təqdimatı.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Təqdimata Bax</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. SON TESTLƏR VƏ ŞAGİRD NƏTİCƏLƏRİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol: Son Testlərim */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-sm">Son Hazırlanmış Testlərim</h3>
              </div>
              <button
                onClick={() => onNavigate('my_tests')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                Bütün testlər ({tests.length}) &rarr;
              </button>
            </div>

            {tests.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Hələ heç bir test yaratmamısınız.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {tests.slice(0, 4).map((test) => (
                  <div
                    key={test.id}
                    className="p-3 rounded-xl border border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50/60 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {test.test_type === 'ai' || test.title.includes('AI') ? 'AI Test' : test.exam_model}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {test.subject}
                        </span>
                      </div>
                      <h4
                        onClick={() => onOpenTest(test.id)}
                        className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 cursor-pointer truncate"
                      >
                        {test.title}
                      </h4>
                      <span className="text-[10.5px] text-slate-500 mt-0.5 block">
                        {test.total_questions} sual • {test.duration_minutes} dəq • {test.completed_attempts || 0} iştirakçı
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onShareTest(test)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        title="Şagird Linkini Paylaş"
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
            className="w-full mt-4 py-2.5 border border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Yeni Test Əlavə Et
          </button>
        </div>

        {/* Sağ: Son Nəticələr */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-sm">Son Nəticələr</h3>
              </div>
              <button
                onClick={() => onNavigate('results')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                Cədvələ Bax &rarr;
              </button>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Hələ imtahan verən şagird yoxdur.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {results.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-800 block truncate">
                        {r.student_name} {r.student_surname}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {r.test_title || 'Sınaq İmtahanı'}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-black text-xs block ${
                        r.percentage >= 80 ? 'text-emerald-600' : r.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {r.score} bal ({r.percentage}%)
                      </span>
                      <span className="text-[9.5px] text-slate-400">
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
            className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Sinif Analitikasına Bax
          </button>
        </div>
      </div>
    </div>
  );
};
