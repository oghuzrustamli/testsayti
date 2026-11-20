// src/pages/UtisDatabasePage.tsx
// ATROQ Education – UTİS İnteqrasiyası və Ölkə üzrə Məktəb-Şagird Bazası (Azərbaycan Respublikası Vahid Reyestri)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { User } from '../types';
import { api } from '../lib/api';
import { exportMinistryExamResultsToExcel } from '../lib/export-utils';
import {
  Building2,
  Users2,
  GraduationCap,
  Award,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Globe,
  Sliders,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Check,
  X,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

interface UtisDatabasePageProps {
  user: User;
}

export const UtisDatabasePage: React.FC<UtisDatabasePageProps> = ({ user }) => {
  // Əsas Tablar
  const [activeMainTab, setActiveMainTab] = useState<'registry' | 'exams' | 'stats' | 'excel' | 'gateway'>('registry');

  // Rayon, Kənd və Məktəb bazası
  const [districts, setDistricts] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Reyestr Filtrləri
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSettlement, setSelectedSettlement] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reyestr Statistikası
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [withUtisCount, setWithUtisCount] = useState<number>(0);

  // Modal State-ləri
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState<boolean>(false);
  const [showAddDistrictModal, setShowAddDistrictModal] = useState<boolean>(false);
  const [showAddSettlementModal, setShowAddSettlementModal] = useState<boolean>(false);

  // Forma State-ləri
  const [studentForm, setStudentForm] = useState({
    first_name: '',
    last_name: '',
    father_name: '',
    utis_code: '',
    grade_class: 'IX sinif',
    district: 'Babək rayonu',
    settlement: 'Cəhri qəsəbəsi',
    school_name: 'Q.Sadiqov adına Cəhri qəsəbə 2 №-li tam orta məktəb'
  });

  const [schoolForm, setSchoolForm] = useState({
    name: '',
    district: 'Babək rayonu',
    settlement: '',
    utis_code: '',
    school_type: 'tam_orta'
  });

  const [districtForm, setDistrictForm] = useState({
    name: '',
    region_type: 'rayon',
    parent_region: 'Naxçıvan MR'
  });

  const [settlementForm, setSettlementForm] = useState({
    district_name: 'Babək rayonu',
    name: '',
    settlement_type: 'kend'
  });

  // ==========================================
  // SINAQ İMTAHANLARI VƏ UTİS NƏTİCƏLƏRİ STATE-LƏRİ
  // ==========================================
  const [availableExams, setAvailableExams] = useState<{ id: string; title: string }[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedExamTitle, setSelectedExamTitle] = useState<string>('');
  const [loadingExams, setLoadingExams] = useState<boolean>(false);

  // İmtahana cəlb olunacaq şagird filtrləri
  const [examDistrict, setExamDistrict] = useState<string>('all');
  const [examSchool, setExamSchool] = useState<string>('all');
  const [examGrade, setExamGrade] = useState<string>('all');
  const [examStudentsList, setExamStudentsList] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Canlı Sorğu və İrəliləyiş
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [cancelRequested, setCancelRequested] = useState<boolean>(false);
  const [queryProgress, setQueryProgress] = useState({
    total: 0,
    checked: 0,
    found: 0,
    notFound: 0,
    errors: 0,
    currentStudentName: '',
    percentage: 0
  });

  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [historyResults, setHistoryResults] = useState<any[]>([]);
  const [historyStats, setHistoryStats] = useState<any>({});
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // ==========================================
  // NAZİRLİK UTİS GATEWAY VƏ SİNXRONLAŞDIRMA
  // ==========================================
  const [utisSettings, setUtisSettings] = useState<Record<string, string>>({});
  const [gatewayUrl, setGatewayUrl] = useState<string>('https://utis.edu.az/api/v1');
  const [examSourceUrl, setExamSourceUrl] = useState<string>('https://nmr.edu.az/search-live-exam-result');
  const [apiKey, setApiKey] = useState<string>('');
  const [orgCode, setOrgCode] = useState<string>('ATROQ-AZ-2026');
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Regional Statistika State-ləri
  const [regionalStatsData, setRegionalStatsData] = useState<any>({
    overview: {},
    districts: [],
    schools: []
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // Bildiriş / Xəbərdarlıq mesajı
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Sinif Seçimləri (I - XI siniflər)
  const ROMAN_CLASSES = [
    'I sinif', 'II sinif', 'III sinif', 'IV sinif', 'V sinif',
    'VI sinif', 'VII sinif', 'VIII sinif', 'IX sinif', 'X sinif', 'XI sinif'
  ];

  // ==========================================
  // İLKİN YÜKLƏMƏ VƏ BAZA MƏLUMATLARI
  // ==========================================
  useEffect(() => {
    loadDistricts();
    loadSchools();
    loadStudents();
    loadExams();
    loadUtisSettings();
    loadSyncHistory();
  }, []);

  // Rayon dəyişdikdə kəndləri və məktəbləri yenilə
  useEffect(() => {
    loadSettlements(selectedDistrict);
    loadSchools(selectedDistrict, selectedSettlement);
  }, [selectedDistrict, selectedSettlement]);

  // Reyestr filtrləri dəyişdikdə şagirdləri gətir
  useEffect(() => {
    loadStudents();
  }, [selectedDistrict, selectedSettlement, selectedSchool, selectedGrade, searchQuery]);

  // İmtahan filtri dəyişdikdə imtahan şagirdlərini gətir
  useEffect(() => {
    loadExamStudents();
  }, [examDistrict, examSchool, examGrade]);

  const loadDistricts = async () => {
    const res = await api.getUtisDistricts();
    if (res.success && res.districts) {
      setDistricts(res.districts);
    }
  };

  const loadSettlements = async (districtName?: string) => {
    const res = await api.getUtisSettlements(undefined, districtName);
    if (res.success && res.settlements) {
      setSettlements(res.settlements);
    }
  };

  const loadSchools = async (district?: string, settlement?: string) => {
    const res = await api.getUtisSchools(district, settlement);
    if (res.success && res.schools) {
      setSchools(res.schools);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    const res = await api.getUtisStudents({
      district: selectedDistrict,
      settlement: selectedSettlement,
      school: selectedSchool,
      grade: selectedGrade,
      search: searchQuery
    });
    setLoading(false);
    if (res.success) {
      setStudents(res.students);
      setTotalStudentsCount(res.total);
      setWithUtisCount(res.with_utis_count);
    }
  };

  const loadExamStudents = async () => {
    const res = await api.getMinistryStudents(examGrade, examDistrict, examSchool);
    if (res.success) {
      setExamStudentsList(res.students);
      // İlkin olaraq UTİS kodu olan bütün şagirdləri seç
      const validIds = new Set<string>();
      res.students.forEach((s: any) => {
        if (s.utis_code && s.utis_code.trim().length >= 5) {
          validIds.add(s.id);
        }
      });
      setSelectedStudentIds(validIds);
    }
  };

  const loadExams = async () => {
    setLoadingExams(true);
    const res = await api.getAvailableMinistryExams();
    setLoadingExams(false);
    if (res.exams && res.exams.length > 0) {
      setAvailableExams(res.exams);
      setSelectedExamId(res.exams[0].id);
      setSelectedExamTitle(res.exams[0].title);
    }
  };

  const loadUtisSettings = async () => {
    const res = await api.getUtisSettings();
    if (res.success && res.settings) {
      setUtisSettings(res.settings);
      if (res.settings.api_url) setGatewayUrl(res.settings.api_url);
      if (res.settings.exam_source_url) setExamSourceUrl(res.settings.exam_source_url);
      if (res.settings.api_key) setApiKey(res.settings.api_key);
      if (res.settings.organization_code) setOrgCode(res.settings.organization_code);
    }
  };

  const loadSyncHistory = async () => {
    const res = await api.getUtisSyncHistory();
    if (res.success && res.history) {
      setSyncHistory(res.history);
    }
  };

  const loadRegionalStats = async () => {
    setLoadingStats(true);
    const res = await api.getUtisStats();
    setLoadingStats(false);
    if (res.success) {
      setRegionalStatsData(res);
    }
  };

  const loadHistoryResults = async () => {
    setLoadingHistory(true);
    const res = await api.getMinistryExamResults();
    setLoadingHistory(false);
    if (res.success) {
      setHistoryResults(res.results || []);
      setHistoryStats(res.stats || {});
    }
  };

  useEffect(() => {
    if (activeMainTab === 'stats') {
      loadRegionalStats();
      loadHistoryResults();
    }
  }, [activeMainTab]);

  // ==========================================
  // ŞAGİRD VƏ MƏKTƏB BAZASININ İDARƏ EDİLMƏSİ
  // ==========================================
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.first_name || !studentForm.last_name) {
      setAlertBanner({ type: 'error', message: 'Şagirdin adı və soyadı daxil edilməlidir' });
      return;
    }
    if (!studentForm.utis_code || studentForm.utis_code.trim().length < 5) {
      setAlertBanner({ type: 'error', message: 'Düzgün və etibarlı UTİS kodu daxil edilməlidir (ən azı 5 rəqəm)' });
      return;
    }

    if (editingStudent) {
      const res = await api.updateUtisStudent(editingStudent.id, studentForm);
      if (res.success) {
        setAlertBanner({ type: 'success', message: 'Şagird məlumatları yeniləndi' });
        setShowAddStudentModal(false);
        setEditingStudent(null);
        loadStudents();
      } else {
        setAlertBanner({ type: 'error', message: res.error || 'Yenilənmə zamanı xəta baş verdi' });
      }
    } else {
      const res = await api.addUtisStudent(studentForm);
      if (res.success) {
        setAlertBanner({ type: 'success', message: res.message || 'Şagird bazaya əlavə edildi' });
        setShowAddStudentModal(false);
        setStudentForm({
          first_name: '',
          last_name: '',
          father_name: '',
          utis_code: '',
          grade_class: 'IX sinif',
          district: selectedDistrict !== 'all' ? selectedDistrict : 'Babək rayonu',
          settlement: selectedSettlement !== 'all' ? selectedSettlement : 'Cəhri qəsəbəsi',
          school_name: selectedSchool !== 'all' ? selectedSchool : 'Q.Sadiqov adına Cəhri qəsəbə 2 №-li tam orta məktəb'
        });
        loadStudents();
      } else {
        setAlertBanner({ type: 'error', message: res.error || 'Əlavə edilərkən xəta baş verdi' });
      }
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`«${name}» adlı şagirdi UTİS bazasından silmək istədiyinizə əminsiniz?`)) return;
    const res = await api.deleteUtisStudent(id);
    if (res.success) {
      setAlertBanner({ type: 'success', message: 'Şagird bazadan silindi' });
      loadStudents();
    } else {
      setAlertBanner({ type: 'error', message: res.error || 'Silinmə zamanı xəta' });
    }
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name || !schoolForm.district) {
      setAlertBanner({ type: 'error', message: 'Məktəb adı və rayon daxil edilməlidir' });
      return;
    }
    const res = await api.addUtisSchool(schoolForm);
    if (res.success) {
      setAlertBanner({ type: 'success', message: res.message || 'Yeni məktəb əlavə edildi' });
      setShowAddSchoolModal(false);
      setSchoolForm({ name: '', district: 'Babək rayonu', settlement: '', utis_code: '', school_type: 'tam_orta' });
      loadSchools();
    } else {
      setAlertBanner({ type: 'error', message: res.error || 'Xəta baş verdi' });
    }
  };

  const handleSaveDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!districtForm.name) {
      setAlertBanner({ type: 'error', message: 'Rayon/Şəhər adı daxil edilməlidir' });
      return;
    }
    const res = await api.addUtisDistrict(districtForm);
    if (res.success) {
      setAlertBanner({ type: 'success', message: res.message || 'Yeni rayon/şəhər bazaya salındı' });
      setShowAddDistrictModal(false);
      setDistrictForm({ name: '', region_type: 'rayon', parent_region: 'Naxçıvan MR' });
      loadDistricts();
    } else {
      setAlertBanner({ type: 'error', message: res.error || 'Xəta baş verdi' });
    }
  };

  const handleSaveSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementForm.name) {
      setAlertBanner({ type: 'error', message: 'Kənd və ya qəsəbə adı daxil edilməlidir' });
      return;
    }
    const res = await api.addUtisSettlement(settlementForm);
    if (res.success) {
      setAlertBanner({ type: 'success', message: res.message || 'Kənd/qəsəbə bazaya əlavə edildi' });
      setShowAddSettlementModal(false);
      setSettlementForm({ district_name: 'Babək rayonu', name: '', settlement_type: 'kend' });
      loadSettlements(selectedDistrict);
    } else {
      setAlertBanner({ type: 'error', message: res.error || 'Xəta baş verdi' });
    }
  };

  // ==========================================
  // SINAQ İMTAHANLARI VƏ CANLI UTİS SORĞUSU
  // ==========================================
  const toggleStudentSelection = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const selectAllStudents = () => {
    const next = new Set<string>();
    examStudentsList.forEach(s => {
      if (s.utis_code && s.utis_code.trim().length >= 5) {
        next.add(s.id);
      }
    });
    setSelectedStudentIds(next);
  };

  const deselectAllStudents = () => {
    setSelectedStudentIds(new Set());
  };

  const handleRunBatchExamQuery = async () => {
    const targets = examStudentsList.filter(s => selectedStudentIds.has(s.id));
    if (targets.length === 0) {
      setAlertBanner({ type: 'error', message: 'Nəticəsi yoxlanılacaq ən azı bir şagird seçilməlidir' });
      return;
    }
    if (!selectedExamId) {
      setAlertBanner({ type: 'error', message: 'Zəhmət olmasa sınaq imtahanını seçin' });
      return;
    }

    setIsQuerying(true);
    setCancelRequested(false);
    setLiveResults([]);

    let checked = 0;
    let found = 0;
    let notFound = 0;
    let errors = 0;
    const resultsAccumulator: any[] = [];

    setQueryProgress({
      total: targets.length,
      checked: 0,
      found: 0,
      notFound: 0,
      errors: 0,
      currentStudentName: targets[0].full_name,
      percentage: 0
    });

    for (let i = 0; i < targets.length; i++) {
      if (cancelRequested) {
        setAlertBanner({ type: 'info', message: 'Sorğu istifadəçi tərəfindən dayandırıldı' });
        break;
      }

      const st = targets[i];
      setQueryProgress(prev => ({
        ...prev,
        currentStudentName: st.full_name,
        checked: i,
        percentage: Math.round((i / targets.length) * 100)
      }));

      try {
        const queryRes = await api.queryMinistryStudent({
          student_id: st.id,
          student_name: st.full_name,
          student_surname: st.last_name || '',
          utis_code: st.utis_code || '',
          grade: st.grade_class || 'IX sinif',
          exam_id: selectedExamId,
          exam_title: selectedExamTitle
        });

        const resData = queryRes.result || {
          student_id: st.id,
          student_name: st.full_name,
          utis_code: st.utis_code,
          grade: st.grade_class,
          exam_title: selectedExamTitle,
          status: 'error',
          error_message: queryRes.error || 'Əlaqə xətası'
        };

        if (resData.status === 'found') found++;
        else if (resData.status === 'not_found' || resData.status === 'no_utis') notFound++;
        else errors++;

        checked++;
        resultsAccumulator.push(resData);
        setLiveResults([...resultsAccumulator]);
      } catch (err: any) {
        errors++;
        checked++;
        const errResult = {
          student_id: st.id,
          student_name: st.full_name,
          utis_code: st.utis_code,
          grade: st.grade_class,
          exam_title: selectedExamTitle,
          status: 'error',
          error_message: err.message || 'Sorğu xətası'
        };
        resultsAccumulator.push(errResult);
        setLiveResults([...resultsAccumulator]);
      }

      setQueryProgress({
        total: targets.length,
        checked,
        found,
        notFound,
        errors,
        currentStudentName: i < targets.length - 1 ? targets[i + 1].full_name : '',
        percentage: Math.round((checked / targets.length) * 100)
      });

      // Nazirliyin saytının limitini qorumaq üçün idarə olunan fasilə (600ms)
      if (i < targets.length - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    }

    setIsQuerying(false);
    setAlertBanner({
      type: 'success',
      message: `Sorğu tamamlandı: ${found} nəticə tapıldı, ${notFound} tapılmadı, ${errors} xəta.`
    });
  };

  // Tək bir şagirdin nəticəsini yenidən yoxla
  const handleRetrySingle = async (item: any) => {
    try {
      const res = await api.queryMinistryStudent({
        student_id: item.student_id,
        student_name: item.student_name,
        student_surname: item.student_surname || '',
        utis_code: item.utis_code,
        grade: item.grade || 'IX sinif',
        exam_id: selectedExamId,
        exam_title: selectedExamTitle
      });

      if (res.result) {
        setLiveResults(prev => prev.map(p => p.student_id === item.student_id ? res.result : p));
        setAlertBanner({ type: 'success', message: `${item.student_name} üçün nəticə yeniləndi: ${res.result.status === 'found' ? res.result.score + ' bal' : 'Tapılmadı'}` });
      }
    } catch (e: any) {
      setAlertBanner({ type: 'error', message: 'Təkrar yoxlanış zamanı xəta: ' + e.message });
    }
  };

  // ==========================================
  // UTİS SİNXRONLAŞDIRMA VƏ QAPI PARAMETRLƏRİ
  // ==========================================
  const handleSaveUtisSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.updateUtisSettings({
      api_url: gatewayUrl,
      exam_source_url: examSourceUrl,
      api_key: apiKey,
      organization_code: orgCode
    });
    if (res.success) {
      setAlertBanner({ type: 'success', message: 'UTİS sistem tənzimləmələri yadda saxlanıldı' });
    } else {
      setAlertBanner({ type: 'error', message: res.error || 'Yadda saxlanılarkən xəta' });
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('UTİS elektron reyestri ilə əlaqə qurulur və məlumatlar yoxlanılır...');
    const res = await api.syncUtis();
    setIsSyncing(false);
    if (res.success) {
      setSyncStatusMsg(res.message || 'Sinxronlaşdırma uğurla başa çatdı');
      setAlertBanner({ type: 'success', message: res.message || 'UTİS bazası ilə sinxronlaşdırıldı' });
      loadSyncHistory();
      loadStudents();
    } else {
      setSyncStatusMsg('Xəta: ' + (res.error || 'Əlaqə qurula bilmədi'));
      setAlertBanner({ type: 'error', message: res.error || 'Sinxronlaşdırma xətası' });
    }
  };

  // ==========================================
  // EXCEL İDXALI VƏ İXRACI
  // ==========================================
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportDatabaseExcel = () => {
    if (students.length === 0) {
      setAlertBanner({ type: 'info', message: 'İxrac ediləcək şagird məlumatı yoxdur' });
      return;
    }

    const exportData = students.map((s, idx) => ({
      'Sıra №': idx + 1,
      'Adı': s.first_name || s.full_name?.split(' ')[0] || '',
      'Soyadı': s.last_name || s.full_name?.split(' ')[1] || '',
      'Ata adı': s.father_name || '',
      'UTİS kodu': s.utis_code || '',
      'FİN kodu': s.fin_code || '',
      'Sinfi': s.grade_class || '',
      'Məktəb': s.school_name || '',
      'Rayon / Şəhər': s.district || '',
      'Kənd / Qəsəbə': s.settlement || '',
      'Son Yenilənmə': s.updated_at ? new Date(s.updated_at).toLocaleDateString('az-AZ') : ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'UTİS Şagird Bazası');
    const fileName = `ATROQ_UTIS_Məktəb_Şagird_Bazası_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    setAlertBanner({ type: 'success', message: `Məlumatlar ${fileName} faylına ixrac edildi` });
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Adı': 'Murad',
        'Soyadı': 'Əliyev',
        'Ata adı': 'Rəşad',
        'UTİS kodu': '4512389',
        'FİN kodu': '7ABC123',
        'Sinfi': 'IX sinif',
        'Məktəb': 'Q.Sadiqov adına Cəhri qəsəbə 2 №-li tam orta məktəb',
        'Rayon / Şəhər': 'Babək rayonu',
        'Kənd / Qəsəbə': 'Cəhri qəsəbəsi'
      },
      {
        'Adı': 'Aysel',
        'Soyadı': 'Məmmədova',
        'Ata adı': 'Vüqar',
        'UTİS kodu': '4512390',
        'FİN kodu': '7XYZ456',
        'Sinfi': 'XI sinif',
        'Məktəb': 'Şıxmahmud kənd tam orta məktəbi',
        'Rayon / Şəhər': 'Babək rayonu',
        'Kənd / Qəsəbə': 'Şıxmahmud kəndi'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'UTİS İdxal Şablonu');
    XLSX.writeFile(wb, 'ATROQ_UTIS_Məktəb_Şagird_Sablon.xlsx');
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          setAlertBanner({ type: 'error', message: 'Excel faylında məlumat tapılmadı' });
          return;
        }

        let addedCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        for (const row of data) {
          const fName = row['Adı'] || row['Ad'] || row['First Name'] || '';
          const lName = row['Soyadı'] || row['Soyad'] || row['Last Name'] || '';
          const fatherName = row['Ata adı'] || row['Ata adi'] || row['Father Name'] || '';
          const utis = String(row['UTİS kodu'] || row['UTIS kodu'] || row['UTIS'] || row['UTİS'] || '').trim();
          const grade = row['Sinfi'] || row['Sinif'] || row['Grade'] || 'IX sinif';
          const school = row['Məktəb'] || row['Mekteb'] || row['School'] || 'Q.Sadiqov adına Cəhri qəsəbə 2 №-li tam orta məktəb';
          const district = row['Rayon / Şəhər'] || row['Rayon'] || row['District'] || 'Babək rayonu';
          const settlement = row['Kənd / Qəsəbə'] || row['Kend / Qesebe'] || row['Settlement'] || 'Cəhri qəsəbəsi';

          if (!utis || utis.length < 5) {
            errorCount++;
            continue;
          }

          const res = await api.addUtisStudent({
            first_name: fName,
            last_name: lName,
            father_name: fatherName,
            utis_code: utis,
            grade_class: grade,
            school_name: school,
            district,
            settlement
          });

          if (res.success) {
            addedCount++;
          } else {
            duplicateCount++;
          }
        }

        setAlertBanner({
          type: 'success',
          message: `Excel idxalı tamamlandı: ${addedCount} yeni şagird əlavə edildi, ${duplicateCount} təkrar UTİS aşkar olundu, ${errorCount} xətalı sətir.`
        });
        loadStudents();
      } catch (err: any) {
        setAlertBanner({ type: 'error', message: 'Excel faylının oxunmasında xəta: ' + err.message });
      }
    };
    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================== */}
        {/* BAŞLIQ VƏ MODULUN ƏSAS İDARƏETMƏ PANİ */}
        {/* ========================================== */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20 text-white">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    UTİS İnteqrasiyası və Məktəb Bazası
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    Ölkə Vahid Reyestri
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Azərbaycan Respublikası üzrə məktəblərin və şagirdlərin UTİS inteqrasiyası, sınaq imtahanları və regional reytinq platforması
                </p>
              </div>
            </div>

            {/* İnteqrasiya Statusu Göstəricisi */}
            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-xs">
                <span className="text-slate-400">UTİS Reyestr Statusu: </span>
                <span className="text-emerald-400 font-semibold">Aktiv və Dinamik</span>
              </div>
            </div>
          </div>

          {/* ƏSAS TAB NAVİQASİYASI (5 ƏSAS BÖLMƏ) */}
          <div className="flex items-center gap-1 sm:gap-2 mt-6 overflow-x-auto border-b border-slate-800 pb-2 scrollbar-none">
            <button
              onClick={() => setActiveMainTab('registry')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeMainTab === 'registry'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users2 className="w-4 h-4" />
              <span>Məktəb və Şagird Bazası</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 text-slate-300 font-mono">
                {totalStudentsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('exams')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeMainTab === 'exams'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Sınaq İmtahanları və UTİS Sorğusu</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                Canlı
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeMainTab === 'stats'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Regional Statistika və Reytinq</span>
            </button>

            <button
              onClick={() => setActiveMainTab('excel')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeMainTab === 'excel'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel ilə İdxal / İxrac</span>
            </button>

            <button
              onClick={() => setActiveMainTab('gateway')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeMainTab === 'gateway'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Nazirlik UTİS Qapısı & Tənzimləmə</span>
            </button>
          </div>
        </div>

        {/* XƏBƏRDARLIQ VƏ YA UĞUR BANNERİ */}
        {alertBanner && (
          <div className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm transition-all ${
            alertBanner.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              : alertBanner.type === 'error'
              ? 'bg-red-950/60 border-red-800 text-red-200'
              : 'bg-blue-950/60 border-blue-800 text-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              {alertBanner.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {alertBanner.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
              {alertBanner.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
              <span>{alertBanner.message}</span>
            </div>
            <button onClick={() => setAlertBanner(null)} className="p-1 hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: MƏKTƏB VƏ ŞAGİRD BAZASI (DİNAMİK ÖLKƏ VƏ REGİONAL REYESTRİ)         */}
        {/* ========================================================================= */}
        {activeMainTab === 'registry' && (
          <div className="space-y-6">

            {/* ƏSAS STATİSTİK KARTLAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">Rayon və Şəhərlər</span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{districts.length}</p>
                <span className="text-[10px] text-blue-400">Bütün Azərbaycan üzrə</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">Qeydiyyatdakı Məktəblər</span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{schools.length}</p>
                <span className="text-[10px] text-indigo-400">Dinamik baza</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">Ümumi Şagird Sayı</span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{totalStudentsCount}</p>
                <span className="text-[10px] text-emerald-400">Aktiv şagirdlər</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">UTİS Kodlu Şagirdlər</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">{withUtisCount}</p>
                <span className="text-[10px] text-slate-400">{Math.round((withUtisCount / (totalStudentsCount || 1)) * 100)}% təminat</span>
              </div>
            </div>

            {/* DİNAMİK FİLTR PANELİ VƏ İNZİBATİ ƏLAVƏ DÜYMƏLƏRİ */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">İyerarxik Axtarış və Filtrlər</h3>
                </div>

                {/* Dinamik Yeni Struktur Əlavə Et Düymələri (Tələb 6: Kod dəyişmədən yeni rayon, kənd və məktəb əlavə etmək) */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowAddDistrictModal(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-400" />
                    <span>Yeni Rayon/Şəhər</span>
                  </button>
                  <button
                    onClick={() => setShowAddSettlementModal(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Yeni Kənd/Qəsəbə</span>
                  </button>
                  <button
                    onClick={() => setShowAddSchoolModal(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Yeni Məktəb</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingStudent(null);
                      setShowAddStudentModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Şagird</span>
                  </button>
                </div>
              </div>

              {/* FİLTR SEÇİMLƏRİ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Rayon və ya Şəhər */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Rayon / Şəhər:</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedSettlement('all');
                      setSelectedSchool('all');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Bütün Rayon və Şəhərlər</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.name}>{d.name} ({d.student_count || 0} şagird)</option>
                    ))}
                  </select>
                </div>

                {/* 2. Kənd və ya Qəsəbə */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Kənd / Qəsəbə:</label>
                  <select
                    value={selectedSettlement}
                    onChange={(e) => {
                      setSelectedSettlement(e.target.value);
                      setSelectedSchool('all');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Bütün Kənd və Qəsəbələr</option>
                    {settlements.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Məktəb */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Məktəb:</label>
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Bütün Məktəblər</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.student_count || 0})</option>
                    ))}
                  </select>
                </div>

                {/* 4. Sinif */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Sinif:</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Bütün Siniflər (I - XI)</option>
                    {ROMAN_CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CANLI AXTARIŞ SƏTRİ */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Şagirdin adı, soyadı, ata adı və ya 7-rəqəmli UTİS kodu ilə dərhal axtar..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* ŞAGİRDLƏRİN ƏTRAFLI CƏDVƏLİ */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Şagirdlərin Siyahısı</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {students.length} şagird göstərilir
                  </span>
                </div>
                <button
                  onClick={handleExportDatabaseExcel}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-600/30 hover:bg-emerald-600/30 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel-ə İxrac Et</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3 w-12 text-center">№</th>
                      <th className="py-3 px-4">Şagirdin Adı, Soyadı</th>
                      <th className="py-3 px-3">Ata Adı</th>
                      <th className="py-3 px-3">Sinfi</th>
                      <th className="py-3 px-4">UTİS Kodu</th>
                      <th className="py-3 px-4">Məktəb</th>
                      <th className="py-3 px-4">Rayon / Kənd</th>
                      <th className="py-3 px-3 text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                          Məlumatlar yüklənir...
                        </td>
                      </tr>
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          Seçilmiş filtrlərə uyğun heç bir şagird tapılmadı.
                        </td>
                      </tr>
                    ) : (
                      students.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                          <td className="py-3 px-4 font-medium text-white">{st.full_name}</td>
                          <td className="py-3 px-3 text-slate-300">{st.father_name || '—'}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                              {st.grade_class || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium">
                            {st.utis_code ? (
                              <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                                {st.utis_code}
                              </span>
                            ) : (
                              <span className="text-red-400 text-[10px] bg-red-950/40 px-1.5 py-0.5 rounded border border-red-800/50">
                                UTİS Yoxdur
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={st.school_name}>
                            {st.school_name || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            <div>{st.district || '—'}</div>
                            <div className="text-slate-500 text-[10px]">{st.settlement || ''}</div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingStudent(st);
                                  setStudentForm({
                                    first_name: st.first_name || st.full_name?.split(' ')[0] || '',
                                    last_name: st.last_name || st.full_name?.split(' ')[1] || '',
                                    father_name: st.father_name || '',
                                    utis_code: st.utis_code || '',
                                    grade_class: st.grade_class || 'IX sinif',
                                    district: st.district || 'Babək rayonu',
                                    settlement: st.settlement || 'Cəhri qəsəbəsi',
                                    school_name: st.school_name || 'Q.Sadiqov adına Cəhri qəsəbə 2 №-li tam orta məktəb'
                                  });
                                  setShowAddStudentModal(true);
                                }}
                                className="p-1.5 hover:bg-blue-600/20 text-slate-400 hover:text-blue-300 rounded-lg transition-colors"
                                title="Redaktə et"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(st.id, st.full_name)}
                                className="p-1.5 hover:bg-red-600/20 text-slate-400 hover:text-red-300 rounded-lg transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SINAQ İMTAHANLARI VƏ CANLI UTİS SORĞUSU                              */}
        {/* ========================================================================= */}
        {activeMainTab === 'exams' && (
          <div className="space-y-6">

            {/* 1. İMTAHAN SEÇİMİ */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</div>
                  <h3 className="text-sm font-semibold text-white">Sınaq İmtahanını Seçin (Nazirliyin Rəsmi Siyahısı)</h3>
                </div>
                <button
                  onClick={loadExams}
                  disabled={loadingExams}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingExams ? 'animate-spin' : ''}`} />
                  <span>Yenilə</span>
                </button>
              </div>

              <select
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  const found = availableExams.find(ex => ex.id === e.target.value);
                  if (found) setSelectedExamTitle(found.title);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {availableExams.map(ex => (
                  <option key={ex.id} value={ex.id}>№{ex.id} • {ex.title}</option>
                ))}
              </select>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Rəsmi mənbə: <a href={examSourceUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">{examSourceUrl}</a></span>
                <span>Seçilmiş İmtahan Kodu: <strong className="text-white font-mono">{selectedExamId}</strong></span>
              </div>
            </div>

            {/* 2. DİNAMİK BAZADAN RAYON, MƏKTƏB VƏ ŞAGİRD SEÇİLMƏSİ */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold">2</div>
                  <h3 className="text-sm font-semibold text-white">Şagirdlərin Seçilməsi (Rayon və Məktəbə görə)</h3>
                </div>
                <div className="text-xs text-slate-400">
                  Seçilib: <strong className="text-emerald-400 font-mono">{selectedStudentIds.size}</strong> / {examStudentsList.length} şagird
                </div>
              </div>

              {/* Filtr Zolağı: Rayon, Məktəb, Sinif */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Rayon / Şəhər Seçin:</label>
                  <select
                    value={examDistrict}
                    onChange={(e) => setExamDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Bütün Rayonlar</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Məktəb Seçin:</label>
                  <select
                    value={examSchool}
                    onChange={(e) => setExamSchool(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Bütün Məktəblər</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Sinif Seçin:</label>
                  <select
                    value={examGrade}
                    onChange={(e) => setExamGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Bütün Siniflər</option>
                    {ROMAN_CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seçim Düymələri */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllStudents}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    Hamısını Seç (UTİS kodlu)
                  </button>
                  <button
                    onClick={deselectAllStudents}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    Seçimi Təmizlə
                  </button>
                </div>

                {/* ƏSAS ƏMƏLİYYAT DÜYMƏSİ: NƏTİCƏLƏRİ ƏLDƏ ET */}
                <div className="flex items-center gap-2">
                  {isQuerying ? (
                    <button
                      onClick={() => setCancelRequested(true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Sorğunu Dayandır</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleRunBatchExamQuery}
                      disabled={selectedStudentIds.size === 0}
                      className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Nəticələri Avtomatik Əldə Et ({selectedStudentIds.size} şagird)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Şagird Seçim Qutuları (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1 bg-slate-950/40 rounded-xl border border-slate-800/60">
                {examStudentsList.map(st => {
                  const isSelected = selectedStudentIds.has(st.id);
                  const hasUtis = st.utis_code && st.utis_code.trim().length >= 5;

                  return (
                    <div
                      key={st.id}
                      onClick={() => hasUtis && toggleStudentSelection(st.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                        !hasUtis
                          ? 'opacity-40 bg-slate-900 border-slate-800 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-950/60 border-blue-500 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-600 bg-slate-950'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="truncate">
                          <p className="font-medium truncate">{st.full_name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{st.grade_class}</span>
                            <span>•</span>
                            <span className="font-mono text-emerald-400">{st.utis_code || 'UTİS yoxdur'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. İRƏLİLƏYİŞ PANELİ VƏ STATUS KARTLARI (Canlı sorğu vaxtı) */}
            {(isQuerying || liveResults.length > 0) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-semibold text-white">Sorğunun Gedişatı və Nəticə Göstəriciləri</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400">{queryProgress.percentage}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${queryProgress.percentage}%` }}
                  />
                </div>

                {isQuerying && (
                  <p className="text-xs text-slate-400">
                    Hal-hazırda yoxlanılır: <strong className="text-white">{queryProgress.currentStudentName}</strong>
                  </p>
                )}

                {/* 5 Status Kartı (Tələb 6) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-slate-400">Ümumi Say</span>
                    <p className="text-lg font-bold text-white mt-0.5">{queryProgress.total}</p>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-slate-400">Yoxlanılan</span>
                    <p className="text-lg font-bold text-blue-400 mt-0.5">{queryProgress.checked}</p>
                  </div>
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-emerald-300">Tapılan Nəticə</span>
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">{queryProgress.found}</p>
                  </div>
                  <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-amber-300">Tapılmadı</span>
                    <p className="text-lg font-bold text-amber-400 mt-0.5">{queryProgress.notFound}</p>
                  </div>
                  <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-red-300">Xətalı Sorğu</span>
                    <p className="text-lg font-bold text-red-400 mt-0.5">{queryProgress.errors}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ƏLDƏ EDİLMİŞ CANLI NƏTİCƏLƏR CƏDVƏLİ */}
            {liveResults.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">Əldə Edilmiş Sınaq Nəticələri</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {liveResults.length} nəticə
                    </span>
                  </div>
                  <button
                    onClick={() => exportMinistryExamResultsToExcel(liveResults, selectedExamTitle, examGrade)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-600/30 hover:bg-emerald-600/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel-ə İxrac (.xlsx)</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3 w-12 text-center">№</th>
                        <th className="py-3 px-4">Şagirdin Adı, Soyadı</th>
                        <th className="py-3 px-3">Sinfi</th>
                        <th className="py-3 px-4">UTİS Kodu</th>
                        <th className="py-3 px-4">İmtahanın Adı</th>
                        <th className="py-3 px-3 text-center">Topladığı Bal</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-right">Təkrar Yoxla</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {liveResults.map((r, idx) => (
                        <tr key={r.student_id || idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                          <td className="py-3 px-4 font-medium text-white">{r.student_name}</td>
                          <td className="py-3 px-3 text-slate-300">{r.grade || '—'}</td>
                          <td className="py-3 px-4 font-mono text-slate-300">{r.utis_code}</td>
                          <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={r.exam_title}>{r.exam_title}</td>
                          <td className="py-3 px-3 text-center">
                            {r.status === 'found' && r.score !== null ? (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                                {r.score} bal
                              </span>
                            ) : (
                              <span className="text-slate-500 font-mono">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {r.status === 'found' ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                                Tapıldı
                              </span>
                            ) : r.status === 'not_found' ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800">
                                Nəticə tapılmadı
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-950/60 text-red-300 border border-red-800" title={r.error_message}>
                                Xəta baş verdi
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleRetrySingle(r)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                              title="Təkrar yoxla"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: REGİONAL STATİSTİKA VƏ REYTİNQ                                      */}
        {/* ========================================================================= */}
        {activeMainTab === 'stats' && (
          <div className="space-y-6">

            {/* KPI İCMAL KARTLARI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">Ümumi Məktəblər</span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{regionalStatsData.overview?.total_schools || schools.length}</p>
                <span className="text-[10px] text-blue-400">Azərbaycan üzrə</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">Ümumi Şagirdlər</span>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">{regionalStatsData.overview?.total_students || totalStudentsCount}</p>
                <span className="text-[10px] text-indigo-400">Reyestrdə aktiv</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">Yoxlanılan Sınaq Nəticələri</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">{historyStats?.total || 0}</p>
                <span className="text-[10px] text-emerald-400">{historyStats?.participated_count || 0} iştirakçı</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400">Orta Sınaq Balı</span>
                <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">{historyStats?.avg_score || 0}</p>
                <span className="text-[10px] text-slate-400">Ən yüksək: {historyStats?.max_score || 0}</span>
              </div>
            </div>

            {/* MƏKTƏBLƏRİN REYTİNQ CƏDVƏLİ */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Məktəblərin Şagird və Sınaq Reytinqi</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Məktəblər üzrə şagird sayı, toplanmış nəticələr və orta bal sıralaması</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3 w-12 text-center">№</th>
                      <th className="py-3 px-4">Məktəbin Adı</th>
                      <th className="py-3 px-4">Rayon / Şəhər</th>
                      <th className="py-3 px-3">Kənd / Qəsəbə</th>
                      <th className="py-3 px-3 text-center">UTİS Kodu</th>
                      <th className="py-3 px-3 text-center">Şagird Sayı</th>
                      <th className="py-3 px-3 text-center">Orta Bal</th>
                      <th className="py-3 px-3 text-center">Ən Yüksək</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(regionalStatsData.schools || schools).map((sch: any, idx: number) => (
                      <tr key={sch.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-white">{sch.name || sch.school_name}</td>
                        <td className="py-3 px-4 text-slate-300">{sch.district}</td>
                        <td className="py-3 px-3 text-slate-400">{sch.settlement || '—'}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{sch.utis_code || '—'}</td>
                        <td className="py-3 px-3 text-center font-bold text-white">{sch.student_count || 0}</td>
                        <td className="py-3 px-3 text-center font-mono text-amber-400 font-semibold">{sch.avg_score ? Number(sch.avg_score).toFixed(1) : '—'}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{sch.max_score ? sch.max_score : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RAYONLAR ÜZRƏ MÜQAYİSƏ CƏDVƏLİ */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white">Rayon və Şəhərlər üzrə Müqayisəli Təhlil</h3>
                <p className="text-xs text-slate-400 mt-0.5">Azərbaycanın rayonları üzrə məktəb, şagird və imtahan aktivliyi</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3 w-12 text-center">№</th>
                      <th className="py-3 px-4">Rayon / Şəhər</th>
                      <th className="py-3 px-4">İqtisadi / Regional Zona</th>
                      <th className="py-3 px-3 text-center">Məktəb Sayı</th>
                      <th className="py-3 px-3 text-center">Şagird Sayı</th>
                      <th className="py-3 px-3 text-center">Sınaq Nəticələri</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(regionalStatsData.districts || districts).map((dst: any, idx: number) => (
                      <tr key={dst.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-white">{dst.name || dst.district_name}</td>
                        <td className="py-3 px-4 text-slate-400">{dst.parent_region || 'Azərbaycan'}</td>
                        <td className="py-3 px-3 text-center font-mono text-blue-400 font-semibold">{dst.school_count || 0}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">{dst.student_count || 0}</td>
                        <td className="py-3 px-3 text-center font-mono text-amber-400">{dst.exam_results_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: EXCEL İLƏ İDXAL VƏ İXRAC                                            */}
        {/* ========================================================================= */}
        {activeMainTab === 'excel' && (
          <div className="space-y-6">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white">Excel ilə Alternativ Şagird və Məktəb İdxalı</h3>
                <p className="text-xs text-slate-400 mt-1">
                  UTİS portalına rəsmi birbaşa qoşulma olmadığı hallarda və ya yeni məktəb qoşulduqda şagird bazasını Excel (.xlsx / .xls) faylından bir kliklə bazaya əlavə edə bilərsiniz.
                </p>
              </div>

              {/* TƏLƏB 8 ÜZRƏ TƏLİMAT VƏ ŞABLON */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Excel Faylında Tələb Olunan Sütunlar:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">1. Adı</div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">2. Soyadı</div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">3. Ata adı</div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">4. UTİS kodu (Əsas)</div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">5. Sinfi (məs: IX sinif)</div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">6. Məktəb adı</div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">7. Rayon / Şəhər</div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">8. Kənd / Qəsəbə</div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleDownloadTemplate}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>Nümunəvi Excel Şablonunu Yüklə (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* FAYL YÜKLƏMƏ SAHƏSİ */}
              <div className="border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-2xl p-8 text-center transition-colors bg-slate-950/50">
                <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white mb-1">Excel faylınızı buraya sürükləyin və ya seçin</p>
                <p className="text-xs text-slate-500 mb-4">Dəstəklənən formatlar: .xlsx, .xls (Maksimum 10,000 sətir)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleExcelUpload}
                  accept=".xlsx, .xls"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all inline-flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Kompüterdən Fayl Seçin</span>
                </button>
              </div>

              {/* BAZANI İXRAC ET */}
              <div className="flex items-center justify-between p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div>
                  <h4 className="text-xs font-semibold text-white">Mövcud Şagird Bazasını İxrac Edin</h4>
                  <p className="text-[11px] text-slate-400">Bütün rayonlar, məktəblər və siniflər üzrə şagirdlərin siyahısını Excel faylına çıxarın</p>
                </div>
                <button
                  onClick={handleExportDatabaseExcel}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Tam Bazanı Yüklə ({totalStudentsCount} şagird)</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: NAZİRLİK UTİS GATEWAY VƏ TƏNZİMLƏMƏLƏR                               */}
        {/* ========================================================================= */}
        {activeMainTab === 'gateway' && (
          <div className="space-y-6">

            {/* RƏSMİ İCAZƏ VƏ HÜQUQİ STATUS XƏBƏRDARLIĞI (Tələb 3, 11 və 13) */}
            <div className="bg-blue-950/30 border border-blue-800/60 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Azərbaycan Respublikası Elm və Təhsil Nazirliyi UTİS İnteqrasiya Protokolu</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Elm və Təhsil Nazirliyinin dövlət təhlükəsizlik və fərdi məlumatların qorunması qaydalarına əsasən, mərkəzləşdirilmiş UTİS sisteminə birbaşa çıxış rəsmi dövlət akkreditasiyası, ikitərəfli müqavilə və təhlükəsizlik tokeni (API Açarı) ilə təmin olunur.
              </p>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Rəsmi İnteqrasiya Hazırlığı: <strong className="text-emerald-400">Tam Hazır (Level 4 Ready)</strong></span>
                <span>Təşkilat Kodu: <strong className="text-white font-mono">{orgCode}</strong></span>
              </div>
            </div>

            {/* GATEWAY VƏ SİNXRONLAŞDIRMA FORMASI */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-white">İnteqrasiya Qapısı Parametrləri</h3>
                <button
                  onClick={handleTriggerSync}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sinxronlaşdırılır...' : 'İndi Sinxronlaşdır'}</span>
                </button>
              </div>

              {syncStatusMsg && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  {syncStatusMsg}
                </div>
              )}

              <form onSubmit={handleSaveUtisSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">UTİS Mərkəzi Gateway URL:</label>
                    <input
                      type="url"
                      value={gatewayUrl}
                      onChange={(e) => setGatewayUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Sınaq İmtahanları Mənbə URL:</label>
                    <input
                      type="url"
                      value={examSourceUrl}
                      onChange={(e) => setExamSourceUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Təşkilatın UTİS Kodu:</label>
                    <input
                      type="text"
                      value={orgCode}
                      onChange={(e) => setOrgCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Rəsmi API Açarı (Token):</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Nazirlik tərəfindən təqdim edilən token"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all"
                  >
                    Tənzimləmələri Yadda Saxla
                  </button>
                </div>
              </form>
            </div>

            {/* SİNXRONLAŞDIRMA TARİXÇƏSİ */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white">Sinxronlaşdırma Tarixçəsi</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Tarix</th>
                      <th className="py-3 px-4">Növ</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Sinxron Qeydlər</th>
                      <th className="py-3 px-4">Qeyd və Nəticə</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {syncHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">Hələ ki, sinxronlaşdırma qeydi yoxdur.</td>
                      </tr>
                    ) : (
                      syncHistory.map((sh, idx) => (
                        <tr key={sh.id || idx} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {new Date(sh.created_at).toLocaleString('az-AZ')}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{sh.sync_type}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              Uğurlu
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-white">{sh.total_synced}</td>
                          <td className="py-3 px-4 text-slate-400 text-xs">{sh.notes}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: YENİ VƏ YA REDAKTƏ EDİLƏN ŞAGİRD                                 */}
      {/* ========================================================================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">
                {editingStudent ? 'Şagird Məlumatlarını Redaktə Et' : 'Yeni Şagird Əlavə Et'}
              </h3>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setEditingStudent(null);
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Adı:</label>
                  <input
                    type="text"
                    required
                    value={studentForm.first_name}
                    onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Soyadı:</label>
                  <input
                    type="text"
                    required
                    value={studentForm.last_name}
                    onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Ata Adı:</label>
                  <input
                    type="text"
                    value={studentForm.father_name}
                    onChange={(e) => setStudentForm({ ...studentForm, father_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">UTİS Kodu (7 rəqəmli):</label>
                  <input
                    type="text"
                    required
                    value={studentForm.utis_code}
                    onChange={(e) => setStudentForm({ ...studentForm, utis_code: e.target.value })}
                    placeholder="Məs: 4709365"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Sinfi:</label>
                  <select
                    value={studentForm.grade_class}
                    onChange={(e) => setStudentForm({ ...studentForm, grade_class: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {ROMAN_CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Rayon / Şəhər:</label>
                  <select
                    value={studentForm.district}
                    onChange={(e) => setStudentForm({ ...studentForm, district: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Kənd və ya Qəsəbə:</label>
                <input
                  type="text"
                  value={studentForm.settlement}
                  onChange={(e) => setStudentForm({ ...studentForm, settlement: e.target.value })}
                  placeholder="Məs: Cəhri qəsəbəsi, Şıxmahmud kəndi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Məktəb:</label>
                <select
                  value={studentForm.school_name}
                  onChange={(e) => setStudentForm({ ...studentForm, school_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.district})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                >
                  {editingStudent ? 'Yadda Saxla' : 'Əlavə Et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: YENİ MƏKTƏB ƏLAVƏ ET                                              */}
      {/* ========================================================================= */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">Yeni Məktəb Əlavə Et</h3>
              <button onClick={() => setShowAddSchoolModal(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchool} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Məktəbin Rəsmi Adı:</label>
                <input
                  type="text"
                  required
                  value={schoolForm.name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  placeholder="Məs: Şıxmahmud kənd tam orta məktəbi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Rayon / Şəhər:</label>
                <select
                  value={schoolForm.district}
                  onChange={(e) => setSchoolForm({ ...schoolForm, district: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {districts.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Kənd və ya Qəsəbə:</label>
                <input
                  type="text"
                  value={schoolForm.settlement}
                  onChange={(e) => setSchoolForm({ ...schoolForm, settlement: e.target.value })}
                  placeholder="Məs: Şıxmahmud kəndi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Məktəb UTİS Kodu:</label>
                  <input
                    type="text"
                    value={schoolForm.utis_code}
                    onChange={(e) => setSchoolForm({ ...schoolForm, utis_code: e.target.value })}
                    placeholder="Məs: 7002009"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Məktəb Tipi:</label>
                  <select
                    value={schoolForm.school_type}
                    onChange={(e) => setSchoolForm({ ...schoolForm, school_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="tam_orta">Tam orta</option>
                    <option value="umumi_orta">Ümumi orta</option>
                    <option value="lisey">Lisey</option>
                    <option value="gimnaziya">Gimnaziya</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                >
                  Məktəbi Əlavə Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: YENİ RAYON / ŞƏHƏR ƏLAVƏ ET                                       */}
      {/* ========================================================================= */}
      {showAddDistrictModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">Yeni Rayon / Şəhər Əlavə Et</h3>
              <button onClick={() => setShowAddDistrictModal(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDistrict} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Adı:</label>
                <input
                  type="text"
                  required
                  value={districtForm.name}
                  onChange={(e) => setDistrictForm({ ...districtForm, name: e.target.value })}
                  placeholder="Məs: Şuşa rayonu, Şəki şəhəri"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Növü:</label>
                <select
                  value={districtForm.region_type}
                  onChange={(e) => setDistrictForm({ ...districtForm, region_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="rayon">Rayon</option>
                  <option value="seher">Şəhər</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">İqtisadi / Coğrafi Zona:</label>
                <input
                  type="text"
                  value={districtForm.parent_region}
                  onChange={(e) => setDistrictForm({ ...districtForm, parent_region: e.target.value })}
                  placeholder="Məs: Naxçıvan MR, Qarabağ, Bakı"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDistrictModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                >
                  Rayon Əlavə Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: YENİ KƏND / QƏSƏBƏ ƏLAVƏ ET                                       */}
      {/* ========================================================================= */}
      {showAddSettlementModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">Yeni Kənd / Qəsəbə Əlavə Et</h3>
              <button onClick={() => setShowAddSettlementModal(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettlement} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Aid Olduğu Rayon / Şəhər:</label>
                <select
                  value={settlementForm.district_name}
                  onChange={(e) => setSettlementForm({ ...settlementForm, district_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {districts.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Kənd və ya Qəsəbə Adı:</label>
                <input
                  type="text"
                  required
                  value={settlementForm.name}
                  onChange={(e) => setSettlementForm({ ...settlementForm, name: e.target.value })}
                  placeholder="Məs: Şıxmahmud kəndi, Cəhri qəsəbəsi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Növü:</label>
                <select
                  value={settlementForm.settlement_type}
                  onChange={(e) => setSettlementForm({ ...settlementForm, settlement_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="kend">Kənd</option>
                  <option value="qesebe">Qəsəbə</option>
                  <option value="seher_merkezi">Şəhər Mərkəzi</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSettlementModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  Kənd/Qəsəbə Əlavə Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
