// server/db.js
// SQLite database using Node 22+ built-in DatabaseSync
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'edunex.sqlite');
export const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'teacher', -- teacher, student, admin
      school TEXT,
      status TEXT NOT NULL DEFAULT 'active', -- active, inactive, suspended
      is_pro INTEGER NOT NULL DEFAULT 0,
      pro_expires_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      package_name TEXT NOT NULL, -- 1-month, 3-months, 6-months, 12-months
      duration_months INTEGER NOT NULL,
      amount_azn REAL NOT NULL,
      started_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ActivationCodes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      duration_months INTEGER NOT NULL,
      amount_azn REAL NOT NULL,
      is_used INTEGER NOT NULL DEFAULT 0,
      used_by_user_id TEXT,
      used_by_name TEXT,
      used_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Classes (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      name TEXT NOT NULL,
      grade INTEGER NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (teacher_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Students (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      class_id TEXT,
      full_name TEXT NOT NULL,
      student_number TEXT,
      phone TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (teacher_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS QuestionBanks (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      name TEXT NOT NULL,
      subject TEXT,
      topic TEXT,
      grade INTEGER,
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (teacher_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Questions (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      bank_id TEXT,
      exam_model TEXT,
      subject TEXT NOT NULL,
      topic TEXT,
      grade INTEGER,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'single_choice', -- single_choice, multiple_choice, true_false, matching, fill_blank, open_ended, numeric
      options_json TEXT, -- JSON array of options
      correct_answer TEXT, -- option id, key, or value
      points REAL NOT NULL DEFAULT 1,
      explanation TEXT,
      image_url TEXT,
      graph_data_json TEXT,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (teacher_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Tests (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      title TEXT NOT NULL,
      exam_model TEXT NOT NULL,
      grade_group TEXT,
      subject TEXT NOT NULL,
      topic TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 45,
      total_questions INTEGER NOT NULL DEFAULT 0,
      total_points REAL NOT NULL DEFAULT 100,
      grading_rule TEXT DEFAULT 'standard', -- standard, negative_penalty, proportional
      start_time TEXT,
      end_time TEXT,
      result_display_mode TEXT DEFAULT 'immediate', -- immediate, after_deadline, manual
      test_mode TEXT DEFAULT 'interactive', -- interactive, answered
      status TEXT NOT NULL DEFAULT 'draft', -- draft, published, ongoing, completed, archived
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (teacher_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS TestQuestions (
      id TEXT PRIMARY KEY,
      test_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      points REAL NOT NULL DEFAULT 1,
      FOREIGN KEY (test_id) REFERENCES Tests(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES Questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ShareLinks (
      id TEXT PRIMARY KEY,
      test_id TEXT NOT NULL,
      unique_code TEXT UNIQUE NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      expires_at TEXT,
      max_attempts INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (test_id) REFERENCES Tests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS TestSessions (
      id TEXT PRIMARY KEY,
      test_id TEXT NOT NULL,
      student_id TEXT,
      student_name TEXT NOT NULL,
      student_surname TEXT NOT NULL,
      class_name TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, timed_out
      score REAL DEFAULT 0,
      percentage REAL DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      incorrect_count INTEGER DEFAULT 0,
      blank_count INTEGER DEFAULT 0,
      duration_seconds INTEGER DEFAULT 0,
      FOREIGN KEY (test_id) REFERENCES Tests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS StudentAnswers (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      selected_answer TEXT,
      is_correct INTEGER DEFAULT 0,
      answered_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES TestSessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AuditLogs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS SystemSettings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Column migrations
  try { db.exec("ALTER TABLE Tests ADD COLUMN pdf_url TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE Tests ADD COLUMN answer_key_json TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE Questions ADD COLUMN situation_text TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE Questions ADD COLUMN situation_keywords_json TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE Questions ADD COLUMN situation_synonyms_json TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE Questions ADD COLUMN situation_grading_mode TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE Questions ADD COLUMN situation_model_answer TEXT;"); } catch (e) {}

  seedInitialData();
  repairExistingTests();
}

// Ensure demo questions, sample tests and repair any empty tests
function repairExistingTests() {
  try {
    const now = new Date().toISOString();
    // 1. Ensure sample questions exist
    const qCount = db.prepare('SELECT COUNT(*) as count FROM Questions').get();
    if (qCount.count === 0) {
      const sampleQuestions = [
        {
          id: 'q-1',
          exam_model: 'Buraxılış imtahanı',
          subject: 'Riyaziyyat',
          topic: 'Kvadrat tənliklər və köklər',
          grade: 9,
          text: 'Hesablayın: $\\frac{\\sqrt{x^2+1}}{2a}$ ifadəsinin $x = \\sqrt{3}$ və $a = 1$ olduqda qiymətini tapın.',
          type: 'single_choice',
          options: JSON.stringify([
            { id: 'A', text: '$1$', is_correct: true },
            { id: 'B', text: '$\\sqrt{2}$', is_correct: false },
            { id: 'C', text: '$\\frac{\\sqrt{3}}{2}$', is_correct: false },
            { id: 'D', text: '$2$', is_correct: false },
            { id: 'E', text: '$\\frac{1}{2}$', is_correct: false }
          ]),
          correct: 'A',
          points: 4,
          explanation: 'Verilmiş ifadədə $x=\\sqrt{3}$ yazsaq: $x^2 = 3$. Surət: $\\sqrt{3+1} = \\sqrt{4} = 2$. Məxrəc: $2 \\cdot 1 = 2$. Nəticə: $\\frac{2}{2} = 1$. Düzgün cavab A bəndidir.'
        },
        {
          id: 'q-2',
          exam_model: 'Blok imtahanı',
          subject: 'Riyaziyyat',
          topic: 'Funksiyalar və qrafiklər',
          grade: 11,
          text: '$y = x^2 - 4x + 3$ kvadratik funksiyasının təpə nöqtəsinin koordinatlarını tapın.',
          type: 'single_choice',
          options: JSON.stringify([
            { id: 'A', text: '$(2; -1)$', is_correct: true },
            { id: 'B', text: '$(-2; 1)$', is_correct: false },
            { id: 'C', text: '$(2; 1)$', is_correct: false },
            { id: 'D', text: '$(4; 3)$', is_correct: false },
            { id: 'E', text: '$(0; 3)$', is_correct: false }
          ]),
          correct: 'A',
          points: 5,
          explanation: 'Təpə nöqtəsi: $x_0 = -\\frac{b}{2a} = -\\frac{-4}{2 \\cdot 1} = 2$. $y_0 = f(2) = 2^2 - 4(2) + 3 = 4 - 8 + 3 = -1$. Təpə nöqtəsi: $(2; -1)$.'
        },
        {
          id: 'q-3',
          exam_model: 'Buraxılış imtahanı',
          subject: 'Riyaziyyat',
          topic: 'Kəsrlər və bərabərsizliklər',
          grade: 11,
          text: '$\\frac{a+b}{c}$ ifadəsində $a=3.5$, $b=2.5$ və $c=2$ olarsa, qiymətini hesablayın.',
          type: 'single_choice',
          options: JSON.stringify([
            { id: 'A', text: '$2$', is_correct: false },
            { id: 'B', text: '$3$', is_correct: true },
            { id: 'C', text: '$3.5$', is_correct: false },
            { id: 'D', text: '$4$', is_correct: false },
            { id: 'E', text: '$6$', is_correct: false }
          ]),
          correct: 'B',
          points: 3,
          explanation: 'Surət: $a + b = 3.5 + 2.5 = 6$. Məxrəc: $c = 2$. Kəsr: $\\frac{6}{2} = 3$.'
        },
        {
          id: 'q-4',
          exam_model: 'Şagird qrupu',
          subject: 'Fizika',
          topic: 'Nyuton qanunları və kinematika',
          grade: 10,
          text: 'Kütləsi $m = 4\\text{ kq}$ olan cismə $F = 12\\text{ N}$ sabit qüvvə təsir edir. Cismin təcilini ($a$) tapın.',
          type: 'single_choice',
          options: JSON.stringify([
            { id: 'A', text: '$3\\text{ m/s}^2$', is_correct: true },
            { id: 'B', text: '$48\\text{ m/s}^2$', is_correct: false },
            { id: 'C', text: '$0.33\\text{ m/s}^2$', is_correct: false },
            { id: 'D', text: '$8\\text{ m/s}^2$', is_correct: false },
            { id: 'E', text: '$16\\text{ m/s}^2$', is_correct: false }
          ]),
          correct: 'A',
          points: 4,
          explanation: 'Nyutonun II qanununa görə: $a = \\frac{F}{m} = \\frac{12\\text{ N}}{4\\text{ kq}} = 3\\text{ m/s}^2$.'
        },
        {
          id: 'q-5',
          exam_model: 'Buraxılış imtahanı',
          subject: 'Riyaziyyat',
          topic: 'Həndəsə və Triqonometriya',
          grade: 9,
          text: 'Düzbucaqlı üçbucaqda katetlər $a=6$ və $b=8$ olarsa, hipotenuz $c$ nəyə bərabərdir?',
          type: 'single_choice',
          options: JSON.stringify([
            { id: 'A', text: '$10$', is_correct: true },
            { id: 'B', text: '$14$', is_correct: false },
            { id: 'C', text: '$12$', is_correct: false },
            { id: 'D', text: '$\\sqrt{28}$', is_correct: false },
            { id: 'E', text: '$9$', is_correct: false }
          ]),
          correct: 'A',
          points: 4,
          explanation: 'Pifaqor teoreminə əsasən: $c = \\sqrt{a^2 + b^2} = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$.'
        }
      ];

      for (let i = 0; i < sampleQuestions.length; i++) {
        const q = sampleQuestions[i];
        db.prepare(`
          INSERT INTO Questions (id, teacher_id, exam_model, subject, topic, grade, question_text, question_type, options_json, correct_answer, points, explanation, order_index, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          q.id, 'usr-teacher-1', q.exam_model, q.subject, q.topic, q.grade,
          q.text, q.type, q.options, q.correct, q.points, q.explanation, i, now, now
        );
      }
    }

    // 2. Ensure tst-buraxilis-demo is linked with questions
    const demoTest = db.prepare('SELECT * FROM Tests WHERE id = ?').get('tst-buraxilis-demo');
    if (demoTest) {
      const demoQCount = db.prepare('SELECT COUNT(*) as count FROM TestQuestions WHERE test_id = ?').get('tst-buraxilis-demo');
      if (!demoQCount || demoQCount.count === 0) {
        const questions = db.prepare('SELECT id, points FROM Questions ORDER BY created_at ASC LIMIT 5').all();
        questions.forEach((q, idx) => {
          db.prepare(`
            INSERT INTO TestQuestions (id, test_id, question_id, order_index, points)
            VALUES (?, ?, ?, ?, ?)
          `).run('tq-demo-' + idx, 'tst-buraxilis-demo', q.id, idx, q.points || 4);
        });
      }
    }

    // 3. Auto-heal any tests where TestQuestions count is 0
    const tests = db.prepare('SELECT * FROM Tests').all();
    for (const test of tests) {
      const countObj = db.prepare('SELECT COUNT(*) as count FROM TestQuestions WHERE test_id = ?').get(test.id);
      if (!countObj || countObj.count === 0) {
        const qCount = test.total_questions > 0 ? test.total_questions : (test.test_mode === 'answered' ? 25 : 5);
        for (let i = 0; i < qCount; i++) {
          const qId = `q-${test.id.substring(4)}-${i + 1}`;
          const existingQ = db.prepare('SELECT id FROM Questions WHERE id = ?').get(qId);
          if (!existingQ) {
            db.prepare(`
              INSERT INTO Questions (id, teacher_id, exam_model, subject, topic, grade, question_text, question_type, options_json, correct_answer, points, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'single_choice', ?, 'A', 4, ?, ?)
            `).run(
              qId, test.teacher_id, test.exam_model, test.subject, test.topic || '', 9,
              `Sual №${i + 1}`,
              JSON.stringify([
                { id: 'A', text: 'A' },
                { id: 'B', text: 'B' },
                { id: 'C', text: 'C' },
                { id: 'D', text: 'D' },
                { id: 'E', text: 'E' }
              ]),
              now, now
            );
          }
          db.prepare(`
            INSERT INTO TestQuestions (id, test_id, question_id, order_index, points)
            VALUES (?, ?, ?, ?, 4)
          `).run(`tq-${test.id.substring(4)}-${i + 1}`, test.id, qId, i);
        }
        db.prepare('UPDATE Tests SET total_questions = ? WHERE id = ?').run(qCount, test.id);
      }
    }
  } catch (err) {
    console.error('Repair tests error:', err);
  }
}

// Seed demo users, activation codes, sample tests, and question bank
function seedInitialData() {
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM Users').get();
  if (userCheck.count > 0) return;

  const now = new Date().toISOString();
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  // Insert Admin
  db.prepare(`
    INSERT INTO Users (id, email, password_hash, full_name, phone, role, school, status, is_pro, pro_expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'usr-admin-1',
    'admin@edunex.az',
    'admin123',
    'EDUNEX Baş Administrator',
    '+994 50 111 22 33',
    'admin',
    'EDUNEX Head Office',
    'active',
    1,
    nextYear,
    now
  );

  // Insert Teacher
  db.prepare(`
    INSERT INTO Users (id, email, password_hash, full_name, phone, role, school, status, is_pro, pro_expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'usr-teacher-1',
    'muellim@edunex.az',
    'muellim123',
    'Nərmin Məmmədova',
    '+994 50 345 67 89',
    'teacher',
    'Bakı şəhəri 287 nömrəli Zəkalar liseyi',
    'active',
    1,
    nextYear,
    now
  );

  // Insert Student
  db.prepare(`
    INSERT INTO Users (id, email, password_hash, full_name, phone, role, school, status, is_pro, pro_expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'usr-student-1',
    'sagird@edunex.az',
    'sagird123',
    'Əli Həsənov',
    '+994 55 987 65 43',
    'student',
    'Bakı şəhəri 287 nömrəli Zəkalar liseyi',
    'active',
    0,
    null,
    now
  );

  // Insert Activation Codes for PRO subscriptions
  const codes = [
    { code: 'EDX-PRO1-9842', months: 1, azn: 7 },
    { code: 'EDX-PRO3-7721', months: 3, azn: 20 },
    { code: 'EDX-PRO6-5543', months: 6, azn: 40 },
    { code: 'EDX-PRO12-1109', months: 12, azn: 60 },
  ];

  for (const c of codes) {
    db.prepare(`
      INSERT INTO ActivationCodes (id, code, duration_months, amount_azn, is_used, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run('code-' + Math.random().toString(36).substring(2, 9), c.code, c.months, c.azn, now);
  }

  // Insert sample classes
  db.prepare(`
    INSERT INTO Classes (id, teacher_id, name, grade, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('cls-1', 'usr-teacher-1', '10-A Sinfi', 10, 'Riyaziyyat və İqtisadiyyat təmayüllü sinif', now);

  db.prepare(`
    INSERT INTO Classes (id, teacher_id, name, grade, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('cls-2', 'usr-teacher-1', '11-B Sinfi (Blok I Qrup)', 11, 'Rİ və RK altqrupları üzrə abituriyent hazırlığı', now);

  // Insert sample students
  const sampleStudents = [
    { id: 'std-1', name: 'Əli Həsənov', class: 'cls-1', phone: '+994 55 123 45 67' },
    { id: 'std-2', name: 'Ayan Rzayeva', class: 'cls-1', phone: '+994 50 234 56 78' },
    { id: 'std-3', name: 'Murad Əliyev', class: 'cls-2', phone: '+994 70 345 67 89' },
    { id: 'std-4', name: 'Fidan Qasımova', class: 'cls-2', phone: '+994 55 456 78 90' },
  ];

  for (const s of sampleStudents) {
    db.prepare(`
      INSERT INTO Students (id, teacher_id, class_id, full_name, student_number, phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(s.id, 'usr-teacher-1', s.class, s.name, 'EDX-' + Math.floor(1000 + Math.random() * 9000), s.phone, now);
  }

  // Insert Sample Questions with KaTeX formulas, graphs and explanations
  const sampleQuestions = [
    {
      id: 'q-1',
      exam_model: 'Buraxılış imtahanı',
      subject: 'Riyaziyyat',
      topic: 'Kvadrat tənliklər və köklər',
      grade: 9,
      text: 'Hesablayın: $\\frac{\\sqrt{x^2+1}}{2a}$ ifadəsinin $x = \\sqrt{3}$ və $a = 1$ olduqda qiymətini tapın.',
      type: 'single_choice',
      options: JSON.stringify([
        { id: 'A', text: '$1$', is_correct: true },
        { id: 'B', text: '$\\sqrt{2}$', is_correct: false },
        { id: 'C', text: '$\\frac{\\sqrt{3}}{2}$', is_correct: false },
        { id: 'D', text: '$2$', is_correct: false },
        { id: 'E', text: '$\\frac{1}{2}$', is_correct: false }
      ]),
      correct: 'A',
      points: 4,
      explanation: 'Verilmiş ifadədə $x=\\sqrt{3}$ yazsaq: $x^2 = 3$. Surət: $\\sqrt{3+1} = \\sqrt{4} = 2$. Məxrəc: $2 \\cdot 1 = 2$. Nəticə: $\\frac{2}{2} = 1$. Düzgün cavab A bəndidir.'
    },
    {
      id: 'q-2',
      exam_model: 'Blok imtahanı',
      subject: 'Riyaziyyat',
      topic: 'Funksiyalar və qrafiklər',
      grade: 11,
      text: '$y = x^2 - 4x + 3$ kvadratik funksiyasının təpə nöqtəsinin koordinatlarını tapın.',
      type: 'single_choice',
      options: JSON.stringify([
        { id: 'A', text: '$(2; -1)$', is_correct: true },
        { id: 'B', text: '$(-2; 1)$', is_correct: false },
        { id: 'C', text: '$(2; 1)$', is_correct: false },
        { id: 'D', text: '$(4; 3)$', is_correct: false },
        { id: 'E', text: '$(0; 3)$', is_correct: false }
      ]),
      correct: 'A',
      points: 5,
      explanation: 'Təpə nöqtəsi: $x_0 = -\\frac{b}{2a} = -\\frac{-4}{2 \\cdot 1} = 2$. $y_0 = f(2) = 2^2 - 4(2) + 3 = 4 - 8 + 3 = -1$. Təpə nöqtəsi: $(2; -1)$.'
    },
    {
      id: 'q-3',
      exam_model: 'Buraxılış imtahanı',
      subject: 'Riyaziyyat',
      topic: 'Kəsrlər və bərabərsizliklər',
      grade: 11,
      text: '$\\frac{a+b}{c}$ ifadəsində $a=3.5$, $b=2.5$ və $c=2$ olarsa, qiymətini hesablayın.',
      type: 'single_choice',
      options: JSON.stringify([
        { id: 'A', text: '$2$', is_correct: false },
        { id: 'B', text: '$3$', is_correct: true },
        { id: 'C', text: '$3.5$', is_correct: false },
        { id: 'D', text: '$4$', is_correct: false },
        { id: 'E', text: '$6$', is_correct: false }
      ]),
      correct: 'B',
      points: 3,
      explanation: 'Surət: $a + b = 3.5 + 2.5 = 6$. Məxrəc: $c = 2$. Kəsr: $\\frac{6}{2} = 3$.'
    },
    {
      id: 'q-4',
      exam_model: 'Şagird qrupu',
      subject: 'Fizika',
      topic: 'Nyuton qanunları və kinematika',
      grade: 10,
      text: 'Kütləsi $m = 4\\text{ kq}$ olan cismə $F = 12\\text{ N}$ sabit qüvvə təsir edir. Cismin təcilini ($a$) tapın.',
      type: 'single_choice',
      options: JSON.stringify([
        { id: 'A', text: '$3\\text{ m/s}^2$', is_correct: true },
        { id: 'B', text: '$48\\text{ m/s}^2$', is_correct: false },
        { id: 'C', text: '$0.33\\text{ m/s}^2$', is_correct: false },
        { id: 'D', text: '$8\\text{ m/s}^2$', is_correct: false },
        { id: 'E', text: '$16\\text{ m/s}^2$', is_correct: false }
      ]),
      correct: 'A',
      points: 4,
      explanation: 'Nyutonun II qanununa görə: $a = \\frac{F}{m} = \\frac{12\\text{ N}}{4\\text{ kq}} = 3\\text{ m/s}^2$.'
    },
    {
      id: 'q-5',
      exam_model: 'Buraxılış imtahanı',
      subject: 'Riyaziyyat',
      topic: 'Həndəsə və Triqonometriya',
      grade: 9,
      text: 'Düzbucaqlı üçbucaqda katetlər $a=6$ və $b=8$ olarsa, hipotenuz $c$ nəyə bərabərdir?',
      type: 'single_choice',
      options: JSON.stringify([
        { id: 'A', text: '$10$', is_correct: true },
        { id: 'B', text: '$14$', is_correct: false },
        { id: 'C', text: '$12$', is_correct: false },
        { id: 'D', text: '$\\sqrt{28}$', is_correct: false },
        { id: 'E', text: '$9$', is_correct: false }
      ]),
      correct: 'A',
      points: 4,
      explanation: 'Pifaqor teoreminə əsasən: $c = \\sqrt{a^2 + b^2} = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$.'
    }
  ];

  for (let i = 0; i < sampleQuestions.length; i++) {
    const q = sampleQuestions[i];
    db.prepare(`
      INSERT INTO Questions (id, teacher_id, exam_model, subject, topic, grade, question_text, question_type, options_json, correct_answer, points, explanation, order_index, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      q.id,
      'usr-teacher-1',
      q.exam_model,
      q.subject,
      q.topic,
      q.grade,
      q.text,
      q.type,
      q.options,
      q.correct,
      q.points,
      q.explanation,
      i,
      now,
      now
    );
  }

  // Insert Sample Test
  const testId = 'tst-buraxilis-demo';
  db.prepare(`
    INSERT INTO Tests (id, teacher_id, title, exam_model, grade_group, subject, topic, duration_minutes, total_questions, total_points, grading_rule, start_time, end_time, result_display_mode, test_mode, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    testId,
    'usr-teacher-1',
    'IX Sinif Buraxılış İmtahanı Sınaq Testi - Riyaziyyat',
    'Buraxılış imtahanı',
    '9-cu sinif',
    'Riyaziyyat',
    'Cəbr və Həndəsə təkrarı',
    30,
    sampleQuestions.length,
    20,
    'standard',
    now,
    nextYear,
    'immediate',
    'interactive',
    'published',
    now,
    now
  );

  // Link questions to test
  for (let i = 0; i < sampleQuestions.length; i++) {
    db.prepare(`
      INSERT INTO TestQuestions (id, test_id, question_id, order_index, points)
      VALUES (?, ?, ?, ?, ?)
    `).run('tq-' + i, testId, sampleQuestions[i].id, i, sampleQuestions[i].points);
  }

  // Create active ShareLink for this test
  const shareCode = 'EDX-DEMO-2026';
  db.prepare(`
    INSERT INTO ShareLinks (id, test_id, unique_code, is_active, created_at)
    VALUES (?, ?, ?, 1, ?)
  `).run('shr-1', testId, shareCode, now);

  // Seed sample completed session for results and statistics demonstration
  const sessionId = 'ses-demo-1';
  db.prepare(`
    INSERT INTO TestSessions (id, test_id, student_id, student_name, student_surname, class_name, started_at, completed_at, status, score, percentage, correct_count, incorrect_count, blank_count, duration_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', 17, 85.0, 4, 1, 0, 780)
  `).run(
    sessionId,
    testId,
    'std-1',
    'Əli',
    'Həsənov',
    '10-A Sinfi',
    now,
    now
  );

  const sessionId2 = 'ses-demo-2';
  db.prepare(`
    INSERT INTO TestSessions (id, test_id, student_id, student_name, student_surname, class_name, started_at, completed_at, status, score, percentage, correct_count, incorrect_count, blank_count, duration_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', 20, 100.0, 5, 0, 0, 620)
  `).run(
    sessionId2,
    testId,
    'std-2',
    'Ayan',
    'Rzayeva',
    '10-A Sinfi',
    now,
    now
  );

  // Audit log
  db.prepare(`
    INSERT INTO AuditLogs (id, user_id, user_name, action, details, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('log-1', 'usr-admin-1', 'EDUNEX Administrator', 'Sistem başlanğıcı', 'İlkin verilənlər bazası və sınaq məlumatları yükləndi', '127.0.0.1', now);
}
