// src/pages/AiTestCreatorPage.tsx
// Redesigned EDUNEX AI Test Generator: Clean, powerful, topic-accurate with live OMR & Interactive preview
import React, { useState, useEffect } from 'react';
import { User, Test, Question, QuestionOption } from '../types';
import { CURRICULUM_DATA, getTopicsFor } from '../lib/curriculumData';
import { generateAiTest, GeneratedAiTestResult } from '../lib/aiTestGenerator';
import { api } from '../lib/api';
import { MathRenderer } from '../components/MathRenderer';
import { jsPDF } from 'jspdf';
import {
  Sparkles,
  Bot,
  GraduationCap,
  BookOpen,
  Sliders,
  CheckSquare,
  Square,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Printer,
  Download,
  Edit3,
  Trash2,
  Plus,
  Play,
  RotateCcw,
  Layers,
  HelpCircle,
  Clock,
  Award,
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
  'Fizika',
  'Riyaziyyat',
  'Azərbaycan dili',
  'Kimya',
  'Biologiya',
  'Tarix',
  'Coğrafiya',
  'İngilis dili',
  'İnformatika',
  'Ədəbiyyat',
  'Rus dili',
  'Fransız dili',
  'Məntiq'
];

export const AiTestCreatorPage: React.FC<AiTestCreatorPageProps> = ({
  user,
  onBack,
  onOpenInteractiveEditor,
  onOpenOmrEditor,
  onTestSaved
}) => {
  // Step: 1 = Simple Parameters, 2 = Generating, 3 = Review & Export
  const [currentStep, setCurrentStep] = useState<number>(1);

  // 1. Core Parameters
  const [selectedGrade, setSelectedGrade] = useState<string>('8-ci sinif');
  const [selectedSubject, setSelectedSubject] = useState<string>('Fizika');
  const [testMode, setTestMode] = useState<'interactive' | 'answered'>('answered');

  // 2. Topics Selection
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // 3. Questions Counts & Difficulty
  const [closedCount, setClosedCount] = useState<number>(20);
  const [openCount, setOpenCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');

  // Generation & Review State
  const [generating, setGenerating] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<GeneratedAiTestResult | null>(null);
  const [editableQuestions, setEditableQuestions] = useState<Question[]>([]);
  const [testTitle, setTestTitle] = useState<string>('');
  const [omrAnswerKey, setOmrAnswerKey] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [editingQId, setEditingQId] = useState<string | null>(null);

  // Update syllabus topics whenever grade or subject changes
  useEffect(() => {
    const topics = getTopicsFor(selectedSubject, selectedGrade);
    setAvailableTopics(topics);
    // Select all topics by default for comprehensive coverage
    setSelectedTopics(topics);
  }, [selectedSubject, selectedGrade]);

  const handleToggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleSelectAllTopics = () => {
    if (selectedTopics.length === availableTopics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics([...availableTopics]);
    }
  };

  const totalCount = closedCount + openCount;

  // Generate Test
  const handleGenerate = async () => {
    if (selectedTopics.length === 0) {
      alert('Zəhmət olmasa ən azı bir mövzu seçin.');
      return;
    }
    if (totalCount <= 0) {
      alert('Qapalı və ya açıq sualların sayı 0-dan böyük olmalıdır.');
      return;
    }

    setGenerating(true);
    setCurrentStep(2);
    setProgressMsg(`«${selectedSubject}» üzrə seçilmiş ${selectedTopics.length} mövzu təhlil edilir...`);

    await new Promise(r => setTimeout(r, 600));
    setProgressMsg(`${closedCount} qapalı və ${openCount} açıq sualın mövzular üzrə bərabər bölgüsü təyin edilir...`);

    await new Promise(r => setTimeout(r, 700));
    setProgressMsg(`Elmi düsturlar, variantlar və açıq sualların qiymətləndirmə meyarları hazırlanır...`);

    try {
      const result = await generateAiTest({
        grade: selectedGrade,
        subject: selectedSubject,
        selectedTopics,
        testMode,
        closedCount,
        openCount,
        difficulty
      });

      await new Promise(r => setTimeout(r, 500));
      setGeneratedResult(result);
      setEditableQuestions(result.questions);
      setTestTitle(result.title);
      setOmrAnswerKey(result.answer_key);
      setCurrentStep(3);
    } catch (err: any) {
      alert('Xəta: ' + (err.message || 'Test hazırlanarkən xəta baş verdi'));
      setCurrentStep(1);
    } finally {
      setGenerating(false);
    }
  };

  // Change answer key in OMR bubble sheet
  const handleOmrKeyChange = (qNum: number, letter: string) => {
    setOmrAnswerKey(prev => ({ ...prev, [qNum]: letter }));
    setEditableQuestions(prev =>
      prev.map((q, idx) => {
        if (idx + 1 === qNum) {
          const nextOpts = q.options.map(o => ({ ...o, is_correct: o.id === letter }));
          return { ...q, options: nextOpts, correct_answer: letter };
        }
        return q;
      })
    );
  };

  // Generate and download A4 Question Booklet PDF using jsPDF
  const handleDownloadQuestionBookletPdf = () => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 18;

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUNEX SINAQ IMTAHANI (AI TEST)', margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fənn: ${selectedSubject}  |  Sinif: ${selectedGrade}  |  Müddət: ${totalCount * 2} dəq  |  Suallar: ${totalCount}`, margin, y);
    y += 5;

    const topicSummary = selectedTopics.slice(0, 3).join(', ') + (selectedTopics.length > 3 ? ` və digər ${selectedTopics.length - 3} mövzu` : '');
    doc.text(`Mövzu: ${topicSummary}`, margin, y);
    y += 7;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    editableQuestions.forEach((q, idx) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const cleanQText = q.question_text.replace(/\$/g, '');
      const qLines = doc.splitTextToSize(cleanQText, pageWidth - margin * 2);
      doc.text(qLines, margin, y);
      y += qLines.length * 5 + 2;

      if (q.question_type === 'single_choice' && q.options.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        q.options.forEach(opt => {
          const optText = `${opt.id}) ${opt.text.replace(/\$/g, '')}`;
          const optLines = doc.splitTextToSize(optText, pageWidth - margin * 2 - 8);
          doc.text(optLines, margin + 4, y);
          y += optLines.length * 4.5 + 1;
        });
        y += 3;
      } else {
        // Open question
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 100, 100);
        doc.text('[Açıq sual - Cavabınızı və həll yolunuzu qeyd edin]', margin + 4, y);
        doc.setTextColor(0, 0, 0);
        y += 7;
      }
    });

    doc.save(`${selectedSubject}_${selectedGrade}_Test_Kitabcasi.pdf`);
  };

  // Generate and download A4 OMR Answer Sheet PDF using jsPDF
  const handleDownloadOmrAnswerSheetPdf = () => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 18;

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUNEX - OPTIK CAVAB KARTI', margin, y);
    y += 6;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Imtahan: ${testTitle}`, margin, y);
    y += 5;
    doc.text(`Fenn: ${selectedSubject}  |  Sinif: ${selectedGrade}  |  Sual sayi: ${totalCount}`, margin, y);
    y += 7;

    doc.setDrawColor(180, 180, 180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Student identity box
    doc.rect(margin, y, pageWidth - margin * 2, 16);
    doc.setFontSize(8.5);
    doc.text('Sagirdin Adi ve Soyadi: ___________________________________     Imza: ____________', margin + 4, y + 6);
    doc.text('Mekteb: _______________________   Sinif / Qrup: __________   Tarix: __.__.2026', margin + 4, y + 12);
    y += 22;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CAVABLAR (Daireleri qaralayin):', margin, y);
    y += 8;

    // 3 Columns of bubbles
    const closedRows = editableQuestions.filter(q => q.question_type === 'single_choice');
    const cols = 3;
    const perCol = Math.ceil(closedRows.length / cols);
    const colWidth = (pageWidth - margin * 2) / cols;

    for (let i = 0; i < closedRows.length; i++) {
      const colIdx = Math.floor(i / perCol);
      const rowInCol = i % perCol;
      const x = margin + colIdx * colWidth;
      const rowY = y + rowInCol * 7.5;

      const qNum = i + 1;
      const numLabel = qNum < 10 ? `0${qNum}` : `${qNum}`;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`${numLabel}.`, x, rowY + 3);

      ['A', 'B', 'C', 'D', 'E'].forEach((letter, bIdx) => {
        const circleX = x + 10 + bIdx * 8;
        const circleY = rowY + 2;
        doc.circle(circleX, circleY, 2.5, 'S');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(letter, circleX - 1.2, circleY + 1);
      });
    }

    doc.save(`${selectedSubject}_${selectedGrade}_Optik_Cavab_Karti.pdf`);
  };

  // Save Test and Send to Existing Module
  const handleSaveAndExport = async (targetMode: 'interactive' | 'answered') => {
    if (!testTitle.trim()) {
      alert('Testin adını daxil edin');
      return;
    }

    try {
      setSaving(true);

      const payload: Partial<Test> = {
        teacher_id: user.id,
        title: testTitle.trim(),
        exam_model: 'Buraxılış imtahanı',
        grade_group: selectedGrade,
        subject: selectedSubject,
        topic: selectedTopics.join(', '),
        duration_minutes: totalCount * 2,
        total_questions: editableQuestions.length,
        total_points: editableQuestions.length * 4,
        grading_rule: 'standard',
        result_display_mode: 'immediate',
        test_mode: targetMode,
        status: 'published',
        questions: editableQuestions,
        answer_key_json: JSON.stringify(omrAnswerKey)
      };

      const res = await api.createTest(payload);
      setSaveSuccessMsg(`«${testTitle}» adlı test uğurla «Sınaq İmtahanları» portalına əlavə edildi!`);

      if (onTestSaved) {
        onTestSaved({
          ...payload,
          id: res.id,
          share_code: res.share_code,
          is_link_active: true
        } as any, true);
      }

      setTimeout(() => {
        if (targetMode === 'interactive' && onOpenInteractiveEditor) {
          onOpenInteractiveEditor(res.id);
        } else if (targetMode === 'answered' && onOpenOmrEditor) {
          onOpenOmrEditor(res.id);
        } else {
          onBack();
        }
      }, 1400);

    } catch (err: any) {
      alert('Yadda saxlanılarkən xəta: ' + (err.message || 'Xəta baş verdi'));
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
              <span className="text-xs text-slate-400 font-semibold">• Tam Əhatəli Proqram</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              AI ilə Test Yarat
            </h1>
            <p className="text-xs text-slate-500">
              Fənn, sinif və mövzuları seçin; qapalı və açıq sualların sayını təyin edin.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
          <span className={`px-3 py-1 rounded-lg ${currentStep === 1 ? 'bg-white text-indigo-700 shadow-2xs' : ''}`}>
            1. Seçimlər
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-3 py-1 rounded-lg ${currentStep === 2 ? 'bg-white text-indigo-700 shadow-2xs' : ''}`}>
            2. Hazırlanır
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-3 py-1 rounded-lg ${currentStep === 3 ? 'bg-white text-indigo-700 shadow-2xs' : ''}`}>
            3. Yoxlama & Kart
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
          MƏRHƏLƏ 1: SADƏLƏŞDİRİLMİŞ VƏ AYDIN SEÇİMLƏR
          ============================================================== */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-5">
          {/* SƏTİR 1: Sinif, Fənn və Test Növü */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. SİNFİ SEÇ */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  1. Sinfi Seçin:
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 hover:bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
                >
                  {ALL_GRADES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                DİM proqramı və dərslik standartı seçilmiş sinfin səviyyəsinə uyğunlaşdırılır.
              </p>
            </div>

            {/* 2. FƏNNİ SEÇ (SƏLİQƏLİ AÇILAN SEÇİM MENYUSU) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  2. Fənni Seçin:
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 hover:bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
                >
                  {ALL_SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Fənn dəyişdikdə həmin fənnin və sinfin rəsmi mövzuları dərhal aşağıda açılır.
              </p>
            </div>

            {/* 3. TEST NÖVÜNÜ SEÇ (İnteraktiv və ya OMR) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                3. Test Növünü Seçin:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTestMode('answered')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    testMode === 'answered'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 font-black shadow-xs ring-1 ring-amber-400'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <FileText className={`w-5 h-5 ${testMode === 'answered' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">OMR Test</span>
                  <span className="text-[10px] text-slate-400">Optik Cavab Kartı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTestMode('interactive')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    testMode === 'interactive'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-black shadow-xs ring-1 ring-indigo-400'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Sparkles className={`w-5 h-5 ${testMode === 'interactive' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">İnteraktiv</span>
                  <span className="text-[10px] text-slate-400">Canlı Online Test</span>
                </button>
              </div>
            </div>
          </div>

          {/* SƏTİR 2: MÖVZULARIN SEÇİLMƏSİ (Səliqəli siyahı + Hamısını seç) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                  4
                </span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Mövzuları Seçin: {selectedSubject} • {selectedGrade}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Seçilib: <strong className="text-indigo-600 font-bold">{selectedTopics.length} / {availableTopics.length} mövzu</strong>
                  </span>
                </div>
              </div>

              {/* «Hamısını seç» düyməsi */}
              <button
                type="button"
                onClick={handleSelectAllTopics}
                className="px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {selectedTopics.length === availableTopics.length ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    <span>Seçimi Təmizlə</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-indigo-600" />
                    <span>Hamısını Seç ({availableTopics.length} mövzu)</span>
                  </>
                )}
              </button>
            </div>

            {/* Mövzuların səliqəli çoxsütunlu siyahısı (bir-birinin üstünə düşmür) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {availableTopics.map((top, idx) => {
                const isSelected = selectedTopics.includes(top);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleTopic(top)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-400 text-slate-900 shadow-2xs font-semibold'
                        : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600 mt-0.5 shrink-0"
                    />
                    <span className="text-xs leading-snug">{top}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SƏTİR 3: Qapalı, Açıq Sual Sayları və Çətinlik */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Sual Sayı və Çətinlik Parametrləri
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Qapalı Sualların Sayı */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Qapalı Sualların Sayı (A, B, C, D, E):
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={closedCount}
                  onChange={(e) => setClosedCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:outline-none focus:border-indigo-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Seçilmiş mövzular üzrə bərabər paylanır.
                </span>
              </div>

              {/* Açıq Sualların Sayı (0 ola bilər) */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Açıq Sualların Sayı (Həll/Yazılı cavab):
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={openCount}
                  onChange={(e) => setOpenCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:outline-none focus:border-indigo-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  0 daxil edildikdə yalnız qapalı test tərtib olunur.
                </span>
              </div>

              {/* Çətinlik Səviyyəsi */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Çətinlik Səviyyəsi:
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="mixed">Qarışıq (Standart DİM balansı)</option>
                  <option value="easy">Asan (Baza biliklər)</option>
                  <option value="medium">Orta (Məktəb proqramı)</option>
                  <option value="hard">Çətin (Lisey və olimpiada)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Cəmi sual: <strong className="text-indigo-600 font-black">{totalCount} sual</strong> ({totalCount * 2} dəqiqə)
                </span>
              </div>
            </div>
          </div>

          {/* Action Button: AI İlə Test Hazırla */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-200 flex items-center gap-2.5 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-5 h-5 fill-white" />
              <span>AI ilə Test Hazırla ({totalCount} Sual: {closedCount} qapalı + {openCount} açıq)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* ==============================================================
          MƏRHƏLƏ 2: GENERASİYA ANİMASİYASI
          ============================================================== */}
      {currentStep === 2 && (
        <div className="p-12 sm:p-16 bg-white border border-slate-200 rounded-3xl shadow-md flex flex-col items-center justify-center text-center max-w-xl mx-auto my-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200 animate-bounce mb-6">
            <Bot className="w-10 h-10" />
          </div>

          <h3 className="text-lg font-black text-slate-900 mb-2">
            EDUNEX AI Sualları Tərtib Edir...
          </h3>
          <p className="text-xs text-indigo-700 font-bold mb-4 font-mono animate-pulse">
            {progressMsg}
          </p>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-sm mb-4">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2 rounded-full w-4/5 animate-pulse" />
          </div>

          <p className="text-[11px] text-slate-400">
            {selectedGrade} • {selectedSubject} • {selectedTopics.length} mövzu • Cəmi {totalCount} sual
          </p>
        </div>
      )}

      {/* ==============================================================
          MƏRHƏLƏ 3: YOXLAMA, CANLI OMR CAVAB KARTI VƏ YADDA SAXLAMA
          ============================================================== */}
      {currentStep === 3 && generatedResult && (
        <div className="flex flex-col gap-6">
          {/* Top Bar: Title & Controls */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[280px]">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Testin Adı (Redaktə edə bilərsiniz):
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                ← Parametrlərə Qayıt
              </button>

              <button
                type="button"
                onClick={handleDownloadQuestionBookletPdf}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="A4 formatında Sual Kitabçasını PDF olaraq yüklə"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Sual Kitabçası (PDF)</span>
              </button>

              {testMode === 'answered' && (
                <button
                  type="button"
                  onClick={handleDownloadOmrAnswerSheetPdf}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="A4 formatında OMR Optik Cavab Kartını PDF olaraq yüklə"
                >
                  <Download className="w-4 h-4 text-amber-600" />
                  <span>A4 Cavab Kartı (PDF)</span>
                </button>
              )}

              {testMode === 'answered' ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveAndExport('answered')}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs rounded-xl shadow-md shadow-amber-100 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{saving ? 'Yadda saxlanılır...' : 'OMR Moduluna Ötür & Yadda Saxla'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveAndExport('interactive')}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{saving ? 'Yadda saxlanılır...' : 'İnteraktiv Testi Yadda Saxla & Yayımla'}</span>
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
              <span className="text-[10px] text-slate-400 font-bold block">Suallar</span>
              <strong className="text-xs text-indigo-700">{closedCount} qapalı + {openCount} açıq ({totalCount})</strong>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold block">Əhatə Olunan Mövzu</span>
              <strong className="text-xs text-slate-800">{selectedTopics.length} mövzu</strong>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold block">Rejim</span>
              <strong className={`text-xs ${testMode === 'answered' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {testMode === 'answered' ? 'OMR Cavab Kartı' : 'İnteraktiv Onlayn'}
              </strong>
            </div>
          </div>

          {/* SPLIT VIEW: Left = Suallar və Redaktə, Right = OMR Cavab Kartı (Tələb 5) */}
          <div className={`grid gap-6 items-start ${testMode === 'answered' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
            {/* SOL TƏRƏF: Sualların Siyahısı və Redaktəsi */}
            <div className={`${testMode === 'answered' ? 'lg:col-span-8' : 'w-full'} flex flex-col gap-4`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Hazırlanmış Suallar ({editableQuestions.length})
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Mətn və variantları yerindəcə klikləyərək redaktə edə bilərsiniz
                </span>
              </div>

              {editableQuestions.map((q, idx) => {
                const isClosed = q.question_type === 'single_choice';
                const isEditing = editingQId === q.id;

                return (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col gap-3"
                  >
                    {/* Header: Sual № və Mövzu Nişanı */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                          isClosed ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {q.topic}
                        </span>
                        <span className="text-[10px] font-black text-slate-400">
                          {isClosed ? 'Qapalı (A-E)' : 'Açıq Sual'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingQId(isEditing ? null : q.id)}
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isEditing ? 'Tamamla' : 'Redaktə'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Sual Mətni */}
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={q.question_text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditableQuestions(prev => prev.map(item => item.id === q.id ? { ...item, question_text: val } : item));
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-indigo-600"
                      />
                    ) : (
                      <div className="text-sm font-bold text-slate-900 leading-relaxed">
                        <MathRenderer content={q.question_text} />
                      </div>
                    )}

                    {/* Qapalı Sual Variantları */}
                    {isClosed && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt) => {
                          const isCorrect = q.correct_answer === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => handleOmrKeyChange(idx + 1, opt.id)}
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
                              <div className="flex-1 text-xs">
                                <MathRenderer content={opt.text} />
                              </div>
                              {isCorrect && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-auto" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Açıq Sual İzahı və Qiymətləndirmə Meyarları */}
                    {!isClosed && (
                      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl flex flex-col gap-2 text-xs">
                        <div>
                          <strong className="text-amber-900 block font-bold">Gözlənilən Düzgün Cavab:</strong>
                          <span className="font-mono text-emerald-800 font-black">{q.correct_answer}</span>
                        </div>
                        {q.situation_text && (
                          <div>
                            <strong className="text-amber-900 block font-bold">Qiymətləndirmə Meyarları:</strong>
                            <p className="text-[11px] text-slate-700 whitespace-pre-line mt-0.5">{q.situation_text}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="font-bold text-indigo-700">İzah: </span>
                        <MathRenderer content={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SAĞ TƏRƏF: REAL OPTİK CAVAB KARTI (Yalnız OMR Rejimində - Tələb 5) */}
            {testMode === 'answered' && (
              <div className="lg:col-span-4 sticky top-20 bg-white border border-slate-200 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Optik Cavab Kartı
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Canlı cavab açarı • Kliklə dəyişdirilə bilər
                    </span>
                  </div>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Aktiv
                  </span>
                </div>

                {/* 3 Sütunlu OMR Dairələri */}
                <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                  {editableQuestions.map((q, idx) => {
                    const qNum = idx + 1;
                    const isClosed = q.question_type === 'single_choice';
                    const activeLetter = omrAnswerKey[qNum] || q.correct_answer;

                    return (
                      <div
                        key={q.id}
                        className="px-2 py-1 rounded-xl border border-slate-100 hover:border-slate-300 flex items-center justify-between transition-colors text-xs"
                      >
                        {/* Number */}
                        <span className="font-mono font-bold text-[11px] text-slate-700 min-w-[24px]">
                          {qNum < 10 ? `0${qNum}` : qNum}.
                        </span>

                        {isClosed ? (
                          /* A, B, C, D, E Bubbles */
                          <div className="flex items-center gap-1.5" role="radiogroup">
                            {['A', 'B', 'C', 'D', 'E'].map(l => {
                              const isSel = activeLetter === l;
                              return (
                                <button
                                  key={l}
                                  type="button"
                                  onClick={() => handleOmrKeyChange(qNum, l)}
                                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                                    isSel
                                      ? 'bg-emerald-600 text-white font-black shadow-xs scale-105 ring-2 ring-emerald-300'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                  title={`Sual ${qNum}: Variant ${l}`}
                                >
                                  {l}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          /* Open Question Numeric Badge */
                          <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 truncate max-w-[140px]">
                            Açıq: {q.correct_answer}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* OMR Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadOmrAnswerSheetPdf}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>A4 Boş Cavab Kartını Yüklə</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveAndExport('answered')}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-black rounded-xl shadow-md shadow-amber-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{saving ? 'Yadda saxlanılır...' : 'OMR Moduluna Ötür & Saxla'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
