// src/pages/InteractiveTestTaking.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { Test, Question, SituationEvaluationResult } from '../types';
import { api } from '../lib/api';
import { evaluateSituationAnswer } from '../lib/situationEvaluator';
import { MathRenderer } from '../components/MathRenderer';
import confetti from 'canvas-confetti';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Send,
  Award,
  RefreshCw,
  Wifi,
  WifiOff,
  GraduationCap,
  ZoomIn,
  ZoomOut,
  FileText,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Layers,
  Edit3
} from 'lucide-react';

// Configure pdfjs worker to local public path
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const DIGIT_ROWS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ','];

function parseStringToColumns(val: string): string[] {
  const clean = (val || '').toString().replace(/\s+/g, '').replace('.', ',');
  const cols = ['', '', '', '', '', ''];
  for (let i = 0; i < Math.min(6, clean.length); i++) {
    const ch = clean[i];
    if ((ch >= '0' && ch <= '9') || ch === ',') {
      cols[i] = ch;
    }
  }
  return cols;
}

interface InteractiveTestTakingProps {
  shareCode?: string;
  testId?: string;
  onExit?: () => void;
}

// Helper component for continuous multi-page PDF rendering
interface ContinuousPdfPageItemProps {
  pdfDoc: any;
  pageNum: number;
  scale: number;
}

const ContinuousPdfPageItem: React.FC<ContinuousPdfPageItemProps> = ({
  pdfDoc,
  pageNum,
  scale,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let renderTask: any = null;

    async function renderPage() {
      if (!canvasRef.current || !pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        renderTask = page.render({
          canvasContext: ctx,
          viewport: viewport,
        });
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error(`Page ${pageNum} render error:`, err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, pageNum, scale]);

  return (
    <div className="flex flex-col items-center my-3 relative group w-full">
      <div className="w-full max-w-fit self-center flex items-center justify-between px-3 py-1 mb-1.5 rounded-full bg-white/90 border border-slate-300 text-[10.5px] font-bold text-slate-700 shadow-2xs backdrop-blur-xs select-none">
        <span>Səhifə {pageNum}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="shadow-xl border border-slate-300/80 rounded bg-white max-w-full"
      />
    </div>
  );
};

export const InteractiveTestTaking: React.FC<InteractiveTestTakingProps> = ({
  shareCode,
  testId,
  onExit,
}) => {
  // Test & Student state
  const [test, setTest] = useState<Partial<Test> | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Student name prompt state
  const [studentName, setStudentName] = useState<string>('');
  const [studentSurname, setStudentSurname] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);

  // Active question navigation (interactive mode)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Countdown timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(45 * 60);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Document Viewer State for OMR Tests (PDF & Word)
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [docType, setDocType] = useState<'pdf' | 'docx' | 'none'>('none');
  const [wordHtml, setWordHtml] = useState<string>('');
  const [omrColumnMode, setOmrColumnMode] = useState<3 | 2 | 1>(3);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.15);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Confirmation modal
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);

  // Completed results view
  const [examResult, setExamResult] = useState<any>(null);
  const [situationEvaluations, setSituationEvaluations] = useState<Record<string, SituationEvaluationResult>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const timerRef = useRef<any>(null);

  // Load test details by share code or testId
  useEffect(() => {
    async function fetchTest() {
      try {
        setLoading(true);
        setErrorMsg('');
        let testData: any;
        if (shareCode) {
          testData = await api.getTestByShareCode(shareCode);
        } else if (testId) {
          const t = await api.getTestById(testId);
          testData = { test: t, questions: t.questions || [] };
        }

        if (testData && testData.test) {
          setTest(testData.test);
          let qList: Question[] = testData.questions || [];

          // Auto-heal: If OMR test and questions array is empty, auto-populate question numbers!
          const isOmrTest = testData.test.test_mode === 'answered' || testData.test.test_mode === 'omr' || !!testData.test.pdf_url;
          if (isOmrTest && (!qList || qList.length === 0)) {
            const count = testData.test.total_questions || 25;
            qList = Array.from({ length: count }, (_, i) => ({
              id: `q-omr-${i + 1}`,
              subject: testData.test.subject || 'Ümumi',
              question_text: `Sual №${i + 1}`,
              question_type: 'single_choice' as const,
              options: [
                { id: 'A', text: 'A' },
                { id: 'B', text: 'B' },
                { id: 'C', text: 'C' },
                { id: 'D', text: 'D' },
                { id: 'E', text: 'E' },
              ],
              correct_answer: 'A',
              points: 4,
              order_index: i
            }));
          }

          setQuestions(qList);
          setTimeLeftSeconds((testData.test.duration_minutes || 45) * 60);
        } else {
          setErrorMsg('Test məlumatları tapılmadı.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'İmtahan testi tapılmadı və ya link deaktiv edilib');
      } finally {
        setLoading(false);
      }
    }
    fetchTest();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [shareCode, testId]);

  // Load PDF or Word document when exam is started and test is in OMR mode
  useEffect(() => {
    if (!isExamStarted || !test || ((test.test_mode as any) !== 'answered' && (test.test_mode as any) !== 'omr' && !test.pdf_url)) return;

    const targetUrl = test.pdf_url || '/sample_exam.pdf';
    setPdfLoading(true);

    const isDocx = targetUrl.toLowerCase().endsWith('.docx') || targetUrl.toLowerCase().endsWith('.doc');

    if (isDocx) {
      setDocType('docx');
      fetch(targetUrl)
        .then(res => res.arrayBuffer())
        .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
        .then(res => {
          setWordHtml(res.value);
          setPdfLoading(false);
        })
        .catch(err => {
          console.warn('Could not parse Word document, falling back to sample PDF', err);
          setDocType('pdf');
          pdfjsLib.getDocument('/sample_exam.pdf').promise.then(
            (fallbackDoc) => {
              setPdfDoc(fallbackDoc);
              setTotalPages(fallbackDoc.numPages);
              setCurrentPage(1);
              setPdfLoading(false);
            },
            () => setPdfLoading(false)
          );
        });
    } else {
      setDocType('pdf');
      pdfjsLib.getDocument(targetUrl).promise.then(
        (doc) => {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setCurrentPage(1);
          setPdfLoading(false);
        },
        (err) => {
          console.warn('Could not load specific PDF, trying fallback /sample_exam.pdf', err);
          pdfjsLib.getDocument('/sample_exam.pdf').promise.then(
            (fallbackDoc) => {
              setPdfDoc(fallbackDoc);
              setTotalPages(fallbackDoc.numPages);
              setCurrentPage(1);
              setPdfLoading(false);
            },
            () => {
              setPdfLoading(false);
            }
          );
        }
      );
    }
  }, [isExamStarted, test]);

  // Render current PDF page
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering PDF page in student view:', err);
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    renderCurrentPage();
  }, [renderCurrentPage]);

  // Restore saved answers from localStorage if present
  useEffect(() => {
    if (sessionId) {
      try {
        const stored = localStorage.getItem(`edx_answers_${sessionId}`);
        if (stored) {
          setAnswers(JSON.parse(stored));
        }
      } catch (e) {}
    }
  }, [sessionId]);

  // Start exam
  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentSurname.trim()) {
      alert('Zəhmət olmasa ad və soyadınızı daxil edin');
      return;
    }

    try {
      setLoading(true);
      const res = await api.startExam(
        test?.id || testId || 'tst-buraxilis-demo',
        studentName.trim(),
        studentSurname.trim(),
        className.trim() || 'Qrup'
      );
      setSessionId(res.session_id);
      setIsExamStarted(true);
    } catch (err: any) {
      alert(err.message || 'İmtahana başlamaqda xəta');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!isExamStarted || examResult) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isExamStarted, examResult]);

  // Auto-submit when time expires
  const handleAutoSubmit = () => {
    if (!sessionId || submitting) return;
    performFinalSubmit();
  };

  // Handle student selecting an answer (Auto-save immediately + localStorage)
  const handleSelectAnswer = async (questionId: string, answerId: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: answerId };
      if (sessionId) {
        try {
          localStorage.setItem(`edx_answers_${sessionId}`, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    // Save to server
    if (sessionId) {
      api.saveExamAnswer(sessionId, questionId, answerId);
    }
  };

  // Final submit
  const performFinalSubmit = async () => {
    if (!sessionId) return;
    try {
      setSubmitting(true);
      const initialTotalTime = (test?.duration_minutes || 45) * 60;
      const durationSeconds = Math.max(0, initialTotalTime - timeLeftSeconds);

      // Evaluate Situation Questions with AI / Semantic Engine (Tələb 3, 4, 6)
      const sitEvals: Record<string, SituationEvaluationResult> = {};
      let situationScoreBonus = 0;
      for (const q of questions) {
        if (q.question_type === 'situation') {
          const evalRes = evaluateSituationAnswer({
            studentAnswer: answers[q.id] || '',
            maxPoints: q.points || 6,
            keywords: q.situation_keywords || [],
            synonymsMap: q.situation_synonyms || {},
            gradingMode: q.situation_grading_mode || 'keywords_10'
          });
          sitEvals[q.id] = evalRes;
          situationScoreBonus += evalRes.score;
        }
      }
      setSituationEvaluations(sitEvals);

      const res = await api.submitExam(sessionId, answers, durationSeconds);
      if (Object.keys(sitEvals).length > 0) {
        res.score = (res.score || 0) + situationScoreBonus;
        res.percentage = Math.min(100, Math.round((res.score / (test?.total_points || 100)) * 100));
      }
      setExamResult(res);
      setShowConfirmSubmit(false);

      // Clean local storage cache
      try {
        localStorage.removeItem(`edx_answers_${sessionId}`);
      } catch (e) {}

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } catch (err: any) {
      alert(err.message || 'Nəticə göndərilərkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 0. Loading State
  if (loading && !test) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-sm font-bold text-slate-800">İmtahan səhifəsi yüklənir...</h2>
        <p className="text-xs text-slate-400 mt-1">Zəhmət olmasa gözləyin</p>
      </div>
    );
  }

  // Error State
  if (errorMsg || !test) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-2">Sınaq Tapılmadı</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {errorMsg || 'Axtardığınız test mövcud deyil və ya paylaşım linki müəllim tərəfindən bağlanmışdır.'}
          </p>
          {onExit && (
            <button
              onClick={onExit}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Əsas Səhifəyə Qayıt
            </button>
          )}
        </div>
      </div>
    );
  }

  const isOmrMode = (test.test_mode as any) === 'answered' || (test.test_mode as any) === 'omr' || (test as any).is_omr || !!test.pdf_url;

  // 1. Initial State: Name Prompt Screen
  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-5 mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 inline-block">
                {test.exam_model} • {test.subject}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                isOmrMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isOmrMode ? 'OMR Test' : 'İnteraktiv Test'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {test.title}
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              İmtahana başlamaq üçün ad və soyadınızı daxil edin.
            </p>
          </div>

          {/* Test Info Badges */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs mb-6 font-semibold">
            <div>
              <span className="text-[10px] text-slate-400 block font-normal">Sual Sayı</span>
              <strong className="text-slate-800">{questions.length || test.total_questions || 0} sual</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-normal">Müddət</span>
              <strong className="text-slate-800">{test.duration_minutes} dəqiqə</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-normal">Maks. Bal</span>
              <strong className="text-indigo-600">{test.total_points || 100} bal</strong>
            </div>
          </div>

          <form onSubmit={handleStartExam} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Adınız: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Məsələn: Əli"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Soyadınız: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentSurname}
                onChange={(e) => setStudentSurname(e.target.value)}
                placeholder="Məsələn: Həsənov"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Sinifiniz və ya Qrupunuz:
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Məsələn: 10-A və ya Blok I Qrup"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              <span>İmtahana Başla</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Completed Results Screen
  if (examResult) {
    const isPassing = examResult.percentage >= 60;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl max-w-lg w-full p-6 sm:p-8 text-center animate-in fade-in zoom-in-95">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
            isPassing ? 'bg-emerald-100 text-emerald-600 shadow-emerald-100' : 'bg-amber-100 text-amber-600'
          } shadow-lg`}>
            <Award className="w-9 h-9" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            İmtahan Uğurla Tamamlandı
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            {studentName} {studentSurname}
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Nəticələriniz avtomatik hesablandı və sistemdə qeydə alındı.
          </p>

          {/* Results Score Box */}
          <div className="p-6 bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl border border-indigo-100 shadow-sm mb-6">
            <div className="text-4xl font-black text-indigo-900 mb-1">
              {examResult.score} <span className="text-base text-slate-500 font-bold">/ {test?.total_points || 100} bal</span>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
              examResult.percentage >= 80
                ? 'bg-emerald-100 text-emerald-800'
                : examResult.percentage >= 50
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              Müvəffəqiyyət Faizi: {examResult.percentage}%
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-indigo-100/60 text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/50">
                <span className="text-[10px] text-emerald-700 font-bold block">Düzgün</span>
                <strong className="text-emerald-900 text-base">{examResult.correct_count}</strong>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200/50">
                <span className="text-[10px] text-rose-700 font-bold block">Səhv</span>
                <strong className="text-rose-900 text-base">{examResult.incorrect_count}</strong>
              </div>
              <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200/50">
                <span className="text-[10px] text-slate-600 font-bold block">Boş</span>
                <strong className="text-slate-800 text-base">{examResult.blank_count}</strong>
              </div>
            </div>

            {/* Situasiya Suallarının AI Qiymətləndirmə Təhlili (Tələb 3, 4) */}
            {Object.keys(situationEvaluations).length > 0 && (
              <div className="mt-5 pt-4 border-t border-indigo-100 flex flex-col gap-3 text-left">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Süni İntellektlə Situasiya Təhlili</span>
                </div>

                {questions.filter(q => q.question_type === 'situation').map((q, idx) => {
                  const ev = situationEvaluations[q.id];
                  if (!ev) return null;
                  const studentAns = answers[q.id] || '';

                  return (
                    <div key={q.id} className="p-3 bg-white rounded-xl border border-indigo-200/80 shadow-2xs flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <span className="font-extrabold text-indigo-900">
                          Situasiya Sualı №{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                            {ev.score} / {ev.max_points} bal
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            ({ev.tier_label})
                          </span>
                        </div>
                      </div>

                      {/* Student's answer */}
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-700 text-[11px] leading-relaxed">
                        <strong className="block text-[10px] text-slate-400 mb-0.5">Şagirdin Cavabı:</strong>
                        {studentAns || <span className="italic text-slate-400">Cavab yazılmayıb</span>}
                      </div>

                      {/* Matched Keywords */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500">Aşkar edilən açar sözlər ({ev.matched_keywords.length}/10):</span>
                        <div className="flex flex-wrap gap-1">
                          {ev.matched_keywords.map((m, mi) => (
                            <span key={mi} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                              {m.keyword} {m.matched_term !== m.keyword && <span className="opacity-75">({m.matched_term})</span>}
                            </span>
                          ))}
                          {ev.missing_keywords.map((k, ki) => (
                            <span key={ki} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px]">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* AI Feedback */}
                      <div className="text-[11px] text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                        <strong>AI Rəyi:</strong> {ev.ai_feedback}
                      </div>

                      {/* Teacher Score Override (Tələb 4) */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400">Balı əl ilə dəyiş (Müəllim):</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={ev.max_points}
                            step="0.5"
                            defaultValue={ev.score}
                            onChange={(e) => {
                              const newScore = parseFloat(e.target.value) || 0;
                              setSituationEvaluations(prev => ({
                                ...prev,
                                [q.id]: { ...prev[q.id], score: newScore, teacher_override_score: newScore }
                              }));
                            }}
                            className="w-14 px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-center font-bold text-indigo-700 text-xs"
                          />
                          <span className="text-[10px] text-slate-500">bal</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {onExit && (
            <button
              onClick={onExit}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow transition-colors"
            >
              Əsas Səhifəyə Qayıt
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Exam In-Progress Screen
  const answeredCount = Object.keys(answers).filter(k => answers[k] && answers[k].trim() !== '').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="h-14 sm:h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
            EDX
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                {test?.title || 'Sınaq İmtahanı'}
              </h2>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                isOmrMode ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {isOmrMode ? 'OMR' : 'İnteraktiv'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Şagird: <strong>{studentName} {studentSurname}</strong> ({className || 'Standart'})
            </span>
          </div>
        </div>

        {/* Right side: Countdown Timer & Network Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-mono text-xs font-black border transition-colors ${
            timeLeftSeconds < 300
              ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Wifi className="w-3 h-3" /> Sinxron
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 font-semibold" title="Cavablar yerli saxlanılır">
                <WifiOff className="w-3 h-3" /> Oflayn
              </span>
            )}
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-3 sm:px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Testi Bitir</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      {isOmrMode ? (
        /* ==================================================================== */
        /* OMR TEST MODE: Left PDF Document Viewer, Right OMR Optical Bubbles   */
        /* ==================================================================== */
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-64px)]">
          {/* Left Column: PDF Viewer */}
          <div className="flex-1 min-w-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-200 flex flex-col h-[50vh] lg:h-full overflow-hidden">
            {/* Document Toolbar */}
            <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-800 text-xs">
                  {docType === 'docx' ? 'Sınaq Sənədi (Word)' : 'Sınaq Sənədi (PDF)'}
                </span>
              </div>

              {docType === 'pdf' && pdfDoc && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[11px] font-bold text-indigo-800">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Davamlı Baxış (Cəmi {totalPages} Səhifə)</span>
                  </div>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

                  <button
                    onClick={() => setScale(s => Math.max(0.7, s - 0.15))}
                    className="p-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
                    title="Uzaqlaşdır"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono w-9 text-center font-bold">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={() => setScale(s => Math.min(2.0, s + 0.15))}
                    className="p-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
                    title="Yaxınlaşdır"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Canvas / Word Viewer Container (Müstəqil Təkərlə Aşağı-Yuxarı Sürüşdürmə - Tələb 9) */}
            <div className="flex-1 overflow-y-auto overscroll-contain independent-scroll p-4 flex flex-col items-center min-h-0">
              {pdfLoading ? (
                <div className="m-auto text-center text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                  Sənəd yüklənir...
                </div>
              ) : docType === 'docx' && wordHtml ? (
                <div className="bg-white shadow-xl rounded-xl p-8 sm:p-10 max-w-3xl w-full border border-slate-200 font-serif leading-relaxed text-slate-800 prose prose-slate">
                  <div dangerouslySetInnerHTML={{ __html: wordHtml }} />
                </div>
              ) : pdfDoc ? (
                <div className="flex flex-col items-center w-full max-w-full pb-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <ContinuousPdfPageItem
                      key={pNum}
                      pdfDoc={pdfDoc}
                      pageNum={pNum}
                      scale={scale}
                    />
                  ))}
                </div>
              ) : (
                <div className="m-auto text-center p-6 bg-white rounded-2xl border border-slate-200 max-w-sm">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-bold">Sənəd birbaşa göstərilmir</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Zəhmət olmasa sualları müəlliminizdən aldığınız kağız və ya elektron vərəq üzrə oxuyaraq sağ tərəfdəki OMR cavab kartını doldurun.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: OMR Optical Bubble Answer Sheet (Müstəqil Sürüşdürmə & Bərabər Simmetrik Boşluq) */}
          <aside
            className="w-full lg:w-[530px] xl:w-[570px] 2xl:w-[610px] bg-white flex flex-col h-[50vh] lg:h-full overflow-hidden border-l border-slate-200 shadow-lg shrink-0 min-h-0"
          >
            {/* OMR Header */}
            <div className="p-2 sm:p-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                  Optik Cavab Kartı
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-500">
                    Cavablandırılıb: <strong className="text-emerald-600 font-bold">{answeredCount} / {questions.length}</strong>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">Qalan Boş</span>
                <span className="text-xs font-black text-amber-600">
                  {questions.length - answeredCount} sual
                </span>
              </div>
            </div>

            {/* Question Rows List: Müstəqil Scroll Konteyneri */}
            <div className="flex-1 overflow-y-auto overscroll-contain independent-scroll p-2 scrollbar-thin min-h-0">
              {questions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Suallar yüklənir...
                </div>
              ) : (
                (() => {
                  const closedQuestions = questions.filter(
                    q => q.question_type !== 'numeric' && q.question_type !== 'open_ended' && q.question_type !== 'situation'
                  );
                  const openQuestions = questions.filter(
                    q => q.question_type === 'numeric' || q.question_type === 'open_ended'
                  );
                  const situationQuestions = questions.filter(
                    q => q.question_type === 'situation'
                  );

                  const numCols = 3;
                  const perCol = Math.ceil(closedQuestions.length / numCols);
                  const columnSlices = Array.from({ length: numCols }, (_, colIdx) =>
                    closedQuestions.slice(colIdx * perCol, (colIdx + 1) * perCol)
                  );

                  return (
                    <div className="flex flex-col gap-3">
                      {/* 1. QAPALI OMR SUALLARI (DƏQİQ 3 SÜTUN, HƏR İKİ TƏRƏFDƏ EYNİ QAYDADA BƏRABƏR BOŞLUQ) */}
                      {closedQuestions.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 items-stretch">
                          {columnSlices.map((colQuestions, colIdx) => (
                            <div key={colIdx} className="omr-column-card">
                              <div className="flex flex-col gap-0.5">
                                {colQuestions.map((q, idxInCol) => {
                                  const originalIndex = questions.findIndex(orig => orig.id === q.id);
                                  const qNum = originalIndex >= 0 ? originalIndex + 1 : (colIdx * perCol + idxInCol + 1);
                                  const currentSelection = answers[q.id] || '';

                                  return (
                                    <div
                                      key={q.id || qNum}
                                      className={`px-2 py-0.5 rounded-md border flex items-center justify-center gap-2 transition-colors ${
                                        currentSelection
                                          ? 'bg-emerald-50/60 border-emerald-300'
                                          : 'bg-white border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      {/* Sual nömrəsi */}
                                      <div className="flex items-center gap-0.5 shrink-0 min-w-[20px] text-right justify-end">
                                        <span className="font-mono font-bold text-[10px] text-slate-800">
                                          {qNum < 10 ? `0${qNum}` : qNum}.
                                        </span>
                                        {currentSelection && (
                                          <span className="text-[8px] font-black text-emerald-700 bg-emerald-100 px-0.5 rounded leading-none">
                                            {currentSelection}
                                          </span>
                                        )}
                                      </div>

                                      {/* A, B, C, D, E Circular Buttons */}
                                      <div className="omr-bubble-row shrink-0 flex items-center gap-[2.5px]" role="radiogroup">
                                        {['A', 'B', 'C', 'D', 'E'].map((letter) => {
                                          const isSelected = currentSelection === letter;
                                          return (
                                            <button
                                              key={letter}
                                              type="button"
                                              onClick={() => handleSelectAnswer(q.id, isSelected ? '' : letter)}
                                              className={`omr-bubble-btn ${isSelected ? 'omr-selected' : ''}`}
                                              title={`Sual ${qNum}: ${letter}`}
                                            >
                                              {letter}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 2. AÇIQ SUALLAR (RƏQƏMLİ) - DƏQİQ 2 SÜTUN (Yanaşı yerləşmə) */}
                      {openQuestions.length > 0 && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-[10px] font-extrabold text-indigo-900 block mb-1.5 uppercase tracking-wider">
                            Açıq Cavablı Suallar ({openQuestions.length})
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {openQuestions.map((q) => {
                              const originalIndex = questions.findIndex(orig => orig.id === q.id);
                              const qNum = originalIndex >= 0 ? originalIndex + 1 : 1;
                              const currentSelection = answers[q.id] || '';
                              const currentCols = parseStringToColumns(currentSelection);

                              return (
                                <div
                                  key={q.id || qNum}
                                  className="bg-slate-50 border-2 border-indigo-200 rounded-xl p-2 flex flex-col gap-1 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between pb-1 border-b border-indigo-100 text-[10px]">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono font-bold text-slate-800 shrink-0 min-w-[28px]">
                                        {qNum < 10 ? '0' + qNum : qNum}.
                                      </span>
                                      <span className="bg-indigo-100 text-indigo-800 font-extrabold px-1.5 py-0.2 rounded text-[8.5px]">
                                        Açıq Sual
                                      </span>
                                    </div>
                                    {currentSelection && (
                                      <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded text-[9px]">
                                        {currentSelection}
                                      </span>
                                    )}
                                  </div>

                                  {/* 6 Sütun x 12 Sətir Grid */}
                                  <div className="flex justify-center pt-0.5">
                                    <div className="omr-numeric-grid">
                                      {[0, 1, 2, 3, 4, 5].map((cIdx) => {
                                        const colVal = currentCols[cIdx] || '';
                                        return (
                                          <div key={cIdx} className="omr-numeric-col">
                                            <input
                                              type="text"
                                              maxLength={1}
                                              value={colVal}
                                              onChange={(e) => {
                                                let val = e.target.value.slice(-1);
                                                if (val === '.') val = ',';
                                                if (val !== '' && !DIGIT_ROWS.includes(val)) return;
                                                const newCols = [...currentCols];
                                                newCols[cIdx] = val;
                                                handleSelectAnswer(q.id, newCols.join(''));
                                              }}
                                              className="omr-numeric-box"
                                            />
                                            {DIGIT_ROWS.map((ch) => {
                                              const isSelected = colVal === ch;
                                              return (
                                                <button
                                                  key={ch}
                                                  type="button"
                                                  onClick={() => {
                                                    const newCols = [...currentCols];
                                                    newCols[cIdx] = newCols[cIdx] === ch ? '' : ch;
                                                    handleSelectAnswer(q.id, newCols.join(''));
                                                  }}
                                                  className={`omr-numeric-bubble ${isSelected ? 'omr-selected' : ''}`}
                                                  title={`Sütun ${cIdx + 1}: ${ch}`}
                                                >
                                                  {ch}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 3. SİTUASİYA SUALLARI */}
                      {situationQuestions.length > 0 && (
                        <div className="pt-2 border-t border-amber-200 flex flex-col gap-2">
                          <span className="text-[10px] font-extrabold text-amber-900 block mb-0.5 uppercase tracking-wider">
                            Situasiya Sualları ({situationQuestions.length})
                          </span>
                          {situationQuestions.map((q) => {
                            const originalIndex = questions.findIndex(orig => orig.id === q.id);
                            const qNum = originalIndex >= 0 ? originalIndex + 1 : 1;
                            const currentSelection = answers[q.id] || '';

                            return (
                              <div
                                key={q.id || qNum}
                                className="bg-amber-50/70 border-2 border-amber-300 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-2xs"
                              >
                                <div className="flex items-center justify-between pb-1 border-b border-amber-200 text-[10px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-slate-800 shrink-0 min-w-[28px]">
                                      {qNum < 10 ? '0' + qNum : qNum}.
                                    </span>
                                    <span className="bg-amber-100 text-amber-900 border border-amber-200 font-extrabold px-1.5 py-0.2 rounded text-[8.5px] flex items-center gap-0.5">
                                      <Layers className="w-2.5 h-2.5 text-amber-700" />
                                      Situasiya
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.2 rounded">
                                    {q.situation_grading_mode === 'dim_tiered' ? 'DİM Modeli' : '10 Açar Söz'} • {q.points || 6} bal
                                  </span>
                                </div>

                                {q.situation_text && (
                                  <div className="text-[9.5px] text-slate-700 leading-relaxed bg-white/90 p-1.5 rounded-md border border-amber-100 font-sans line-clamp-3">
                                    <strong>Situasiya:</strong> {q.situation_text}
                                  </div>
                                )}

                                {q.question_text && (
                                  <div className="text-[9.5px] text-slate-900 font-bold px-0.5">
                                    {q.question_text}
                                  </div>
                                )}

                                <div className="flex flex-col gap-1 pt-1 border-t border-amber-200/60">
                                  <label className="text-[9px] font-bold text-slate-600">
                                    Şagirdin Yazılı Cavabı:
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={currentSelection}
                                    onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                                    placeholder="Yazılı cavabınızı bura daxil edin..."
                                    className="w-full px-2 py-1 text-[10px] bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 resize-none font-sans"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                {questions.length - answeredCount > 0 ? (
                  <span className="text-amber-600 font-bold">
                    {questions.length - answeredCount} sual boş qalıb
                  </span>
                ) : (
                  <span className="text-emerald-600 font-bold">
                    Bütün suallar cavablandırıldı
                  </span>
                )}
              </span>

              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                İmtahanı Bitir
              </button>
            </div>
          </aside>
        </main>
      ) : (
        /* ==================================================================== */
        /* INTERACTIVE TEST MODE: Question Matrix, MathRenderer, Single Cards   */
        /* ==================================================================== */
        <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-5 flex-1">
          {/* Navigation Matrix Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-3 overflow-x-auto scrollbar-thin">
            <div className="flex items-center gap-1.5 min-w-max">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-9 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all border ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                        : isAnswered
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-400 font-semibold shrink-0 pl-2">
              Cavablandırılıb: <strong className="text-emerald-600">{answeredCount}</strong> / {questions.length}
            </div>
          </div>

          {/* Question Card */}
          {questions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
              Bu testdə suallar hazırlanır.
            </div>
          ) : questions[currentIndex] ? (
            (() => {
              const currentQ = questions[currentIndex];
              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-5">
                  {/* Question Header & Points */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-extrabold text-sm text-indigo-700 flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                        {currentIndex + 1}
                      </span>
                      Sual №{currentIndex + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {currentQ.points} bal
                    </span>
                  </div>

                  {/* Situation Text / Scenario Passage if present */}
                  {currentQ.situation_text && (
                    <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Situasiya Mətni</span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                        <MathRenderer content={currentQ.situation_text} />
                      </div>
                    </div>
                  )}

                  {/* Vertically compact, horizontally wide question text */}
                  <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed py-1">
                    <MathRenderer content={currentQ.question_text || `Sual №${currentIndex + 1}`} />
                  </div>

                  {/* Attached Image if present */}
                  {currentQ.image_url && (
                    <div className="my-2 flex justify-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                      <img
                        src={currentQ.image_url}
                        alt="Sual Şəkli"
                        className="max-h-60 rounded-lg border border-slate-200 shadow-2xs object-contain"
                      />
                    </div>
                  )}

                  {/* Embedded Graph if present */}
                  {currentQ.graph_data?.imageDataUrl && (
                    <div className="my-2 flex justify-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                      <img
                        src={currentQ.graph_data.imageDataUrl}
                        alt="Sual Qrafiki"
                        className="max-h-56 rounded-lg border border-slate-200 shadow-2xs"
                      />
                    </div>
                  )}

                  {/* Situation Question Written Input (Tələb 2, 4) */}
                  {currentQ.question_type === 'situation' && (
                    <div className="pt-2 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4 text-amber-600" />
                          <span>Yazılı Cavab Sahəsi:</span>
                        </label>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                          {currentQ.situation_grading_mode === 'dim_tiered' ? 'DİM Modeli' : '10 Açar Sözlə'} • {currentQ.points || 6} bal
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                        placeholder="Situasiya üzrə cavabınızı, elmi izahatınızı və əsaslandıran arqumentlərinizi ətraflı şəkildə buraya yazın..."
                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 leading-relaxed font-sans"
                      />
                    </div>
                  )}

                  {/* Open-Ended / Numeric Input */}
                  {(currentQ.question_type === 'open_ended' || currentQ.question_type === 'numeric') ? (
                    <div className="pt-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Cavabınızı daxil edin (ədədi və ya riyazi ifadə):
                      </label>
                      <input
                        type="text"
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                        placeholder="Cavabı buraya yazın (Məs: 15 və ya 3/4)"
                        className="w-full px-4 py-3 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-800"
                      />
                    </div>
                  ) : (
                    /* Horizontally wide options for Closed Questions */
                    <div className="flex flex-col gap-2.5 pt-2">
                      {currentQ.options && currentQ.options.map((opt) => {
                        const isSelected = answers[currentQ.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectAnswer(currentQ.id, opt.id)}
                            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600 text-indigo-950 font-bold shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-800 font-medium'
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {opt.id}
                            </span>

                            <span className="flex-1 text-xs sm:text-sm leading-snug">
                              <MathRenderer content={opt.text} />
                            </span>

                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()
          ) : null}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              Əvvəlki
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                İmtahanı Tamamla və Təhvil Ver
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all"
              >
                Növbəti
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>
      )}

      {/* Confirmation Modal before Submit */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 text-base mb-1">
              İmtahanı təhvil vermək istəyirsiniz?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Ümumi <strong>{questions.length}</strong> sualdan <strong>{answeredCount}</strong> sualı cavablandırmısınız.{' '}
              {questions.length - answeredCount > 0 && (
                <span className="text-rose-600 font-bold block mt-1">
                  Diqqət: {questions.length - answeredCount} sual cavabsız qalıb!
                </span>
              )}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Davam Et (Qayıt)
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={performFinalSubmit}
                className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Göndərilir...' : 'Bəli, Təhvil Ver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
