// src/pages/OmrTestCreatorPage.tsx
// OMR TEST YARAT: PDF və Word (DOC, DOCX) sənədi ilə sual kitabçası, 13px A-E cavab cədvəli və şagirdə eyni sənədin nümayişi
import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';
import { User, Test, Question } from '../types';
import { api } from '../lib/api';
import { SituationQuestionModal } from '../components/SituationQuestionModal';
import { DocSnippetModal } from '../components/DocSnippetModal';
import { evaluateSituationAnswer } from '../lib/situationEvaluator';
import { MultiSubjectSelector, SubjectConfig } from '../components/MultiSubjectSelector';
import {
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Download,
  Save,
  CheckCircle,
  FileCheck2,
  Trash2,
  AlertTriangle,
  Plus,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowLeft,
  Eye,
  FileUp,
  UploadCloud,
  X,
  HelpCircle,
  Clock,
  Send,
  BookOpen,
  Award,
  Compass,
  ChevronDown,
  Edit3,
  Scissors
} from 'lucide-react';

export const OMR_CATEGORIES = [
  {
    id: 'blok',
    label: 'Blok',
    badge: 'I - IV Qrup',
    icon: Layers,
    items: [
      { id: 'blok-1-ri', name: 'I Qrup (Rİ)', subject: 'Riyaziyyat / İnformatika' },
      { id: 'blok-1-rk', name: 'I Qrup (RK)', subject: 'Riyaziyyat / Kimya' },
      { id: 'blok-2', name: 'II Qrup', subject: 'Riyaziyyat / Coğrafiya' },
      { id: 'blok-3', name: 'III Qrup', subject: 'Azərbaycan dili / Tarix' },
      { id: 'blok-4', name: 'IV Qrup', subject: 'Biologiya / Kimya' },
    ]
  },
  {
    id: 'buraxilis',
    label: 'Buraxılış',
    badge: 'DİM 9 & 11',
    icon: Award,
    items: [
      { id: 'buraxilis-9', name: '9-cu sinif Buraxılış', subject: 'Riyaziyyat / Ana dili' },
      { id: 'buraxilis-11', name: '11-ci sinif Buraxılış', subject: 'DİM Buraxılış Standartı' },
      { id: 'buraxilis-msi', name: 'Mövzu Sınaq (MSİ)', subject: 'Fənn üzrə sınaq' },
      { id: 'buraxilis-usi', name: 'Ümumi Sınaq (ÜSİ)', subject: 'Tam Buraxılış Sınağı' },
    ]
  },
  {
    id: 'mektebdaxili',
    label: 'Məktəbdaxili',
    badge: 'KSQ / BSQ',
    icon: BookOpen,
    items: [
      { id: 'ksq', name: 'KSQ Qiymətləndirmə', subject: 'Kiçik Summativ' },
      { id: 'bsq', name: 'BSQ Qiymətləndirmə', subject: 'Böyük Summativ' },
      { id: 'monitorinq', name: 'Məktəb Monitorinqi', subject: 'Diaqnostik test' },
      { id: 'ibtidai', name: 'İbtidai Siniflər (1-4)', subject: 'Sinif Sınaqları' },
    ]
  },
  {
    id: 'liseyler',
    label: 'Liseylər',
    badge: 'Qəbul Sınaqları',
    icon: Compass,
    items: [
      { id: 'frtl', name: 'FRTL Qəbul Sınağı', subject: 'Fizika-Riyaziyyat' },
      { id: 'kbtl', name: 'KBTL Qəbul Sınağı', subject: 'Kimya-Biologiya' },
      { id: 'herbi', name: 'Hərbi Lisey Qəbul', subject: 'Hərbi Lisey Standartı' },
      { id: 'lisey-5-8', name: '5-8-ci Sinif Qəbul', subject: 'İstedadlı Şagird Sınağı' },
    ]
  }
];

// Configure pdfjs worker to local public path
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export interface OmrQuestionRow {
  number: number;
  type: 'single_choice' | 'numeric_grid' | 'situation';
  selectedAnswer: string; // 'A' | 'B' | 'C' | 'D' | 'E' | string like '0,7896' | written text
  numericColumns: string[]; // 6 items: ['0', ',', '7', '8', '9', '6']
  points: number;
  situation_text?: string;
  question_text?: string;
  situation_model_answer?: string;
  situation_keywords?: string[];
  situation_synonyms?: Record<string, string[]>;
  situation_grading_mode?: 'keywords_10' | 'dim_tiered';
  situation_evaluation?: any;
}

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

interface OmrTestCreatorPageProps {
  user: User;
  onBack?: () => void;
  onSaved?: (test: Test) => void;
}

const ContinuousOmrPdfPage: React.FC<{
  pdfDoc: any;
  pageNum: number;
  scale: number;
}> = ({ pdfDoc, pageNum, scale }) => {
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
          viewport,
        });
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error(`Error rendering page ${pageNum}:`, err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        try { renderTask.cancel(); } catch { }
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

export const OmrTestCreatorPage: React.FC<OmrTestCreatorPageProps> = ({
  user,
  onBack,
  onSaved,
}) => {
  // Test Parameters
  const [title, setTitle] = useState<string>('9-cu sinif Buraxılış - OMR Test');
  const [subject, setSubject] = useState<string>('Riyaziyyat / Ana dili');
  const [gradeGroup, setGradeGroup] = useState<string>('9-cu sinif');
  const [variant, setVariant] = useState<string>('A');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [questionCount, setQuestionCount] = useState<number>(25);

  // Çoxfənli Test Rejimi (Tələb 1, 2, 3)
  const [isMultiSubject, setIsMultiSubject] = useState<boolean>(false);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectConfig[]>([
    { subject: 'Azərbaycan dili', questionCount: 15 },
    { subject: 'Riyaziyyat', questionCount: 15 },
  ]);

  // 5 & 6. ƏSAS MENYU (Blok, Buraxılış, Məktəbdaxili, Liseylər)
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

  // Column Mode: Dəqiq 3 sütun (Standart rejim)
  const [columnMode, setColumnMode] = useState<3 | 2 | 1>(3);

  // OMR Answer Key Rows (1 to questionCount)
  const [omrRows, setOmrRows] = useState<OmrQuestionRow[]>(() => {
    try {
      const saved = localStorage.getItem('edunex_omr_standalone_answers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r: any) => ({
            ...r,
            type: r.type || 'single_choice',
            numericColumns: r.numericColumns || parseStringToColumns(r.selectedAnswer || ''),
          }));
        }
      }
    } catch { }
    return Array.from({ length: 25 }, (_, i) => ({
      number: i + 1,
      type: 'single_choice',
      selectedAnswer: '',
      numericColumns: ['', '', '', '', '', ''],
      points: 4,
    }));
  });

  // Student Answers (for simulation/testing)
  const [studentAnswers, setStudentAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('edunex_omr_standalone_student');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Active view tab for right column: 'teacher_key' or 'student_omr'
  const [activeOmrTab, setActiveOmrTab] = useState<'teacher_key' | 'student_omr'>('teacher_key');

  // Document Viewer State (PDF & Word)
  const [documentType, setDocumentType] = useState<'pdf' | 'docx' | 'none'>('none');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [wordHtmlContent, setWordHtmlContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // PDF Viewer State
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.25);
  const [docLoading, setDocLoading] = useState<boolean>(false);
  const [docError, setDocError] = useState<string>('');

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string>>({});
  const [showSnippetModal, setShowSnippetModal] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize omrRows length when questionCount changes
  const handleQuestionCountChange = (count: number) => {
    const validCount = Math.max(1, Math.min(100, count));
    setQuestionCount(validCount);
    setOmrRows(prev => {
      const updated = Array.from({ length: validCount }, (_, i) => {
        const existing = prev.find(r => r.number === i + 1);
        return existing || {
          number: i + 1,
          type: 'single_choice' as const,
          selectedAnswer: '',
          numericColumns: ['', '', '', '', '', ''],
          points: 4
        };
      });
      return updated;
    });
  };

  // Persist answers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('edunex_omr_standalone_answers', JSON.stringify(omrRows));
    } catch { }
  }, [omrRows]);

  useEffect(() => {
    try {
      localStorage.setItem('edunex_omr_standalone_student', JSON.stringify(studentAnswers));
    } catch { }
  }, [studentAnswers]);

  // Load PDF from ArrayBuffer
  const loadPdfFromBuffer = async (buffer: ArrayBuffer, name: string) => {
    try {
      setDocLoading(true);
      setDocError('');
      setFileName(name);
      setDocumentType('pdf');

      const loadingTask = pdfjsLib.getDocument({
        data: buffer,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });
      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      setDocError(err.message || 'PDF sənədi oxuna bilmədi');
    } finally {
      setDocLoading(false);
    }
  };

  // Process Document File (PDF or Word DOC/DOCX)
  const processAndUploadFile = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isPdf = lowerName.endsWith('.pdf');
    const isDocx = lowerName.endsWith('.docx') || lowerName.endsWith('.doc');

    if (!isPdf && !isDocx) {
      alert('Yalnız PDF və ya Word (.docx, .doc) formatında sənədlər qəbul edilir.');
      return;
    }

    try {
      setUploadingDoc(true);
      setDocLoading(true);
      setDocError('');
      setFileName(file.name);

      // 1. Read array buffer for local viewer
      const arrayBuffer = await file.arrayBuffer();

      if (isPdf) {
        await loadPdfFromBuffer(arrayBuffer, file.name);
      } else if (isDocx) {
        setDocumentType('docx');
        try {
          const res = await mammoth.convertToHtml({ arrayBuffer });
          setWordHtmlContent(res.value);
        } catch (mErr) {
          console.warn('Word conversion fallback', mErr);
          setWordHtmlContent(`<div class="p-6 text-slate-700"><strong>${file.name}</strong> sənədi yükləndi.</div>`);
        }
      }

      // 2. Upload to server to get permanent server URL
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadRes = await api.uploadDocument(file.name, base64Data);
      if (uploadRes && uploadRes.url) {
        setDocumentUrl(uploadRes.url);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setDocError('Sənəd yüklənərkən xəta: ' + (err.message || ''));
    } finally {
      setUploadingDoc(false);
      setDocLoading(false);
    }
  };

  // Load sample PDF initially if no document is loaded
  useEffect(() => {
    const loadSample = async () => {
      try {
        const response = await fetch('/sample_exam.pdf');
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          await loadPdfFromBuffer(buffer, 'RFO-I-tur-Riyaziyyat-XI-sinif.pdf');
          setDocumentUrl('/sample_exam.pdf');
        }
      } catch (e) {
        console.warn('Sample PDF could not be loaded automatically', e);
      }
    };
    loadSample();
  }, []);

  // Handle local file selection via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  // Render current PDF page on canvas
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
      console.error('Error rendering PDF page:', err);
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    if (documentType === 'pdf') {
      renderCurrentPage();
    }
  }, [renderCurrentPage, documentType]);

  // Render Preview modal PDF
  useEffect(() => {
    if (showPreviewModal && pdfDoc && previewCanvasRef.current) {
      pdfDoc.getPage(currentPage).then((page) => {
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = previewCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        page.render({ canvasContext: ctx, viewport }).promise.catch(console.error);
      });
    }
  }, [showPreviewModal, pdfDoc, currentPage]);

  // Teacher selects answer for question №
  const handleTeacherSelect = (num: number, letter: string) => {
    setOmrRows(prev =>
      prev.map(row => {
        if (row.number === num) {
          const nextVal = row.selectedAnswer === letter ? '' : letter;
          return { ...row, selectedAnswer: nextVal };
        }
        return row;
      })
    );
  };

  // Student selects answer for question №
  const handleStudentSelect = (num: number, letter: string) => {
    setStudentAnswers(prev => {
      const current = prev[num];
      const nextVal = current === letter ? '' : letter;
      return { ...prev, [num]: nextVal };
    });
  };

  // Clear all selections
  const handleClearTeacherKeys = () => {
    if (confirm('Bütün düzgün cavab açarlarını sıfırlamaq istəyirsiniz?')) {
      setOmrRows(prev => prev.map(r => ({ ...r, selectedAnswer: '' })));
    }
  };

  const handleClearStudentAnswers = () => {
    if (confirm('Bütün şagird cavablarını təmizləmək istəyirsiniz?')) {
      setStudentAnswers({});
    }
  };

  // Quick auto-fill random keys for testing / speed
  const handleQuickFill = () => {
    const variants = ['A', 'B', 'C', 'D', 'E'];
    setOmrRows(prev =>
      prev.map(r => {
        if (r.type === 'numeric_grid') {
          const sampleDigits = ['0', ',', '2', '5', '', ''];
          return {
            ...r,
            selectedAnswer: sampleDigits.join(''),
            numericColumns: sampleDigits
          };
        }
        return {
          ...r,
          selectedAnswer: variants[Math.floor(Math.random() * variants.length)]
        };
      })
    );
  };

  // 6. OMR MENYUSUNA AÇIQ SUAL ƏLAVƏ ET FUNKSİYASI
  const handleAddOpenQuestion = () => {
    setOmrRows(prev => {
      const nextNum = prev.length + 1;
      const newRow: OmrQuestionRow = {
        number: nextNum,
        type: 'numeric_grid',
        selectedAnswer: '',
        numericColumns: ['', '', '', '', '', ''],
        points: 4,
      };
      return [...prev, newRow];
    });
    setQuestionCount(prev => prev + 1);
  };

  // Açıq sualı və ya qeyd olunan sualı sil
  const handleDeleteQuestion = (qNum: number) => {
    setOmrRows(prev => {
      const filtered = prev.filter(r => r.number !== qNum);
      return filtered.map((r, idx) => ({
        ...r,
        number: idx + 1
      }));
    });
    setQuestionCount(prev => Math.max(1, prev - 1));

    // Clear and re-index student and preview answers
    setStudentAnswers(prev => {
      const next: Record<number, string> = {};
      let targetIdx = 1;
      for (let i = 1; i <= questionCount; i++) {
        if (i !== qNum) {
          if (prev[i] !== undefined) next[targetIdx] = prev[i];
          targetIdx++;
        }
      }
      return next;
    });

    setPreviewAnswers(prev => {
      const next: Record<number, string> = {};
      let targetIdx = 1;
      for (let i = 1; i <= questionCount; i++) {
        if (i !== qNum) {
          if (prev[i] !== undefined) next[targetIdx] = prev[i];
          targetIdx++;
        }
      }
      return next;
    });
  };

  // Situasiya Tipli Sual State və Handlers (Tələb 1, 2, 5)
  const [showSituationModal, setShowSituationModal] = useState<boolean>(false);
  const [editingSituationNumber, setEditingSituationNumber] = useState<number | null>(null);
  const [situationDeleteConfirmNum, setSituationDeleteConfirmNum] = useState<number | null>(null);

  // Situasiya sualı əlavə et
  const handleAddSituationQuestion = () => {
    setEditingSituationNumber(null);
    setShowSituationModal(true);
  };

  // Situasiya sualını redaktə et
  const handleEditSituationQuestion = (qNum: number) => {
    setEditingSituationNumber(qNum);
    setShowSituationModal(true);
  };

  // Situasiya sualını saxla
  const handleSaveSituationModal = (data: Partial<Question>) => {
    if (editingSituationNumber) {
      // Update existing
      setOmrRows(prev =>
        prev.map(r => {
          if (r.number === editingSituationNumber) {
            return {
              ...r,
              type: 'situation',
              points: data.points || 6,
              situation_text: data.situation_text,
              question_text: data.question_text,
              situation_model_answer: data.situation_model_answer,
              situation_keywords: data.situation_keywords,
              situation_synonyms: data.situation_synonyms,
              situation_grading_mode: data.situation_grading_mode,
            };
          }
          return r;
        })
      );
    } else {
      // Add new
      const nextNum = omrRows.length + 1;
      const newRow: OmrQuestionRow = {
        number: nextNum,
        type: 'situation',
        selectedAnswer: '',
        numericColumns: [],
        points: data.points || 6,
        situation_text: data.situation_text,
        question_text: data.question_text,
        situation_model_answer: data.situation_model_answer,
        situation_keywords: data.situation_keywords,
        situation_synonyms: data.situation_synonyms,
        situation_grading_mode: data.situation_grading_mode,
      };
      setOmrRows(prev => [...prev, newRow]);
      setQuestionCount(prev => prev + 1);
    }
  };

  // Sonuncu açıq sualı sil
  const handleDeleteLastOpenQuestion = () => {
    const openQuestions = omrRows.filter(r => r.type === 'numeric_grid' || r.type === 'situation');
    if (openQuestions.length > 0) {
      const lastOpen = openQuestions[openQuestions.length - 1];
      handleDeleteQuestion(lastOpen.number);
    }
  };

  // Format dəyiş: A-E rejimi ↔ Açıq sual rejimi
  const handleToggleQuestionType = (qNum: number) => {
    setOmrRows(prev =>
      prev.map(r => {
        if (r.number === qNum) {
          const nextType = r.type === 'numeric_grid' ? 'single_choice' : 'numeric_grid';
          return {
            ...r,
            type: nextType,
            selectedAnswer: '',
            numericColumns: ['', '', '', '', '', ''],
          };
        }
        return r;
      })
    );
  };

  // 7. RƏQƏMLİ OMR CAVAB KARTI - DƏQİQ 6 SÜTUN (Bubble click)
  const handleNumericBubbleClick = (qNum: number, colIdx: number, char: string, isTeacher: boolean) => {
    if (isTeacher) {
      setOmrRows(prev =>
        prev.map(r => {
          if (r.number === qNum) {
            const newCols = [...(r.numericColumns || ['', '', '', '', '', ''])];
            newCols[colIdx] = newCols[colIdx] === char ? '' : char;
            return {
              ...r,
              numericColumns: newCols,
              selectedAnswer: newCols.join(''),
            };
          }
          return r;
        })
      );
    } else {
      setStudentAnswers(prev => {
        const currentAns = prev[qNum] || '';
        const currentCols = parseStringToColumns(currentAns);
        currentCols[colIdx] = currentCols[colIdx] === char ? '' : char;
        return { ...prev, [qNum]: currentCols.join('') };
      });
    }
  };

  // Rəqəmi birinci sətrdəki xanaya əllə yazdıqda müvafiq dairə qaralır
  const handleNumericBoxInput = (qNum: number, colIdx: number, inputChar: string, isTeacher: boolean) => {
    let val = inputChar.slice(-1);
    if (val === '.') val = ',';
    if (val !== '' && !DIGIT_ROWS.includes(val)) return;

    if (isTeacher) {
      setOmrRows(prev =>
        prev.map(r => {
          if (r.number === qNum) {
            const newCols = [...(r.numericColumns || ['', '', '', '', '', ''])];
            newCols[colIdx] = val;
            return {
              ...r,
              numericColumns: newCols,
              selectedAnswer: newCols.join(''),
            };
          }
          return r;
        })
      );
    } else {
      setStudentAnswers(prev => {
        const currentAns = prev[qNum] || '';
        const currentCols = parseStringToColumns(currentAns);
        currentCols[colIdx] = val;
        return { ...prev, [qNum]: currentCols.join('') };
      });
    }
  };

  // 8. RƏQƏMLİ CAVABLARIN YOXLAMASI - Müəllim cavabı bütöv şəkildə yazır (Məs: 0,7896 və ya 125)
  const handleNumericWholeInput = (qNum: number, wholeStr: string) => {
    const newCols = parseStringToColumns(wholeStr);
    setOmrRows(prev =>
      prev.map(r => {
        if (r.number === qNum) {
          return {
            ...r,
            selectedAnswer: newCols.join(''),
            numericColumns: newCols,
          };
        }
        return r;
      })
    );
  };

  // ==========================================
  // EXPORT FUNCTIONS: PDF & PRINT
  // ==========================================
  const handleDownloadOmrSheetPdf = () => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    doc.setFontSize(16);
    doc.text('EDUNEX - OMR OPTİK CAVAB KARTI', margin, y + 4);
    y += 10;

    doc.setFontSize(10);
    doc.text(`İmtahan: ${title}`, margin, y);
    y += 5;
    doc.text(`Fənn: ${subject}   |   Sinif: ${gradeGroup}   |   Variant: ${variant}   |   Cəmi Sual: ${questionCount}`, margin, y);
    y += 6;

    doc.rect(margin, y, pageWidth - (margin * 2), 16);
    doc.setFontSize(9);
    doc.text('Şagirdin Adı, Soyadı: ___________________________________________   Sinif: _________   Tarix: ____________', margin + 3, y + 6);
    doc.text('İş nömrəsi (Şagird Kodu): [  ][  ][  ][  ][  ][  ]            İmza: __________________   Toplanan Bal: _______', margin + 3, y + 12);
    y += 22;

    doc.setFontSize(11);
    doc.text('OMR CAVAB FORMASI (Variantı dairə daxilində tam qaralayın):', margin, y);
    y += 6;

    const columns = 3; // Dəqiq 3 sütun (Tələb 4 & 9)
    const perCol = Math.ceil(questionCount / columns);
    const colWidth = (pageWidth - (margin * 2)) / columns;

    doc.setFontSize(9);
    omrRows.forEach((row, idx) => {
      const colIdx = Math.floor(idx / perCol);
      const rowInCol = idx % perCol;
      const x = margin + (colIdx * colWidth);
      const rowY = y + (rowInCol * 7.5);

      const numStr = row.number < 10 ? `0${row.number}` : `${row.number}`;
      doc.text(`${numStr}.`, x, rowY + 3.5);

      if (row.type === 'numeric_grid') {
        doc.setFontSize(6);
        doc.rect(x + 8, rowY + 0.5, 34, 4.5);
        doc.text('6 Sütunlu Rəqəmli Xana', x + 9, rowY + 3.5);
        doc.setFontSize(9);
      } else {
        const letters = ['A', 'B', 'C', 'D', 'E'];
        letters.forEach((l, lIdx) => {
          const bubbleX = x + 9 + (lIdx * 6.5);
          const bubbleY = rowY + 2.5;

          doc.circle(bubbleX, bubbleY, 2.2);
          doc.setFontSize(6.5);
          doc.text(l, bubbleX - 1.1, bubbleY + 0.8);
          doc.setFontSize(9);
        });
      }
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('EDUNEX Quiz Creator - OMR Test Vərəqi Sistemi • Standart 3 Sütunlu Optik Format', margin, 285);

    doc.save(`${title.replace(/[^a-zA-Z0-9_]/g, '_')}_OMR_Cavab_Karti.pdf`);
  };

  const handleDownloadKeyPdf = () => {
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    doc.setFontSize(16);
    doc.text('EDUNEX - DÜZGÜN CAVAB AÇARLARI', margin, y + 4);
    y += 10;

    doc.setFontSize(10);
    doc.text(`İmtahan: ${title}`, margin, y);
    y += 5;
    doc.text(`Fənn: ${subject}   |   Variant: ${variant}   |   Cəmi Sual: ${questionCount}`, margin, y);
    y += 8;

    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    const columns = 3;
    const perCol = Math.ceil(questionCount / columns);
    const colWidth = (pageWidth - (margin * 2)) / columns;

    doc.setFontSize(10);
    omrRows.forEach((row, idx) => {
      const colIdx = Math.floor(idx / perCol);
      const rowInCol = idx % perCol;
      const x = margin + (colIdx * colWidth);
      const rowY = y + (rowInCol * 8.5);

      const typeLabel = row.type === 'numeric_grid' ? '(Açıq)' : '';
      const ans = row.selectedAnswer || '—';
      doc.text(`${row.number}. ${ans} ${typeLabel}`, x, rowY);
    });

    doc.save(`${title.replace(/[^a-zA-Z0-9_]/g, '_')}_Cavab_Acari.pdf`);
  };

  // Save as a Test in EDUNEX system
  const handleSaveToTests = async () => {
    try {
      const totalPoints = omrRows.reduce((sum, r) => sum + (r.points || 4), 0);
      // Compute question-to-subject map for multi-subject tests
      const questionSubjectMap = new Map<number, string>();
      if (isMultiSubject && selectedSubjects.length > 0) {
        let currentNum = 1;
        selectedSubjects.forEach(sub => {
          for (let k = 0; k < sub.questionCount; k++) {
            questionSubjectMap.set(currentNum, sub.subject);
            currentNum++;
          }
        });
      }

      const questionsToSave = omrRows.map((r, i) => ({
        id: `new-omr-${Date.now()}-${r.number}`,
        subject: questionSubjectMap.get(r.number) || (r as any).subject || subject,
        question_text: `Sual №${r.number}`,
        question_type: r.type === 'numeric_grid' ? ('numeric' as const) : ('single_choice' as const),
        options: r.type === 'numeric_grid'
          ? []
          : [
            { id: 'A', text: 'A', is_correct: r.selectedAnswer === 'A' },
            { id: 'B', text: 'B', is_correct: r.selectedAnswer === 'B' },
            { id: 'C', text: 'C', is_correct: r.selectedAnswer === 'C' },
            { id: 'D', text: 'D', is_correct: r.selectedAnswer === 'D' },
            { id: 'E', text: 'E', is_correct: r.selectedAnswer === 'E' },
          ],
        correct_answer: r.selectedAnswer || (r.type === 'numeric_grid' ? '' : 'A'),
        points: r.points || 4,
        order_index: i
      }));

      const finalPdfUrl = documentUrl || (fileName ? `/uploads/${fileName}` : '/sample_exam.pdf');

      const res = await api.createTest({
        teacher_id: user.id,
        title,
        exam_model: 'Buraxılış imtahanı',
        grade_group: gradeGroup,
        subject: isMultiSubject && selectedSubjects.length > 0 ? selectedSubjects.map(s => s.subject).join(', ') : subject,
        topic: fileName || 'OMR Sınaq Testi',
        duration_minutes: durationMinutes,
        total_questions: questionCount,
        total_points: totalPoints,
        grading_rule: 'standard',
        result_display_mode: 'immediate',
        test_mode: 'answered',
        status: 'published',
        questions: questionsToSave,
        pdf_url: finalPdfUrl,
        answer_key_json: JSON.stringify(omrRows.map(r => ({
          number: r.number,
          type: r.type,
          answer: r.selectedAnswer,
          numericColumns: r.numericColumns
        })))
      } as any);

      alert('OMR Test uğurla "Testlərim" bölməsinə yadda saxlanıldı!');
      if (onSaved) onSaved(res as any);
    } catch (err: any) {
      alert('Yadda saxlanılarkən xəta: ' + (err.message || 'Bilinməyən xəta'));
    }
  };

  const answeredCount = omrRows.filter(r => r.selectedAnswer).length;
  const unansweredCount = questionCount - answeredCount;

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden">
      {/* 1. TOP HEADER TOOLBAR */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
              title="Geri qayıt"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                OMR TEST
              </span>
              <span className="text-xs font-bold text-slate-800">
                PDF & Word Sənədli Optik Test Redaktoru
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Sol tərəfdə seçilmiş sənəd tam ölçüdə, sağ tərəfdə 13px A, B, C, D, E cavab cədvəli
            </p>
          </div>
        </div>

        {/* Action Buttons: Fayl Seç, Önizləmə, OMR Kartı Yüklə, Saxla */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingDoc}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            title="Kompüterdən PDF və ya Word sənədi seç"
          >
            {uploadingDoc ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Faylı Seç (PDF/Word)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            title="Şagird interfeysində necə görünəcəyinə bax"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Önizləmə</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToTests}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            title="Testlərim siyahısına əlavə et"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Yadda Saxla</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN SPLIT SCREEN: LEFT DOCUMENT VIEWER + RIGHT OMR ANSWER SHEET */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ==============================================================
            SOL TƏRƏF: SEÇİLMİŞ PDF / WORD SƏNƏDİ TAM GÖSTƏRİLİR
            ============================================================== */}
        <section
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-200 overflow-hidden relative transition-colors ${isDragOver ? 'bg-indigo-50/80 ring-4 ring-indigo-400 ring-inset' : ''
            }`}
        >
          {/* Drag & Drop Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-30 bg-indigo-600/10 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none">
              <UploadCloud className="w-16 h-16 text-indigo-600 animate-bounce mb-3" />
              <p className="text-base font-black text-indigo-900">PDF və ya Word faylını buraya buraxın</p>
              <p className="text-xs text-indigo-700 mt-1">Dəstəklənir: PDF, DOC, DOCX</p>
            </div>
          )}

          {/* Document Top Navigation Toolbar */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs gap-3 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-bold text-slate-800 truncate max-w-xs" title={fileName}>
                {fileName || 'PDF və ya Word sənədi yüklənməyib'}
              </span>
              {documentType === 'pdf' && numPages > 0 && (
                <span className="text-[11px] text-slate-400 font-semibold shrink-0">
                  ({numPages} səhifə)
                </span>
              )}
              {documentType === 'docx' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Word Sənədi
                </span>
              )}
            </div>

            {/* Controls for PDF: Continuous Page indicator, Snippet tool & Zoom */}
            {documentType === 'pdf' && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-800">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Davamlı Baxış ({numPages || 1} Səhifə)</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSnippetModal(true)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                  title="PDF və ya Word sənədindən mətni və ya şəkli kəsib suala əlavə et"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Sənəddən Kəs</span>
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                <button
                  type="button"
                  onClick={() => setScale(s => Math.max(0.6, s - 0.15))}
                  className="p-1 border border-slate-200 hover:bg-slate-50 rounded"
                  title="Kiçilt"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-semibold text-slate-500 w-11 text-center font-bold">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setScale(s => Math.min(2.5, s + 0.15))}
                  className="p-1 border border-slate-200 hover:bg-slate-50 rounded"
                  title="Böyüt"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Document Content View Area (Müstəqil Sürüşdürmə - Tələb 9) */}
          <div className="flex-1 overflow-y-auto overscroll-contain independent-scroll p-4 flex flex-col items-center min-h-0">
            {docLoading && (
              <div className="m-auto flex flex-col items-center justify-center p-12 text-slate-500 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-xs font-bold">Sənəd səhifəsi yüklənir...</span>
              </div>
            )}

            {docError && (
              <div className="m-auto bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{docError}</span>
              </div>
            )}

            {!docLoading && !docError && documentType === 'none' && !pdfDoc && (
              <div className="m-auto bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center max-w-md shadow-sm">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FileUp className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">PDF və ya Word Sənədi Əlavə Edin</h3>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  Faylı buraya sürükləyib buraxın (Drag & Drop) və ya kompüterinizdən seçin.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Faylı Kompüterdən Seç
                </button>
              </div>
            )}

            {/* Word Document Render */}
            {documentType === 'docx' && (
              <div className="bg-white shadow-xl rounded-xl p-8 sm:p-12 max-w-3xl w-full border border-slate-200 font-serif leading-relaxed text-slate-800 prose prose-slate">
                <div dangerouslySetInnerHTML={{ __html: wordHtmlContent }} />
              </div>
            )}

            {/* PDF Canvas Render (Davamlı Multi-Page Sürüşdürmə) */}
            {documentType === 'pdf' && pdfDoc && (
              <div className="flex flex-col items-center w-full max-w-full pb-8">
                {Array.from({ length: numPages || 1 }, (_, i) => i + 1).map((pageNum) => (
                  <ContinuousOmrPdfPage
                    key={pageNum}
                    pdfDoc={pdfDoc}
                    pageNum={pageNum}
                    scale={scale}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ==============================================================
            SAĞ TƏRƏF: OMR CAVAB DÜYMƏLƏRİ (SABİT 3 SÜTUNLU REJİM - Tələb 3, 4)
            ============================================================== */}
        <aside
          className="w-full lg:w-[500px] xl:w-[560px] 2xl:w-[620px] bg-white flex flex-col shrink-0 overflow-hidden shadow-lg z-10 border-l border-slate-200 sticky top-0 right-0 h-full transition-all duration-200"
        >
          {/* Header of Right Panel: Vahid İmtahan Modeli Menyu və İdarəetmə Paneli (Tələb 3, 4, 5, 7) */}
          <div ref={categoryMenuRef} className="px-3 py-2 border-b border-slate-200 bg-slate-50/90 flex flex-col gap-1.5 shrink-0 relative">
            {/* Row 1: Unified Category Dropdown & Question Action Buttons */}
            <div className="flex items-center justify-between gap-2">
              {/* Unified Category Dropdown (Tələb 3: 4 bölmə bir vahid menyu düyməsində) */}
              <div className="relative flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveCategoryMenu(activeCategoryMenu ? null : selectedCategory)}
                  className="w-full h-8 px-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-extrabold text-slate-800 shadow-2xs flex items-center justify-between gap-2 transition-all"
                  title="İmtahan Modeli seçin"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-slate-500 font-semibold shrink-0">Model:</span>
                    <span className="text-indigo-700 font-bold truncate">
                      {OMR_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Buraxılış'} • {selectedSubCategory}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${activeCategoryMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown panel for all 4 category options */}
                {activeCategoryMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="grid grid-cols-2 gap-2">
                      {OMR_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isCatSelected = selectedCategory === cat.id;

                        return (
                          <div key={cat.id} className="border border-slate-100 rounded-lg p-1.5 bg-slate-50/60">
                            <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/60 text-[10px] font-extrabold text-slate-800">
                              <div className="flex items-center gap-1">
                                <Icon className="w-3 h-3 text-indigo-600" />
                                <span>{cat.label}</span>
                              </div>
                              <span className="text-[8.5px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded">{cat.badge}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              {cat.items.map((sub) => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setSelectedSubCategory(sub.name);
                                    setTitle(`${sub.name} - OMR Test`);
                                    setSubject(sub.subject);
                                    setActiveCategoryMenu(null);
                                  }}
                                  className={`w-full text-left px-2 py-1 rounded text-[10px] font-semibold transition-colors flex items-center justify-between ${selectedSubCategory === sub.name
                                      ? 'bg-indigo-600 text-white font-bold'
                                      : 'text-slate-700 hover:bg-slate-200/70'
                                    }`}
                                >
                                  <span className="truncate">{sub.name}</span>
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

              {/* Action Buttons: Vahid Ölçülü Düymələr (Tələb 7) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMultiSubject(!isMultiSubject)}
                  className={`h-8 px-2.5 rounded-lg font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isMultiSubject
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                  title="Çoxfənli OMR test rejimini aç"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isMultiSubject ? 'Çoxfənli' : 'Çoxfənli Seç'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddOpenQuestion}
                  className="h-8 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all"
                  title="Rəqəmli 6-sütunlu açıq sual əlavə et"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Açıq sual</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddSituationQuestion}
                  className="h-8 px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all"
                  title="Situasiya tipli sual əlavə et"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>+ Situasiya</span>
                </button>
              </div>
            </div>

            {/* Row 2: Parameters (Duration, Question Count) + Mode Switcher + Clear (Tələb 1: Sil düyməsi ləğv edildi, Tələb 2: Təsadüfi silindi) */}
            <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-slate-200/70">
              <div className="flex items-center gap-2 text-slate-600 font-semibold text-[11px]">
                <label className="flex items-center gap-1">
                  <span>Müddət:</span>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 45)}
                    className="w-12 h-6 px-1 bg-white border border-slate-300 rounded text-center text-[11px] font-bold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none"
                    title="İmtahan müddəti (dəqiqə)"
                  />
                  <span>dəq</span>
                </label>
                <span className="text-slate-300">|</span>
                <label className="flex items-center gap-1">
                  <span>Sual:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={questionCount}
                    onChange={(e) => handleQuestionCountChange(parseInt(e.target.value) || 25)}
                    className="w-14 h-6 px-1 bg-white border border-indigo-300 focus:border-indigo-600 focus:outline-none rounded text-center text-[11px] font-black text-indigo-700 font-mono shadow-2xs"
                    title="Sual sayı (1-100)"
                  />
                </label>
                <span className="text-slate-300">|</span>
                {unansweredCount > 0 ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    {unansweredCount} boş
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Tam doldurulub
                  </span>
                )}
              </div>

              {/* Mode Switcher + Sıfırla (Təsadüfi silindi - Tələb 2) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center p-0.5 bg-slate-200 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveOmrTab('teacher_key')}
                    className={`h-6 px-2 rounded font-bold transition-all ${activeOmrTab === 'teacher_key'
                        ? 'bg-white text-emerald-800 shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Açar ({answeredCount}/{questionCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveOmrTab('student_omr')}
                    className={`h-6 px-2 rounded font-bold transition-all ${activeOmrTab === 'student_omr'
                        ? 'bg-white text-indigo-800 shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Şagird ({Object.values(studentAnswers).filter(Boolean).length})
                  </button>
                </div>

                {activeOmrTab === 'teacher_key' && (
                  <button
                    type="button"
                    onClick={handleClearTeacherKeys}
                    className="h-6 px-2 text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                    title="Bütün seçimləri sıfırla"
                  >
                    Sıfırla
                  </button>
                )}

                {activeOmrTab === 'student_omr' && (
                  <button
                    type="button"
                    onClick={handleClearStudentAnswers}
                    className="h-6 px-2 text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                  >
                    Təmizlə
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Çoxfənli OMR Seçim Paneli (Tələb 1, 2, 3) */}
          {isMultiSubject && (
            <div className="p-2 bg-slate-50 border-b border-slate-200">
              <MultiSubjectSelector
                selectedSubjects={selectedSubjects}
                onChange={(newSubs) => {
                  setSelectedSubjects(newSubs);
                  const count = newSubs.reduce((sum, s) => sum + (s.questionCount || 0), 0);
                  if (count > 0) {
                    handleQuestionCountChange(count);
                  }
                }}
              />
            </div>
          )}

          {/* OMR Question Rows: DƏQİQ SEKSİYALI SƏLİQƏLİ NİZAMLAMA (Qapalı 3 sütun + Açıq 6-sütunlu grid + Situasiya) */}
          <div className="flex-1 overflow-y-auto overscroll-contain independent-scroll p-3 scrollbar-thin min-h-0">
            {(() => {
              const closedRows = omrRows.filter(r => r.type === 'single_choice');
              const openRows = omrRows.filter(r => r.type === 'numeric_grid');
              const situationRows = omrRows.filter(r => r.type === 'situation');

              const numCols = 3;
              const perCol = Math.ceil(closedRows.length / numCols);
              const columnSlices = Array.from({ length: numCols }, (_, colIdx) => {
                return closedRows.slice(colIdx * perCol, (colIdx + 1) * perCol);
              });

              return (
                <div className="flex flex-col gap-3.5">
                  {/* 1. QAPALI SUALLAR - DƏQİQ VƏ BƏRABƏR 3 SÜTUNLU OPTİK QABARCIQLAR */}
                  {closedRows.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                          Qapalı Suallar (1 - {closedRows.length})
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          3 Sütunlu Standart A-E
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-stretch">
                        {columnSlices.map((colRows, colIdx) => (
                          <div key={colIdx} className="omr-column-card h-full min-h-full">
                            <div className="flex flex-col gap-0.5">
                              {colRows.map((row) => {
                                const currentChoice = activeOmrTab === 'teacher_key'
                                  ? row.selectedAnswer
                                  : (studentAnswers[row.number] || '');

                                return (
                                  <div
                                    key={row.number}
                                    className={`px-2 py-0.5 rounded-md border flex items-center justify-center gap-2 transition-colors ${currentChoice
                                      ? 'bg-emerald-50/60 border-emerald-300'
                                      : 'bg-white border-slate-200 hover:border-slate-300'
                                      }`}
                                  >
                                    {/* Sual nömrəsi */}
                                    <div className="flex items-center gap-0.5 shrink-0 min-w-[20px] text-right justify-end">
                                      <span className="font-mono font-bold text-[10px] text-slate-800">
                                        {row.number < 10 ? `0${row.number}` : row.number}.
                                      </span>
                                      {currentChoice && (
                                        <span className="text-[8.5px] font-black text-emerald-700 bg-emerald-100 px-0.5 rounded leading-none">
                                          {currentChoice}
                                        </span>
                                      )}
                                    </div>

                                    {/* A, B, C, D, E Circular Buttons */}
                                    <div className="omr-bubble-row shrink-0" role="radiogroup">
                                      {['A', 'B', 'C', 'D', 'E'].map((letter) => {
                                        const isSelected = currentChoice === letter;
                                        return (
                                          <button
                                            key={letter}
                                            type="button"
                                            onClick={() => {
                                              if (activeOmrTab === 'teacher_key') {
                                                handleTeacherSelect(row.number, letter);
                                              } else {
                                                handleStudentSelect(row.number, letter);
                                              }
                                            }}
                                            className={`omr-bubble-btn ${isSelected ? 'omr-selected' : ''}`}
                                            title={`Sual ${row.number}: ${letter}`}
                                            aria-label={`Sual ${row.number} Variant ${letter}`}
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
                    </div>
                  )}

                  {/* 2. AÇIQ SUALLAR (RƏQƏMLİ 6-SÜTUNLU GRİD) - YANAŞI 2 SÜTUN */}
                  {openRows.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-200 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                          <Plus className="w-3 h-3 text-indigo-600" />
                          Açıq Cavablı Suallar ({openRows.length})
                        </span>
                        <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                          6-Sütunlu Rəqəm Matrisi
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {openRows.map((row) => {
                          const studentCols = parseStringToColumns(studentAnswers[row.number] || '');
                          const currentCols = activeOmrTab === 'teacher_key'
                            ? (row.numericColumns || ['', '', '', '', '', ''])
                            : studentCols;
                          const currentChoice = activeOmrTab === 'teacher_key'
                            ? row.selectedAnswer
                            : (studentAnswers[row.number] || '');

                          return (
                            <div
                              key={row.number}
                              className="w-full bg-slate-50 border-2 border-indigo-200 rounded-xl p-2 flex flex-col gap-1.5 shadow-2xs"
                            >
                              {/* Header */}
                              <div className="flex items-center justify-between pb-1 border-b border-indigo-100 text-[10px]">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-slate-800">
                                    {row.number < 10 ? `0${row.number}` : row.number}.
                                  </span>
                                  <span className="bg-indigo-100 text-indigo-800 font-extrabold px-1.5 py-0.2 rounded text-[8.5px]">
                                    Açıq Sual
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {currentChoice && (
                                    <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded text-[9px]">
                                      {currentChoice}
                                    </span>
                                  )}
                                  {activeOmrTab === 'teacher_key' && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleQuestionType(row.number)}
                                      className="text-[8.5px] text-slate-400 hover:text-indigo-600 underline"
                                      title="A-E variantına keç"
                                    >
                                      A-E
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(row.number)}
                                    className="px-1.5 py-0.5 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 rounded transition-colors flex items-center gap-0.5 text-[9px] font-bold shadow-2xs"
                                    title={`Açıq sual №${row.number}-i sil`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Sil</span>
                                  </button>
                                </div>
                              </div>

                              {/* Teacher whole input */}
                              {activeOmrTab === 'teacher_key' && (
                                <div className="flex items-center gap-1.5 text-[9px]">
                                  <span className="text-slate-500 font-semibold shrink-0">Cavab:</span>
                                  <input
                                    type="text"
                                    value={row.selectedAnswer}
                                    onChange={(e) => handleNumericWholeInput(row.number, e.target.value)}
                                    placeholder="Məs: 0,7896"
                                    maxLength={6}
                                    className="w-full px-2 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-indigo-700 text-[10px] focus:border-indigo-500 focus:outline-none"
                                  />
                                </div>
                              )}

                              {/* Dəqiq 6 Sütun x 12 Sətir Grid */}
                              <div className="flex justify-center pt-0.5">
                                <div className="omr-numeric-grid">
                                  {[0, 1, 2, 3, 4, 5].map((cIdx) => {
                                    const colVal = currentCols[cIdx] || '';
                                    return (
                                      <div key={cIdx} className="omr-numeric-col">
                                        {/* Sətir 1: Boş xana */}
                                        <input
                                          type="text"
                                          maxLength={1}
                                          value={colVal}
                                          onChange={(e) => handleNumericBoxInput(row.number, cIdx, e.target.value, activeOmrTab === 'teacher_key')}
                                          className="omr-numeric-box"
                                        />
                                        {/* Sətir 2-12: 0..9 və Vergül (,) */}
                                        {DIGIT_ROWS.map((ch) => {
                                          const isSelected = colVal === ch;
                                          return (
                                            <button
                                              key={ch}
                                              type="button"
                                              onClick={() => handleNumericBubbleClick(row.number, cIdx, ch, activeOmrTab === 'teacher_key')}
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

                  {/* 3. SİTUASİYA SUALLARI - TAM ENLİ KARTLAR */}
                  {situationRows.length > 0 && (
                    <div className="pt-2.5 border-t border-amber-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-amber-600" />
                          Situasiya Sualları ({situationRows.length})
                        </span>
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                          Mətn və Meyar Əsaslı
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {situationRows.map((row) => {
                          const studentText = studentAnswers[row.number] || '';
                          const isTeacher = activeOmrTab === 'teacher_key';

                          return (
                            <div
                              key={row.number}
                              className="bg-gradient-to-b from-amber-50/70 to-white border-2 border-amber-300 rounded-xl p-3 flex flex-col gap-2 shadow-2xs"
                            >
                              {/* Header */}
                              <div className="flex items-center justify-between pb-1.5 border-b border-amber-200 text-[10.5px]">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-slate-800">
                                    {row.number < 10 ? `0${row.number}` : row.number}.
                                  </span>
                                  <span className="bg-amber-100 text-amber-900 border border-amber-200 font-extrabold px-1.5 py-0.2 rounded text-[8.5px] flex items-center gap-0.5">
                                    <Layers className="w-2.5 h-2.5 text-amber-700" />
                                    Situasiya
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-500">
                                    {row.points || 6} bal
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEditSituationQuestion(row.number)}
                                    className="px-2 py-0.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors flex items-center gap-0.5 text-[9.5px] font-bold border border-indigo-200"
                                    title="Situasiya mətni, 10 açar söz və meyarları redaktə et"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Redaktə</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setSituationDeleteConfirmNum(row.number)}
                                    className="px-2 py-0.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors flex items-center gap-0.5 text-[9.5px] font-bold border border-rose-200"
                                    title="Situasiya sualını sil"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Sil</span>
                                  </button>
                                </div>
                              </div>

                              {/* Situation text / question snippet */}
                              <div className="text-[10px] text-slate-700 leading-relaxed bg-white/90 p-2 rounded-lg border border-amber-100 font-sans">
                                {row.situation_text ? (
                                  <span><strong>Situasiya:</strong> {row.situation_text}</span>
                                ) : (
                                  <span className="italic text-slate-400">Situasiya mətni daxil edilməyib. 'Redaktə' düyməsinə klikləyin.</span>
                                )}
                              </div>

                              {row.question_text && (
                                <div className="text-[10px] text-slate-900 font-semibold px-1">
                                  <span>Sual: {row.question_text}</span>
                                </div>
                              )}

                              {/* Teacher View: 10 Keywords summary & Model answer */}
                              {isTeacher ? (
                                <div className="flex flex-col gap-1 text-[9.5px] pt-1.5 border-t border-amber-100">
                                  <div className="flex items-center justify-between text-slate-500">
                                    <span>Model: <strong>{row.situation_grading_mode === 'dim_tiered' ? 'DİM tipli' : '10 Açar söz'}</strong></span>
                                    <span className="font-mono text-indigo-700 font-bold">
                                      {(row.situation_keywords || []).filter(k => k && k.trim()).length}/10 açar söz
                                    </span>
                                  </div>
                                  {row.situation_model_answer && (
                                    <div className="text-[9px] text-emerald-800 bg-emerald-50/80 p-1.5 rounded border border-emerald-200">
                                      <strong>Etalon Cavab:</strong> {row.situation_model_answer}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* Student View: Written Answer Textarea */
                                <div className="flex flex-col gap-1 pt-1.5 border-t border-amber-100">
                                  <label className="text-[9.5px] font-bold text-slate-600">
                                    Şagirdin Yazılı Cavabı:
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={studentText}
                                    onChange={(e) => handleStudentSelect(row.number, e.target.value)}
                                    placeholder="Şagirdin yazılı cavabını daxil edin..."
                                    className="w-full px-2 py-1.5 text-[10.5px] bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 resize-none font-sans"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </aside>
      </div>

      {/* ==============================================================
          PREVIEW MODAL: ŞAGİRD İNTERFEYSİ İLƏ EYNİ GÖRÜNÜŞ
          ============================================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold">
                  Şagird İmtahan Baxışı (Önizləmə): {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Left Document + Right OMR */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
              {/* Left Doc in preview */}
              <div className="flex-1 overflow-y-auto overscroll-contain independent-scroll p-4 flex justify-center items-start border-r border-slate-200 bg-slate-200 min-h-0">
                {documentType === 'docx' ? (
                  <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl w-full text-slate-800 prose prose-slate">
                    <div dangerouslySetInnerHTML={{ __html: wordHtmlContent }} />
                  </div>
                ) : (
                  <canvas ref={previewCanvasRef} className="bg-white shadow-md rounded" />
                )}
              </div>

              {/* Right OMR bubbles in preview (3 Sütun Qapalı + 2 Sütun Açıq Suallar) */}
              <div className="w-full lg:w-[520px] xl:w-[560px] 2xl:w-[600px] bg-white flex flex-col p-3 overflow-y-auto overscroll-contain independent-scroll shrink-0 border-l border-slate-200 min-h-0">
                <div className="mb-2 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800">Optik Cavab Forması</h4>
                  <span className="text-[11px] font-bold text-slate-500">
                    Cavablandırılıb: {Object.keys(previewAnswers).length} / {questionCount}
                  </span>
                </div>

                {(() => {
                  const closedRows = omrRows.filter(r => r.type === 'single_choice');
                  const openRows = omrRows.filter(r => r.type === 'numeric_grid');
                  const situationRows = omrRows.filter(r => r.type === 'situation');

                  const numCols = 3;
                  const perCol = Math.ceil(closedRows.length / numCols);
                  const columnSlices = Array.from({ length: numCols }, (_, colIdx) =>
                    closedRows.slice(colIdx * perCol, (colIdx + 1) * perCol)
                  );

                  return (
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto scrollbar-thin p-1">
                      {/* 1. QAPALI SUALLAR - DƏQİQ 3 SÜTUN VƏ BƏRABƏR BOŞLUQ */}
                      {closedRows.length > 0 && (
                        <div className="grid grid-cols-3 gap-1.5 items-stretch">
                          {columnSlices.map((colRows, colIdx) => (
                            <div key={colIdx} className="omr-column-card">
                              <div className="flex flex-col gap-0.5">
                                {colRows.map((r) => {
                                  const ans = previewAnswers[r.number];
                                  return (
                                    <div
                                      key={r.number}
                                      className={`px-1.5 py-0.5 rounded-md border flex items-center justify-between transition-colors ${ans ? 'bg-emerald-50/60 border-emerald-400' : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                      <div className="flex items-center gap-0.5 shrink-0 min-w-[22px] text-right justify-end">
                                        <span className="font-mono font-bold text-[10px] text-slate-800">
                                          {r.number < 10 ? `0${r.number}` : r.number}.
                                        </span>
                                        {ans && (
                                          <span className="text-[8px] font-black text-emerald-700 bg-emerald-100 px-0.5 rounded leading-none">
                                            {ans}
                                          </span>
                                        )}
                                      </div>

                                      <div className="omr-bubble-row shrink-0 flex items-center gap-[2.5px]">
                                        {['A', 'B', 'C', 'D', 'E'].map((l) => (
                                          <button
                                            key={l}
                                            type="button"
                                            onClick={() => setPreviewAnswers(prev => ({ ...prev, [r.number]: prev[r.number] === l ? '' : l }))}
                                            className={`omr-bubble-btn ${ans === l ? 'omr-selected' : ''}`}
                                            title={`Sual ${r.number}: Variant ${l}`}
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
                      )}

                      {/* 2. AÇIQ SUALLAR (RƏQƏMLİ) - DƏQİQ 2 SÜTUN (Yanaşı yerləşmə) */}
                      {openRows.length > 0 && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-[10px] font-extrabold text-indigo-900 block mb-1.5 uppercase tracking-wider">
                            Açıq Cavablı Suallar ({openRows.length})
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {openRows.map((r) => {
                              const studentCols = parseStringToColumns(previewAnswers[r.number] || '');
                              return (
                                <div key={r.number} className="p-2 rounded-xl border-2 border-indigo-200 bg-slate-50 flex flex-col gap-1 shadow-2xs">
                                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-indigo-100">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono font-bold text-slate-800 shrink-0 min-w-[28px]">{r.number}.</span>
                                      <span className="bg-indigo-100 text-indigo-800 font-extrabold px-1.5 py-0.2 rounded text-[8.5px]">Açıq Sual</span>
                                    </div>
                                    {previewAnswers[r.number] && (
                                      <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded text-[9px]">
                                        {previewAnswers[r.number]}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex justify-center pt-0.5">
                                    <div className="omr-numeric-grid">
                                      {[0, 1, 2, 3, 4, 5].map((cIdx) => {
                                        const colVal = studentCols[cIdx] || '';
                                        return (
                                          <div key={cIdx} className="omr-numeric-col">
                                            <input
                                              type="text"
                                              value={colVal}
                                              maxLength={1}
                                              readOnly
                                              className="omr-numeric-box"
                                            />
                                            {DIGIT_ROWS.map((ch) => {
                                              const isSelected = colVal === ch;
                                              return (
                                                <button
                                                  key={ch}
                                                  type="button"
                                                  onClick={() => {
                                                    const newCols = [...studentCols];
                                                    newCols[cIdx] = newCols[cIdx] === ch ? '' : ch;
                                                    setPreviewAnswers(prev => ({ ...prev, [r.number]: newCols.join('') }));
                                                  }}
                                                  className={`omr-numeric-bubble ${isSelected ? 'omr-selected' : ''}`}
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
                      {situationRows.length > 0 && (
                        <div className="pt-2 border-t border-amber-200 flex flex-col gap-2">
                          <span className="text-[10px] font-extrabold text-amber-900 block mb-0.5 uppercase tracking-wider">
                            Situasiya Sualları ({situationRows.length})
                          </span>
                          {situationRows.map((r) => {
                            const ans = previewAnswers[r.number];
                            return (
                              <div key={r.number} className="p-2.5 rounded-xl border-2 border-amber-300 bg-amber-50/50 flex flex-col gap-1.5 shadow-2xs">
                                <div className="flex items-center justify-between text-[11px] pb-1 border-b border-amber-200">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-slate-800 shrink-0 min-w-[28px]">{r.number}.</span>
                                    <span className="bg-amber-100 text-amber-900 border border-amber-200 font-extrabold px-1.5 py-0.2 rounded text-[8.5px] flex items-center gap-0.5">
                                      <Layers className="w-2.5 h-2.5 text-amber-700" />
                                      Situasiya
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                                    {r.situation_grading_mode === 'dim_tiered' ? 'DİM Modeli' : '10 Açar Söz'} • {r.points || 6} bal
                                  </span>
                                </div>

                                {r.situation_text && (
                                  <p className="text-[10px] text-slate-700 leading-relaxed bg-white/90 p-1.5 rounded-lg border border-amber-100 font-sans">
                                    <strong>Situasiya:</strong> {r.situation_text}
                                  </p>
                                )}

                                {r.question_text && (
                                  <p className="text-[10px] text-slate-900 font-bold px-0.5">
                                    {r.question_text}
                                  </p>
                                )}

                                <div className="flex flex-col gap-1 pt-1 border-t border-amber-200/60">
                                  <span className="text-[9.5px] font-bold text-slate-600">
                                    Yazılı Cavab Sahəsi:
                                  </span>
                                  <textarea
                                    rows={2}
                                    value={ans || ''}
                                    onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [r.number]: e.target.value }))}
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
                })()}              </div>
            </div>
          </div>
        </div>
      )}



      {/* Situation Question Modal (Tələb 1, 2) */}
      <SituationQuestionModal
        isOpen={showSituationModal}
        onClose={() => {
          setShowSituationModal(false);
          setEditingSituationNumber(null);
        }}
        onSave={handleSaveSituationModal}
        initialQuestion={
          editingSituationNumber
            ? (() => {
              const target = omrRows.find(r => r.number === editingSituationNumber);
              if (!target) return null;
              return {
                question_type: 'situation',
                situation_text: target.situation_text,
                question_text: target.question_text,
                points: target.points,
                correct_answer: target.situation_model_answer,
                situation_model_answer: target.situation_model_answer,
                situation_keywords: target.situation_keywords,
                situation_synonyms: target.situation_synonyms,
                situation_grading_mode: target.situation_grading_mode,
              };
            })()
            : null
        }
        questionNumber={editingSituationNumber || omrRows.length + 1}
        onDelete={
          editingSituationNumber
            ? () => setSituationDeleteConfirmNum(editingSituationNumber)
            : undefined
        }
      />

      {/* Delete Confirmation Modal for Situation Question (Tələb 5: Təsdiq olmadan silinməsin) */}
      {situationDeleteConfirmNum !== null && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900 mb-1">
              Situasiya sualını silmək istəyirsiniz?
            </h4>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Sual №<strong>{situationDeleteConfirmNum}</strong> və ona aid 10 açar söz siyahıdan silinəcək və sonrakı suallar avtomatik yenidən nömrələnəcək.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSituationDeleteConfirmNum(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                İmtina
              </button>
              <button
                type="button"
                onClick={() => {
                  const num = situationDeleteConfirmNum;
                  setSituationDeleteConfirmNum(null);
                  handleDeleteQuestion(num);
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
        defaultDocUrl={pdfDoc ? undefined : '/sample_exam.pdf'}
        onClose={() => setShowSnippetModal(false)}
        onInsert={(tgt, content, type) => {
          if (tgt === 'situation') {
            setShowSituationModal(true);
          } else {
            alert('Kəsilmiş məlumat yadda saxlanıldı! Situasiya və ya açıq sualda istifadə edə bilərsiniz.');
          }
        }}
        allowSituation={true}
      />
    </div>
  );
};
