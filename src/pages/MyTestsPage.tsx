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
  AlertCircle
} from 'lucide-react';

interface MyTestsPageProps {
  user: User;
  onNavigateCreate: () => void;
  onEditTest: (testId: string) => void;
  onOpenAnsweredTest?: (testId: string) => void;
  onShareTest: (test: Test) => void;
  onPrintTest: (test: Test) => void;
  onViewResults: (testId: string) => void;
}

export const MyTestsPage: React.FC<MyTestsPageProps> = ({
  user,
  onNavigateCreate,
  onEditTest,
  onOpenAnsweredTest,
  onShareTest,
  onPrintTest,
  onViewResults,
}) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<boolean>(false);

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

  const filteredTests = tests.filter((t) => {
    const matchesStatus = activeStatus === 'all' ? t.status !== 'archived' : t.status === activeStatus;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.exam_model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Testlərim</h1>
          <p className="text-xs text-slate-500">
            Hazırladığınız sınaq imtahanları, paylaşılan linklər və şagird iştirakçıları
          </p>
        </div>

        <button
          onClick={onNavigateCreate}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-2 transition-all"
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

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status Tabs */}
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

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Test adı və ya fənn axtar..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {filteredTests.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors">
            <input
              type="checkbox"
              checked={filteredTests.length > 0 && selectedTestIds.length === filteredTests.length}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
            />
            <span>
              Hamısını seç ({selectedTestIds.length} / {filteredTests.length})
            </span>
          </label>

          {selectedTestIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer animate-in fade-in"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Silinir...' : `Seçilənləri Sil (${selectedTestIds.length})`}</span>
            </button>
          )}
        </div>
      )}

      {/* Tests Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Testlər yüklənir...</div>
      ) : filteredTests.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">
          <p className="text-slate-500 text-sm font-semibold mb-2">Heç bir test tapılmadı.</p>
          <p className="text-slate-400 text-xs mb-4">Yeni test yaradaraq şagirdlərinizlə dərhal paylaşa bilərsiniz.</p>
          <button
            onClick={onNavigateCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700"
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
                className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div>
                  {/* Top Badges & Checkbox */}
                  <div className="flex items-center justify-between gap-2 mb-2">
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {test.exam_model}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAnsweredMode ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {isAnsweredMode ? 'OMR Test' : 'İnteraktiv Test'}
                    </span>
                  </div>

                  <h3
                    onClick={() => {
                      if (isAnsweredMode && onOpenAnsweredTest) {
                        onOpenAnsweredTest(test.id);
                      } else {
                        onEditTest(test.id);
                      }
                    }}
                    className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer line-clamp-2 leading-snug mb-2"
                  >
                    {test.title}
                  </h3>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mb-4">
                    <span>Fənn: <strong className="text-slate-700">{test.subject}</strong></span>
                    <span>Sinif: <strong className="text-slate-700">{test.grade_group || 'Ümumi'}</strong></span>
                  </div>

                  {/* Metrics bar */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Suallar</span>
                      <strong className="text-slate-800">{test.total_questions}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Müddət</span>
                      <strong className="text-slate-800">{test.duration_minutes} dəq</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">İştirakçı</span>
                      <strong className="text-indigo-600">{test.completed_attempts || 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onShareTest(test)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                      title="Linki Paylaş"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (isAnsweredMode && onOpenAnsweredTest) {
                          onOpenAnsweredTest(test.id);
                        } else {
                          onEditTest(test.id);
                        }
                      }}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      title={isAnsweredMode ? 'OMR Test Vərəqi & Açarı' : 'Redaktə et'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPrintTest(test)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      title="Çap et / PDF"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(test.id)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      title="Kopyasını çıxar"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(test)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      title={test.status === 'archived' ? 'Arxivdən çıxar' : 'Arxivləşdir'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                      title="Testi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onViewResults(test.id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 text-xs font-bold"
                    title="Nəticələrə bax"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
