// src/pages/RegionalStatsPage.tsx
// Naxçıvan Muxtar Respublikası Regional Statistika və Akademik Reytinq Modulu
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
  NmrOverviewStats
} from '../lib/nakhchivanData';
import { generateBaselineRegionalData, filterRegionalData } from '../lib/regionalAnalytics';
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
  SlidersHorizontal
} from 'lucide-react';

interface RegionalStatsPageProps {
  user: User;
}

type RegionalTab =
  | 'overview'
  | 'districts'
  | 'schools'
  | 'grades'
  | 'subjects'
  | 'comparison'
  | 'dynamics';

export const RegionalStatsPage: React.FC<RegionalStatsPageProps> = ({ user: _user }) => {
  // Baseline authentic data
  const baseData = useMemo(() => generateBaselineRegionalData(), []);
  const [districts, setDistricts] = useState<DistrictRecord[]>(baseData.districts);
  const [schools, setSchools] = useState<SchoolRecord[]>(baseData.schools);
  const [overview, setOverview] = useState<NmrOverviewStats>(baseData.overview);

  // Active Tab state
  const [activeTab, setActiveTab] = useState<RegionalTab>('overview');

  // Filters state
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all'); // all, mon_1, mon_2, mon_3
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(NAKHCHIVAN_DISTRICTS[0].name);
  const [selectedGrade, setSelectedGrade] = useState<string>('IV sinif');
  const [selectedSubject, setSelectedSubject] = useState<string>(MONITORING_SUBJECTS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inter-district comparison multi-selected schools
  const [comparedSchoolNames, setComparedSchoolNames] = useState<string[]>([
    'Heydər Əliyev adına Hərbi Lisey',
    'Şərur şəhər 1 nömrəli tam orta məktəb',
    'Ordubad şəhər 1 nömrəli tam orta məktəb'
  ]);

  // Modal detailed school view
  const [viewingSchool, setViewingSchool] = useState<SchoolRecord | null>(null);

  // Sync any live database sessions into regional stats
  useEffect(() => {
    async function fetchLiveStats() {
      try {
        const live = await api.getRegionalStats();
        if (live && live.sessions && live.sessions.length > 0) {
          // If live sessions exist with district and school, integrate seamlessly
          const updatedSchools = [...baseData.schools];
          live.sessions.forEach((sess: any) => {
            if (sess.school && sess.district) {
              const found = updatedSchools.find(
                (s) => s.name === sess.school || s.name.toLowerCase() === sess.school.toLowerCase()
              );
              if (found) {
                found.studentsCount += 1;
                // incrementally update score
                found.overallScore = Number(
                  ((found.overallScore * (found.studentsCount - 1) + (sess.percentage || 75)) / found.studentsCount).toFixed(1)
                );
              }
            }
          });
          setSchools(updatedSchools);
        }
      } catch (e) {
        console.warn('Live regional data fetch fallback:', e);
      }
    }
    fetchLiveStats();
  }, [baseData]);

  // Filtered schools for the schools directory
  const filteredSchools = useMemo(() => {
    return filterRegionalData(schools, {
      district: selectedDistrictId === 'all_districts' ? 'all' : selectedDistrictId,
      searchQuery
    });
  }, [schools, selectedDistrictId, searchQuery]);

  // Active selected district record
  const currentDistrictRecord = useMemo(() => {
    return districts.find((d) => d.name === selectedDistrictId) || districts[0];
  }, [districts, selectedDistrictId]);

  // Schools of current selected district
  const districtSchools = useMemo(() => {
    return schools
      .filter((s) => s.district === currentDistrictRecord.name)
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [schools, currentDistrictRecord]);

  // Schools for inter-district comparison
  const comparedSchools = useMemo(() => {
    return schools.filter((s) => comparedSchoolNames.includes(s.name));
  }, [schools, comparedSchoolNames]);

  // Handle Excel Export
  const handleExportExcel = () => {
    const periodLabel = selectedPeriod === 'all' ? 'Bütün Monitorinqlər' : selectedPeriod === 'mon_1' ? 'I Monitorinq' : selectedPeriod === 'mon_2' ? 'II Monitorinq' : 'III Monitorinq';
    exportRegionalStatsToExcel(districts, schools, periodLabel);
  };

  // Handle Print / PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-slate-50">
      {/* 1. TOP HEADER BANNER (Naxçıvan MR Regional Akademik Reytinq) */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 shrink-0 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                Naxçıvan Muxtar Respublikasının 8 rayon və şəhəri üzrə monitorinq nəticələri və məktəblərin reytinqi
              </p>
            </div>
          </div>

          {/* Action buttons: Excel Export & PDF Print */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Statistika və reytinqi Excel (.xlsx) formatında yüklə"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel-ə ixrac</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Çap et və ya PDF kimi saxla"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Çap / PDF</span>
            </button>
          </div>
        </div>

        {/* 2. SUB-NAVIGATION TABS (7 BÖLMƏ - Tələb 3) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-4 mt-1 border-t border-slate-100">
          {[
            { id: 'overview', label: '1. Naxçıvan MR Ümumi', icon: Award },
            { id: 'districts', label: '2. Rayonlar üzrə', icon: Building2 },
            { id: 'schools', label: '3. Məktəblər üzrə', icon: School },
            { id: 'grades', label: '4. Siniflər (IV, VI, IX, XI)', icon: GraduationCap },
            { id: 'subjects', label: '5. Fənlər üzrə', icon: BookOpen },
            { id: 'comparison', label: '6. Reytinq və Müqayisə', icon: BarChart3 },
            { id: 'dynamics', label: '7. Nəticələrin Dinamikası', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as RegionalTab)}
                className={`px-3 py-2 rounded-xl text-xs font-bold tracking-tight shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
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

      {/* 3. MAIN TAB BODY CONTENT */}
      <div className="p-4 sm:p-6 flex flex-col gap-5 max-w-7xl w-full mx-auto">
        {/* ==============================================================
            TAB 1: NAXÇIVAN MR ÜZRƏ ÜMUMİ NƏTİCƏLƏR (Tələb 4 & 10)
            ============================================================== */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Top Stat KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">İştirakçı Şagirdlər</span>
                <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                  {overview.totalStudents} <span className="text-xs font-bold text-slate-500">nəfər</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold mt-2 inline-block">
                  8 rayon və şəhər
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">İştirakçı Məktəblər</span>
                <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                  {overview.totalSchools} <span className="text-xs font-bold text-slate-500">məktəb</span>
                </div>
                <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold mt-2 inline-block">
                  Tam orta və liseylər
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-800 block uppercase tracking-wider">Naxçıvan MR Orta Nəticə</span>
                <div className="text-2xl font-black text-emerald-700 mt-1 flex items-baseline gap-1">
                  {overview.overallAverage}%
                </div>
                <span className="text-[10px] text-emerald-700 font-bold mt-2 block">
                  IV, VI, IX və XI siniflər üzrə
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-gradient-to-br from-white to-indigo-50/40 shadow-2xs">
                <span className="text-[11px] font-bold text-indigo-800 block uppercase tracking-wider">Lider Rayon</span>
                <div className="text-lg font-black text-indigo-900 mt-1 truncate">
                  {overview.topDistrict.name}
                </div>
                <span className="text-[11px] font-black text-indigo-700 mt-1 block">
                  {overview.topDistrict.score}% nəticə ilə 1-ci yerdə
                </span>
              </div>
            </div>

            {/* Minimum, Orta və Maksimum Göstəricilər Kartları (Tələb 10) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Maksimum Nəticə
                  </span>
                  <span className="text-lg font-black text-emerald-700">{overview.maxScore.score}%</span>
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">{overview.maxScore.school}</p>
                <span className="text-[10px] text-slate-500 font-semibold">{overview.maxScore.district}</span>
              </div>

              <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                    Muxtar Respublika Orta
                  </span>
                  <span className="text-lg font-black text-indigo-700">{overview.avgScore}%</span>
                </div>
                <p className="text-xs font-bold text-slate-800">Bütün iştirakçı məktəblər üzrə</p>
                <span className="text-[10px] text-slate-500 font-semibold">Çəkili akademik orta göstərici</span>
              </div>

              <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    Minimum Nəticə
                  </span>
                  <span className="text-lg font-black text-amber-700">{overview.minScore.score}%</span>
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">{overview.minScore.school}</p>
                <span className="text-[10px] text-slate-500 font-semibold">{overview.minScore.district}</span>
              </div>
            </div>

            {/* Siniflər üzrə Naxçıvan MR Orta Nəticələri */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Monitorinq Sinifləri üzrə Muxtar Respublika Göstəriciləri
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MONITORING_GRADES.map((grade) => {
                  const score = overview.gradeAverages[grade] || 0;
                  return (
                    <div key={grade} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <span className="text-xs font-black text-slate-700">{grade}</span>
                      <div className="text-xl font-black text-indigo-700 my-1">{score}%</div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, score)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 8 Rayonun Reytinq Cədvəli */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Rayonların Akademik Reytinqi və Müqayisəsi
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">Faizə görə sıralanıb</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Sıra</th>
                      <th className="py-2.5 px-3">Rayon / Şəhər</th>
                      <th className="py-2.5 px-3 text-center">Məktəb</th>
                      <th className="py-2.5 px-3 text-center">Şagird</th>
                      <th className="py-2.5 px-3 text-center">IV sinif</th>
                      <th className="py-2.5 px-3 text-center">VI sinif</th>
                      <th className="py-2.5 px-3 text-center">IX sinif</th>
                      <th className="py-2.5 px-3 text-center">XI sinif</th>
                      <th className="py-2.5 px-3 text-center">Orta Nəticə</th>
                      <th className="py-2.5 px-3">Ən Yüksək Məktəb</th>
                      <th className="py-2.5 px-3 text-center w-16">Ətraflı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                    {districts.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-center font-black">
                          <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] text-white ${
                            d.nmrRank === 1 ? 'bg-amber-500' : d.nmrRank === 2 ? 'bg-slate-400' : d.nmrRank === 3 ? 'bg-amber-700' : 'bg-slate-700'
                          }`}>
                            {d.nmrRank}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{d.name}</td>
                        <td className="py-2.5 px-3 text-center">{d.schoolsCount}</td>
                        <td className="py-2.5 px-3 text-center">{d.studentsCount}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{d.gradeScores['IV sinif']}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{d.gradeScores['VI sinif']}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{d.gradeScores['IX sinif']}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{d.gradeScores['XI sinif']}%</td>
                        <td className="py-2.5 px-3 text-center font-black text-emerald-700 text-sm">{d.overallScore}%</td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-600 truncate max-w-[180px]" title={d.topSchool}>
                          {d.topSchool}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDistrictId(d.name);
                              setActiveTab('districts');
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold cursor-pointer"
                          >
                            Bax &rarr;
                          </button>
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
            TAB 2: RAYONLAR ÜZRƏ AKADEMİK REYTİNQ VƏ DETALLAR (Tələb 5 & 6)
            ============================================================== */}
        {activeTab === 'districts' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* 8 Rayon Seçim Düymələri (Tələb 5) */}
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Naxçıvan MR Şəhər və Rayonları (Seçin):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {districts.map((d) => {
                  const isSelected = d.name === selectedDistrictId;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDistrictId(d.name)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-black text-slate-900">{d.name}</span>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                          №{d.nmrRank}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-[11px] text-slate-500">{d.schoolsCount} məktəb</span>
                        <span className="text-sm font-black text-emerald-700">{d.overallScore}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seçilmiş Rayonun Ətraflı Kartları */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{currentDistrictRecord.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                      NMR Reytinqi: {currentDistrictRecord.nmrRank}-ci yer
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monitorinqdə iştirak edən şagird sayı: {currentDistrictRecord.studentsCount} • Məktəb sayı: {currentDistrictRecord.schoolsCount}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-bold uppercase">Rayon Orta Nəticəsi</span>
                  <span className="text-2xl font-black text-emerald-700">{currentDistrictRecord.overallScore}%</span>
                </div>
              </div>

              {/* Rayon daxilində siniflər üzrə faizlər */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 my-4">
                {MONITORING_GRADES.map((g) => (
                  <div key={g} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-500 font-bold block">{g}</span>
                    <strong className="text-base font-black text-indigo-700">{currentDistrictRecord.gradeScores[g]}%</strong>
                  </div>
                ))}
              </div>

              {/* Rayon daxilində ən yüksək və ən aşağı məktəblər */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Rayon üzrə Ən Yüksək Məktəb
                  </span>
                  <div className="font-bold text-slate-900 text-xs">{currentDistrictRecord.topSchool}</div>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    Rayon üzrə Ən Aşağı Məktəb
                  </span>
                  <div className="font-bold text-slate-900 text-xs">{currentDistrictRecord.lowestSchool}</div>
                </div>
              </div>
            </div>

            {/* Rayon Daxilində Məktəblərin Müqayisə Cədvəli (Tələb 6) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-indigo-600" />
                  {currentDistrictRecord.name} Ərazisindəki Məktəblərin Sıralanması
                </h3>
                <span className="text-[10px] text-slate-400 font-bold">{districtSchools.length} məktəb</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Rayon Sırası</th>
                      <th className="py-2.5 px-3">Məktəbin Adı</th>
                      <th className="py-2.5 px-3 text-center">Şagird</th>
                      <th className="py-2.5 px-3 text-center">IV sinif</th>
                      <th className="py-2.5 px-3 text-center">VI sinif</th>
                      <th className="py-2.5 px-3 text-center">IX sinif</th>
                      <th className="py-2.5 px-3 text-center">XI sinif</th>
                      <th className="py-2.5 px-3 text-center">Ümumi Nəticə</th>
                      <th className="py-2.5 px-3 text-center">NMR Reytinqi</th>
                      <th className="py-2.5 px-3 text-center">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                    {districtSchools.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-center font-black">
                          <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10.5px] text-white ${
                            s.districtRank === 1 ? 'bg-amber-500' : s.districtRank === 2 ? 'bg-slate-400' : s.districtRank === 3 ? 'bg-amber-700' : 'bg-slate-600'
                          }`}>
                            {s.districtRank}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-2.5 px-3 text-center">{s.studentsCount}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.gradeScores['IV sinif']}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.gradeScores['VI sinif']}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.gradeScores['IX sinif']}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.gradeScores['XI sinif']}%</td>
                        <td className="py-2.5 px-3 text-center font-black text-emerald-700 text-sm">{s.overallScore}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-500">#{s.nmrRank}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setViewingSchool(s)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            Detallar
                          </button>
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
            TAB 3: MƏKTƏBLƏR ÜZRƏ NƏTİCƏLƏR VƏ AXTARIŞ (Tələb 6 & 13)
            ============================================================== */}
        {activeTab === 'schools' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Search and District Filter Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Məktəbin adı və ya rayon üzrə axtarış..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Filter className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="all_districts">Bütün Rayonlar ({districts.length})</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* All Schools Ranked Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  Naxçıvan MR Məktəblərinin Ümumi Reytinqi
                </h3>
                <span className="text-[11px] text-slate-500 font-bold">
                  Göstərilən: {filteredSchools.length} məktəb
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">NMR Sırası</th>
                      <th className="py-2.5 px-3">Məktəbin Adı</th>
                      <th className="py-2.5 px-3">Rayon</th>
                      <th className="py-2.5 px-3 text-center">İştirakçı</th>
                      <th className="py-2.5 px-3 text-center">IV sinif</th>
                      <th className="py-2.5 px-3 text-center">VI sinif</th>
                      <th className="py-2.5 px-3 text-center">IX sinif</th>
                      <th className="py-2.5 px-3 text-center">XI sinif</th>
                      <th className="py-2.5 px-3 text-center font-black">Ümumi Nəticə</th>
                      <th className="py-2.5 px-3 text-center">Rayon Sırası</th>
                      <th className="py-2.5 px-3 text-center">Baxış</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                    {filteredSchools.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-center font-black">
                          <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10.5px] text-white ${
                            s.nmrRank <= 3 ? 'bg-amber-500' : s.nmrRank <= 10 ? 'bg-indigo-600' : 'bg-slate-600'
                          }`}>
                            {s.nmrRank}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 cursor-pointer hover:text-indigo-600" onClick={() => setViewingSchool(s)}>
                          {s.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{s.district}</td>
                        <td className="py-2.5 px-3 text-center">{s.studentsCount}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.gradeScores['IV sinif']}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.gradeScores['VI sinif']}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.gradeScores['IX sinif']}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{s.gradeScores['XI sinif']}%</td>
                        <td className="py-2.5 px-3 text-center font-black text-emerald-700 text-sm">{s.overallScore}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-500">#{s.districtRank}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setViewingSchool(s)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            Ətraflı
                          </button>
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
            TAB 4: SİNİFLƏR ÜZRƏ MONİTORİNQ STATİSTİKASI (Tələb 8 - Strictly IV, VI, IX, XI)
            ============================================================== */}
        {activeTab === 'grades' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* 4 Dəqiq Sinif Seçim Düyməsi */}
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Monitorinq Sinfi Seçin:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {MONITORING_GRADES.map((g) => {
                  const isSelected = selectedGrade === g;
                  const avg = overview.gradeAverages[g] || 0;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGrade(g)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="text-sm font-black block">{g}</span>
                      <span className={`text-xs mt-1 block font-bold ${isSelected ? 'text-indigo-100' : 'text-emerald-700'}`}>
                        Orta: {avg}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seçilmiş Sinif Üzrə Rayonların Göstəriciləri */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                {selectedGrade} Üzrə Rayonların Nəticələri və Reytinqi
              </h3>

              <div className="space-y-2.5">
                {[...districts]
                  .sort((a, b) => (b.gradeScores[selectedGrade] || 0) - (a.gradeScores[selectedGrade] || 0))
                  .map((d, idx) => {
                    const score = d.gradeScores[selectedGrade] || 0;
                    return (
                      <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10.5px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 text-xs">{d.name}</span>
                            <span className="text-[10px] text-slate-400 block">{d.schoolsCount} məktəb</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-24 sm:w-48 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-sm font-black text-emerald-700 w-12 text-right">{score}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 5: FƏNLƏR ÜZRƏ AKADEMİK STATİSTİKA (Tələb 9)
            ============================================================== */}
        {activeTab === 'subjects' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Subject Selector Buttons */}
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Monitorinq Fənnini Seçin:
              </span>
              <div className="flex flex-wrap gap-2">
                {MONITORING_SUBJECTS.map((sub) => {
                  const isSelected = selectedSubject === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sub} ({overview.subjectAverages[sub] || 0}%)
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Subject Overview Cards */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  «{selectedSubject}» Fənni Üzrə Naxçıvan MR Göstəriciləri
                </h3>
                <span className="text-lg font-black text-emerald-700">
                  Orta: {overview.subjectAverages[selectedSubject] || 0}%
                </span>
              </div>

              {/* District ranking for this subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {[...districts]
                  .sort((a, b) => (b.subjectScores[selectedSubject] || 0) - (a.subjectScores[selectedSubject] || 0))
                  .map((d, idx) => {
                    const score = d.subjectScores[selectedSubject] || 0;
                    return (
                      <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                          <span className="text-xs font-bold text-slate-800">{d.name}</span>
                        </div>
                        <span className="text-xs font-black text-emerald-700">{score}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 6: REYTİNQ VƏ MÜQAYİSƏ (Tələb 7 - Rayonlararası Məktəblərin Müqayisəsi)
            ============================================================== */}
        {activeTab === 'comparison' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                    Rayonlar Arasında Məktəblərin Seçimli Müqayisəsi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Müxtəlif rayonlardan məktəbləri seçərək onların akademik göstəricilərini yan-yana müqayisə edin
                  </p>
                </div>
              </div>

              {/* Selected schools chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {comparedSchoolNames.map((sName) => (
                  <span
                    key={sName}
                    className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>{sName}</span>
                    <button
                      type="button"
                      onClick={() => setComparedSchoolNames((prev) => prev.filter((n) => n !== sName))}
                      className="text-indigo-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add school to comparison selector */}
              <div className="flex items-center gap-2 max-w-md">
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !comparedSchoolNames.includes(val)) {
                      setComparedSchoolNames((prev) => [...prev, val]);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="">+ Başqa rayonun məktəbini müqayisəyə əlavə et...</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.district} — {s.name} ({s.overallScore}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Side-by-Side Comparison Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
                {comparedSchools.map((cs) => (
                  <div key={cs.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{cs.district}</span>
                      <h4 className="text-sm font-black text-slate-900 my-1 leading-snug">{cs.name}</h4>
                      <div className="text-2xl font-black text-emerald-700 my-2">{cs.overallScore}%</div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                        <div className="flex justify-between">
                          <span>NMR Üzrə Yeri:</span>
                          <strong className="text-slate-900">#{cs.nmrRank}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Rayon Daxilində Yeri:</span>
                          <strong className="text-slate-900">#{cs.districtRank}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>İştirakçı Sayı:</span>
                          <strong className="text-slate-900">{cs.studentsCount} şagird</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold mt-3 pt-2 border-t border-slate-200">
                        <div>
                          <span className="text-slate-400 block">IV</span>
                          <span>{cs.gradeScores['IV sinif']}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">VI</span>
                          <span>{cs.gradeScores['VI sinif']}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">IX</span>
                          <span>{cs.gradeScores['IX sinif']}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">XI</span>
                          <span>{cs.gradeScores['XI sinif']}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewingSchool(cs)}
                      className="mt-4 w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer text-center"
                    >
                      Bütün detallara bax
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 7: MONİTORİNQLƏR ÜZRƏ NƏTİCƏLƏRİN DİNAMİKASI (Tələb 11)
            ============================================================== */}
        {activeTab === 'dynamics' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Monitorinqlər üzrə İnkişaf Dinamikası
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    I Monitorinq (Oktyabr), II Monitorinq (Yanvar) və III Monitorinq (Aprel) müqayisəsi
                  </p>
                </div>
              </div>

              {/* Rayonların inkişaf dinamikası cədvəli */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Rayon / Şəhər</th>
                      <th className="py-2.5 px-3 text-center">I Monitorinq</th>
                      <th className="py-2.5 px-3 text-center">II Monitorinq</th>
                      <th className="py-2.5 px-3 text-center">III Monitorinq</th>
                      <th className="py-2.5 px-3 text-center">İnkişaf Fərqi (%)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                    {districts.map((d) => {
                      const isPositive = d.dynamics.changePct >= 0;
                      return (
                        <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{d.name}</td>
                          <td className="py-2.5 px-3 text-center text-slate-600">{d.dynamics.mon1}%</td>
                          <td className="py-2.5 px-3 text-center text-slate-600">{d.dynamics.mon2}%</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900">{d.dynamics.mon3}%</td>
                          <td className="py-2.5 px-3 text-center font-black">
                            <span className={isPositive ? 'text-emerald-700' : 'text-rose-600'}>
                              {isPositive ? `+${d.dynamics.changePct}%` : `${d.dynamics.changePct}%`}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPositive ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                            }`}>
                              {isPositive ? 'Artım müşahidə edilir' : 'Azalma'}
                            </span>
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
      </div>

      {/* ==============================================================
          SCHOOL DETAILS MODAL (Məktəbin Fərdi Monitorinq Kartı)
          ============================================================== */}
      {viewingSchool && (
        <div
          onClick={() => setViewingSchool(null)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in zoom-in-95 duration-150 relative"
          >
            <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-950 px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                  {viewingSchool.district}
                </span>
                <h3 className="text-base font-black tracking-tight leading-snug">{viewingSchool.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingSchool(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
              {/* Score header */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 block">Ümumi Orta Nəticə</span>
                  <span className="text-2xl font-black text-emerald-700">{viewingSchool.overallScore}%</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 block">Rayon Yeri: #{viewingSchool.districtRank}</span>
                  <span className="text-xs font-bold text-slate-500 block">NMR Yeri: #{viewingSchool.nmrRank}</span>
                </div>
              </div>

              {/* Grades breakdown */}
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Monitorinq Sinifləri üzrə Nəticələr
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {MONITORING_GRADES.map((g) => (
                    <div key={g} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">{g}</span>
                      <strong className="text-sm font-black text-indigo-700">{viewingSchool.gradeScores[g]}%</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subjects breakdown */}
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Fənlər üzrə Göstəricilər
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(viewingSchool.subjectScores).map(([sub, score]) => (
                    <div key={sub} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-semibold">
                      <span>{sub}</span>
                      <span className="font-black text-slate-900">{score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingSchool(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
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
