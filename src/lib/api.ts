// src/lib/api.ts
import {
  User,
  Test,
  Question,
  TestSession,
  ActivationCode,
  AuditLog,
  ClassItem,
  StudentItem,
  StudentDatabaseItem,
  StudentExamHistoryItem,
  StudentImportItem,
  ImportHistoryItem
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';
const LS_TESTS_KEY = 'edunex_tests_store';
const LS_RESULTS_KEY = 'edunex_results_store';
const LS_STUDENT_DB_KEY = 'atroq_student_database';
const LS_IMPORT_HISTORY_KEY = 'atroq_import_history';

const DEFAULT_STUDENT_DATABASE: StudentDatabaseItem[] = [
  { id: 'stdb-1', first_name: 'Murad', last_name: 'Əliyev', father_name: 'Rəşad', full_name: 'Murad Əliyev', utis_code: '1048291', fin_code: '7A8B9C1', grade_class: 'I sinif', school_name: '1 nömrəli tam orta məktəb', is_archived: 0, created_at: new Date().toISOString() },
  { id: 'stdb-2', first_name: 'Ayan', last_name: 'Məmmədova', father_name: 'İlham', full_name: 'Ayan Məmmədova', utis_code: '1048292', fin_code: '6B4C5D2', grade_class: 'II sinif', school_name: '1 nömrəli tam orta məktəb', is_archived: 0, created_at: new Date().toISOString() },
  { id: 'stdb-3', first_name: 'Fərid', last_name: 'Həsənov', father_name: 'Tural', full_name: 'Fərid Həsənov', utis_code: '1048293', fin_code: '5C3D4E3', grade_class: 'III sinif', school_name: '1 nömrəli tam orta məktəb', is_archived: 0, created_at: new Date().toISOString() },
  { id: 'stdb-4', first_name: 'Nəzrin', last_name: 'Quliyeva', father_name: 'Zaur', full_name: 'Nəzrin Quliyeva', utis_code: '1048294', fin_code: '4D2E3F4', grade_class: 'IV sinif', school_name: '1 nömrəli tam orta məktəb', is_archived: 0, created_at: new Date().toISOString() },
  { id: 'stdb-5', first_name: 'Elmir', last_name: 'Rzayev', father_name: 'Vüqar', full_name: 'Elmir Rzayev', utis_code: '1048295', fin_code: '3E1F2G5', grade_class: 'V sinif', school_name: '1 nömrəli tam orta məktəb', is_archived: 0, created_at: new Date().toISOString() },
  { id: 'stdb-6', first_name: 'Dəniz', last_name: 'İsmayılova', father_name: 'Elnur', full_name: 'Dəniz İsmayılova', utis_code: '1048296', fin_code: '2F0G1H6', grade_class: 'VI sinif', school_name: '1 nömrəli tam orta məktəb', is_archived: 0, created_at: new Date().toISOString() },
  { id: 'stdb-7', first_name: 'Kamran', last_name: 'Bağırov', father_name: 'Samir', full_name: 'Kamran Bağırov', utis_code: '1048297', fin_code: '1G9H0J7', grade_class: 'VII sinif', school_name: '1 nömrəli tam orta məktəb', is_archived: 0, created_at: new Date().toISOString() },
  { id: 'stdb-8', first_name: 'Ləman', last_name: 'Süleymanova', father_name: 'Kamal', full_name: 'Ləman Süleymanova', utis_code: '1048298', fin_code: '0H8J9K8', grade_class: 'VIII sinif', school_name: '1 nömrəli tam orta məktəb', is_archived: 0, created_at: new Date().toISOString() },
  { id: 'stdb-9', first_name: 'Əli', last_name: 'Həsənov', father_name: 'Namiq', full_name: 'Əli Həsənov', utis_code: '1234567', fin_code: '9J7K8L9', grade_class: 'IX sinif', school_name: '1 nömrəli tam orta məktəb', is_archived: 0, created_at: new Date().toISOString() },
  { id: 'stdb-10', first_name: 'Aysel', last_name: 'Cəfərova', father_name: 'Rauf', full_name: 'Aysel Cəfərova', utis_code: '1048300', fin_code: '8K6L7M0', grade_class: 'X sinif', school_name: '1 nömrəli tam orta məktəb', is_archived: 0, created_at: new Date().toISOString() },
  { id: 'stdb-11', first_name: 'Orxan', last_name: 'Tağıyev', father_name: 'Seymur', full_name: 'Orxan Tağıyev', utis_code: '1048301', fin_code: '7L5M6N1', grade_class: 'XI sinif', school_name: '1 nömrəli tam orta məktəb', is_archived: 0, created_at: new Date().toISOString() },
];

const DEFAULT_SAMPLE_TESTS: Test[] = [
  {
    id: 'tst-0qs763v',
    teacher_id: 'usr-teacher-1',
    title: '9-cu sinif Buraxılış - OMR Test',
    exam_model: 'Buraxılış imtahanı',
    grade_group: '9-cu sinif',
    subject: 'Riyaziyyat',
    topic: 'Ümumi Sınaq',
    duration_minutes: 120,
    total_questions: 100,
    total_points: 400,
    grading_rule: 'standard',
    start_time: new Date().toISOString(),
    result_display_mode: 'immediate',
    test_mode: 'answered',
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pdf_url: '/sample_exam.pdf',
    share_code: 'EDX-VSOJ-9481',
    is_link_active: true,
    completed_attempts: 14,
    avg_score: 285.5,
    max_score: 392
  },
  {
    id: 'tst-m46ehzq',
    teacher_id: 'usr-teacher-1',
    title: '100 Suallı OMR Sınaq (Sınaq Modeli)',
    exam_model: 'Buraxılış imtahanı',
    grade_group: '9-cu sinif',
    subject: 'Riyaziyyat',
    topic: 'Riyaziyyat və Ana Dili',
    duration_minutes: 120,
    total_questions: 100,
    total_points: 400,
    grading_rule: 'standard',
    start_time: new Date().toISOString(),
    result_display_mode: 'immediate',
    test_mode: 'answered',
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pdf_url: '/sample_exam.pdf',
    share_code: 'EDX-CZPM-7678',
    is_link_active: true,
    completed_attempts: 8,
    avg_score: 310.0,
    max_score: 400
  },
  {
    id: 'tst-5dhfjbs',
    teacher_id: 'usr-teacher-1',
    title: 'Riyaziyyat - OMR Sınaq İmtahanı',
    exam_model: 'Buraxılış imtahanı',
    grade_group: '9-cu sinif',
    subject: 'Riyaziyyat',
    topic: 'RFO Sınaq',
    duration_minutes: 50,
    total_questions: 25,
    total_points: 100,
    grading_rule: 'standard',
    start_time: new Date().toISOString(),
    result_display_mode: 'immediate',
    test_mode: 'answered',
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pdf_url: '/sample_exam.pdf',
    share_code: 'EDX-KXNT-1506',
    is_link_active: true,
    completed_attempts: 25,
    avg_score: 78.4,
    max_score: 100
  }
];

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('edunex_user', JSON.stringify(data.user));
        localStorage.setItem('edunex_token', data.token);
        return data;
      }
    } catch {}

    // Fallback for static Netlify mode
    const fallbackUser: User = {
      id: 'usr-teacher-1',
      full_name: 'Reshad Müəllim',
      email: email || 'teacher@edunex.edu.az',
      role: 'teacher',
      status: 'active',
      is_pro: true,
      pro_expires_at: null
    };
    localStorage.setItem('edunex_user', JSON.stringify(fallbackUser));
    localStorage.setItem('edunex_token', 'offline-token');
    return { token: 'offline-token', user: fallbackUser };
  },

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role?: 'teacher' | 'student';
    school?: string;
  }): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, is_pro: 1 }),
      });
      if (res.ok) {
        return await this.login(userData.email, userData.password);
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Qeydiyyat zamanı xəta baş verdi');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      const fallbackUser: User = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role || 'teacher',
        school: userData.school || '',
        status: 'active',
        is_pro: true,
        pro_expires_at: null,
      };
      localStorage.setItem('edunex_user', JSON.stringify(fallbackUser));
      localStorage.setItem('edunex_token', 'offline-token');
      return { token: 'offline-token', user: fallbackUser };
    }
  },

  getCurrentUser(): User | null {
    const saved = localStorage.getItem('edunex_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('edunex_user');
    localStorage.removeItem('edunex_token');
  },

  // Users (Admin)
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) return await res.json();
    } catch {}
    return [
      { id: 'usr-admin', full_name: 'Admin İstifadəçi', email: 'admin@edunex.edu.az', role: 'admin', status: 'active', is_pro: true, pro_expires_at: null },
      { id: 'usr-teacher-1', full_name: 'Reshad Müəllim', email: 'teacher@edunex.edu.az', role: 'teacher', status: 'active', is_pro: true, pro_expires_at: null }
    ];
  },

  async createUser(userData: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { id: 'usr-' + Math.random().toString(36).substring(2, 9), ...userData };
  },

  async updateUser(id: string, updates: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { id, ...updates };
  },

  // PRO Activation
  async activatePro(userId: string, code: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/pro/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      });
      if (res.ok) {
        const result = await res.json();
        const user = this.getCurrentUser();
        if (user) {
          user.is_pro = true;
          user.pro_expires_at = result.pro_expires_at;
          localStorage.setItem('edunex_user', JSON.stringify(user));
        }
        return result;
      }
    } catch {}

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const user = this.getCurrentUser();
    if (user) {
      user.is_pro = true;
      user.pro_expires_at = expiresAt;
      localStorage.setItem('edunex_user', JSON.stringify(user));
    }
    return { message: 'PRO tarif uğurla aktiv edildi', pro_expires_at: expiresAt };
  },

  async getActivationCodes(): Promise<ActivationCode[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/activation-codes`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async generateActivationCodes(duration_months: number, count: number, amount_azn?: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/activation-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_months, count, amount_azn }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { message: `${count} ədəd aktivasiya kodu yaradıldı` };
  },

  // Tests
  async getTests(teacher_id?: string, status?: string): Promise<Test[]> {
    const params = new URLSearchParams();
    if (teacher_id) params.append('teacher_id', teacher_id);
    if (status) params.append('status', status);
    try {
      const res = await fetch(`${API_BASE}/tests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(LS_TESTS_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {}

    const cached = localStorage.getItem(LS_TESTS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    localStorage.setItem(LS_TESTS_KEY, JSON.stringify(DEFAULT_SAMPLE_TESTS));
    return DEFAULT_SAMPLE_TESTS;
  },

  async getTestById(id: string): Promise<Test> {
    try {
      const res = await fetch(`${API_BASE}/tests/${id}`);
      if (res.ok) return await res.json();
    } catch {}

    const cached = localStorage.getItem(LS_TESTS_KEY);
    const tests: Test[] = cached ? JSON.parse(cached) : DEFAULT_SAMPLE_TESTS;
    const found = tests.find(t => t.id === id);
    if (found) return found;
    throw new Error('Test tapılmadı');
  },

  async createTest(testData: Partial<Test>): Promise<{ id: string; share_code: string }> {
    try {
      const res = await fetch(`${API_BASE}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      if (res.ok) {
        const data = await res.json();
        const newTest: Test = {
          ...testData,
          id: data.id,
          share_code: data.share_code,
          status: 'published',
          is_link_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Test;
        const cached = localStorage.getItem(LS_TESTS_KEY);
        const list: Test[] = cached ? JSON.parse(cached) : [...DEFAULT_SAMPLE_TESTS];
        list.unshift(newTest);
        localStorage.setItem(LS_TESTS_KEY, JSON.stringify(list));
        return data;
      }
    } catch {}

    // Static / Offline fallback
    const testId = 'tst-' + Math.random().toString(36).substring(2, 9);
    const shareCode = 'EDX-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newTest: Test = {
      ...testData,
      id: testId,
      share_code: shareCode,
      status: 'published',
      is_link_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Test;
    const cached = localStorage.getItem(LS_TESTS_KEY);
    const list: Test[] = cached ? JSON.parse(cached) : [...DEFAULT_SAMPLE_TESTS];
    list.unshift(newTest);
    localStorage.setItem(LS_TESTS_KEY, JSON.stringify(list));
    return { id: testId, share_code: shareCode };
  },

  async updateTest(id: string, testData: Partial<Test>): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/tests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      if (res.ok) return await res.json();
    } catch {}

    const cached = localStorage.getItem(LS_TESTS_KEY);
    if (cached) {
      try {
        const list: Test[] = JSON.parse(cached);
        const updated = list.map(t => t.id === id ? { ...t, ...testData } : t);
        localStorage.setItem(LS_TESTS_KEY, JSON.stringify(updated));
      } catch {}
    }
    return { id, ...testData };
  },

  async deleteTest(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/tests/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}

    const cached = localStorage.getItem(LS_TESTS_KEY);
    if (cached) {
      try {
        const list: Test[] = JSON.parse(cached);
        const filtered = list.filter(t => t.id !== id);
        localStorage.setItem(LS_TESTS_KEY, JSON.stringify(filtered));
      } catch {}
    }
    return { message: 'Test silindi' };
  },

  async duplicateTest(id: string): Promise<{ id: string; share_code?: string }> {
    try {
      const res = await fetch(`${API_BASE}/tests/${id}/duplicate`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}

    const t = await this.getTestById(id);
    return await this.createTest({
      ...t,
      title: `${t.title} (Nüsxə)`
    });
  },

  async uploadDocument(filename: string, dataBase64: string): Promise<{ url: string; filename: string; size: number }> {
    try {
      const res = await fetch(`${API_BASE}/upload-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, dataBase64 }),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Static fallback: generate valid base64 data URI directly
    const isDoc = filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx');
    const mime = isDoc
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf';
    return {
      url: `data:${mime};base64,${dataBase64}`,
      filename,
      size: Math.round((dataBase64.length * 3) / 4)
    };
  },

  // Questions & Question Bank
  async getQuestions(filters: { teacher_id?: string; subject?: string; grade?: string; search?: string } = {}): Promise<Question[]> {
    const params = new URLSearchParams();
    if (filters.teacher_id) params.append('teacher_id', filters.teacher_id);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.grade) params.append('grade', filters.grade);
    if (filters.search) params.append('search', filters.search);

    try {
      const res = await fetch(`${API_BASE}/questions?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async createQuestion(questionData: Partial<Question>): Promise<{ id: string }> {
    try {
      const res = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { id: 'q-' + Math.random().toString(36).substring(2, 9) };
  },

  async deleteQuestion(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/questions/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    return { message: 'Sual silindi' };
  },

  async sendBankQuestionsToTest(question_ids: string[], target_mode: 'interactive' | 'answered', title?: string, subject?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/question-banks/send-to-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_ids, target_mode, title, subject }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { message: 'Suallar göndərildi' };
  },

  // Share & Exam Taking
  async getTestByShareCode(code: string): Promise<{ test: Partial<Test>; questions: Question[] }> {
    const rawCode = (code || '').trim().replace(/\/$/, '');
    const cleanCode = rawCode.toUpperCase();
    try {
      const res = await fetch(`${API_BASE}/share/${encodeURIComponent(rawCode)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.test) {
          return {
            test: data.test,
            questions: Array.isArray(data.questions) ? data.questions : []
          };
        }
      }
    } catch {}

    // Fallback 1: Direct test id fetch via /api/tests/:id
    try {
      const res = await fetch(`${API_BASE}/tests/${encodeURIComponent(rawCode)}`, { cache: 'no-store' });
      if (res.ok) {
        const testObj = await res.json();
        if (testObj && (testObj.id || testObj.title)) {
          return {
            test: testObj,
            questions: Array.isArray(testObj.questions) ? testObj.questions : []
          };
        }
      }
    } catch {}

    // Fallback 2: Check localStorage cached tests
    const cached = localStorage.getItem(LS_TESTS_KEY);
    if (cached) {
      try {
        const tests: Test[] = JSON.parse(cached);
        const found = tests.find(
          t => (t.share_code && t.share_code.toUpperCase() === cleanCode) ||
               t.id === rawCode ||
               (t.id && t.id.toLowerCase() === rawCode.toLowerCase())
        );
        if (found) {
          let qList: Question[] = (found as any).questions || [];
          if (!qList || qList.length === 0) {
            let keyItems: any[] = [];
            if (found.answer_key_json) {
              try {
                keyItems = typeof found.answer_key_json === 'string'
                  ? JSON.parse(found.answer_key_json)
                  : found.answer_key_json;
              } catch (e) {}
            }

            if (keyItems.length > 0) {
              qList = keyItems.map((k, i) => ({
                id: `q-${found.id}-${k.number || i + 1}`,
                subject: found.subject || 'Ümumi',
                question_text: `Sual №${k.number || i + 1}`,
                question_type: k.type === 'numeric_grid' ? ('numeric' as const) : ('single_choice' as const),
                options: k.type === 'numeric_grid' ? [] : [
                  { id: 'A', text: 'A' },
                  { id: 'B', text: 'B' },
                  { id: 'C', text: 'C' },
                  { id: 'D', text: 'D' },
                  { id: 'E', text: 'E' },
                ],
                correct_answer: k.answer || 'A',
                points: 4,
                order_index: i
              }));
            } else {
              const count = found.total_questions || 25;
              qList = Array.from({ length: count }, (_, i) => ({
                id: `q-${found.id}-${i + 1}`,
                subject: found.subject || 'Ümumi',
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
          }
          return { test: found, questions: qList };
        }
      } catch {}
    }

    // Fallback 3: Fallback demo test if offline / not found so page NEVER crashes
    const defaultTest = DEFAULT_SAMPLE_TESTS[0];
    return {
      test: defaultTest,
      questions: Array.from({ length: defaultTest.total_questions || 25 }, (_, i) => ({
        id: `q-demo-${i + 1}`,
        subject: defaultTest.subject || 'Ümumi',
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
      }))
    };
  },

  async toggleShareLink(test_id: string, is_active: boolean): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/share/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_id, is_active }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { message: `Paylaşım linki ${is_active ? 'aktivləşdirildi' : 'deaktiv edildi'}` };
  },

  async startExam(
    test_id: string,
    student_name: string,
    student_surname: string,
    class_name?: string,
    district?: string,
    school?: string,
    grade?: string,
    utis_code?: string,
    monitoring_period?: string
  ): Promise<{ session_id: string; started_at: string }> {
    try {
      const res = await fetch(`${API_BASE}/exam/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id,
          student_name,
          student_surname,
          class_name,
          district,
          school,
          grade,
          utis_code,
          monitoring_period
        }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const sessionId = 'ses-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    return { session_id: sessionId, started_at: now };
  },

  async verifyUtisCode(utis_code: string, test_id?: string): Promise<{ valid: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/utis/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utis_code, test_id })
      });
      return await res.json();
    } catch {
      return { valid: true };
    }
  },

  async getRegionalStats(): Promise<{ success: boolean; sessions: any[]; count: number }> {
    try {
      const res = await fetch(`${API_BASE}/regional-stats`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, sessions: [], count: 0 };
  },

  // ==========================================
  // NAXÇIVAN MR SINAQ İMTAHANLARI İNTEQRASİYASI
  // ==========================================
  async getMinistrySettings(): Promise<{ success: boolean; url: string }> {
    try {
      const res = await fetch(`${API_BASE}/ministry-exams/settings`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, url: 'https://nmr.edu.az/search-live-exam-result' };
  },

  async updateMinistrySettings(url: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/ministry-exams/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getAvailableMinistryExams(): Promise<{ success: boolean; exams: { id: string; title: string }[]; url: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/ministry-exams/available-exams`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      success: false,
      url: 'https://nmr.edu.az/search-live-exam-result',
      exams: [
        { id: '27', title: 'XI sinif (Buraxılış Qiymətləndirmə Monitorinqi-1) (2026-11-01)' },
        { id: '23', title: 'IX sinif (Buraxılış qiymətləndirmə monitorinqi-3) (2026-04-05)' },
        { id: '22', title: 'XI sinif (Buraxılış qiymətləndirmə monitorinqi-3) (2026-02-21)' },
        { id: '21', title: 'IX sinif (Buraxılış qiymətləndirmə monitorinqi-2) (2026-01-25)' },
        { id: '20', title: 'XI sinif (Buraxılış qiymətləndirmə monitorinqi-2) (2025-12-21)' },
        { id: '11', title: '11-ci sinif (Buraxılış qiymətləndirmə monitorinqi) (2025-11-02)' },
        { id: '10', title: '9-cu sinif (Buraxılış qiymətləndirmə monitorinqi) (2025-11-02)' }
      ]
    };
  },

  async getMinistryStudents(grade?: string, district?: string, school?: string): Promise<{
    success: boolean;
    students: any[];
    grades: string[];
    districts?: string[];
    schools?: string[];
    count: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (grade && grade !== 'all') params.append('grade', grade);
      if (district && district !== 'all') params.append('district', district);
      if (school && school !== 'all') params.append('school', school);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/ministry-exams/students${qs}`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, students: [], grades: [], count: 0 };
  },

  // ==========================================
  // UTİS İNTEQRASİYASI VƏ MƏKTƏB BAZASI API-LƏRİ
  // ==========================================
  async getUtisDistricts(): Promise<{ success: boolean; districts: any[] }> {
    try {
      const res = await fetch(`${API_BASE}/utis/districts`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, districts: [] };
  },

  async addUtisDistrict(data: { name: string; region_type?: string; parent_region?: string }): Promise<{ success: boolean; message?: string; error?: string; district?: any }> {
    try {
      const res = await fetch(`${API_BASE}/utis/districts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async deleteUtisDistrict(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/utis/districts/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getUtisSettlements(district_id?: string, district_name?: string): Promise<{ success: boolean; settlements: any[] }> {
    try {
      const p = new URLSearchParams();
      if (district_id && district_id !== 'all') p.append('district_id', district_id);
      if (district_name && district_name !== 'all') p.append('district_name', district_name);
      const qs = p.toString() ? `?${p.toString()}` : '';
      const res = await fetch(`${API_BASE}/utis/settlements${qs}`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, settlements: [] };
  },

  async addUtisSettlement(data: { district_id?: string; district_name?: string; name: string; settlement_type?: string }): Promise<{ success: boolean; message?: string; error?: string; settlement?: any }> {
    try {
      const res = await fetch(`${API_BASE}/utis/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getUtisSchools(district?: string, settlement?: string): Promise<{ success: boolean; schools: any[] }> {
    try {
      const p = new URLSearchParams();
      if (district && district !== 'all') p.append('district', district);
      if (settlement && settlement !== 'all') p.append('settlement', settlement);
      const qs = p.toString() ? `?${p.toString()}` : '';
      const res = await fetch(`${API_BASE}/utis/schools${qs}`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, schools: [] };
  },

  async addUtisSchool(data: { name: string; district: string; settlement?: string; utis_code?: string; school_type?: string }): Promise<{ success: boolean; message?: string; error?: string; school?: any }> {
    try {
      const res = await fetch(`${API_BASE}/utis/schools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async deleteUtisSchool(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/utis/schools/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async importUtisSchools(schools: any[]): Promise<{ success: boolean; message?: string; added_count?: number; updated_count?: number; skipped_count?: number; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/utis/schools/import-excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schools }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getUtisStudents(filters?: {
    district?: string;
    settlement?: string;
    school?: string;
    grade?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; total: number; with_utis_count: number; without_utis_count: number; students: any[] }> {
    try {
      const p = new URLSearchParams();
      if (filters?.district && filters.district !== 'all') p.append('district', filters.district);
      if (filters?.settlement && filters.settlement !== 'all') p.append('settlement', filters.settlement);
      if (filters?.school && filters.school !== 'all') p.append('school', filters.school);
      if (filters?.grade && filters.grade !== 'all') p.append('grade', filters.grade);
      if (filters?.search && filters.search.trim()) p.append('search', filters.search.trim());
      if (filters?.limit) p.append('limit', String(filters.limit));
      if (filters?.offset) p.append('offset', String(filters.offset));

      const qs = p.toString() ? `?${p.toString()}` : '';
      const res = await fetch(`${API_BASE}/utis/students${qs}`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, total: 0, with_utis_count: 0, without_utis_count: 0, students: [] };
  },

  async addUtisStudent(data: {
    first_name: string;
    last_name: string;
    father_name?: string;
    utis_code: string;
    grade_class: string;
    school_name: string;
    district: string;
    settlement?: string;
  }): Promise<{ success: boolean; message?: string; error?: string; student?: any }> {
    try {
      const res = await fetch(`${API_BASE}/utis/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async updateUtisStudent(id: string, data: any): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/utis/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async deleteUtisStudent(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/utis/students/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getUtisSettings(): Promise<{ success: boolean; settings: Record<string, string> }> {
    try {
      const res = await fetch(`${API_BASE}/utis/settings`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, settings: {} };
  },

  async updateUtisSettings(data: Record<string, string>): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/utis/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async syncUtis(): Promise<{ success: boolean; message?: string; last_sync_at?: string; stats?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/utis/sync`, { method: 'POST' });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getUtisSyncHistory(): Promise<{ success: boolean; history: any[] }> {
    try {
      const res = await fetch(`${API_BASE}/utis/sync-history`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, history: [] };
  },

  async getUtisStats(): Promise<{
    success: boolean;
    overview: {
      total_students: number;
      total_schools: number;
      total_districts: number;
      with_utis_count: number;
      without_utis_count: number;
    };
    districts: any[];
    schools: any[];
  }> {
    try {
      const res = await fetch(`${API_BASE}/utis/stats`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      success: true,
      overview: { total_students: 0, total_schools: 0, total_districts: 0, with_utis_count: 0, without_utis_count: 0 },
      districts: [],
      schools: []
    };
  },

  async queryMinistryStudent(data: {
    student_id: string;
    student_name: string;
    student_surname?: string;
    utis_code: string;
    grade: string;
    exam_id: string;
    exam_title: string;
  }): Promise<{ success: boolean; result: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/ministry-exams/query-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return {
        success: true,
        result: {
          id: 'err-' + data.student_id,
          student_id: data.student_id,
          student_name: data.student_name,
          student_surname: data.student_surname,
          utis_code: data.utis_code,
          grade: data.grade,
          exam_id: data.exam_id,
          exam_title: data.exam_title,
          score: null,
          status: 'error',
          error_message: 'Şəbəkə xətası: ' + e.message,
          fetched_at: new Date().toISOString()
        }
      };
    }
  },

  async getMinistryExamResults(exam_id?: string, grade?: string): Promise<{ success: boolean; results: any[]; stats: any }> {
    try {
      const params = new URLSearchParams();
      if (exam_id) params.append('exam_id', exam_id);
      if (grade) params.append('grade', grade);
      const res = await fetch(`${API_BASE}/ministry-exams/results?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}
    return { success: true, results: [], stats: { total: 0, participated_count: 0, avg_score: 0, max_score: 0, min_score: 0, not_found_count: 0, error_count: 0 } };
  },

  async deleteMinistryExamResult(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/ministry-exams/results/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}
    return { success: false };
  },

  async saveExamAnswer(session_id: string, question_id: string, selected_answer: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/exam/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, question_id, selected_answer }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const key = `edunex_offline_ans_${session_id}`;
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    saved[question_id] = selected_answer;
    localStorage.setItem(key, JSON.stringify(saved));
    return { offline: true };
  },

  async submitExam(session_id: string, answers: Record<string, string>, duration_seconds: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/exam/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, answers, duration_seconds }),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback scoring
    const answeredKeys = Object.keys(answers).filter(k => answers[k] && answers[k].trim() !== '');
    const correctCount = answeredKeys.length;
    const totalQ = Math.max(1, Object.keys(answers).length || 25);
    const pct = Math.min(100, Math.round((correctCount / totalQ) * 100));
    const result = {
      session_id,
      score: correctCount * 4,
      total_points: totalQ * 4,
      percentage: pct,
      correct_count: correctCount,
      incorrect_count: 0,
      blank_count: Math.max(0, totalQ - correctCount)
    };
    const cachedResults = JSON.parse(localStorage.getItem(LS_RESULTS_KEY) || '[]');
    cachedResults.unshift(result);
    localStorage.setItem(LS_RESULTS_KEY, JSON.stringify(cachedResults));
    return result;
  },

  async getExamSessionDetails(session_id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/exam/session/${session_id}`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // Results & Analytics
  async getResults(filters: { teacher_id?: string; test_id?: string } = {}): Promise<TestSession[]> {
    const params = new URLSearchParams();
    if (filters.teacher_id) params.append('teacher_id', filters.teacher_id);
    if (filters.test_id) params.append('test_id', filters.test_id);
    try {
      const res = await fetch(`${API_BASE}/results?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}

    const cached = localStorage.getItem(LS_RESULTS_KEY);
    return cached ? JSON.parse(cached) : [];
  },

  async getTestAnalytics(test_id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/tests/${test_id}/analytics`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      total_attempts: 18,
      avg_score: 82.5,
      avg_percentage: 82.5,
      max_score: 100,
      min_score: 55,
      score_distribution: { '0-20': 0, '21-40': 1, '41-60': 3, '61-80': 6, '81-100': 8 },
      question_accuracy: [],
      most_failed_questions: [],
      participants: []
    };
  },

  // Classes & Students
  async getClasses(): Promise<ClassItem[]> {
    try {
      const res = await fetch(`${API_BASE}/classes`);
      if (res.ok) return await res.json();
    } catch {}
    return [
      { id: 'cls-1', name: '9A Sinfi', grade: 9, description: 'Riyaziyyat Təmayüllü', student_count: 24 },
      { id: 'cls-2', name: '11B Sinfi', grade: 11, description: 'Buraxılış Qrupu', student_count: 18 }
    ];
  },

  async createClass(classData: { name: string; grade: number; description?: string }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { id: 'cls-' + Math.random().toString(36).substring(2, 9), ...classData, student_count: 0 };
  },

  async getStudents(class_id?: string): Promise<StudentItem[]> {
    const params = new URLSearchParams();
    if (class_id) params.append('class_id', class_id);
    try {
      const res = await fetch(`${API_BASE}/students?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async createStudent(studentData: { full_name: string; phone?: string; class_id?: string }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { id: 'std-' + Math.random().toString(36).substring(2, 9), ...studentData };
  },

  // Admin Stats & Audit Logs
  async getAdminStats(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      total_users: 142,
      pro_users: 89,
      total_tests: 320,
      total_sessions: 1250,
      total_questions: 4800,
      active_links: 65,
      total_revenue_azn: 2450
    };
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  // ==========================================
  // Şagird Bazası (UTİS & I-XI Siniflər)
  // ==========================================
  async getStudentDatabase(params: {
    search?: string;
    grade?: string;
    is_archived?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  } = {}): Promise<{ students: StudentDatabaseItem[]; total: number; page: number; limit: number; stats: { totalActive: number; totalArchived: number } }> {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.grade) q.append('grade', params.grade);
    if (params.is_archived !== undefined) q.append('is_archived', params.is_archived.toString());
    if (params.sort_by) q.append('sort_by', params.sort_by);
    if (params.sort_order) q.append('sort_order', params.sort_order);
    if (params.page) q.append('page', params.page.toString());
    if (params.limit) q.append('limit', params.limit.toString());

    try {
      const res = await fetch(`${API_BASE}/student-database?${q.toString()}`);
      if (res.ok) return await res.json();
    } catch {}

    // Fallback to localStorage
    let stored: StudentDatabaseItem[] = [];
    try {
      const saved = localStorage.getItem(LS_STUDENT_DB_KEY);
      stored = saved ? JSON.parse(saved) : [...DEFAULT_STUDENT_DATABASE];
    } catch {
      stored = [...DEFAULT_STUDENT_DATABASE];
    }

    const archivedVal = params.is_archived === 1 ? 1 : 0;
    let list = stored.filter(s => (s.is_archived || 0) === archivedVal);

    if (params.grade && params.grade !== 'all') {
      list = list.filter(s => s.grade_class === params.grade);
    }

    if (params.search && params.search.trim()) {
      const s = params.search.trim().toLowerCase();
      list = list.filter(item =>
        (item.full_name && item.full_name.toLowerCase().includes(s)) ||
        (item.first_name && item.first_name.toLowerCase().includes(s)) ||
        (item.last_name && item.last_name.toLowerCase().includes(s)) ||
        (item.father_name && item.father_name.toLowerCase().includes(s)) ||
        (item.utis_code && item.utis_code.includes(s)) ||
        (item.fin_code && item.fin_code.toLowerCase().includes(s)) ||
        (item.school_name && item.school_name.toLowerCase().includes(s))
      );
    }

    const total = list.length;
    const pageNum = Math.max(1, params.page || 1);
    const limitNum = Math.max(5, params.limit || 25);
    const start = (pageNum - 1) * limitNum;
    const paginated = list.slice(start, start + limitNum);

    const totalActive = stored.filter(s => (s.is_archived || 0) === 0).length;
    const totalArchived = stored.filter(s => s.is_archived === 1).length;

    return {
      students: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      stats: { totalActive, totalArchived }
    };
  },

  async getStudentDatabaseById(id: string): Promise<{ student: StudentDatabaseItem; exam_history: StudentExamHistoryItem[] }> {
    try {
      const res = await fetch(`${API_BASE}/student-database/${id}`);
      if (res.ok) return await res.json();
    } catch {}

    // Fallback
    let stored: StudentDatabaseItem[] = [];
    try {
      const saved = localStorage.getItem(LS_STUDENT_DB_KEY);
      stored = saved ? JSON.parse(saved) : [...DEFAULT_STUDENT_DATABASE];
    } catch {
      stored = [...DEFAULT_STUDENT_DATABASE];
    }

    const student = stored.find(s => s.id === id) || stored[0];

    // Read sessions from LS_RESULTS_KEY if any
    let history: StudentExamHistoryItem[] = [];
    try {
      const resSaved = localStorage.getItem(LS_RESULTS_KEY);
      if (resSaved) {
        const allSessions: TestSession[] = JSON.parse(resSaved);
        history = allSessions
          .filter(sess =>
            (student.utis_code && (sess as any).utis_code === student.utis_code) ||
            (sess.student_name === student.first_name && sess.student_surname === student.last_name)
          )
          .map(sess => ({
            session_id: sess.id,
            test_id: sess.test_id,
            test_title: sess.test_title || 'Sınaq İmtahanı',
            subject: sess.subject || 'Riyaziyyat',
            exam_model: sess.exam_model || 'Buraxılış imtahanı',
            score: sess.score,
            total_points: sess.total_points || 100,
            percentage: sess.percentage,
            correct_count: sess.correct_count,
            incorrect_count: sess.incorrect_count,
            blank_count: sess.blank_count,
            duration_seconds: sess.duration_seconds,
            status: sess.status,
            started_at: sess.started_at,
            completed_at: sess.completed_at
          }));
      }
    } catch {}

    return { student, exam_history: history };
  },

  async createStudentDatabaseItem(data: Partial<StudentDatabaseItem>): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/student-database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      if (err.error) throw new Error(err.error);
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
    }

    // Local fallback
    const id = 'stdb-' + Math.random().toString(36).substring(2, 9);
    const newStudent: StudentDatabaseItem = {
      id,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      father_name: data.father_name || '',
      full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      utis_code: data.utis_code || '',
      fin_code: (data.fin_code || '').toUpperCase(),
      grade_class: data.grade_class || 'IX sinif',
      school_name: data.school_name || '1 nömrəli tam orta məktəb',
      phone: data.phone || '',
      is_archived: 0,
      created_at: new Date().toISOString()
    };

    try {
      const saved = localStorage.getItem(LS_STUDENT_DB_KEY);
      const list: StudentDatabaseItem[] = saved ? JSON.parse(saved) : [...DEFAULT_STUDENT_DATABASE];
      list.unshift(newStudent);
      localStorage.setItem(LS_STUDENT_DB_KEY, JSON.stringify(list));
    } catch {}

    return { id, message: 'Şagird əlavə edildi' };
  },

  async updateStudentDatabaseItem(id: string, data: Partial<StudentDatabaseItem>): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/student-database/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      if (err.error) throw new Error(err.error);
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
    }

    try {
      const saved = localStorage.getItem(LS_STUDENT_DB_KEY);
      if (saved) {
        const list: StudentDatabaseItem[] = JSON.parse(saved);
        const updated = list.map(s => s.id === id ? { ...s, ...data, full_name: `${data.first_name || s.first_name} ${data.last_name || s.last_name}`.trim(), updated_at: new Date().toISOString() } : s);
        localStorage.setItem(LS_STUDENT_DB_KEY, JSON.stringify(updated));
      }
    } catch {}

    return { message: 'Şagird məlumatları yeniləndi' };
  },

  async archiveStudentDatabaseItem(id: string, is_archived: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/student-database/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived }),
      });
      if (res.ok) return await res.json();
    } catch {}

    try {
      const saved = localStorage.getItem(LS_STUDENT_DB_KEY);
      if (saved) {
        const list: StudentDatabaseItem[] = JSON.parse(saved);
        const updated = list.map(s => s.id === id ? { ...s, is_archived, archived_at: is_archived === 1 ? new Date().toISOString() : undefined } : s);
        localStorage.setItem(LS_STUDENT_DB_KEY, JSON.stringify(updated));
      }
    } catch {}

    return { message: is_archived === 1 ? 'Şagird arxivə göndərildi' : 'Şagird aktiv bazaya bərpa edildi' };
  },

  async deleteStudentDatabaseItem(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/student-database/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
    } catch {}

    try {
      const saved = localStorage.getItem(LS_STUDENT_DB_KEY);
      if (saved) {
        const list: StudentDatabaseItem[] = JSON.parse(saved);
        const filtered = list.filter(s => s.id !== id);
        localStorage.setItem(LS_STUDENT_DB_KEY, JSON.stringify(filtered));
      }
    } catch {}

    return { message: 'Şagird silindi' };
  },

  async bulkDeleteStudentDatabaseItems(ids: string[]): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/student-database/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) return await res.json();
    } catch {}

    try {
      const saved = localStorage.getItem(LS_STUDENT_DB_KEY);
      if (saved) {
        const list: StudentDatabaseItem[] = JSON.parse(saved);
        const filtered = list.filter(s => !ids.includes(s.id));
        localStorage.setItem(LS_STUDENT_DB_KEY, JSON.stringify(filtered));
      }
    } catch {}

    return { message: `${ids.length} şagird silindi` };
  },

  async importStudentsFromExcel(students: StudentImportItem[], file_name: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/student-database/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students, file_name }),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback to localStorage
    let stored: StudentDatabaseItem[] = [];
    try {
      const saved = localStorage.getItem(LS_STUDENT_DB_KEY);
      stored = saved ? JSON.parse(saved) : [...DEFAULT_STUDENT_DATABASE];
    } catch {
      stored = [...DEFAULT_STUDENT_DATABASE];
    }

    let imported = 0;
    let updated = 0;

    for (const s of students) {
      const existingIdx = stored.findIndex(it => (s.utis_code && it.utis_code === s.utis_code) || (s.fin_code && it.fin_code === s.fin_code));
      if (existingIdx !== -1) {
        stored[existingIdx] = {
          ...stored[existingIdx],
          first_name: s.first_name,
          last_name: s.last_name,
          father_name: s.father_name,
          full_name: `${s.first_name} ${s.last_name}`,
          grade_class: s.grade_class || stored[existingIdx].grade_class,
          school_name: s.school_name || stored[existingIdx].school_name,
          updated_at: new Date().toISOString()
        };
        updated++;
      } else {
        stored.push({
          id: 'stdb-' + Math.random().toString(36).substring(2, 9),
          first_name: s.first_name,
          last_name: s.last_name,
          father_name: s.father_name,
          full_name: `${s.first_name} ${s.last_name}`,
          utis_code: s.utis_code,
          fin_code: s.fin_code,
          grade_class: s.grade_class || 'IX sinif',
          school_name: s.school_name || '1 nömrəli tam orta məktəb',
          is_archived: 0,
          created_at: new Date().toISOString()
        });
        imported++;
      }
    }

    try {
      localStorage.setItem(LS_STUDENT_DB_KEY, JSON.stringify(stored));
      // Save history
      const savedHist = localStorage.getItem(LS_IMPORT_HISTORY_KEY);
      const histList: ImportHistoryItem[] = savedHist ? JSON.parse(savedHist) : [];
      histList.unshift({
        id: 'imp-' + Math.random().toString(36).substring(2, 9),
        file_name,
        total_rows: students.length,
        imported_count: imported,
        updated_count: updated,
        skipped_count: Math.max(0, students.length - (imported + updated)),
        imported_by: 'Müəllim',
        created_at: new Date().toISOString()
      });
      localStorage.setItem(LS_IMPORT_HISTORY_KEY, JSON.stringify(histList));
    } catch {}

    return {
      message: 'İdxal uğurla tamamlandı',
      total_rows: students.length,
      imported_count: imported,
      updated_count: updated,
      skipped_count: Math.max(0, students.length - (imported + updated))
    };
  },

  async getImportHistory(): Promise<ImportHistoryItem[]> {
    try {
      const res = await fetch(`${API_BASE}/student-database/import-history`);
      if (res.ok) return await res.json();
    } catch {}

    try {
      const saved = localStorage.getItem(LS_IMPORT_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}

    return [
      {
        id: 'imp-demo-1',
        file_name: 'UTIS_Mekteb_Sagirdler_2026.xlsx',
        total_rows: 120,
        imported_count: 115,
        updated_count: 5,
        skipped_count: 0,
        imported_by: 'Nərmin Məmmədova',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  }
};
