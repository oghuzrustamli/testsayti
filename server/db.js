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
      test_type TEXT DEFAULT 'standard', -- standard, ai, omr
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
  try { db.exec("ALTER TABLE TestSessions ADD COLUMN district TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE TestSessions ADD COLUMN school TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE TestSessions ADD COLUMN grade TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE TestSessions ADD COLUMN monitoring_period TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE TestSessions ADD COLUMN utis_code TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE Users ADD COLUMN district TEXT;"); } catch (e) {}
  try { db.exec("ALTER TABLE Users ADD COLUMN utis_code TEXT;"); } catch (e) {}

  // Schools table for centralized school management (Tələb 3)
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS Schools (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        district TEXT NOT NULL,
        utis_code TEXT UNIQUE,
        school_type TEXT DEFAULT 'tam_orta',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL
      );
    `);
  } catch (e) {}

  try {
    db.exec("ALTER TABLE Tests ADD COLUMN test_type TEXT DEFAULT 'standard';");
  } catch (e) {}

  // UTIS Şagird Bazası Cədvəlləri və Sütun Miqrasiyaları
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS ImportHistory (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        total_rows INTEGER NOT NULL DEFAULT 0,
        imported_count INTEGER NOT NULL DEFAULT 0,
        updated_count INTEGER NOT NULL DEFAULT 0,
        skipped_count INTEGER NOT NULL DEFAULT 0,
        imported_by TEXT,
        created_at TEXT NOT NULL
      );
    `);
  } catch (e) {}

  try {
    const studentCols = db.prepare("PRAGMA table_info(Students)").all().map(c => c.name);
    if (!studentCols.includes('first_name')) db.exec("ALTER TABLE Students ADD COLUMN first_name TEXT;");
    if (!studentCols.includes('last_name')) db.exec("ALTER TABLE Students ADD COLUMN last_name TEXT;");
    if (!studentCols.includes('father_name')) db.exec("ALTER TABLE Students ADD COLUMN father_name TEXT;");
    if (!studentCols.includes('utis_code')) db.exec("ALTER TABLE Students ADD COLUMN utis_code TEXT;");
    if (!studentCols.includes('fin_code')) db.exec("ALTER TABLE Students ADD COLUMN fin_code TEXT;");
    if (!studentCols.includes('grade_class')) db.exec("ALTER TABLE Students ADD COLUMN grade_class TEXT;");
    if (!studentCols.includes('school_name')) db.exec("ALTER TABLE Students ADD COLUMN school_name TEXT;");
    if (!studentCols.includes('is_archived')) db.exec("ALTER TABLE Students ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0;");
    if (!studentCols.includes('archived_at')) db.exec("ALTER TABLE Students ADD COLUMN archived_at TEXT;");
    if (!studentCols.includes('updated_at')) db.exec("ALTER TABLE Students ADD COLUMN updated_at TEXT;");
    if (!studentCols.includes('district')) db.exec("ALTER TABLE Students ADD COLUMN district TEXT;");
    if (!studentCols.includes('settlement')) db.exec("ALTER TABLE Students ADD COLUMN settlement TEXT;");
    if (!studentCols.includes('school_id')) db.exec("ALTER TABLE Students ADD COLUMN school_id TEXT;");
  } catch (e) {}

  // UTİS və Dinamik Ölkə Məktəb-Şagird Bazası Cədvəlləri
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS Districts (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        region_type TEXT DEFAULT 'rayon',
        parent_region TEXT DEFAULT 'Naxçıvan MR',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Settlements (
        id TEXT PRIMARY KEY,
        district_id TEXT NOT NULL,
        name TEXT NOT NULL,
        settlement_type TEXT DEFAULT 'kend',
        created_at TEXT NOT NULL,
        UNIQUE(district_id, name)
      );

      CREATE TABLE IF NOT EXISTS UtisSettings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS UtisSyncHistory (
        id TEXT PRIMARY KEY,
        sync_type TEXT NOT NULL,
        status TEXT NOT NULL,
        total_synced INTEGER NOT NULL DEFAULT 0,
        new_added INTEGER NOT NULL DEFAULT 0,
        updated_count INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TEXT NOT NULL
      );
    `);

    // Ensure Schools has settlement column
    const schoolCols = db.prepare("PRAGMA table_info(Schools)").all().map(c => c.name);
    if (!schoolCols.includes('settlement')) db.exec("ALTER TABLE Schools ADD COLUMN settlement TEXT;");
  } catch (e) {
    console.error('Error creating UTIS tables:', e);
  }

  // Sınaq İmtahanları (Naxçıvan MR Təhsil Nazirliyi Sınaq İmtahanı İnteqrasiyası)
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS MinistryExamSettings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS MinistryExamResults (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        student_surname TEXT,
        utis_code TEXT NOT NULL,
        grade TEXT NOT NULL,
        exam_id TEXT NOT NULL,
        exam_title TEXT NOT NULL,
        score REAL,
        details_json TEXT,
        status TEXT NOT NULL,
        error_message TEXT,
        fetched_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_ministry_student_exam ON MinistryExamResults(student_id, exam_id);
    `);

    // İlkin tənzimləmə: https://nmr.edu.az/search-live-exam-result
    const existingUrl = db.prepare("SELECT value FROM MinistryExamSettings WHERE key = 'exam_source_url'").get();
    if (!existingUrl) {
      db.prepare(`
        INSERT INTO MinistryExamSettings (key, value, updated_at)
        VALUES ('exam_source_url', 'https://nmr.edu.az/search-live-exam-result', datetime('now'))
      `).run();
    }
  } catch (e) {
    console.error('Error initializing MinistryExam tables:', e);
  }

  seedInitialData();
  seedUtisData();
  repairExistingTests();
}

// UTİS və Ölkə üzrə Rayon, Məktəb və Şagird Bazasının İlkin Doldurulması
function seedUtisData() {
  try {
    const now = new Date().toISOString();

    // 1. Rayon və Şəhərlərin Doldurulması
    const distCount = db.prepare('SELECT COUNT(*) as count FROM Districts').get();
    if (distCount.count === 0) {
      const districts = [
        // Naxçıvan MR
        { id: 'dist-naxcivan', name: 'Naxçıvan şəhəri', type: 'seher', parent: 'Naxçıvan MR' },
        { id: 'dist-babek', name: 'Babək rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
        { id: 'dist-serur', name: 'Şərur rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
        { id: 'dist-ordubad', name: 'Ordubad rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
        { id: 'dist-culfa', name: 'Culfa rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
        { id: 'dist-kengerli', name: 'Kəngərli rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
        { id: 'dist-sahbuz', name: 'Şahbuz rayonu', type: 'rayon', parent: 'Naxçıvan MR' },
        { id: 'dist-sederek', name: 'Sədərək rayonu', type: 'rayon', parent: 'Naxçıvan MR' },

        // Bakı və Ətraf
        { id: 'dist-baki', name: 'Bakı şəhəri', type: 'seher', parent: 'Bakı iqtisadi rayonu' },
        { id: 'dist-sumqayit', name: 'Sumqayıt şəhəri', type: 'seher', parent: 'Abşeron-Xızı' },
        { id: 'dist-abseron', name: 'Abşeron rayonu', type: 'rayon', parent: 'Abşeron-Xızı' },

        // Gəncə-Daşkəsən və Qazax-Tovuz
        { id: 'dist-gence', name: 'Gəncə şəhəri', type: 'seher', parent: 'Gəncə-Daşkəsən' },
        { id: 'dist-samux', name: 'Samux rayonu', type: 'rayon', parent: 'Gəncə-Daşkəsən' },
        { id: 'dist-tovuz', name: 'Tovuz rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },
        { id: 'dist-semkir', name: 'Şəmkir rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },
        { id: 'dist-qazax', name: 'Qazax rayonu', type: 'rayon', parent: 'Qazax-Tovuz' },

        // Şəki-Zaqatala və Quba-Xaçmaz
        { id: 'dist-seki', name: 'Şəki şəhəri', type: 'seher', parent: 'Şəki-Zaqatala' },
        { id: 'dist-zaqatala', name: 'Zaqatala rayonu', type: 'rayon', parent: 'Şəki-Zaqatala' },
        { id: 'dist-quba', name: 'Quba rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },
        { id: 'dist-xacmaz', name: 'Xaçmaz rayonu', type: 'rayon', parent: 'Quba-Xaçmaz' },

        // Lənkəran-Astara
        { id: 'dist-lenkeran', name: 'Lənkəran rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
        { id: 'dist-astara', name: 'Astara rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },
        { id: 'dist-masalli', name: 'Masallı rayonu', type: 'rayon', parent: 'Lənkəran-Astara' },

        // Qarabağ və Şərqi Zəngəzur
        { id: 'dist-susa', name: 'Şuşa rayonu', type: 'rayon', parent: 'Qarabağ' },
        { id: 'dist-agdam', name: 'Ağdam rayonu', type: 'rayon', parent: 'Qarabağ' },
        { id: 'dist-berde', name: 'Bərdə rayonu', type: 'rayon', parent: 'Qarabağ' },
        { id: 'dist-kelbecer', name: 'Kəlbəcər rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },
        { id: 'dist-lacin', name: 'Laçın rayonu', type: 'rayon', parent: 'Şərqi Zəngəzur' },

        // Mərkəzi Aran və Dağlıq Şirvan
        { id: 'dist-mingecevir', name: 'Mingəçevir şəhəri', type: 'seher', parent: 'Mərkəzi Aran' },
        { id: 'dist-samaxi', name: 'Şamaxı rayonu', type: 'rayon', parent: 'Dağlıq Şirvan' },
        { id: 'dist-ismayilli', name: 'İsmayıllı rayonu', type: 'rayon', parent: 'Dağlıq Şirvan' },
      ];

      const insDist = db.prepare('INSERT OR IGNORE INTO Districts (id, name, region_type, parent_region, created_at) VALUES (?, ?, ?, ?, ?)');
      for (const d of districts) {
        insDist.run(d.id, d.name, d.type, d.parent, now);
      }
    }

    // 2. Kənd və Qəsəbələrin Doldurulması
    const settCount = db.prepare('SELECT COUNT(*) as count FROM Settlements').get();
    if (settCount.count === 0) {
      const settlements = [
        // Babək rayonunun kənd və qəsəbələri
        { id: 'sett-cehri', district_id: 'dist-babek', name: 'Cəhri qəsəbəsi', type: 'qesebe' },
        { id: 'sett-sixmahmud', district_id: 'dist-babek', name: 'Şıxmahmud kəndi', type: 'kend' },
        { id: 'sett-nehrem', district_id: 'dist-babek', name: 'Nehrəm kəndi', type: 'kend' },
        { id: 'sett-qahab', district_id: 'dist-babek', name: 'Qahab kəndi', type: 'kend' },
        { id: 'sett-sirab', district_id: 'dist-babek', name: 'Sirab kəndi', type: 'kend' },
        { id: 'sett-zeyneddin', district_id: 'dist-babek', name: 'Zeynəddin kəndi', type: 'kend' },
        { id: 'sett-vayxir', district_id: 'dist-babek', name: 'Vayxır kəndi', type: 'kend' },
        { id: 'sett-kultepe', district_id: 'dist-babek', name: 'Kültəpə kəndi', type: 'kend' },
        { id: 'sett-didivar', district_id: 'dist-babek', name: 'Didivar kəndi', type: 'kend' },
        { id: 'sett-yarimca', district_id: 'dist-babek', name: 'Yarımca kəndi', type: 'kend' },

        // Şərur rayonunun kənd və qəsəbələri
        { id: 'sett-mahmudkend', district_id: 'dist-serur', name: 'Mahmudkənd', type: 'kend' },
        { id: 'sett-yengice', district_id: 'dist-serur', name: 'Yengicə kəndi', type: 'kend' },
        { id: 'sett-cercibogan', district_id: 'dist-serur', name: 'Çərçiboğan kəndi', type: 'kend' },
        { id: 'sett-demirci', district_id: 'dist-serur', name: 'Dəmirçi kəndi', type: 'kend' },

        // Ordubad rayonunun kəndləri
        { id: 'sett-ordubad-m', district_id: 'dist-ordubad', name: 'Ordubad şəhər mərkəzi', type: 'seher_merkezi' },
        { id: 'sett-venend', district_id: 'dist-ordubad', name: 'Vənənd kəndi', type: 'kend' },
        { id: 'sett-deste', district_id: 'dist-ordubad', name: 'Dəstə kəndi', type: 'kend' },
        { id: 'sett-bilev', district_id: 'dist-ordubad', name: 'Biləv kəndi', type: 'kend' },

        // Naxçıvan şəhəri
        { id: 'sett-nax-merkez', district_id: 'dist-naxcivan', name: 'Naxçıvan şəhər mərkəzi', type: 'seher_merkezi' },
        { id: 'sett-aliabad', district_id: 'dist-naxcivan', name: 'Əliabad qəsəbəsi', type: 'qesebe' },
        { id: 'sett-qaracuq', district_id: 'dist-naxcivan', name: 'Qaraçuq kəndi', type: 'kend' },
        { id: 'sett-qaraxanbeyli', district_id: 'dist-naxcivan', name: 'Qaraxanbəyli kəndi', type: 'kend' },

        // Bakı şəhəri
        { id: 'sett-yasamal', district_id: 'dist-baki', name: 'Yasamal qəsəbəsi', type: 'qesebe' },
        { id: 'sett-nesimi', district_id: 'dist-baki', name: 'Nəsimi rayonu mərkəzi', type: 'seher_merkezi' },
        { id: 'sett-bineqedi', district_id: 'dist-baki', name: 'Binəqədi qəsəbəsi', type: 'qesebe' },
      ];

      const insSett = db.prepare('INSERT OR IGNORE INTO Settlements (id, district_id, name, settlement_type, created_at) VALUES (?, ?, ?, ?, ?)');
      for (const s of settlements) {
        insSett.run(s.id, s.district_id, s.name, s.type, now);
      }
    }

    // 3. Məktəblərin Doldurulması
    const schoolCount = db.prepare('SELECT COUNT(*) as count FROM Schools').get();
    if (schoolCount.count === 0) {
      const initialSchools = [
        { id: 'sch-bab-cehri-2', name: 'Q.Sadiqov adına Cəhri qəsəbə 2 №-li tam orta məktəb', district: 'Babək rayonu', settlement: 'Cəhri qəsəbəsi', utis_code: '7002007', type: 'tam_orta' },
        { id: 'sch-bab-cehri-1', name: 'Cəhri qəsəbə 1 nömrəli tam orta məktəb', district: 'Babək rayonu', settlement: 'Cəhri qəsəbəsi', utis_code: '7002006', type: 'tam_orta' },
        { id: 'sch-bab-sixmahmud', name: 'Şıxmahmud kənd tam orta məktəbi', district: 'Babək rayonu', settlement: 'Şıxmahmud kəndi', utis_code: '7002009', type: 'tam_orta' },
        { id: 'sch-bab-nehrem-1', name: 'Nehrəm qəsəbə 1 nömrəli tam orta məktəb', district: 'Babək rayonu', settlement: 'Nehrəm kəndi', utis_code: '7002003', type: 'tam_orta' },
        { id: 'sch-bab-sirab', name: 'Sirab kənd tam orta məktəbi', district: 'Babək rayonu', settlement: 'Sirab kəndi', utis_code: '7002008', type: 'tam_orta' },
        { id: 'sch-bab-qahab', name: 'Qahab kənd tam orta məktəbi', district: 'Babək rayonu', settlement: 'Qahab kəndi', utis_code: '7002011', type: 'tam_orta' },

        // Şərur
        { id: 'sch-ser-mahmud', name: 'Mahmudkənd tam orta məktəbi', district: 'Şərur rayonu', settlement: 'Mahmudkənd', utis_code: '7003010', type: 'tam_orta' },
        { id: 'sch-ser-yengice', name: 'Yengicə kənd tam orta məktəbi', district: 'Şərur rayonu', settlement: 'Yengicə kəndi', utis_code: '7003011', type: 'tam_orta' },

        // Naxçıvan şəhəri
        { id: 'sch-nax-01', name: '1 nömrəli tam orta məktəb', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan şəhər mərkəzi', utis_code: '7001001', type: 'tam_orta' },
        { id: 'sch-nax-hl', name: 'Heydər Əliyev adına Hərbi Lisey', district: 'Naxçıvan şəhəri', settlement: 'Naxçıvan şəhər mərkəzi', utis_code: '7001020', type: 'lisey' },

        // Ordubad
        { id: 'sch-ord-01', name: 'M.F.Axundov adına 1 nömrəli tam orta məktəb', district: 'Ordubad rayonu', settlement: 'Ordubad şəhər mərkəzi', utis_code: '7004001', type: 'tam_orta' },
        { id: 'sch-ord-venend', name: 'Vənənd kənd tam orta məktəbi', district: 'Ordubad rayonu', settlement: 'Vənənd kəndi', utis_code: '7004005', type: 'tam_orta' },

        // Bakı
        { id: 'sch-baki-287', name: 'Bakı şəhəri 287 nömrəli Zəkalar liseyi', district: 'Bakı şəhəri', settlement: 'Yasamal qəsəbəsi', utis_code: '1001287', type: 'lisey' },
      ];

      const insSchool = db.prepare('INSERT OR IGNORE INTO Schools (id, name, district, settlement, utis_code, school_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      for (const s of initialSchools) {
        insSchool.run(s.id, s.name, s.district, s.settlement, s.utis_code, s.type, 'active', now);
      }
    }

    // 4. Mövcud 272 şagirdin Məktəb, Rayon və Kəndə bağlanması
    db.prepare(`
      UPDATE Students 
      SET district = 'Babək rayonu', 
          settlement = 'Cəhri qəsəbəsi', 
          school_name = 'Q.Sadiqov adına Cəhri qəsəbə 2 №-li tam orta məktəb',
          school_id = 'sch-bab-cehri-2'
      WHERE district IS NULL OR district = '' OR district = 'undefined'
    `).run();

    // 5. UTİS Tənzimləmələri (UtisSettings)
    const utisSettingCheck = db.prepare("SELECT value FROM UtisSettings WHERE key = 'api_url'").get();
    if (!utisSettingCheck) {
      const insSetting = db.prepare('INSERT OR REPLACE INTO UtisSettings (key, value, updated_at) VALUES (?, ?, ?)');
      insSetting.run('api_url', 'https://utis.edu.az/api/v1', now);
      insSetting.run('organization_code', 'ATROQ-AZ-2026', now);
      insSetting.run('auth_status', 'pending_official_permission', now);
      insSetting.run('exam_source_url', 'https://nmr.edu.az/search-live-exam-result', now);
      insSetting.run('auth_notice', 'Elm və Təhsil Nazirliyinin rəsmi icazəsi və mərkəzləşdirilmiş API açarı gözlənilir. Dövlət təhlükəsizlik qaydalarına əsasən UTİS sisteminə birbaşa çıxış rəsmi dövlət müqaviləsi və akkreditasiya tələb edir. Sistem inteqrasiyaya tam hazırdır. Alternativ olaraq rəsmi Excel idxalı və canlı sınaq imtahanı sorğuları aktiv işləyir.', now);
    }
  } catch (err) {
    console.error('Error seeding UTIS data:', err);
  }
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
    'ATROQ Education Baş Administrator',
    '+994 50 111 22 33',
    'admin',
    'ATROQ Education Mərkəzi Qərargah',
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
  `).run('log-1', 'usr-admin-1', 'ATROQ Education Administrator', 'Sistem başlanğıcı', 'İlkin verilənlər bazası və sınaq məlumatları yükləndi', '127.0.0.1', now);
}
