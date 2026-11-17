// src/pages/MyTestsPage.tsx
import React, { useState, useEffect } from 'react';
import { User, Test, TestStatus } from '../types';
import { api } from '../lib/api';
import {
  PlusCircle,
  Search,
  Filter,
  Share2,
  Edit3,
  Copy,
  Trash2,
  Archive,
  Printer,
  BarChart2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Layers,
  Play,
  Calendar,
  Sparkles,
  Calculator,
  Compass,
  Cpu,
  Globe,
  Languages,
  Brain,
  CheckCircle2,
  Eye,
  FileQuestion
} from 'lucide-react';

interface MyTestsPageProps {
  user: User;
  initialTab?: 'subjects' | 'grades' | 'all';
  onNavigateCreate: () => void;
  onEditTest: (testId: string) => void;
  onOpenAnsweredTest?: (testId: string) => void;
  onShareTest: (test: Test) => void;
  onPrintTest: (test: Test) => void;
  onViewResults: (testId: string) => void;
  onStartTest?: (test: Test) => void;
}

const SUBJECTS_CONFIG = [
  { id: 'Azərbaycan dili', label: 'Azərbaycan dili', badge: 'Tədris dili', icon: BookOpen, color: 'from-blue-600 to-indigo-600', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Ədəbiyyat', label: 'Ədəbiyyat', badge: 'Humanitar', icon: BookOpen, color: 'from-emerald-600 to-teal-600', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'Riyaziyyat', label: 'Riyaziyyat', badge: 'Dəqiq elm', icon: Calculator, color: 'from-violet-600 to-purple-600', bg: 'bg-violet-50 text-violet-700 border-violet-200' },
  { id: 'Fizika', label: 'Fizika', badge: 'Dəqiq elm', icon: Sparkles, color: 'from-sky-600 to-cyan-600', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'Kimya', label: 'Kimya', badge: 'Təbiət', icon: Layers, color: 'from-amber-600 to-orange-600', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Biologiya', label: 'Biologiya', badge: 'Təbiət', icon: Compass, color: 'from-green-600 to-emerald-600', bg: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'İnformatika', label: 'İnformatika', badge: 'Rəqəmsal', icon: Cpu, color: 'from-cyan-600 to-blue-600', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'Tarix', label: 'Tarix', badge: 'Humanitar', icon: Compass, color: 'from-amber-700 to-yellow-600', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Coğrafiya', label: 'Coğrafiya', badge: 'Təbiət', icon: Globe, color: 'from-teal-600 to-emerald-600', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'İngilis dili', label: 'İngilis dili', badge: 'Xarici dil', icon: Languages, color: 'from-rose-600 to-pink-600', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'Fransız dili', label: 'Fransız dili', badge: 'Xarici dil', icon: Languages, color: 'from-indigo-600 to-purple-600', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'Rus dili', label: 'Rus dili', badge: 'Xarici dil', icon: Languages, color: 'from-slate-600 to-slate-800', bg: 'bg-slate-50 text-slate-700 border-slate-200' },
  { id: 'Məntiq', label: 'Məntiq', badge: 'Qabiliyyət', icon: Brain, color: 'from-fuchsia-600 to-pink-600', bg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
];

const GRADES_CONFIG = [
  '1-ci sinif',
  '2-ci sinif',
  '3-cü sinif',
  '4-cü sinif',
  '5-ci sinif',
  '6-cı sinif',
  '7-ci sinif',
  '8-ci sinif',
  '9-cu sinif',
  '10-cu sinif',
  '11-ci sinif',
  'Abituriyent'
];

export const MyTestsPage: React.FC<MyTestsPageProps> = ({
  user,
  initialTab = 'all',
  onNavigateCreate,
  onEditTest,
  onOpenAnsweredTest,
  onShareTest,
  onPrintTest,
  onViewResults,
  onStartTest,
}) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePortalTab, setActivePortalTab] = useState<'subjects' | 'grades' | 'all'>(initialTab);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Sync initial tab if changed from parent
  useEffect(() => {
    if (initialTab) {
      setActivePortalTab(initialTab);
    }
  }, [initialTab]);

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await api.getTests(user.id);
      setTests(data || []);
      setSelectedTestIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [user.id]);

  const handleDuplicate = async (testId: string) => {
    try {
      await api.duplicateTest(testId);
      setActionSuccess('Test uğurla nüsxələndi');
      setTimeout(() => setActionSuccess(''), 2500);
      loadTests();
    } catch {
      alert('Nüsxələmə zamanı xəta baş verdi');
    }
  };

  const handleDelete = async (testId: string) => {
    if (!window.confirm('Bu testi silmək istədiyinizdən əminsiniz?')) return;
    try {
      await api.deleteTest(testId);
      setActionSuccess('Test silindi');
      setSelectedTestIds(prev => prev.filter(id => id !== testId));
      setTimeout(() => setActionSuccess(''), 2500);
      loadTests();
    } catch {
      alert('Silinmə zamanı xəta');
    }
  };

  const handleToggleSelectTest = (testId: string) => {
    setSelectedTestIds(prev =>
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedTestIds.length === filteredTests.length && filteredTests.length > 0) {
      setSelectedTestIds([]);
    } else {
      setSelectedTestIds(filteredTests.map(t => t.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTestIds.length === 0) return;
    const count = selectedTestIds.length;
    const confirmText = count === 1
      ? 'Seçilmiş 1 testi silmək istədiyinizdən əminsiniz?'
      : `Seçilmiş ${count} ədəd testi tamamilə silmək istədiyinizdən əminsiniz?`;
    if (!window.confirm(confirmText)) return;

    try {
      setDeleting(true);
      await Promise.all(selectedTestIds.map(id => api.deleteTest(id)));
      setActionSuccess(`${count} test uğurla silindi`);
      setSelectedTestIds([]);
      setTimeout(() => setActionSuccess(''), 2500);
      await loadTests();
    } catch (err) {
      console.error(err);
      alert('Testləri silərkən xəta baş verdi');
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async (test: Test) => {
    try {
      const nextStatus = test.status === 'archived' ? 'published' : 'archived';
      await api.updateTest(test.id, { status: nextStatus });
      setActionSuccess(`Test ${nextStatus === 'archived' ? 'arxivləşdirildi' : 'arxivdən çıxarıldı'}`);
      setTimeout(() => setActionSuccess(''), 2500);
      loadTests();
    } catch {
      alert('Arxiv əməliyyatında xəta');
    }
  };

  // Automated subject & grade matching
  const getSubjectTestCount = (subjectName: string) => {
    return tests.filter(t => t.subject && t.subject.toLowerCase() === subjectName.toLowerCase()).length;
  };

  const getGradeTestCount = (gradeName: string) => {
    const clean = gradeName.replace(/[^0-9]/g, '');
    return tests.filter(t => {
      if (!t.grade_group) return false;
      if (clean && t.grade_group.includes(clean)) return true;
      if (gradeName.toLowerCase().includes('abituriyent') && t.grade_group.toLowerCase().includes('abituriyent')) return true;
      return t.grade_group.toLowerCase().includes(gradeName.toLowerCase());
    }).length;
  };

  const filteredTests = tests.filter((t) => {
    // Portal tab filter
    if (activePortalTab === 'subjects' && selectedSubject !== 'all') {
      if (t.subject?.toLowerCase() !== selectedSubject.toLowerCase()) return false;
    }
    if (activePortalTab === 'grades' && selectedGrade !== 'all') {
      const clean = selectedGrade.replace(/[^0-9]/g, '');
      const matchGrade = clean ? t.grade_group?.includes(clean) : t.grade_group?.toLowerCase().includes(selectedGrade.toLowerCase());
      if (!matchGrade) return false;
    }

    // Status filter
    const matchesStatus = activeStatus === 'all' ? t.status !== 'archived' : t.status === activeStatus;
    
    // Search
    const matchesSearch = !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.grade_group && t.grade_group.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.exam_model && t.exam_model.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Sınaq İmtahanları Portalı
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Cəmi {tests.length} test</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {activePortalTab === 'subjects' ? 'Fənlər üzrə Sınaq İmtahanları' :
             activePortalTab === 'grades' ? 'Siniflər üzrə Sınaq İmtahanları' :
             'Bütün Sınaq İmtahanları'}
          </h1>
          <p className="text-xs text-slate-500">
            Dövlət İmtahan Mərkəzi (DİM) standartlarına uyğun sınaqlar, fənn və sinif bölmələri
          </p>
        </div>

        <button
          onClick={onNavigateCreate}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Yeni Test Yarat
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {actionSuccess}
        </div>
      )}

      {/* 3-Section Navigation Bar (Fənlər, Siniflər, Bütün Testlər) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActivePortalTab('subjects')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activePortalTab === 'subjects'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Fənlər</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortalTab('grades')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activePortalTab === 'grades'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Siniflər</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortalTab('all');
              setSelectedSubject('all');
              setSelectedGrade('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activePortalTab === 'all'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>Bütün Testlərim ({tests.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sınaq adı və ya fənn axtar..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* ==============================================================
          BÖLMƏ 1: FƏNLƏR ÜZRƏ SEÇİM PANESİ (Oxuyan.az dizaynı)
          ============================================================== */}
      {activePortalTab === 'subjects' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Fənn Kateqoriyasını Seçin:
            </span>
            {selectedSubject !== 'all' && (
              <button
                onClick={() => setSelectedSubject('all')}
                className="text-xs text-indigo-600 hover:underline font-bold"
              >
                Filtrləməni sıfırla (Bütün fənlər)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
            {SUBJECTS_CONFIG.map((subj) => {
              const IconComp = subj.icon;
              const count = getSubjectTestCount(subj.label);
              const isSelected = selectedSubject.toLowerCase() === subj.label.toLowerCase();

              return (
                <div
                  key={subj.id}
                  onClick={() => setSelectedSubject(isSelected ? 'all' : subj.label)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count} test
                    </span>
                  </div>
                  <h4 className="font-black text-xs group-hover:text-indigo-600 truncate leading-tight">
                    {subj.label}
                  </h4>
                  <span className={`text-[10px] mt-1 block font-semibold ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {subj.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==============================================================
          BÖLMƏ 2: SİNİFLƏR ÜZRƏ SEÇİM PANESİ (1-ci sinifdən 11-ci sinfə qədər)
          ============================================================== */}
      {activePortalTab === 'grades' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Sinif və Dərəcəni Seçin (1–11-ci siniflər):
            </span>
            {selectedGrade !== 'all' && (
              <button
                onClick={() => setSelectedGrade('all')}
                className="text-xs text-indigo-600 hover:underline font-bold"
              >
                Filtrləməni sıfırla (Bütün siniflər)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {GRADES_CONFIG.map((grade) => {
              const count = getGradeTestCount(grade);
              const isSelected = selectedGrade === grade;

              return (
                <div
                  key={grade}
                  onClick={() => setSelectedGrade(isSelected ? 'all' : grade)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                    <span className="font-black text-xs">{grade}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Tabs and Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeStatus === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aktiv Testlər
          </button>
          <button
            onClick={() => setActiveStatus('published')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeStatus === 'published' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Yayımlanmış
          </button>
          <button
            onClick={() => setActiveStatus('draft')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeStatus === 'draft' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Qaralama
          </button>
          <button
            onClick={() => setActiveStatus('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeStatus === 'completed' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tamamlanmış
          </button>
        </div>

        {filteredTests.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors">
              <input
                type="checkbox"
                checked={filteredTests.length > 0 && selectedTestIds.length === filteredTests.length}
                onChange={handleToggleSelectAll}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
              />
              <span>Hamısını seç ({selectedTestIds.length} / {filteredTests.length})</span>
            </label>

            {selectedTestIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Silinir...' : `Sil (${selectedTestIds.length})`}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ==============================================================
          TEST KARTLARI VƏ «TESTƏ BAŞLA» (Oxuyan.az Dizayn Nümunəsi)
          ============================================================== */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Testlər yüklənir...</div>
      ) : filteredTests.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">
          <BookOpen className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-slate-600 text-sm font-bold mb-1">Bu kateqoriyada sınaq imtahanı tapılmadı.</p>
          <p className="text-slate-400 text-xs mb-4">Yeni test yaradaraq şagirdlərinizlə dərhal paylaşa bilərsiniz.</p>
          <button
            onClick={onNavigateCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700"
          >
            İlk Testi Yarat
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTests.map((test) => {
            const isAnsweredMode = test.test_mode === 'answered';
            const isSelected = selectedTestIds.includes(test.id);

            return (
              <div
                key={test.id}
                className={`bg-white border rounded-3xl p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/15'
                    : 'border-slate-200/90 hover:border-indigo-300'
                }`}
              >
                <div>
                  {/* Top Badges & Selection Checkbox */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSelectTest(test.id);
                        }}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
                        title="Bu testi seç"
                      />
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                        {test.exam_model}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      isAnsweredMode ? 'bg-amber-50 text-amber-700 border border-amber-200/80' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    }`}>
                      {isAnsweredMode ? 'OMR Test' : 'İnteraktiv Test'}
                    </span>
                  </div>

                  {/* Test Title */}
                  <h3
                    onClick={() => {
                      if (onStartTest) {
                        onStartTest(test);
                      } else if (isAnsweredMode && onOpenAnsweredTest) {
                        onOpenAnsweredTest(test.id);
                      } else {
                        onEditTest(test.id);
                      }
                    }}
                    className="font-black text-slate-900 text-base group-hover:text-indigo-600 cursor-pointer line-clamp-2 leading-snug mb-2"
                  >
                    {test.title}
                  </h3>

                  {/* Subject and Grade Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-600" />
                      {test.subject}
                    </span>
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-indigo-600" />
                      {test.grade_group || 'Ümumi'}
                    </span>
                  </div>

                  {/* Metrics bar: Oxuyan.az style Clean Statistics */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100 text-center text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Suallar</span>
                      <strong className="text-slate-800 font-black">{test.total_questions}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Müddət</span>
                      <strong className="text-slate-800 font-black">{test.duration_minutes} dəq</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">İştirakçı</span>
                      <strong className="text-indigo-600 font-black">{test.completed_attempts || 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom: «Testə başla» Button & Teacher Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                  {/* BÖYÜK «TESTƏ BAŞLA» DÜYMƏSİ (Tələb 6) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onStartTest) {
                        onStartTest(test);
                      } else if (isAnsweredMode && onOpenAnsweredTest) {
                        onOpenAnsweredTest(test.id);
                      } else {
                        onEditTest(test.id);
                      }
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                    title="İmtahanı dərhal başlat"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Testə başla</span>
                  </button>

                  {/* Teacher Quick Management Toolbar */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onShareTest(test)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                        title="Linki Paylaş"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (isAnsweredMode && onOpenAnsweredTest) {
                            onOpenAnsweredTest(test.id);
                          } else {
                            onEditTest(test.id);
                          }
                        }}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        title={isAnsweredMode ? 'OMR Test Vərəqi & Açarı' : 'Redaktə et'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onPrintTest(test)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        title="Çap et / PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(test.id)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        title="Kopyasını çıxar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchive(test)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        title={test.status === 'archived' ? 'Arxivdən çıxar' : 'Arxivləşdir'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(test.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                        title="Testi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onViewResults(test.id)}
                      className="px-2.5 py-1 text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 text-[11px] font-bold"
                      title="Nəticələrə bax"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Nəticələr</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
