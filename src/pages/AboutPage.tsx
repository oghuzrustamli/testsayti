// src/pages/AboutPage.tsx
// EDUNEX – “Haqqında” Səhifəsi
// Proqramın müəllifi: Rəşad Kirmanoğlu, yaradılma məqsədi, imkanları və AI Tanıtım Videosu
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
  ArrowRight,
  ExternalLink
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

const EDUNEX_CAPABILITIES: CapabilityItem[] = [
  {
    id: 1,
    title: 'Süni intellektlə testlərin hazırlanması',
    badge: 'AI ENGINE',
    icon: Brain,
    color: 'from-blue-600 to-indigo-600',
    desc: 'Milli dərslik proqramları və kurikulum standartlarına tam uyğun olaraq I–XI siniflər və bütün fənlər üzrə saniyələr içində yüksək dəqiqlikli test suallarının avtomatik formalaşdırılması.',
    highlights: ['I–XI sinif mövzu bazası', 'Bütün fənlərin əhatə olunması', 'Məzmun standartı dəqiqliyi']
  },
  {
    id: 2,
    title: 'Çoxformatlı testlər',
    badge: 'MULTİ-FORMAT',
    icon: Layers,
    color: 'from-indigo-600 to-purple-600',
    desc: 'Tək fənnli testlərlə yanaşı, eyni anda bir neçə fənni birləşdirən çoxfənli imtahanlar, qapalı testlər, açıq suallar və uyğunlaşdırma blokları.',
    highlights: ['Çoxfənli blok və buraxılış', 'Fərdi sual sayının təyini', 'Qapalı və açıq tapşırıqlar']
  },
  {
    id: 3,
    title: 'İnteraktiv testlər',
    badge: 'ONLINE EXAM',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    desc: 'Şagirdlər üçün real vaxt rejimində onlayn imtahanların keçirilməsi, avtomatik vaxt nəzarəti (taymer), cavabların ani yadda saxlanması və operativ nəticə.',
    highlights: ['Canlı taymer nəzarəti', 'Avtomatik cavab qeydiyyatı', 'İstənilən cihazda işləmə']
  },
  {
    id: 4,
    title: 'Situasiya tipli tapşırıqlar',
    badge: 'SİTUASİYA',
    icon: FileQuestion,
    color: 'from-rose-500 to-pink-600',
    desc: 'Şagirdlərin analitik, məntiqi və tənqidi təfəkkürünü yoxlayan mətn, qrafik və praktik ssenarilər əsasında qurulmuş situasiya sualları.',
    highlights: ['Mətn və qrafik təhlili', 'Dərin məntiqi qiymətləndirmə', 'DİM imtahan standartı']
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
    highlights: ['Səliqəli iki sütunlu düzüm', 'Məktəb və sinif başlığı', 'İmtahana tam hazır dizayn']
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
    highlights: ['Şagird pilləsi', 'Məktəb pilləsi', 'Regional rayon pilləsi']
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
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-sky-500/15 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative z-10 flex flex-col gap-14">
        
        {/* =========================================================================
            1. HERO & MOTTO HEADER
           ========================================================================= */}
        <section className="text-center flex flex-col items-center">
          {/* Innovation & Authority Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-sky-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide shadow-lg shadow-indigo-950/50 mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>MÜASİR TƏHSİLİN İNNOVATİV RƏQƏMSAL EKOSİSTEMİ</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="text-[10px] font-mono text-sky-300 font-black">v2.5 PRO</span>
          </div>

          {/* Main Logo & Title */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-blue-700 p-0.5 shadow-2xl shadow-indigo-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Cpu className="w-8 h-8 text-sky-400" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-300">
              EDUNEX
            </h1>
          </div>

          {/* Official Motto */}
          <p className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-blue-300 max-w-2xl tracking-tight mb-6">
            Təhsilin rəqəmsal inkişaf platforması
          </p>

          {/* Quick Technology Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl">
            <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-400" /> Süni İntellektlə Test
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-sky-400" /> OMR Optik Kart
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> 3 Pilləli Reytinq
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5 text-amber-400" /> Standart A4 Çap
            </span>
          </div>
        </section>

        {/* =========================================================================
            2. EDUNEX HAQQINDA TƏQDİMAT (RƏSMİ MƏTN)
           ========================================================================= */}
        <section className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  EDUNEX — Təhsilin rəqəmsal inkişaf platforması
                </h2>
                <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
                  Platformanın Yaradılma Məqsədi və Fəlsəfəsi
                </span>
              </div>
            </div>

            <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              <p className="bg-slate-950/60 p-4 sm:p-6 rounded-2xl border border-slate-800/60 text-slate-200 shadow-inner">
                <strong className="text-white font-bold">EDUNEX</strong> təhsil prosesinin rəqəmsallaşdırılması, qiymətləndirmə imkanlarının genişləndirilməsi, test və imtahanların hazırlanması, şagird nəticələrinin təhlili və tədris prosesinə müasir texnologiyaların tətbiqi məqsədilə yaradılmış platformadır.
              </p>
              <p className="text-slate-300 px-1">
                Platforma müəllim və şagirdlərə biliklərin yoxlanılması, müxtəlif formatlarda tapşırıqların hazırlanması, avtomatlaşdırılmış qiymətləndirmə və regional təhsil statistikasının aparılması üçün geniş imkanlar təqdim edir.
              </p>
            </div>

            {/* Quick Action Buttons to key modules */}
            {onNavigateTab && (
              <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onNavigateTab('ai_test')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Test Yarat
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('regional_stats')}
                  className="px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  Regional Statistika (NMR)
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('exams_hub')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Sınaq İmtahanları
                </button>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            3. EDUNEX-İ TANI — SÜNİ İNTELLEKT TANITIM VİDEOSU
           ========================================================================= */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-sky-400 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MULTİMEDİA TƏQDİMATI</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>EDUNEX-i tanı</span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 font-mono font-bold border border-sky-500/30">
                  56 SANİSİYƏ
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Süni intellekt tərəfindən hazırlanmış dinamik video nümayişi, peşəkar səs müşayiəti və canlı interfeys animasiyaları.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Videonu Pəncərədə Aç</span>
              </button>
            </div>
          </div>

          {/* Embedded Video Showcase Player */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-2 sm:p-4 shadow-2xl shadow-indigo-950/40">
            <AboutVideoShowcase />
          </div>
        </section>

        {/* =========================================================================
            4. EDUNEX-İN İMKANLARI (10 ƏSAS FUNKSİYA)
           ========================================================================= */}
        <section className="flex flex-col gap-8">
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>FUNKSİONAL ARXİTEKTURA</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              EDUNEX-in 10 Əsas İmkanı
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Müəllim, şagird və təhsil idarələri üçün vahid rəqəmsal ekosistemdə birləşdirilmiş ən müasir texnoloji həllər.
            </p>
          </div>

          {/* Grid of 10 Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {EDUNEX_CAPABILITIES.map((cap) => {
              const IconComp = cap.icon;
              return (
                <div
                  key={cap.id}
                  className="group relative rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800/80 hover:border-indigo-500/50 p-6 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-950/30 flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.color} p-0.5 shadow-lg flex items-center justify-center shrink-0`}>
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                          <IconComp className="w-5 h-5 text-indigo-400" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          № {cap.id < 10 ? `0${cap.id}` : cap.id}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 tracking-wide">
                          {cap.badge}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                        {cap.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2 font-normal">
                        {cap.desc}
                      </p>
                    </div>
                  </div>

                  {/* Highlights list */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
                    {cap.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium text-slate-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800/90 flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-sky-400 shrink-0" />
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
            5. PROQRAMIN MÜƏLLİFİ BÖLMƏSİ (RƏŞAD KİRMANOĞLU)
           ========================================================================= */}
        <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border-2 border-indigo-500/40 p-8 sm:p-12 shadow-2xl shadow-indigo-950/60 overflow-hidden">
          {/* Ambient Author Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            
            {/* Left: Author Credentials & Bio */}
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mx-auto md:mx-0 w-fit">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>MÜƏLLİFLİK VƏ YARADICI HEYƏT</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                  EDUNEX — Proqramın ideya müəllifi, tərtibatçısı və dizayneri:
                </p>
                <h3 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-sky-200 to-indigo-100 tracking-tight py-1 font-serif">
                  Rəşad Kirmanoğlu
                </h3>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Təhsilin rəqəmsallaşdırılması, müasir qiymətləndirmə texnologiyaları və süni intellektin tədris prosesinə inteqrasiyası istiqamətində hazırlanmış milli EDUNEX platforması müəllimlərin iş yükünü yüngülləşdirmək, şagirdlərin real potensialını üzə çıxarmaq və regional təhsil keyfiyyətini qabaqcıl səviyyəyə çatdırmaq məqsədi daşıyır.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>İdeya Müəllifi</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sistem Tərtibatçısı</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>UI/UX Dizayneri</span>
                </div>
              </div>
            </div>

            {/* Right: Digital Signature & Verification Seal */}
            <div className="flex flex-col items-center justify-center gap-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-xl min-w-[280px] sm:min-w-[320px]">
              
              {/* Official Seal Graphic */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Rotating Outer Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-400/30 animate-spin" style={{ animationDuration: '24s' }} />
                {/* Inner Ring */}
                <div className="absolute inset-2 rounded-full border border-indigo-400/40 bg-gradient-to-tr from-indigo-950 via-slate-950 to-sky-950" />
                
                {/* Center Seal Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center p-2">
                  <ShieldCheck className="w-7 h-7 text-amber-300 mb-0.5" />
                  <span className="text-[9px] font-black tracking-widest text-sky-300 uppercase">EDUNEX</span>
                  <span className="text-[7px] font-mono font-bold text-slate-400 uppercase tracking-tighter">VERIFIED ARCHITECT</span>
                  <span className="text-[8px] font-black text-amber-300 font-mono mt-0.5">2026</span>
                </div>
              </div>

              {/* Artistic Digital Calligraphic Signature (SVG) */}
              <div className="w-full flex flex-col items-center gap-1 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  RƏQƏMSAL TƏSDİQ İMZASI
                </span>
                
                <div className="w-56 h-16 flex items-center justify-center">
                  <svg
                    viewBox="0 0 240 70"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-sky-300"
                  >
                    {/* Calligraphic curves for "Rəşad Kirmanoğlu" */}
                    <path
                      d="M20,48 C28,18 42,12 50,28 C55,38 45,55 35,52 C26,50 38,32 60,35 C72,37 80,48 95,44 C108,40 115,22 125,28 C135,34 140,48 155,42 C170,36 180,24 195,30 C205,34 215,48 225,45"
                      stroke="url(#sigGradient)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15,55 Q90,52 225,38"
                      stroke="url(#sigGradient)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M58,15 Q64,28 60,42"
                      stroke="url(#sigGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="120" cy="22" r="2.5" fill="#38bdf8" />
                    <circle cx="160" cy="20" r="2.5" fill="#38bdf8" />
                    <defs>
                      <linearGradient id="sigGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="text-xs font-semibold text-slate-300 tracking-wide flex items-center gap-1.5">
                  <span>Rəşad Kirmanoğlu</span>
                  <span className="w-1 h-1 rounded-full bg-sky-400" />
                  <span className="text-[10px] text-slate-400 font-mono">Bütün Hüquqlar Qorunur</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            6. FOOTER NOTES
           ========================================================================= */}
        <footer className="text-center py-6 border-t border-slate-900 text-xs text-slate-400 flex flex-col items-center gap-2">
          <p>© 2026 EDUNEX Platforması. Bütün hüquqlar qorunur.</p>
          <p className="text-[11px] text-slate-400">
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
