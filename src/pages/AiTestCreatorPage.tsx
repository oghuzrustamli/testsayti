// src/pages/AiTestCreatorPage.tsx
// Comprehensive EDUNEX AI Test Generator Page
import React, { useState } from 'react';
import { User, Test, ExamModel, Question } from '../types';
import {
  generateAiTest,
  AiTestGenerationParams,
  GeneratedAiTestResult,
  SUBJECT_SYLLABUS_TOPICS
} from '../lib/aiTestGenerator';
import { api } from '../lib/api';
import { MathRenderer } from '../components/MathRenderer';
import {
  Sparkles,
  Bot,
  Layers,
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  FileQuestion,
  HelpCircle,
  Edit3,
  Trash2,
  Plus,
  Play,
  Share2,
  Printer,
  Compass,
  Cpu,
  Calculator,
  Languages,
  Globe,
  Brain,
  Sliders,
  Check
} from 'lucide-react';

interface AiTestCreatorPageProps {
  user: User;
  onBack: () => void;
  onOpenInteractiveEditor?: (testId: string) => void;
  onOpenOmrEditor?: (testId: string) => void;
  onTestSaved?: (test: Test, shouldShare?: boolean) => void;
}

const ALL_GRADES = [
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
  '11-ci sinif'
];

const ALL_SUBJECTS = [
  { id: 'Azərbaycan dili', label: 'Azərbaycan dili', icon: BookOpen, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'Riyaziyyat', label: 'Riyaziyyat', icon: Calculator, color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { id: 'Fizika', label: 'Fizika', icon: Sparkles, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { id: 'Kimya', label: 'Kimya', icon: Layers, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'Biologiya', label: 'Biologiya', icon: Compass, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Tarix', label: 'Tarix', icon: Compass, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { id: 'Coğrafiya', label: 'Coğrafiya', icon: Globe, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { id: 'İngilis dili', label: 'İngilis dili', icon: Languages, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'İnformatika', label: 'İnformatika', icon: Cpu, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { id: 'Ədəbiyyat', label: 'Ədəbiyyat', icon: BookOpen, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'Rus dili', label: 'Rus dili', icon: Languages, color: 'text-slate-700 bg-slate-50 border-slate-200' },
  { id: 'Fransız dili', label: 'Fransız dili', icon: Languages, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'Məntiq', label: 'Məntiq', icon: Brain, color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200' }
];

export const AiTestCreatorPage: React.FC<AiTestCreatorPageProps> = ({
  user,
  onBack,
  onOpenInteractiveEditor,
  onOpenOmrEditor,
  onTestSaved
}) => {
  // Step: 1 = Parameters, 2 = Generation Animation, 3 = Review & Export
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Parameters
  const [selectedGrade, setSelectedGrade] = useState<string>('9-cu sinif');
  const [selectedSubject, setSelectedSubject] = useState<string>('Riyaziyyat');
  const [testMode, setTestMode] = useState<'interactive' | 'answered'>('interactive');
  const [topic, setTopic] = useState<string>('Kvadrat tənliklər və Viyet teoremi');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [optionsCount, setOptionsCount] = useState<4 | 5>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [language, setLanguage] = useState<'az' | 'ru' | 'en'>('az');
  const [purpose, setPurpose] = useState<'msi' | 'usi' | 'buraxilis' | 'blok' | 'ksq' | 'bsq' | 'lisey'>('buraxilis');

  // Generated state
  const [generating, setGenerating] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<GeneratedAiTestResult | null>(null);
  const [editableQuestions, setEditableQuestions] = useState<Question[]>([]);
  const [testTitle, setTestTitle] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Suggested topics for the chosen subject
  const currentSyllabus = SUBJECT_SYLLABUS_TOPICS[selectedSubject] || [];

  const handleStartGeneration = async () => {
    if (!topic.trim()) {
      alert('Zəhmət olmasa test üçün mövzu daxil edin və ya aşağıdakı təkliflərdən birini seçin.');
      return;
    }

    setGenerating(true);
    setCurrentStep(2);
    setProgressMsg('Tədris proqramı və DİM standartları təhlil edilir...');

    await new Promise(r => setTimeout(r, 700));
    setProgressMsg(`${selectedGrade} səviyyəsində suallar və riyazi/elmi düsturlar tərtib olunur...`);

    await new Promise(r => setTimeout(r, 800));
    setProgressMsg('Variantlar, inandırıcı çaşdırıcılar və düzgün cavab açarı yoxlanılır...');

    try {
      const result = await generateAiTest({
        grade: selectedGrade,
        subject: selectedSubject,
        testMode,
        topic: topic.trim(),
        questionCount,
        difficulty,
        optionsCount,
        durationMinutes,
        language,
        purpose
      });

      await new Promise(r => setTimeout(r, 500));
      setGeneratedResult(result);
      setEditableQuestions(result.questions);
      setTestTitle(result.title);
      setCurrentStep(3);
    } catch (err: any) {
      alert('AI generasiya zamanı xəta: ' + (err.message || 'Bilinməyən xəta'));
      setCurrentStep(1);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateQuestionText = (qId: string, newText: string) => {
    setEditableQuestions(prev =>
      prev.map(q => q.id === qId ? { ...q, question_text: newText } : q)
    );
  };

  const handleUpdateOption = (qId: string, optId: string, newText: string) => {
    setEditableQuestions(prev =>
      prev.map(q => {
        if (q.id !== qId) return q;
        const nextOpts = q.options.map(o => o.id === optId ? { ...o, text: newText } : o);
        return { ...q, options: nextOpts };
      })
    );
  };

  const handleSetCorrectAnswer = (qId: string, optId: string) => {
    setEditableQuestions(prev =>
      prev.map(q => {
        if (q.id !== qId) return q;
        const nextOpts = q.options.map(o => ({ ...o, is_correct: o.id === optId }));
        return { ...q, options: nextOpts, correct_answer: optId };
      })
    );
  };

  const handleDeleteQuestion = (qId: string) => {
    if (editableQuestions.length <= 1) {
      alert('Testdə ən azı 1 sual qalmalıdır');
      return;
    }
    setEditableQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const handleSaveAndExport = async (targetMode: 'interactive' | 'answered') => {
    if (!testTitle.trim()) {
      alert('Testin adını daxil edin');
      return;
    }

    try {
      setSaving(true);
      const answerKeyObj: Record<string, string> = {};
      editableQuestions.forEach((q, idx) => {
        answerKeyObj[idx + 1] = q.correct_answer;
      });

      const payload: Partial<Test> = {
        teacher_id: user.id,
        title: testTitle.trim(),
        exam_model: generatedResult?.exam_model || 'Buraxılış imtahanı',
        grade_group: selectedGrade,
        subject: selectedSubject,
        topic: topic.trim(),
        duration_minutes: durationMinutes,
        total_questions: editableQuestions.length,
        total_points: editableQuestions.length * 4,
        grading_rule: 'standard',
        result_display_mode: 'immediate',
        test_mode: targetMode,
        status: 'published',
        questions: editableQuestions,
        answer_key_json: JSON.stringify(answerKeyObj)
      };

      const res = await api.createTest(payload);
      setSaveSuccessMsg(`«${testTitle}» adlı test uğurla yaradıldı və bazaya əlavə edildi!`);

      if (onTestSaved) {
        onTestSaved({
          ...payload,
          id: res.id,
          share_code: res.share_code,
          is_link_active: true
        } as any, true);
      }

      // If user wants to immediately view or edit in that module:
      setTimeout(() => {
        if (targetMode === 'interactive' && onOpenInteractiveEditor) {
          onOpenInteractiveEditor(res.id);
        } else if (targetMode === 'answered' && onOpenOmrEditor) {
          onOpenOmrEditor(res.id);
        } else {
          onBack();
        }
      }, 1500);

    } catch (err: any) {
      console.error(err);
      alert('Yadda saxlanarkən xəta: ' + (err.message || 'Xəta baş verdi'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Geri qayıt"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" /> EDUNEX AI Test Generator
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Süni İntellekt</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              AI ilə Test Yarat
            </h1>
            <p className="text-xs text-slate-500">
              Sinif, fənn və mövzunu seçin; süni intellekt DİM standartlarına uyğun hazır sualları saniyələr içində tərtib etsin.
            </p>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
          <span className={`px-2.5 py-1 rounded-lg ${currentStep === 1 ? 'bg-white text-indigo-700 shadow-2xs' : ''}`}>
            1. Parametrlər
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-2.5 py-1 rounded-lg ${currentStep === 2 ? 'bg-white text-indigo-700 shadow-2xs' : ''}`}>
            2. AI Generasiyası
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-2.5 py-1 rounded-lg ${currentStep === 3 ? 'bg-white text-indigo-700 shadow-2xs' : ''}`}>
            3. Yoxlama & Ötürmə
          </span>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ==============================================================
          MƏRHƏLƏ 1: TESTİN PARAMETRLƏRİNİN SEÇİLMƏSİ
          ============================================================== */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-6">
          {/* Card 1: Əsas 3 Seçim (Sinif, Fənn, Test Növü) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            {/* 1. SİNFİ SEÇ */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                1. Sinfi Seçin (1–11-ci Siniflər):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
                {ALL_GRADES.map(g => {
                  const isSel = selectedGrade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGrade(g)}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer border text-center ${
                        isSel
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-[1.02]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. FƏNNİ SEÇ */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                2. Fənni Seçin:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {ALL_SUBJECTS.map(subj => {
                  const isSel = selectedSubject === subj.label;
                  const Icon = subj.icon;
                  return (
                    <button
                      key={subj.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubject(subj.label);
                        const newSyllabus = SUBJECT_SYLLABUS_TOPICS[subj.label];
                        if (newSyllabus && newSyllabus.length > 0) {
                          setTopic(newSyllabus[0]);
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                        isSel
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-[1.02]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${isSel ? 'text-white' : 'text-indigo-600'}`} />
                        {isSel && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="font-bold text-xs truncate block">{subj.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. TEST NÖVÜNÜ SEÇ (İnteraktiv test vs OMR test) */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                3. Test Növünü Seçin:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setTestMode('interactive')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    testMode === 'interactive'
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-md shadow-indigo-100'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    testMode === 'interactive' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-slate-900">İnteraktiv Test</h4>
                      <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                        Online Sınaq
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Şagirdlər kompüter və ya telefonda birbaşa cavablayır, vaxt sayğacı işləyir və nəticələr avtomatik hesablanır.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setTestMode('answered')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    testMode === 'answered'
                      ? 'border-amber-500 bg-amber-50/40 shadow-md shadow-amber-100'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    testMode === 'answered' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-slate-900">OMR Test</h4>
                      <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-amber-100 text-amber-800">
                        Optik Cavab Kartı & PDF
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF/Word sənədi ilə 3 sütunlu optik cavab kartı (A, B, C, D, E və açıq suallar), çap və optik oxuma.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Əlavə Parametrlər (Mövzu, Sual sayı, Çətinlik, Müddət...) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Bot className="w-4 h-4 text-indigo-600" />
              Test Parametrləri və Mövzu Tənzimləmələri
            </h3>

            {/* Mövzu Daxiletmə və Tədris Proqramı Təklifləri */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mövzu və ya Mövzular (Sərbəst daxil edin və ya aşağıdakı təkliflərdən seçin):
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Məsələn: Kvadrat tənliklər və kökləri, Viyet teoremi..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />

              {currentSyllabus.length > 0 && (
                <div className="mt-2.5">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                    «{selectedSubject}» Proqramı Üzrə Hazır Mövzu Təklifləri:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSyllabus.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTopic(s)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                          topic === s
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Grid of Other Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Sual Sayı */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Sual Sayı:
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => {
                    const cnt = parseInt(e.target.value);
                    setQuestionCount(cnt);
                    setDurationMinutes(cnt * 2);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value={5}>5 Sual (Qısa Test)</option>
                  <option value={10}>10 Sual (Standart)</option>
                  <option value={15}>15 Sual (Geniş)</option>
                  <option value={20}>20 Sual (İmtahan formatı)</option>
                  <option value={25}>25 Sual (DİM Buraxılış)</option>
                  <option value={30}>30 Sual (Blok/Tam sınaq)</option>
                </select>
              </div>

              {/* Çətinlik Səviyyəsi */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Çətinlik Səviyyəsi:
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="mixed">Qarışıq (Standart DİM balansı)</option>
                  <option value="easy">Asan (Baza biliklər)</option>
                  <option value="medium">Orta (Məktəb proqramı)</option>
                  <option value="hard">Çətin (Lisey və olimpiada)</option>
                </select>
              </div>

              {/* Cavab Variantlarının Sayı */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Cavab Variantları:
                </label>
                <select
                  value={optionsCount}
                  onChange={(e) => setOptionsCount(parseInt(e.target.value) as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value={5}>5 Variant (A, B, C, D, E)</option>
                  <option value={4}>4 Variant (A, B, C, D)</option>
                </select>
              </div>

              {/* İmtahan Müddəti */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  İmtahan Müddəti (dəqiqə):
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  step={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 20)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Test Məqsədi və Dil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Testin Məqsədi:
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="buraxilis">Buraxılış İmtahanı (DİM Standartı)</option>
                  <option value="blok">Blok İmtahanı (I - IV İxtisas Qrupları)</option>
                  <option value="msi">Mövzu Sınaq İmtahanı (MSİ)</option>
                  <option value="usi">Ümumi Sınaq İmtahanı (ÜSİ)</option>
                  <option value="ksq">KSQ (Kiçik Summativ Qiymətləndirmə)</option>
                  <option value="bsq">BSQ (Böyük Summativ Qiymətləndirmə)</option>
                  <option value="lisey">Liseylərə Qəbul İmtahanı</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Testin Dili:
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="az">Azərbaycan dili</option>
                  <option value="ru">Rus dili</option>
                  <option value="en">İngilis dili</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Button: Hazırla */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleStartGeneration}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-5 h-5 fill-white" />
              <span>Süni İntellektlə Testi Hazırla</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* ==============================================================
          MƏRHƏLƏ 2: GENERASİYA ANİMASİYASI VƏ YÜKLƏNMƏ
          ============================================================== */}
      {currentStep === 2 && (
        <div className="p-12 sm:p-16 bg-white border border-slate-200 rounded-3xl shadow-md flex flex-col items-center justify-center text-center max-w-xl mx-auto my-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200 animate-bounce">
              <Bot className="w-10 h-10" />
            </div>
            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center animate-ping" />
          </div>

          <h3 className="text-lg font-black text-slate-900 mb-2">
            EDUNEX AI Testi Tərtib Edir...
          </h3>
          <p className="text-xs text-indigo-700 font-bold mb-4 font-mono animate-pulse">
            {progressMsg}
          </p>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-sm mb-4">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2 rounded-full w-3/4 animate-pulse" />
          </div>

          <p className="text-[11px] text-slate-400">
            {selectedGrade} • {selectedSubject} • «{topic}»
          </p>
        </div>
      )}

      {/* ==============================================================
          MƏRHƏLƏ 3: REDAKTƏ VƏ MÖVCUD MODULLARA ÖTÜRMƏ
          ============================================================== */}
      {currentStep === 3 && generatedResult && (
        <div className="flex flex-col gap-6">
          {/* Top Control Bar: Title & Transfer Actions */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[280px]">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Testin Adı (Dəyişə bilərsiniz):
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                ← Parametrlərə Qayıt
              </button>

              {/* Əgər İnteraktiv Test seçilibsə */}
              {testMode === 'interactive' ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveAndExport('interactive')}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{saving ? 'Yadda saxlanılır...' : 'İnteraktiv Test Kimi Yadda Saxla & Yayımla'}</span>
                </button>
              ) : (
                /* Əgər OMR Test seçilibsə */
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveAndExport('answered')}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs rounded-xl shadow-md shadow-amber-100 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{saving ? 'Yadda saxlanılır...' : 'OMR Moduluna Ötür & Cavab Kartını Yarat'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold block">Fənn & Sinif</span>
              <strong className="text-xs text-slate-800">{selectedSubject} • {selectedGrade}</strong>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold block">Sual Sayı</span>
              <strong className="text-xs text-indigo-700">{editableQuestions.length} Sual</strong>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold block">Müddət</span>
              <strong className="text-xs text-slate-800">{durationMinutes} dəqiqə</strong>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold block">Ümumi Bal</span>
              <strong className="text-xs text-emerald-600">{editableQuestions.length * 4} Bal</strong>
            </div>
          </div>

          {/* Answer Key Summary Strip */}
          <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="font-bold flex items-center gap-1.5 text-amber-300">
              <CheckCircle2 className="w-4 h-4" />
              AI Cavab Açarı:
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {editableQuestions.map((q, idx) => (
                <span key={q.id} className="bg-white/10 px-2 py-0.5 rounded font-bold">
                  {idx + 1}-{q.correct_answer}
                </span>
              ))}
            </div>
          </div>

          {/* Questions List for Review & Inline Editing */}
          <div className="flex flex-col gap-4">
            {editableQuestions.map((q, qIdx) => {
              const isEditing = editingQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col gap-3"
                >
                  {/* Question Header & Controls */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center">
                        #{qIdx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {q.points} Bal • Düzgün Cavab: <strong className="text-emerald-600 font-black">{q.correct_answer}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                        className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Tamamla' : 'Mətni Redaktə Et'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Bu sualı sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  {isEditing ? (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">
                        Sualın Mətni:
                      </label>
                      <textarea
                        rows={2}
                        value={q.question_text}
                        onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-slate-900 leading-relaxed">
                      <MathRenderer content={q.question_text} />
                    </div>
                  )}

                  {/* Options (A, B, C, D, E) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt) => {
                      const isCorrect = q.correct_answer === opt.id;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSetCorrectAnswer(q.id, opt.id)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                            isCorrect
                              ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                              : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                          }`}>
                            {opt.id}
                          </span>

                          {isEditing ? (
                            <input
                              type="text"
                              value={opt.text}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleUpdateOption(q.id, opt.id, e.target.value)}
                              className="flex-1 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                            />
                          ) : (
                            <div className="flex-1 text-xs">
                              <MathRenderer content={opt.text} />
                            </div>
                          )}

                          {isCorrect && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-auto" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                      <span className="font-bold text-indigo-700">İzah: </span>
                      <MathRenderer content={q.explanation} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Floating/Fixed Save Bar */}
          <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 shadow-xl flex items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Cəmi: <strong className="text-slate-900">{editableQuestions.length} sual</strong> təsdiqlənməyə hazırdır.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Ləğv et
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveAndExport(testMode)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? 'Yadda saxlanılır...' : `Testi Yadda Saxla (${testMode === 'answered' ? 'OMR' : 'İnteraktiv'})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
