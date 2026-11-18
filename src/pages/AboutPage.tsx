// src/pages/AboutPage.tsx
// ATROQ Education – “Haqqında” Səhifəsi
// Proqramın müəllifi: Rəşad Kirmanoğlu, yaradılma məqsədi, imkanları və AI Tanıtım Videosu
// Dizayn düzəlişi: Bütün çərçivələr, kartlar, mətnlər və boşluqlar mütənasib şəkildə kiçildilib, yığcamlaşdırılıb
import React, { useState } from 'react';
import { User } from '../types';
import { AboutVideoShowcase } from '../components/AboutVideoShowcase';
import {
  Sparkles,
  Cpu,
  Brain,
  FileCheck,
  CheckCircle2,
  Award,
  Layers,
  BarChart3,
  TrendingUp,
  School,
  GraduationCap,
  FileQuestion,
  Printer,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
  Check,
  Compass,
  ArrowRight
} from 'lucide-react';

interface AboutPageProps {
  user?: User;
  onNavigateTab?: (tab: string) => void;
}

interface CapabilityItem {
  id: number;
  title: string;
  badge: string;
  icon: any;
  color: string;
  desc: string;
  highlights: string[];
}

const ATROQ_CAPABILITIES: CapabilityItem[] = [
  {
    id: 1,
    title: 'Süni intellektlə testlərin hazırlanması',
    badge: 'AI ENGINE',
    icon: Brain,
    color: 'from-blue-600 to-indigo-600',
    desc: 'Milli dərslik proqramları və kurikulum standartlarına tam uyğun olaraq I–XI siniflər və bütün fənlər üzrə saniyələr içində yüksək dəqiqlikli test suallarının avtomatik formalaşdırılması.',
    highlights: ['I–XI sinif mövzu bazası', 'Bütün fənlərin əhatəsi', 'Məzmun dəqiqliyi']
  },
  {
    id: 2,
    title: 'Çoxformatlı testlər',
    badge: 'MULTİ-FORMAT',
    icon: Layers,
    color: 'from-indigo-600 to-purple-600',
    desc: 'Tək fənnli testlərlə yanaşı, eyni anda bir neçə fənni birləşdirən çoxfənli imtahanlar, qapalı testlər, açıq suallar və uyğunlaşdırma blokları.',
    highlights: ['Çoxfənli blok və buraxılış', 'Fərdi sual sayı', 'Qapalı və açıq sual']
  },
  {
    id: 3,
    title: 'İnteraktiv testlər',
    badge: 'ONLINE EXAM',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    desc: 'Şagirdlər üçün real vaxt rejimində onlayn imtahanların keçirilməsi, avtomatik vaxt nəzarəti (taymer), cavabların ani yadda saxlanması və operativ nəticə.',
    highlights: ['Canlı taymer nəzarəti', 'Ani cavab qeydiyyatı', 'Bütün cihazlarda dəstək']
  },
  {
    id: 4,
    title: 'Situasiya tipli tapşırıqlar',
    badge: 'SİTUASİYA',
    icon: FileQuestion,
    color: 'from-rose-500 to-pink-600',
    desc: 'Şagirdlərin analitik, məntiqi və tənqidi təfəkkürünü yoxlayan mətn, qrafik və praktik ssenarilər əsasında qurulmuş situasiya sualları.',
    highlights: ['Mətn və qrafik təhlili', 'Dərin məntiqi analiz', 'DİM imtahan standartı']
  },
  {
    id: 5,
    title: 'OMR cavab kartları',
    badge: 'OPTİK SKAN',
    icon: FileCheck,
    color: 'from-cyan-600 to-teal-600',
    desc: 'Beynəlxalq A4 poliqrafik standartlarında tərtib edilmiş OMR optik cavab kartlarının çapı, unikal barkod/QR kod identifikasiyası və optik yoxlama.',
    highlights: ['A4 formatlı optik blank', 'Ştrix-kod identifikasiyası', 'Xüsusi texnika tələb etmir']
  },
  {
    id: 6,
    title: 'PDF formatında çap imkanı',
    badge: 'A4 ÇAP',
    icon: Printer,
    color: 'from-blue-500 to-cyan-600',
    desc: 'İmtahan sual kitabçaları və cavab vərəqlərinin yüksək poliqrafik keyfiyyətlə A4 formatlı PDF sənəd kimi ixracı və dərhal çap edilməsi.',
    highlights: ['İki sütunlu təmiz düzüm', 'Məktəb və sinif başlığı', 'İmtahana hazır dizayn']
  },
  {
    id: 7,
    title: 'Nəticələrin avtomatik hesablanması',
    badge: 'AUTO GRADING',
    icon: CheckCircle2,
    color: 'from-emerald-600 to-green-600',
    desc: 'İmtahan başa çatan kimi sistem tərəfindən düzgün və səhv cavablar, yekun ballar və faiz göstəricilərinin insan amili olmadan 100% dəqiqliklə hesablanması.',
    highlights: ['Saniyələr içində yoxlama', 'Səhvlərin ətraflı analizi', 'Obyektiv və şəffaf bal']
  },
  {
    id: 8,
    title: 'Üç pilləli reytinq və analiz',
    badge: '3-PİLLƏLİ ANALİZ',
    icon: TrendingUp,
    color: 'from-violet-600 to-indigo-700',
    desc: '1-ci pillə: Məktəb daxilində şagirdlərin akademik reytinqi; 2-ci pillə: Məktəblərarası reytinq müqayisəsi; 3-cü pillə: Rayonlararası regional reytinq təhlili.',
    highlights: ['Şagird pilləsi', 'Məktəblərarası pillə', 'Regional rayon pilləsi']
  },
  {
    id: 9,
    title: 'Rayon və məktəblərin müqayisəsi',
    badge: 'NMR ANALİTİKA',
    icon: Award,
    color: 'from-teal-600 to-emerald-700',
    desc: 'Naxçıvan Muxtar Respublikasının 8 şəhər və rayonu (Naxçıvan, Babək, Şərur, Ordubad, Culfa, Şahbuz, Kəngərli, Sədərək) və bütün məktəblərin canlı akademik müqayisəsi.',
    highlights: ['8 rayon və şəhər', 'Rəsmi məktəblər bazası', 'Faktiki test göstəriciləri']
  },
  {
    id: 10,
    title: 'Təhsilin rəqəmsallaşdırılması',
    badge: 'DİGİTAL FUTURE',
    icon: Cpu,
    color: 'from-slate-700 to-slate-900',
    desc: 'Kağız bürokratiyasını aradan qaldıran, təhsil idarəetmə orqanları və müəllimlər üçün vahid, şəffaf, sürətli və qabaqcıl rəqəmsal qiymətləndirmə ekosistemi.',
    highlights: ['Kağızsız hesabatlılıq', 'Milli təhsil ekosistemi', 'İnnovativ gələcək baxışı']
  }
];

export const AboutPage: React.FC<AboutPageProps> = ({ user, onNavigateTab }) => {
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Tech Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Subtle Glow Orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[220px] bg-gradient-to-tr from-indigo-600/15 via-sky-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Yığcam və Mütənasib Konteyner */}
      <div className="max-w-3xl sm:max-w-4xl mx-auto w-full px-3 sm:px-6 py-5 relative z-10 flex flex-col gap-5 sm:gap-6">

        {/* =========================================================================
            1. HERO & MOTTO HEADER (Yığcamlaşdırılmış)
           ========================================================================= */}
        <section className="text-center flex flex-col items-center">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-sky-950/80 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold tracking-wide shadow-md shadow-indigo-950/40 mb-2.5 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" />
            <span>RƏQƏMSAL TƏHSİL EKOSİSTEMİ</span>
            <span className="w-1 h-1 rounded-full bg-sky-400" />
            <span className="text-[9px] font-mono text-sky-300 font-black">v2.5 PRO</span>
          </div>

          {/* Logo & Title */}
          <div className="flex items-center justify-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-blue-700 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-300">
              ATROQ Education
            </h1>
          </div>

          {/* Motto */}
          <p className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-blue-200 max-w-xl tracking-tight mb-2.5">
            Təhsilin rəqəmsal inkişaf platforması
          </p>

          {/* Quick Technology Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xl">
            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300 text-[10px] font-medium flex items-center gap-1">
              <Brain className="w-3 h-3 text-indigo-400" /> Süni İntellekt
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300 text-[10px] font-medium flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-sky-400" /> OMR Optik Kart
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300 text-[10px] font-medium flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-400" /> 3 Pilləli Reytinq
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300 text-[10px] font-medium flex items-center gap-1">
              <Printer className="w-3 h-3 text-amber-400" /> Standart A4 Çap
            </span>
          </div>
        </section>

        {/* =========================================================================
            2. ATROQ EDUCATION HAQQINDA TƏQDİMAT (Yığcam Rəsmi Mətn Bloku)
           ========================================================================= */}
        <section className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800/80 p-3.5 sm:p-5 shadow-xl backdrop-blur-lg overflow-hidden">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-white tracking-tight">
                  ATROQ Education — Təhsilin rəqəmsal inkişaf platforması
                </h2>
                <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block">
                  Platformanın Yaradılma Məqsədi və Fəlsəfəsi
                </span>
              </div>
            </div>

            <div className="space-y-2 text-slate-300 text-xs sm:text-[13px] leading-relaxed">
              <p className="bg-slate-950/60 p-3 sm:p-3.5 rounded-xl border border-slate-800/60 text-slate-200">
                <strong className="text-white font-bold">ATROQ Education</strong> təhsil prosesinin rəqəmsallaşdırılması, qiymətləndirmə imkanlarının genişləndirilməsi, test və imtahanların hazırlanması, şagird nəticələrinin təhlili və tədris prosesinə müasir texnologiyaların tətbiqi məqsədilə yaradılmış platformadır.
              </p>
              <p className="text-slate-300 px-1">
                Platforma müəllim və şagirdlərə biliklərin yoxlanılması, müxtəlif formatlarda tapşırıqların hazırlanması, avtomatlaşdırılmış qiymətləndirmə və regional təhsil statistikasının aparılması üçün geniş imkanlar təqdim edir.
              </p>
            </div>

            {/* Quick Navigation Buttons */}
            {onNavigateTab && (
              <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onNavigateTab('ai_test')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  AI Test Yarat
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('regional_stats')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Award className="w-3 h-3" />
                  Regional Statistika (NMR)
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('exams_hub')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3 h-3 text-indigo-400" />
                  Sınaq İmtahanları
                </button>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            3. ATROQ EDUCATION-I TANI — MONTAJ EDİLMİŞ AI TANITIM VİDEOSU (16:9 Kompakt Sahə)
           ========================================================================= */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-sky-400 text-[10px] font-black uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span>MULTİMEDİA TƏQDİMATI</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>ATROQ Education-ı tanı</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold border border-sky-500/30">
                  48 SANİYƏ • VİRTUAL APARICI
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Virtual qadın aparıcının təqdimatında ATROQ Education-ın real proqram görüntüləri, canlı lip-sync və səs müşayiəti.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-[11px] font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Pəncərədə Aç</span>
              </button>
            </div>
          </div>

          {/* Embedded Video Showcase Player - Kompakt 16:9 çərçivə */}
          <div className="max-w-2xl mx-auto w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-1 sm:p-1.5 shadow-xl">
            <AboutVideoShowcase />
          </div>
        </section>

        {/* =========================================================================
            4. ATROQ EDUCATION-IN İMKANLARI (10 Əsas Funksiya - Yığcam Şəbəkə)
           ========================================================================= */}
        <section className="flex flex-col gap-3">
          <div className="text-center max-w-xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 text-indigo-400 text-[10px] font-black uppercase tracking-wider mb-0.5">
              <Cpu className="w-3 h-3" />
              <span>FUNKSİONAL ARXİTEKTURA</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
              ATROQ Education-ın 10 Əsas İmkanı
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Müəllim, şagird və təhsil idarələri üçün vahid rəqəmsal ekosistemdə birləşdirilmiş ən müasir texnoloji həllər.
            </p>
          </div>

          {/* Yığcam 10 Kartlıq Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ATROQ_CAPABILITIES.map((cap) => {
              const IconComp = cap.icon;
              return (
                <div
                  key={cap.id}
                  className="group relative rounded-xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800/80 hover:border-indigo-500/50 p-3 sm:p-3.5 transition-all duration-150 flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cap.color} p-0.5 shadow flex items-center justify-center shrink-0`}>
                          <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center text-white">
                            <IconComp className="w-3.5 h-3.5 text-indigo-400" />
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          № {cap.id < 10 ? `0${cap.id}` : cap.id}
                        </span>
                      </div>

                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 tracking-wide">
                        {cap.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-[13px] font-bold text-white group-hover:text-sky-300 transition-colors">
                        {cap.title}
                      </h3>
                      <p className="text-[11px] text-slate-300 leading-snug mt-1 font-normal">
                        {cap.desc}
                      </p>
                    </div>
                  </div>

                  {/* Highlights mini-chips */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                    {cap.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-medium text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/90 flex items-center gap-1"
                      >
                        <Check className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            5. PROQRAMIN MÜƏLLİFİ BÖLMƏSİ (RƏŞAD KİRMANOĞLU - Yığcam və Zərif)
           ========================================================================= */}
        <section className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-indigo-500/40 p-4 sm:p-6 shadow-xl shadow-indigo-950/50 overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">

            {/* Left: Author Credentials & Bio */}
            <div className="flex-1 flex flex-col gap-2.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mx-auto md:mx-0 w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>MÜƏLLİFLİK VƏ YARADICI HEYƏT</span>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  ATROQ Education — Proqramın ideya müəllifi, tərtibatçısı və dizayneri:
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-sky-200 to-indigo-100 tracking-tight font-serif mt-0.5">
                  Rəşad Kirmanoğlu
                </h3>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-md">
                Təhsilin rəqəmsallaşdırılması, müasir qiymətləndirmə texnologiyaları və süni intellektin tədris prosesinə inteqrasiyası istiqamətində hazırlanmış milli ATROQ Education platforması müəllimlərin iş yükünü yüngülləşdirmək və regional təhsil keyfiyyətini yüksəltmək məqsədi daşıyır.
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2 text-[10px] text-slate-400">
                <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>İdeya Müəllifi</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                  <CheckCircle2 className="w-3 h-3 text-sky-400" />
                  <span>Sistem Tərtibatçısı</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                  <span>UI/UX Dizayneri</span>
                </div>
              </div>
            </div>

            {/* Right: Digital Signature & Verification Seal */}
            <div className="flex flex-col items-center justify-center gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 shadow-lg shrink-0">

              {/* Official Seal Graphic */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-dashed border-sky-400/40 animate-spin" style={{ animationDuration: '24s' }} />
                <div className="absolute inset-1.5 rounded-full border border-indigo-400/30 bg-gradient-to-tr from-indigo-950 via-slate-950 to-sky-950" />

                <div className="relative z-10 flex flex-col items-center justify-center text-center p-1">
                  <ShieldCheck className="w-4 h-4 text-amber-300 mb-0.5" />
                  <span className="text-[7px] font-black tracking-widest text-sky-300 uppercase">ATROQ</span>
                  <span className="text-[6px] font-mono font-bold text-slate-400 uppercase tracking-tighter">ARCHITECT</span>
                  <span className="text-[7px] font-black text-amber-300 font-mono">2026</span>
                </div>
              </div>

              {/* Artistic Digital Calligraphic Signature (SVG) */}
              <div className="w-full flex flex-col items-center gap-0.5 pt-1.5 border-t border-slate-800/80">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                  RƏQƏMSAL TƏSDİQ İMZASI
                </span>

                <div className="w-36 h-9 flex items-center justify-center">
                  <svg
                    viewBox="0 0 240 70"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-sky-300"
                  >
                    <path
                      d="M20,48 C28,18 42,12 50,28 C55,38 45,55 35,52 C26,50 38,32 60,35 C72,37 80,48 95,44 C108,40 115,22 125,28 C135,34 140,48 155,42 C170,36 180,24 195,30 C205,34 215,48 225,45"
                      stroke="url(#sigGradientCompact)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15,55 Q90,52 225,38"
                      stroke="url(#sigGradientCompact)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M58,15 Q64,28 60,42"
                      stroke="url(#sigGradientCompact)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="120" cy="22" r="2.5" fill="#38bdf8" />
                    <circle cx="160" cy="20" r="2.5" fill="#38bdf8" />
                    <defs>
                      <linearGradient id="sigGradientCompact" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="text-[10px] font-semibold text-slate-300 tracking-wide flex items-center gap-1">
                  <span>Rəşad Kirmanoğlu</span>
                  <span className="w-1 h-1 rounded-full bg-sky-400" />
                  <span className="text-[9px] text-slate-400 font-mono">Bütün Hüquqlar Qorunur</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            6. FOOTER NOTES
           ========================================================================= */}
        <footer className="text-center py-3 border-t border-slate-900 text-[10px] text-slate-500 flex flex-col items-center gap-1">
          <p>© 2026 ATROQ Education Platforması. Bütün hüquqlar qorunur.</p>
          <p className="text-[9px] text-slate-600">
            Təhsilin rəqəmsallaşdırılması və müasir qiymətləndirmə ekosistemi.
          </p>
        </footer>

      </div>

      {/* Fullscreen Video Modal */}
      {showVideoModal && (
        <AboutVideoShowcase
          isModal={true}
          onClose={() => setShowVideoModal(false)}
        />
      )}
    </div>
  );
};
