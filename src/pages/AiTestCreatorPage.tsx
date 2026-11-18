// src/pages/AiTestCreatorPage.tsx
// Yenidən qurulmuş EDUNEX AI Test Generatoru
// 1-11-ci siniflərin rəsmi dərslik proqramına uyğun 23 fənn, kontekst menyu, interaktiv test və çap kitabçası (OMR çıxarılıb)
import React, { useState, useEffect, useMemo } from 'react';
import { User, Test, Question, QuestionOption } from '../types';
import {
  ALL_SCHOOL_SUBJECTS,
  CURRICULUM_DATA,
  SubjectMetadata,
  SubjectCategory,
  getGradesForSubject,
  getTopicsFor,
  getSubjectMetadata
} from '../lib/curriculumData';
import { generateAiTest, GeneratedAiTestResult } from '../lib/aiTestGenerator';
import { MultiSubjectSelector, SubjectConfig } from '../components/MultiSubjectSelector';
import { api } from '../lib/api';
import { MathRenderer } from '../components/MathRenderer';
import { jsPDF } from 'jspdf';
import {
  Sparkles,
  Bot,
  GraduationCap,
  BookOpen,
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
  Check,
  Search,
  Filter,
  X,
  ChevronRight,
  Save,
  AlertCircle
} from 'lucide-react';

interface AiTestCreatorPageProps {
  user: User;
  onBack: () => void;
  onOpenInteractiveEditor?: (testId: string) => void;
  onOpenOmrEditor?: (testId: string) => void;
  onTestSaved?: (test: Test, shouldShare?: boolean) => void;
}

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
  // Step: 1 = Fənn və Parametrlər, 2 = AI Generasiyası, 3 = Testə Baxış və Saxlama
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Tək Fənn vs Çoxfənli Rejim (Tələb 1, 2, 3)
  const [creationMode, setCreationMode] = useState<'single' | 'multi'>('single');
  const [multiSubjects, setMultiSubjects] = useState<SubjectConfig[]>([
    { subject: 'Azərbaycan dili', questionCount: 20 },
    { subject: 'Riyaziyyat', questionCount: 20 },
    { subject: 'Azərbaycan tarixi', questionCount: 20 },
  ]);

  // 1. Fənn Seçimi və Filtrlər
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'all'>('all');
  const [subjectSearch, setSubjectSearch] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Azərbaycan dili');

  // 2. Sinif Seçimi
  const [selectedGrade, setSelectedGrade] = useState<string>('8-ci sinif');

  // 3. Mövzuların İdarə Edilməsi
  const [topicSearch, setTopicSearch] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // 4. Sual Sayı və Çətinlik
  const [closedCount, setClosedCount] = useState<number>(15);
  const [openCount, setOpenCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');

  // Generasiya və Nəticə Vəziyyəti
  const [generating, setGenerating] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<GeneratedAiTestResult | null>(null);
  const [editableQuestions, setEditableQuestions] = useState<Question[]>([]);
  const [testTitle, setTestTitle] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [editingQId, setEditingQId] = useState<string | null>(null);

  // Fənn metadata
  const currentSubjectMeta = useMemo(() => {
    return getSubjectMetadata(selectedSubject) || ALL_SCHOOL_SUBJECTS[0];
  }, [selectedSubject]);

  // Cari fənn üçün keçərli siniflər
  const validGradesForSubject = useMemo(() => {
    return getGradesForSubject(selectedSubject);
  }, [selectedSubject]);

  // Fənn dəyişdikdə sinfi və mövzuları sinxronlaşdır
  useEffect(() => {
    if (!validGradesForSubject.includes(selectedGrade)) {
      // Əgər cari seçilmiş sinif bu fəndə yoxdursa (məs. Kimya 8-dən başlayır), ilk uyğun sinfi seç
      const nextGrade = validGradesForSubject.includes('8-ci sinif')
        ? '8-ci sinif'
        : validGradesForSubject[0] || '5-ci sinif';
      setSelectedGrade(nextGrade);
    }
  }, [selectedSubject, validGradesForSubject, selectedGrade]);

  // Sinif və ya fənn dəyişdikdə mövzuları yenilə və hamısını seç
  useEffect(() => {
    const topics = getTopicsFor(selectedSubject, selectedGrade);
    setSelectedTopics(topics);
    setTopicSearch('');
  }, [selectedSubject, selectedGrade]);

  // Mövcud mövzular
  const availableTopics = useMemo(() => {
    return getTopicsFor(selectedSubject, selectedGrade);
  }, [selectedSubject, selectedGrade]);

  // Axtarış üzrə filtirlənmiş mövzular
  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) return availableTopics;
    const q = topicSearch.toLowerCase().trim();
    return availableTopics.filter(t => t.toLowerCase().includes(q));
  }, [availableTopics, topicSearch]);

  // Axtarış və kateqoriya üzrə fənlər siyahısı
  const filteredSubjects = useMemo(() => {
    return ALL_SCHOOL_SUBJECTS.filter(s => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      const matchSearch =
        !subjectSearch.trim() ||
        s.name.toLowerCase().includes(subjectSearch.toLowerCase().trim()) ||
        s.description.toLowerCase().includes(subjectSearch.toLowerCase().trim());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, subjectSearch]);

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

  // AI ilə Test Hazırla Funksiyası (Tək və Çoxfənli İnteqrasiyası)
  const handleGenerate = async () => {
    // ÇOXFƏNLİ TEST GENERASİYASI (Tələb 3: AI Test Yaratma)
    if (creationMode === 'multi') {
      if (multiSubjects.length === 0) {
        alert('Zəhmət olmasa ən azı bir fənn seçin.');
        return;
      }
      const totalMultiCount = multiSubjects.reduce((sum, s) => sum + (s.questionCount || 0), 0);
      if (totalMultiCount <= 0) {
        alert('Ümumi sual sayı 0-dan böyük olmalıdır.');
        return;
      }

      setGenerating(true);
      setCurrentStep(2);

      const allGeneratedQuestions: Question[] = [];

      try {
        for (let i = 0; i < multiSubjects.length; i++) {
          const subConfig = multiSubjects[i];
          setProgressMsg(`«${subConfig.subject}» fənni üzrə ${subConfig.questionCount} sual hazırlanır (${i + 1}/${multiSubjects.length})...`);
          await new Promise(r => setTimeout(r, 400));

          const subTopics = getTopicsFor(subConfig.subject, selectedGrade);
          const subClosedCount = Math.max(1, Math.round(subConfig.questionCount * 0.8));
          const subOpenCount = Math.max(0, subConfig.questionCount - subClosedCount);

          const subResult = await generateAiTest({
            grade: selectedGrade,
            subject: subConfig.subject,
            selectedTopics: subTopics.length > 0 ? subTopics : [subConfig.subject],
            testMode: 'interactive',
            closedCount: subClosedCount,
            openCount: subOpenCount,
            difficulty
          });

          // Hər sualın məlumatında fənnin adı saxlanılır və digər fənlərlə qarışdırılmır
          const tagged = subResult.questions.map((q, qIdx) => ({
            ...q,
            subject: subConfig.subject,
            order_index: allGeneratedQuestions.length + qIdx
          }));
          allGeneratedQuestions.push(...tagged);
        }

        const combinedSubject = multiSubjects.map(s => s.subject).join(', ');
        const combinedTitle = `${selectedGrade} Çoxfənli Sınaq İmtahanı (${multiSubjects.map(s => `${s.subject}: ${s.questionCount}`).join(', ')})`;

        setGeneratedResult({
          title: combinedTitle,
          exam_model: 'Buraxılış imtahanı',
          grade_group: selectedGrade,
          subject: combinedSubject,
          topics: multiSubjects.map(s => s.subject),
          duration_minutes: Math.max(15, allGeneratedQuestions.length * 2),
          total_questions: allGeneratedQuestions.length,
          closed_questions_count: allGeneratedQuestions.filter(q => q.question_type === 'single_choice').length,
          open_questions_count: allGeneratedQuestions.filter(q => q.question_type !== 'single_choice').length,
          total_points: allGeneratedQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
          test_mode: 'interactive',
          test_type: 'ai',
          questions: allGeneratedQuestions,
          answer_key: {},
          topic_breakdown: {},
          summary: `${selectedGrade} üzrə ${multiSubjects.length} fəndən ümumi ${allGeneratedQuestions.length} sual tərtib edildi.`
        });
        setEditableQuestions(allGeneratedQuestions);
        setTestTitle(combinedTitle);
        setCurrentStep(3);
      } catch (err: any) {
        alert('Xəta: ' + (err.message || 'Çoxfənli test hazırlanarkən xəta baş verdi'));
        setCurrentStep(1);
      } finally {
        setGenerating(false);
      }
      return;
    }

    // TƏK FƏNN TEST GENERASİYASI
    if (selectedTopics.length === 0) {
      alert('Zəhmət olmasa dərslik proqramından ən azı bir mövzu seçin.');
      return;
    }
    if (totalCount <= 0) {
      alert('Sual sayı 0-dan böyük olmalıdır.');
      return;
    }

    setGenerating(true);
    setCurrentStep(2);
    setProgressMsg(`«${selectedSubject}» üzrə ${selectedGrade} dərslik proqramı təhlil edilir...`);

    await new Promise(r => setTimeout(r, 500));
    setProgressMsg(`${selectedTopics.length} mövzu üzrə ${closedCount} qapalı və ${openCount} açıq sualın balansı qurulur...`);

    await new Promise(r => setTimeout(r, 600));
    setProgressMsg(`Riyazi/elmi düsturlar, test variantları və açıq sualların meyarları hazırlanır...`);

    try {
      const result = await generateAiTest({
        grade: selectedGrade,
        subject: selectedSubject,
        selectedTopics,
        testMode: 'interactive',
        closedCount,
        openCount,
        difficulty
      });

      await new Promise(r => setTimeout(r, 400));
      setGeneratedResult(result);
      setEditableQuestions(result.questions);
      setTestTitle(result.title);
      setCurrentStep(3);
    } catch (err: any) {
      alert('Xəta: ' + (err.message || 'Test hazırlanarkən xəta baş verdi'));
      setCurrentStep(1);
    } finally {
      setGenerating(false);
    }
  };

  // Sual Kitabçasını A4 PDF olaraq yüklə
  const handleDownloadQuestionBookletPdf = () => {
    if (!editableQuestions || editableQuestions.length === 0) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = 18;

      // Header Banner
      doc.setFillColor(243, 244, 246);
      doc.rect(margin, y - 6, pageWidth - 2 * margin, 24, 'F');
      doc.setDrawColor(209, 213, 219);
      doc.rect(margin, y - 6, pageWidth - 2 * margin, 24, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text(sanitizeForPdf(testTitle || 'ATROQ EDUCATION IMTAHAN TESTI'), margin + 4, y);

      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text(
        sanitizeForPdf(`Fenn: ${selectedSubject}  |  Sinif: ${selectedGrade}  |  Suallar: ${editableQuestions.length} sual  |  Tarix: ${new Date().toLocaleDateString('az-AZ')}`),
        margin + 4,
        y
      );

      y += 7;
      doc.text(
        sanitizeForPdf('Sagirdin Adi, Soyadi: ____________________________________   Sinif: ________   Bal: _______'),
        margin + 4,
        y
      );

      y += 12;

      // Questions Loop
      editableQuestions.forEach((q, index) => {
        // Page break if near bottom
        if (y > pageHeight - 35) {
          doc.addPage();
          y = 18;
        }

        const isClosed = q.question_type === 'single_choice';

        // Question number and topic header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        const qHeader = `${index + 1}. [${sanitizeForPdf(q.topic || selectedSubject)}] ${isClosed ? '' : '(Aciq sual)'}`;
        doc.text(qHeader, margin, y);
        y += 5;

        // Question text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(31, 41, 55);

        const cleanQText = sanitizeForPdf(q.question_text.replace(/\$([^\$]+)\$/g, '$1'));
        const qLines = doc.splitTextToSize(cleanQText, pageWidth - 2 * margin);
        doc.text(qLines, margin, y);
        y += qLines.length * 4.5 + 2;

        // Options for closed question
        if (isClosed && q.options) {
          q.options.forEach((opt) => {
            if (y > pageHeight - 20) {
              doc.addPage();
              y = 18;
            }
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(55, 65, 81);
            const optText = sanitizeForPdf(`${opt.id}) ${opt.text.replace(/\$([^\$]+)\$/g, '$1')}`);
            const optLines = doc.splitTextToSize(optText, pageWidth - 2 * margin - 6);
            doc.text(optLines, margin + 4, y);
            y += optLines.length * 4 + 1;
          });
          y += 3;
        } else {
          // Open question answer lines
          doc.setDrawColor(229, 231, 235);
          doc.line(margin + 4, y + 4, pageWidth - margin - 4, y + 4);
          doc.line(margin + 4, y + 10, pageWidth - margin - 4, y + 10);
          doc.line(margin + 4, y + 16, pageWidth - margin - 4, y + 16);
          y += 20;
        }
      });

      // Last Page: Answer Key and Explanations
      doc.addPage();
      y = 18;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text(sanitizeForPdf('DUZGUN CAVAB ACARI VE IZALAHAR'), margin, y);
      y += 8;

      editableQuestions.forEach((q, index) => {
        if (y > pageHeight - 25) {
          doc.addPage();
          y = 18;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);

        if (q.question_type === 'single_choice') {
          const correctOpt = q.options?.find(o => o.is_correct);
          doc.text(
            sanitizeForPdf(`${index + 1}-ci sual: Duzgun cavab: ${correctOpt?.id || '-'}  (${q.topic})`),
            margin,
            y
          );
        } else {
          doc.text(
            sanitizeForPdf(`${index + 1}-ci aciq sual: Model cavab / Meyar: ${q.correct_answer || '-'}  (${q.topic})`),
            margin,
            y
          );
        }
        y += 4.5;

        if (q.explanation) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(107, 114, 128);
          const expLines = doc.splitTextToSize(sanitizeForPdf(`Izah: ${q.explanation}`), pageWidth - 2 * margin - 4);
          doc.text(expLines, margin + 4, y);
          y += expLines.length * 3.5 + 2;
        }
      });

      const filename = `${sanitizeForPdf(selectedSubject)}_${selectedGrade}_Sual_Kitabcasi.pdf`.replace(/\s+/g, '_');
      doc.save(filename);
    } catch (e: any) {
      alert('PDF hazırlanarkən xəta: ' + e.message);
    }
  };

  // Testi Sistemdə İnteraktiv İmtahan Kimi Yadda Saxla
  const handleSaveInteractiveTest = async () => {
    if (!editableQuestions || editableQuestions.length === 0) return;

    try {
      setSaving(true);
      setSaveSuccessMsg('');

      const isMulti = creationMode === 'multi';
      const effectiveSubject = isMulti ? multiSubjects.map(s => s.subject).join(', ') : selectedSubject;
      const effectiveTopic = isMulti ? multiSubjects.map(s => s.subject).join(', ') : selectedTopics.slice(0, 3).join(', ');
      const effectiveTitle = testTitle.trim() || `${effectiveSubject} - ${selectedGrade} AI Sınaq`;

      const created = await api.createTest({
        teacher_id: user.id,
        title: effectiveTitle,
        exam_model: 'Sinif imtahanı',
        grade_group: selectedGrade,
        subject: effectiveSubject,
        topic: effectiveTopic,
        duration_minutes: Math.max(15, editableQuestions.length * 2),
        total_questions: editableQuestions.length,
        total_points: editableQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
        grading_rule: 'standard',
        test_mode: 'interactive',
        test_type: 'ai',
        status: 'published',
        questions: editableQuestions
      });

      setSaveSuccessMsg(`İnteraktiv AI test uğurla yadda saxlanıldı! Link kodu: ${created.share_code}`);

      if (onTestSaved) {
        const fullSavedTest: Test = {
          id: created.id,
          share_code: created.share_code,
          teacher_id: user.id,
          title: effectiveTitle,
          exam_model: 'Sinif imtahanı',
          grade_group: selectedGrade,
          subject: effectiveSubject,
          topic: effectiveTopic,
          duration_minutes: Math.max(15, editableQuestions.length * 2),
          total_questions: editableQuestions.length,
          total_points: editableQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
          grading_rule: 'standard',
          test_mode: 'interactive',
          test_type: 'ai',
          status: 'published',
          result_display_mode: 'immediate',
          is_link_active: true,
          questions: editableQuestions
        };
        onTestSaved(fullSavedTest, true);
      }
    } catch (err: any) {
      alert('Yadda saxlanılarkən xəta baş verdi: ' + (err.message || 'Bilinməyən xəta'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50">
      {/* ==============================================================
          MƏRHƏLƏ 1: FƏNN, SİNİF, MÖVZU VƏ TEST PARAMETRLƏRİ
          ============================================================== */}
      {currentStep === 1 && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Yuxarı Başlıq Zolağı */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs z-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Geri qayıt"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4 fill-white" />
                  </span>
                  AI ilə Test Yarat
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  Ümumtəhsil məktəblərinin I–XI sinif dərslik proqramına tam uyğun avtomatik test tərtibatçısı
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCreationMode('single')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    creationMode === 'single'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tək Fənn
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode('multi')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    creationMode === 'multi'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Çoxfənli Test</span>
                </button>
              </div>
            </div>
          </div>

          {/* ÇOXFƏNLİ REJİM GÖRÜNÜŞÜ (Tələb 1, 2, 3) */}
          {creationMode === 'multi' ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full flex flex-col gap-5 scrollbar-thin">
              {/* Çoxfənli Komponent */}
              <MultiSubjectSelector
                selectedSubjects={multiSubjects}
                onChange={setMultiSubjects}
              />

              {/* Sinif və Çətinlik Parametrləri */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Sinif Seçimi */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[240px]">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      Sinif Seçimi (I–XI Siniflər)
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'].map((grade) => (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => setSelectedGrade(grade)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedGrade === grade
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Çətinlik */}
                  <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Çətinlik Dərəcəsi
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      <option value="mixed">Qarışıq (Standart DİM balansı)</option>
                      <option value="easy">Asan (Baza biliklər)</option>
                      <option value="medium">Orta (Tətbiq və hesablama)</option>
                      <option value="hard">Çətin (Lisey və olimpiada)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Əsas Hərəkət Düyməsi */}
              <div className="pt-1 pb-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={multiSubjects.length === 0}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 fill-white" />
                  <span>
                    AI ilə Çoxfənli Test Hazırla (Cəmi {multiSubjects.reduce((sum, s) => sum + (s.questionCount || 0), 0)} Sual • {multiSubjects.length} Fənn)
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ) : (
            /* TƏK FƏNN REJİMİ (İki Panelli Fənn Kataloqu və Kontekst Menyu) */
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* ==============================================================
                SOL PANEL: FƏNN SEÇİMİ (Fənn Kataloqu & Axtarış)
                ============================================================== */}
            <div className="lg:col-span-4 xl:col-span-3.5 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
              {/* Fənn Axtarış Sahəsi */}
              <div className="p-3 border-b border-slate-100 shrink-0 flex flex-col gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Fənn axtar (məs: Fizika, Tarix)..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors"
                  />
                  {subjectSearch && (
                    <button
                      type="button"
                      onClick={() => setSubjectSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Kateqoriya Tabları */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
                  {[
                    { id: 'all', label: 'Bütün (23)' },
                    { id: 'exact', label: 'Dəqiq' },
                    { id: 'humanitarian', label: 'Humanitar' },
                    { id: 'social', label: 'İctimai' },
                    { id: 'applied', label: 'Tətbiqi' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fənlər Siyahısı (Səliqəli, Kontekst Menyu üçün Seçim Kartları) */}
              <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 scrollbar-thin">
                {filteredSubjects.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Axtarışa uyğun fənn tapılmadı
                  </div>
                ) : (
                  filteredSubjects.map(sub => {
                    const isSelected = selectedSubject === sub.name;
                    const gradesCount = sub.grades.length;
                    const gradeRangeText = gradesCount === 11
                      ? 'I–XI sinif'
                      : `${sub.grades[0]?.replace('-ci sinif', '').replace('-cü sinif', '')}–${sub.grades[gradesCount - 1]?.replace('-ci sinif', '').replace('-cü sinif', '')} sinif`;

                    return (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => setSelectedSubject(sub.name)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-50 to-violet-50/50 border-indigo-400 shadow-xs ring-1 ring-indigo-300'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-transform group-hover:scale-105 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {sub.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-900 truncate flex items-center gap-1.5">
                              <span>{sub.name}</span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 font-bold text-slate-600 text-[9px]">
                                {gradeRangeText}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="truncate">{sub.category === 'exact' ? 'Dəqiq' : sub.category === 'humanitarian' ? 'Humanitar' : sub.category === 'social' ? 'İctimai' : 'Tətbiqi'}</span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                        }`} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ==============================================================
                SAĞ PANEL: SEÇİLMİŞ FƏNNƏ AİD KONTEKST MENYU VƏ MÖVZU BAZASI
                ============================================================== */}
            <div className="lg:col-span-8 xl:col-span-8.5 bg-slate-50 flex flex-col h-full overflow-y-auto p-3 sm:p-5 gap-4 scrollbar-thin">
              {/* Kontekst Menyu Başlığı - Seçilmiş Fənn Kartı */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-100">
                    {selectedSubject.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {selectedSubject}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-[10px]">
                        {currentSubjectMeta.category === 'exact' ? 'Dəqiq Elmlər' : currentSubjectMeta.category === 'humanitarian' ? 'Humanitar Fənn' : currentSubjectMeta.category === 'social' ? 'İctimai Elmlər' : 'Tətbiqi Fənn'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentSubjectMeta.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>Proqram: <strong className="text-slate-800">AR Elm və Təhsil Nazirliyi</strong></span>
                </div>
              </div>

              {/* 1. SİNFİ SEÇ (Yalnız bu fənn üçün keçərli olan siniflər) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    1. Sinfi Seç ({validGradesForSubject.length} Sinif Üzrə Dərslik)
                  </label>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Cari seçim: <strong className="text-indigo-600">{selectedGrade}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {validGradesForSubject.map((grade) => {
                    const isGradeSelected = selectedGrade === grade;
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setSelectedGrade(grade)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          isGradeSelected
                            ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-800 scale-[1.02]'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        {grade}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. MÖVZU BAZASI (Rəsmi Dərslik Fəsilləri və Mövzular) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      2. Mövzu Bazası ({selectedGrade} Dərsliyi)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                      Seçilib: {selectedTopics.length} / {availableTopics.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllTopics}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    >
                      {selectedTopics.length === availableTopics.length ? 'Seçimi təmizlə' : 'Hamısını seç'}
                    </button>
                  </div>
                </div>

                {/* Mövzu Axtarışı */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    placeholder="Mövzularda axtar..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                  {topicSearch && (
                    <button
                      type="button"
                      onClick={() => setTopicSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Mövzuların İki Sütunlu Çekboks Siyahısı */}
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50 flex flex-col gap-1 scrollbar-thin">
                  {filteredTopics.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Mövzu tapılmadı
                    </div>
                  ) : (
                    filteredTopics.map((topic, i) => {
                      const isChecked = selectedTopics.includes(topic);
                      return (
                        <div
                          key={topic}
                          onClick={() => handleToggleTopic(topic)}
                          className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-all select-none ${
                            isChecked
                              ? 'bg-white border-indigo-300 text-slate-900 shadow-2xs'
                              : 'bg-transparent border-transparent text-slate-600 hover:bg-white hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="flex-1 leading-snug">{i + 1}. {topic}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 3. TEST PARAMETRLƏRİ (Sual Sayı və Çətinlik Dərəcəsi) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  3. Test Parametrləri
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Qapalı Suallar */}
                  <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex flex-col gap-1">
                    <span className="text-xs font-bold text-indigo-900">Qapalı Suallar (A-E):</span>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={closedCount}
                      onChange={(e) => setClosedCount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-sm font-black text-indigo-900 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] text-indigo-700">5 variantlı (A, B, C, D, E)</span>
                  </div>

                  {/* Açıq Suallar */}
                  <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl flex flex-col gap-1">
                    <span className="text-xs font-bold text-amber-900">Açıq Suallar:</span>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={openCount}
                      onChange={(e) => setOpenCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-sm font-black text-amber-900 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-amber-700">Həll yolu və meyarlı (0 ola bilər)</span>
                  </div>

                  {/* Çətinlik */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-800">Çətinlik Səviyyəsi:</span>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      <option value="mixed">Qarışıq (Standart DİM balansı)</option>
                      <option value="easy">Asan (Baza biliklər)</option>
                      <option value="medium">Orta (Tətbiq və hesablama)</option>
                      <option value="hard">Çətin (Lisey və olimpiada)</option>
                    </select>
                    <span className="text-[10px] text-slate-500">
                      Cəmi: <strong className="text-slate-900 font-bold">{totalCount} sual</strong> ({totalCount * 2} dəq)
                    </span>
                  </div>
                </div>
              </div>

              {/* ƏSAS HƏRƏKƏT DÜYMƏSİ (AI ilə Test Hazırla) */}
              <div className="pt-1 pb-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={selectedTopics.length === 0 || totalCount <= 0}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 fill-white" />
                  <span>AI ilə Test Hazırla ({totalCount} Sual: {closedCount} qapalı + {openCount} açıq)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* ==============================================================
          MƏRHƏLƏ 2: GENERASİYA ANİMASİYASI
          ============================================================== */}
      {currentStep === 2 && (
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center max-w-lg w-full">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200 animate-bounce mb-6">
              <Bot className="w-10 h-10" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-2">
              ATROQ Education AI Sualları Tərtib Edir...
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
          MƏRHƏLƏ 3: YOXLAMA, REDAKTƏ VƏ İNTERAKTİV SAXLAMA (OMR TAMAMİLƏ SİLİNİB)
          ============================================================== */}
      {currentStep === 3 && generatedResult && (
        <div className="h-full w-full flex flex-col overflow-hidden animate-in fade-in">
          {/* Yuxarı Fəaliyyət Zolağı (Sərbəst Sabit) */}
          <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3 z-10">
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
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="A4 formatında Sual Kitabçasını PDF olaraq yüklə"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Sual Kitabçası (PDF)</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveInteractiveTest}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saxlanılır...' : 'İnteraktiv Testi Saxla'}</span>
              </button>
            </div>
          </div>

          {/* Məlumat Paneli */}
          <div className="shrink-0 bg-slate-100/90 border-b border-slate-200/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
            <div className="flex flex-wrap items-center gap-3">
              <span><strong>Fənn:</strong> {creationMode === 'multi' ? multiSubjects.map(s => s.subject).join(', ') : `${selectedSubject} (${selectedGrade})`}</span>
              <span className="text-slate-300">•</span>
              <span><strong>Cəmi Suallar:</strong> {editableQuestions.length} sual</span>
              {creationMode === 'single' ? (
                <>
                  <span className="text-slate-300">•</span>
                  <span><strong>Mövzular:</strong> {selectedTopics.length} mövzu əhatə olundu</span>
                </>
              ) : (
                <>
                  <span className="text-slate-300">•</span>
                  <span><strong>Çoxfənli Bölgü:</strong> {multiSubjects.map(s => `${s.subject}: ${s.questionCount}`).join(' • ')}</span>
                </>
              )}
            </div>
            {saveSuccessMsg && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md animate-fade-in">
                ✓ {saveSuccessMsg}
              </span>
            )}
          </div>

          {/* TƏK VƏ TAM GENİŞLİKDƏ SƏRBƏST SÜRÜŞƏN SUALLAR SAHƏSİ (Heç bir OMR xanası yoxdur) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Sual Kitabçası ({editableQuestions.length} Sual)
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Mətn və variantları birbaşa redaktə edə bilərsiniz
                </span>
              </div>

              {editableQuestions.map((q, idx) => {
                const isClosed = q.question_type === 'single_choice';
                const isEditing = editingQId === q.id;

                return (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col gap-3"
                  >
                    {/* Başlıq: Sual № və Mövzu Nişanı */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                          isClosed ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          #{idx + 1}
                        </span>
                        {q.subject && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800">
                            {q.subject}
                          </span>
                        )}
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
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-600"
                      />
                    ) : (
                      <div className="text-sm font-bold text-slate-900 leading-relaxed">
                        <MathRenderer content={q.question_text} />
                      </div>
                    )}

                    {/* Qapalı Sual Variantları */}
                    {isClosed && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt) => {
                          const isCorrect = opt.is_correct;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                                isCorrect
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold ring-1 ring-emerald-200'
                                  : 'bg-slate-50/70 border-slate-200 text-slate-800'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px] shrink-0 ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
                              }`}>
                                {opt.id}
                              </span>
                              <div className="flex-1 truncate">
                                <MathRenderer content={opt.text} />
                              </div>
                              {isCorrect && (
                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                                  ✓ Düzgün cavab
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Açıq Sual Model Cavabı və Meyarı */}
                    {!isClosed && (
                      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex flex-col gap-1 text-xs">
                        <div className="font-bold text-amber-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Qiymətləndirmə Meyarı və Düzgün Həll Yolu:</span>
                        </div>
                        <div className="text-slate-800 pl-5 leading-relaxed font-mono text-[11px]">
                          {q.correct_answer || 'Həll yolu daxil edilib'}
                        </div>
                      </div>
                    )}

                    {/* İzah Bölməsi */}
                    {q.explanation && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5">
                        <span className="font-bold text-indigo-700 shrink-0">İzah:</span>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
