// src/pages/StudentDatabasePage.tsx
// ATROQ Education - Şagird Bazası & UTİS Vahid Elektron Reyestri (I-XI Siniflər)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { User, StudentDatabaseItem, StudentExamHistoryItem, StudentImportItem, ImportHistoryItem } from '../types';
import { api } from '../lib/api';
import {
  Users2,
  Search,
  Plus,
  FileSpreadsheet,
  History,
  Archive,
  Eye,
  EyeOff,
  Edit,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Download,
  Upload,
  Calendar,
  School,
  GraduationCap,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Check,
  ArrowUpDown,
  TrendingUp,
  FileText,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';

const ROMAN_CLASSES = [
  'I sinif',
  'II sinif',
  'III sinif',
  'IV sinif',
  'V sinif',
  'VI sinif',
  'VII sinif',
  'VIII sinif',
  'IX sinif',
  'X sinif',
  'XI sinif',
];

interface StudentDatabasePageProps {
  user: User;
}

export const StudentDatabasePage: React.FC<StudentDatabasePageProps> = ({ user }) => {
  // Main Data States
  const [students, setStudents] = useState<StudentDatabaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [stats, setStats] = useState<{ totalActive: number; totalArchived: number }>({
    totalActive: 0,
    totalArchived: 0,
  });

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [viewArchived, setViewArchived] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Security: Unmasked FIN codes set
  const [revealedFins, setRevealedFins] = useState<Record<string, boolean>>({});

  // Modals
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<{
    student: StudentDatabaseItem;
    exam_history: StudentExamHistoryItem[];
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<StudentDatabaseItem | null>(null);

  // Import Modal & Wizard (3 Mərhələ)
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importFileName, setImportFileName] = useState<string>('');
  const [parsedImportRows, setParsedImportRows] = useState<StudentImportItem[]>([]);
  const [importFilter, setImportFilter] = useState<'all' | 'new' | 'update' | 'invalid'>('all');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Import History Modal
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Selection and Delete States (Tələb 3 & 4)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [studentToDeleteSingle, setStudentToDeleteSingle] = useState<StudentDatabaseItem | null>(null);

  // Form State for Add / Edit
  const [formFirstName, setFormFirstName] = useState<string>('');
  const [formLastName, setFormLastName] = useState<string>('');
  const [formFatherName, setFormFatherName] = useState<string>('');
  const [formUtis, setFormUtis] = useState<string>('');
  const [formFin, setFormFin] = useState<string>('');
  const [formGrade, setFormGrade] = useState<string>('IX sinif');
  const [formSchool, setFormSchool] = useState<string>('1 nömrəli tam orta məktəb');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Load students list
  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentDatabase({
        search: searchTerm,
        grade: selectedGrade,
        is_archived: viewArchived ? 1 : 0,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        limit: pageSize,
      });
      setStudents(res.students || []);
      setTotalCount(res.total || 0);
      setStats(res.stats || { totalActive: 0, totalArchived: 0 });
    } catch (err) {
      console.error('Error loading student database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [searchTerm, selectedGrade, viewArchived, page, pageSize, sortBy, sortOrder]);

  // Load student profile & exam history
  const handleOpenStudentProfile = async (id: string) => {
    setViewingStudentId(id);
    try {
      setLoadingDetails(true);
      const data = await api.getStudentDatabaseById(id);
      setStudentDetails(data);
    } catch (err) {
      console.error('Error loading student profile:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (student: StudentDatabaseItem) => {
    setEditingStudent(student);
    setFormFirstName(student.first_name);
    setFormLastName(student.last_name);
    setFormFatherName(student.father_name || '');
    setFormUtis(student.utis_code || '');
    setFormFin(student.fin_code || '');
    setFormGrade(student.grade_class || 'IX sinif');
    setFormSchool(student.school_name || '1 nömrəli tam orta məktəb');
    setFormPhone(student.phone || '');
    setShowAddModal(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormFirstName('');
    setFormLastName('');
    setFormFatherName('');
    setFormUtis('');
    setFormFin('');
    setFormGrade(selectedGrade !== 'all' ? selectedGrade : 'IX sinif');
    setFormSchool('1 nömrəli tam orta məktəb');
    setFormPhone('');
    setShowAddModal(true);
  };

  // Save (Create or Update) Student
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim()) {
      alert('Zəhmət olmasa şagirdin adını və soyadını daxil edin');
      return;
    }
    const cleanUtis = formUtis.trim();
    if (cleanUtis && !/^\d{7}$/.test(cleanUtis)) {
      alert('UTİS kodu dəqiq 7 rəqəmdən ibarət olmalıdır (məsələn: 1048291)');
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingStudent) {
        await api.updateStudentDatabaseItem(editingStudent.id, {
          first_name: formFirstName.trim(),
          last_name: formLastName.trim(),
          father_name: formFatherName.trim(),
          utis_code: cleanUtis,
          fin_code: formFin.trim().toUpperCase(),
          grade_class: formGrade,
          school_name: formSchool.trim(),
          phone: formPhone.trim(),
        });
      } else {
        await api.createStudentDatabaseItem({
          first_name: formFirstName.trim(),
          last_name: formLastName.trim(),
          father_name: formFatherName.trim(),
          utis_code: cleanUtis,
          fin_code: formFin.trim().toUpperCase(),
          grade_class: formGrade,
          school_name: formSchool.trim(),
          phone: formPhone.trim(),
        });
      }
      setShowAddModal(false);
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'Xəta baş verdi');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Archive / Restore
  const handleToggleArchive = async (student: StudentDatabaseItem) => {
    const isArchiving = student.is_archived === 0;
    const confirmMsg = isArchiving
      ? `"${student.first_name} ${student.last_name}" adlı şagirdi arxivə göndərmək istəyirsiniz? Şagirdin bütün imtahan nəticələri saxlanılacaqdır.`
      : `"${student.first_name} ${student.last_name}" adlı şagirdi aktiv bazaya bərpa etmək istəyirsiniz?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.archiveStudentDatabaseItem(student.id, isArchiving ? 1 : 0);
      loadStudents();
    } catch (err) {
      alert('Əməliyyat zamanı xəta baş verdi');
    }
  };

  // Toggle FIN mask
  const toggleFinMask = (id: string) => {
    setRevealedFins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskFin = (fin: string, isRevealed: boolean) => {
    if (!fin) return '—';
    if (isRevealed || fin.length < 5) return fin;
    return `${fin.substring(0, 2)}***${fin.substring(fin.length - 2)}`;
  };

  // Selection Logic (Tələb 3 & 4)
  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllVisibleSelected = useMemo(() => {
    if (students.length === 0) return false;
    return students.every(s => selectedStudentIds.includes(s.id));
  }, [students, selectedStudentIds]);

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      const visibleIds = new Set(students.map(s => s.id));
      setSelectedStudentIds(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      const visibleIds = students.map(s => s.id);
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  const handleRequestDeleteSelected = () => {
    if (selectedStudentIds.length === 0) return;
    setStudentToDeleteSingle(null);
    setShowDeleteModal(true);
  };

  const handleRequestDeleteSingle = (student: StudentDatabaseItem) => {
    setStudentToDeleteSingle(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      if (studentToDeleteSingle) {
        await api.deleteStudentDatabaseItem(studentToDeleteSingle.id);
        setSelectedStudentIds(prev => prev.filter(id => id !== studentToDeleteSingle.id));
      } else if (selectedStudentIds.length > 0) {
        await api.bulkDeleteStudentDatabaseItems(selectedStudentIds);
        setSelectedStudentIds([]);
      }
      setShowDeleteModal(false);
      setStudentToDeleteSingle(null);
      await loadStudents();
    } catch (err: any) {
      alert(err.message || 'Silinmə zamanı xəta baş verdi');
    } finally {
      setIsDeleting(false);
    }
  };

  // Excel Upload & Intelligent UTİS Column Mapping (Tələb 1 & 2)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        // cellDates & raw: false keeps formatted string representation, preserving leading zeros (e.g. 0123456)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Read 2D grid
        const rawGrid: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          defval: ''
        });

        if (!rawGrid || rawGrid.length === 0) {
          alert('Excel faylında məlumat tapılmadı.');
          return;
        }

        // 1. Detect Header Row Index (Search top 15 rows for table headers)
        const cleanHeader = (val: any) => {
          if (!val) return '';
          return String(val)
            .replace(/\u0130/g, 'i') // Capital dotted İ -> i
            .replace(/\u0131/g, 'i') // Small dotless ı -> i
            .replace(/\u0049/g, 'i') // Capital Latin I -> i
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // remove combining accents
            .replace(/ə/g, 'e')
            .replace(/ö/g, 'o')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ç/g, 'c')
            .replace(/ğ/g, 'g')
            .replace(/[\s_\-.,/\\():#№]/g, '');
        };

        let headerRowIdx = 0;
        let maxHeaderScore = -1;

        for (let r = 0; r < Math.min(15, rawGrid.length); r++) {
          const row = rawGrid[r];
          if (!Array.isArray(row)) continue;
          let score = 0;
          for (const cell of row) {
            const c = cleanHeader(cell);
            if (c.includes('soyad') || c.includes('familiy') || c.includes('surname')) score += 5;
            if (c === 'ad' || c === 'adi' || c.includes('firstname') || (c.includes('sagird') && c.includes('ad')) || c.startsWith('ad')) score += 5;
            if (c.includes('ata') || c.includes('father') || c.includes('patronymic') || c.includes('otchest')) score += 5;
            if (c.includes('utis') || c.includes('studentcode')) score += 6;
            if (c.includes('fin') || c.includes('pin')) score += 6;
            if (c.includes('sinif') || c.includes('sinfi') || c.includes('grade') || c.includes('class')) score += 3;
            if (c.includes('mekteb') || c.includes('school') || c.includes('muessise')) score += 2;
            if (c === 'saa' || c === 'fio' || c.includes('tamad')) score += 4;
          }
          if (score > maxHeaderScore) {
            maxHeaderScore = score;
            headerRowIdx = r;
          }
        }

        // 2. Map Column Indices from detected Header Row
        let colLastName = -1;
        let colFirstName = -1;
        let colFatherName = -1;
        let colFullName = -1;
        let colUtis = -1;
        let colFin = -1;
        let colGrade = -1;
        let colSchool = -1;

        const headerCells = rawGrid[headerRowIdx] || [];
        headerCells.forEach((cell, idx) => {
          const norm = cleanHeader(cell);
          if (!norm) return;

          // Priority 1: UTİS kodu
          if (norm.includes('utis') || norm.includes('studentcode') || (norm.includes('sagird') && norm.includes('kod'))) {
            colUtis = idx;
            return;
          }

          // Priority 2: FİN / PİN kodu
          if (norm.includes('fin') || norm.includes('pin')) {
            colFin = idx;
            return;
          }

          // Priority 3: Ata adı (Strictly check BEFORE Ad!)
          if (norm.includes('ata') || norm.includes('father') || norm.includes('patronymic') || norm.includes('otchest')) {
            colFatherName = idx;
            return;
          }

          // Priority 4: Soyad (Strictly check BEFORE Ad!)
          if (norm.includes('soyad') || norm.includes('familiy') || norm.includes('lastname') || norm.includes('surname')) {
            colLastName = idx;
            return;
          }

          // Priority 5: Full Name (S.A.A., FİO, Tam adı)
          if (norm === 'saa' || norm === 'fio' || norm.includes('tamad') || norm.includes('adsoyad') || norm.includes('soyadad') || norm.includes('fullname')) {
            colFullName = idx;
            return;
          }

          // Priority 6: Ad (Strictly after soyad, ata, and full name)
          if (
            norm === 'ad' ||
            norm === 'adi' ||
            norm === 'ism' ||
            norm === 'first' ||
            norm.includes('firstname') ||
            (norm.includes('sagird') && norm.includes('ad')) ||
            norm.startsWith('ad')
          ) {
            colFirstName = idx;
            return;
          }

          // Priority 7: Sinif
          if (norm.includes('sinif') || norm.includes('sinfi') || norm.includes('grade') || norm.includes('class')) {
            colGrade = idx;
            return;
          }

          // Priority 8: Məktəb
          if (norm.includes('mekteb') || norm.includes('school') || norm.includes('muessise')) {
            colSchool = idx;
            return;
          }
        });

        // Heuristic A: if colFirstName was not explicitly matched, check position between Soyad and Ata adı
        if (colFirstName === -1) {
          if (colLastName !== -1 && colFatherName !== -1 && colFatherName - colLastName === 2) {
            colFirstName = colLastName + 1;
          } else if (colLastName === 1 && colFatherName === 3) {
            colFirstName = 2;
          } else if (colLastName === 2 && colFatherName === 3) {
            colFirstName = 1;
          }
        }

        // Heuristic B: if colUtis was not explicitly matched, find column containing 7-digit numbers
        if (colUtis === -1) {
          const sampleRows = rawGrid.slice(headerRowIdx + 1, headerRowIdx + 30);
          const colCounts: Record<number, number> = {};
          sampleRows.forEach(row => {
            if (!Array.isArray(row)) return;
            row.forEach((val, cIdx) => {
              if (cIdx === colFirstName || cIdx === colLastName || cIdx === colFatherName || cIdx === colFin || cIdx === colGrade) return;
              const sVal = String(val || '').trim();
              if (/^\d{6,8}$/.test(sVal)) {
                colCounts[cIdx] = (colCounts[cIdx] || 0) + 1;
              }
            });
          });
          let bestCol = -1;
          let bestCount = 0;
          Object.entries(colCounts).forEach(([cStr, count]) => {
            if (count > bestCount) {
              bestCount = count;
              bestCol = parseInt(cStr);
            }
          });
          if (bestCol !== -1 && bestCount >= 2) {
            colUtis = bestCol;
          }
        }

        // Fallback column positions if no headers were matched at all
        if (colFirstName === -1 && colLastName === -1 && colFullName === -1) {
          colFirstName = 1;
          colLastName = 2;
          colFatherName = 3;
          colUtis = 4;
          colFin = 5;
          colGrade = 6;
          colSchool = 7;
        }

        // 3. Process Data Rows (starting after headerRowIdx)
        const dataRows = rawGrid.slice(headerRowIdx + 1);
        const normalizedRows: StudentImportItem[] = [];

        for (const row of dataRows) {
          if (!Array.isArray(row) || row.every(c => String(c || '').trim() === '')) {
            continue;
          }

          let firstName = colFirstName !== -1 ? String(row[colFirstName] || '').trim() : '';
          let lastName = colLastName !== -1 ? String(row[colLastName] || '').trim() : '';
          let fatherName = colFatherName !== -1 ? String(row[colFatherName] || '').trim() : '';

          // If single full name column exists (e.g. "Əliyev Murad Rəşad" or "Əliyev Murad Rəşad oğlu")
          if ((!firstName || !lastName) && colFullName !== -1) {
            const fullNameRaw = String(row[colFullName] || '').trim();
            const parts = fullNameRaw.split(/\s+/).filter(Boolean);
            if (parts.length >= 2) {
              if (!lastName) lastName = parts[0];
              if (!firstName) firstName = parts[1];
              if (!fatherName && parts.length > 2) fatherName = parts.slice(2).join(' ');
            } else if (parts.length === 1 && !firstName) {
              firstName = parts[0];
            }
          }

          // Auto-fill fallback so student is never completely locked out
          if (!firstName && lastName) {
            firstName = lastName;
          } else if (!lastName && firstName) {
            lastName = firstName;
          }

          // UTİS: preserve as string with leading zeros, remove accidental leading quotes
          let rawUtis = colUtis !== -1 ? String(row[colUtis] || '').trim().replace(/^'/, '') : '';
          const cleanUtis = rawUtis;

          // FİN: preserve as uppercase string
          let rawFin = colFin !== -1 ? String(row[colFin] || '').trim().replace(/^'/, '').toUpperCase() : '';

          // Sinif: Normalize to I-XI Roman standard (no parallel)
          let rawGrade = colGrade !== -1 ? String(row[colGrade] || '').trim() : '';
          let normalizedGrade = 'IX sinif';
          if (rawGrade) {
            const romanMatch = rawGrade.toUpperCase().match(/\b(XI|X|IX|VIII|VII|VI|V|IV|III|II|I)\b/);
            if (romanMatch) {
              normalizedGrade = `${romanMatch[1]} sinif`;
            } else {
              const numMatch = rawGrade.match(/\d+/);
              if (numMatch) {
                const num = parseInt(numMatch[0]);
                if (num >= 1 && num <= 11) {
                  normalizedGrade = ROMAN_CLASSES[num - 1];
                }
              }
            }
          }

          // School
          let rawSchool = colSchool !== -1 ? String(row[colSchool] || '').trim() : '';
          if (!rawSchool) rawSchool = '1 nömrəli tam orta məktəb';

          // Validation Warnings
          const validationErrors: string[] = [];
          if (!fatherName) {
            validationErrors.push('Ata adı qeyd olunmayıb');
          }
          if (!cleanUtis) {
            validationErrors.push('UTİS kodu qeyd olunmayıb');
          } else if (cleanUtis.length !== 7) {
            validationErrors.push('UTİS 7 rəqəmli olmalıdır');
          }
          if (!rawFin) {
            validationErrors.push('FİN kodu qeyd olunmayıb');
          } else if (rawFin.length !== 7) {
            validationErrors.push('FİN kodu 7 simvol olmalıdır');
          }

          // Check if already in active students (to prevent duplicates)
          const isExisting = students.some(
            s => (cleanUtis && s.utis_code && s.utis_code === cleanUtis) ||
                 (rawFin && s.fin_code && s.fin_code.toUpperCase() === rawFin) ||
                 (s.first_name.toLowerCase() === firstName.toLowerCase() &&
                  s.last_name.toLowerCase() === lastName.toLowerCase())
          );

          let status: StudentImportItem['status'] = isExisting ? 'needs_update' : 'new';
          if (!firstName && !lastName) {
            status = 'invalid';
            validationErrors.push('Ad və soyad daxil edilməyib');
          }

          normalizedRows.push({
            first_name: firstName,
            last_name: lastName,
            father_name: fatherName,
            utis_code: cleanUtis,
            fin_code: rawFin,
            grade_class: normalizedGrade,
            school_name: rawSchool,
            status,
            validation_errors: validationErrors,
          });
        }

        if (normalizedRows.length === 0) {
          alert('Excel faylında etibarlı şagird məlumatı tapılmadı.');
          return;
        }

        setParsedImportRows(normalizedRows);
        setImportStep(2);
      } catch (parseErr: any) {
        console.error('Excel parse error:', parseErr);
        alert('Excel faylını oxuyarkən xəta baş verdi. Zəhmət olmasa fayl formatını yoxlayın.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Perform bulk import
  const handleExecuteImport = async () => {
    const validRows = parsedImportRows.filter(r => r.status !== 'invalid');
    if (validRows.length === 0) {
      alert('İdxal edilə bilən düzgün şagird məlumatı tapılmadı');
      return;
    }

    try {
      setIsImporting(true);
      await api.importStudentsFromExcel(validRows, importFileName);
      setImportStep(3);
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'İdxal zamanı xəta baş verdi');
    } finally {
      setIsImporting(false);
    }
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Adı': 'Əli',
        'Soyadı': 'Həsənov',
        'Ata adı': 'Namiq',
        'UTİS kodu': '1234567',
        'FİN kodu': '7A8B9C1',
        'Sinfi': 'IX sinif',
        'Məktəbi': '1 nömrəli tam orta məktəb'
      },
      {
        'Adı': 'Ayan',
        'Soyadı': 'Məmmədova',
        'Ata adı': 'İlham',
        'UTİS kodu': '1048292',
        'FİN kodu': '6B4C5D2',
        'Sinfi': 'IX sinif',
        'Məktəbi': '1 nömrəli tam orta məktəb'
      },
      {
        'Adı': 'Murad',
        'Soyadı': 'Əliyev',
        'Ata adı': 'Rəşad',
        'UTİS kodu': '1048291',
        'FİN kodu': '5C3D4E3',
        'Sinfi': 'X sinif',
        'Məktəbi': '1 nömrəli tam orta məktəb'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Şagirdlər');
    XLSX.writeFile(wb, 'ATROQ_UTIS_Sagird_Sablon.xlsx');
  };

  // Open Import History
  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    try {
      setLoadingHistory(true);
      const list = await api.getImportHistory();
      setImportHistory(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Filtered import rows for step 2 preview
  const filteredImportRows = useMemo(() => {
    if (importFilter === 'all') return parsedImportRows;
    if (importFilter === 'new') return parsedImportRows.filter(r => r.status === 'new');
    if (importFilter === 'update') return parsedImportRows.filter(r => r.status === 'needs_update');
    return parsedImportRows.filter(r => r.status === 'invalid');
  }, [parsedImportRows, importFilter]);

  const importSummary = useMemo(() => {
    const total = parsedImportRows.length;
    const newCount = parsedImportRows.filter(r => r.status === 'new').length;
    const updateCount = parsedImportRows.filter(r => r.status === 'needs_update').length;
    const invalidCount = parsedImportRows.filter(r => r.status === 'invalid').length;
    return { total, newCount, updateCount, invalidCount };
  }, [parsedImportRows]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* 1. Header & Quick Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              ATROQ Education • Vahid Elektron Reyestr
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Şagird Bazası
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Məktəbin I–XI sinif şagirdlərinin vahid bazası, UTİS Excel idxalı və keçirilən imtahan nəticələrinin fərdi tarixçəsi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Nümunə Excel şablonu yüklə"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Şablon Yüklə</span>
          </button>

          <button
            type="button"
            onClick={handleOpenHistory}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>İdxal Tarixçəsi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setImportStep(1);
              setParsedImportRows([]);
              setShowImportModal(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 dark:shadow-none transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel-dən İdxal</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Şagird</span>
          </button>
        </div>
      </div>

      {/* 2. Top Statistic Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Aktiv Şagirdlər</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalActive}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-block">
            I – XI siniflər üzrə
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Arxivləşdirilmiş</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-600 dark:text-slate-300">
            {stats.totalArchived}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
            Məlumatları qorunan
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Cari Siyahıda</span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {totalCount}
          </div>
          <span className="text-[10px] text-indigo-500 font-semibold mt-1 inline-block">
            Seçilmiş filtr üzrə
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Reyestr Statusu</span>
          <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>UTİS Aktiv</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
            Vahid İnteqrasiya
          </span>
        </div>
      </div>

      {/* 3. Search Bar, Class Filters & Archive Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Ad, soyad, ata adı, UTİS və ya FİN kodu ilə axtarış..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Archive Toggle Tab */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-end sm:self-auto shrink-0 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setViewArchived(false);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                !viewArchived
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Aktiv Şagirdlər ({stats.totalActive})
            </button>
            <button
              type="button"
              onClick={() => {
                setViewArchived(true);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewArchived
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Arxiv ({stats.totalArchived})
            </button>
          </div>
        </div>

        {/* 4. I - XI Class Filter Pills (Strictly No "Paralel"!) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Sinif:
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedGrade('all');
              setPage(1);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedGrade === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Bütün Siniflər
          </button>
          {ROMAN_CLASSES.map((grade) => (
            <button
              key={grade}
              type="button"
              onClick={() => {
                setSelectedGrade(grade);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedGrade === grade
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {grade}
            </button>
          ))}
        </div>
      </div>

      {/* Selection Action Toolbar (Tələb 3 & 4: "Seç", "Seçilənləri sil", "Hamısını seç") */}
      {selectedStudentIds.length > 0 && (
        <div className="bg-indigo-600 dark:bg-indigo-950 text-white p-3.5 sm:p-4 rounded-2xl shadow-lg border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-black text-sm shrink-0">
              {selectedStudentIds.length}
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm block">
                {selectedStudentIds.length} şagird seçildi
              </span>
              <span className="text-[11px] text-indigo-200 block">
                {selectedGrade !== 'all' ? `Yalnız «${selectedGrade}» şagirdləri` : 'Bütün siniflər üzrə'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Seçimi Ləğv Et
            </button>
            <button
              type="button"
              onClick={handleRequestDeleteSelected}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-900/30 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Seçilənləri Sil ({selectedStudentIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Student Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Şagird bazası yüklənir...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users2 className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Heç bir şagird tapılmadı</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Seçilmiş axtarış və ya sinif filtri üzrə heç bir nəticə mövcud deyil. Excel-dən şagirdləri idxal edə və ya əl ilə əlavə edə bilərsiniz.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => {
                  setImportStep(1);
                  setShowImportModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors"
              >
                Excel-dən İdxal Et
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors"
              >
                Yeni Şagird Əlavə Et
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                  {/* Master Checkbox */}
                  <th className="py-3.5 px-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                      title={isAllVisibleSelected ? "Bütün seçimləri ləğv et" : "Cari səhifədəki bütün şagirdləri seç"}
                    />
                  </th>
                  <th className="py-3.5 px-2 text-center w-12">№</th>
                  <th
                    className="py-3.5 px-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                    onClick={() => {
                      setSortBy('first_name');
                      setSortOrder(sortBy === 'first_name' && sortOrder === 'ASC' ? 'DESC' : 'ASC');
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Adı</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                    onClick={() => {
                      setSortBy('last_name');
                      setSortOrder(sortBy === 'last_name' && sortOrder === 'ASC' ? 'DESC' : 'ASC');
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Soyadı</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Ata adı</th>
                  <th
                    className="py-3.5 px-3 font-mono cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                    onClick={() => {
                      setSortBy('utis_code');
                      setSortOrder(sortBy === 'utis_code' && sortOrder === 'ASC' ? 'DESC' : 'ASC');
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>UTİS kodu</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 font-mono">FİN kodu</th>
                  <th
                    className="py-3.5 px-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                    onClick={() => {
                      setSortBy('grade_class');
                      setSortOrder(sortBy === 'grade_class' && sortOrder === 'ASC' ? 'DESC' : 'ASC');
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Sinfi</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Məktəbi</th>
                  <th className="py-3.5 px-3 text-right pr-4">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((st, idx) => {
                  const rowNum = (page - 1) * pageSize + idx + 1;
                  const isRevealed = !!revealedFins[st.id];
                  const isSelected = selectedStudentIds.includes(st.id);

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group ${
                        isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStudent(st.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                      </td>

                      {/* № */}
                      <td className="py-3 px-2 text-center text-slate-400 font-mono text-[11px]">
                        {rowNum}
                      </td>

                      {/* Adı */}
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        <span
                          onClick={() => handleOpenStudentProfile(st.id)}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer"
                        >
                          {st.first_name || '—'}
                        </span>
                      </td>

                      {/* Soyadı */}
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        <span
                          onClick={() => handleOpenStudentProfile(st.id)}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer"
                        >
                          {st.last_name || '—'}
                        </span>
                      </td>

                      {/* Ata adı */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {st.father_name || '—'}
                      </td>

                      {/* UTİS kodu */}
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                        {st.utis_code ? (
                          <span className="bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800">
                            {st.utis_code}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* FİN kodu (Masked / Unmasked) */}
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {st.fin_code ? (
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-semibold tracking-wider text-[11px]">
                              {maskFin(st.fin_code, isRevealed)}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleFinMask(st.id)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                              title={isRevealed ? 'FİN kodunu gizlət' : 'FİN kodunu göstər'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Sinfi */}
                      <td className="py-3 px-3 font-bold">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          {st.grade_class || 'IX sinif'}
                        </span>
                      </td>

                      {/* Məktəbi */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[200px]" title={st.school_name}>
                        {st.school_name || '1 nömrəli tam orta məktəb'}
                      </td>

                      {/* Əməliyyatlar: Bax, Redaktə et, Arxivə göndər, Sil */}
                      <td className="py-3 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Bax (Profil) */}
                          <button
                            type="button"
                            onClick={() => handleOpenStudentProfile(st.id)}
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                            title="Şagird profilinə və imtahan tarixçəsinə bax"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Redaktə et */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(st)}
                            className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-lg transition-colors"
                            title="Məlumatları redaktə et"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Arxivə göndər / Bərpa et */}
                          <button
                            type="button"
                            onClick={() => handleToggleArchive(st)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              st.is_archived === 1
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                            }`}
                            title={st.is_archived === 1 ? 'Aktiv bazaya bərpa et' : 'Arxivə göndər'}
                          >
                            {st.is_archived === 1 ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                          </button>

                          {/* Sil (Tələb 3) */}
                          <button
                            type="button"
                            onClick={() => handleRequestDeleteSingle(st)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                            title="Şagirdi bazadan sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Pagination & Page Size */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span>Göstərilir:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value={10}>10 sətir</option>
              <option value={25}>25 sətir</option>
              <option value={50}>50 sətir</option>
              <option value={100}>100 sətir</option>
            </select>
            <span>Cəmi: <strong>{totalCount}</strong> şagird</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold">
              Səhifə {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: ŞAGİRD PROFİLİ VƏ İMTAHAN TARİXÇƏSİ                         */}
      {/* ===================================================================== */}
      {viewingStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 my-6 max-h-[90vh] overflow-y-auto">
            {loadingDetails || !studentDetails ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-slate-400">Şagird profili və imtahanlar yüklənir...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200 dark:shadow-none">
                      {studentDetails.student.first_name[0]}{studentDetails.student.last_name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {studentDetails.student.grade_class}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          studentDetails.student.is_archived === 1
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {studentDetails.student.is_archived === 1 ? 'Arxivdədir' : 'Aktiv Şagird'}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {studentDetails.student.first_name} {studentDetails.student.last_name} {studentDetails.student.father_name && `(${studentDetails.student.father_name} qızı/oğlu)`}
                      </h2>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <School className="w-3.5 h-3.5" />
                        <span>{studentDetails.student.school_name}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setViewingStudentId(null);
                      setStudentDetails(null);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Personal Information Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">UTİS Kodu</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm block mt-0.5">
                      {studentDetails.student.utis_code || '—'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">FİN Kodu</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono text-sm block mt-0.5">
                      {studentDetails.student.fin_code || '—'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Sinfi</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm block mt-0.5">
                      {studentDetails.student.grade_class}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Əlaqə Telefonu</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm block mt-0.5">
                      {studentDetails.student.phone || '—'}
                    </strong>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">İmtahan Sayı</span>
                    <strong className="text-xl font-black text-slate-900 dark:text-white">
                      {studentDetails.exam_history.length}
                    </strong>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Orta Müvəffəqiyyət</span>
                    <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {studentDetails.exam_history.length > 0
                        ? Math.round(studentDetails.exam_history.reduce((a, b) => a + (b.percentage || 0), 0) / studentDetails.exam_history.length)
                        : 0}%
                    </strong>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Ən Yüksək Bal</span>
                    <strong className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {studentDetails.exam_history.length > 0
                        ? Math.max(...studentDetails.exam_history.map(h => h.score || 0))
                        : 0} bal
                    </strong>
                  </div>
                </div>

                {/* Exam History Section */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-600" />
                      <span>İmtahan Nəticələri Tarixçəsi</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">
                      Cəmi {studentDetails.exam_history.length} imtahan
                    </span>
                  </div>

                  {studentDetails.exam_history.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-400">
                      Şagird hələlik heç bir imtahanda iştirak etməyib.
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="py-2.5 px-3">İmtahan Adı</th>
                            <th className="py-2.5 px-3">Fənn</th>
                            <th className="py-2.5 px-3 text-center">D / S / B</th>
                            <th className="py-2.5 px-3 text-center">Bal</th>
                            <th className="py-2.5 px-3 text-center">Nəticə</th>
                            <th className="py-2.5 px-3">Tarix</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {studentDetails.exam_history.map((hist) => (
                            <tr key={hist.session_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                                {hist.test_title}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                                {hist.subject}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                                <span className="text-emerald-600 font-bold">{hist.correct_count}</span> /{' '}
                                <span className="text-rose-500 font-bold">{hist.incorrect_count}</span> /{' '}
                                <span className="text-slate-400">{hist.blank_count}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-black text-indigo-700 dark:text-indigo-400">
                                {hist.score} / {hist.total_points}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  hist.percentage >= 60
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                }`}>
                                  {hist.percentage}%
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                                {hist.completed_at ? new Date(hist.completed_at).toLocaleDateString('az-AZ') : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setViewingStudentId(null);
                      setStudentDetails(null);
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors"
                  >
                    Bağla
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: YENİ ŞAGİRD ƏLAVƏ ET / REDAKTƏ ET                            */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {editingStudent ? 'Şagird Məlumatlarını Redaktə Et' : 'Yeni Şagird Əlavə Et'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Məktəbin vahid UTİS reyestrinə daxil ediləcək məlumatlar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Adı: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="Məs: Əli"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Soyadı: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Məs: Həsənov"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ata adı:
                </label>
                <input
                  type="text"
                  value={formFatherName}
                  onChange={(e) => setFormFatherName(e.target.value)}
                  placeholder="Məs: Namiq"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    7 Rəqəmli UTİS Kodu:
                  </label>
                  <input
                    type="text"
                    maxLength={7}
                    value={formUtis}
                    onChange={(e) => setFormUtis(e.target.value.replace(/\D/g, ''))}
                    placeholder="Məs: 1048291"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    FİN Kodu (7 simvol):
                  </label>
                  <input
                    type="text"
                    maxLength={7}
                    value={formFin}
                    onChange={(e) => setFormFin(e.target.value.toUpperCase())}
                    placeholder="Məs: 7A8B9C1"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sinfi: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none"
                  >
                    {ROMAN_CLASSES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Əlaqə Telefonu:
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+994 50 123 45 67"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Məktəbi:
                </label>
                <input
                  type="text"
                  value={formSchool}
                  onChange={(e) => setFormSchool(e.target.value)}
                  placeholder="Məsələn: 1 nömrəli tam orta məktəb"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5"
                >
                  {formSubmitting ? 'Saxlanılır...' : editingStudent ? 'Yenilə' : 'Əlavə Et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: EXCEL-DƏN İDXAL VİZARDI (3 MƏRHƏLƏLİ)                       */}
      {/* ===================================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto flex flex-col">
            {/* Header with Steps Breadcrumb */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    importStep === 1
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : importStep === 2
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {importStep === 1 && '1-ci Mərhələ: Excel Faylının Seçilməsi'}
                    {importStep === 2 && '2-ci Mərhələ: Məlumatların Yoxlanılması və Önizlənməsi'}
                    {importStep === 3 && '3-cü Mərhələ: İdxal Uğurla Tamamlandı'}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg">
                  UTİS Excel Şagird İdxalı
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: Upload File */}
            {importStep === 1 && (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-base mb-1">
                  UTİS Excel Faylını Buraya Əlavə Edin
                </h4>
                <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                  Excel (.xlsx, .xls) faylınızda <strong>Adı, Soyadı, Ata adı, UTİS kodu, FİN kodu, Sinfi (I-XI), Məktəbi</strong> sütunları avtomatik tanınacaqdır.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-200 dark:shadow-none flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Faylı Kompüterdən Seç</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Nümunə Şablon Yüklə</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Preview & Validation Table */}
            {importStep === 2 && (
              <div className="flex flex-col gap-4">
                {/* Summary Badges & Filters */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div
                    onClick={() => setImportFilter('all')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      importFilter === 'all'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] block opacity-75">Bütün Qeydlər</span>
                    <strong className="text-base font-black">{importSummary.total}</strong>
                  </div>
                  <div
                    onClick={() => setImportFilter('new')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      importFilter === 'new'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200'
                    }`}
                  >
                    <span className="text-[10px] block opacity-75">Yeni Şagirdlər</span>
                    <strong className="text-base font-black">{importSummary.newCount}</strong>
                  </div>
                  <div
                    onClick={() => setImportFilter('update')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      importFilter === 'update'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200'
                    }`}
                  >
                    <span className="text-[10px] block opacity-75">Yenilənəcəklər</span>
                    <strong className="text-base font-black">{importSummary.updateCount}</strong>
                  </div>
                  <div
                    onClick={() => setImportFilter('invalid')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      importFilter === 'invalid'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200'
                    }`}
                  >
                    <span className="text-[10px] block opacity-75">Xətalı / Natamam</span>
                    <strong className="text-base font-black">{importSummary.invalidCount}</strong>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">№</th>
                        <th className="py-2.5 px-3">Ad və Soyad</th>
                        <th className="py-2.5 px-3">Ata adı</th>
                        <th className="py-2.5 px-3">UTİS</th>
                        <th className="py-2.5 px-3">FİN</th>
                        <th className="py-2.5 px-3">Sinfi</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredImportRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            {row.first_name} {row.last_name}
                          </td>
                          <td className="py-2 px-3">
                            {row.father_name ? (
                              <span className="text-slate-800 dark:text-slate-200">{row.father_name}</span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200/50">
                                Ata adı boşdur
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {row.utis_code ? (
                              <span className="font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200/50">
                                {row.utis_code}
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200/50">
                                UTİS yoxdur
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {row.fin_code ? (
                              <span className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/60">
                                {row.fin_code}
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200/50">
                                FİN yoxdur
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-bold text-sky-700 dark:text-sky-300">{row.grade_class}</td>
                          <td className="py-2 px-3">
                            {row.status === 'new' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Yeni
                              </span>
                            )}
                            {row.status === 'needs_update' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                Yenilənəcək
                              </span>
                            )}
                            {row.status === 'invalid' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" title={row.validation_errors.join(', ')}>
                                {row.validation_errors[0] || 'Xətalı'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setImportStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs"
                  >
                    Geri (Başqa fayl seç)
                  </button>

                  <button
                    type="button"
                    disabled={isImporting || parsedImportRows.filter(r => r.status !== 'invalid').length === 0}
                    onClick={handleExecuteImport}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-200 dark:shadow-none flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isImporting ? 'İdxal edilir...' : `İdxalı Təsdiq Et (${parsedImportRows.filter(r => r.status !== 'invalid').length} şagird)`}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Complete Success Report */}
            {importStep === 3 && (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">
                    İdxal Prosesi Uğurla Tamamlandı!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    Şagird məlumatları ATROQ Education vahid elektron reyestrinə daxil edildi və dərhal imtahan moduluna inteqrasiya olundu.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full max-w-sm text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Cəmi Sətir</span>
                    <strong className="text-lg font-black text-slate-800 dark:text-white">{importSummary.total}</strong>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
                    <span className="text-[10px] text-emerald-600 block font-bold">Yeni Əlavə</span>
                    <strong className="text-lg font-black text-emerald-700 dark:text-emerald-300">{importSummary.newCount}</strong>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-xl">
                    <span className="text-[10px] text-blue-600 block font-bold">Yeniləndi</span>
                    <strong className="text-lg font-black text-blue-700 dark:text-blue-300">{importSummary.updateCount}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all mt-2"
                >
                  Şagird Bazasına Qayıt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: İDXAL TARİXÇƏSİ                                             */}
      {/* ===================================================================== */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Excel İdxal Tarixçəsi
                </h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="p-8 text-center text-xs text-slate-400">Yüklənir...</div>
            ) : importHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Hələlik heç bir idxal qeydi mövcud deyil.</div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Faylın Adı</th>
                      <th className="py-2.5 px-3 text-center">Sətirlər</th>
                      <th className="py-2.5 px-3 text-center">İdxal / Yenilənmə</th>
                      <th className="py-2.5 px-3">Tarix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {importHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={item.file_name}>
                          {item.file_name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.total_rows}</td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className="text-emerald-600 font-bold">{item.imported_count}</span> +{' '}
                          <span className="text-blue-600 font-bold">{item.updated_count}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {new Date(item.created_at).toLocaleString('az-AZ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: ŞAGİRDLƏRİN SİLİNMƏSİ TƏSDİQ MODALI (Tələb 3, 4 & 5)         */}
      {/* ===================================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {studentToDeleteSingle
                    ? 'Şagirdin Silinməsini Təsdiq Edin'
                    : 'Seçilmiş Şagirdlərin Silinməsini Təsdiq Edin'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {studentToDeleteSingle
                    ? `«${studentToDeleteSingle.first_name} ${studentToDeleteSingle.last_name}» adlı şagird məktəb bazasından silinəcəkdir.`
                    : `Cəmi ${selectedStudentIds.length} nəfər şagird məktəb bazasından silinəcəkdir.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDeleteSingle(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Details */}
            {studentToDeleteSingle ? (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 text-xs mb-4 flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Şagird:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-bold">
                    {studentToDeleteSingle.first_name} {studentToDeleteSingle.last_name} {studentToDeleteSingle.father_name ? `(${studentToDeleteSingle.father_name} qızı/oğlu)` : ''}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sinfi:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">{studentToDeleteSingle.grade_class}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">UTİS / FİN:</span>
                  <span className="text-slate-700 dark:text-slate-300">{studentToDeleteSingle.utis_code || '—'} / {studentToDeleteSingle.fin_code || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Məktəb:</span>
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[240px]">{studentToDeleteSingle.school_name}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 text-xs mb-4 flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Seçilmiş Şagird Sayı:</span>
                  <strong className="text-rose-600 dark:text-rose-400 font-black text-sm">
                    {selectedStudentIds.length} nəfər
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sinif Filtri:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {selectedGrade !== 'all' ? selectedGrade : 'Bütün Siniflər'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Yalnız seçilmiş {selectedStudentIds.length} şagird silinəcək, digər sinif və şagirdlərin məlumatlarına toxunulmayacaq.
                </p>
              </div>
            )}

            {/* Safety Guarantee Callout */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl mb-5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                <strong>İmtahan Nəticələrinin Qorunması:</strong> Şagirdlərin əvvəllər iştirak etdiyi sınaq imtahanlarının nəticələri və jurnalları arxivdə etibarlı saxlanılacaq və itirilməyəcəkdir.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDeleteSingle(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                İmtina
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-200 dark:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Silinir...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Bəli, Sil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
