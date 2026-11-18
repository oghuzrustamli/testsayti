// src/lib/export-utils.ts
// EDUNEX Çoxfənli və Ətraflı İmtahan Nəticələrinin Excel-ə İxracı (2 Vərəqli .xlsx)
import * as XLSX from 'xlsx';
import { Test, TestSession, Question } from '../types';

export interface StudentDetailedResult {
  session: TestSession;
  subjectBreakdown?: Array<{
    subject: string;
    total: number;
    correct: number;
    incorrect: number;
    blank: number;
    score: number;
    percentage: number;
  }>;
  answers?: Array<{
    question_number: number;
    subject: string;
    question_text: string;
    selected_answer: string;
    correct_answer: string;
    is_correct: boolean | number;
    points: number;
  }>;
}

/**
 * Format duration in seconds to "X dəq Y san"
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 san';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} san`;
  return `${mins} dəq ${secs} san`;
}

/**
 * Enhanced Excel Export for Multi-Subject Results (User Specification 5)
 * Sheet 1: Fənlər Üzrə Hesabat (Subject breakdown + Overall score)
 * Sheet 2: Sual-Cavab Detalları (Detailed itemized question log)
 */
export function exportMultiSubjectResultsToExcel(
  detailedResults: StudentDetailedResult[],
  testTitle: string = 'EDUNEX_Imtahan_Netice'
) {
  const workbook = XLSX.utils.book_new();

  // 1. VƏRƏQ 1: FƏNLƏR ÜZRƏ HESABAT (Subject Breakdown Sheet)
  const sheet1Data: any[] = [];

  detailedResults.forEach((item, sIdx) => {
    const s = item.session;
    const studentName = `${s.student_name} ${s.student_surname}`;
    const tTitle = s.test_title || testTitle;

    if (item.subjectBreakdown && item.subjectBreakdown.length > 0) {
      item.subjectBreakdown.forEach((sub) => {
        sheet1Data.push({
          '№': sIdx + 1,
          'Şagirdin Adı və Soyadı': studentName,
          'Sinif / Qrup': s.class_name || 'Standart',
          'Testin Adı': tTitle,
          'Fənnin Adı': sub.subject,
          'Sual Sayı': sub.total,
          'Düzgün Cavab': sub.correct,
          'Səhv Cavab': sub.incorrect,
          'Boş Cavab': sub.blank,
          'Fənn Balı': sub.score,
          'Fənn Faizi (%)': `${sub.percentage}%`,
          'Ümumi Yekun Bal': s.score,
          'Ümumi Yekun Faiz': `${s.percentage}%`,
          'Tarix': s.completed_at ? new Date(s.completed_at).toLocaleString('az-AZ') : '-'
        });
      });
    } else {
      // Single subject or standard row
      sheet1Data.push({
        '№': sIdx + 1,
        'Şagirdin Adı və Soyadı': studentName,
        'Sinif / Qrup': s.class_name || 'Standart',
        'Testin Adı': tTitle,
        'Fənnin Adı': s.subject || 'Ümumi',
        'Sual Sayı': s.total_questions || (s.correct_count + s.incorrect_count + s.blank_count),
        'Düzgün Cavab': s.correct_count,
        'Səhv Cavab': s.incorrect_count,
        'Boş Cavab': s.blank_count,
        'Fənn Balı': s.score,
        'Fənn Faizi (%)': `${s.percentage}%`,
        'Ümumi Yekun Bal': s.score,
        'Ümumi Yekun Faiz': `${s.percentage}%`,
        'Tarix': s.completed_at ? new Date(s.completed_at).toLocaleString('az-AZ') : '-'
      });
    }
  });

  const worksheet1 = XLSX.utils.json_to_sheet(sheet1Data);
  worksheet1['!cols'] = [
    { wch: 5 },  // №
    { wch: 24 }, // Şagird
    { wch: 14 }, // Sinif
    { wch: 26 }, // Test adı
    { wch: 18 }, // Fənn
    { wch: 11 }, // Sual sayı
    { wch: 14 }, // Düz
    { wch: 14 }, // Səhv
    { wch: 12 }, // Boş
    { wch: 12 }, // Bal
    { wch: 14 }, // Faiz
    { wch: 16 }, // Ümumi bal
    { wch: 16 }, // Ümumi faiz
    { wch: 20 }, // Tarix
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet1, 'Fənlər üzrə Hesabat');

  // 2. VƏRƏQ 2: SUAL-CAVAB DETALLARI (Question Itemized Sheet)
  const sheet2Data: any[] = [];

  detailedResults.forEach((item) => {
    const s = item.session;
    const studentName = `${s.student_name} ${s.student_surname}`;

    if (item.answers && item.answers.length > 0) {
      item.answers.forEach((ans) => {
        const isCorr = ans.is_correct === true || ans.is_correct === 1;
        const resultLabel = isCorr ? 'Düzgün' : !ans.selected_answer ? 'Boş' : 'Səhv';

        sheet2Data.push({
          'Şagird': studentName,
          'Sual №': ans.question_number,
          'Fənn': ans.subject || 'Ümumi',
          'Sual Mətni': (ans.question_text || '').replace(/\$([^\$]+)\$/g, '$1'),
          'Şagirdin Cavabı': ans.selected_answer || '(Boş)',
          'Düzgün Cavab': ans.correct_answer,
          'Nəticə': resultLabel,
          'Bal': isCorr ? (ans.points || 1) : 0
        });
      });
    }
  });

  if (sheet2Data.length > 0) {
    const worksheet2 = XLSX.utils.json_to_sheet(sheet2Data);
    worksheet2['!cols'] = [
      { wch: 24 }, // Şagird
      { wch: 8 },  // Sual №
      { wch: 16 }, // Fənn
      { wch: 45 }, // Sual mətni
      { wch: 16 }, // Şagird cavabı
      { wch: 16 }, // Düzgün cavab
      { wch: 12 }, // Nəticə
      { wch: 8 },  // Bal
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'Sual-Cavab Detalları');
  }

  const cleanTitle = (testTitle || 'EDUNEX_Imtahan_Netice').replace(/[^a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ\-]/g, '_');
  XLSX.writeFile(workbook, `${cleanTitle}_Fənlər_Üzrə_Nəticə.xlsx`);
}

/**
 * Standard simple results export fallback
 */
export function exportResultsToExcel(sessions: TestSession[], testTitle: string) {
  const detailed: StudentDetailedResult[] = sessions.map((s) => ({
    session: s
  }));
  exportMultiSubjectResultsToExcel(detailed, testTitle);
}
