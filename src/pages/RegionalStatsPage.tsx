// src/pages/RegionalStatsPage.tsx
// Naxçıvan Muxtar Respublikası Regional Təhsil Statistikası və Akademik Reytinq Modulu
import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import {
  NAKHCHIVAN_DISTRICTS,
  DISTRICT_SCHOOLS,
  MONITORING_GRADES,
  MONITORING_SUBJECTS,
  MONITORING_PERIODS,
  DistrictRecord,
  SchoolRecord,
  NmrOverviewStats,
  SchoolRecordItem,
  getAllSchools,
  saveSchool
} from '../lib/nakhchivanData';
import { calculateRegionalAnalytics, filterRegionalData } from '../lib/regionalAnalytics';
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
  CheckCircle2,
  Sparkles,
  School,
  X,
  SlidersHorizontal,
  PlusCircle,
  Edit2,
  Check,
  ShieldCheck
} from 'lucide-react';

interface RegionalStatsPageProps {
  user: User;
}

export type RegionalNavTab =
  | 'mr_overview'          // 1. Naxçıvan MR – ümumi statistika
  | 'district_rankings'    // 2. Rayonlar üzrə reytinq
  | 'school_rankings'      // 3. Məktəblər üzrə reytinq
  | 'intra_district'       // 4. Rayon daxilində məktəblərin müqayisəsi
  | 'inter_district'       // 5. Rayonlar arasında məktəblərin müqayisəsi
  | 'grade_results'        // 6. Siniflər üzrə monitorinq nəticələri (IV, VI, IX, XI)
  | 'subject_results'      // 7. Fənlər üzrə nəticələr
  | 'monitoring_dynamics'  // 8. Monitorinqlərin müqayisəsi
  | 'admin_schools';       // Məktəblərin Mərkəzi Reyestri (Admin)

export const RegionalStatsPage: React.FC<RegionalStatsPageProps> = ({ user }) => {
  // Active sub-tab state (8 distinct tabs as strictly requested in Tələb 7)
  const [activeTab, setActiveTab] = useState<RegionalNavTab>('mr_overview');

  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Naxçıvan şəhəri');
  const [selectedGrade, setSelectedGrade] = useState<string>('IV sinif');
  const [selectedSubject, setSelectedSubject] = useState<string>('Azərbaycan dili');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [schoolFilterDistrict, setSchoolFilterDistrict] = useState<string>('all');

  // Selected school detail modal
  const [modalSchool, setModalSchool] = useState<SchoolRecord | null>(null);

  // Inter-district comparison school selector (Tələb 11)
  const [comparedSchoolNames, setComparedSchoolNames] = useState<string[]>([
    'Heydər Əliyev adına Hərbi Lisey',
    'Ordubad şəhər 1 nömrəli tam orta məktəb',
    'Q.Sadiqov adına Cəhri qəsəbə 2 №-li tam orta məktəb',
    'Şərur şəhər 1 nömrəli tam orta məktəb'
  ]);

  // Admin Central School Registry state (Tələb 3)
  const [schoolsList, setSchoolsList] = useState<SchoolRecordItem[]>(() => getAllSchools());
  const [newSchoolName, setNewSchoolName] = useState<string>('');
  const [newSchoolDistrict, setNewSchoolDistrict] = useState<string>('Naxçıvan şəhəri');
  const [newSchoolUtis, setNewSchoolUtis] = useState<string>('');
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string>('');

  // Pure data from real EDUNEX test sessions (No simulated/fake numbers: Tələb 14 & 17)
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

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

  // Compute strictly from verified EDUNEX test completions
  const regionalData = useMemo(() => calculateRegionalAnalytics(liveSessions), [liveSessions]);
  const districts = regionalData.districts;
  const schools = regionalData.schools;
  const overview = regionalData.overview;

  // Filtered schools for Tab 3 (Məktəblər üzrə reytinq)
  const filteredSchools = useMemo(() => {
    return filterRegionalData(schools, {
      district: schoolFilterDistrict,
      searchQuery
    });
  }, [schools, schoolFilterDistrict, searchQuery]);

  // Active district for Tab 2 & Tab 4
  const currentDistrictRecord = useMemo(() => {
    return districts.find((d) => d.name === selectedDistrictName) || districts[0];
  }, [districts, selectedDistrictName]);

  // Intra-district schools for Tab 4
  const intraDistrictSchools = useMemo(() => {
    return schools
      .filter((s) => s.district === selectedDistrictName)
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [schools, selectedDistrictName]);

  // Inter-district compared schools for Tab 5
  const comparedSchools = useMemo(() => {
    return schools.filter((s) => comparedSchoolNames.includes(s.name));
  }, [schools, comparedSchoolNames]);

  // Handle Excel Export (Tələb 16)
  const handleExportExcel = () => {
    const periodLabel = selectedPeriod === 'all' ? 'Bütün Monitorinqlər' : selectedPeriod === 'mon_1' ? 'I Monitorinq' : selectedPeriod === 'mon_2' ? 'II Monitorinq' : 'III Monitorinq';
    exportRegionalStatsToExcel(districts, schools, periodLabel);
  };

  // Handle Print / PDF (Tələb 16)
  const handlePrint = () => {
    window.print();
  };

  // Admin create school handler (Tələb 3)
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
    <div className="w-full min-h-full flex flex-col bg-slate-50 font-sans">
      {/* ==============================================================
          1. YUXARI STATİSTİKA BAŞLIĞI VƏ ƏSAS İDARƏETMƏ ZOLAĞI
          ============================================================== */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 shrink-0 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                  Regional Statistika və Akademik Reytinq
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Naxçıvan MR
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  IV • VI • IX • XI Siniflər
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Naxçıvan Muxtar Respublikasının 8 rayon və şəhəri üzrə vahid akademik monitorinq və reytinq sistemi
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
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Çap et və ya PDF kimi saxla"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Çap / PDF</span>
            </button>
          </div>
        </div>

        {/* ==============================================================
            2. DƏQİQ 8 BÖLMƏLİ MENYU STRUKTURU (Tələb 7)
            ============================================================== */}
        <div className="max-w-7xl mx-auto w-full pt-4 mt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: 'mr_overview', label: '1. Naxçıvan MR – ümumi statistika', icon: Award },
              { id: 'district_rankings', label: '2. Rayonlar üzrə reytinq', icon: Building2 },
              { id: 'school_rankings', label: '3. Məktəblər üzrə reytinq', icon: School },
              { id: 'intra_district', label: '4. Rayon daxilində müqayisə', icon: BarChart3 },
              { id: 'inter_district', label: '5. Rayonlar arasında müqayisə', icon: Layers },
              { id: 'grade_results', label: '6. Siniflər üzrə monitorinq', icon: GraduationCap },
              { id: 'subject_results', label: '7. Fənlər üzrə nəticələr', icon: BookOpen },
              { id: 'monitoring_dynamics', label: '8. Monitorinqlərin müqayisəsi', icon: TrendingUp },
              ...(user.role === 'admin'
                ? [{ id: 'admin_schools', label: 'Məktəblərin Reyestri (Admin)', icon: ShieldCheck }]
                : [])
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as RegionalNavTab)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold tracking-tight shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-800'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==============================================================
          3. ƏSAS MƏZMUN SAHƏSİ (8 BÖLMƏ ÜZRƏ)
          ============================================================== */}
      <div className="p-4 sm:p-6 flex flex-col gap-6 max-w-7xl w-full mx-auto flex-1">

        {/* Real Data Notice Banner (Tələb 14 & 17) */}
        {overview.totalStudents === 0 && (
          <div className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-2xl flex items-start gap-3 text-left animate-in fade-in">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">
                EDUNEX Qeydiyyat Sistemi: Hələlik Canlı İmtahan İştirakçısı Qeydə Alınmayıb
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Bu sistemdə heç bir süni və ya uydurma demo rəqəmlər göstərilmir. Şagirdlər test linki vasitəsilə qeydiyyatdan keçib (Ad, Soyad, Rayon, Məktəb, Sinif və UTİS kodunu təsdiqləyərək) imtahanı bitirdikdə, onların faktiki test nəticələri əsasında regional reytinq cədvəli və diaqramlar burada avtomatik hesablanacaq və canlı formalaşacaqdır.
              </p>
            </div>
          </div>
        )}

        {/* ==============================================================
            BÖLMƏ 1: NAXÇIVAN MR – ÜMUMİ STATİSTİKA (Tələb 8)
            ============================================================== */}
        {activeTab === 'mr_overview' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* KPI Kartları */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">İştirakçı Şagirdlər</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                  {overview.totalStudents.toLocaleString()} <span className="text-xs font-bold text-slate-500">şagird</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold mt-2 self-start">
                  {overview.totalStudents > 0 ? 'Faktiki imtahan iştirakçıları' : 'Hələlik iştirakçı yoxdur'}
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">İştirakçı Məktəblər</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                  {overview.totalSchools} <span className="text-xs font-bold text-slate-500">məktəb</span>
                </div>
                <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold mt-2 self-start">
                  Faktiki imtahan verən məktəblər
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Naxçıvan MR Orta Nəticə</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 flex items-baseline gap-1">
                  {overview.totalStudents > 0 ? `${overview.overallAverage}%` : '—'}
                </div>
                <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${overview.overallAverage}%` }} />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lider Rayon və Məktəb</span>
                <div className="mt-1">
                  {overview.totalStudents > 0 ? (
                    <>
                      <div className="text-sm font-black text-slate-900 truncate">1. {overview.topDistrict.name} ({overview.topDistrict.score}%)</div>
                      <div className="text-xs text-indigo-700 font-bold truncate mt-0.5">{overview.topSchool.name} ({overview.topSchool.score}%)</div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-400 font-bold">Hələlik nəticə yoxdur</div>
                  )}
                </div>
                <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold mt-2 self-start">
                  Faktiki nəticələr əsasında
                </span>
              </div>
            </div>

            {/* Min / Orta / Max Göstərici Zolağı */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-rose-50/70 border border-rose-200/80 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">Minimum Nəticə</span>
                  <div className="text-lg font-black text-rose-950 mt-0.5">{overview.totalStudents > 0 ? `${overview.minScore.score}%` : '—'}</div>
                  <div className="text-[10px] text-rose-800 truncate max-w-[200px]">{overview.minScore.school}</div>
                </div>
                <ArrowDownRight className="w-6 h-6 text-rose-600 shrink-0" />
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200/80 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Muxtar Respublika Ortalaması</span>
                  <div className="text-lg font-black text-indigo-950 mt-0.5">{overview.totalStudents > 0 ? `${overview.avgScore}%` : '—'}</div>
                  <div className="text-[10px] text-indigo-800">Faktiki imtahan verənlərin ədədi ortası</div>
                </div>
                <TrendingUp className="w-6 h-6 text-indigo-600 shrink-0" />
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Maksimum Nəticə</span>
                  <div className="text-lg font-black text-emerald-950 mt-0.5">{overview.totalStudents > 0 ? `${overview.maxScore.score}%` : '—'}</div>
                  <div className="text-[10px] text-emerald-800 truncate max-w-[200px]">{overview.maxScore.school}</div>
                </div>
                <ArrowUpRight className="w-6 h-6 text-emerald-600 shrink-0" />
              </div>
            </div>

            {/* Ümumi Reytinq Cədvəli (Tələb 8-dəki cədvəl tələbi) */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Naxçıvan MR Rayonlarının Ümumi Reytinq Cədvəli
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  8 İnzibati Ərazi • Faktiki Orta Faizə Görə Sıralanmışdır
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-700 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5 text-center w-14">Reytinq</th>
                      <th className="py-3 px-4">Rayon / Şəhər</th>
                      <th className="py-3 px-3 text-center">İştirakçı Sayı</th>
                      <th className="py-3 px-3 text-center">Məktəb Sayı</th>
                      <th className="py-3 px-4 text-center">Orta Nəticə</th>
                      <th className="py-3 px-3 text-center">Min %</th>
                      <th className="py-3 px-3 text-center">Max %</th>
                      <th className="py-3 px-4">Ən Yüksək Nəticəli Məktəb</th>
                      <th className="py-3 px-3 text-center">Dinamika</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {districts.map((dist) => (
                      <tr key={dist.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black text-xs ${
                            dist.nmrRank === 1 ? 'bg-amber-100 text-amber-800' :
                            dist.nmrRank === 2 ? 'bg-slate-200 text-slate-800' :
                            dist.nmrRank === 3 ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {dist.studentsCount > 0 ? dist.nmrRank : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {dist.name}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 font-semibold">
                          {dist.studentsCount} nəfər
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600">
                          {dist.schoolsCount} məktəb
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-black text-sm ${dist.studentsCount > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {dist.studentsCount > 0 ? `${dist.overallScore}%` : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-rose-700 font-bold">
                          {dist.studentsCount > 0 ? `${dist.minScore}%` : '—'}
                        </td>
                        <td className="py-3 px-3 text-center text-emerald-700 font-bold">
                          {dist.studentsCount > 0 ? `${dist.maxScore}%` : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-800 truncate max-w-[240px]">
                          {dist.studentsCount > 0 ? (
                            <><strong>{dist.topSchool.name}</strong> ({dist.topSchool.score}%)</>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">Hələlik iştirakçı yoxdur</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {dist.studentsCount > 0 ? (
                            <span className={`font-black text-[11px] px-2 py-0.5 rounded ${
                              dist.dynamics.changePct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {dist.dynamics.changePct >= 0 ? `+${dist.dynamics.changePct}%` : `${dist.dynamics.changePct}%`}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rayonların Müqayisəli Diaqramı */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Naxçıvan MR Rayonlarının Nəticə Diaqramı (Faiz Göstəricisi)
              </h3>
              <div className="flex flex-col gap-2.5 pt-2">
                {districts.map((dist) => (
                  <div key={dist.id} className="flex items-center gap-3 text-xs">
                    <span className="w-32 font-bold text-slate-800 truncate">{dist.name}</span>
                    <div className="flex-1 bg-slate-100 h-6 rounded-xl overflow-hidden relative flex items-center">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl transition-all duration-500"
                        style={{ width: `${dist.studentsCount > 0 ? dist.overallScore : 0}%` }}
                      />
                      <span className="absolute right-2 font-black text-xs text-slate-700">
                        {dist.studentsCount > 0 ? `${dist.overallScore}%` : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            BÖLMƏ 2: RAYONLAR ÜZRƏ REYTİNQ (Tələb 9)
            ============================================================== */}
        {activeTab === 'district_rankings' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* 8 Rayon Seçim Düymələri */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col gap-2">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Rayon Seçin (8 İnzibati Ərazi):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {NAKHCHIVAN_DISTRICTS.map((d) => {
                  const isSelected = selectedDistrictName === d.name;
                  const distRecord = districts.find(item => item.name === d.name);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDistrictName(d.name)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm ring-2 ring-slate-800'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate">{d.name}</span>
                        {distRecord && distRecord.studentsCount > 0 && (
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            #{distRecord.nmrRank}
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] font-black mt-1 ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                        {distRecord && distRecord.studentsCount > 0 ? `${distRecord.overallScore}%` : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seçilmiş Rayonun Təfərrüatlı Akademik Profili (Tələb 9) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-5">
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
                        <span className="text-slate-400">Bu rayon üzrə hələlik EDUNEX imtahan nəticəsi qeydə alınmayıb</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-bold block uppercase">Rayon Üzrə Orta Nəticə</span>
                  <span className="text-3xl font-black text-emerald-700">
                    {currentDistrictRecord.studentsCount > 0 ? `${currentDistrictRecord.overallScore}%` : '—'}
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

              {/* Rayonlararası Müqayisə Sütunlu Diaqramı (Tələb 9) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">
                <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Rayonlararası Müqayisə Diaqramı:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 items-end pt-4 min-h-[160px]">
                  {districts.map((d) => {
                    const isCur = d.name === currentDistrictRecord.name;
                    return (
                      <div key={d.id} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className={`text-[10px] font-black ${isCur ? 'text-indigo-600' : 'text-slate-600'}`}>
                          {d.studentsCount > 0 ? `${d.overallScore}%` : '—'}
                        </span>
                        <div
                          className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                            isCur ? 'bg-indigo-600' : 'bg-slate-300 hover:bg-slate-400'
                          }`}
                          style={{ height: `${Math.max(12, (d.studentsCount > 0 ? d.overallScore : 0) * 1.5)}px` }}
                        />
                        <span className="text-[9px] font-bold text-slate-600 text-center truncate max-w-full">{d.name.replace(' rayonu', '').replace(' şəhəri', '')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            BÖLMƏ 3: MƏKTƏBLƏR ÜZRƏ REYTİNQ (Tələb 10)
            ============================================================== */}
        {activeTab === 'school_rankings' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Filter & Search Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Məktəb adı, UTİS kodu və ya rayon üzrə axtar..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Rayon Filtri:</span>
                <select
                  value={schoolFilterDistrict}
                  onChange={(e) => setSchoolFilterDistrict(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                >
                  <option value="all">Bütün Rayonlar (Naxçıvan MR)</option>
                  {NAKHCHIVAN_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Məktəblər Reytinq Cədvəli */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Məktəblərin Böyük Akademik Reytinqi ({filteredSchools.length} Məktəb)
                </span>
                <span className="text-xs text-slate-500">
                  Şagirdlərin Faktiki Orta Bal Faizlərinə Əsasən Sıralanıb
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-700 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 text-center w-14">Sıra</th>
                      <th className="py-3 px-3.5">Məktəbin Rəsmi Adı</th>
                      <th className="py-3 px-3">Rayon</th>
                      <th className="py-3 px-3 text-center">UTİS Kodu</th>
                      <th className="py-3 px-3 text-center">İştirakçı</th>
                      <th className="py-3 px-3 text-center">Orta Bal %</th>
                      <th className="py-3 px-2.5 text-center">Min %</th>
                      <th className="py-3 px-2.5 text-center">Max %</th>
                      <th className="py-3 px-3 text-center">Dinamika</th>
                      <th className="py-3 px-3 text-center">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredSchools.map((sch) => (
                      <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-black text-xs ${
                            sch.studentsCount > 0 && sch.nmrRank === 1 ? 'bg-amber-100 text-amber-800' :
                            sch.studentsCount > 0 && sch.nmrRank <= 3 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {sch.studentsCount > 0 ? sch.nmrRank : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-900">
                          {sch.name}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-semibold">
                          {sch.district}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500">
                          {sch.utisCode || '700xxxx'}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700">
                          {sch.studentsCount > 0 ? `${sch.studentsCount} şagird` : <span className="text-slate-400 font-semibold">0 şagird</span>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`font-black text-sm ${sch.studentsCount > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {sch.studentsCount > 0 ? `${sch.overallScore}%` : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-2.5 text-center text-rose-700 font-bold">
                          {sch.studentsCount > 0 ? `${sch.minScore}%` : '—'}
                        </td>
                        <td className="py-3 px-2.5 text-center text-emerald-700 font-bold">
                          {sch.studentsCount > 0 ? `${sch.maxScore}%` : '—'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {sch.studentsCount > 0 ? (
                            <span className={`font-black text-[10px] px-1.5 py-0.2 rounded ${
                              sch.dynamics.changePct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {sch.dynamics.changePct >= 0 ? `+${sch.dynamics.changePct}%` : `${sch.dynamics.changePct}%`}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {sch.studentsCount > 0 ? (
                            <button
                              type="button"
                              onClick={() => setModalSchool(sch)}
                              className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              Ətraflı
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px] font-semibold">İştirak etməyib</span>
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
            BÖLMƏ 4: RAYON DAXİLİNDƏ MƏKTƏBLƏRİN MÜQAYİSƏSİ (Tələb 10)
            ============================================================== */}
        {activeTab === 'intra_district' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Rayon Seçici */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Müqayisə Ediləcək Rayonu Seçin:
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {NAKHCHIVAN_DISTRICTS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDistrictName(d.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDistrictName === d.name
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Rayon Daxili Sıralama Cədvəli və Sütunlu Diaqram */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Sol Tərəf: Cədvəl */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {selectedDistrictName} Üzrə Məktəblərin Sıralaması
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    {intraDistrictSchools.length} Məktəb
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-12">Yer</th>
                        <th className="py-2.5 px-3">Məktəb</th>
                        <th className="py-2.5 px-2 text-center">İştirakçı</th>
                        <th className="py-2.5 px-3 text-center">Orta %</th>
                        <th className="py-2.5 px-2 text-center">Min / Max</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {intraDistrictSchools.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-center font-black">
                            {s.studentsCount > 0 ? `#${s.districtRank || idx + 1}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 truncate max-w-[200px]">
                            {s.name}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-600">
                            {s.studentsCount}
                          </td>
                          <td className="py-2.5 px-3 text-center font-black text-emerald-700">
                            {s.studentsCount > 0 ? `${s.overallScore}%` : '—'}
                          </td>
                          <td className="py-2.5 px-2 text-center text-[11px] text-slate-500">
                            {s.studentsCount > 0 ? `${s.minScore}% - ${s.maxScore}%` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sağ Tərəf: Diaqram (Hər məktəbin nəticəsi diaqramda ayrıca sütunla) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Rayon Daxili Nəticə Zolaqları:
                </span>
                <div className="flex flex-col gap-2 pt-2">
                  {intraDistrictSchools.map((s) => (
                    <div key={s.id} className="flex flex-col gap-0.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span className="truncate max-w-[220px]">{s.name}</span>
                        <span className={`font-black ${s.studentsCount > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {s.studentsCount > 0 ? `${s.overallScore}%` : '—'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${s.studentsCount > 0 ? s.overallScore : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            BÖLMƏ 5: RAYONLAR ARASINDA MƏKTƏBLƏRİN MÜQAYİSƏSİ (Tələb 11)
            ============================================================== */}
        {activeTab === 'inter_district' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* School Multi-Selector Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Müqayisə Üçün Fərqli Rayonlardan Məktəblər Seçin:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {schools.slice(0, 16).map((sch) => {
                  const isChecked = comparedSchoolNames.includes(sch.name);
                  return (
                    <button
                      key={sch.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setComparedSchoolNames(prev => prev.filter(n => n !== sch.name));
                        } else {
                          setComparedSchoolNames(prev => [...prev, sch.name]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                      <span>{sch.name} ({sch.district.replace(' rayonu', '').replace(' şəhəri', '')})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Yan-yana Müqayisə Cədvəli (Orta %, İştirakçı, Min/Max, Siniflər, Fənlər) */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Seçilmiş Məktəblərin Çoxmeyarlı Müqayisəli Cədvəli
                </h3>
                <span className="text-xs font-bold text-indigo-700">
                  {comparedSchools.length} Məktəb Müqayisə Edilir
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Məktəb</th>
                      <th className="py-3 px-3">Rayon</th>
                      <th className="py-3 px-2 text-center">İştirakçı</th>
                      <th className="py-3 px-3 text-center">Orta Bal %</th>
                      <th className="py-3 px-2 text-center">Min %</th>
                      <th className="py-3 px-2 text-center">Max %</th>
                      <th className="py-3 px-2 text-center">IV Sinif</th>
                      <th className="py-3 px-2 text-center">VI Sinif</th>
                      <th className="py-3 px-2 text-center">IX Sinif</th>
                      <th className="py-3 px-2 text-center">XI Sinif</th>
                      <th className="py-3 px-3 text-center">Az. dili</th>
                      <th className="py-3 px-3 text-center">Riyaziyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {comparedSchools.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900 truncate max-w-[200px]">{s.name}</td>
                        <td className="py-3 px-3 text-slate-600">{s.district}</td>
                        <td className="py-3 px-2 text-center text-slate-700">{s.studentsCount}</td>
                        <td className="py-3 px-3 text-center font-black text-emerald-700 text-sm">
                          {s.studentsCount > 0 ? `${s.overallScore}%` : '—'}
                        </td>
                        <td className="py-3 px-2 text-center text-rose-700 font-bold">
                          {s.studentsCount > 0 ? `${s.minScore}%` : '—'}
                        </td>
                        <td className="py-3 px-2 text-center text-emerald-700 font-bold">
                          {s.studentsCount > 0 ? `${s.maxScore}%` : '—'}
                        </td>
                        <td className="py-3 px-2 text-center text-slate-800">
                          {s.studentsCount > 0 && s.gradeScores['IV sinif'] > 0 ? `${s.gradeScores['IV sinif']}%` : '—'}
                        </td>
                        <td className="py-3 px-2 text-center text-slate-800">
                          {s.studentsCount > 0 && s.gradeScores['VI sinif'] > 0 ? `${s.gradeScores['VI sinif']}%` : '—'}
                        </td>
                        <td className="py-3 px-2 text-center text-slate-800">
                          {s.studentsCount > 0 && s.gradeScores['IX sinif'] > 0 ? `${s.gradeScores['IX sinif']}%` : '—'}
                        </td>
                        <td className="py-3 px-2 text-center text-slate-800">
                          {s.studentsCount > 0 && s.gradeScores['XI sinif'] > 0 ? `${s.gradeScores['XI sinif']}%` : '—'}
                        </td>
                        <td className="py-3 px-3 text-center text-indigo-700 font-bold">
                          {s.studentsCount > 0 && s.subjectScores['Azərbaycan dili'] > 0 ? `${s.subjectScores['Azərbaycan dili']}%` : '—'}
                        </td>
                        <td className="py-3 px-3 text-center text-indigo-700 font-bold">
                          {s.studentsCount > 0 && s.subjectScores['Riyaziyyat'] > 0 ? `${s.subjectScores['Riyaziyyat']}%` : '—'}
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
            BÖLMƏ 6: SİNİFLƏR ÜZRƏ MONİTORİNQ NƏTİCƏLƏRİ (Tələb 12: YALNIZ IV, VI, IX, XI)
            ============================================================== */}
        {activeTab === 'grade_results' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Sinif Seçici Düymələri (Yalnız IV, VI, IX, XI) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Monitorinq Sinfi Seçin (Tələb 12):
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
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
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
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {selectedGrade} Üzrə Naxçıvanın Lider Məktəbləri
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">Top 8 Məktəb</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {schools.filter(s => s.studentsCount > 0 && s.gradeScores[selectedGrade] > 0).length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                      {selectedGrade} üzrə hələlik EDUNEX imtahan nəticəsi qeydə alınmayıb
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
            BÖLMƏ 7: FƏNLƏR ÜZRƏ NƏTİCƏLƏR (Tələb 13: Əvvəl Sinif, Sonra Fənn)
            ============================================================== */}
        {activeTab === 'subject_results' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Step 1: Sinif Seçimi + Step 2: Fənn Seçimi */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
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
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Naxçıvan MR Orta Nəticə</span>
                <div className="text-2xl font-black text-indigo-700 mt-1">
                  {overview.totalStudents > 0 && overview.subjectAverages[selectedSubject] ? `${overview.subjectAverages[selectedSubject]}%` : '—'}
                </div>
                <span className="text-[10px] text-slate-500 mt-1">{selectedGrade} • {selectedSubject}</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ən Yüksək Nəticəli Rayon</span>
                <div className="text-xl font-black text-emerald-700 mt-1">
                  {overview.totalStudents > 0 && districts[0]?.studentsCount > 0 ? (
                    `${districts[0]?.name} (${districts[0]?.subjectScores[selectedSubject] || 0}%)`
                  ) : (
                    '—'
                  )}
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1">Fənn üzrə rayon birincisi</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ən Yüksək Nəticəli Məktəb</span>
                <div className="text-sm font-black text-slate-900 mt-1 truncate">
                  {overview.totalStudents > 0 && schools[0]?.studentsCount > 0 ? schools[0]?.name : '—'}
                </div>
                <span className="text-xs font-black text-emerald-700 mt-0.5">
                  {overview.totalStudents > 0 && schools[0]?.studentsCount > 0 ? `${schools[0]?.subjectScores[selectedSubject] || 0}% bal` : 'İştirakçı yoxdur'}
                </span>
              </div>
            </div>

            {/* Fənn Üzrə Rayonların Sıralama Cədvəli */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
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
            BÖLMƏ 8: MONİTORİNQLƏRİN MÜQAYİSƏSİ (DİNAMİKA - Tələb 15)
            ============================================================== */}
        {activeTab === 'monitoring_dynamics' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
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
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
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
            ADMINISTRATOR ÜÇÜN: MƏKTƏBLƏRİN MƏRKƏZİ REYESTRİ (Tələb 3)
            ============================================================== */}
        {activeTab === 'admin_schools' && user.role === 'admin' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Yeni Məktəb Əlavə Etmə Formu */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
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
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
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

            <div className="pt-2 flex justify-end border-t border-slate-100">
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
