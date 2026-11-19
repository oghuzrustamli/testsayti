// src/components/MultiSubjectSelector.tsx
// EDUNEX Çoxfənli Test Seçimi Komponenti
import React, { useState, useMemo } from 'react';
import { ALL_SCHOOL_SUBJECTS, SubjectCategory } from '../lib/curriculumData';
import {
  Layers,
  CheckCircle2,
  Search,
  X,
  Plus,
  Minus,
  Sparkles,
  BookOpen,
  HelpCircle,
  Award
} from 'lucide-react';

export interface SubjectConfig {
  subject: string;
  questionCount: number;
}

interface MultiSubjectSelectorProps {
  selectedSubjects: SubjectConfig[];
  onChange: (subjects: SubjectConfig[]) => void;
  compact?: boolean;
}

export const MultiSubjectSelector: React.FC<MultiSubjectSelectorProps> = ({
  selectedSubjects,
  onChange,
  compact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<SubjectCategory | 'all'>('all');

  // Total questions count calculation
  const totalQuestions = useMemo(() => {
    return selectedSubjects.reduce((sum, item) => sum + (item.questionCount || 0), 0);
  }, [selectedSubjects]);

  // Check if a subject is currently selected
  const isSubjectSelected = (subjectName: string) => {
    return selectedSubjects.some((s) => s.subject === subjectName);
  };

  const getSubjectCount = (subjectName: string): number => {
    const found = selectedSubjects.find((s) => s.subject === subjectName);
    return found ? found.questionCount : 20;
  };

  // Toggle subject selection
  const handleToggleSubject = (subjectName: string) => {
    if (isSubjectSelected(subjectName)) {
      onChange(selectedSubjects.filter((s) => s.subject !== subjectName));
    } else {
      onChange([...selectedSubjects, { subject: subjectName, questionCount: 20 }]);
    }
  };

  // Update question count for a specific subject
  const handleUpdateCount = (subjectName: string, count: number) => {
    const validCount = Math.max(1, Math.min(100, count));
    onChange(
      selectedSubjects.map((s) => (s.subject === subjectName ? { ...s, questionCount: validCount } : s))
    );
  };

  // Preset quick selections
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'buraxilis':
        onChange([
          { subject: 'Azərbaycan dili', questionCount: 30 },
          { subject: 'Riyaziyyat', questionCount: 25 },
          { subject: 'İngilis dili', questionCount: 30 }
        ]);
        break;
      case 'blok-1-ri':
        onChange([
          { subject: 'Riyaziyyat', questionCount: 30 },
          { subject: 'Fizika', questionCount: 30 },
          { subject: 'İnformatika', questionCount: 30 }
        ]);
        break;
      case 'blok-1-rk':
        onChange([
          { subject: 'Riyaziyyat', questionCount: 30 },
          { subject: 'Fizika', questionCount: 30 },
          { subject: 'Kimya', questionCount: 30 }
        ]);
        break;
      case 'blok-2':
        onChange([
          { subject: 'Riyaziyyat', questionCount: 30 },
          { subject: 'Coğrafiya', questionCount: 30 },
          { subject: 'Azərbaycan tarixi', questionCount: 30 }
        ]);
        break;
      case 'blok-3':
        onChange([
          { subject: 'Azərbaycan dili', questionCount: 30 },
          { subject: 'Ədəbiyyat', questionCount: 30 },
          { subject: 'Azərbaycan tarixi', questionCount: 30 }
        ]);
        break;
      case 'blok-4':
        onChange([
          { subject: 'Biologiya', questionCount: 30 },
          { subject: 'Kimya', questionCount: 30 },
          { subject: 'Fizika', questionCount: 30 }
        ]);
        break;
      case 'clear':
        onChange([]);
        break;
      default:
        break;
    }
  };

  const filteredSubjects = useMemo(() => {
    return ALL_SCHOOL_SUBJECTS.filter((sub) => {
      const matchCat = selectedCat === 'all' || sub.category === selectedCat;
      const matchQuery =
        !searchQuery.trim() ||
        sub.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchCat && matchQuery;
    });
  }, [selectedCat, searchQuery]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col gap-3">
      {/* Header and Summary Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              Çoxfənli Test Seçimi
              {selectedSubjects.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                  {selectedSubjects.length} fənn seçilib
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              İstədiyiniz fənləri işarələyin və hər fənn üçün sual sayını təyin edin
            </p>
          </div>
        </div>

        {/* Real-time Total Question Counter */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/60 px-3 py-1.5 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300">Ümumi Sual Sayı:</span>
          <span className="text-sm font-black text-indigo-700 dark:text-indigo-400 font-mono">
            {totalQuestions} sual
          </span>
        </div>
      </div>

      {/* Preset Quick Buttons (Buraxılış, Blok I-IV) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10.5px]">
        <span className="text-slate-400 dark:text-slate-500 font-bold shrink-0 text-[10px]">Şablonlar:</span>
        <button
          type="button"
          onClick={() => applyPreset('buraxilis')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-indigo-300 rounded-lg font-bold text-slate-700 border border-slate-200 dark:border-slate-700 shrink-0 transition-colors cursor-pointer"
        >
          Buraxılış (3 fənn / 85 sual)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('blok-1-ri')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-indigo-300 rounded-lg font-bold text-slate-700 border border-slate-200 dark:border-slate-700 shrink-0 transition-colors cursor-pointer"
        >
          I Qrup Rİ (90 sual)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('blok-1-rk')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-indigo-300 rounded-lg font-bold text-slate-700 border border-slate-200 dark:border-slate-700 shrink-0 transition-colors cursor-pointer"
        >
          I Qrup RK (90 sual)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('blok-2')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-indigo-300 rounded-lg font-bold text-slate-700 border border-slate-200 dark:border-slate-700 shrink-0 transition-colors cursor-pointer"
        >
          II Qrup (90 sual)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('blok-3')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-indigo-300 rounded-lg font-bold text-slate-700 border border-slate-200 dark:border-slate-700 shrink-0 transition-colors cursor-pointer"
        >
          III Qrup (90 sual)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('blok-4')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-indigo-300 rounded-lg font-bold text-slate-700 border border-slate-200 dark:border-slate-700 shrink-0 transition-colors cursor-pointer"
        >
          IV Qrup (90 sual)
        </button>
        {selectedSubjects.length > 0 && (
          <button
            type="button"
            onClick={() => applyPreset('clear')}
            className="px-2 py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ml-auto"
          >
            Təmizlə
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Fənn axtar..."
            className="w-full pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:border-indigo-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 text-[10px] font-bold">
          {[
            { id: 'all', label: 'Bütün' },
            { id: 'exact', label: 'Dəqiq' },
            { id: 'humanitarian', label: 'Humanitar' },
            { id: 'social', label: 'İctimai' },
            { id: 'applied', label: 'Tətbiqi' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id as any)}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                selectedCat === cat.id
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Checkbox Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1 scrollbar-thin">
        {filteredSubjects.map((sub) => {
          const selected = isSubjectSelected(sub.name);
          const count = getSubjectCount(sub.name);

          return (
            <div
              key={sub.name}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 select-none bg-white dark:bg-slate-900/90 ${
                selected
                  ? 'border-blue-600 dark:border-sky-400 dark:shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-400/70'
              }`}
            >
              {/* Checkbox and Subject Name */}
              <div
                onClick={() => handleToggleSubject(sub.name)}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    selected
                      ? 'bg-blue-600 border-blue-600 dark:bg-sky-500 dark:border-sky-400 text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="truncate">
                  <span className={`text-xs block truncate ${selected ? 'font-black text-blue-900 dark:text-sky-300' : 'font-bold text-slate-700 dark:text-slate-300'}`}>
                    {sub.name}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block truncate">
                    {sub.category === 'exact' ? 'Dəqiq' : sub.category === 'humanitarian' ? 'Humanitar' : sub.category === 'social' ? 'İctimai' : 'Tətbiqi'}
                  </span>
                </div>
              </div>

              {/* Question Count Input (Visible when selected) */}
              {selected && (
                <div className="flex items-center gap-1 shrink-0 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => handleUpdateCount(sub.name, count - 5)}
                    className="w-5 h-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-400 rounded text-slate-600 dark:text-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                    title="-5 sual"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => handleUpdateCount(sub.name, parseInt(e.target.value) || 1)}
                    className="w-11 h-6 bg-white dark:bg-slate-800 border border-blue-600 dark:border-sky-400 rounded text-xs font-black text-blue-900 dark:text-sky-300 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-sky-400 shadow-2xs"
                    title="Bu fənn üzrə sual sayı"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateCount(sub.name, count + 5)}
                    className="w-5 h-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-400 rounded text-slate-600 dark:text-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                    title="+5 sual"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Subjects Summary Bar */}
      {selectedSubjects.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Seçilmiş Fənlər:
            </span>
            {selectedSubjects.map((s) => (
              <span
                key={s.subject}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 text-[10.5px] font-bold flex items-center gap-1 shadow-2xs"
              >
                <span>{s.subject}:</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{s.questionCount}</strong>
                <button
                  type="button"
                  onClick={() => handleToggleSubject(s.subject)}
                  className="hover:text-rose-600 dark:hover:text-rose-400 ml-0.5"
                  title="Fənni sil"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="text-right ml-auto">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Cəmi: <strong className="text-slate-900 dark:text-white font-black">{totalQuestions} sual</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
