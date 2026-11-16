// src/pages/QuestionBankPage.tsx
import React, { useState, useEffect } from 'react';
import { User, Question, QuestionOption, ExamModel } from '../types';
import { api } from '../lib/api';
import { MathRenderer } from '../components/MathRenderer';
import { VisualMathKeyboard } from '../components/VisualMathKeyboard';
import { GraphLaboratory } from '../components/GraphLaboratory';
import {
  Database,
  Plus,
  Send,
  Search,
  Filter,
  Trash2,
  Edit2,
  Copy,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Calculator,
  Compass,
  Layers,
  ArrowRight
} from 'lucide-react';

interface QuestionBankPageProps {
  user: User;
  onSendToTest: (targetMode: 'interactive' | 'answered', questionIds: string[]) => void;
}

export const QuestionBankPage: React.FC<QuestionBankPageProps> = ({
  user,
  onSendToTest,
}) => {
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [showSendModal, setShowSendModal] = useState<boolean>(false);

  // New Question Form state
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newSubject, setNewSubject] = useState<string>('Riyaziyyat');
  const [newTopic, setNewTopic] = useState<string>('');
  const [newGrade, setNewGrade] = useState<number>(9);
  const [newPoints, setNewPoints] = useState<number>(4);
  const [newExplanation, setNewExplanation] = useState<string>('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState<string>('A');
  const [newOptions, setNewOptions] = useState<QuestionOption[]>([
    { id: 'A', text: '', is_correct: true },
    { id: 'B', text: '', is_correct: false },
    { id: 'C', text: '', is_correct: false },
    { id: 'D', text: '', is_correct: false },
    { id: 'E', text: '', is_correct: false },
  ]);
  const [graphData, setGraphData] = useState<any>(null);

  // Modals for formulas / graph
  const [showMathKeyboard, setShowMathKeyboard] = useState<boolean>(false);
  const [showGraphLab, setShowGraphLab] = useState<boolean>(false);
  const [mathTarget, setMathTarget] = useState<'text' | 'explanation' | string>('text');

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await api.getQuestions({ teacher_id: user.id });
      setBankQuestions(data || []);
      // Default select all
      setSelectedIds((data || []).map(q => q.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [user.id]);

  // Insert math snippet into form
  const handleInsertMath = (latex: string) => {
    if (mathTarget === 'text') {
      setNewQuestionText(prev => prev + ' ' + latex + ' ');
    } else if (mathTarget === 'explanation') {
      setNewExplanation(prev => prev + ' ' + latex + ' ');
    } else if (mathTarget.startsWith('opt-')) {
      const optId = mathTarget.replace('opt-', '');
      setNewOptions(prev => prev.map(o => o.id === optId ? { ...o, text: o.text + ' ' + latex + ' ' } : o));
    }
  };

  // Add Question to bank list (Step 1, 2, 3 per prompt)
  const handleAddQuestionToBank = async () => {
    if (!newQuestionText.trim()) {
      alert('Sual mətni daxil edilməlidir');
      return;
    }

    try {
      await api.createQuestion({
        teacher_id: user.id,
        subject: newSubject,
        topic: newTopic.trim(),
        grade: newGrade,
        question_text: newQuestionText.trim(),
        question_type: 'single_choice',
        options: newOptions,
        correct_answer: newCorrectAnswer,
        points: newPoints,
        explanation: newExplanation.trim(),
        graph_data: graphData
      });

      // Reset form for next question
      setNewQuestionText('');
      setNewExplanation('');
      setGraphData(null);
      setNewOptions([
        { id: 'A', text: '', is_correct: true },
        { id: 'B', text: '', is_correct: false },
        { id: 'C', text: '', is_correct: false },
        { id: 'D', text: '', is_correct: false },
        { id: 'E', text: '', is_correct: false },
      ]);
      setNewCorrectAnswer('A');

      loadQuestions();
    } catch (err: any) {
      alert(err.message || 'Sual əlavə edilərkən xəta');
    }
  };

  // Delete question from bank
  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Bu sualı bankdan silmək istəyirsiniz?')) return;
    try {
      await api.deleteQuestion(id);
      loadQuestions();
    } catch {
      alert('Xəta baş verdi');
    }
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map(q => q.id));
    }
  };

  const filteredQuestions = bankQuestions.filter(q => {
    const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
    const matchesSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (q.topic && q.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-50 text-violet-700 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">İnteraktiv Sual Bankı</h1>
            <p className="text-xs text-slate-500">
              Daimi sual kitabxanası: İstədiyiniz sayda sual yaradın, toplayın və bir kliklə İnteraktiv və ya OMR Testə göndərin
            </p>
          </div>
        </div>

        {/* Send to Test button (Section IX requirement) */}
        <button
          onClick={() => setShowSendModal(true)}
          disabled={selectedIds.length === 0}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-2 transition-all"
        >
          <Send className="w-4 h-4" />
          Testi Formalaşdır və Göndər ({selectedIds.length})
        </button>
      </div>

      {/* Grid: Create Question on Left, Bank List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Add New Question to Bank */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" /> Sual Bankına Yeni Sual Əlavə Et
            </h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Kitabxana
            </span>
          </div>

          {/* Subject, Grade, Topic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Fənn:</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              >
                <option value="Riyaziyyat">Riyaziyyat</option>
                <option value="Azərbaycan dili">Azərbaycan dili</option>
                <option value="Fizika">Fizika</option>
                <option value="Kimya">Kimya</option>
                <option value="Biologiya">Biologiya</option>
                <option value="Tarix">Tarix</option>
                <option value="Coğrafiya">Coğrafiya</option>
                <option value="İnformatika">İnformatika</option>
                <option value="İngilis dili">İngilis dili</option>
                <option value="Məntiq">Məntiq</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Sinif:</label>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(parseInt(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              >
                {[5, 6, 7, 8, 9, 10, 11].map(g => (
                  <option key={g} value={g}>{g}-ci sinif</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Mövzu:</label>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Mövzu başlığı (məsələn: Həndəsə, Tənliklər)..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          {/* Question Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Sualın Mətni:</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { setMathTarget('text'); setShowMathKeyboard(prev => !prev); setShowGraphLab(false); }}
                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1"
                >
                  <Calculator className="w-3 h-3" /> Düstur
                </button>
                <button
                  type="button"
                  onClick={() => { setShowGraphLab(prev => !prev); setShowMathKeyboard(false); }}
                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1"
                >
                  <Compass className="w-3 h-3" /> Qrafik
                </button>
              </div>
            </div>

            {/* Vertically compact, horizontally wide per prompt */}
            <textarea
              rows={2}
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Sualı yazın. Düsturlar üçün $ istifadə edin..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white resize-y min-h-[50px]"
            />

            {newQuestionText && (
              <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <MathRenderer content={newQuestionText} />
              </div>
            )}
          </div>

          {/* Graph preview if attached */}
          {graphData?.imageDataUrl && (
            <div className="p-2 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50">
              <img src={graphData.imageDataUrl} alt="Qrafik" className="max-h-20 rounded" />
              <button
                type="button"
                onClick={() => setGraphData(null)}
                className="text-rose-600 hover:text-rose-800 text-xs font-bold"
              >
                Sil
              </button>
            </div>
          )}

          {/* Math Keyboard or Graph Lab Modals */}
          {showMathKeyboard && (
            <VisualMathKeyboard
              onInsert={handleInsertMath}
              onClose={() => setShowMathKeyboard(false)}
            />
          )}

          {showGraphLab && (
            <GraphLaboratory
              initialData={graphData}
              onSaveToQuestion={(gData) => {
                setGraphData(gData);
                setShowGraphLab(false);
              }}
              onClose={() => setShowGraphLab(false)}
            />
          )}

          {/* Options A-E */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Cavab Variantları:</label>
            <div className="flex flex-col gap-1.5">
              {newOptions.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCorrectAnswer(opt.id);
                      setNewOptions(newOptions.map(o => ({ ...o, is_correct: o.id === opt.id })));
                    }}
                    className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                      newCorrectAnswer === opt.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {opt.id}
                  </button>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const updated = newOptions.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o);
                      setNewOptions(updated);
                    }}
                    placeholder={`${opt.id} variantı...`}
                    className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                  {newCorrectAnswer === opt.id && (
                    <span className="text-[10px] font-bold text-emerald-600">Düzgün</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Sualın İzahı:</label>
            <textarea
              rows={1}
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
              placeholder="Düzgün cavabın həll qaydası..."
              className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg min-h-[36px]"
            />
          </div>

          {/* Siyahıya əlavə et düyməsi (Section IX Step 2) */}
          <button
            type="button"
            onClick={handleAddQuestionToBank}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Siyahıya Əlavə Et
          </button>
        </div>

        {/* RIGHT COLUMN: Question Bank List (Section IX) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Sual Bankı Siyahısı (<span className="text-indigo-600">{filteredQuestions.length}</span> sual)
              </h3>
              <p className="text-[11px] text-slate-400">İmtahana əlavə etmək üçün istədiyiniz sualları seçin</p>
            </div>

            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              {selectedIds.length === filteredQuestions.length ? 'Seçimi ləğv et' : 'Hamısını seç'}
            </button>
          </div>

          {/* Search & Subject Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bankda sual mətni axtar..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
            >
              <option value="all">Bütün fənlər</option>
              <option value="Riyaziyyat">Riyaziyyat</option>
              <option value="Fizika">Fizika</option>
              <option value="Azərbaycan dili">Azərbaycan dili</option>
              <option value="Kimya">Kimya</option>
              <option value="Biologiya">Biologiya</option>
            </select>
          </div>

          {/* Questions Stream */}
          {loading ? (
            <div className="p-10 text-center text-xs text-slate-400">Suallar yüklənir...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">Bankda bu filtr üzrə sual tapılmadı.</div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredQuestions.map((q, idx) => {
                const isSelected = selectedIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-indigo-50/30 border-indigo-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(q.id)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-slate-400">№{idx + 1}</span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700">
                              {q.subject}
                            </span>
                            {q.topic && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                • {q.topic}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-800 leading-relaxed font-medium">
                            <MathRenderer content={q.question_text} />
                          </div>

                          {/* Options preview */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                            {q.options.map(opt => (
                              <div
                                key={opt.id}
                                className={`text-[11px] p-1 rounded border flex items-center gap-1.5 ${
                                  q.correct_answer === opt.id
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                <span className="font-bold">{opt.id}:</span>
                                <span className="truncate"><MathRenderer content={opt.text} /></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: "Testi formalaşdır və göndər" (Section IX) */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Testi Formalaşdır və Göndər
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Seçilmiş <strong>{selectedIds.length}</strong> sualı hansı test proqramına yönləndirmək istəyirsiniz?
            </p>

            <div className="grid grid-cols-1 gap-3 mb-6">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  onSendToTest('interactive', selectedIds);
                }}
                className="p-4 rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-indigo-950">İnteraktiv Testə Göndər</span>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    Canlı Sınaq
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Şagirdlər üçün taymerli, avtomatik yadda saxlamalı və dərhal nəticə hesablamalı imtahan rejimi.
                </p>
              </button>

              <button
                onClick={() => {
                  setShowSendModal(false);
                  onSendToTest('answered', selectedIds);
                }}
                className="p-4 rounded-xl border-2 border-amber-500 hover:bg-amber-50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-amber-950">OMR Testə Göndər</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    A4 & OMR Kartı
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Düzgün cavabların, həll izahlarının göstərildiyi və A4 çap/PDF formatına uyğun modul.
                </p>
              </button>
            </div>

            <button
              onClick={() => setShowSendModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Bağla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
