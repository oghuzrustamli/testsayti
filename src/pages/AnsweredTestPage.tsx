// src/pages/AnsweredTestPage.tsx
// CAVABLI TEST MODULU – Çap üçün test vərəqi və cavab açarı (Printable Test with Answer Key)
import React, { useState, useEffect, useRef } from 'react';
import { Test, PdfQuestionItem } from '../types';
import { api } from '../lib/api';
import { PdfQuestionSelector } from '../components/PdfQuestionSelector';
import { MathRenderer } from '../components/MathRenderer';
import { jsPDF } from 'jspdf';
import {
  FileText,
  Upload,
  Printer,
  Download,
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  CheckCircle,
  FileCheck2,
  Sparkles,
  Copy,
  PlusCircle,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface AnsweredTestPageProps {
  testId?: string | null;
  onBack: () => void;
  onPrint?: (test: Test) => void;
  onShare?: (test: Test) => void;
}

export const AnsweredTestPage: React.FC<AnsweredTestPageProps> = ({
  testId,
  onBack,
}) => {
  // Exam Title & Metadata
  const [examTitle, setExamTitle] = useState<string>('IX Sinif Buraxılış İmtahanı Sınaq Testi - Riyaziyyat');
  const [subject, setSubject] = useState<string>('Riyaziyyat');
  const [gradeGroup, setGradeGroup] = useState<string>('9-cu sinif');
  const [variant, setVariant] = useState<string>('A');

  // Selected questions list
  const [questions, setQuestions] = useState<PdfQuestionItem[]>(() => {
    // If not a testId (or before testId loads), check if answers exist in localStorage
    return [];
  });
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`edunex_omr_student_${testId || 'default'}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showPdfSelector, setShowPdfSelector] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [showAnswerKeyInTest, setShowAnswerKeyInTest] = useState<boolean>(false);
  const [showAnswerKeyDrawer, setShowAnswerKeyDrawer] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Load sample questions if no questions exist
  useEffect(() => {
    // Check if saved teacher answers exist in localStorage for this testId
    const savedTeacherAnswersStr = localStorage.getItem(`edunex_omr_teacher_key_${testId || 'default'}`);
    const savedTeacherAnswers: Record<string, string> = savedTeacherAnswersStr ? JSON.parse(savedTeacherAnswersStr) : {};

    if (testId) {
      api.getTestById(testId)
        .then((t) => {
          setExamTitle(t.title);
          setSubject(t.subject);
          setGradeGroup(t.grade_group || '9-cu sinif');
          if (t.questions && t.questions.length > 0) {
            const mapped: PdfQuestionItem[] = t.questions.map((q, idx) => ({
              id: q.id,
              orderNumber: idx + 1,
              type: q.graph_data?.imageDataUrl ? 'crop' : 'text',
              imageDataUrl: q.graph_data?.imageDataUrl,
              questionText: q.question_text,
              options: q.options,
              correctAnswer: savedTeacherAnswers[q.id] !== undefined ? savedTeacherAnswers[q.id] : (q.correct_answer || 'A'),
              points: q.points || 1,
              explanation: q.explanation
            }));
            setQuestions(mapped);
          }
        })
        .catch(() => {});
    } else {
      // Default initial sample questions to let the teacher see the layout immediately
      setQuestions([
        {
          id: 'sample-1',
          orderNumber: 1,
          type: 'text',
          questionText: 'Hesablayın: $\\frac{\\sqrt{x^2+1}}{2a}$ ifadəsinin $x = \\sqrt{3}$ və $a = 1$ olduqda qiymətini tapın.',
          options: [
            { id: 'A', text: '$1$' },
            { id: 'B', text: '$\\sqrt{2}$' },
            { id: 'C', text: '$\\frac{\\sqrt{3}}{2}$' },
            { id: 'D', text: '$2$' },
            { id: 'E', text: '$\\frac{1}{2}$' }
          ],
          correctAnswer: savedTeacherAnswers['sample-1'] !== undefined ? savedTeacherAnswers['sample-1'] : 'A',
          points: 1
        },
        {
          id: 'sample-2',
          orderNumber: 2,
          type: 'text',
          questionText: '$y = x^2 - 4x + 3$ kvadratik funksiyasının təpə nöqtəsinin koordinatlarını tapın.',
          options: [
            { id: 'A', text: '$(2; -1)$' },
            { id: 'B', text: '$(-2; 1)$' },
            { id: 'C', text: '$(2; 1)$' },
            { id: 'D', text: '$(4; 3)$' },
            { id: 'E', text: '$(0; 3)$' }
          ],
          correctAnswer: savedTeacherAnswers['sample-2'] !== undefined ? savedTeacherAnswers['sample-2'] : 'A',
          points: 1
        },
        {
          id: 'sample-3',
          orderNumber: 3,
          type: 'text',
          questionText: '$\\frac{a+b}{c}$ ifadəsində $a=3.5$, $b=2.5$ və $c=2$ olarsa, qiymətini hesablayın.',
          options: [
            { id: 'A', text: '$2$' },
            { id: 'B', text: '$3$' },
            { id: 'C', text: '$3.5$' },
            { id: 'D', text: '$4$' },
            { id: 'E', text: '$6$' }
          ],
          correctAnswer: savedTeacherAnswers['sample-3'] !== undefined ? savedTeacherAnswers['sample-3'] : 'B',
          points: 1
        }
      ]);
    }
  }, [testId]);

  // Save student answers to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(`edunex_omr_student_${testId || 'default'}`, JSON.stringify(studentAnswers));
    } catch {}
  }, [studentAnswers, testId]);

  // Select correct answer letter (A, B, C, D, E) for Teacher Answer Key (Section 2 & 3)
  const handleSelectAnswer = (questionId: string, letter: string) => {
    setQuestions(prev => {
      const next = prev.map(q => {
        if (q.id === questionId) {
          // Toggle off if already selected, or select new
          const nextVal = q.correctAnswer === letter ? '' : letter;
          return { ...q, correctAnswer: nextVal };
        }
        return q;
      });

      // Persist teacher key map to localStorage
      try {
        const keyMap: Record<string, string> = {};
        next.forEach(q => {
          if (q.correctAnswer) keyMap[q.id] = q.correctAnswer;
        });
        localStorage.setItem(`edunex_omr_teacher_key_${testId || 'default'}`, JSON.stringify(keyMap));
      } catch {}

      return next;
    });
  };

  // Student selecting answer in exam paper / preview mode
  const handleSelectStudentAnswer = (questionId: string, letter: string) => {
    setStudentAnswers(prev => {
      const current = prev[questionId];
      const nextVal = current === letter ? '' : letter;
      return { ...prev, [questionId]: nextVal };
    });
  };

  // Add question from PDF selector
  const handleAddQuestion = (item: PdfQuestionItem) => {
    setQuestions(prev => [...prev, item]);
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => {
      const next = prev.filter(q => q.id !== id);
      return next.map((q, idx) => ({ ...q, orderNumber: idx + 1 }));
    });
  };

  // Reorder questions
  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= questions.length) return;
    const next = [...questions];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setQuestions(next.map((q, idx) => ({ ...q, orderNumber: idx + 1 })));
  };

  // ==========================================
  // PDF EXPORT FUNCTIONS (Section 6)
  // ==========================================

  // 1. Download Test Sheet Only (Student view without answers)
  const handleDownloadTestPdf = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF({ format: 'a4', unit: 'mm' });
      buildTestPages(doc, false);
      doc.save(`${cleanFileName(examTitle)}_Test_Vereqi.pdf`);
    } catch (err) {
      alert('PDF yaradılarkən xəta baş verdi');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Download Answer Key Only (1 - B, 2 - D...)
  const handleDownloadAnswerKeyPdf = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF({ format: 'a4', unit: 'mm' });
      buildAnswerKeyPage(doc, true);
      doc.save(`${cleanFileName(examTitle)}_Cavab_Acari.pdf`);
    } catch (err) {
      alert('Cavab açarı PDF yaradılarkən xəta baş verdi');
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Download Both Combined (Test Sheets + Final Answer Key Page)
  const handleDownloadCombinedPdf = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF({ format: 'a4', unit: 'mm' });
      buildTestPages(doc, false);
      doc.addPage();
      buildAnswerKeyPage(doc, false);
      doc.save(`${cleanFileName(examTitle)}_Test_ve_Cavab_Acari.pdf`);
    } catch (err) {
      alert('Kombinə edilmiş PDF yaradılarkən xəta baş verdi');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper: Build Test Pages in jsPDF
  const buildTestPages = (doc: jsPDF, showKeys: boolean) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    // Header
    doc.setFontSize(16);
    doc.text('ATROQ EDUCATION SINAQ İMTAHANI VƏ TEST VƏRƏQİ', margin, y + 5);
    y += 10;

    doc.setFontSize(11);
    doc.text(`İmtahan: ${examTitle}`, margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.text(`Fənn: ${subject}   |   Sinif/Qrup: ${gradeGroup}   |   Variant: ${variant}   |   Sual Sayı: ${questions.length}`, margin, y);
    y += 5;

    // Student Information Line
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.text('Şagirdin Adı, Soyadı: _____________________________________   Sinif: _______   Tarix: __________   Bal: _____', margin, y);
    y += 4;
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Questions loop
    questions.forEach((q) => {
      // Check if page break needed
      if (y > pageHeight - 45) {
        doc.addPage();
        y = margin;
      }

      doc.setFontSize(10);
      doc.text(`${q.orderNumber}.`, margin, y);

      if (q.type === 'crop' && q.imageDataUrl) {
        // Embed cropped PDF image snippet
        try {
          const imgWidth = Math.min(170, pageWidth - margin * 2 - 10);
          const imgHeight = 45; // aspect estimated or fixed safe
          doc.addImage(q.imageDataUrl, 'PNG', margin + 8, y - 4, imgWidth, imgHeight);
          y += imgHeight + 6;
        } catch (e) {
          doc.text('[Sual Qrafiki / Sahəsi]', margin + 10, y);
          y += 10;
        }
      } else {
        // Text Question
        const cleanText = (q.questionText || '').replace(/\$/g, '');
        const splitText = doc.splitTextToSize(cleanText, pageWidth - margin * 2 - 15);
        doc.text(splitText, margin + 8, y);
        y += splitText.length * 5 + 3;

        // Options A, B, C, D, E
        if (q.options && q.options.length > 0) {
          let optLine = '';
          q.options.forEach((opt) => {
            optLine += `${opt.id}) ${opt.text.replace(/\$/g, '')}     `;
          });
          doc.setFontSize(9);
          doc.text(optLine, margin + 10, y);
          y += 6;
        }
      }

      // Student marking bubbles row (A) (B) (C) (D) (E)
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('Cavab: (A)   (B)   (C)   (D)   (E)', margin + 10, y);
      doc.setTextColor(0, 0, 0);
      y += 8;

      // Small separator line between questions
      doc.setDrawColor(230, 230, 230);
      doc.line(margin + 5, y - 2, pageWidth - margin - 5, y - 2);
      doc.setDrawColor(0, 0, 0);
      y += 4;
    });

    // Page footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('ATROQ Education - Çap üçün Test Sistemi', margin, pageHeight - 8);
    doc.text(`Səhifə 1`, pageWidth - margin - 20, pageHeight - 8);
    doc.setTextColor(0, 0, 0);
  };

  // Helper: Build Answer Key Page (Format: 1 - B, 2 - D...)
  const buildAnswerKeyPage = (doc: jsPDF, standalone: boolean) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;

    doc.setFontSize(16);
    doc.text('ATROQ EDUCATION DÜZGÜN CAVAB AÇARI', margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(`İmtahan: ${examTitle}`, margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.text(`Fənn: ${subject}   |   Variant: ${variant}   |   Cəmi Sual: ${questions.length}`, margin, y);
    y += 6;

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    // Grid of answer key: 1 - B, 2 - D, 3 - A, 4 - C, 5 - E (Section 5)
    doc.setFontSize(12);
    const colWidth = 35;
    const startX = margin + 5;
    let currentX = startX;
    let currentY = y;

    questions.forEach((q, idx) => {
      const line = `${q.orderNumber} – ${q.correctAnswer || '—'}`;
      doc.text(line, currentX, currentY);
      currentY += 10;

      if ((idx + 1) % 15 === 0) {
        currentX += colWidth;
        currentY = y;
      }
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('ATROQ Education - Cavab Açarı Vərəqi', margin, pageHeight - 10);
    doc.setTextColor(0, 0, 0);
  };

  const cleanFileName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ\-]/g, '_');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* 1. TOP CONTROL BAR (Hidden during printing) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Back & Module Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
              title="Geri qayıt"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  OMR Test Modulu (Çap & Cavab Açarı)
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {questions.length} sual seçilib
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {examTitle}
              </h1>
            </div>
          </div>

          {/* Action Buttons: PDF Seç, Yüklə, Çap et */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Main Button: "PDF-DƏN SUAL SEÇ" (Section 1) */}
            <button
              type="button"
              onClick={() => setShowPdfSelector(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-200" />
              <span>PDF-DƏN SUAL SEÇ</span>
            </button>

            {/* Toggle Preview Mode */}
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                previewMode
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Redaktə Rejimi' : 'A4 Önbaxış'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Çap Et</span>
            </button>

            {/* PDF Export Dropdown Actions */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                disabled={isExporting || questions.length === 0}
                onClick={handleDownloadTestPdf}
                className="px-2.5 py-1 text-slate-700 hover:text-indigo-700 hover:bg-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                title="Şagird üçün test vərəqini PDF saxla"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Test PDF</span>
              </button>

              <button
                type="button"
                disabled={isExporting || questions.length === 0}
                onClick={handleDownloadAnswerKeyPdf}
                className="px-2.5 py-1 text-slate-700 hover:text-emerald-700 hover:bg-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                title="Yalnız cavab açarını PDF saxla"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Açar PDF</span>
              </button>

              <button
                type="button"
                disabled={isExporting || questions.length === 0}
                onClick={handleDownloadCombinedPdf}
                className="px-2.5 py-1 bg-white text-indigo-900 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1 transition-all"
                title="Həm test vərəqi, həm cavab açarını birlikdə PDF saxla"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hər İkisi PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1 flex flex-col gap-6">
        {/* If in Edit / Management Mode */}
        {!previewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Test Metadata & Answer Key Summary Card */}
            <div className="lg:col-span-4 flex flex-col gap-5 no-print">
              {/* Test Header Info Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Test Vərəqi Parametrləri
                  </h3>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">İmtahanın Başlığı:</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Fənn:</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Sinif / Qrup:</label>
                    <input
                      type="text"
                      value={gradeGroup}
                      onChange={(e) => setGradeGroup(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Variant:</label>
                  <div className="flex items-center gap-2">
                    {['A', 'B', 'C', 'D'].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVariant(v)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                          variant === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Button to launch PDF selector */}
                <button
                  type="button"
                  onClick={() => setShowPdfSelector(true)}
                  className="mt-2 w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  PDF Faylından Suallar Seç və Kəs
                </button>
              </div>

              {/* Answer Key Summary Drawer (Section 3 & 5) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Cavab Açarı Cədvəli
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {questions.filter(q => q.correctAnswer).length} / {questions.length} Təyin Edilib
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  Hər sual kartının qarşısındakı A, B, C, D, E dairəvi düymələrinə klikləməklə düzgün variantı yaşıl edin.
                </p>

                {/* Answer Key Grid Preview (1 - B, 2 - D...) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className={`p-2 rounded-xl border text-xs font-mono flex items-center justify-between ${
                        q.correctAnswer
                          ? 'bg-emerald-50/70 border-emerald-300 font-bold text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span>№{q.orderNumber}</span>
                      <span className="text-sm font-black">
                        {q.correctAnswer || '—'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAnswerKeyInTest}
                      onChange={(e) => setShowAnswerKeyInTest(e.target.checked)}
                      className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                    />
                    <span>Testin sonunda açar səhifəsi əlavə olunsun</span>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Selected Questions List & A, B, C, D, E Buttons (Section 2 & 3) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 no-print">
                <h2 className="font-bold text-slate-800 text-sm sm:text-base">
                  Seçilmiş Sualların İdarə Edilməsi ({questions.length} Sual)
                </h2>

                <button
                  type="button"
                  onClick={() => setShowPdfSelector(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  PDF-dən Yeni Sual Əlavə Et
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="font-bold text-slate-700 text-sm mb-1">Hələ heç bir sual seçilməyib</h3>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">
                    "PDF-DƏN SUAL SEÇ" düyməsinə klikləyərək kompüterinizdən PDF sənədi açın və sualları sahə və ya mətn kimi seçin.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPdfSelector(true)}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    PDF-dən Sual Seç
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-all flex flex-col gap-3"
                    >
                      {/* Question Top Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                            {q.orderNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            Sual №{q.orderNumber}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {q.type === 'crop' ? 'PDF Sahəsi (Crop)' : 'Mətn Sualı'}
                          </span>
                        </div>

                        {/* Question Action Controls (Move up, Move down, Delete) */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, idx - 1)}
                            className="p-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 rounded-lg"
                            title="Yuxarı sürüşdür"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === questions.length - 1}
                            onClick={() => handleMove(idx, idx + 1)}
                            className="p-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 rounded-lg"
                            title="Aşağı sürüşdür"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Sualı sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Content Display */}
                      {q.type === 'crop' && q.imageDataUrl ? (
                        <div className="my-1 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-2 flex justify-center">
                          <img
                            src={q.imageDataUrl}
                            alt={`Sual ${q.orderNumber}`}
                            className="max-h-56 w-auto object-contain rounded"
                          />
                        </div>
                      ) : (
                        <div className="my-1">
                          <div className="text-xs sm:text-sm text-slate-900 leading-relaxed font-medium mb-2">
                            <MathRenderer content={q.questionText || ''} />
                          </div>
                          {q.options && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {q.options.map(opt => (
                                <div key={opt.id} className="text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1.5">
                                  <span className="font-bold">{opt.id}:</span>
                                  <span className="truncate"><MathRenderer content={opt.text} /></span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* SPECIAL REQUIREMENT 3: OMR CAVAB AÇARI DÜYMƏLƏRİ – A, B, C, D, E */}
                      <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">Düzgün Cavab Açarı:</span>
                          <span className="text-[11px] text-slate-400 font-medium">(A, B, C, D, E variantlarından birini seçin)</span>
                        </div>

                        {/* OMR circular answer key buttons - 1. Ⓐ Ⓑ Ⓒ Ⓓ Ⓔ */}
                        <div className="omr-bubble-row" role="radiogroup" aria-label={`Sual ${q.orderNumber} üçün düzgün cavab açarı`}>
                          {['A', 'B', 'C', 'D', 'E'].map((letter) => {
                            const isSelected = q.correctAnswer === letter;
                            return (
                              <button
                                key={letter}
                                type="button"
                                onClick={() => handleSelectAnswer(q.id, letter)}
                                className={`omr-bubble-btn ${isSelected ? 'omr-selected' : ''}`}
                                title={`Sual ${q.orderNumber}: Düzgün cavab ${letter}`}
                                aria-label={`Variant ${letter}`}
                                aria-checked={isSelected}
                                role="radio"
                              >
                                {letter}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ==============================================================
             3. A4 TEST VƏRƏQİ ÖNBAXIŞI (Classic A4 Paper Layout - Section 4)
             ============================================================== */
          <div className="max-w-4xl mx-auto w-full bg-white p-8 sm:p-14 shadow-2xl rounded-2xl border border-slate-300 print:shadow-none print:border-none print:p-0">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-lg tracking-wider text-slate-950 uppercase">ATROQ Education</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                      SINAQ İMTAHANI VƏ TEST VƏRƏQİ
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {examTitle}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Fənn: <strong>{subject}</strong>   |   Sinif / Qrup: <strong>{gradeGroup}</strong>   |   Variant: <strong>{variant}</strong>   |   Sual Sayı: <strong>{questions.length}</strong>
                  </p>
                </div>

                {/* Score & Student Box for Paper */}
                <div className="border-2 border-slate-400 rounded-xl p-3 text-xs min-w-[220px] bg-slate-50/50">
                  <div className="mb-2">
                    <span className="text-slate-500 font-semibold text-[10px]">Şagirdin Adı, Soyadı:</span>
                    <div className="border-b border-slate-400 h-4 mt-1"></div>
                  </div>
                  <div className="flex justify-between gap-2">
                    <div className="w-1/2">
                      <span className="text-slate-500 font-semibold text-[10px]">Sinif / Qrup:</span>
                      <div className="border-b border-slate-400 h-4 mt-1"></div>
                    </div>
                    <div className="w-1/2">
                      <span className="text-slate-500 font-semibold text-[10px]">Toplanan Bal:</span>
                      <div className="border-b border-slate-400 h-4 mt-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Flow */}
            <div className="flex flex-col gap-6">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="pb-5 border-b border-slate-200 last:border-b-0 break-inside-avoid"
                  style={{ pageBreakInside: 'avoid' }}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-black text-slate-900 text-sm sm:text-base min-w-[24px]">
                      {q.orderNumber}.
                    </span>

                    <div className="flex-1">
                      {q.type === 'crop' && q.imageDataUrl ? (
                        <div className="my-1">
                          <img
                            src={q.imageDataUrl}
                            alt={`Sual ${q.orderNumber}`}
                            className="max-h-60 rounded object-contain"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-slate-900 leading-relaxed font-medium mb-2">
                            <MathRenderer content={q.questionText || ''} />
                          </div>
                          {q.options && (
                            <div className="grid grid-cols-2 gap-2 mt-2 pl-2">
                              {q.options.map(opt => (
                                <div key={opt.id} className="text-xs text-slate-800 flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                                    {opt.id}
                                  </span>
                                  <span><MathRenderer content={opt.text} /></span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* OMR Bubble response line for student (Interactive on screen + clean on print) */}
                      <div className="mt-3 flex items-center gap-3.5 text-xs text-slate-500">
                        <span className="text-[11px] font-bold text-slate-500 print:text-slate-600">Cavab:</span>
                        <div className="omr-bubble-row" role="radiogroup" aria-label={`Sual ${q.orderNumber} üçün şagird cavabı`}>
                          {['A', 'B', 'C', 'D', 'E'].map((letter) => {
                            const isStudentSelected = studentAnswers[q.id] === letter;
                            return (
                              <button
                                key={letter}
                                type="button"
                                onClick={() => handleSelectStudentAnswer(q.id, letter)}
                                className={`omr-bubble-btn ${isStudentSelected ? 'omr-selected' : ''}`}
                                title={`Sual ${q.orderNumber}: ${letter} variantını seç`}
                                aria-label={`Sual ${q.orderNumber} Variant ${letter}`}
                                aria-checked={isStudentSelected}
                                role="radio"
                              >
                                {letter}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Separate Answer Key at the end if enabled (Section 5) */}
            {showAnswerKeyInTest && (
              <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-400 break-before-page">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Düzgün Cavablar Açarı (Müəllim üçün)
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Variant: {variant}</span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 text-xs font-mono font-bold text-center">
                  {questions.map(q => (
                    <div key={q.id} className="p-2 border border-slate-300 rounded bg-slate-50">
                      <div className="text-[10px] text-slate-400">{q.orderNumber}</div>
                      <div className="text-indigo-700 text-sm">{q.correctAnswer || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* A4 Footer */}
            <div className="mt-10 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>ATROQ Education Təhsil Platforması</span>
              <span>A4 İmtahan Formatı • Səhifə 1 / 1</span>
            </div>
          </div>
        )}
      </main>

      {/* 4. MODAL: PDF Question Selector & Cropper (Section 1) */}
      {showPdfSelector && (
        <PdfQuestionSelector
          onAddQuestion={handleAddQuestion}
          onClose={() => setShowPdfSelector(false)}
          currentQuestionCount={questions.length}
        />
      )}
    </div>
  );
};
