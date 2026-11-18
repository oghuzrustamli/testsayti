// src/pages/TestCreatorPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { User, Test, Question, ExamModel, GradingRule, TestMode, TestStatus } from '../types';
import { EXAM_MODELS, OMR_CATEGORIES_DATA } from '../lib/constants';
import { QuestionEditor } from '../components/QuestionEditor';
import { MathRenderer } from '../components/MathRenderer';
import { MultiSubjectSelector, SubjectConfig } from '../components/MultiSubjectSelector';
import { DocumentQuestionImportModal } from '../components/DocumentQuestionImportModal';
import { api } from '../lib/api';
import {
  Save,
  Send,
  ArrowLeft,
  Clock,
  Award,
  Layers,
  BookOpen,
  Calendar,
  CheckCircle,
  FileQuestion,
  HelpCircle,
  AlertCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  GraduationCap,
  Sliders,
  FileSpreadsheet,
  Compass,
  FileUp
} from 'lucide-react';

interface TestCreatorPageProps {
  user: User;
  editTestId?: string | null;
  onBack: () => void;
  onSaved: (test: Test, shouldShare?: boolean) => void;
}

const DEFAULT_QUESTION = (index: number): Question => ({
  id: 'new-' + Math.random().toString(36).substring(2, 9),
  subject: 'Riyaziyyat',
  question_text: '',
  question_type: 'single_choice',
  options: [
    { id: 'A', text: '', is_correct: true },
    { id: 'B', text: '', is_correct: false },
    { id: 'C', text: '', is_correct: false },
    { id: 'D', text: '', is_correct: false },
    { id: 'E', text: '', is_correct: false },
  ],
  correct_answer: 'A',
  points: 4,
  explanation: '',
  order_index: index,
});

export const TestCreatorPage: React.FC<TestCreatorPageProps> = ({
  user,
  editTestId,
  onBack,
  onSaved,
}) => {
  // General Parameters State
  const [title, setTitle] = useState<string>('');
  const [examModel, setExamModel] = useState<ExamModel>('Buraxılış imtahanı');
  const [selectedSubGroup, setSelectedSubGroup] = useState<string>('');
  const [gradeGroup, setGradeGroup] = useState<string>('9-cu sinif');
  const [subject, setSubject] = useState<string>('Riyaziyyat');
  const [topic, setTopic] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [gradingRule, setGradingRule] = useState<GradingRule>('standard');
  const [resultDisplayMode, setResultDisplayMode] = useState<'immediate' | 'after_deadline' | 'manual'>('immediate');
  const [testMode, setTestMode] = useState<TestMode>('interactive');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  // Top Category Menu (Blok, Buraxılış, Məktəbdaxili, Liseylər)
  const [selectedCategory, setSelectedCategory] = useState<string>('buraxilis');
  const [activeCategoryMenu, setActiveCategoryMenu] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('9-cu sinif Buraxılış');
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setActiveCategoryMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Questions State
  const [questions, setQuestions] = useState<Question[]>([DEFAULT_QUESTION(0)]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Multi-Subject State (Tələb 1, 2)
  const [isMultiSubject, setIsMultiSubject] = useState<boolean>(false);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectConfig[]>([
    { subject: 'Riyaziyyat', questionCount: 20 }
  ]);

  // Word / PDF Importer Modal State (Tələb 6)
  const [showWordPdfModal, setShowWordPdfModal] = useState<boolean>(false);
  const [previewQIndex, setPreviewQIndex] = useState<number>(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string>>({});

  // Load existing test if in edit mode
  useEffect(() => {
    if (editTestId) {
      setLoading(true);
      api.getTestById(editTestId)
        .then((t) => {
          setTitle(t.title);
          setExamModel(t.exam_model);
          setGradeGroup(t.grade_group);
          setSubject(t.subject);
          setTopic(t.topic || '');
          setDurationMinutes(t.duration_minutes);
          setGradingRule(t.grading_rule);
          setResultDisplayMode(t.result_display_mode);
          setTestMode(t.test_mode);
          setStatus(t.status as any || 'published');
          if (t.questions && t.questions.length > 0) {
            setQuestions(t.questions);
          }
        })
        .catch((err) => {
          setErrorMsg('Test yüklənərkən xəta baş verdi');
        })
        .finally(() => setLoading(false));
    }
  }, [editTestId]);

  // Handle Exam Model Change (Populate dynamic subjects)
  const currentModelConfig = EXAM_MODELS[examModel];

  useEffect(() => {
    if (currentModelConfig.subGroups && currentModelConfig.subGroups.length > 0) {
      const firstGroup = currentModelConfig.subGroups[0];
      setSelectedSubGroup(firstGroup.name);
      setSubject(firstGroup.subjects[0]);
    } else if (currentModelConfig.defaultSubjects && currentModelConfig.defaultSubjects.length > 0) {
      setSelectedSubGroup('');
      setSubject(currentModelConfig.defaultSubjects[0]);
    }

    if (currentModelConfig.grades && currentModelConfig.grades.length > 0) {
      setGradeGroup(currentModelConfig.grades[0]);
    }
  }, [examModel]);

  // Handle Sub-group change (e.g. Blok I Qrup RK vs Rİ)
  const handleSubGroupChange = (groupName: string) => {
    setSelectedSubGroup(groupName);
    const grp = currentModelConfig.subGroups?.find(g => g.name === groupName);
    if (grp && grp.subjects.length > 0) {
      setSubject(grp.subjects[0]);
    }
  };

  // Questions Handlers
  const handleAddQuestion = () => {
    const newQ = DEFAULT_QUESTION(questions.length);
    newQ.subject = subject;
    setQuestions([...questions, newQ]);
    setActiveQuestionIndex(questions.length);
  };

  const handleAddSituationQuestion = () => {
    const newQ: Question = {
      id: 'new-' + Math.random().toString(36).substring(2, 9),
      subject: subject,
      question_text: `Situasiya üzrə sual №${questions.length + 1}`,
      question_type: 'situation',
      options: [],
      correct_answer: '',
      points: 6,
      order_index: questions.length,
      situation_text: '',
      situation_keywords: Array.from({ length: 10 }, (_, i) => `Açar anlayış ${i + 1}`),
      situation_synonyms: {},
      situation_grading_mode: 'keywords_10'
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIndex(questions.length);
  };

  const handleUpdateQuestion = (index: number, updated: Question) => {
    const updatedList = [...questions];
    updatedList[index] = updated;
    setQuestions(updatedList);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) return;
    const nextList = questions.filter((_, idx) => idx !== index);
    setQuestions(nextList);
    setActiveQuestionIndex(Math.max(0, index - 1));
  };

  const handleDuplicateQuestion = (index: number) => {
    const target = questions[index];
    const duplicated: Question = {
      ...target,
      id: 'new-' + Math.random().toString(36).substring(2, 9),
      order_index: questions.length,
      question_text: target.question_text + ' (Kopya)',
    };
    const nextList = [...questions];
    nextList.splice(index + 1, 0, duplicated);
    setQuestions(nextList);
    setActiveQuestionIndex(index + 1);
  };

  const handleMoveQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= questions.length) return;
    const nextList = [...questions];
    const [moved] = nextList.splice(fromIndex, 1);
    nextList.splice(toIndex, 0, moved);
    setQuestions(nextList);
    setActiveQuestionIndex(toIndex);
  };

  // Calculate totals
  const totalPoints = questions.reduce((acc, q) => acc + (parseFloat(q.points as any) || 0), 0);

  // Handle imported questions from Word / PDF
  const handleImportQuestions = (imported: Question[]) => {
    if (imported.length === 0) return;
    setQuestions(prev => [...prev, ...imported]);

    // Sync newly imported subjects into selectedSubjects if not already present
    const uniqueImportedSubjects = Array.from(new Set(imported.map(q => q.subject).filter(Boolean)));
    if (uniqueImportedSubjects.length > 1) {
      setIsMultiSubject(true);
    }
    setSelectedSubjects(prev => {
      const existingNames = new Set(prev.map(p => p.subject));
      const additions = uniqueImportedSubjects
        .filter(sub => !existingNames.has(sub))
        .map(sub => ({ subject: sub, questionCount: imported.filter(q => q.subject === sub).length }));
      return [...prev, ...additions];
    });
  };

  // Save / Publish
  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      setErrorMsg('Zəhmət olmasa testin adını daxil edin');
      return;
    }

    const finalSubject = isMultiSubject && selectedSubjects.length > 0
      ? selectedSubjects.map(s => s.subject).join(', ')
      : subject;

    if (!finalSubject) {
      setErrorMsg('Fənn seçilməlidir');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const payload: Partial<Test> = {
        teacher_id: user.id,
        title: title.trim(),
        exam_model: examModel,
        grade_group: gradeGroup,
        subject: finalSubject,
        topic: topic.trim(),
        duration_minutes: durationMinutes,
        total_points: totalPoints,
        grading_rule: gradingRule,
        result_display_mode: resultDisplayMode,
        test_mode: testMode,
        status: (publish ? 'published' : 'draft') as TestStatus,
        questions,
      };

      let resultTestId = editTestId;
      let shareCode = '';

      if (editTestId) {
        await api.updateTest(editTestId, payload);
      } else {
        const res = await api.createTest(payload);
        resultTestId = res.id;
        shareCode = res.share_code;
      }

      onSaved({
        ...payload,
        id: resultTestId!,
        total_questions: questions.length,
        share_code: shareCode,
        is_link_active: true
      } as any, publish);
    } catch (err: any) {
      setErrorMsg(err.message || 'Yadda saxlanarkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {editTestId ? 'İnteraktiv Testi Redaktə Et' : 'İnteraktiv Test Yarat'}
            </h1>
            <p className="text-xs text-slate-500">
              İmtahan modelini, fənni və sualları tənzimləyərək tam işlək interaktiv test hazırlayın
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Word / PDF-dən Sual Əlavə Et Düyməsi (Tələb 6) */}
          <button
            type="button"
            onClick={() => setShowWordPdfModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Word (.docx, .doc) və ya PDF faylından sualları avtomatik testə əlavə et"
          >
            <FileUp className="w-4 h-4" />
            <span>Word / PDF-dən sual əlavə et</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            title="Şagird interfeysində necə görünəcəyinə bax"
          >
            <Eye className="w-4 h-4" />
            Önizləmə
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4 text-slate-500" />
            Qaralama Saxla
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(true)}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Yadda saxlanılır...' : 'Yayımla və Paylaş'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          {errorMsg}
        </div>
      )}

      {/* TOP COMPACT PARAMETERS BAR (OMR ilə eyni menyu dizaynı) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* 1. ƏSAS MODEL MENYUSU (Blok, Buraxılış, Məktəbdaxili, Liseylər) */}
          <div className="relative shrink-0" ref={categoryMenuRef}>
            <button
              type="button"
              onClick={() => setActiveCategoryMenu(activeCategoryMenu ? null : selectedCategory)}
              className="h-9 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-800 shadow-2xs flex items-center justify-between gap-2.5 transition-all cursor-pointer"
              title="İmtahan Modeli seçin"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-slate-500 font-semibold shrink-0">Model:</span>
                <span className="text-indigo-700 font-bold">
                  {OMR_CATEGORIES_DATA.find(c => c.id === selectedCategory)?.label || 'Buraxılış'} • {selectedSubCategory}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${activeCategoryMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown panel for all 4 category options */}
            {activeCategoryMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="grid grid-cols-2 gap-2">
                  {OMR_CATEGORIES_DATA.map((cat) => {
                    const isCatSelected = selectedCategory === cat.id;
                    const catIcons: Record<string, any> = {
                      blok: Layers,
                      buraxilis: Award,
                      mektebdaxili: BookOpen,
                      liseyler: Compass,
                    };
                    const Icon = catIcons[cat.id] || BookOpen;

                    return (
                      <div key={cat.id} className="border border-slate-100 rounded-xl p-2 bg-slate-50/70">
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60 text-[11px] font-extrabold text-slate-800">
                          <div className="flex items-center gap-1">
                            <Icon className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{cat.label}</span>
                          </div>
                          <span className="text-[9px] font-semibold text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200/60">
                            {cat.badge}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          {cat.items.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat.id);
                                setSelectedSubCategory(sub.name);
                                if (!title || title.includes(' - İnteraktiv Sınaq') || title.includes('Sınaq')) {
                                  setTitle(`${sub.name} - İnteraktiv Sınaq`);
                                }
                                if (cat.id === 'blok') {
                                  setExamModel('Blok imtahanı');
                                  setSelectedSubGroup(sub.name);
                                } else if (cat.id === 'buraxilis') {
                                  setExamModel('Buraxılış imtahanı');
                                } else if (cat.id === 'mektebdaxili') {
                                  setExamModel('Məktəbdaxili test');
                                } else {
                                  setExamModel('Liseylərə qəbul imtahanı');
                                }
                                const cleanSub = sub.subject.split('/')[0].trim();
                                if (cleanSub) setSubject(cleanSub);
                                setActiveCategoryMenu(null);
                              }}
                              className={`w-full text-left px-2 py-1 rounded-lg text-[10.5px] font-semibold transition-colors flex items-center justify-between ${
                                selectedSubCategory === sub.name
                                  ? 'bg-indigo-600 text-white font-bold'
                                  : 'text-slate-700 hover:bg-slate-200/70'
                              }`}
                            >
                              <span>{sub.name}</span>
                              {selectedSubCategory === sub.name && (
                                <CheckCircle className="w-3 h-3 text-white shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. FƏNN SEÇİMİ (Tək Fənn və ya Çoxfənli Seçim) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-600">Fənn:</span>
            {!isMultiSubject ? (
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 px-2.5 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="Riyaziyyat">Riyaziyyat</option>
                <option value="Azərbaycan dili">Azərbaycan dili</option>
                <option value="İngilis dili">İngilis dili</option>
                <option value="Fizika">Fizika</option>
                <option value="Kimya">Kimya</option>
                <option value="Biologiya">Biologiya</option>
                <option value="Tarix">Tarix</option>
                <option value="Coğrafiya">Coğrafiya</option>
                <option value="İnformatika">İnformatika</option>
                <option value="Ədəbiyyat">Ədəbiyyat</option>
                <option value="Rus dili">Rus dili</option>
                <option value="Məntiq">Məntiq</option>
              </select>
            ) : (
              <span className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-black">
                {selectedSubjects.length} Fənn Seçilib
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsMultiSubject(!isMultiSubject)}
              className={`h-9 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                isMultiSubject
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white hover:bg-indigo-50 border-slate-300 text-slate-700 hover:text-indigo-700'
              }`}
              title="Çoxfənli test rejiminə keç və fənləri seç"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isMultiSubject ? 'Çoxfənli Aktiv' : '+ Çoxfənli Seç'}</span>
            </button>
          </div>

          {/* 3. TESTİN ADI */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Testin Adı (Məsələn: IX Sinif Buraxılış İmtahanı Sınaq 1)..."
              className="w-full h-9 px-3 text-xs bg-slate-50 hover:bg-white border border-slate-300 rounded-xl font-bold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* 4. MÜDDƏT */}
          <div className="flex items-center gap-1 text-xs font-bold text-slate-600 shrink-0">
            <span>Müddət:</span>
            <input
              type="number"
              min="5"
              step="5"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
              className="w-14 h-9 px-1 bg-white border border-slate-300 rounded-xl text-center text-xs font-bold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-slate-400 font-normal">dəq</span>
          </div>

          {/* 5. QİYMƏTLƏNDİRMƏ */}
          <select
            value={gradingRule}
            onChange={(e) => setGradingRule(e.target.value as GradingRule)}
            className="h-9 px-2 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none cursor-pointer shrink-0"
            title="Qiymətləndirmə qaydası"
          >
            <option value="standard">Standart (Cəriməsiz)</option>
            <option value="negative_penalty">Səhvlər düzü aparır (1/4)</option>
            <option value="proportional">Mütənasib bal</option>
          </select>
        </div>

        {/* Sağ Tərəf: Sual Sayı, Bal və Canlı Önizləmə */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold shadow-2xs">
            {questions.length} Sual
          </span>
          <span className="px-2.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-bold shadow-2xs">
            {totalPoints} Bal
          </span>
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="h-9 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Şagird interfeysində testin önizləməsi"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Şagird Baxışı</span>
          </button>
        </div>
      </div>

      {/* Çoxfənli Test Seçim Paneli (Tələb 1, 2) */}
      {isMultiSubject && (
        <MultiSubjectSelector
          selectedSubjects={selectedSubjects}
          onChange={(newSubs) => {
            setSelectedSubjects(newSubs);
            if (newSubs.length > 0 && !newSubs.some(s => s.subject === subject)) {
              setSubject(newSubs[0].subject);
            }
          }}
        />
      )}

      {/* FULL WIDTH QUESTION EDITOR */}
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-4">
        <QuestionEditor
          questions={questions}
          activeQuestionIndex={activeQuestionIndex}
          availableSubjects={isMultiSubject && selectedSubjects.length > 0 ? selectedSubjects.map(s => s.subject) : undefined}
          onSelectQuestion={setActiveQuestionIndex}
          onUpdateQuestion={handleUpdateQuestion}
          onAddQuestion={handleAddQuestion}
          onAddSituationQuestion={handleAddSituationQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onDuplicateQuestion={handleDuplicateQuestion}
          onMoveQuestion={handleMoveQuestion}
        />
      </div>

      {/* =================================================================== */}
      {/* TEST PREVIEW MODAL: Exact representation of Student Exam Interface */}
      {/* =================================================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold">
                    Şagird Baxışı (Canlı Önizləmə)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {title || 'Adsız Test'} • {examModel} • {subject}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center gap-1.5 overflow-x-auto scrollbar-thin shrink-0">
              {questions.map((q, idx) => (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => setPreviewQIndex(idx)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all border ${
                    previewQIndex === idx
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : previewAnswers[q.id]
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Modal Body: Question Screen */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col gap-5">
              {questions[previewQIndex] && (() => {
                const q = questions[previewQIndex];
                return (
                  <div className="flex flex-col gap-4">
                    {/* Situation Text if present */}
                    {q.situation_text && (
                      <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span>Situasiya Mətni</span>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                          <MathRenderer content={q.situation_text} />
                        </div>
                      </div>
                    )}

                    {/* Question Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-extrabold text-sm text-indigo-700">
                        Sual №{previewQIndex + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {q.points || 4} bal
                      </span>
                    </div>

                    {/* Question Text with KaTeX */}
                    <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                      <MathRenderer content={q.question_text || `Sual mətni daxil edilməyib`} />
                    </div>

                    {/* Attached Image */}
                    {q.image_url && (
                      <div className="my-2 flex justify-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <img
                          src={q.image_url}
                          alt="Sual Şəkli"
                          className="max-h-56 rounded-lg border border-slate-200 shadow-2xs object-contain"
                        />
                      </div>
                    )}

                    {/* Graph Laboratory Image */}
                    {q.graph_data?.imageDataUrl && (
                      <div className="my-2 flex justify-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <img
                          src={q.graph_data.imageDataUrl}
                          alt="Sual Qrafiki"
                          className="max-h-56 rounded-lg border border-slate-200 shadow-2xs"
                        />
                      </div>
                    )}

                    {/* Question Type: Open-Ended vs Single Choice */}
                    {(q.question_type === 'open_ended' || q.question_type === 'numeric') ? (
                      <div className="pt-2">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                          Şagird üçün açıq cavab xanası:
                        </label>
                        <input
                          type="text"
                          value={previewAnswers[q.id] || ''}
                          onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="Şagird cavabı buraya yazır (Məs: 25)"
                          className="w-full px-4 py-3 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5 pt-2">
                        {q.options && q.options.map((opt) => {
                          const isSelected = previewAnswers[q.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setPreviewAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600 text-indigo-950 font-bold'
                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                              }`}
                            >
                              <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {opt.id}
                              </span>
                              <span className="flex-1 text-xs sm:text-sm">
                                <MathRenderer content={opt.text} />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                disabled={previewQIndex === 0}
                onClick={() => setPreviewQIndex(p => Math.max(0, p - 1))}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Əvvəlki Sual
              </button>

              <button
                disabled={previewQIndex >= questions.length - 1}
                onClick={() => setPreviewQIndex(p => Math.min(questions.length - 1, p + 1))}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                Növbəti Sual
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word və ya PDF-dən Sual Əlavə Etmə Modalı (Tələb 6) */}
      <DocumentQuestionImportModal
        isOpen={showWordPdfModal}
        onClose={() => setShowWordPdfModal(false)}
        onImportQuestions={handleImportQuestions}
        defaultSubject={subject}
        startIndex={questions.length}
      />
    </div>
  );
};
