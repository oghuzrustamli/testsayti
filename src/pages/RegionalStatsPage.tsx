// src/pages/RegionalStatsPage.tsx
// EDUNEX – Naxçıvan Muxtar Respublikası Regional Təhsil Statistikası və Akademik Reytinq Sistemi
// 3 MƏRHƏLƏLİ STATİSTİKA: ŞAGİRD REYTİNQİ, MƏKTƏBLƏRARASI REYTİNQ VƏ RAYONLARARASI MÜQAYİSƏ SİSTEMİ
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import {
  NAKHCHIVAN_DISTRICTS,
  MONITORING_GRADES,
  MONITORING_SUBJECTS,
  MONITORING_PERIODS,
  DistrictRecord,
  SchoolRecord,
  StudentRankingItem,
  NmrOverviewStats,
  SchoolRecordItem,
  getAllSchools,
  saveSchool
} from '../lib/nakhchivanData';
import {
  calculateRegionalAnalytics,
  filterRegionalData,
  filterStudentRankings
} from '../lib/regionalAnalytics';
import { exportRegionalStatsToExcel } from '../lib/export-utils';
import {
  Award,
  Building2,
  GraduationCap,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  BarChart3,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  School,
  X,
  SlidersHorizontal,
  PlusCircle,
  ShieldCheck,
  Users,
  Target,
  Trophy,
  MoreVertical,
  ArrowRight,
  Check
} from 'lucide-react';

interface RegionalStatsPageProps {
  user: User;
}

export type RegionalNavTab =
  | 'stage3_districts'     // 3-cü Mərhələ: Rayonlararası Reytinq və Müqayisə Diaqramı (Tələb 5 & 6)
  | 'stage2_schools'       // 2-ci Mərhələ: Rayonun Məktəbləri Arasında Reytinq (Tələb 4)
  | 'stage1_students'      // 1-ci Mərhələ: Məktəb Daxilində Şagird Reytinqi (Tələb 3)
  | 'district_profile'     // Rayon Statistikası və Analitik Profili (Tələb 1 & 9)
  | 'grade_results'        // Siniflər üzrə monitorinq nəticələri (IV, VI, IX, XI)
  | 'subject_results'      // Fənlər üzrə nəticələr
  | 'monitoring_dynamics'  // Monitorinqlərin müqayisəsi və dinamika
  | 'admin_schools';       // Məktəblərin Mərkəzi Reyestri (Admin)

// Modern Color Schemes for Nakhchivan Districts
export const DISTRICT_THEMES: Record<string, {
  gradient: string;
  badgeBg: string;
  textColor: string;
  glow: string;
  borderColor: string;
  softBg: string;
}> = {
  'Naxçıvan şəhəri': {
    gradient: 'from-indigo-600 via-indigo-500 to-indigo-400',
    badgeBg: 'bg-indigo-600 text-white',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    glow: 'shadow-indigo-500/30',
    borderColor: 'border-indigo-400',
    softBg: 'bg-indigo-50 dark:bg-indigo-950/40'
  },
  'Babək rayonu': {
    gradient: 'from-blue-600 via-sky-500 to-cyan-400',
    badgeBg: 'bg-blue-600 text-white',
    textColor: 'text-blue-600 dark:text-blue-400',
    glow: 'shadow-blue-500/30',
    borderColor: 'border-blue-400',
    softBg: 'bg-blue-50 dark:bg-blue-950/40'
  },
  'Şərur rayonu': {
    gradient: 'from-emerald-600 via-teal-500 to-teal-400',
    badgeBg: 'bg-emerald-600 text-white',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    glow: 'shadow-emerald-500/30',
    borderColor: 'border-emerald-400',
    softBg: 'bg-emerald-50 dark:bg-emerald-950/40'
  },
  'Ordubad rayonu': {
    gradient: 'from-amber-500 via-orange-500 to-rose-400',
    badgeBg: 'bg-amber-500 text-white',
    textColor: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-amber-500/30',
    borderColor: 'border-amber-400',
    softBg: 'bg-amber-50 dark:bg-amber-950/40'
  },
  'Culfa rayonu': {
    gradient: 'from-purple-600 via-fuchsia-500 to-pink-400',
    badgeBg: 'bg-purple-600 text-white',
    textColor: 'text-purple-600 dark:text-purple-400',
    glow: 'shadow-purple-500/30',
    borderColor: 'border-purple-400',
    softBg: 'bg-purple-50 dark:bg-purple-950/40'
  },
  'Kəngərli rayonu': {
    gradient: 'from-teal-600 via-cyan-500 to-sky-400',
    badgeBg: 'bg-teal-600 text-white',
    textColor: 'text-teal-600 dark:text-teal-400',
    glow: 'shadow-teal-500/30',
    borderColor: 'border-teal-400',
    softBg: 'bg-teal-50 dark:bg-teal-950/40'
  },
  'Şahbuz rayonu': {
    gradient: 'from-rose-600 via-pink-500 to-orange-400',
    badgeBg: 'bg-rose-600 text-white',
    textColor: 'text-rose-600 dark:text-rose-400',
    glow: 'shadow-rose-500/30',
    borderColor: 'border-rose-400',
    softBg: 'bg-rose-50 dark:bg-rose-950/40'
  },
  'Sədərək rayonu': {
    gradient: 'from-violet-600 via-purple-500 to-indigo-400',
    badgeBg: 'bg-violet-600 text-white',
    textColor: 'text-violet-600 dark:text-violet-400',
    glow: 'shadow-violet-500/30',
    borderColor: 'border-violet-400',
    softBg: 'bg-violet-50 dark:bg-violet-950/40'
  }
};

export const RegionalStatsPage: React.FC<RegionalStatsPageProps> = ({ user }) => {
  // Active navigation tab (Default: 1-ci Mərhələ - Şagird Reytinqi)
  const [activeTab, setActiveTab] = useState<RegionalNavTab>('stage1_students');

  // Filter & Selection states
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Naxçıvan şəhəri');
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>('1 nömrəli tam orta məktəb');
  const [studentGradeFilter, setStudentGradeFilter] = useState<string>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');

  const [selectedGrade, setSelectedGrade] = useState<string>('IV sinif');
  const [selectedSubject, setSelectedSubject] = useState<string>('Azərbaycan dili');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [schoolFilterDistrict, setSchoolFilterDistrict] = useState<string>('all');

  // Chart view metric for Stage 3 (Tələb 6)
  const [chartMetric, setChartMetric] = useState<'overall' | 'success' | 'students'>('overall');

  // Context menu state for the 8 districts (Tələb 1)
  const [openDistrictMenu, setOpenDistrictMenu] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const districtMenuRef = useRef<HTMLDivElement>(null);

  // Selected school detail modal
  const [modalSchool, setModalSchool] = useState<SchoolRecord | null>(null);

  // Inter-district comparison school selector
  const [comparedSchoolNames, setComparedSchoolNames] = useState<string[]>([
    'Heydər Əliyev adına Hərbi Lisey',
    'Ordubad şəhər 1 nömrəli tam orta məktəb',
    'Q.Sadiqov adına Cəhri qəsəbə 2 №-li tam orta məktəb',
    'Şərur şəhər 1 nömrəli tam orta məktəb'
  ]);

  // Admin Central School Registry state
  const [schoolsList, setSchoolsList] = useState<SchoolRecordItem[]>(() => getAllSchools());
  const [newSchoolName, setNewSchoolName] = useState<string>('');
  const [newSchoolDistrict, setNewSchoolDistrict] = useState<string>('Naxçıvan şəhəri');
  const [newSchoolUtis, setNewSchoolUtis] = useState<string>('');
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string>('');

  // Pure data from real EDUNEX test sessions (No simulated/fake numbers: Tələb 7)
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Reytinq Mənbə Ayrılığı (Tələb 7 & 8: ATROQ Testləri vs Nazirlik Monitorinqləri)
  const [sourceFilter, setSourceFilter] = useState<'all' | 'atroq' | 'ministry'>('all');
  // Monitorinq Sinif Ayrılığı (9-cu və 11-ci sinif monitorinqləri qətiyyən bir-birinə qarışdırılmır)
  const [monitoringGradeFilter, setMonitoringGradeFilter] = useState<'all' | '9' | '11'>('all');

  // Sync live database sessions from server
  useEffect(() => {
    async function fetchLiveStats() {
      try {
        setLoadingStats(true);
        const live = await api.getRegionalStats();
        if (live && live.sessions) {
          setLiveSessions(live.sessions);
        }
      } catch (e) {
        console.warn('Live regional data fetch fallback:', e);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchLiveStats();
  }, []);

  // Filter sessions according to source and grade strictly before computing analytics
  const filteredSessions = useMemo(() => {
    return liveSessions.filter((s) => {
      // Mənbə filtri
      if (sourceFilter === 'atroq' && s.source_type === 'ministry') return false;
      if (sourceFilter === 'ministry' && s.source_type !== 'ministry') return false;

      // Sinif filtri (9 və 11-ci sinif monitorinq ayrılığı)
      if (monitoringGradeFilter === '9') {
        const g = (s.grade_class || '').toLowerCase();
        if (!g.includes('9') && !g.includes('ix')) return false;
      } else if (monitoringGradeFilter === '11') {
        const g = (s.grade_class || '').toLowerCase();
        if (!g.includes('11') && !g.includes('xi')) return false;
      }

      // İmtahanda iştirak etməyən və ya balı olmayan şagirdlər reytinqə daxil edilməsin
      if (s.score === undefined || s.score === null || isNaN(Number(s.score))) return false;

      return true;
    });
  }, [liveSessions, sourceFilter, monitoringGradeFilter]);

  // Compute strictly from verified test completions
  const regionalData = useMemo(() => calculateRegionalAnalytics(filteredSessions), [filteredSessions]);
  const districts = regionalData.districts;
  const schools = regionalData.schools;
  const students = regionalData.students;
  const overview = regionalData.overview;

  // Set default school if user is a teacher and has a school
  useEffect(() => {
    if (user.role === 'teacher' && user.school) {
      setSelectedSchoolName(user.school);
      if (user.district) {
        setSelectedDistrictName(user.district);
      }
    }
  }, [user]);

  // Close context menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (districtMenuRef.current && !districtMenuRef.current.contains(event.target as Node)) {
        setOpenDistrictMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered schools for Tab 2 (Məktəblər)
  const filteredSchools = useMemo(() => {
    return filterRegionalData(schools, {
      district: schoolFilterDistrict,
      searchQuery
    });
  }, [schools, schoolFilterDistrict, searchQuery]);

  // Schools for the currently selected district
  const districtSchools = useMemo(() => {
    return schools.filter((s) => s.district === selectedDistrictName);
  }, [schools, selectedDistrictName]);

  // Active district record
  const currentDistrictRecord = useMemo(() => {
    return districts.find((d) => d.name === selectedDistrictName) || districts[0];
  }, [districts, selectedDistrictName]);

  // Filtered students for Stage 1 (Şagird Reytinqi)
  const schoolStudents = useMemo(() => {
    return filterStudentRankings(students, {
      school: selectedSchoolName,
      grade: studentGradeFilter,
      searchQuery: studentSearchQuery
    });
  }, [students, selectedSchoolName, studentGradeFilter, studentSearchQuery]);

  // Intra-district schools for Stage 2
  const intraDistrictSchools = useMemo(() => {
    return [...districtSchools].sort((a, b) => b.overallScore - a.overallScore || b.successRate - a.successRate);
  }, [districtSchools]);

  // Inter-district compared schools
  const comparedSchools = useMemo(() => {
    return schools.filter((s) => comparedSchoolNames.includes(s.name));
  }, [schools, comparedSchoolNames]);

  // Handle Excel Export (Includes Districts, Schools, and Students)
  const handleExportExcel = () => {
    const periodLabel = selectedPeriod === 'all' ? 'Bütün Monitorinqlər' : selectedPeriod === 'mon_1' ? 'I Monitorinq' : selectedPeriod === 'mon_2' ? 'II Monitorinq' : 'III Monitorinq';
    exportRegionalStatsToExcel(districts, schools, periodLabel, students);
  };

  // Handle Print / PDF
  const handlePrint = () => {
    window.print();
  };

  // Admin create school handler
  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim() || !newSchoolDistrict) {
      alert('Məktəbin adı və rayonu daxil edilməlidir');
      return;
    }
    const cleanUtis = newSchoolUtis.trim() || `700${Math.floor(1000 + Math.random() * 9000)}`;
    const newSch: SchoolRecordItem = {
      id: 'sch-custom-' + Date.now(),
      name: newSchoolName.trim(),
      district: newSchoolDistrict,
      utis_code: cleanUtis,
      type: 'tam_orta',
      status: 'active'
    };
    const updated = saveSchool(newSch);
    setSchoolsList(updated);
    setNewSchoolName('');
    setNewSchoolUtis('');
    setAdminSuccessMsg(`«${newSch.name}» uğurla reyestrə əlavə edildi!`);
    setTimeout(() => setAdminSuccessMsg(''), 4000);
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#eef6fc] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* ==============================================================
          1. YUXARI STATİSTİKA BAŞLIĞI VƏ ƏSAS İDARƏETMƏ ZOLAĞI
          ============================================================== */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 shrink-0 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-none shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Regional Statistika və Akademik Reytinq
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Naxçıvan MR
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  IV • VI • IX • XI Siniflər
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Naxçıvanın 8 rayon və şəhəri üzrə 3 mərhələli reytinq sistemi: Şagirdlər • Məktəblər • Rayonlar
              </p>
            </div>
          </div>

          {/* Action buttons: Excel Export & PDF Print */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Statistika və reytinqi Excel (.xlsx) formatında yüklə"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel-ə ixrac</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Çap et və ya PDF kimi saxla"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="hidden sm:inline">Çap / PDF</span>
            </button>
          </div>
        </div>

        {/* ==============================================================
            TƏLƏB 1: RAYONLAR ÜZRƏ İNTERAKTİV KONTEKST MENYU ZOLAĞI
            (Hover desktop, klik mobil; 5 kontekstual seçim)
            ============================================================== */}
        <div ref={districtMenuRef} className="max-w-7xl mx-auto w-full pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Naxçıvanın İnzibati Əraziləri (Kontekst Menyusu):
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold hidden sm:inline">
              Üzərinə gəlin və ya klikləyin
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {NAKHCHIVAN_DISTRICTS.map((d, dIdx) => {
              const distRec = districts.find((item) => item.name === d.name);
              const isSelected = selectedDistrictName === d.name;
              const isMenuOpen = openDistrictMenu === d.name || hoveredDistrict === d.name;

              return (
                <div
                  key={d.id}
                  className="relative"
                  onMouseEnter={() => setHoveredDistrict(d.name)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDistrictMenu(openDistrictMenu === d.name ? null : d.name);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm dark:bg-indigo-600 dark:border-indigo-500'
                        : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[11px] truncate">{d.name.replace(' rayonu', '').replace(' şəhəri', '')}</span>
                      <MoreVertical className={`w-3 h-3 ${isSelected ? 'text-slate-400' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                    </div>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/40 dark:border-slate-800">
                      <span className={`text-[10px] font-black ${isSelected ? 'text-emerald-300' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        {distRec && distRec.studentsCount > 0 ? `${distRec.overallScore}%` : '—'}
                      </span>
                      <span className={`text-[9px] font-black px-1 rounded ${
                        distRec && distRec.studentsCount > 0
                          ? isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {distRec && distRec.studentsCount > 0 ? `#${distRec.nmrRank}` : '0 şagird'}
                      </span>
                    </div>
                  </button>

                  {/* Kontekst Menyu Pəncərəsi (Hover və ya Klik) */}
                  {isMenuOpen && (
                    <div
                      className={`absolute top-full ${dIdx >= 4 ? 'right-0' : 'left-0'} mt-1 z-50 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 animate-in fade-in zoom-in-95 duration-150`}
                      onMouseEnter={() => setHoveredDistrict(d.name)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                    >
                      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <span className="text-[10px] font-black text-slate-900 dark:text-white block truncate">{d.name}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block">
                          {distRec ? `${distRec.studentsCount} şagird • ${distRec.schoolsCount} məktəb` : 'Məlumat yoxdur'}
                        </span>
                      </div>

                      {/* 1. Rayon məktəbləri */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDistrictName(d.name);
                          setSchoolFilterDistrict(d.name);
                          setActiveTab('stage2_schools');
                          setOpenDistrictMenu(null);
                          setHoveredDistrict(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-xl font-bold transition-colors text-left cursor-pointer"
                      >
                        <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Rayon məktəbləri</span>
                      </button>

                      {/* 2. Rayon üzrə şagird reytinqi */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDistrictName(d.name);
                          const fSchool = schools.find((s) => s.district === d.name);
                          if (fSchool) setSelectedSchoolName(fSchool.name);
                          setActiveTab('stage1_students');
                          setOpenDistrictMenu(null);
                          setHoveredDistrict(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/80 rounded-xl font-bold transition-colors text-left cursor-pointer"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Rayon üzrə şagird reytinqi</span>
                      </button>

                      {/* 3. Məktəblərarası reytinq */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDistrictName(d.name);
                          setActiveTab('stage2_schools');
                          setOpenDistrictMenu(null);
                          setHoveredDistrict(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:text-amber-600 hover:bg-amber-50/80 rounded-xl font-bold transition-colors text-left cursor-pointer"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Məktəblərarası reytinq</span>
                      </button>

                      {/* 4. Rayon statistikası */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDistrictName(d.name);
                          setActiveTab('district_profile');
                          setOpenDistrictMenu(null);
                          setHoveredDistrict(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:text-teal-600 hover:bg-teal-50/80 rounded-xl font-bold transition-colors text-left cursor-pointer"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Rayon statistikası</span>
                      </button>

                      {/* 5. Rayonlararası müqayisə */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDistrictName(d.name);
                          setActiveTab('stage3_districts');
                          setOpenDistrictMenu(null);
                          setHoveredDistrict(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:text-purple-600 hover:bg-purple-50/80 rounded-xl font-bold transition-colors text-left cursor-pointer border-t border-slate-100 mt-0.5 pt-1.5"
                      >
                        <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>Rayonlararası müqayisə</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ==============================================================
            2. ƏSAS REYTİNQ NAVİQASİYA MENYUSU (KOMPAKT VƏ İNCƏ CİZGİLİ)
            Sıralama: 1-ci Mərhələ -> 2-ci Mərhələ -> 3-cü Mərhələ -> Rayon Statistikası -> Əlavə Funksiyalar
            ============================================================== */}
        <div className="max-w-7xl mx-auto w-full pt-3 mt-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-1 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              {[
                { id: 'stage1_students', badge: '1', label: '1-ci Mərhələ: Şagirdlər', icon: GraduationCap },
                { id: 'stage2_schools', badge: '2', label: '2-ci Mərhələ: Məktəblər', icon: School },
                { id: 'stage3_districts', badge: '3', label: '3-cü Mərhələ: Rayonlar', icon: Award },
                { id: 'district_profile', label: 'Rayon Statistikası', icon: Building2 },
                { id: 'grade_results', label: 'Siniflər (IV-XI)', icon: BookOpen },
                { id: 'subject_results', label: 'Fənlər Üzrə', icon: Target },
                { id: 'monitoring_dynamics', label: 'İnkişaf Dinamikası', icon: TrendingUp },
                ...(user.role === 'admin'
                  ? [{ id: 'admin_schools', label: 'Məktəblər Reyestri', icon: ShieldCheck }]
                  : [])
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as RegionalNavTab)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs dark:bg-indigo-600 dark:border-indigo-500'
                        : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200/70 hover:border-slate-300 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/60'
                    }`}
                  >
                    {tab.badge ? (
                      <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200/90 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                      }`}>
                        {tab.badge}
                      </span>
                    ) : (
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    )}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================
          3. ƏSAS MƏZMUN SAHƏSİ
          ============================================================== */}
      <div className="p-4 sm:p-6 flex flex-col gap-6 max-w-7xl w-full mx-auto flex-1">

        {/* TƏLƏB 7 & 8: REYTİNQ MƏNBƏ VƏ SİNİF AYRILIĞI ZOLAĞI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              Reytinq Mənbəyi:
            </span>
            <button
              type="button"
              onClick={() => setSourceFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sourceFilter === 'all'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Bütün Nəticələr
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('atroq')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                sourceFilter === 'atroq'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ATROQ Testlərinin Reytinqi</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('ministry')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                sourceFilter === 'ministry'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Nazirliyin Monitorinq Reytinqi</span>
            </button>
          </div>

          {/* 9-cu və 11-ci Sinif Monitorinq Ayrılığı */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 uppercase">Monitorinq Sinfi:</span>
            <button
              type="button"
              onClick={() => setMonitoringGradeFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                monitoringGradeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Bütün
            </button>
            <button
              type="button"
              onClick={() => setMonitoringGradeFilter('9')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                monitoringGradeFilter === '9'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
              }`}
            >
              9-cu Sinif
            </button>
            <button
              type="button"
              onClick={() => setMonitoringGradeFilter('11')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                monitoringGradeFilter === '11'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
              }`}
            >
              11-ci Sinif
            </button>
          </div>
        </div>

        {/* Real Data Notice Banner (Tələb 7: Real baza əsasında) */}
        {overview.totalStudents === 0 && (
          <div className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-2xl flex items-start gap-3 text-left animate-in fade-in">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">
                ATROQ Education Canlı Reytinq Sistemi: Yalnız Faktiki İmtahan Nəticələrinə Əsaslanır
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Bu sistemdə demo və ya uydurma nəticələr göstərilmir. Şagirdlər ATROQ Education platformasında qeydiyyatdan keçərək (Rayon, Məktəb, Sinif və 7 rəqəmli UTİS kodu ilə) test və imtahanlarda iştirak etdikdə, onların topladıqları real ballar əsasında həm şagird, həm məktəblərarası, həm də rayonlararası reytinqlər burada canlı və avtomatik formalaşacaqdır.
              </p>
            </div>
          </div>
        )}

        {/* ==============================================================
            MƏRHƏLƏ 3: RAYONLARARASI REYTİNQ VƏ MÜQAYİSƏ DİAQRAMI (Tələb 5 & 6)
            ============================================================== */}
        {activeTab === 'stage3_districts' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Üst Xülasə Zolağı */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">İştirakçı Şagirdlər</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{overview.totalStudents} şagird</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-bold mt-2 inline-block">
                  {overview.totalStudents > 0 ? 'Faktiki test verənlər' : 'Məlumat yoxdur'}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">İştirakçı Məktəblər</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{overview.totalSchools} məktəb</span>
                <span className="text-[10px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded font-bold mt-2 inline-block">
                  {regionalData.participatingSchoolsCount} iştirakçı məktəb
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-br from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20 shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">Naxçıvan MR Orta Nəticə</span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                  {overview.totalStudents > 0 ? `${overview.overallAverage}%` : 'Məlumat yoxdur'}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2 block">
                  Bütün iştirakçıların ədədi ortası
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Lider Rayon (1-ci Yer)</span>
                <span className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate block">
                  {overview.totalStudents > 0 ? `1. ${overview.topDistrict.name} (${overview.topDistrict.score}%)` : 'Məlumat yoxdur'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-2 block">
                  Faktiki nəticələrə görə
                </span>
              </div>
            </div>

            {/* Rayonlararası Reytinq Cədvəli (Tələb 5) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    Naxçıvan MR Rayonlarının Ümumi Reytinq Cədvəli (Tələb 5)
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Orta Nəticə və Müvəffəqiyyət Faizlərinə Əsasən Sıralanır
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-3 text-center w-14">Reytinq</th>
                      <th className="py-3 px-4">Rayon / Şəhər</th>
                      <th className="py-3 px-3 text-center">İştirakçı Məktəb</th>
                      <th className="py-3 px-3 text-center">İştirakçı Şagird</th>
                      <th className="py-3 px-3 text-center">Test Sayı</th>
                      <th className="py-3 px-3 text-center">Ümumi Bal</th>
                      <th className="py-3 px-4 text-center">Orta Nəticə</th>
                      <th className="py-3 px-3 text-center">Müvəffəqiyyət %</th>
                      <th className="py-3 px-4">Lider Məktəb</th>
                      <th className="py-3 px-3 text-center">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {districts.map((dist) => (
                      <tr key={dist.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black text-xs ${
                            dist.studentsCount > 0 && dist.nmrRank === 1 ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700' :
                            dist.studentsCount > 0 && dist.nmrRank === 2 ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' :
                            dist.studentsCount > 0 && dist.nmrRank === 3 ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {dist.studentsCount > 0 ? dist.nmrRank : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {dist.name}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400 font-semibold">
                          {dist.participatingSchoolsCount > 0 ? (
                            <span>{dist.participatingSchoolsCount} / {dist.schoolsCount} məktəb</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">0 / {dist.schoolsCount}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300 font-semibold">
                          {dist.studentsCount > 0 ? `${dist.studentsCount} nəfər` : <span className="text-slate-400 dark:text-slate-500">0</span>}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">
                          {dist.totalTestsTaken > 0 ? dist.totalTestsTaken : <span className="text-slate-400 dark:text-slate-500">0</span>}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-800 dark:text-slate-200 font-bold">
                          {dist.studentsCount > 0 ? dist.totalScore : <span className="text-slate-400 dark:text-slate-500">—</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-black text-sm ${dist.studentsCount > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {dist.studentsCount > 0 ? `${dist.overallScore}%` : 'Məlumat yoxdur'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`font-bold ${dist.studentsCount > 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {dist.studentsCount > 0 ? `${dist.successRate}%` : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                          {dist.studentsCount > 0 ? (
                            <><strong>{dist.topSchool.name}</strong> ({dist.topSchool.score}%)</>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">Məlumat yoxdur</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDistrictName(dist.name);
                              setActiveTab('stage2_schools');
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Məktəblər</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TƏLƏB 6: RAYONLAR ÜZRƏ VİZUAL MÜQAYİSƏ DİAQRAMI (KOMPAKT, MODERN VƏ RƏNGLİ) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      Rayonlar Üzrə Vizual Müqayisə Diaqramı (Tələb 6)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hər rayon üçün fərdi rəng qradiyenti ilə müqayisəli reytinq göstəriciləri
                    </p>
                  </div>
                </div>

                {/* Diaqram Metrik Seçimi - Kompakt Pill Menyu */}
                <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
                  <button
                    type="button"
                    onClick={() => setChartMetric('overall')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chartMetric === 'overall'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Orta Nəticə (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('success')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chartMetric === 'success'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Müvəffəqiyyət %
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('students')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chartMetric === 'students'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Şagird Sayı
                  </button>
                </div>
              </div>

              {/* Kompakt Modern Diaqram Sahəsi (Arxa fon qrafik xətləri və 8 rəngli sütun) */}
              {(() => {
                const maxStudentVal = Math.max(...districts.map(x => x.studentsCount), 10);
                return (
                  <div className="relative pt-3 pb-1">
                    {/* Arxa fon zərif səviyyə xətləri */}
                    <div className="absolute inset-x-1 sm:inset-x-3 top-7 bottom-12 flex flex-col justify-between pointer-events-none opacity-40">
                      <div className="w-full border-b border-dashed border-slate-200 dark:border-slate-700 flex justify-end">
                        <span className="text-[8px] font-bold text-slate-400 -mt-2 bg-white dark:bg-slate-900 px-1">
                          {chartMetric === 'students' ? maxStudentVal : '100%'}
                        </span>
                      </div>
                      <div className="w-full border-b border-dashed border-slate-200 dark:border-slate-700 flex justify-end">
                        <span className="text-[8px] font-bold text-slate-400 -mt-2 bg-white dark:bg-slate-900 px-1">
                          {chartMetric === 'students' ? Math.round(maxStudentVal * 0.75) : '75%'}
                        </span>
                      </div>
                      <div className="w-full border-b border-dashed border-slate-200 dark:border-slate-700 flex justify-end">
                        <span className="text-[8px] font-bold text-slate-400 -mt-2 bg-white dark:bg-slate-900 px-1">
                          {chartMetric === 'students' ? Math.round(maxStudentVal * 0.5) : '50%'}
                        </span>
                      </div>
                      <div className="w-full border-b border-dashed border-slate-200 dark:border-slate-700 flex justify-end">
                        <span className="text-[8px] font-bold text-slate-400 -mt-2 bg-white dark:bg-slate-900 px-1">
                          {chartMetric === 'students' ? Math.round(maxStudentVal * 0.25) : '25%'}
                        </span>
                      </div>
                    </div>

                    {/* Sütunlu Diaqram (Diaqramlar bir-birinə yaxın, müasir dizaynla) */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2.5 items-end min-h-[190px] sm:min-h-[210px] relative z-10">
                      {districts.map((d) => {
                        const isSelected = d.name === selectedDistrictName;
                        const theme = DISTRICT_THEMES[d.name] || DISTRICT_THEMES['Naxçıvan şəhəri'];

                        let val = 0;
                        let label = '—';

                        if (chartMetric === 'overall') {
                          val = d.studentsCount > 0 ? d.overallScore : 0;
                          label = d.studentsCount > 0 ? `${d.overallScore}%` : '—';
                        } else if (chartMetric === 'success') {
                          val = d.studentsCount > 0 ? d.successRate : 0;
                          label = d.studentsCount > 0 ? `${d.successRate}%` : '—';
                        } else {
                          val = d.studentsCount;
                          label = `${d.studentsCount}`;
                        }

                        // Bar height percentage inside track
                        const barPct = chartMetric === 'students'
                          ? (val > 0 ? Math.max(12, Math.min(100, (val / maxStudentVal) * 100)) : 0)
                          : (val > 0 ? Math.max(10, Math.min(100, val)) : 0);

                        return (
                          <div
                            key={d.id}
                            onClick={() => setSelectedDistrictName(d.name)}
                            className={`flex flex-col items-center gap-1 h-full justify-end cursor-pointer group select-none p-1 rounded-xl transition-all ${
                              isSelected ? 'bg-slate-100/70 dark:bg-slate-800/80 ring-1 ring-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            {/* Üst Dəyər Göstəricisi */}
                            <span className={`text-[10px] sm:text-[11px] transition-all ${
                              isSelected
                                ? `font-black px-1.5 py-0.5 rounded-md ${theme.badgeBg} shadow-xs scale-105`
                                : 'font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                            }`}>
                              {label}
                            </span>

                            {/* Sütun Zolağı (Kompakt və Zərif Track, Bir-birinə yaxın) */}
                            <div className={`w-full max-w-[36px] sm:max-w-[44px] h-24 sm:h-28 bg-slate-100/80 dark:bg-slate-800/60 rounded-t-xl p-0.5 flex items-end justify-center relative transition-all group-hover:bg-slate-200/60 ${
                              isSelected ? 'bg-slate-200/70 dark:bg-slate-800' : ''
                            }`}>
                              {/* Rəngli Qradiyent Sütun */}
                              <div
                                className={`w-full rounded-t-lg transition-all duration-500 ease-out relative shadow-sm bg-gradient-to-t ${theme.gradient} ${
                                  isSelected
                                    ? `ring-2 ${theme.borderColor} ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md ${theme.glow} scale-x-105`
                                    : 'opacity-90 group-hover:opacity-100 group-hover:scale-y-[1.02]'
                                }`}
                                style={{ height: `${barPct}%` }}
                              >
                                {/* Şüşə parıltı effekti (Gloss overlay) */}
                                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-lg pointer-events-none" />
                              </div>
                            </div>

                            {/* Alt Rayon Adı və Reytinq */}
                            <div className="flex flex-col items-center gap-0.5 w-full mt-0.5">
                              <span className={`text-[8.5px] font-black px-1 rounded-sm ${
                                d.nmrRank === 1 && d.studentsCount > 0
                                  ? 'bg-amber-400 text-amber-950 font-black'
                                  : d.nmrRank === 2 && d.studentsCount > 0
                                  ? 'bg-slate-300 text-slate-800'
                                  : d.nmrRank === 3 && d.studentsCount > 0
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'text-slate-400'
                              }`}>
                                {d.studentsCount > 0 ? `#${d.nmrRank}` : '—'}
                              </span>
                              <span className={`text-[10px] sm:text-[11px] font-bold text-center truncate max-w-full px-0.5 transition-colors ${
                                isSelected ? `${theme.textColor} font-black` : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900'
                              }`}>
                                {d.name.replace(' rayonu', '').replace(' şəhəri', '')}
                              </span>
                            </div>

                            {/* TƏLƏB 3: Diaqramın altında şagird sayı, məktəb sayı, orta bal və müvəffəqiyyət faizi kompakt şəkildə */}
                            <div className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/80 rounded-lg p-1 text-[8.5px] leading-tight flex flex-col gap-0.5 mt-0.5">
                              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                <span>Şagird:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{d.studentsCount}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                <span>Məktəb:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{d.schoolsCount}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                <span>Orta:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{d.studentsCount > 0 ? `${d.overallScore}%` : '—'}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                <span>Müvəff.:</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{d.studentsCount > 0 ? `${d.successRate}%` : '—'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Seçilmiş Rayonun Göstəricilər Kartı (Modern Kompakt Qradiyentli) */}
              {(() => {
                const activeTheme = DISTRICT_THEMES[currentDistrictRecord.name] || DISTRICT_THEMES['Naxçıvan şəhəri'];
                return (
                  <div className={`mt-1 p-3 sm:p-4 rounded-2xl border transition-all ${activeTheme.softBg} ${activeTheme.borderColor} border-opacity-40 flex flex-wrap items-center justify-between gap-3 shadow-2xs`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${activeTheme.gradient} text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md ${activeTheme.glow}`}>
                        {currentDistrictRecord.studentsCount > 0 ? `#${currentDistrictRecord.nmrRank}` : '—'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{currentDistrictRecord.name}</h4>
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${activeTheme.badgeBg}`}>
                            {currentDistrictRecord.studentsCount > 0 ? `${currentDistrictRecord.nmrRank}-ci Yer` : 'Məlumat gözlənilir'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          Rayon mərkəzi: {NAKHCHIVAN_DISTRICTS.find(x => x.name === currentDistrictRecord.name)?.center || 'Naxçıvan'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs font-bold">
                      <div className="bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Şagird</span>
                        <span className="text-slate-900 dark:text-white font-black text-xs sm:text-sm">{currentDistrictRecord.studentsCount}</span>
                      </div>
                      <div className="bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Məktəb</span>
                        <span className="text-slate-900 dark:text-white font-black text-xs sm:text-sm">{currentDistrictRecord.schoolsCount}</span>
                      </div>
                      <div className="bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Orta Bal</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-black text-xs sm:text-sm">
                          {currentDistrictRecord.studentsCount > 0 ? `${currentDistrictRecord.overallScore}%` : '—'}
                        </span>
                      </div>
                      <div className="bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Müvəffəqiyyət</span>
                        <span className="text-indigo-700 dark:text-indigo-400 font-black text-xs sm:text-sm">
                          {currentDistrictRecord.studentsCount > 0 ? `${currentDistrictRecord.successRate}%` : '—'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDistrictName(currentDistrictRecord.name);
                        setSchoolFilterDistrict(currentDistrictRecord.name);
                        setActiveTab('stage2_schools');
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <span>2-ci Mərhələyə Keç (Məktəblər)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ==============================================================
            MƏRHƏLƏ 2: RAYONUN MƏKTƏBLƏRİ ARASINDA REYTİNQ (Tələb 4)
            ============================================================== */}
        {activeTab === 'stage2_schools' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Rayon Seçici & Axtarış Zolağı */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    2-ci Mərhələ: {selectedDistrictName} Məktəblərinin Reytinqi
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Məktəbi seçərək həmin məktəbin şagirdlərinin fərdi reytinqinə (1-ci Mərhələ) daxil olun
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Rayon:</span>
                <select
                  value={selectedDistrictName}
                  onChange={(e) => setSelectedDistrictName(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {NAKHCHIVAN_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Məktəb adı ilə axtar..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-600 w-48"
                  />
                </div>
              </div>
            </div>

            {/* Məktəblərarası Reytinq Cədvəli (Tələb 4) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                  {selectedDistrictName} Məktəbləri ({intraDistrictSchools.length} Məktəb)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Məktəbə klik edərək onun şagird reytinqini aça bilərsiniz
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-3 text-center w-14">Sıra</th>
                      <th className="py-3 px-3.5">Məktəbin Rəsmi Adı</th>
                      <th className="py-3 px-3 text-center">UTİS Kodu</th>
                      <th className="py-3 px-3 text-center">İştirakçı Şagird</th>
                      <th className="py-3 px-3 text-center">Test Sayı</th>
                      <th className="py-3 px-3 text-center">Ümumi Bal</th>
                      <th className="py-3 px-3 text-center">Orta Bal %</th>
                      <th className="py-3 px-3 text-center">Müvəffəqiyyət %</th>
                      <th className="py-3 px-3 text-center">NMR Sırası</th>
                      <th className="py-3 px-3 text-center">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {intraDistrictSchools
                      .filter((s) => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((sch, idx) => (
                        <tr key={sch.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black text-xs ${
                              sch.studentsCount > 0 && sch.districtRank === 1 ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' :
                              sch.studentsCount > 0 && sch.districtRank <= 3 ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}>
                              {sch.studentsCount > 0 ? sch.districtRank || idx + 1 : '—'}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                            {sch.name}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {sch.utisCode || '700xxxx'}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300">
                            {sch.studentsCount > 0 ? `${sch.studentsCount} şagird` : <span className="text-slate-400 dark:text-slate-500 font-semibold">0 şagird</span>}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400">
                            {sch.totalTestsTaken > 0 ? sch.totalTestsTaken : <span className="text-slate-400 dark:text-slate-500">0</span>}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-800 dark:text-slate-200 font-bold">
                            {sch.studentsCount > 0 ? sch.totalScore : <span className="text-slate-400 dark:text-slate-500">—</span>}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`font-black text-sm ${sch.studentsCount > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                              {sch.studentsCount > 0 ? `${sch.overallScore}%` : 'Məlumat yoxdur'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`font-bold ${sch.studentsCount > 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                              {sch.studentsCount > 0 ? `${sch.successRate}%` : '—'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                            {sch.studentsCount > 0 ? `#${sch.nmrRank}` : '—'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* 1-ci Mərhələyə Keçid Düyməsi (Tələb 4: Məktəb seçildikdə şagird reytinqi açılsın) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDistrictName(sch.district);
                                  setSelectedSchoolName(sch.name);
                                  setActiveTab('stage1_students');
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                                title="Bu məktəbin şagird reytinqini aç"
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Şagird Reytinqi</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setModalSchool(sch)}
                                className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              >
                                Ətraflı
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            MƏRHƏLƏ 1: ÖZ MƏKTƏBİMİZ DAXİLİNDƏ ŞAGİRD REYTİNQİ (Tələb 3)
            ============================================================== */}
        {activeTab === 'stage1_students' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Naviqasiya & Məktəb Seçici */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      1-ci Mərhələ: Məktəb Daxilində Şagird Reytinqi (Tələb 3)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedDistrictName} • {selectedSchoolName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveTab('stage2_schools')}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Məktəblər Cədvəlinə Qayıt</span>
                  </button>
                </div>
              </div>

              {/* Məktəb, Sinif və Axtarış Filtrləri */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Rayon:</label>
                  <select
                    value={selectedDistrictName}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      setSelectedDistrictName(newDist);
                      const fSchool = schools.find((s) => s.district === newDist);
                      if (fSchool) setSelectedSchoolName(fSchool.name);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {NAKHCHIVAN_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Məktəb:</label>
                  <select
                    value={selectedSchoolName}
                    onChange={(e) => setSelectedSchoolName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {districtSchools.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.studentsCount > 0 ? `(${s.studentsCount} şagird)` : '(0 iştirakçı)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Sinif:</label>
                  <select
                    value={studentGradeFilter}
                    onChange={(e) => setStudentGradeFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="all">Bütün Siniflər (IV, VI, IX, XI)</option>
                    {MONITORING_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Məktəbin Şagird Reytinq Cədvəli (Tələb 3) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                    {selectedSchoolName} – Şagirdlərin Akademik Reytinqi ({schoolStudents.length} Şagird)
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Şagird adı və ya UTİS ilə axtar..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-600 w-56"
                  />
                </div>
              </div>

              {schoolStudents.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                  <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300">Məlumat yoxdur</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 max-w-md">
                    «{selectedSchoolName}» üzrə hələlik ATROQ Education sistemində imtahan nəticəsi qeydə alınmayıb.
                  </span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-3 px-3 text-center w-14">Sıra</th>
                        <th className="py-3 px-3.5">Şagirdin Adı və Soyadı</th>
                        <th className="py-3 px-3 text-center">Sinfi</th>
                        <th className="py-3 px-3 text-center">UTİS Kodu</th>
                        <th className="py-3 px-3 text-center">İştirak Etdiyi Testlər</th>
                        <th className="py-3 px-3 text-center">Topladığı Bal</th>
                        <th className="py-3 px-3 text-center">Orta Nəticə</th>
                        <th className="py-3 px-3 text-center">Düzgün Cavab %</th>
                        <th className="py-3 px-3 text-center">Reytinq Mövqeyi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {schoolStudents.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black text-xs ${
                              idx === 0 ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700' :
                              idx === 1 ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' :
                              idx === 2 ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              #{idx + 1}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-black flex items-center justify-center">
                                {st.firstName.charAt(0) || 'Ş'}
                              </div>
                              <span>{st.fullName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300 font-semibold">
                            {st.grade || '—'}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {st.utisCode || '—'}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300">
                            {st.testsCount} test
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                            {st.totalScore} bal
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-black text-sm text-emerald-700 dark:text-emerald-400">
                              {st.avgPercentage}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-black text-xs text-indigo-700 dark:text-indigo-400">
                              {st.accuracyPercentage}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Məktəb #{st.schoolRank || idx + 1}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==============================================================
            BÖLMƏ: RAYON STATİSTİKASI VƏ ANALİTİK PROFİLİ
            ============================================================== */}
        {activeTab === 'district_profile' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* 8 Rayon Seçim Düymələri */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-2">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Statistik Təhlil Üçün Rayon Seçin:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
                {NAKHCHIVAN_DISTRICTS.map((d) => {
                  const isSelected = selectedDistrictName === d.name;
                  const distRecord = districts.find(item => item.name === d.name);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDistrictName(d.name)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm ring-2 ring-slate-800'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="font-bold text-[11px] truncate">{d.name.replace(' rayonu', '').replace(' şəhəri', '')}</span>
                      <span className={`text-[11px] font-black mt-1 ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                        {distRecord && distRecord.studentsCount > 0 ? `${distRecord.overallScore}%` : 'Məlumat yoxdur'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seçilmiş Rayonun Təfərrüatlı Akademik Profili */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-xl flex items-center justify-center shadow-xs">
                    {currentDistrictRecord.studentsCount > 0 ? `#${currentDistrictRecord.nmrRank}` : '—'}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{currentDistrictRecord.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentDistrictRecord.studentsCount > 0 ? (
                        <>Naxçıvan MR üzrə reytinq mövqeyi: <strong>8 rayondan {currentDistrictRecord.nmrRank}-ci yer</strong></>
                      ) : (
                        <span className="text-slate-400">Bu rayon üzrə hələlik ATROQ Education imtahan nəticəsi qeydə alınmayıb</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-bold block uppercase">Rayon Üzrə Orta Nəticə</span>
                  <span className="text-3xl font-black text-emerald-700">
                    {currentDistrictRecord.studentsCount > 0 ? `${currentDistrictRecord.overallScore}%` : 'Məlumat yoxdur'}
                  </span>
                </div>
              </div>

              {/* Rayonun 6 Əsas Göstəricisi */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Şagird Sayı</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">{currentDistrictRecord.studentsCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Məktəb Sayı</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">{currentDistrictRecord.schoolsCount}</span>
                </div>
                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 text-center">
                  <span className="text-[10px] text-rose-700 font-bold block uppercase">Minimum %</span>
                  <span className="text-base font-black text-rose-950 mt-0.5 block">
                    {currentDistrictRecord.studentsCount > 0 ? `${currentDistrictRecord.minScore}%` : '—'}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase">Maksimum %</span>
                  <span className="text-base font-black text-emerald-950 mt-0.5 block">
                    {currentDistrictRecord.studentsCount > 0 ? `${currentDistrictRecord.maxScore}%` : '—'}
                  </span>
                </div>
                <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 col-span-2 text-left">
                  <span className="text-[10px] text-indigo-700 font-bold block uppercase">Lider və Sonuncu Məktəb</span>
                  {currentDistrictRecord.studentsCount > 0 ? (
                    <>
                      <div className="text-xs font-bold text-slate-800 truncate mt-0.5">Top: {currentDistrictRecord.topSchool.name} ({currentDistrictRecord.topSchool.score}%)</div>
                      <div className="text-[10px] text-slate-500 truncate">Son: {currentDistrictRecord.lowestSchool.name} ({currentDistrictRecord.lowestSchool.score}%)</div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-400 font-semibold mt-1">İmtahan iştirakçısı yoxdur</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            BÖLMƏ: SİNİFLƏR ÜZRƏ MONİTORİNQ NƏTİCƏLƏRİ (IV, VI, IX, XI)
            ============================================================== */}
        {activeTab === 'grade_results' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Sinif Seçici Düymələri */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Monitorinq Sinfi Seçin:
              </span>
              <div className="flex items-center gap-2">
                {MONITORING_GRADES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGrade(g)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedGrade === g
                        ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-800'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Seçilmiş Sinif Üzrə Rayonların Müqayisəsi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Sol: Cədvəl */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {selectedGrade} Üzrə Rayonların Göstəriciləri
                  </h3>
                  <span className="text-xs font-black text-indigo-700">
                    MR Ortası: {overview.totalStudents > 0 ? `${overview.gradeAverages[selectedGrade]}%` : '—'}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Rayon</th>
                        <th className="py-2.5 px-3 text-center">{selectedGrade} Orta %</th>
                        <th className="py-2.5 px-3 text-center">MR Fərqi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {districts.map((d) => {
                        const gScore = d.gradeScores[selectedGrade];
                        const diff = Number((gScore - overview.gradeAverages[selectedGrade]).toFixed(1));
                        return (
                          <tr key={d.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-900">{d.name}</td>
                            <td className="py-2.5 px-3 text-center font-black text-emerald-700 text-sm">
                              {d.studentsCount > 0 && gScore > 0 ? `${gScore}%` : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {d.studentsCount > 0 && gScore > 0 ? (
                                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                                  diff >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {diff >= 0 ? `+${diff}%` : `${diff}%`}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sağ: Bu Sinifdə Ən Yüksək Nəticə Göstərən Lider Məktəblər */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {selectedGrade} Üzrə Naxçıvanın Lider Məktəbləri
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">Top Məktəblər</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {schools.filter(s => s.studentsCount > 0 && s.gradeScores[selectedGrade] > 0).length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                      {selectedGrade} üzrə hələlik ATROQ Education imtahan nəticəsi qeydə alınmayıb
                    </div>
                  ) : (
                    [...schools]
                      .filter(s => s.studentsCount > 0 && s.gradeScores[selectedGrade] > 0)
                      .sort((a, b) => b.gradeScores[selectedGrade] - a.gradeScores[selectedGrade])
                      .slice(0, 8)
                      .map((s, idx) => (
                        <div key={s.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-black text-[10px] ${
                              idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              #{idx + 1}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block truncate max-w-[240px]">{s.name}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{s.district}</span>
                            </div>
                          </div>
                          <span className="text-sm font-black text-emerald-700">{s.gradeScores[selectedGrade]}%</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            BÖLMƏ: FƏNLƏR ÜZRƏ NƏTİCƏLƏR
            ============================================================== */}
        {activeTab === 'subject_results' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Step 1: Sinif Seçimi + Step 2: Fənn Seçimi */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                  Addım 1: Sinfi Seçin:
                </span>
                <div className="flex items-center gap-2">
                  {MONITORING_GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGrade(g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        selectedGrade === g
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                  Addım 2: Fənni Seçin:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {MONITORING_SUBJECTS.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSubject === sub
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fənn Göstəriciləri Kartı */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Naxçıvan MR Orta Nəticə</span>
                <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-1">
                  {overview.totalStudents > 0 && overview.subjectAverages[selectedSubject] ? `${overview.subjectAverages[selectedSubject]}%` : '—'}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{selectedGrade} • {selectedSubject}</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ən Yüksək Nəticəli Rayon</span>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                  {overview.totalStudents > 0 && districts[0]?.studentsCount > 0 ? (
                    `${districts[0]?.name} (${districts[0]?.subjectScores[selectedSubject] || 0}%)`
                  ) : (
                    '—'
                  )}
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">Fənn üzrə rayon birincisi</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ən Yüksək Nəticəli Məktəb</span>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
                  {overview.totalStudents > 0 && schools[0]?.studentsCount > 0 ? schools[0]?.name : '—'}
                </div>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {overview.totalStudents > 0 && schools[0]?.studentsCount > 0 ? `${schools[0]?.subjectScores[selectedSubject] || 0}% bal` : 'İştirakçı yoxdur'}
                </span>
              </div>
            </div>

            {/* Fənn Üzrə Rayonların Sıralama Cədvəli */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {selectedSubject} Üzrə Rayonların Sıralaması ({selectedGrade})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Sıra</th>
                      <th className="py-2.5 px-3">Rayon</th>
                      <th className="py-2.5 px-3 text-center">{selectedSubject} Ortalaması</th>
                      <th className="py-2.5 px-4">Qrafik Müqayisə</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[...districts]
                      .sort((a, b) => (b.subjectScores[selectedSubject] || 0) - (a.subjectScores[selectedSubject] || 0))
                      .map((d, idx) => {
                        const sVal = d.subjectScores[selectedSubject] || 0;
                        return (
                          <tr key={d.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-black w-12 text-slate-500">
                              {d.studentsCount > 0 && sVal > 0 ? `#${idx + 1}` : '—'}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{d.name}</td>
                            <td className="py-2.5 px-3 text-center font-black text-emerald-700 text-sm">
                              {d.studentsCount > 0 && sVal > 0 ? `${sVal}%` : '—'}
                            </td>
                            <td className="py-2.5 px-4 w-1/2">
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-indigo-600 h-full rounded-full"
                                  style={{ width: `${d.studentsCount > 0 ? sVal : 0}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            BÖLMƏ: MONİTORİNQLƏRİN MÜQAYİSƏSİ (DİNAMİKA)
            ============================================================== */}
        {activeTab === 'monitoring_dynamics' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    I, II və III Monitorinqlər Üzrə İnkişaf Dinamikası
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hər mərhələ üzrə artım və azalma faizlərinin müqayisəsi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {MONITORING_PERIODS.map((p) => (
                  <span key={p.id} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                    {p.title} ({p.date})
                  </span>
                ))}
              </div>
            </div>

            {/* Dinamika Cədvəli */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">Rayon / Şəhər</th>
                      <th className="py-3 px-3 text-center">I Monitorinq</th>
                      <th className="py-3 px-3 text-center">II Monitorinq</th>
                      <th className="py-3 px-3 text-center">III Monitorinq</th>
                      <th className="py-3 px-3 text-center">Ümumi Artım / Azalma</th>
                      <th className="py-3 px-4">İnkişaf Trayektoriyası</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {districts.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3.5 font-bold text-slate-900">{d.name}</td>
                        <td className="py-3 px-3 text-center text-slate-600 font-bold">
                          {d.studentsCount > 0 && d.dynamics.mon1 > 0 ? `${d.dynamics.mon1}%` : '—'}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 font-bold">
                          {d.studentsCount > 0 && d.dynamics.mon2 > 0 ? `${d.dynamics.mon2}%` : '—'}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-900 font-black text-sm">
                          {d.studentsCount > 0 && d.dynamics.mon3 > 0 ? `${d.dynamics.mon3}%` : '—'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {d.studentsCount > 0 && d.dynamics.changePct !== 0 ? (
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-black text-xs ${
                              d.dynamics.changePct >= 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {d.dynamics.changePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {d.dynamics.changePct >= 0 ? `+${d.dynamics.changePct}%` : `${d.dynamics.changePct}%`}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {d.studentsCount > 0 && d.dynamics.mon3 > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">Oktyabr</span>
                              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden flex">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${d.dynamics.mon3}%` }} />
                              </div>
                              <span className="text-[10px] text-slate-600 font-bold">Aprel</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">İmtahan nəticəsi yoxdur</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            ADMINISTRATOR ÜÇÜN: MƏKTƏBLƏRİN MƏRKƏZİ REYESTRİ
            ============================================================== */}
        {activeTab === 'admin_schools' && user.role === 'admin' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Yeni Məktəb Əlavə Etmə Formu */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Reyestrə Yeni Məktəb Əlavə Et (Mərkəzləşdirilmiş İdarəetmə)
                </h3>
              </div>

              {adminSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{adminSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateSchool} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Məktəbin Rəsmi Adı: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    placeholder="Məsələn: Culfa şəhər 4 nömrəli tam orta məktəb"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Rayon / Şəhər: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newSchoolDistrict}
                    onChange={(e) => setNewSchoolDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-none"
                  >
                    {NAKHCHIVAN_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    UTİS Məktəb Kodu:
                  </label>
                  <input
                    type="text"
                    maxLength={7}
                    value={newSchoolUtis}
                    onChange={(e) => setNewSchoolUtis(e.target.value.replace(/\D/g, ''))}
                    placeholder="7005018"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Məktəbi Reyestrə Daxil Et</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Mövcud Məktəblərin Siyahısı */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Mərkəzi Reyestrdəki Məktəblər ({schoolsList.length} Məktəb)
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Təkrar yaradılmaya icazə verilmir
                </span>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Məktəbin Adı</th>
                      <th className="py-2.5 px-3">Rayon</th>
                      <th className="py-2.5 px-3 text-center">UTİS Kodu</th>
                      <th className="py-2.5 px-3 text-center">Növü</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {schoolsList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{s.district}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500">{s.utis_code}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.type === 'lisey' ? 'Lisey' : 'Tam Orta'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Aktiv
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ==============================================================
          MƏKTƏB DETALLARI MODALI
          ============================================================== */}
      {modalSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 flex flex-col gap-4 border border-slate-200">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {modalSchool.district} • {modalSchool.studentsCount > 0 ? `Reytinq #${modalSchool.nmrRank}` : 'İştirak etməyib'}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{modalSchool.name}</h3>
                <span className="text-xs text-slate-500 font-mono">UTİS: {modalSchool.utisCode || '700xxxx'}</span>
              </div>
              <button
                type="button"
                onClick={() => setModalSchool(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Məktəbin Orta Bal və KPI-ları */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">İştirakçı</span>
                <span className="text-base font-black text-slate-800">{modalSchool.studentsCount} şagird</span>
              </div>
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-bold block uppercase">Orta Bal %</span>
                <span className="text-lg font-black text-emerald-950">
                  {modalSchool.studentsCount > 0 ? `${modalSchool.overallScore}%` : '—'}
                </span>
              </div>
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200">
                <span className="text-[10px] text-indigo-700 font-bold block uppercase">Rayon Sırası</span>
                <span className="text-base font-black text-indigo-950">
                  {modalSchool.studentsCount > 0 ? `#${modalSchool.districtRank}` : '—'}
                </span>
              </div>
            </div>

            {/* Siniflər Üzrə Göstəricilər (IV, VI, IX, XI) */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                Monitorinq Sinifləri Üzrə Orta Göstəricilər:
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {MONITORING_GRADES.map((g) => (
                  <div key={g} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">{g}</span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block">
                      {modalSchool.studentsCount > 0 && modalSchool.gradeScores[g] > 0 ? `${modalSchool.gradeScores[g]}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fənlər Üzrə Göstəricilər */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                Əsas Fənlər Üzrə Nəticələr:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(modalSchool.subjectScores).map(([sub, score]) => (
                  <div key={sub} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-700 font-semibold truncate">{sub}</span>
                    <span className="font-black text-emerald-700">
                      {modalSchool.studentsCount > 0 && score > 0 ? `${score}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrictName(modalSchool.district);
                  setSelectedSchoolName(modalSchool.name);
                  setActiveTab('stage1_students');
                  setModalSchool(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Bu Məktəbin Şagird Reytinqini Aç</span>
              </button>

              <button
                type="button"
                onClick={() => setModalSchool(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
