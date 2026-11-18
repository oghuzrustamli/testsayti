// server/server.js
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db, initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '35mb' }));

// Static uploads directory for PDF and Word documents
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Upload Document endpoint (supports PDF, DOC, DOCX base64)
app.post('/api/upload-document', (req, res) => {
  try {
    const { filename, dataBase64 } = req.body;
    if (!filename || !dataBase64) {
      return res.status(400).json({ error: 'Fayl məlumatları daxil edilməyib' });
    }
    const cleanFilename = Date.now() + '-' + filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = path.join(uploadsDir, cleanFilename);
    const buffer = Buffer.from(dataBase64, 'base64');
    fs.writeFileSync(filePath, buffer);
    res.json({
      url: `/uploads/${cleanFilename}`,
      filename: cleanFilename,
      size: buffer.length
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Fayl saxlanılarkən xəta baş verdi' });
  }
});

// Initialize SQLite tables and seed data
initDatabase();

// Middleware: log audit
function logAudit(userId, userName, action, details, req) {
  try {
    const ip = req ? req.ip || req.headers['x-forwarded-for'] || '127.0.0.1' : '127.0.0.1';
    db.prepare(`
      INSERT INTO AuditLogs (id, user_id, user_name, action, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('log-' + Math.random().toString(36).substring(2, 9), userId || null, userName || 'Sistem', action, details || '', ip, new Date().toISOString());
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email və şifrə daxil edilməlidir' });
  }

  const user = db.prepare('SELECT * FROM Users WHERE email = ?').get(email);
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Email və ya şifrə yanlışdır' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Bu hesab deaktiv edilib. Administrator ilə əlaqə saxlayın.' });
  }

  // Check PRO expiry
  let isPro = user.is_pro === 1;
  if (isPro && user.pro_expires_at) {
    if (new Date(user.pro_expires_at) < new Date()) {
      isPro = false;
      db.prepare('UPDATE Users SET is_pro = 0 WHERE id = ?').run(user.id);
    }
  }

  logAudit(user.id, user.full_name, 'İstifadəçi Girişi', `${user.role.toUpperCase()} sistemə daxil oldu`, req);

  const token = 'token-' + Buffer.from(user.id + ':' + Date.now()).toString('base64');
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      school: user.school,
      status: user.status,
      is_pro: isPro,
      pro_expires_at: user.pro_expires_at,
    }
  });
});

app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, email, full_name, phone, role, school, status, is_pro, pro_expires_at, created_at FROM Users ORDER BY created_at DESC').all();
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { email, password, full_name, phone, role, school, is_pro, duration_months } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Bütün vacib xanaları doldurun' });
  }

  const existing = db.prepare('SELECT id FROM Users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Bu email artıq qeydiyyatdan keçib' });
  }

  const id = 'usr-' + Math.random().toString(36).substring(2, 9);
  const now = new Date();
  let proExpiry = null;
  if (is_pro) {
    const months = duration_months || 1;
    const exp = new Date(now);
    exp.setMonth(exp.getMonth() + months);
    proExpiry = exp.toISOString();
  }

  db.prepare(`
    INSERT INTO Users (id, email, password_hash, full_name, phone, role, school, status, is_pro, pro_expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
  `).run(id, email, password, full_name, phone || '', role || 'teacher', school || '', is_pro ? 1 : 0, proExpiry, now.toISOString());

  logAudit('admin', 'Admin', 'İstifadəçi Əlavə Edildi', `Yeni ${role}: ${full_name} (${email})`, req);
  res.status(201).json({ message: 'İstifadəçi uğurla yaradıldı', id });
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { full_name, phone, role, school, status, is_pro, pro_expires_at, password } = req.body;

  let query = 'UPDATE Users SET full_name = ?, phone = ?, role = ?, school = ?, status = ?, is_pro = ?, pro_expires_at = ?';
  const params = [full_name, phone, role, school, status, is_pro ? 1 : 0, pro_expires_at];

  if (password && password.trim()) {
    query += ', password_hash = ?';
    params.push(password.trim());
  }
  query += ' WHERE id = ?';
  params.push(id);

  db.prepare(query).run(...params);
  logAudit('admin', 'Admin', 'İstifadəçi Yeniləndi', `İstifadəçi ID: ${id} status: ${status}`, req);
  res.json({ message: 'İstifadəçi məlumatları yeniləndi' });
});

// ==========================================
// 2. PRO SUBSCRIPTION & ACTIVATION CODES
// ==========================================
app.post('/api/pro/activate', (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) {
    return res.status(400).json({ error: 'İstifadəçi və aktivasiya kodu tələb olunur' });
  }

  const cleanCode = code.trim().toUpperCase();
  const actCode = db.prepare('SELECT * FROM ActivationCodes WHERE code = ?').get(cleanCode);

  if (!actCode) {
    return res.status(404).json({ error: 'Daxil edilən aktivasiya kodu tapılmadı' });
  }

  if (actCode.is_used === 1) {
    return res.status(400).json({ error: `Bu kod artıq istifadə olunub (${actCode.used_at})` });
  }

  const user = db.prepare('SELECT * FROM Users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
  }

  const now = new Date();
  let baseDate = now;
  if (user.is_pro === 1 && user.pro_expires_at && new Date(user.pro_expires_at) > now) {
    baseDate = new Date(user.pro_expires_at);
  }

  const newExpiry = new Date(baseDate);
  newExpiry.setMonth(newExpiry.getMonth() + actCode.duration_months);

  // Update user
  db.prepare('UPDATE Users SET is_pro = 1, pro_expires_at = ? WHERE id = ?').run(newExpiry.toISOString(), user.id);

  // Mark code as used
  db.prepare(`
    UPDATE ActivationCodes 
    SET is_used = 1, used_by_user_id = ?, used_by_name = ?, used_at = ?
    WHERE id = ?
  `).run(user.id, user.full_name, now.toISOString(), actCode.id);

  // Record subscription log
  db.prepare(`
    INSERT INTO Subscriptions (id, user_id, package_name, duration_months, amount_azn, started_at, expires_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(
    'sub-' + Math.random().toString(36).substring(2, 9),
    user.id,
    `${actCode.duration_months} aylıq paket`,
    actCode.duration_months,
    actCode.amount_azn,
    now.toISOString(),
    newExpiry.toISOString()
  );

  logAudit(user.id, user.full_name, 'PRO Aktivasiya', `Kod: ${cleanCode}, Müddət: ${actCode.duration_months} ay`, req);

  res.json({
    message: 'Təbriklər! PRO paketiniz uğurla aktivləşdirildi.',
    is_pro: true,
    pro_expires_at: newExpiry.toISOString(),
    duration_months: actCode.duration_months
  });
});

app.get('/api/admin/activation-codes', (req, res) => {
  const codes = db.prepare('SELECT * FROM ActivationCodes ORDER BY created_at DESC').all();
  res.json(codes);
});

app.post('/api/admin/activation-codes', (req, res) => {
  const { duration_months, amount_azn, count } = req.body;
  const num = parseInt(count) || 1;
  const months = parseInt(duration_months) || 1;
  const azn = parseFloat(amount_azn) || (months === 1 ? 7 : months === 3 ? 20 : months === 6 ? 40 : 60);

  const generated = [];
  const now = new Date().toISOString();

  for (let i = 0; i < num; i++) {
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `EDX-PRO${months}-${randPart}`;
    const id = 'code-' + Math.random().toString(36).substring(2, 9);

    db.prepare(`
      INSERT INTO ActivationCodes (id, code, duration_months, amount_azn, is_used, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(id, code, months, azn, now);

    generated.push({ id, code, duration_months: months, amount_azn: azn });
  }

  logAudit('admin', 'Admin', 'Aktivasiya Kodları Yaradıldı', `${num} ədəd ${months} aylıq kod (${azn} AZN)`, req);
  res.status(201).json({ message: `${num} ədəd aktivasiya kodu yaradıldı`, codes: generated });
});

// ==========================================
// 3. TESTS MANAGEMENT
// ==========================================
app.get('/api/tests', (req, res) => {
  const { teacher_id, status } = req.query;
  let query = 'SELECT * FROM Tests WHERE 1=1';
  const params = [];

  if (teacher_id) {
    query += ' AND teacher_id = ?';
    params.push(teacher_id);
  }
  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  query += ' ORDER BY updated_at DESC';

  const tests = db.prepare(query).all(...params);

  // Enrich with question count and share link info
  const enriched = tests.map(test => {
    const qCount = db.prepare('SELECT COUNT(*) as count FROM TestQuestions WHERE test_id = ?').get(test.id);
    const link = db.prepare('SELECT unique_code, is_active FROM ShareLinks WHERE test_id = ? ORDER BY created_at DESC LIMIT 1').get(test.id);
    const sessionStats = db.prepare(`
      SELECT COUNT(*) as attempts, AVG(score) as avg_score, MAX(score) as max_score 
      FROM TestSessions WHERE test_id = ? AND status = 'completed'
    `).get(test.id);

    return {
      ...test,
      total_questions: qCount ? qCount.count : 0,
      share_code: link ? link.unique_code : null,
      is_link_active: link ? link.is_active === 1 : false,
      completed_attempts: sessionStats ? sessionStats.attempts : 0,
      avg_score: sessionStats && sessionStats.avg_score ? parseFloat(sessionStats.avg_score.toFixed(1)) : 0,
      max_score: sessionStats ? sessionStats.max_score : 0,
    };
  });

  res.json(enriched);
});

app.get('/api/tests/:id', (req, res) => {
  const { id } = req.params;
  const test = db.prepare('SELECT * FROM Tests WHERE id = ?').get(id);
  if (!test) {
    return res.status(404).json({ error: 'Test tapılmadı' });
  }

  // Get attached questions in order
  const questions = db.prepare(`
    SELECT q.*, tq.order_index, tq.points as test_points
    FROM TestQuestions tq
    JOIN Questions q ON tq.question_id = q.id
    WHERE tq.test_id = ?
    ORDER BY tq.order_index ASC
  `).all(id);

  const shareLink = db.prepare('SELECT * FROM ShareLinks WHERE test_id = ? ORDER BY created_at DESC LIMIT 1').get(id);

  res.json({
    ...test,
    questions: questions.map(q => ({
      ...q,
      options: q.options_json ? JSON.parse(q.options_json) : [],
      graph_data: q.graph_data_json ? JSON.parse(q.graph_data_json) : null,
      situation_keywords: q.situation_keywords_json ? JSON.parse(q.situation_keywords_json) : [],
      situation_synonyms: q.situation_synonyms_json ? JSON.parse(q.situation_synonyms_json) : {},
    })),
    shareLink
  });
});

app.post('/api/tests', (req, res) => {
  const {
    teacher_id,
    title,
    exam_model,
    grade_group,
    subject,
    topic,
    duration_minutes,
    total_points,
    grading_rule,
    start_time,
    end_time,
    result_display_mode,
    test_mode,
    status,
    questions,
    pdf_url,
    answer_key_json,
  } = req.body;

  if (!title || !exam_model || !subject) {
    return res.status(400).json({ error: 'Testin adı, imtahan modeli və fənn mütləq seçilməlidir' });
  }

  const testId = 'tst-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  // Validate teacher_id exists in Users table to avoid FOREIGN KEY failure
  let validTeacherId = teacher_id;
  const teacherExists = validTeacherId ? db.prepare('SELECT id FROM Users WHERE id = ?').get(validTeacherId) : null;
  if (!teacherExists) {
    const fallbackTeacher = db.prepare("SELECT id FROM Users WHERE role = 'teacher' LIMIT 1").get();
    validTeacherId = fallbackTeacher ? fallbackTeacher.id : 'usr-teacher-1';
  }

  db.prepare(`
    INSERT INTO Tests (
      id, teacher_id, title, exam_model, grade_group, subject, topic,
      duration_minutes, total_questions, total_points, grading_rule,
      start_time, end_time, result_display_mode, test_mode, status,
      pdf_url, answer_key_json,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    testId,
    validTeacherId,
    title,
    exam_model,
    grade_group || '',
    subject,
    topic || '',
    parseInt(duration_minutes) || 45,
    questions ? questions.length : 0,
    parseFloat(total_points) || 100,
    grading_rule || 'standard',
    start_time || now,
    end_time || null,
    result_display_mode || 'immediate',
    test_mode || 'interactive',
    status || 'published',
    pdf_url || null,
    answer_key_json || null,
    now,
    now
  );

  // Attach questions
  if (Array.isArray(questions) && questions.length > 0) {
    for (let i = 0; i < questions.length; i++) {
      let q = questions[i];
      let qId = q.id;

      // Check if question exists in Questions table
      const existsInDb = qId && !qId.startsWith('new-') ? db.prepare('SELECT id FROM Questions WHERE id = ?').get(qId) : null;
      if (!existsInDb) {
        if (!qId || qId.startsWith('new-')) {
          qId = 'q-' + Math.random().toString(36).substring(2, 9);
        }
        db.prepare(`
          INSERT INTO Questions (
            id, teacher_id, exam_model, subject, topic, grade,
            question_text, question_type, options_json, correct_answer,
            points, explanation, image_url, graph_data_json, order_index,
            situation_text, situation_keywords_json, situation_synonyms_json, situation_grading_mode, situation_model_answer,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          qId,
          validTeacherId,
          exam_model,
          q.subject || subject,
          q.topic || topic || '',
          parseInt(q.grade || grade_group) || 9,
          q.question_text || `Sual №${i + 1}`,
          q.question_type || 'single_choice',
          JSON.stringify(q.options || [
            { id: 'A', text: 'A' },
            { id: 'B', text: 'B' },
            { id: 'C', text: 'C' },
            { id: 'D', text: 'D' },
            { id: 'E', text: 'E' }
          ]),
          q.correct_answer || 'A',
          parseFloat(q.points) || 1,
          q.explanation || '',
          q.image_url || '',
          q.graph_data ? JSON.stringify(q.graph_data) : null,
          i,
          q.situation_text || null,
          q.situation_keywords ? JSON.stringify(q.situation_keywords) : null,
          q.situation_synonyms ? JSON.stringify(q.situation_synonyms) : null,
          q.situation_grading_mode || 'keywords_10',
          q.situation_model_answer || null,
          now,
          now
        );
      }

      db.prepare(`
        INSERT INTO TestQuestions (id, test_id, question_id, order_index, points)
        VALUES (?, ?, ?, ?, ?)
      `).run('tq-' + Math.random().toString(36).substring(2, 9), testId, qId, i, parseFloat(q.points) || 1);
    }
  }

  // Generate unique share code
  const shareCode = 'EDX-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
  db.prepare(`
    INSERT INTO ShareLinks (id, test_id, unique_code, is_active, created_at)
    VALUES (?, ?, ?, 1, ?)
  `).run('shr-' + Math.random().toString(36).substring(2, 9), testId, shareCode, now);

  logAudit(teacher_id, 'Müəllim', 'Yeni Test Yaradıldı', `Test: ${title} (${questions ? questions.length : 0} sual)`, req);
  res.status(201).json({ id: testId, share_code: shareCode, message: 'Test uğurla yaradıldı' });
});

app.put('/api/tests/:id', (req, res) => {
  const { id } = req.params;
  const {
    title,
    exam_model,
    grade_group,
    subject,
    topic,
    duration_minutes,
    total_points,
    grading_rule,
    result_display_mode,
    test_mode,
    status,
    questions
  } = req.body;

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE Tests SET
      title = ?, exam_model = ?, grade_group = ?, subject = ?, topic = ?,
      duration_minutes = ?, total_questions = ?, total_points = ?,
      grading_rule = ?, result_display_mode = ?, test_mode = ?, status = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    title,
    exam_model,
    grade_group || '',
    subject,
    topic || '',
    parseInt(duration_minutes) || 45,
    questions ? questions.length : 0,
    parseFloat(total_points) || 100,
    grading_rule || 'standard',
    result_display_mode || 'immediate',
    test_mode || 'interactive',
    status || 'published',
    now,
    id
  );

  if (Array.isArray(questions)) {
    // Re-link questions
    db.prepare('DELETE FROM TestQuestions WHERE test_id = ?').run(id);
    for (let i = 0; i < questions.length; i++) {
      let q = questions[i];
      let qId = q.id;

      if (!qId || qId.startsWith('new-')) {
        qId = 'q-' + Math.random().toString(36).substring(2, 9);
        db.prepare(`
          INSERT INTO Questions (
            id, teacher_id, exam_model, subject, topic, grade,
            question_text, question_type, options_json, correct_answer,
            points, explanation, image_url, graph_data_json, order_index,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          qId,
          q.teacher_id || 'usr-teacher-1',
          exam_model,
          subject,
          topic || '',
          parseInt(grade_group) || 9,
          q.question_text || '',
          q.question_type || 'single_choice',
          JSON.stringify(q.options || []),
          q.correct_answer || 'A',
          parseFloat(q.points) || 1,
          q.explanation || '',
          q.image_url || '',
          q.graph_data ? JSON.stringify(q.graph_data) : null,
          i,
          now,
          now
        );
      } else {
        // Update existing question content if edited
        db.prepare(`
          UPDATE Questions SET
            question_text = ?, question_type = ?, options_json = ?, correct_answer = ?,
            points = ?, explanation = ?, image_url = ?, graph_data_json = ?, updated_at = ?
          WHERE id = ?
        `).run(
          q.question_text,
          q.question_type || 'single_choice',
          JSON.stringify(q.options || []),
          q.correct_answer || 'A',
          parseFloat(q.points) || 1,
          q.explanation || '',
          q.image_url || '',
          q.graph_data ? JSON.stringify(q.graph_data) : null,
          now,
          qId
        );
      }

      db.prepare(`
        INSERT INTO TestQuestions (id, test_id, question_id, order_index, points)
        VALUES (?, ?, ?, ?, ?)
      `).run('tq-' + Math.random().toString(36).substring(2, 9), id, qId, i, parseFloat(q.points) || 1);
    }
  }

  res.json({ message: 'Test yeniləndi' });
});

app.delete('/api/tests/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM Tests WHERE id = ?').run(id);
  res.json({ message: 'Test silindi' });
});

app.post('/api/tests/:id/duplicate', (req, res) => {
  const { id } = req.params;
  const test = db.prepare('SELECT * FROM Tests WHERE id = ?').get(id);
  if (!test) return res.status(404).json({ error: 'Test tapılmadı' });

  const newId = 'tst-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO Tests (
      id, teacher_id, title, exam_model, grade_group, subject, topic,
      duration_minutes, total_questions, total_points, grading_rule,
      start_time, end_time, result_display_mode, test_mode, status,
      pdf_url, answer_key_json,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newId,
    test.teacher_id,
    test.title + ' (Kopya)',
    test.exam_model,
    test.grade_group,
    test.subject,
    test.topic,
    test.duration_minutes,
    test.total_questions,
    test.total_points,
    test.grading_rule,
    now,
    test.end_time,
    test.result_display_mode,
    test.test_mode,
    test.status || 'published', // Published so student can access it immediately
    test.pdf_url || null,
    test.answer_key_json || null,
    now,
    now
  );

  // Copy test questions
  const questions = db.prepare('SELECT * FROM TestQuestions WHERE test_id = ? ORDER BY order_index ASC').all(id);
  if (questions.length > 0) {
    for (const q of questions) {
      db.prepare(`
        INSERT INTO TestQuestions (id, test_id, question_id, order_index, points)
        VALUES (?, ?, ?, ?, ?)
      `).run('tq-' + Math.random().toString(36).substring(2, 9), newId, q.question_id, q.order_index, q.points);
    }
  } else {
    // If original had no questions in TestQuestions, auto-create questions so duplicate is never empty
    const qCount = test.total_questions > 0 ? test.total_questions : (test.test_mode === 'answered' ? 25 : 5);
    for (let i = 0; i < qCount; i++) {
      const qId = 'q-' + Math.random().toString(36).substring(2, 9);
      db.prepare(`
        INSERT INTO Questions (
          id, teacher_id, exam_model, subject, topic, grade,
          question_text, question_type, options_json, correct_answer,
          points, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'single_choice', ?, 'A', 4, ?, ?)
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
      db.prepare(`
        INSERT INTO TestQuestions (id, test_id, question_id, order_index, points)
        VALUES (?, ?, ?, ?, 4)
      `).run('tq-' + Math.random().toString(36).substring(2, 9), newId, qId, i);
    }
    db.prepare('UPDATE Tests SET total_questions = ? WHERE id = ?').run(qCount, newId);
  }

  // Generate share link
  const shareCode = 'EDX-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
  db.prepare(`
    INSERT INTO ShareLinks (id, test_id, unique_code, is_active, created_at)
    VALUES (?, ?, ?, 1, ?)
  `).run('shr-' + Math.random().toString(36).substring(2, 9), newId, shareCode, now);

  res.json({ id: newId, share_code: shareCode, message: 'Test nüsxələndi' });
});

// ==========================================
// 4. QUESTIONS & QUESTION BANK
// ==========================================
app.get('/api/questions', (req, res) => {
  const { teacher_id, subject, topic, grade, search } = req.query;
  let query = 'SELECT * FROM Questions WHERE 1=1';
  const params = [];

  if (teacher_id) {
    query += ' AND teacher_id = ?';
    params.push(teacher_id);
  }
  if (subject && subject !== 'all') {
    query += ' AND subject = ?';
    params.push(subject);
  }
  if (grade && grade !== 'all') {
    query += ' AND grade = ?';
    params.push(parseInt(grade));
  }
  if (search) {
    query += ' AND (question_text LIKE ? OR topic LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';
  const questions = db.prepare(query).all(...params);

  res.json(questions.map(q => ({
    ...q,
    options: q.options_json ? JSON.parse(q.options_json) : [],
    graph_data: q.graph_data_json ? JSON.parse(q.graph_data_json) : null
  })));
});

app.post('/api/questions', (req, res) => {
  const {
    teacher_id,
    bank_id,
    exam_model,
    subject,
    topic,
    grade,
    question_text,
    question_type,
    options,
    correct_answer,
    points,
    explanation,
    image_url,
    graph_data
  } = req.body;

  if (!question_text || !subject) {
    return res.status(400).json({ error: 'Sual mətni və fənn tələb olunur' });
  }

  const id = 'q-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO Questions (
      id, teacher_id, bank_id, exam_model, subject, topic, grade,
      question_text, question_type, options_json, correct_answer,
      points, explanation, image_url, graph_data_json, order_index,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    id,
    teacher_id || 'usr-teacher-1',
    bank_id || null,
    exam_model || 'Buraxılış imtahanı',
    subject,
    topic || '',
    parseInt(grade) || 9,
    question_text,
    question_type || 'single_choice',
    JSON.stringify(options || []),
    correct_answer || 'A',
    parseFloat(points) || 1,
    explanation || '',
    image_url || '',
    graph_data ? JSON.stringify(graph_data) : null,
    now,
    now
  );

  res.status(201).json({ id, message: 'Sual banka əlavə edildi' });
});

app.delete('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM Questions WHERE id = ?').run(id);
  res.json({ message: 'Sual silindi' });
});

// Send questions from bank to test (Section IX)
app.post('/api/question-banks/send-to-test', (req, res) => {
  const { question_ids, target_mode, title, subject } = req.body;
  if (!question_ids || question_ids.length === 0) {
    return res.status(400).json({ error: 'Heç bir sual seçilməyib' });
  }

  const testId = 'tst-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();
  const testMode = target_mode === 'answered' ? 'answered' : 'interactive';

  db.prepare(`
    INSERT INTO Tests (
      id, teacher_id, title, exam_model, grade_group, subject, topic,
      duration_minutes, total_questions, total_points, grading_rule,
      result_display_mode, test_mode, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
  `).run(
    testId,
    'usr-teacher-1',
    title || `Bankdan yaradılan test (${question_ids.length} sual)`,
    'Buraxılış imtahanı',
    '9-cu sinif',
    subject || 'Riyaziyyat',
    'Sual bankı seçimi',
    question_ids.length * 2, // 2 mins per question
    question_ids.length,
    question_ids.length * 4,
    'standard',
    testMode === 'answered' ? 'immediate' : 'immediate',
    testMode,
    now,
    now
  );

  // Link questions
  for (let i = 0; i < question_ids.length; i++) {
    db.prepare(`
      INSERT INTO TestQuestions (id, test_id, question_id, order_index, points)
      VALUES (?, ?, ?, ?, 4)
    `).run('tq-' + Math.random().toString(36).substring(2, 9), testId, question_ids[i], i);
  }

  const shareCode = 'EDX-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
  db.prepare(`
    INSERT INTO ShareLinks (id, test_id, unique_code, is_active, created_at)
    VALUES (?, ?, ?, 1, ?)
  `).run('shr-' + Math.random().toString(36).substring(2, 9), testId, shareCode, now);

  res.status(201).json({
    test_id: testId,
    test_mode: testMode,
    share_code: shareCode,
    message: `Test uğurla ${testMode === 'answered' ? 'OMR Test' : 'İnteraktiv Test'} rejiminə göndərildi`
  });
});

// ==========================================
// 5. SHARE LINKS & STUDENT EXAM SESSIONS
// ==========================================
app.get('/api/share/:code', (req, res) => {
  const { code } = req.params;
  const rawCode = (code || '').trim();
  const cleanCode = rawCode.toUpperCase();

  // 1. Try finding by ShareLinks unique_code
  let shareLink = db.prepare('SELECT * FROM ShareLinks WHERE unique_code = ? OR unique_code = ?').get(cleanCode, rawCode);

  // 2. If not found, try finding by ShareLinks test_id
  if (!shareLink) {
    shareLink = db.prepare('SELECT * FROM ShareLinks WHERE test_id = ? OR test_id = ? ORDER BY created_at DESC LIMIT 1').get(rawCode, cleanCode);
  }

  // 3. If still not found, check if a Test exists directly with this id
  let test = null;
  if (shareLink) {
    test = db.prepare('SELECT * FROM Tests WHERE id = ?').get(shareLink.test_id);
  } else {
    test = db.prepare('SELECT * FROM Tests WHERE id = ? OR id = ?').get(rawCode, cleanCode.toLowerCase());
    if (test) {
      const now = new Date().toISOString();
      const newShareCode = 'EDX-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
      const linkId = 'shr-' + Math.random().toString(36).substring(2, 9);
      try {
        db.prepare('INSERT INTO ShareLinks (id, test_id, unique_code, is_active, created_at) VALUES (?, ?, ?, 1, ?)').run(linkId, test.id, newShareCode, now);
        shareLink = { id: linkId, test_id: test.id, unique_code: newShareCode, is_active: 1, created_at: now };
      } catch (e) {
        shareLink = { id: linkId, test_id: test.id, unique_code: newShareCode, is_active: 1, created_at: now };
      }
    }
  }

  if (!test) {
    return res.status(404).json({ error: 'Paylaşım linki və ya sınaq kodu tapılmadı' });
  }

  if (shareLink && shareLink.is_active !== 1) {
    return res.status(403).json({ error: 'Bu test üçün paylaşım linki müəllim tərəfindən deaktiv edilib' });
  }

  // Get questions without revealing correct answers to student!
  const questions = db.prepare(`
    SELECT q.id, q.question_text, q.question_type, q.options_json, q.points, q.image_url, q.graph_data_json,
           q.subject, q.topic, q.grade,
           q.situation_text, q.situation_keywords_json, q.situation_synonyms_json, q.situation_grading_mode, q.situation_model_answer,
           tq.order_index
    FROM TestQuestions tq
    JOIN Questions q ON tq.question_id = q.id
    WHERE tq.test_id = ?
    ORDER BY tq.order_index ASC
  `).all(test.id);

  let sanitizedQuestions = questions.map(q => {
    let opts = [];
    if (q.options_json) {
      try {
        opts = JSON.parse(q.options_json).map(o => ({
          id: o.id,
          text: o.text
          // Do NOT send is_correct to student during exam!
        }));
      } catch (e) {}
    }
    return {
      id: q.id,
      subject: q.subject || test.subject,
      topic: q.topic || test.topic,
      grade: q.grade || test.grade_group,
      question_text: q.question_text,
      question_type: q.question_type,
      options: opts,
      points: q.points,
      image_url: q.image_url,
      graph_data: q.graph_data_json ? JSON.parse(q.graph_data_json) : null,
      situation_text: q.situation_text,
      situation_keywords: q.situation_keywords_json ? JSON.parse(q.situation_keywords_json) : [],
      situation_synonyms: q.situation_synonyms_json ? JSON.parse(q.situation_synonyms_json) : {},
      situation_grading_mode: q.situation_grading_mode || 'keywords_10',
      situation_model_answer: q.situation_model_answer || '',
      order_index: q.order_index
    };
  });

  // Safety auto-heal: if test has no questions attached, auto-generate them so student page is never blank
  if (sanitizedQuestions.length === 0) {
    const qCount = test.total_questions > 0 ? test.total_questions : (test.test_mode === 'answered' ? 25 : 5);
    const nowIso = new Date().toISOString();
    for (let i = 0; i < qCount; i++) {
      const qId = 'q-' + Math.random().toString(36).substring(2, 9);
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
        nowIso, nowIso
      );

      db.prepare(`
        INSERT INTO TestQuestions (id, test_id, question_id, order_index, points)
        VALUES (?, ?, ?, ?, 4)
      `).run('tq-' + Math.random().toString(36).substring(2, 9), test.id, qId, i);

      sanitizedQuestions.push({
        id: qId,
        question_text: `Sual №${i + 1}`,
        question_type: 'single_choice',
        options: [
          { id: 'A', text: 'A' },
          { id: 'B', text: 'B' },
          { id: 'C', text: 'C' },
          { id: 'D', text: 'D' },
          { id: 'E', text: 'E' }
        ],
        points: 4,
        image_url: '',
        graph_data: null,
        order_index: i
      });
    }
    db.prepare('UPDATE Tests SET total_questions = ? WHERE id = ?').run(qCount, test.id);
  }

  res.json({
    test: {
      id: test.id,
      title: test.title,
      subject: test.subject,
      exam_model: test.exam_model,
      grade_group: test.grade_group,
      duration_minutes: test.duration_minutes,
      total_questions: sanitizedQuestions.length,
      total_points: test.total_points,
      test_mode: test.test_mode,
      pdf_url: test.pdf_url || (test.test_mode === 'answered' ? '/sample_exam.pdf' : null)
    },
    questions: sanitizedQuestions
  });
});

app.post('/api/share/toggle', (req, res) => {
  const { test_id, is_active } = req.body;
  db.prepare('UPDATE ShareLinks SET is_active = ? WHERE test_id = ?').run(is_active ? 1 : 0, test_id);
  res.json({ message: `Paylaşım linki ${is_active ? 'aktivləşdirildi' : 'deaktiv edildi'}` });
});

// Student starts exam
app.post('/api/exam/start', (req, res) => {
  const { test_id, student_name, student_surname, class_name, student_class } = req.body;
  if (!test_id || !student_name) {
    return res.status(400).json({ error: 'Ad və soyad daxil edilməlidir' });
  }

  let fName = (student_name || '').trim();
  let lName = (student_surname || '').trim();
  if (!lName && fName.includes(' ')) {
    const parts = fName.split(' ');
    fName = parts[0];
    lName = parts.slice(1).join(' ');
  }
  if (!lName) lName = '-';

  const test = db.prepare('SELECT * FROM Tests WHERE id = ?').get(test_id);
  if (!test) return res.status(404).json({ error: 'Test tapılmadı' });

  const sessionId = 'ses-' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO TestSessions (
      id, test_id, student_name, student_surname, class_name,
      started_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, 'in_progress')
  `).run(sessionId, test_id, fName, lName, class_name || student_class || 'Qrup', now);

  logAudit(null, `${fName} ${lName}`, 'İmtahan Başladı', `Test: ${test.title}`, req);
  res.status(201).json({ session_id: sessionId, started_at: now });
});

// Student auto-save answer
app.post('/api/exam/answer', (req, res) => {
  const { session_id, question_id, selected_answer, answer } = req.body;
  if (!session_id || !question_id) {
    return res.status(400).json({ error: 'Sessiya və sual ID tələb olunur' });
  }

  const ansVal = selected_answer !== undefined ? selected_answer : (answer || '');
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id FROM StudentAnswers WHERE session_id = ? AND question_id = ?').get(String(session_id), String(question_id));

  if (existing) {
    db.prepare('UPDATE StudentAnswers SET selected_answer = ?, answered_at = ? WHERE id = ?').run(String(ansVal), now, existing.id);
  } else {
    db.prepare(`
      INSERT INTO StudentAnswers (id, session_id, question_id, selected_answer, answered_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('ans-' + Math.random().toString(36).substring(2, 9), String(session_id), String(question_id), String(ansVal), now);
  }

  res.json({ success: true, saved_at: now });
});

// Student finishes / submits exam
app.post('/api/exam/submit', (req, res) => {
  const { session_id, answers, duration_seconds } = req.body;
  const session = db.prepare('SELECT * FROM TestSessions WHERE id = ?').get(session_id);
  if (!session) return res.status(404).json({ error: 'İmtahan sessiyası tapılmadı' });

  const test = db.prepare('SELECT * FROM Tests WHERE id = ?').get(session.test_id);
  const questions = db.prepare(`
    SELECT q.id, q.correct_answer, q.points, tq.points as tq_points
    FROM TestQuestions tq
    JOIN Questions q ON tq.question_id = q.id
    WHERE tq.test_id = ?
  `).all(session.test_id);

  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let blankCount = 0;

  const now = new Date().toISOString();

  // Process answers
  for (const q of questions) {
    const studentAns = answers ? answers[q.id] : null;
    let isCorrect = 0;

    if (!studentAns || studentAns.toString().trim() === '') {
      blankCount++;
    } else {
      const sStr = studentAns.toString().trim();
      const cStr = (q.correct_answer || '').toString().trim();
      let match = false;

      // 1. Exact string match (case insensitive)
      if (sStr.toUpperCase() === cStr.toUpperCase()) {
        match = true;
      } else {
        // 2. Numeric / Float normalization (supports Azerbaijani comma '0,7896' and dot '0.7896')
        const sNorm = sStr.replace(',', '.').replace(/\s+/g, '');
        const cNorm = cStr.replace(',', '.').replace(/\s+/g, '');
        if (sNorm === cNorm && sNorm !== '') {
          match = true;
        } else {
          const sNum = parseFloat(sNorm);
          const cNum = parseFloat(cNorm);
          if (!isNaN(sNum) && !isNaN(cNum) && Math.abs(sNum - cNum) < 1e-9) {
            match = true;
          }
        }
      }

      if (match) {
        isCorrect = 1;
        correctCount++;
        totalScore += (q.tq_points || q.points || 1);
      } else {
        incorrectCount++;
        if (test.grading_rule === 'negative_penalty') {
          // In Azerbaijan block/admission exam: 4 incorrect answers subtract 1 correct answer (25% penalty)
          totalScore -= (q.tq_points || q.points || 1) * 0.25;
        }
      }
    }

    // Save/update student answer with correctness
    const existing = db.prepare('SELECT id FROM StudentAnswers WHERE session_id = ? AND question_id = ?').get(session_id, q.id);
    if (existing) {
      db.prepare('UPDATE StudentAnswers SET selected_answer = ?, is_correct = ?, answered_at = ? WHERE id = ?').run(
        studentAns || '',
        isCorrect,
        now,
        existing.id
      );
    } else {
      db.prepare(`
        INSERT INTO StudentAnswers (id, session_id, question_id, selected_answer, is_correct, answered_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('ans-' + Math.random().toString(36).substring(2, 9), session_id, q.id, studentAns || '', isCorrect, now);
    }
  }

  if (totalScore < 0) totalScore = 0;
  const maxPossible = questions.reduce((sum, q) => sum + (q.tq_points || q.points || 1), 0) || 1;
  const percentage = parseFloat(((totalScore / maxPossible) * 100).toFixed(1));

  // Update session
  db.prepare(`
    UPDATE TestSessions SET
      completed_at = ?, status = 'completed', score = ?, percentage = ?,
      correct_count = ?, incorrect_count = ?, blank_count = ?, duration_seconds = ?
    WHERE id = ?
  `).run(now, totalScore, percentage, correctCount, incorrectCount, blankCount, duration_seconds || 0, session_id);

  logAudit(null, `${session.student_name} ${session.student_surname}`, 'İmtahan Təhvil Verildi', `Bal: ${totalScore} (${percentage}%), D: ${correctCount}, S: ${incorrectCount}`, req);

  res.json({
    session_id,
    score: totalScore,
    percentage,
    correct_count: correctCount,
    incorrect_count: incorrectCount,
    blank_count: blankCount,
    completed_at: now
  });
});

app.get('/api/exam/session/:id', (req, res) => {
  const { id } = req.params;
  const session = db.prepare('SELECT * FROM TestSessions WHERE id = ?').get(id);
  if (!session) return res.status(404).json({ error: 'Sessiya tapılmadı' });

  const test = db.prepare('SELECT * FROM Tests WHERE id = ?').get(session.test_id);

  // Get student answers with question details and explanations
  const answers = db.prepare(`
    SELECT sa.question_id, sa.selected_answer, sa.is_correct,
           q.question_text, q.options_json, q.correct_answer, q.explanation, q.image_url,
           q.subject, q.topic, q.points
    FROM StudentAnswers sa
    JOIN Questions q ON sa.question_id = q.id
    WHERE sa.session_id = ?
  `).all(id);

  res.json({
    session,
    test,
    answers: answers.map(a => ({
      ...a,
      options: a.options_json ? JSON.parse(a.options_json) : []
    }))
  });
});

// ==========================================
// 6. RESULTS & ANALYTICS
// ==========================================
app.get('/api/results', (req, res) => {
  const { teacher_id, test_id } = req.query;
  let query = `
    SELECT ts.*, t.title as test_title, t.subject, t.exam_model, t.total_questions, t.total_points
    FROM TestSessions ts
    JOIN Tests t ON ts.test_id = t.id
    WHERE ts.status = 'completed'
  `;
  const params = [];

  if (test_id) {
    query += ' AND ts.test_id = ?';
    params.push(test_id);
  }
  if (teacher_id) {
    query += ' AND t.teacher_id = ?';
    params.push(teacher_id);
  }

  query += ' ORDER BY ts.completed_at DESC';
  const results = db.prepare(query).all(...params);
  res.json(results);
});

app.get('/api/tests/:id/analytics', (req, res) => {
  const { id } = req.params;
  const test = db.prepare('SELECT * FROM Tests WHERE id = ?').get(id);
  if (!test) return res.status(404).json({ error: 'Test tapılmadı' });

  const sessions = db.prepare("SELECT * FROM TestSessions WHERE test_id = ? AND status = 'completed'").all(id);

  if (sessions.length === 0) {
    return res.json({
      test,
      total_participants: 0,
      avg_score: 0,
      avg_percentage: 0,
      max_score: 0,
      min_score: 0,
      question_accuracy: [],
      most_failed_questions: [],
      score_distribution: { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 }
    });
  }

  const scores = sessions.map(s => s.score);
  const avgScore = parseFloat((scores.reduce((a, b) => a + b, 0) / sessions.length).toFixed(1));
  const avgPercentage = parseFloat((sessions.reduce((a, b) => a + b.percentage, 0) / sessions.length).toFixed(1));
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  // Score distribution
  const distribution = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  for (const s of sessions) {
    if (s.percentage <= 20) distribution['0-20']++;
    else if (s.percentage <= 40) distribution['21-40']++;
    else if (s.percentage <= 60) distribution['41-60']++;
    else if (s.percentage <= 80) distribution['61-80']++;
    else distribution['81-100']++;
  }

  // Question-by-question accuracy
  const questions = db.prepare(`
    SELECT q.id, q.question_text, q.correct_answer, tq.order_index
    FROM TestQuestions tq
    JOIN Questions q ON tq.question_id = q.id
    WHERE tq.test_id = ?
    ORDER BY tq.order_index ASC
  `).all(id);

  const questionStats = questions.map(q => {
    const answers = db.prepare(`
      SELECT sa.is_correct, sa.selected_answer
      FROM StudentAnswers sa
      JOIN TestSessions ts ON sa.session_id = ts.id
      WHERE ts.test_id = ? AND sa.question_id = ? AND ts.status = 'completed'
    `).all(id, q.id);

    const total = answers.length;
    const correct = answers.filter(a => a.is_correct === 1).length;
    const accuracy = total > 0 ? parseFloat(((correct / total) * 100).toFixed(1)) : 0;

    return {
      question_id: q.id,
      order_index: q.order_index + 1,
      text_preview: q.question_text.substring(0, 60),
      total_attempts: total,
      correct_count: correct,
      accuracy_percentage: accuracy,
    };
  });

  const mostFailed = [...questionStats].sort((a, b) => a.accuracy_percentage - b.accuracy_percentage).slice(0, 5);

  res.json({
    test,
    total_participants: sessions.length,
    avg_score: avgScore,
    avg_percentage: avgPercentage,
    max_score: maxScore,
    min_score: minScore,
    score_distribution: distribution,
    question_accuracy: questionStats,
    most_failed_questions: mostFailed,
    participants: sessions
  });
});

// ==========================================
// 7. CLASSES & STUDENTS
// ==========================================
app.get('/api/classes', (req, res) => {
  const classes = db.prepare('SELECT * FROM Classes ORDER BY grade ASC, name ASC').all();
  const enriched = classes.map(c => {
    const count = db.prepare('SELECT COUNT(*) as cnt FROM Students WHERE class_id = ?').get(c.id);
    return { ...c, student_count: count ? count.cnt : 0 };
  });
  res.json(enriched);
});

app.post('/api/classes', (req, res) => {
  const { teacher_id, name, grade, description } = req.body;
  if (!name || !grade) return res.status(400).json({ error: 'Sinif adı və dərəcə mütləqdir' });

  const id = 'cls-' + Math.random().toString(36).substring(2, 9);
  db.prepare(`
    INSERT INTO Classes (id, teacher_id, name, grade, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, teacher_id || 'usr-teacher-1', name, parseInt(grade), description || '', new Date().toISOString());

  res.status(201).json({ id, message: 'Sinif yaradıldı' });
});

app.get('/api/students', (req, res) => {
  const { class_id } = req.query;
  let query = `
    SELECT s.*, c.name as class_name, c.grade
    FROM Students s
    LEFT JOIN Classes c ON s.class_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (class_id) {
    query += ' AND s.class_id = ?';
    params.push(class_id);
  }
  query += ' ORDER BY s.full_name ASC';
  const students = db.prepare(query).all(...params);
  res.json(students);
});

app.post('/api/students', (req, res) => {
  const { teacher_id, class_id, full_name, phone } = req.body;
  if (!full_name) return res.status(400).json({ error: 'Şagirdin adı və soyadı tələb olunur' });

  const id = 'std-' + Math.random().toString(36).substring(2, 9);
  const number = 'EDX-' + Math.floor(1000 + Math.random() * 9000);

  db.prepare(`
    INSERT INTO Students (id, teacher_id, class_id, full_name, student_number, phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, teacher_id || 'usr-teacher-1', class_id || null, full_name, number, phone || '', new Date().toISOString());

  res.status(201).json({ id, student_number: number, message: 'Şagird əlavə edildi' });
});

// ==========================================
// 8. ADMIN STATS & AUDIT LOGS
// ==========================================
app.get('/api/admin/stats', (req, res) => {
  const usersCount = db.prepare('SELECT COUNT(*) as cnt FROM Users').get().cnt;
  const proCount = db.prepare('SELECT COUNT(*) as cnt FROM Users WHERE is_pro = 1').get().cnt;
  const testsCount = db.prepare('SELECT COUNT(*) as cnt FROM Tests').get().cnt;
  const questionsCount = db.prepare('SELECT COUNT(*) as cnt FROM Questions').get().cnt;
  const sessionsCount = db.prepare("SELECT COUNT(*) as cnt FROM TestSessions WHERE status = 'completed'").get().cnt;
  const codesCount = db.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) as used FROM ActivationCodes').get();

  res.json({
    total_users: usersCount,
    pro_users: proCount,
    total_tests: testsCount,
    total_questions: questionsCount,
    completed_exams: sessionsCount,
    codes: {
      total: codesCount.total || 0,
      used: codesCount.used || 0,
      unused: (codesCount.total || 0) - (codesCount.used || 0)
    }
  });
});

app.get('/api/admin/audit-logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM AuditLogs ORDER BY created_at DESC LIMIT 50').all();
  res.json(logs);
});

// Serve frontend build in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// For SPA routing fallback in Express 5
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint tapılmadı' });
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`[EDUNEX Server] Running on http://localhost:${PORT}`);
});
