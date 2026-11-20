// src/pages/MinistryExamsPage.tsx
// ATROQ EDUCATION – SINAQ İMTAHANI NƏTİCƏLƏRİNİN AVTOMATİK ƏLDƏ EDİLMƏSİ MODULU
// Naxçıvan MR Təhsil Nazirliyinin sınaq imtahanı nəticələri və UTİS inteqrasiyası

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  RefreshCw,
  Play,
  Square,
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  Database,
  History,
  BarChart3,
  Users,
  Award,
  Trash2,
  ExternalLink,
  ChevronDown,
  Info,
  Check,
  RotateCw,
  Building2,
  GraduationCap
} from 'lucide-react';
import { api } from '../lib/api';
import { exportMinistryExamResultsToExcel } from '../lib/export-utils';
import { User } from '../types';

interface MinistryExamsPageProps {
  user: User;
}

interface MinistryExamOption {
  id: string;
  title: string;
}

interface StudentItem {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  father_name?: string;
  utis_code?: string;
  grade_class: string;
  school_name?: string;
}

interface QueryResultItem {
  id: string;
  student_id: string;
  student_name: string;
  student_surname?: string;
  utis_code: string;
  grade: string;
  exam_id: string;
  exam_title: string;
  score: number | null;
  details_json?: string | null;
  status: 'found' | 'not_found' | 'error' | 'no_utis';
  error_message?: string | null;
  fetched_at: string;
}

export const MinistryExamsPage: React.FC<MinistryExamsPageProps> = ({ user }) => {
  // Navigation Tabs: 'query' (Yeni Sorğu), 'history' (Nəticələr Tarixçəsi), 'settings' (Tənzimləmələr)
  const [activeSubTab, setActiveSubTab] = useState<'query' | 'history' | 'settings'>('query');

  // Exam Selection State
  const [availableExams, setAvailableExams] = useState<MinistryExamOption[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [customExamTitle, setCustomExamTitle] = useState<string>('');
  const [isCustomExam, setIsCustomExam] = useState<boolean>(false);
  const [loadingExams, setLoadingExams] = useState<boolean>(false);
  const [examSourceUrl, setExamSourceUrl] = useState<string>('https://nmr.edu.az/search-live-exam-result');

  // Students & Grade Filter State
  const [allStudents, setAllStudents] = useState<StudentItem[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);

  // Live Query / Batch Execution State
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryProgress, setQueryProgress] = useState<{
    total: number;
    current: number;
    found: number;
    notFound: number;
    error: number;
    percentage: number;
  }>({ total: 0, current: 0, found: 0, notFound: 0, error: 0, percentage: 0 });
  const stopQueryRef = useRef<boolean>(false);

  // Live Results Table State (Cari sorğunun nəticələri)
  const [liveResults, setLiveResults] = useState<QueryResultItem[]>([]);

  // History / Saved Database Results State
  const [historyResults, setHistoryResults] = useState<QueryResultItem[]>([]);
  const [historyStats, setHistoryStats] = useState<any>({
    total: 0,
    participated_count: 0,
    avg_score: 0,
    max_score: 0,
    min_score: 0,
    not_found_count: 0,
    error_count: 0
  });
  const [historyExamFilter, setHistoryExamFilter] = useState<string>('all');
  const [historyGradeFilter, setHistoryGradeFilter] = useState<string>('all');
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Settings State
  const [settingsUrlInput, setSettingsUrlInput] = useState<string>('');
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Load Initial Settings, Available Exams, Students
  useEffect(() => {
    loadSettings();
    loadAvailableExams();
    loadStudents();
    loadHistoryResults();
  }, []);

  // Update selected student IDs whenever grade filter changes
  useEffect(() => {
    if (selectedGradeFilter !== 'all') {
      const validInGrade = allStudents
        .filter(s => (s.grade_class === selectedGradeFilter || s.grade_class?.startsWith(selectedGradeFilter)) && s.utis_code && s.utis_code.trim())
        .map(s => s.id);
      setSelectedStudentIds(new Set(validInGrade));
    }
  }, [selectedGradeFilter, allStudents]);

  // Load Settings
  const loadSettings = async () => {
    try {
      const res = await api.getMinistrySettings();
      if (res && res.url) {
        setExamSourceUrl(res.url);
        setSettingsUrlInput(res.url);
      }
    } catch {}
  };

  // Load Available Exams from Ministry
  const loadAvailableExams = async () => {
    setLoadingExams(true);
    try {
      const res = await api.getAvailableMinistryExams();
      if (res && res.exams && res.exams.length > 0) {
        setAvailableExams(res.exams);
        setSelectedExamId(res.exams[0].id);
      }
    } catch (e) {
      console.error('Error loading exams:', e);
    } finally {
      setLoadingExams(false);
    }
  };

  // Load Students from DB
  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await api.getMinistryStudents();
      if (res && res.students) {
        setAllStudents(res.students);
        setAvailableGrades(res.grades || []);

        // By default select all students who have a valid UTIS code
        const validUtisIds = res.students
          .filter((s: StudentItem) => s.utis_code && s.utis_code.trim())
          .map((s: StudentItem) => s.id);
        setSelectedStudentIds(new Set(validUtisIds));
      }
    } catch (e) {
      console.error('Error loading students:', e);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Load History
  const loadHistoryResults = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.getMinistryExamResults(
        historyExamFilter !== 'all' ? historyExamFilter : undefined,
        historyGradeFilter !== 'all' ? historyGradeFilter : undefined
      );
      if (res && res.results) {
        setHistoryResults(res.results);
        setHistoryStats(res.stats || {});
      }
    } catch (e) {
      console.error('Error loading history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Active Exam Title
  const activeExamTitle = useMemo(() => {
    if (isCustomExam) return customExamTitle || 'Fərdi Sınaq İmtahanı';
    const found = availableExams.find(e => e.id === selectedExamId);
    return found ? found.title : 'Sınaq İmtahanı';
  }, [isCustomExam, customExamTitle, selectedExamId, availableExams]);

  // Filtered Students for Query Screen
  const filteredStudents = useMemo(() => {
    return allStudents.filter(s => {
      const matchesGrade = selectedGradeFilter === 'all' || s.grade_class === selectedGradeFilter || s.grade_class?.startsWith(selectedGradeFilter);
      const q = studentSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (s.full_name && s.full_name.toLowerCase().includes(q)) ||
        (s.utis_code && s.utis_code.toLowerCase().includes(q)) ||
        (s.grade_class && s.grade_class.toLowerCase().includes(q));
      return matchesGrade && matchesSearch;
    });
  }, [allStudents, selectedGradeFilter, studentSearchQuery]);

  // Toggle Single Student Selection
  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select / Deselect All Filtered Students
  const handleSelectAllFiltered = (select: boolean) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      filteredStudents.forEach(s => {
        if (s.utis_code && s.utis_code.trim()) {
          if (select) next.add(s.id);
          else next.delete(s.id);
        }
      });
      return next;
    });
  };

  // Batch Execution: Start Querying Ministry Site
  const handleStartBatchQuery = async () => {
    const targetStudents = filteredStudents.filter(s => selectedStudentIds.has(s.id) && s.utis_code && s.utis_code.trim());

    if (targetStudents.length === 0) {
      alert('Zəhmət olmasa, sorğu göndərmək üçün ən azı bir UTİS kodu olan şagird seçin.');
      return;
    }

    if (!selectedExamId && !isCustomExam) {
      alert('Zəhmət olmasa, imtahanı seçin.');
      return;
    }

    setIsQuerying(true);
    stopQueryRef.current = false;

    setQueryProgress({
      total: targetStudents.length,
      current: 0,
      found: 0,
      notFound: 0,
      error: 0,
      percentage: 0
    });

    const resultsCollector: QueryResultItem[] = [];

    for (let i = 0; i < targetStudents.length; i++) {
      if (stopQueryRef.current) break;

      const st = targetStudents[i];
      const payload = {
        student_id: st.id,
        student_name: st.first_name || st.full_name.split(' ')[0] || st.full_name,
        student_surname: st.last_name || st.full_name.split(' ')[1] || '',
        utis_code: st.utis_code || '',
        grade: st.grade_class || 'Ümumi',
        exam_id: selectedExamId || 'custom-1',
        exam_title: activeExamTitle
      };

      try {
        const res = await api.queryMinistryStudent(payload);
        if (res && res.result) {
          resultsCollector.push(res.result);
          setLiveResults([...resultsCollector]);

          setQueryProgress(prev => {
            const current = i + 1;
            const found = prev.found + (res.result.status === 'found' ? 1 : 0);
            const notFound = prev.notFound + (res.result.status === 'not_found' ? 1 : 0);
            const error = prev.error + (res.result.status === 'error' ? 1 : 0);
            const percentage = Math.round((current / targetStudents.length) * 100);
            return { ...prev, current, found, notFound, error, percentage };
          });
        }
      } catch (err) {
        const errResult: QueryResultItem = {
          id: 'err-' + st.id,
          student_id: st.id,
          student_name: st.full_name,
          utis_code: st.utis_code || '',
          grade: st.grade_class,
          exam_id: selectedExamId,
          exam_title: activeExamTitle,
          score: null,
          status: 'error',
          error_message: 'Şəbəkə xətası baş verdi',
          fetched_at: new Date().toISOString()
        };
        resultsCollector.push(errResult);
        setLiveResults([...resultsCollector]);
      }

      // 600ms controlled rate-limiting delay between requests
      if (i < targetStudents.length - 1 && !stopQueryRef.current) {
        await new Promise(r => setTimeout(r, 650));
      }
    }

    setIsQuerying(false);
    // Reload history after batch finishes
    loadHistoryResults();
  };

  // Stop / Cancel Query
  const handleStopQuery = () => {
    stopQueryRef.current = true;
    setIsQuerying(false);
  };

  // Retry Single Student Query
  const handleRetrySingle = async (item: QueryResultItem) => {
    const payload = {
      student_id: item.student_id,
      student_name: item.student_name,
      student_surname: item.student_surname,
      utis_code: item.utis_code,
      grade: item.grade,
      exam_id: item.exam_id,
      exam_title: item.exam_title
    };

    try {
      const res = await api.queryMinistryStudent(payload);
      if (res && res.result) {
        setLiveResults(prev => prev.map(r => r.student_id === item.student_id ? res.result : r));
        loadHistoryResults();
      }
    } catch (e: any) {
      alert('Təkrar sorğu zamanı xəta: ' + e.message);
    }
  };

  // Delete History Record
  const handleDeleteHistoryRecord = async (id: string) => {
    if (!window.confirm('Bu sınaq nəticəsini bazadan silmək istədiyinizə əminsiniz?')) return;
    try {
      await api.deleteMinistryExamResult(id);
      loadHistoryResults();
    } catch (e: any) {
      alert('Silinərkən xəta: ' + e.message);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    if (!settingsUrlInput || !settingsUrlInput.trim().startsWith('http')) {
      alert('Zəhmət olmasa, düzgün veb link daxil edin (məs: https://nmr.edu.az/search-live-exam-result)');
      return;
    }
    setSavingSettings(true);
    try {
      const res = await api.updateMinistrySettings(settingsUrlInput.trim());
      if (res && res.success) {
        setExamSourceUrl(settingsUrlInput.trim());
        alert('İmtahan saytının linki uğurla yadda saxlanıldı.');
        loadAvailableExams();
      } else {
        alert(res.error || 'Yadda saxlanılarkən xəta baş verdi.');
      }
    } catch (e: any) {
      alert('Xəta: ' + e.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Test Connection to Ministry URL
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionTestResult(null);
    try {
      const res = await api.getAvailableMinistryExams();
      if (res && res.success && res.exams) {
        setConnectionTestResult({
          success: true,
          msg: `Əlaqə uğurludur! Saytdan ${res.exams.length} aktiv sınaq imtahanı aşkar edildi.`
        });
        setAvailableExams(res.exams);
      } else {
        setConnectionTestResult({
          success: false,
          msg: res.error || 'Sayta qoşulmaq mümkün olmadı. Zəhmət olmasa linki yoxlayın.'
        });
      }
    } catch (e: any) {
      setConnectionTestResult({
        success: false,
        msg: 'Qoşulma xətası: ' + e.message
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 p-3 sm:p-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-5">

        {/* ============================================================== */}
        {/* HEADER: MODULUN BAŞLIĞI VƏ NAVİQASİYA TABLARI                   */}
        {/* ============================================================== */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Sınaq İmtahanları
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-extrabold text-[10.5px]">
                  Naxçıvan MR • UTİS İnteqrasiyası
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nazirliyin sınaq portalından şagirdlərin ballarını UTİS kodları ilə avtomatik əldə edin, bazaya yazın və təhlil aparın
              </p>
            </div>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setActiveSubTab('query')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'query'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Yeni Sorğu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab('history');
                loadHistoryResults();
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Nəticələr Tarixçəsi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('settings')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>İmtahan Saytı</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: YENİ SORĞU (İmtahan Seçimi, Şagird Seçimi, Canlı Sorğu)   */}
        {/* ============================================================== */}
        {activeSubTab === 'query' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-150">

            {/* 1. İmtahan Seçimi Bloku */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    1. Sınaq İmtahanını Seçin
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomExam(!isCustomExam)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {isCustomExam ? '← Saytın imtahan siyahısına qayıt' : '+ Fərdi imtahan daxil et'}
                  </button>
                  <button
                    type="button"
                    onClick={loadAvailableExams}
                    disabled={loadingExams}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="İmtahanları yenidən çək"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${loadingExams ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                </div>
              </div>

              {!isCustomExam ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nazirliyin Saytındakı Sınaq İmtahanı:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 cursor-pointer appearance-none pr-10"
                    >
                      {availableExams.length === 0 ? (
                        <option value="">İmtahanlar yüklənir...</option>
                      ) : (
                        availableExams.map(ex => (
                          <option key={ex.id} value={ex.id}>
                            №{ex.id} • {ex.title}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-[10.5px] text-slate-400">
                    Mənbə: <a href={examSourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">{examSourceUrl} <ExternalLink className="w-2.5 h-2.5" /></a>
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Fərdi İmtahan İdentifikatoru (ID):
                    </label>
                    <input
                      type="text"
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      placeholder="Məsələn: 27 və ya 10"
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      İmtahanın Adı:
                    </label>
                    <input
                      type="text"
                      value={customExamTitle}
                      onChange={(e) => setCustomExamTitle(e.target.value)}
                      placeholder="Məsələn: IX sinif Buraxılış Monitorinqi-1"
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Sinfi və Şagirdləri Seç (ATROQ Şagird Bazası) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    2. Şagirdlərin Seçilməsi (ATROQ Bazasından)
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500">Seçilib:</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-black">
                    {selectedStudentIds.size} / {filteredStudents.length} şagird
                  </span>
                </div>
              </div>

              {/* Filtirlər: Sinif və Axtarış */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedGradeFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      selectedGradeFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Bütün Siniflər ({allStudents.length})
                  </button>
                  {availableGrades.map(gr => (
                    <button
                      key={gr}
                      type="button"
                      onClick={() => setSelectedGradeFilter(gr)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        selectedGradeFilter === gr
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {gr}
                    </button>
                  ))}
                </div>

                <div className="sm:col-span-4 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Şagird adı, soyadı və ya UTİS kodu ilə axtar..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="sm:col-span-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllFiltered(true)}
                    className="px-2.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer"
                  >
                    Hamısını seç
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllFiltered(false)}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    Təmizlə
                  </button>
                </div>
              </div>

              {/* Şagirdlərin Çekboks Qridi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-2.5 pt-2.5 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 scrollbar-thin">
                {filteredStudents.length === 0 ? (
                  <div className="col-span-full p-6 text-center text-xs text-slate-400">
                    Bu sinif üzrə şagird tapılmadı
                  </div>
                ) : (
                  filteredStudents.map(st => {
                    const isSelected = selectedStudentIds.has(st.id);
                    const hasUtis = !!(st.utis_code && st.utis_code.trim());

                    return (
                      <div
                        key={st.id}
                        onClick={() => hasUtis && toggleStudentSelection(st.id)}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 select-none ${
                          !hasUtis
                            ? 'opacity-50 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                            : isSelected
                            ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-sky-400 dark:shadow-[0_0_8px_rgba(56,189,248,0.25)] cursor-pointer'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-black block truncate text-slate-900 dark:text-white">
                              {st.full_name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 mt-0.5">
                              <span>{st.grade_class}</span>
                              {hasUtis ? (
                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1 rounded">
                                  UTİS: {st.utis_code}
                                </span>
                              ) : (
                                <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-1 rounded">
                                  UTİS yoxdur
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3. Sorğunun Başladılması və İrəliləyiş Paneli */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    3. Nəticələrin Avtomatik Əldə Edilməsi
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {!isQuerying ? (
                    <button
                      type="button"
                      onClick={handleStartBatchQuery}
                      disabled={selectedStudentIds.size === 0}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Nəticələri Əldə Et ({selectedStudentIds.size} Şagird)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopQuery}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Dayandır</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar & Real-time Live Counters */}
              {(isQuerying || queryProgress.current > 0) && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      {isQuerying && <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />}
                      {isQuerying ? 'Nazirliyin saytından nəticələr sorğulanır...' : 'Sorğu tamamlandı'}
                    </span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-black text-sm">
                      {queryProgress.percentage}%
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 transition-all duration-300"
                      style={{ width: `${queryProgress.percentage}%` }}
                    />
                  </div>

                  {/* Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Cəmi Şagird</span>
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-100">{queryProgress.total}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Yoxlanılan</span>
                      <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400">{queryProgress.current}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Tapılan (Bal)</span>
                      <strong className="text-sm font-black text-emerald-700 dark:text-emerald-300">{queryProgress.found}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold">Tapılmayan</span>
                      <strong className="text-sm font-black text-amber-700 dark:text-amber-300">{queryProgress.notFound}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                      <span className="text-[10px] text-rose-700 dark:text-rose-400 block font-semibold">Xətalar</span>
                      <strong className="text-sm font-black text-rose-700 dark:text-rose-300">{queryProgress.error}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Əldə Edilmiş Nəticələr Cədvəli */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    4. Nəticələr Cədvəli ({liveResults.length > 0 ? liveResults.length : 0} Nəticə)
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {liveResults.length > 0 && (
                    <button
                      type="button"
                      onClick={() => exportMinistryExamResultsToExcel(liveResults, activeExamTitle, selectedGradeFilter)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Excel-ə İxrac (.xlsx)</span>
                    </button>
                  )}
                </div>
              </div>

              {liveResults.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Award className="w-10 h-10 opacity-30 text-blue-500" />
                  <p className="text-xs font-semibold">
                    Hələlik sorğu göndərilməyib. Yuxarıdakı «Nəticələri Əldə Et» düyməsinə klikləyərək imtahan ballarını çəkin.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">№</th>
                        <th className="py-2.5 px-3">Şagirdin Adı və Soyadı</th>
                        <th className="py-2.5 px-3">Sinfi</th>
                        <th className="py-2.5 px-3">UTİS Kodu</th>
                        <th className="py-2.5 px-3">İmtahanın Adı</th>
                        <th className="py-2.5 px-3 text-center">Topladığı Bal</th>
                        <th className="py-2.5 px-3">Tarix</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-center">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {liveResults.map((r, idx) => {
                        const isFound = r.status === 'found';
                        const isNotFound = r.status === 'not_found';
                        const isError = r.status === 'error';

                        return (
                          <tr key={r.student_id + '-' + idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                              {r.student_name} {r.student_surname}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-[10.5px]">
                                {r.grade}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-sky-300">
                              {r.utis_code}
                            </td>
                            <td className="py-2.5 px-3 max-w-[240px] truncate text-slate-600 dark:text-slate-300" title={r.exam_title}>
                              {r.exam_title}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isFound ? (
                                <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                                  {r.score !== null ? r.score : '0'} bal
                                </span>
                              ) : isNotFound ? (
                                <span className="text-slate-400 font-semibold">—</span>
                              ) : (
                                <span className="text-rose-500 font-bold text-[11px]">Xəta</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                              {new Date(r.fetched_at).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="py-2.5 px-3">
                              {isFound ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Nəticə tapıldı</span>
                                </span>
                              ) : isNotFound ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  <span>Nəticə tapılmadı</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Sorğu xətası</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {!isFound && (
                                <button
                                  type="button"
                                  onClick={() => handleRetrySingle(r)}
                                  className="px-2 py-1 text-blue-600 hover:text-white hover:bg-blue-600 rounded text-[10px] font-bold border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                                  title="Yenidən yoxla"
                                >
                                  Yenidən yoxla
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: NƏTİCƏLƏR TARİXÇƏSİ VƏ STATİSTİK TƏHLİL                 */}
        {/* ============================================================== */}
        {activeSubTab === 'history' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-150">

            {/* Statistika Kartları */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cəmi Nəticələr</span>
                <strong className="text-2xl font-black text-slate-900 dark:text-white">{historyStats.total || 0}</strong>
                <span className="text-[10px] text-slate-400">Bazadakı qeydlər</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">İştirakçı / Nəticə</span>
                <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{historyStats.participated_count || 0}</strong>
                <span className="text-[10px] text-slate-400">Balı olan şagirdlər</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Orta Bal</span>
                <strong className="text-2xl font-black text-blue-600 dark:text-blue-400">{historyStats.avg_score || 0}</strong>
                <span className="text-[10px] text-slate-400">Bütün imtahanlar üzrə</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Ən Yüksək Bal</span>
                <strong className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{historyStats.max_score || 0}</strong>
                <span className="text-[10px] text-slate-400">Maksimum nəticə</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Nəticəsi Olmayan</span>
                <strong className="text-2xl font-black text-amber-600 dark:text-amber-400">{historyStats.not_found_count || 0}</strong>
                <span className="text-[10px] text-slate-400">Nəticə tapılmadı</span>
              </div>
            </div>

            {/* Tarixçə Cədvəli və Filtirlər */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Sınaq İmtahanları Tarixçəsi
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportMinistryExamResultsToExcel(historyResults, 'Sinaq_Tarixce', historyGradeFilter)}
                    disabled={historyResults.length === 0}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel-ə İxrac (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={loadHistoryResults}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Yenilə"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Filtirlər: İmtahan və Sinif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">İmtahana görə filtr:</label>
                  <select
                    value={historyExamFilter}
                    onChange={(e) => {
                      setHistoryExamFilter(e.target.value);
                      setTimeout(loadHistoryResults, 50);
                    }}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                  >
                    <option value="all">Bütün Sınaq İmtahanları</option>
                    {availableExams.map(ex => (
                      <option key={ex.id} value={ex.id}>№{ex.id} • {ex.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Sinifə görə filtr:</label>
                  <select
                    value={historyGradeFilter}
                    onChange={(e) => {
                      setHistoryGradeFilter(e.target.value);
                      setTimeout(loadHistoryResults, 50);
                    }}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                  >
                    <option value="all">Bütün Siniflər</option>
                    {availableGrades.map(gr => (
                      <option key={gr} value={gr}>{gr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {historyResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <History className="w-8 h-8 opacity-30 text-blue-500" />
                  <span>Bazaya yazılmış heç bir nəticə tapılmadı.</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">№</th>
                        <th className="py-2.5 px-3">Şagirdin Adı və Soyadı</th>
                        <th className="py-2.5 px-3">Sinfi</th>
                        <th className="py-2.5 px-3">UTİS Kodu</th>
                        <th className="py-2.5 px-3">İmtahanın Adı</th>
                        <th className="py-2.5 px-3 text-center">Topladığı Bal</th>
                        <th className="py-2.5 px-3">Nəticə Tarixi</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-center">Sil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {historyResults.map((r, idx) => (
                        <tr key={r.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {r.student_name} {r.student_surname}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-[10.5px]">
                              {r.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-sky-300">
                            {r.utis_code}
                          </td>
                          <td className="py-2.5 px-3 max-w-[220px] truncate text-slate-600 dark:text-slate-300" title={r.exam_title}>
                            {r.exam_title}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {r.status === 'found' ? (
                              <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                                {r.score !== null ? r.score : 0} bal
                              </span>
                            ) : (
                              <span className="text-slate-400 font-semibold">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                            {new Date(r.fetched_at).toLocaleDateString('az-AZ')}
                          </td>
                          <td className="py-2.5 px-3">
                            {r.status === 'found' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                Tapıldı
                              </span>
                            ) : r.status === 'not_found' ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                                Tapılmadı
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                                Xəta
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteHistoryRecord(r.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="Qeydi sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

        {/* ============================================================== */}
        {/* TAB 3: İMTAHAN SAYTININ TƏNZİMLƏNMƏSİ                          */}
        {/* ============================================================== */}
        {activeSubTab === 'settings' && (
          <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    İmtahan Saytının Tənzimlənməsi
                  </h2>
                  <p className="text-xs text-slate-400">
                    Naxçıvan Muxtar Respublikasının Təhsil Nazirliyinin sınaq portalının ünvanı
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Portal Linki (URL):</span>
                  <span className="text-[10px] text-slate-400 font-normal">İlkin parametr: https://nmr.edu.az/search-live-exam-result</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={settingsUrlInput}
                    onChange={(e) => setSettingsUrlInput(e.target.value)}
                    placeholder="https://nmr.edu.az/search-live-exam-result"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-blue-600' : ''}`} />
                    <span>Qoşulmanı Yoxla</span>
                  </button>
                </div>
              </div>

              {/* Qoşulma Testinin Nəticəsi */}
              {connectionTestResult && (
                <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  connectionTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                  {connectionTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                  <span>{connectionTestResult.msg}</span>
                </div>
              )}

              {/* Təhlükəsizlik və Texniki İnteqrasiya Bildirişi */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5 leading-relaxed">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-black text-[11px] uppercase tracking-wide">Texniki Təhlükəsizlik və İnteqrasiya Rejimi</span>
                  <span>
                    ATROQ Education sistemi Naxçıvan Təhsil Nazirliyinin rəsmi sınaq axtarış sisteminə təhlükəsiz inteqrasiya edir. Hər bir şagirdin UTİS kodu əsasında sorğu idarə olunan fasilələrlə (rate-limiting) göndərilir, heç bir kənar təhlükəsizlik baryeri pozulmur və sayt müvəqqəti əlçatmaz olduqda belə toplanmış nəticələr bazada qorunur.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? 'Yadda saxlanılır...' : 'Yadda Saxla'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
