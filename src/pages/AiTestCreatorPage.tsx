// src/pages/AiTestCreatorPage.tsx
// Redesigned EDUNEX AI Test Generator: Clean, powerful, topic-accurate with independent scrolling & live OMR card
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

// Helper to sanitize Azerbaijani characters for standard jsPDF fonts
function sanitizeForPdf(str: string): string {
  if (!str) return '';
  return str
    .replace(/ə/g, 'e')
    .replace(/Ə/g, 'E')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/[«»]/g, '"')
    .replace(/[–—]/g, '-');
}

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

  // Change answer key in OMR bubble sheet or open questions
  const handleOmrKeyChange = (qNum: number, letterOrAns: string) => {
    setOmrAnswerKey(prev => ({ ...prev, [qNum]: letterOrAns }));
    setEditableQuestions(prev =>
      prev.map((q, idx) => {
        if (idx + 1 === qNum) {
          if (q.question_type === 'single_choice') {
            const nextOpts = q.options.map(o => ({ ...o, is_correct: o.id === letterOrAns }));
            return { ...q, options: nextOpts, correct_answer: letterOrAns };
          } else {
            return { ...q, correct_answer: letterOrAns, situation_model_answer: letterOrAns };
          }
        }
        return q;
      })
    );
  };

  // Generate and download A4 Question Booklet PDF using jsPDF
  const handleDownloadQuestionBookletPdf = () => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 16;

    // Header
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUNEX SINAQ IMTAHANI (AI TEST)', margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const safeSubject = sanitizeForPdf(selectedSubject);
    const safeGrade = sanitizeForPdf(selectedGrade);
    doc.text(`Fenn: ${safeSubject}  |  Sinif: ${safeGrade}  |  Muddet: ${totalCount * 2} deq  |  Cemi Sual: ${totalCount}`, margin, y);
    y += 4.5;

    const topicSummary = sanitizeForPdf(selectedTopics.slice(0, 3).join(', ') + (selectedTopics.length > 3 ? ` ve diger ${selectedTopics.length - 3} movzu` : ''));
    doc.text(`Movzular: ${topicSummary}`, margin, y);
    y += 6;

    doc.setDrawColor(190, 190, 190);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    editableQuestions.forEach((q, idx) => {
      const isClosed = q.question_type === 'single_choice';
      const estHeight = isClosed ? 35 : 30;

      if (y + estHeight > pageHeight - margin) {
        doc.addPage();
        y = 15;
      }

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      const cleanQText = sanitizeForPdf(q.question_text.replace(/\$/g, ''));
      const qLines = doc.splitTextToSize(cleanQText, pageWidth - margin * 2);
      doc.text(qLines, margin, y);
      y += qLines.length * 4.5 + 2;

      if (isClosed && q.options.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        q.options.forEach(opt => {
          const optText = `${opt.id}) ${sanitizeForPdf(opt.text.replace(/\$/g, ''))}`;
          const optLines = doc.splitTextToSize(optText, pageWidth - margin * 2 - 8);
          doc.text(optLines, margin + 4, y);
          y += optLines.length * 4.2 + 1;
        });
        y += 2.5;
      } else {
        // Open question response box in booklet
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('[Aciq Sual - Hell yolu ve son cavabinizi qeyd edin]:', margin + 4, y);
        doc.setTextColor(0, 0, 0);
        y += 4;

        doc.setDrawColor(200, 200, 200);
        doc.rect(margin + 4, y, pageWidth - margin * 2 - 8, 14);
        y += 18;
      }
    });

    doc.save(`${safeSubject}_${safeGrade}_Sual_Kitabcasi.pdf`);
  };

  // Generate and download A4 OMR Answer Sheet PDF using jsPDF (Tələb 4)
  const handleDownloadOmrAnswerSheetPdf = () => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 14;

    // Header Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUNEX - OMR OPTIK CAVAB KARTI', margin, y);
    y += 5.5;

    // Metadata
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    const safeTitle = sanitizeForPdf(testTitle);
    const safeSubject = sanitizeForPdf(selectedSubject);
    const safeGrade = sanitizeForPdf(selectedGrade);
    doc.text(`Imtahan: ${safeTitle}`, margin, y);
    y += 4.5;
    doc.text(`Fenn: ${safeSubject}  |  Sinif: ${safeGrade}  |  Cemi Sual: ${totalCount} (${closedCount} qapali + ${openCount} aciq)`, margin, y);
    y += 5.5;

    // Student Identity Box
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, pageWidth - margin * 2, 14);
    doc.setFontSize(8);
    doc.text('Sagirdin Adi ve Soyadi: _____________________________________________    Sinif: _________    Tarix: __.__.2026', margin + 3, y + 5);
    doc.text('Is nomresi (Sagird Kodu): [  ][  ][  ][  ][  ][  ]          Imza: _________________    Toplanan Bal: ________', margin + 3, y + 10.5);
    y += 19;

    // 1. QAPALI SUALLAR (DƏQİQ 3 SÜTUNLU OMR DUBLE BUBBLES)
    const closedRows = editableQuestions.filter(q => q.question_type === 'single_choice');
    if (closedRows.length > 0) {
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`QAPALI SUALLAR (1 - ${closedRows.length}) - Daireleri tam qaralayin:`, margin, y);
      y += 5.5;

      const cols = 3;
      const perCol = Math.ceil(closedRows.length / cols);
      const colWidth = (pageWidth - margin * 2) / cols;

      for (let i = 0; i < closedRows.length; i++) {
        const colIdx = Math.floor(i / perCol);
        const rowInCol = i % perCol;
        const x = margin + colIdx * colWidth;
        const rowY = y + rowInCol * 6.8;

        const qNum = i + 1;
        const numLabel = qNum < 10 ? `0${qNum}` : `${qNum}`;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`${numLabel}.`, x, rowY + 3);

        ['A', 'B', 'C', 'D', 'E'].forEach((letter, bIdx) => {
          const circleX = x + 8 + bIdx * 6.5;
          const circleY = rowY + 2.2;
          doc.setDrawColor(80, 80, 80);
          doc.circle(circleX, circleY, 2.0, 'S');
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'normal');
          doc.text(letter, circleX - 0.9, circleY + 0.8);
        });
      }

      y += perCol * 6.8 + 6;
    }

    // 2. AÇIQ SUALLAR (YAZILI CAVAB XANALARI - TƏLƏB 3 & 4)
    const openRows = editableQuestions.filter(q => q.question_type !== 'single_choice');
    if (openRows.length > 0) {
      if (y + 35 > pageHeight - margin) {
        doc.addPage();
        y = 15;
      }

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      const startNum = closedRows.length + 1;
      const endNum = closedRows.length + openRows.length;
      doc.text(`ACIQ VE YAZILI CAVABLI SUALLAR (${startNum} - ${endNum}) - Cavabinizi ayrilmis xanaya yazin:`, margin, y);
      y += 5;

      openRows.forEach((q, idx) => {
        const qNum = closedRows.length + idx + 1;
        const boxHeight = 16; // 16mm per open question box

        if (y + boxHeight + 4 > pageHeight - margin) {
          doc.addPage();
          y = 15;
        }

        // Outer Box
        doc.setDrawColor(140, 140, 140);
        doc.setFillColor(252, 252, 252);
        doc.roundedRect(margin, y, pageWidth - margin * 2, boxHeight, 1.5, 1.5, 'FD');

        // Question Number & Label
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`${qNum}. Aciq Sual:`, margin + 3, y + 4.5);

        // Score box on top-right of the box
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.rect(pageWidth - margin - 28, y + 1.5, 25, 4.5);
        doc.text('Bal: [   / 4 ]', pageWidth - margin - 26, y + 4.5);

        // Writing guidelines inside box
        doc.setDrawColor(210, 210, 210);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(margin + 3, y + 9.5, pageWidth - margin - 3, y + 9.5);
        doc.line(margin + 3, y + 13.5, pageWidth - margin - 3, y + 13.5);
        doc.setLineDashPattern([], 0); // reset dash

        y += boxHeight + 3;
      });
    }

    // Footer
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('EDUNEX Quiz Creator - OMR Test Sistemi - DIM Standartlarina Uygun Cavab Blanki', margin, pageHeight - 7);

    doc.save(`${safeSubject}_${safeGrade}_OMR_Cavab_Karti.pdf`);
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

  const closedRows = editableQuestions.filter(q => q.question_type === 'single_choice');
  const openRows = editableQuestions.filter(q => q.question_type !== 'single_choice');

  return (
    <div className="w-full min-h-full flex flex-col bg-slate-50">
      {/* ==============================================================
          MƏRHƏLƏ 1: PARAMETRLƏRİN SEÇİLMƏSİ (SCROLLABLE FORM)
          ============================================================== */}
      {currentStep === 1 && (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full flex flex-col gap-6 animate-in fade-in">
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
              </div>
            </div>
          </div>

            {/* 1. SİNİF, FƏNN VƏ TEST NÖVÜ SEÇİMİ */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1.1 Sinif Seçimi */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    1. Sinif Seçin:
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer transition-all"
                  >
                    {ALL_GRADES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* 1.2 Fənn Seçimi (Açılan Siyahı - Tələb 1) */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    2. Fənni Seçin (Açılan Menyudan):
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 cursor-pointer transition-all"
                  >
                    {ALL_SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 1.3 Test Növü Seçimi: OMR vs İnteraktiv */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-2">
                  3. Test Növünü Seçin:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTestMode('answered')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                      testMode === 'answered'
                        ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${testMode === 'answered' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">
                        OMR Test (Optik Cavab Kartı ilə)
                      </strong>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Kitabça PDF-i, A4 standart Optik Cavab Kartı və sürətli OMR qiymətləndirmə.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestMode('interactive')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                      testMode === 'interactive'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${testMode === 'interactive' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">
                        İnteraktiv Test (Onlayn İmtahan)
                      </strong>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Şagirdlərin birbaşa telefonda və ya kompüterdə daxil olub cavablandıracağı onlayn sınaq.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. MÖVZULARIN SEÇİLMƏSİ (Səliqəli siyahı + Hamısını seç - Tələb 1) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    4. Mövzuları Seçin ({selectedSubject} • {selectedGrade}):
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Rəsmi tədris proqramına uyğun mövzular. Bir, bir neçə və ya bütün mövzuları seçə bilərsiniz.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllTopics}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{selectedTopics.length === availableTopics.length ? 'Seçimi təmizlə' : 'Hamısını seç'}</span>
                  </button>

                  <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                    {selectedTopics.length} / {availableTopics.length} seçilib
                  </span>
                </div>
              </div>

              {/* Topics Grid: Non-overlapping, clean badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {availableTopics.map((topic, idx) => {
                  const isChecked = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleToggleTopic(topic)}
                      className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-start gap-2.5 cursor-pointer ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-2xs ring-1 ring-indigo-200'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <span className="leading-snug">
                        <span className="text-[10px] text-slate-400 font-mono block mb-0.5">Mövzu {idx + 1}</span>
                        {topic}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. SUAL SAYI VƏ ÇƏTİNLİK SƏVİYYƏSİ (Tələb 2 & 3) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                5. Sual Sayı və Çətinlik Parametrləri:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Qapalı suallar */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Qapalı Sualların Sayı:</span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Variantlı</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={closedCount}
                    onChange={(e) => setClosedCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-none text-center"
                  />
                  <span className="text-[10px] text-slate-400">A, B, C, D, E bəndli klassik test</span>
                </div>

                {/* Açıq suallar */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-amber-900 flex items-center justify-between">
                    <span>Açıq Sualların Sayı:</span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">Yazılı/Ətraflı</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={openCount}
                    onChange={(e) => setOpenCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-base font-black text-amber-900 bg-white border border-amber-300 rounded-xl focus:border-amber-600 focus:outline-none text-center"
                  />
                  <span className="text-[10px] text-amber-700">Cavab, həll yolu və meyarlı (0 ola bilər)</span>
                </div>

                {/* Çətinlik Səviyyəsi */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Çətinlik Səviyyəsi:
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs font-bold bg-white border border-slate-300 rounded-xl text-slate-800 focus:border-indigo-600 focus:outline-none cursor-pointer"
                  >
                    <option value="mixed">Qarışıq (Standart DİM balansı)</option>
                    <option value="easy">Asan (Baza biliklər)</option>
                    <option value="medium">Orta (Tətbiq və hesablama)</option>
                    <option value="hard">Çətin (Lisey və olimpiada)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Cəmi sual: <strong className="text-indigo-600 font-black">{totalCount} sual</strong> ({totalCount * 2} dəqiqə)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button: AI İlə Test Hazırla */}
            <div className="flex justify-end pt-2 pb-6">
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
        <div className="p-8 sm:p-16 max-w-xl mx-auto my-8 flex items-center justify-center">
          <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-3xl shadow-md flex flex-col items-center justify-center text-center w-full">
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
        </div>
      )}

      {/* ==============================================================
          MƏRHƏLƏ 3: YOXLAMA, SABİT STICKY CAVAB KARTI VƏ SƏRBƏST SÜRÜŞMƏ
          ============================================================== */}
      {currentStep === 3 && generatedResult && (
        <div className="p-3 sm:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-4 animate-in fade-in">
          {/* Top Sticky Header Bar */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[260px] max-w-xl">
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                placeholder="Testin adı..."
                title="Testin adı (Redaktə edə bilərsiniz)"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                ← Parametrlər
              </button>

              <button
                type="button"
                onClick={handleDownloadQuestionBookletPdf}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="A4 formatında Sual Kitabçasını PDF olaraq yüklə"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Sual Kitabçası (PDF)</span>
              </button>

              {testMode === 'answered' && (
                <button
                  type="button"
                  onClick={handleDownloadOmrAnswerSheetPdf}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="A4 formatında OMR Optik Cavab Kartını PDF olaraq yüklə"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>A4 Cavab Kartı (PDF)</span>
                </button>
              )}

              {testMode === 'answered' ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveAndExport('answered')}
                  className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs rounded-xl shadow-md shadow-amber-100 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saxlanılır...' : 'OMR Moduluna Ötür & Saxla'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveAndExport('interactive')}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saxlanılır...' : 'İnteraktiv Testi Saxla'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="bg-slate-100/90 border border-slate-200/80 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
            <div className="flex items-center gap-3">
              <span><strong>Fənn:</strong> {selectedSubject} ({selectedGrade})</span>
              <span className="text-slate-300">•</span>
              <span><strong>Suallar:</strong> {closedCount} qapalı + {openCount} açıq ({totalCount} cəmi)</span>
              <span className="text-slate-300">•</span>
              <span><strong>Mövzular:</strong> {selectedTopics.length} mövzu əhatə olundu</span>
            </div>
            {saveSuccessMsg && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md animate-fade-in">
                ✓ {saveSuccessMsg}
              </span>
            )}
          </div>

          {/* SPLIT LAYOUT: LEFT QUESTIONS + RIGHT STICKY OMR CARD */}
          <div className={`grid gap-6 items-start ${testMode === 'answered' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
            {/* SOL TƏRƏF: YALNIZ SUALLAR (Sərbəst aşağı-yuxarı sürüşür) */}
            <div className={`${testMode === 'answered' ? 'lg:col-span-8' : 'w-full'} flex flex-col gap-4`}>
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Sual Kitabçası ({editableQuestions.length} Sual)
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
                    className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col gap-3 shrink-0"
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

                    {/* Qapalı Suallar üçün Variantlar (A-E) */}
                    {isClosed && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt) => {
                          const isCorrect = (omrAnswerKey[idx + 1] || q.correct_answer) === opt.id;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
                                isCorrect
                                  ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-300'
                                  : 'bg-slate-50/60 border-slate-200 text-slate-800'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {opt.id}
                              </span>

                              {isEditing ? (
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditableQuestions(prev =>
                                      prev.map(item =>
                                        item.id === q.id
                                          ? {
                                              ...item,
                                              options: item.options.map(o => o.id === opt.id ? { ...o, text: val } : o)
                                            }
                                          : item
                                      )
                                    );
                                  }}
                                  className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-normal focus:outline-none focus:border-indigo-500"
                                />
                              ) : (
                                <span className="flex-1 leading-snug">
                                  <MathRenderer content={opt.text} />
                                </span>
                              )}

                              {isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Açıq Sual üçün Etalon Cavab və Qiymətləndirmə Meyarları */}
                    {!isClosed && (
                      <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200 flex flex-col gap-2 text-xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60">
                          <span className="font-bold text-amber-900">Etalon Düzgün Cavab / Açar:</span>
                          <span className="font-mono font-black text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-300">
                            {omrAnswerKey[idx + 1] || q.correct_answer}
                          </span>
                        </div>

                        {q.situation_text && (
                          <div className="text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-xl border border-amber-200 leading-relaxed font-sans">
                            <strong className="text-amber-800 block mb-0.5">Qiymətləndirmə Meyarları:</strong>
                            <span className="whitespace-pre-line">{q.situation_text}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* İzah */}
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

            {/* ==============================================================
                SAĞ TƏRƏF: OMR CAVAB KARTI (MÜSTƏQİL SCROLL VƏ SABİTLİK - TƏLƏB 2 & 3)
                ============================================================== */}
            {testMode === 'answered' && (
              <div className="lg:col-span-4 sticky top-20 max-h-[calc(100vh-100px)] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden z-20">
                {/* Header (Shrink-0) */}
                <div className="shrink-0 p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
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

                {/* Scrollable Content (Müstəqil Scroll Container - Tələb 2 & 3) */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-3.5">
                  {/* 1. QAPALI SUALLAR - DƏQİQ 3 SÜTUNLU STANDART OMR CƏDVƏLİ */}
                  {closedRows.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                        Qapalı Suallar (1 - {closedRows.length})
                      </span>

                      {(() => {
                        const numCols = 3;
                        const perCol = Math.ceil(closedRows.length / numCols);
                        const columnSlices = Array.from({ length: numCols }, (_, colIdx) =>
                          closedRows.slice(colIdx * perCol, (colIdx + 1) * perCol)
                        );

                        return (
                          <div className="grid grid-cols-3 gap-1.5 items-stretch">
                            {columnSlices.map((colRows, colIdx) => (
                              <div key={colIdx} className="omr-column-card">
                                <div className="flex flex-col gap-0.5">
                                  {colRows.map((q) => {
                                    const qNum = q.order_index || 1;
                                    const currentAns = omrAnswerKey[qNum] || q.correct_answer;
                                    return (
                                      <div
                                        key={q.id}
                                        className={`px-1.5 py-0.5 rounded-md border flex items-center justify-between transition-colors ${
                                          currentAns ? 'bg-emerald-50/60 border-emerald-400' : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-0.5 shrink-0 min-w-[20px] text-right justify-end">
                                          <span className="font-mono font-bold text-[10px] text-slate-800">
                                            {qNum < 10 ? `0${qNum}` : qNum}.
                                          </span>
                                          {currentAns && (
                                            <span className="text-[8px] font-black text-emerald-700 bg-emerald-100 px-0.5 rounded leading-none">
                                              {currentAns}
                                            </span>
                                          )}
                                        </div>

                                        <div className="omr-bubble-row shrink-0 flex items-center gap-[2px]">
                                          {['A', 'B', 'C', 'D', 'E'].map((l) => (
                                            <button
                                              key={l}
                                              type="button"
                                              onClick={() => handleOmrKeyChange(qNum, l)}
                                              className={`w-[18px] h-[18px] rounded-full text-[9px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                                                currentAns === l
                                                  ? 'bg-emerald-600 text-white font-black shadow-2xs scale-105'
                                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                              }`}
                                              title={`Sual ${qNum}: Variant ${l}`}
                                            >
                                              {l}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* 2. AÇIQ SUALLAR - YAZILI CAVAB XANALARI (MÖVCUD İŞLƏK OMR MEXANİZMİ - TƏLƏB 3) */}
                  {openRows.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                          <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                          Açıq Cavablı Suallar ({closedRows.length + 1} - {editableQuestions.length})
                        </span>
                        <span className="text-[8.5px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                          Yazılı Cavab Sahələri
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {openRows.map((q, oIdx) => {
                          const qNum = closedRows.length + oIdx + 1;
                          const currentAns = omrAnswerKey[qNum] !== undefined ? omrAnswerKey[qNum] : q.correct_answer;

                          return (
                            <div
                              key={q.id}
                              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col gap-1.5 shadow-2xs hover:border-amber-300 transition-colors"
                            >
                              {/* Header: Sual № və bal */}
                              <div className="flex items-center justify-between text-xs pb-1 border-b border-amber-200/60">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-black text-slate-900 bg-white border border-amber-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] shadow-2xs">
                                    {qNum}.
                                  </span>
                                  <span className="font-extrabold text-[8.5px] text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                                    Açıq Sual
                                  </span>
                                  {q.topic && (
                                    <span className="text-[9px] text-slate-500 font-medium truncate max-w-[150px]">
                                      {q.topic}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                                  {q.points || 4} bal
                                </span>
                              </div>

                              {/* Sual Mətni */}
                              <div className="text-[11px] font-bold text-slate-800 leading-snug">
                                <MathRenderer content={q.question_text} />
                              </div>

                              {/* Yazılı Cavab Sahəsi */}
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-bold text-slate-600 flex items-center justify-between">
                                  <span>Düzgün Cavab (Açar):</span>
                                  <span className="text-[8px] text-slate-400 font-normal">Şagird cavab sahəsi</span>
                                </label>
                                <input
                                  type="text"
                                  value={currentAns}
                                  onChange={(e) => handleOmrKeyChange(qNum, e.target.value)}
                                  placeholder="Düzgün cavabı daxil edin..."
                                  className="w-full px-2 py-1 text-[11px] font-mono font-bold bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 shadow-2xs"
                                />
                              </div>

                              {/* Qiymətləndirmə Meyarları */}
                              {q.situation_text && (
                                <div className="text-[9px] text-slate-600 bg-white/90 p-1.5 rounded-lg border border-amber-200/80 leading-relaxed font-sans">
                                  <span className="font-bold text-amber-800 block mb-0.5">Qiymətləndirmə Meyarları:</span>
                                  <span className="whitespace-pre-line">{q.situation_text}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer (Shrink-0) */}
                <div className="shrink-0 p-3 border-t border-slate-100 bg-slate-50/80 flex flex-col gap-2">
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
