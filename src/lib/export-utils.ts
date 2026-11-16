// src/lib/export-utils.ts
import * as XLSX from 'xlsx';
import { Test, TestSession, Question } from '../types';

/**
 * Export exam results table to Excel (.xlsx) file
 */
export function exportResultsToExcel(sessions: TestSession[], testTitle: string) {
  const data = sessions.map((s, idx) => ({
    '№': idx + 1,
    'Şagirdin Adı və Soyadı': `${s.student_name} ${s.student_surname}`,
    'Sinif / Qrup': s.class_name || 'Standart',
    'Düzgün Cavab Sayı': s.correct_count,
    'Səhv Cavab Sayı': s.incorrect_count,
    'Cavabsız Sual Sayı': s.blank_count,
    'Toplanan Bal': s.score,
    'Müvəffəqiyyət Faizi (%)': `${s.percentage}%`,
    'Sərf Edilən Müddət': formatDuration(s.duration_seconds),
    'Tarix': s.completed_at ? new Date(s.completed_at).toLocaleString('az-AZ') : '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nəticələr');

  // Auto column width
  const colWidths = [
    { wch: 6 },
    { wch: 26 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
  ];
  worksheet['!cols'] = colWidths;

  const cleanTitle = (testTitle || 'EDUNEX_Imtahan_Netice').replace(/[^a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ\-]/g, '_');
  XLSX.writeFile(workbook, `${cleanTitle}_Netice.xlsx`);
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
