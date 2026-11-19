// src/components/QuestionEditor.tsx
import React, { useState, useRef } from 'react';
import { Question, QuestionOption, QuestionType, GraphData } from '../types';
import { MathRenderer } from './MathRenderer';
import { VisualMathKeyboard } from './VisualMathKeyboard';
import { GraphLaboratory } from './GraphLaboratory';
import { FormulaEditorModal } from './FormulaEditorModal';
import { SituationQuestionModal } from './SituationQuestionModal';
import { DocSnippetModal } from './DocSnippetModal';
import { QUESTION_TYPES } from '../lib/constants';
import { ALL_SCHOOL_SUBJECTS } from '../lib/curriculumData';
import {
  Calculator,
  Compass,
  Image as ImageIcon,
  Table as TableIcon,
  HelpCircle,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Eye,
  FileText,
  Upload,
  Layers,
  Sparkles,
  Edit3,
  Scissors
} from 'lucide-react';

interface QuestionEditorProps {
  questions: Question[];
  activeQuestionIndex: number;
  availableSubjects?: string[];
  onSelectQuestion: (index: number) => void;
  onUpdateQuestion: (index: number, updated: Question) => void;
  onAddQuestion: () => void;
  onAddSituationQuestion?: () => void;
  onDeleteQuestion: (index: number) => void;
  onDuplicateQuestion: (index: number) => void;
  onMoveQuestion: (fromIndex: number, toIndex: number) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  questions,
  activeQuestionIndex,
  availableSubjects,
  onSelectQuestion,
  onUpdateQuestion,
  onAddQuestion,
  onAddSituationQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onMoveQuestion,
}) => {
  const [showMathKeyboard, setShowMathKeyboard] = useState<boolean>(false);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [showGraphLab, setShowGraphLab] = useState<boolean>(false);
  const [showSituationModal, setShowSituationModal] = useState<boolean>(false);
  const [showSnippetModal, setShowSnippetModal] = useState<boolean>(false);
  const [snippetTarget, setSnippetTarget] = useState<string>('question');
  const [activeMathTarget, setActiveMathTarget] = useState<'question' | 'explanation' | 'situation' | string>('question');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInsertSnippet = (target: string, content: string, type: 'text' | 'image') => {
    if (target === 'question') {
      if (type === 'image') {
        onUpdateQuestion(activeQuestionIndex, { ...currentQ, image_url: content });
      } else {
        onUpdateQuestion(activeQuestionIndex, {
          ...currentQ,
          question_text: (currentQ.question_text ? currentQ.question_text + '\n' : '') + content
        });
      }
    } else if (target === 'situation') {
      onUpdateQuestion(activeQuestionIndex, {
        ...currentQ,
        situation_text: (currentQ.situation_text ? currentQ.situation_text + '\n' : '') + content
      });
    } else if (target.startsWith('opt-')) {
      const optId = target.replace('opt-', '');
      const newOpts = currentQ.options.map(o =>
        o.id === optId
          ? {
              ...o,
              text: type === 'image'
                ? (o.text ? o.text + ' ' : '') + `![Variant ${optId}](${content})`
                : (o.text ? o.text + ' ' : '') + content
            }
          : o
      );
      onUpdateQuestion(activeQuestionIndex, { ...currentQ, options: newOpts });
    }
  };

  const currentQ = questions[activeQuestionIndex] || questions[0];

  if (!currentQ) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
        <p className="text-slate-500 mb-4">Hələ heç bir sual əlavə edilməyib.</p>
        <button
          onClick={onAddQuestion}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs shadow hover:bg-indigo-700"
        >
          Birinci Sualı Əlavə Et
        </button>
      </div>
    );
  }

  // Handle inserting math formula from modal or keyboard
  const handleInsertMath = (latex: string) => {
    if (activeMathTarget === 'question') {
      onUpdateQuestion(activeQuestionIndex, {
        ...currentQ,
        question_text: (currentQ.question_text || '') + ' ' + latex + ' '
      });
    } else if (activeMathTarget === 'situation') {
      onUpdateQuestion(activeQuestionIndex, {
        ...currentQ,
        situation_text: (currentQ.situation_text || '') + ' ' + latex + ' '
      });
    } else if (activeMathTarget === 'explanation') {
      onUpdateQuestion(activeQuestionIndex, {
        ...currentQ,
        explanation: (currentQ.explanation || '') + ' ' + latex + ' '
      });
    } else if (activeMathTarget.startsWith('opt-')) {
      const optId = activeMathTarget.replace('opt-', '');
      const newOpts = currentQ.options.map(o =>
        o.id === optId ? { ...o, text: (o.text || '') + ' ' + latex + ' ' } : o
      );
      onUpdateQuestion(activeQuestionIndex, { ...currentQ, options: newOpts });
    }
  };

  // Image Upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdateQuestion(activeQuestionIndex, { ...currentQ, image_url: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  // Insert Markdown Table template into question text
  const handleInsertTable = () => {
    const tableTemplate = `\n| X | Y | Qeyd |\n|---|---|---|\n| 1 | 2 | A |\n| 3 | 4 | B |\n`;
    onUpdateQuestion(activeQuestionIndex, {
      ...currentQ,
      question_text: (currentQ.question_text || '') + tableTemplate
    });
  };

  // Update specific option
  const handleOptionChange = (optId: string, text: string) => {
    const newOptions = currentQ.options.map(opt =>
      opt.id === optId ? { ...opt, text } : opt
    );
    onUpdateQuestion(activeQuestionIndex, { ...currentQ, options: newOptions });
  };

  // Set correct option
  const handleSetCorrectOption = (optId: string) => {
    if (currentQ.question_type === 'multiple_choice') {
      const currentCorrects = currentQ.correct_answer ? currentQ.correct_answer.split(',') : [];
      let nextCorrects: string[];
      if (currentCorrects.includes(optId)) {
        nextCorrects = currentCorrects.filter(id => id !== optId);
      } else {
        nextCorrects = [...currentCorrects, optId];
      }
      onUpdateQuestion(activeQuestionIndex, {
        ...currentQ,
        correct_answer: nextCorrects.sort().join(','),
        options: currentQ.options.map(o => ({ ...o, is_correct: nextCorrects.includes(o.id) }))
      });
    } else {
      onUpdateQuestion(activeQuestionIndex, {
        ...currentQ,
        correct_answer: optId,
        options: currentQ.options.map(o => ({ ...o, is_correct: o.id === optId }))
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. QUESTION TABS / NAVIGATION (Horizontal scroll, non-shrinking per prompt) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin max-w-full">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 shrink-0">
            Suallar ({questions.length}):
          </span>

          {questions.map((q, idx) => {
            const isActive = idx === activeQuestionIndex;
            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => onSelectQuestion(idx)}
                className={`min-w-[42px] h-[34px] px-2.5 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-all border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200 dark:shadow-none'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}

          <button
            type="button"
            onClick={onAddQuestion}
            className="min-w-[34px] h-[34px] rounded-lg border border-dashed border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center justify-center shrink-0 transition-colors"
            title="Yeni sual əlavə et"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Tələb 1 & 5: + Situasiya əlavə et düyməsi */}
          <button
            type="button"
            onClick={onAddSituationQuestion || onAddQuestion}
            className="h-[34px] px-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
            title="Situasiya tipli sual əlavə et (10 açar söz və AI qiymətləndirmə)"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">+ Situasiya əlavə et</span>
            <span className="sm:hidden">+ Situasiya</span>
          </button>

          {/* PDF və Word-dən Kəs Düyməsi (Önbaxış və Kopyala əvəzinə) */}
          <button
            type="button"
            onClick={() => {
              setSnippetTarget('question');
              setShowSnippetModal(true);
            }}
            className="h-[34px] px-3 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-2xs cursor-pointer hover:shadow-xs"
            title="PDF və ya Word sənədindən mətni və ya şəkli kəsib suala və ya variantlara (A, B, C, D, E) əlavə et"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-600" />
            <span>PDF/Word-dən Kəs</span>
          </button>
        </div>

        {/* Action Controls for Current Question (Yuxarı/Aşağı və Silmə) */}
        <div className="flex items-center gap-1.5 shrink-0">

          <button
            type="button"
            disabled={activeQuestionIndex === 0}
            onClick={() => onMoveQuestion(activeQuestionIndex, activeQuestionIndex - 1)}
            className="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 rounded-lg transition-colors"
            title="Yuxarı / Əvvələ sürüşdür"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={activeQuestionIndex === questions.length - 1}
            onClick={() => onMoveQuestion(activeQuestionIndex, activeQuestionIndex + 1)}
            className="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 rounded-lg transition-colors"
            title="Aşağı / Sonraya sürüşdür"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {questions.length > 1 && (
            <button
              type="button"
              onClick={() => onDeleteQuestion(activeQuestionIndex)}
              className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sualı sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. QUESTION EDITOR BODY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col gap-4 text-slate-800 dark:text-slate-100">
        {/* Top bar: Question Type, Subject & Points */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
              #{activeQuestionIndex + 1}
            </span>
            <select
              value={currentQ.question_type}
              onChange={(e) => onUpdateQuestion(activeQuestionIndex, { ...currentQ, question_type: e.target.value as QuestionType })}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              {QUESTION_TYPES.map(qt => (
                <option key={qt.type} value={qt.type}>{qt.label}</option>
              ))}
            </select>

            {/* Subject Selector for Multi-Subject Support */}
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Fənn:</span>
              <select
                value={currentQ.subject || 'Riyaziyyat'}
                onChange={(e) => onUpdateQuestion(activeQuestionIndex, { ...currentQ, subject: e.target.value })}
                className="bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-indigo-900 dark:text-indigo-300 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {(availableSubjects && availableSubjects.length > 0 ? availableSubjects : ALL_SCHOOL_SUBJECTS.map(s => s.name)).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Sualın balı:</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={currentQ.points}
              onChange={(e) => onUpdateQuestion(activeQuestionIndex, { ...currentQ, points: parseFloat(e.target.value) || 1 })}
              className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* SITUATION TYPE: Show Common Situation Scenario Textbox & 10 Keywords */}
        {currentQ.question_type === 'situation' && (
          <div className="p-4 bg-gradient-to-r from-amber-50/90 to-amber-100/50 border-2 border-amber-300 rounded-2xl flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-700" />
                Situasiya Tipli Sual (10 Açar Söz və Qiymətləndirmə)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSituationModal(true)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1 transition-all"
                  title="Situasiya mətni, 10 açar söz və DİM qiymətləndirmə rejimini redaktə et"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Redaktə et (10 Açar Söz)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveMathTarget('situation'); setShowFormulaModal(true); }}
                  className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 bg-white border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1"
                >
                  <Calculator className="w-3 h-3" /> Düstur
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-amber-900">Situasiya Mətni:</label>
              <textarea
                rows={3}
                value={currentQ.situation_text || ''}
                onChange={(e) => onUpdateQuestion(activeQuestionIndex, { ...currentQ, situation_text: e.target.value })}
                placeholder="Situasiyanın ümumi mətnini, şərtini və kontekstini daxil edin..."
                className="w-full px-3 py-2 text-xs bg-white border border-amber-300 focus:border-amber-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
              />
            </div>

            {/* Badges for 10 Keywords & Grading Mode */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-amber-950 bg-amber-200/90 border border-amber-300 px-2.5 py-0.5 rounded-full">
                Model: {currentQ.situation_grading_mode === 'dim_tiered' ? 'DİM Tipli Qiymətləndirmə' : 'Açar sözlər (Hər biri 10%)'}
              </span>
              {(currentQ.situation_keywords || []).filter(k => k && k.trim()).map((kw, i) => (
                <span key={i} className="text-[10px] font-semibold bg-white border border-amber-300 text-amber-900 px-2 py-0.5 rounded-lg shadow-2xs">
                  {i + 1}. {kw}
                </span>
              ))}
              {(!currentQ.situation_keywords || currentQ.situation_keywords.filter(k => k && k.trim()).length === 0) && (
                <span className="text-[11px] text-amber-700 italic">
                  Açar sözlər daxil edilməyib. 'Redaktə et' düyməsinə klikləyərək 10 açar sözü təyin edin.
                </span>
              )}
            </div>

            {currentQ.situation_text && (
              <div className="p-2.5 bg-white/95 rounded-xl border border-amber-200 text-xs text-slate-700 mt-1">
                <span className="text-[10px] font-bold text-amber-800 block mb-1">Situasiya Önbaxışı:</span>
                <MathRenderer content={currentQ.situation_text} />
              </div>
            )}
          </div>
        )}

        {/* Question Text Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Sualın Mətni:
            </label>

            {/* Quick insert toolbar */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => { setActiveMathTarget('question'); setShowFormulaModal(true); }}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs flex items-center gap-1 transition-all"
                title="Düsturu yazmaq, dəyişmək və canlı önizləmək"
              >
                <Edit3 className="w-3 h-3" />
                Düstur Redaktoru
              </button>

              <button
                type="button"
                onClick={() => { setActiveMathTarget('question'); setShowMathKeyboard(prev => !prev); setShowGraphLab(false); }}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg border flex items-center gap-1 transition-colors ${
                  showMathKeyboard && activeMathTarget === 'question'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                <Calculator className="w-3 h-3" />
                Sürətli klaviatura
              </button>

              <button
                type="button"
                onClick={() => { setShowGraphLab(prev => !prev); setShowMathKeyboard(false); }}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg border flex items-center gap-1 transition-colors ${
                  showGraphLab
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                <Compass className="w-3 h-3" />
                Qrafik & Həndəsə
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                title="Suala şəkil əlavə et"
              >
                <ImageIcon className="w-3 h-3 text-slate-500" />
                Şəkil
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleInsertTable}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                title="Cədvəl şablonu əlavə et"
              >
                <TableIcon className="w-3 h-3 text-slate-500" />
                Cədvəl
              </button>

              <button
                type="button"
                onClick={() => {
                  setSnippetTarget('question');
                  setShowSnippetModal(true);
                }}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 shadow-2xs cursor-pointer"
                title="PDF və ya Word sənədindən kəsib suala əlavə et"
              >
                <Scissors className="w-3 h-3 text-indigo-600" />
                <span>PDF/Word-dən Kəs</span>
              </button>
            </div>
          </div>

          {/* Horizontally wide, vertically compact textarea */}
          <textarea
            rows={2}
            value={currentQ.question_text}
            onChange={(e) => onUpdateQuestion(activeQuestionIndex, { ...currentQ, question_text: e.target.value })}
            placeholder="Sualın mətnini daxil edin. Düsturlar üçün $ düyməsindən istifadə edə bilərsiniz (məsələn: $\frac{a}{b}$)..."
            className="w-full px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y min-h-[58px]"
          />

          {/* Live KaTeX Render Preview of Question Text */}
          {currentQ.question_text && (
            <div className="mt-1.5 p-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-0.5">Canlı önbaxış:</span>
              <MathRenderer content={currentQ.question_text} />
            </div>
          )}
        </div>

        {/* Embedded Image Preview if present (Sətrin başında / Sola düzlənmiş) */}
        {currentQ.image_url && (
          <div className="relative border border-slate-200 bg-slate-50 rounded-xl p-3 flex flex-col items-start text-left">
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Sual Şəkli
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuestion(activeQuestionIndex, { ...currentQ, image_url: '' })}
                className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Şəkli sil
              </button>
            </div>
            <img
              src={currentQ.image_url}
              alt="Sual Şəkli"
              className="max-h-48 rounded-lg border border-slate-200 shadow-sm object-contain"
            />
          </div>
        )}

        {/* Embedded Graph Preview if present */}
        {currentQ.graph_data?.imageDataUrl && (
          <div className="relative border border-indigo-100 bg-indigo-50/20 rounded-xl p-3 flex flex-col items-start text-left">
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-bold text-indigo-800 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Suala daxil edilmiş funksiya qrafiki
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuestion(activeQuestionIndex, { ...currentQ, graph_data: null })}
                className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Qrafiki sil
              </button>
            </div>
            <img
              src={currentQ.graph_data.imageDataUrl}
              alt="Funksiya Qrafiki"
              className="max-h-48 rounded-lg border border-slate-200 shadow-sm"
            />
          </div>
        )}

        {/* Modals / Drawers for Math Keyboard or Graph Lab */}
        {showMathKeyboard && (
          <div className="my-1">
            <VisualMathKeyboard
              onInsert={handleInsertMath}
              onClose={() => setShowMathKeyboard(false)}
            />
          </div>
        )}

        {showGraphLab && (
          <div className="my-1">
            <GraphLaboratory
              initialData={currentQ.graph_data}
              onSaveToQuestion={(gData: GraphData) => {
                onUpdateQuestion(activeQuestionIndex, { ...currentQ, graph_data: gData });
                setShowGraphLab(false);
              }}
              onClose={() => setShowGraphLab(false)}
            />
          </div>
        )}

        {/* Answer Options OR Open-Ended Answer */}
        {currentQ.question_type === 'open_ended' || currentQ.question_type === 'numeric' ? (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Düzgün Cavab (Açıq Sual / Ədədi / İfadə):</span>
              <button
                type="button"
                onClick={() => { setActiveMathTarget('correct_answer'); setShowFormulaModal(true); }}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Calculator className="w-3 h-3" /> Cavaba düstur əlavə et
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={currentQ.correct_answer || ''}
                onChange={(e) => onUpdateQuestion(activeQuestionIndex, { ...currentQ, correct_answer: e.target.value })}
                placeholder="Düzgün cavabı daxil edin (məs: 24, x=3, və ya $\frac{1}{2}$)..."
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
              />
              {currentQ.correct_answer && currentQ.correct_answer.includes('$') && (
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  <MathRenderer content={currentQ.correct_answer} />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Şagird imtahan zamanı bu sahəyə öz cavabını yazacaq və sistem avtomatik yoxlayacaq.
            </p>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Cavab Variantları (A, B, C, D, E):</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Düzgün cavabı işarələmək üçün radio düyməsinə klikləyin</span>
            </div>

            <div className="flex flex-col gap-2">
              {currentQ.options.map((opt) => {
                const isCorrect = currentQ.question_type === 'multiple_choice'
                  ? (currentQ.correct_answer || '').split(',').includes(opt.id)
                  : currentQ.correct_answer === opt.id;

                return (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all ${
                      isCorrect
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-600 ring-1 ring-emerald-300 dark:ring-emerald-600'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {/* Select button A/B/C/D/E */}
                    <button
                      type="button"
                      onClick={() => handleSetCorrectOption(opt.id)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isCorrect
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-none'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {opt.id}
                    </button>

                    {/* Wide horizontal, vertically compact input */}
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                        placeholder={`${opt.id} variantının mətni (məsələn: $x=2$)...`}
                        className="w-full px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent border-0 focus:outline-none focus:ring-0"
                      />

                      {/* Math preview pill if math is in option */}
                      {opt.text && opt.text.includes('$') && (
                        <div className="shrink-0 max-w-[200px] overflow-hidden truncate px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs text-slate-800 dark:text-slate-200">
                          <MathRenderer content={opt.text} />
                        </div>
                      )}
                    </div>

                    {/* Math button for option */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMathTarget(`opt-${opt.id}`);
                        setShowFormulaModal(true);
                        setShowGraphLab(false);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Bu varianta düstur əlavə et"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                    </button>

                    {/* Snippet / Crop button for option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSnippetTarget(`opt-${opt.id}`);
                        setShowSnippetModal(true);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded transition-colors"
                      title={`Bu varianta (${opt.id}) PDF/Word-dən kəsib əlavə et`}
                    >
                      <Scissors className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    </button>

                    {/* Correct badge */}
                    {isCorrect && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                        Düzgün
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Explanation Section */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              Sualın İzahı (Cavablı Test və Nəticələr üçün):
            </label>
            <button
              type="button"
              onClick={() => {
                setActiveMathTarget('explanation');
                setShowMathKeyboard(true);
                setShowGraphLab(false);
              }}
              className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Calculator className="w-3 h-3" /> İzahda düstur
            </button>
          </div>
          <textarea
            rows={2}
            value={currentQ.explanation || ''}
            onChange={(e) => onUpdateQuestion(activeQuestionIndex, { ...currentQ, explanation: e.target.value })}
            placeholder="Şagirdə və ya imtahan sonrası təhlil üçün sualın addım-addım həll izahını yazın..."
            className="w-full px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50/50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y min-h-[46px]"
          />
        </div>
      </div>

      {/* Formula Editor Modal */}
      <FormulaEditorModal
        isOpen={showFormulaModal}
        initialLatex=""
        onSave={(latex) => handleInsertMath(latex)}
        onClose={() => setShowFormulaModal(false)}
      />

      {/* Situation Question Modal */}
      <SituationQuestionModal
        isOpen={showSituationModal}
        onClose={() => setShowSituationModal(false)}
        initialQuestion={currentQ}
        questionNumber={activeQuestionIndex + 1}
        onSave={(data) => {
          onUpdateQuestion(activeQuestionIndex, {
            ...currentQ,
            ...data
          });
        }}
        onDelete={() => onDeleteQuestion(activeQuestionIndex)}
      />

      {/* PDF / Word Document Snippet & Crop Modal */}
      <DocSnippetModal
        isOpen={showSnippetModal}
        initialTarget={snippetTarget}
        onClose={() => setShowSnippetModal(false)}
        onInsert={handleInsertSnippet}
        allowSituation={true}
      />
    </div>
  );
};
