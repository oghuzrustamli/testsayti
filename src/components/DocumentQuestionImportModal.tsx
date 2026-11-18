// src/components/DocumentQuestionImportModal.tsx
// EDUNEX Word və PDF sənədlərindən test suallarının avtomatik analizi, önizlənməsi və testə əlavə edilməsi
import React, { useState, useRef } from 'react';
import {
  ParsedQuestionItem,
  extractTextFromWord,
  extractTextFromPdf,
  parseQuestionsFromRawText,
  convertParsedToQuestions
} from '../lib/documentQuestionParser';
import { Question } from '../types';
import { ALL_SCHOOL_SUBJECTS } from '../lib/curriculumData';
import { MathRenderer } from './MathRenderer';
import {
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  Sparkles,
  HelpCircle,
  AlertCircle,
  FileUp,
  Layers,
  Check,
  Search,
  BookOpen
} from 'lucide-react';

interface DocumentQuestionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: Question[]) => void;
  defaultSubject?: string;
  startIndex?: number;
}

export const DocumentQuestionImportModal: React.FC<DocumentQuestionImportModalProps> = ({
  isOpen,
  onClose,
  onImportQuestions,
  defaultSubject = 'Riyaziyyat',
  startIndex = 0
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestionItem[]>([]);
  const [globalSubject, setGlobalSubject] = useState<string>(defaultSubject);
  const [editingQId, setEditingQId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg('');
    setFileName(file.name);
    setStatusMsg(`«${file.name}» faylı təhlil edilir...`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = '';

      const isWord = file.name.endsWith('.docx') || file.name.endsWith('.doc');
      const isPdf = file.name.endsWith('.pdf');

      if (isWord) {
        setStatusMsg('Word sənədi mətni və strukturu oxunur...');
        extractedText = await extractTextFromWord(arrayBuffer);
      } else if (isPdf) {
        setStatusMsg('PDF səhifələri və sualları skan edilir...');
        extractedText = await extractTextFromPdf(arrayBuffer);
      } else {
        // Plain text fallback
        extractedText = new TextDecoder('utf-8').decode(arrayBuffer);
      }

      setStatusMsg('Suallar, variantlar və düzgün cavablar təhlil olunur...');
      const questions = parseQuestionsFromRawText(extractedText, globalSubject);

      if (questions.length === 0) {
        throw new Error('Sənəddə nömrələnmiş suallar tapılmadı. Zəhmət olmasa sənədin "1. Sual... A) B) C) D)" formatında olduğunu yoxlayın.');
      }

      setParsedQuestions(questions);
      setStatusMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Fayl oxunarkən xəta baş verdi');
      setStatusMsg('');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyGlobalSubject = (newSubject: string) => {
    setGlobalSubject(newSubject);
    setParsedQuestions((prev) =>
      prev.map((q) => ({ ...q, subject: newSubject }))
    );
  };

  const handleToggleSelect = (id: string) => {
    setParsedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setParsedQuestions((prev) =>
      prev.map((q) => ({ ...q, selected: select }))
    );
  };

  const handleDeleteQuestion = (id: string) => {
    setParsedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleUpdateQuestionText = (id: string, text: string) => {
    setParsedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question_text: text } : q))
    );
  };

  const handleUpdateOption = (qId: string, optId: string, text: string) => {
    setParsedQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const newOpts = q.options.map((opt) =>
          opt.id === optId ? { ...opt, text } : opt
        );
        return { ...q, options: newOpts };
      })
    );
  };

  const handleSetCorrectOption = (qId: string, optId: string) => {
    setParsedQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const newOpts = q.options.map((opt) => ({
          ...opt,
          is_correct: opt.id === optId
        }));
        return { ...q, options: newOpts, correct_answer: optId };
      })
    );
  };

  const handleUpdateSubject = (id: string, subject: string) => {
    setParsedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, subject } : q))
    );
  };

  const selectedCount = parsedQuestions.filter((q) => q.selected).length;

  const handleConfirmImport = () => {
    const toImport = parsedQuestions.filter((q) => q.selected);
    if (toImport.length === 0) {
      alert('Zəhmət olmasa testə əlavə etmək üçün ən azı bir sual seçin.');
      return;
    }

    const converted = convertParsedToQuestions(toImport, startIndex);
    onImportQuestions(converted);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in zoom-in-95 duration-150 relative"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 px-5 py-3.5 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <FileUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight">
                Word və PDF-dən Sual Əlavə Et
              </h2>
              <p className="text-[11px] text-indigo-100 font-medium">
                Sənədi yükləyin, sistem sualları və cavab variantlarını avtomatik analiz etsin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Bağla"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 scrollbar-thin">
          {/* File Upload Drop Area */}
          <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-2xl p-4 sm:p-6 text-center transition-all flex flex-col items-center justify-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".docx,.doc,.pdf,.txt"
              className="hidden"
              id="doc-question-upload"
            />
            <label
              htmlFor="doc-question-upload"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Word (.docx, .doc) və ya PDF (.pdf) Seç</span>
            </label>
            <p className="text-xs text-slate-500 font-medium mt-1">
              və ya faylı buraya sürükləyib buraxın
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-400 mt-1">
              <span className="px-2 py-0.5 bg-white rounded border border-slate-200">1. Sual mətni</span>
              <span className="px-2 py-0.5 bg-white rounded border border-slate-200">A) B) C) D) E) variantları</span>
              <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Cavab: B</span>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-indigo-700 animate-pulse font-mono">
                {statusMsg || 'Sənəd təhlil edilir...'}
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Questions List and Controls */}
          {parsedQuestions.length > 0 && (
            <div className="flex flex-col gap-3">
              {/* Batch Action Toolbar */}
              <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-800">
                    Aşkar edilmiş: {parsedQuestions.length} sual ({selectedCount} seçilib)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(true)}
                      className="px-2 py-1 bg-white hover:bg-slate-50 text-indigo-700 border border-slate-200 rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Hamısını seç
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(false)}
                      className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Seçimi təmizlə
                    </button>
                  </div>
                </div>

                {/* Global Subject Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-bold text-[11px]">Bütün sualların fənni:</span>
                  <select
                    value={globalSubject}
                    onChange={(e) => handleApplyGlobalSubject(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    {ALL_SCHOOL_SUBJECTS.map((sub) => (
                      <option key={sub.name} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Questions Cards */}
              <div className="flex flex-col gap-3">
                {parsedQuestions.map((q, idx) => {
                  const isEditing = editingQId === q.id;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                        q.selected
                          ? 'bg-white border-slate-200 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={q.selected}
                            onChange={() => handleToggleSelect(q.id)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            #{idx + 1}
                          </span>
                          <select
                            value={q.subject}
                            onChange={(e) => handleUpdateSubject(q.id, e.target.value)}
                            className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-bold text-slate-700"
                          >
                            {ALL_SCHOOL_SUBJECTS.map((sub) => (
                              <option key={sub.name} value={sub.name}>
                                {sub.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingQId(isEditing ? null : q.id)}
                            className="p-1 text-slate-500 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                            title="Redaktə et"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={q.question_text}
                          onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-600"
                        />
                      ) : (
                        <div className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                          <MathRenderer content={q.question_text} />
                        </div>
                      )}

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt) => {
                          const isCorrect = opt.id === q.correct_answer;

                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleSetCorrectOption(q.id, opt.id)}
                                className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px] shrink-0 cursor-pointer ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-600 hover:border-emerald-500'
                                }`}
                                title="Düzgün cavab kimi təyin et"
                              >
                                {opt.id}
                              </button>

                              {isEditing ? (
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => handleUpdateOption(q.id, opt.id, e.target.value)}
                                  className="flex-1 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs"
                                />
                              ) : (
                                <div className="flex-1 truncate">
                                  <MathRenderer content={opt.text} />
                                </div>
                              )}

                              {isCorrect && (
                                <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded shrink-0">
                                  ✓ Düzgün
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            {parsedQuestions.length > 0
              ? `Seçilmiş: ${selectedCount} / ${parsedQuestions.length} sual`
              : 'Fayl seçildikdən sonra suallar burada göstəriləcək'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              İmtina
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Testə Əlavə Et ({selectedCount} Sual)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
