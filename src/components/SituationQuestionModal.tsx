// src/components/SituationQuestionModal.tsx
import React, { useState } from 'react';
import { Question, SituationGradingMode } from '../types';
import { MathRenderer } from './MathRenderer';
import { DocSnippetModal } from './DocSnippetModal';
import {
  FileText,
  Layers,
  Sparkles,
  Award,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus,
  Scissors
} from 'lucide-react';

interface SituationQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: Partial<Question>) => void;
  onDelete?: () => void;
  initialQuestion?: Partial<Question> | null;
  questionNumber?: number;
}

export const SituationQuestionModal: React.FC<SituationQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialQuestion,
  questionNumber = 1
}) => {
  // Form State
  const [situationText, setSituationText] = useState<string>(
    initialQuestion?.situation_text || ''
  );
  const [questionText, setQuestionText] = useState<string>(
    initialQuestion?.question_text || ''
  );
  const [points, setPoints] = useState<number>(initialQuestion?.points || 6);
  const [modelAnswer, setModelAnswer] = useState<string>(
    initialQuestion?.situation_model_answer || initialQuestion?.correct_answer || ''
  );
  const [gradingMode, setGradingMode] = useState<SituationGradingMode>(
    initialQuestion?.situation_grading_mode || 'keywords_10'
  );

  // 10 Keywords (Array of 10 items)
  const [keywords, setKeywords] = useState<string[]>(() => {
    const existing = initialQuestion?.situation_keywords || [];
    const filled = Array.from({ length: 10 }, (_, i) => existing[i] || '');
    return filled;
  });

  // Synonyms mapping (keyword index -> comma-separated string)
  const [synonyms, setSynonyms] = useState<string[]>(() => {
    const map = initialQuestion?.situation_synonyms || {};
    const existingKws = initialQuestion?.situation_keywords || [];
    return Array.from({ length: 10 }, (_, i) => {
      const kw = existingKws[i];
      if (kw && map[kw]) {
        return map[kw].join(', ');
      }
      return '';
    });
  });

  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showSnippetModal, setShowSnippetModal] = useState<boolean>(false);
  const [snippetTarget, setSnippetTarget] = useState<'situation' | 'question'>('situation');

  const handleSnippetInsert = (tgt: string, content: string, type: 'text' | 'image') => {
    if (tgt === 'situation') {
      const append = type === 'image' ? `\n![Situasiya Şəkli](${content})\n` : content;
      setSituationText(prev => (prev ? prev + '\n' : '') + append);
    } else {
      const append = type === 'image' ? `\n![Sual Şəkli](${content})\n` : content;
      setQuestionText(prev => (prev ? prev + '\n' : '') + append);
    }
  };

  if (!isOpen) return null;

  const handleKeywordChange = (index: number, val: string) => {
    setKeywords(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleSynonymChange = (index: number, val: string) => {
    setSynonyms(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!situationText.trim() && !questionText.trim()) {
      alert('Zəhmət olmasa situasiya mətnini və ya sualı daxil edin.');
      return;
    }

    // Build synonyms map
    const synonymsMap: Record<string, string[]> = {};
    keywords.forEach((kw, i) => {
      if (kw.trim()) {
        const synList = (synonyms[i] || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        synonymsMap[kw.trim()] = synList;
      }
    });

    const questionData: Partial<Question> = {
      question_type: 'situation',
      situation_text: situationText.trim(),
      question_text: questionText.trim() || `Situasiya üzrə sual №${questionNumber}`,
      points: points || 6,
      correct_answer: modelAnswer.trim(),
      situation_model_answer: modelAnswer.trim(),
      situation_keywords: keywords.map(k => k.trim()),
      situation_synonyms: synonymsMap,
      situation_grading_mode: gradingMode,
      options: []
    };

    onSave(questionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-700 via-amber-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shadow-inner">
              <Layers className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <span>Situasiya Tipli Sual Hazırlanması</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-[10px] text-amber-100 font-mono font-bold">
                  Sual №{questionNumber}
                </span>
              </h3>
              <p className="text-[11px] text-amber-100/80">
                10 açar söz və Süni İntellekt (DİM modeli) əsasında avtomatik qiymətləndirmə
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">
          {/* 1. Sualın Situasiya Mətni */}
          <div className="flex flex-col gap-1.5 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>1. Sualın Situasiya Mətni (Ümumi ssenari):</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSnippetTarget('situation');
                    setShowSnippetModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="PDF və ya Word sənədindən mətni və ya şəkli kəsib situasiyaya əlavə et"
                >
                  <Scissors className="w-3 h-3 text-amber-700" />
                  <span>PDF/Word-dən Kəs</span>
                </button>
                <span className="hidden sm:inline-block text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Geniş sahə
                </span>
              </div>
            </div>
            <textarea
              rows={4}
              value={situationText}
              onChange={(e) => setSituationText(e.target.value)}
              placeholder="Situasiya mətnini daxil edin. Məsələn: 'Şagirdlər laboratoriyada mail müstəvi üzərində cismin hərəkətini tədqiq edirlər. Kütləsi 2 kq olan tirciyin sürəti saniyədə 4 m/s artır...'"
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-amber-300 focus:border-amber-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 leading-relaxed font-sans shadow-2xs"
            />
            {situationText && (
              <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 text-xs text-slate-700 mt-1">
                <span className="text-[10px] font-bold text-amber-800 block mb-1">Mətnin Önizləməsi:</span>
                <MathRenderer content={situationText} />
              </div>
            )}
          </div>

          {/* 2. Sualın Özü və Maksimum Bal */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>2. Sualın Özü:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSnippetTarget('question');
                    setShowSnippetModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="PDF və ya Word sənədindən mətni və ya şəkli kəsib suala əlavə et"
                >
                  <Scissors className="w-3 h-3 text-indigo-600" />
                  <span>PDF/Word-dən Kəs</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Şagirdə ünvanlanan sualı yazın. Məsələn: 'Tirciyə təsir edən əvəzləyici qüvvəni və sürtünmə qüvvəsinin gördüyü işi izah edin.'"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>

            <div className="md:col-span-1 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Maksimum Bal:</span>
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={points}
                onChange={(e) => setPoints(parseFloat(e.target.value) || 6)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl text-center text-sm font-black text-indigo-700 font-mono shadow-2xs"
              />
              <span className="text-[10px] text-slate-400 text-center">Standart: 6 və ya 10 bal</span>
            </div>
          </div>

          {/* 3. Düzgün və ya Nümunəvi Cavab */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. Düzgün / Nümunəvi Cavab (Model Cavab):</span>
            </label>
            <textarea
              rows={2}
              value={modelAnswer}
              onChange={(e) => setModelAnswer(e.target.value)}
              placeholder="Sualın tam və ideal elmi cavabını qeyd edin. Bu cavab həm müəllim üçün arayış, həm də süni intellekt üçün meyar olacaq."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 focus:border-emerald-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            />
          </div>

          {/* 4. Qiymətləndirmə Üsulu */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="text-xs font-black text-slate-900 block mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>4. Qiymətləndirmə Üsulu:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A */}
              <label
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  gradingMode === 'keywords_10'
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-semibold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="grading_mode"
                  value="keywords_10"
                  checked={gradingMode === 'keywords_10'}
                  onChange={() => setGradingMode('keywords_10')}
                  className="mt-1"
                />
                <div className="text-xs">
                  <strong className="block text-slate-900 mb-0.5">A. Açar sözlərlə qiymətləndirmə</strong>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    10 açar söz əsasında qiymətləndirilir. Hər aşkar edilən açar söz maksimum balın <strong>10%-ni</strong> təşkil edir.
                  </p>
                </div>
              </label>

              {/* Option B */}
              <label
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  gradingMode === 'dim_tiered'
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-semibold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="grading_mode"
                  value="dim_tiered"
                  checked={gradingMode === 'dim_tiered'}
                  onChange={() => setGradingMode('dim_tiered')}
                  className="mt-1"
                />
                <div className="text-xs">
                  <strong className="block text-slate-900 mb-0.5">B. DİM tipli qiymətləndirmə</strong>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Pilləli qiymətləndirmə modeli: <strong>0 bal, 1/3, 1/2, 2/3 və Tam bal</strong>. Məzmunun tamlığına görə təyin olunur.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 5. 10 Açar Söz və ya Əsas Anlayış və Sinonimləri */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>5. 10 Açar Söz / Anlayış və Alternativləri:</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Şagird cavabı yoxlanarkən bu 10 anlayış və onların sinonimləri Süni İntellektlə axtarılacaq.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 font-mono bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                {keywords.filter(k => k.trim()).length} / 10 doldurulub
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {keywords.map((kw, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex flex-col gap-1.5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={kw}
                      onChange={(e) => handleKeywordChange(idx, e.target.value)}
                      placeholder={`Açar söz ${idx + 1} (məs: Nyutonun II qanunu)`}
                      className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 focus:border-indigo-600 rounded-lg font-semibold text-slate-800"
                    />
                  </div>

                  {/* Synonyms / Alternativlər */}
                  <div className="flex items-center gap-1 pl-7 text-[10px] text-slate-500">
                    <span className="shrink-0 font-medium">Sinonimlər:</span>
                    <input
                      type="text"
                      value={synonyms[idx] || ''}
                      onChange={(e) => handleSynonymChange(idx, e.target.value)}
                      placeholder="Vergüllə ayırın: dinamikanın əsas tənliyi, F=ma"
                      className="flex-1 px-2 py-0.5 text-[11px] bg-white border border-slate-200 focus:border-indigo-400 rounded text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <div>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sualı Sil</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Ləğv et
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Situasiya Sualını Yadda Saxla</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal (Tələb 5: Təsdiq olmadan silinməsin) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900 mb-1">
              Situasiya sualını silmək istəyirsiniz?
            </h4>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Bu əməliyyat geri qaytarılmayacaq. Sual və ona aid 10 açar söz siyahıdan tamamilə silinəcək.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                İmtina
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  if (onDelete) onDelete();
                  onClose();
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bəli, Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF / Word Snippet & Crop Modal */}
      <DocSnippetModal
        isOpen={showSnippetModal}
        initialTarget={snippetTarget}
        onClose={() => setShowSnippetModal(false)}
        onInsert={handleSnippetInsert}
        allowSituation={true}
      />
    </div>
  );
};
