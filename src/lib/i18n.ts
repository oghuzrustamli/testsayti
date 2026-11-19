// src/lib/i18n.ts
// ATROQ Education - Multi-language (AZ, EN, RU) Translation Dictionary & Helper

export type Language = 'az' | 'en' | 'ru';

export interface Translations {
  // Navigation & Header
  controlPanel: string;
  roleTeacher: string;
  roleStudent: string;
  roleAdmin: string;
  proUpgrade: string;
  proActive: string;
  login: string;
  logout: string;
  lightMode: string;
  darkMode: string;
  languageName: string;
  systemStatusActive: string;

  // Categories
  catCore: string;
  catCoreSub: string;
  catTestCreation: string;
  catTestCreationSub: string;
  catExams: string;
  catExamsSub: string;
  catTeaching: string;
  catTeachingSub: string;
  catRegional: string;
  catRegionalSub: string;
  catSystem: string;
  catSystemSub: string;

  // Submenu items & Titles
  dashboardTitle: string;
  dashboardDesc: string;
  createInteractiveTitle: string;
  createInteractiveDesc: string;
  createAiTitle: string;
  createAiDesc: string;
  createOmrTitle: string;
  createOmrDesc: string;
  examsHubTitle: string;
  examsHubDesc: string;
  myTestsTitle: string;
  myTestsDesc: string;
  questionBankTitle: string;
  questionBankDesc: string;
  classesTitle: string;
  classesDesc: string;
  resultsTitle: string;
  resultsDesc: string;
  statisticsTitle: string;
  statisticsDesc: string;
  regionalStatsTitle: string;
  regionalStatsDesc: string;
  aboutTitle: string;
  aboutDesc: string;
  archiveTitle: string;
  archiveDesc: string;
  settingsTitle: string;
  settingsDesc: string;
  usersTitle: string;
  usersDesc: string;
  auditTitle: string;
  auditDesc: string;
  activationCodesTitle: string;
  activationCodesDesc: string;
  packagesTitle: string;
  packagesDesc: string;
  subscriptionsTitle: string;
  subscriptionsDesc: string;
  statsTitle: string;
  statsDesc: string;
  enterTestTitle: string;
  enterTestDesc: string;
  activeTestsTitle: string;
  activeTestsDesc: string;
  completedTestsTitle: string;
  completedTestsDesc: string;
  profileTitle: string;
  profileDesc: string;

  // Dashboard Page
  welcome: string;
  welcomeSubtitle: string;
  kpiPublishedTests: string;
  kpiQuestionBank: string;
  kpiStudentSessions: string;
  kpiAverageScore: string;
  fastActionAi: string;
  fastActionInteractive: string;
  fastActionOmr: string;
  fastActionRegional: string;
  hubExamsTitle: string;
  hubExamsDesc: string;
  hubMyTestsTitle: string;
  hubMyTestsDesc: string;
  hubClassesTitle: string;
  hubClassesDesc: string;
  hubResultsTitle: string;
  hubResultsDesc: string;
  hubRegionalTitle: string;
  hubRegionalDesc: string;
  hubAboutTitle: string;
  hubAboutDesc: string;
  recentTests: string;
  recentSubmissions: string;
  noTestsYet: string;
  noSubmissionsYet: string;
  copyLink: string;
  linkCopied: string;
  shareWhatsapp: string;
  openEditor: string;
  allTests: string;
  allResults: string;
  closeEsc: string;
  functionsCount: string;
  sectionsCount: string;
  currentSection: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  az: {
    controlPanel: 'İdarəetmə paneli',
    roleTeacher: 'Müəllim',
    roleStudent: 'Şagird',
    roleAdmin: 'Admin',
    proUpgrade: 'PRO-ya Keç',
    proActive: 'PRO Aktivdir',
    login: 'Daxil ol',
    logout: 'Sistemdən Çıxış',
    lightMode: 'Açıq rejim',
    darkMode: 'Tünd rejim',
    languageName: 'Azərbaycan dili',
    systemStatusActive: 'Sistem aktivdir',

    catCore: 'Əsas',
    catCoreSub: 'İdarəetmə Paneli',
    catTestCreation: 'Testlərin Hazırlanması',
    catTestCreationSub: 'İnteraktiv, AI və OMR',
    catExams: 'İmtahanlar & Arxiv',
    catExamsSub: 'Sınaqlar və Sual Bankı',
    catTeaching: 'Tədris və Nəzarət',
    catTeachingSub: 'Siniflər, Jurnal və Analitika',
    catRegional: 'Regional Təhsil',
    catRegionalSub: 'Naxçıvan MR Reytinqi',
    catSystem: 'Sistem',
    catSystemSub: 'Haqqında və Parametrlər',

    dashboardTitle: 'İdarəetmə Paneli',
    dashboardDesc: 'Ümumi icmal, KPI statistikası, son sınaqlar və sürətli əməliyyatlar',
    createInteractiveTitle: 'İnteraktiv Test Yarat',
    createInteractiveDesc: 'Birbaşa onlayn sual konstruktoru, riyazi KaTeX düsturları və açıq/qapalı suallar',
    createAiTitle: 'AI ilə Test Yarat',
    createAiDesc: 'DİM təhsil proqramına uyğun fənn və mövzu üzrə süni intellektlə saniyələr içində sınaq',
    createOmrTitle: 'OMR / Cavablı Test',
    createOmrDesc: 'PDF və Word sual kitabçası yüklənməsi, 3 sütunlu optik cavab kartı və şablonlar',
    examsHubTitle: 'Sınaq Portalı',
    examsHubDesc: 'Buraxılış, Blok, Məktəbdaxili (KSQ/BSQ) və Lisey imtahanları kataloqu',
    myTestsTitle: 'Bütün Testlərim',
    myTestsDesc: 'Müəllimin şəxsi test bazası, yayımlanmış və qaralama sınaqların idarəsi',
    questionBankTitle: 'Sual Bankı',
    questionBankDesc: 'Fənlər və mövzular üzrə toplanmış minlərlə hazır sual və tapşırıq bazası',
    classesTitle: 'Sinif və Şagirdlər',
    classesDesc: 'Sinif siyahıları, şagird profilləri və tədris qrupları',
    resultsTitle: 'Nəticələr və Jurnal',
    resultsDesc: 'Şagirdlərin imtahan balları, faizləri və rəqəmsal qiymətləndirmə jurnalı',
    statisticsTitle: 'Akademik Statistika',
    statisticsDesc: 'Siniflərin və fənlərin müvəffəqiyyət dinamikası, inkişaf diaqramları',
    regionalStatsTitle: 'Regional Statistika (NMR)',
    regionalStatsDesc: 'Naxçıvan Muxtar Respublikasının bütün rayon və məktəbləri üzrə akademik reytinq',
    aboutTitle: 'Haqqında & Video',
    aboutDesc: 'ATROQ Education təqdimatı, virtual qadın aparıcı və video bələdçi',
    archiveTitle: 'Arxiv',
    archiveDesc: 'Saxlanılmış köhnə sınaqlar, fənn materialları və sənədlər',
    settingsTitle: 'Parametrlər',
    settingsDesc: 'İstifadəçi profili, təhlükəsizlik, şifrə və platforma tənzimləmələri',
    usersTitle: 'İstifadəçilərin İdarəsi',
    usersDesc: 'Müəllim, şagird və administrator hesablarının tam idarə olunması',
    auditTitle: 'Audit Jurnalı',
    auditDesc: 'Sistem təhlükəsizlik qeydləri və fəaliyyət tarixçəsi',
    activationCodesTitle: 'Aktivasiya Kodları (PRO)',
    activationCodesDesc: 'Müəllimlər üçün 16 rəqəmli PRO lisenziya kodlarının generasiyası',
    packagesTitle: 'Paketlər və Qiymətlər',
    packagesDesc: 'Aylıq və illik xidmət paketlərinin tənzimlənməsi',
    subscriptionsTitle: 'Abunəliklər',
    subscriptionsDesc: 'Aktiv abunələr və ödəniş statusları',
    statsTitle: 'İstifadə Statistikası',
    statsDesc: 'Platformanın ümumi statistik göstəriciləri və qrafiklər',
    enterTestTitle: 'Testə Daxil Ol',
    enterTestDesc: 'Müəllimin təqdim etdiyi paylaşım linki və ya PIN kodla imtahana başla',
    activeTestsTitle: 'Aktiv Sınaqlar',
    activeTestsDesc: 'Cari olaraq təyin edilmiş və daxil ola biləcəyiniz testlər',
    completedTestsTitle: 'Tamamlanmış Sınaqlar',
    completedTestsDesc: 'İştirak etdiyiniz imtahanların siyahısı və nəticələri',
    profileTitle: 'Şəxsi Məlumatlar',
    profileDesc: 'Şagird profili, təhsil aldığı məktəb və sinif məlumatları',

    welcome: 'Xoş gəlmisiniz',
    welcomeSubtitle: 'ATROQ Education ilə Buraxılış, Blok və Lisey sınaqlarını süni intellektlə saniyələr ərzində hazırlayın, A4 formatında PDF sual kitabçası çıxarın və şagirdlərin nəticələrini real vaxtda izləyin.',
    kpiPublishedTests: 'Yayımlanan Testlər',
    kpiQuestionBank: 'Sual Bankı',
    kpiStudentSessions: 'Şagird Sessiyaları',
    kpiAverageScore: 'Orta Müvəffəqiyyət',
    fastActionAi: 'AI ilə Test Yarat',
    fastActionInteractive: 'İnteraktiv Test',
    fastActionOmr: 'OMR Test',
    fastActionRegional: 'Regional Reytinq',
    hubExamsTitle: 'Sınaq İmtahanları Portalı',
    hubExamsDesc: 'DİM qəbul, buraxılış, blok və lisey sınaqlarının tam bazası',
    hubMyTestsTitle: 'Bütün Testlərim & AI Arxivi',
    hubMyTestsDesc: 'Şəxsi testləriniz, qaralamalar, DİM fənn və sinif bölmələri',
    hubClassesTitle: 'Sinif və Şagirdlər',
    hubClassesDesc: 'Siniflərin idarə olunması, şagird siyahıları və dəvət kodları',
    hubResultsTitle: 'Nəticələr və Jurnal',
    hubResultsDesc: 'İmtahan balları, faizləri, statistik təhlil və jurnallar',
    hubRegionalTitle: 'Regional Statistika (NMR)',
    hubRegionalDesc: 'Naxçıvan Muxtar Respublikası üzrə rayon və məktəblərin akademik reytinqi',
    hubAboutTitle: 'ATROQ Haqqında & Video',
    hubAboutDesc: 'Platformanın imkanları, virtual qadın aparıcı və video bələdçi',
    recentTests: 'Son Testlərim',
    recentSubmissions: 'Son İmtahan Nəticələri',
    noTestsYet: 'Hələ heç bir test yaradılmayıb',
    noSubmissionsYet: 'Hələ heç bir şagird imtahan verməyib',
    copyLink: 'Linki kopyala',
    linkCopied: 'Kopyalandı',
    shareWhatsapp: 'WhatsApp ilə paylaş',
    openEditor: 'Redaktə et',
    allTests: 'Bütün testlər →',
    allResults: 'Bütün nəticələr →',
    closeEsc: 'Bağla (Esc)',
    functionsCount: 'Funksiya',
    sectionsCount: 'Bölmə',
    currentSection: 'Cari Səhifə',
  },

  en: {
    controlPanel: 'Control Panel',
    roleTeacher: 'Teacher',
    roleStudent: 'Student',
    roleAdmin: 'Admin',
    proUpgrade: 'Get PRO',
    proActive: 'PRO Active',
    login: 'Log In',
    logout: 'Log Out',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    languageName: 'English',
    systemStatusActive: 'System is active',

    catCore: 'Main',
    catCoreSub: 'Control Panel',
    catTestCreation: 'Test Creation',
    catTestCreationSub: 'Interactive, AI & OMR',
    catExams: 'Exams & Archive',
    catExamsSub: 'Mocks & Question Bank',
    catTeaching: 'Teaching & Control',
    catTeachingSub: 'Classes, Grades & Analytics',
    catRegional: 'Regional Education',
    catRegionalSub: 'Nakhchivan AR Ranking',
    catSystem: 'System',
    catSystemSub: 'About & Settings',

    dashboardTitle: 'Control Panel',
    dashboardDesc: 'Overview, KPI statistics, recent mock tests, and quick actions',
    createInteractiveTitle: 'Create Interactive Test',
    createInteractiveDesc: 'Direct online question builder, KaTeX formulas, and multiple question types',
    createAiTitle: 'Create AI Test',
    createAiDesc: 'Generate exams in seconds matching official curriculum standards using AI',
    createOmrTitle: 'OMR / Answer Sheet Test',
    createOmrDesc: 'Upload PDF and Word exam booklets, generate 3-column optical answer sheets',
    examsHubTitle: 'Exam Portal',
    examsHubDesc: 'Catalog of graduation, block, internal, and lyceum mock examinations',
    myTestsTitle: 'My Tests',
    myTestsDesc: 'Personal test library, published exams, and draft management',
    questionBankTitle: 'Question Bank',
    questionBankDesc: 'Database of thousands of ready questions grouped by subject and topic',
    classesTitle: 'Classes & Students',
    classesDesc: 'Class rosters, student accounts, and study group management',
    resultsTitle: 'Results & Gradebook',
    resultsDesc: 'Student exam scores, percentages, and digital evaluation gradebook',
    statisticsTitle: 'Academic Statistics',
    statisticsDesc: 'Performance dynamics of classes and subjects with progress charts',
    regionalStatsTitle: 'Regional Statistics (NMR)',
    regionalStatsDesc: 'Academic ranking across all districts and schools of Nakhchivan AR',
    aboutTitle: 'About & Video',
    aboutDesc: 'ATROQ Education presentation, virtual presenter, and video guide',
    archiveTitle: 'Archive',
    archiveDesc: 'Archived past exams, subject materials, and curriculum documents',
    settingsTitle: 'Settings',
    settingsDesc: 'User profile, security, password, and platform preferences',
    usersTitle: 'User Management',
    usersDesc: 'Full administration of teacher, student, and admin accounts',
    auditTitle: 'Audit Log',
    auditDesc: 'System security logs and administrative action history',
    activationCodesTitle: 'Activation Codes (PRO)',
    activationCodesDesc: 'Generate 16-digit PRO license keys for educators',
    packagesTitle: 'Plans & Pricing',
    packagesDesc: 'Monthly and annual subscription tier management',
    subscriptionsTitle: 'Subscriptions',
    subscriptionsDesc: 'Active subscriptions and billing transaction statuses',
    statsTitle: 'Usage Statistics',
    statsDesc: 'Overall system performance metrics and usage analytics',
    enterTestTitle: 'Enter Test',
    enterTestDesc: 'Start an exam using the teacher share link or PIN code',
    activeTestsTitle: 'Active Exams',
    activeTestsDesc: 'Current exams assigned to you ready to be taken',
    completedTestsTitle: 'Completed Exams',
    completedTestsDesc: 'List of completed exams with scores and answer reviews',
    profileTitle: 'Personal Profile',
    profileDesc: 'Student profile, school, and grade information',

    welcome: 'Welcome',
    welcomeSubtitle: 'Create Graduation, Block, and High School mock exams in seconds with AI, generate A4 PDF test booklets, and monitor student performance in real time.',
    kpiPublishedTests: 'Published Tests',
    kpiQuestionBank: 'Question Bank',
    kpiStudentSessions: 'Student Sessions',
    kpiAverageScore: 'Average Performance',
    fastActionAi: 'Create AI Test',
    fastActionInteractive: 'Interactive Test',
    fastActionOmr: 'OMR Test',
    fastActionRegional: 'Regional Ranking',
    hubExamsTitle: 'Mock Exam Portal',
    hubExamsDesc: 'Full repository of SEC admission, graduation, and lyceum tests',
    hubMyTestsTitle: 'My Tests & AI Archive',
    hubMyTestsDesc: 'Your personal tests, drafts, subjects, and grade levels',
    hubClassesTitle: 'Classes & Students',
    hubClassesDesc: 'Class management, student rosters, and invitation codes',
    hubResultsTitle: 'Results & Gradebook',
    hubResultsDesc: 'Exam scores, percentages, statistical analytics, and gradebooks',
    hubRegionalTitle: 'Regional Statistics (NMR)',
    hubRegionalDesc: 'Academic ranking of districts and schools in Nakhchivan AR',
    hubAboutTitle: 'About ATROQ & Video',
    hubAboutDesc: 'Platform capabilities, virtual female presenter, and video walkthrough',
    recentTests: 'Recent Tests',
    recentSubmissions: 'Recent Exam Submissions',
    noTestsYet: 'No tests created yet',
    noSubmissionsYet: 'No students have taken an exam yet',
    copyLink: 'Copy link',
    linkCopied: 'Copied',
    shareWhatsapp: 'Share via WhatsApp',
    openEditor: 'Edit test',
    allTests: 'All tests →',
    allResults: 'All results →',
    closeEsc: 'Close (Esc)',
    functionsCount: 'Functions',
    sectionsCount: 'Sections',
    currentSection: 'Current Page',
  },

  ru: {
    controlPanel: 'Панель управления',
    roleTeacher: 'Учитель',
    roleStudent: 'Ученик',
    roleAdmin: 'Админ',
    proUpgrade: 'Перейти на PRO',
    proActive: 'PRO Активен',
    login: 'Войти',
    logout: 'Выход из системы',
    lightMode: 'Светлая тема',
    darkMode: 'Тёмная тема',
    languageName: 'Русский',
    systemStatusActive: 'Система активна',

    catCore: 'Главная',
    catCoreSub: 'Панель управления',
    catTestCreation: 'Создание тестов',
    catTestCreationSub: 'Интерактивные, ИИ и OMR',
    catExams: 'Экзамены и архив',
    catExamsSub: 'Тесты и банк вопросов',
    catTeaching: 'Обучение и контроль',
    catTeachingSub: 'Классы, журнал и аналитика',
    catRegional: 'Региональное образование',
    catRegionalSub: 'Рейтинг Нахчыванской АР',
    catSystem: 'Система',
    catSystemSub: 'О системе и настройки',

    dashboardTitle: 'Панель управления',
    dashboardDesc: 'Общий обзор, статистика KPI, недавние тесты и быстрые действия',
    createInteractiveTitle: 'Интерактивный тест',
    createInteractiveDesc: 'Онлайн конструктор вопросов, математические формулы KaTeX и типы заданий',
    createAiTitle: 'Создать тест с ИИ',
    createAiDesc: 'Генерация тестов за секунды в соответствии со стандартами учебной программы',
    createOmrTitle: 'OMR / Бланочный тест',
    createOmrDesc: 'Загрузка PDF и Word буклетов, создание 3-колоночных оптических бланков ответов',
    examsHubTitle: 'Портал экзаменов',
    examsHubDesc: 'Каталог выпускных, блочных, внутришкольных и лицейских экзаменов',
    myTestsTitle: 'Все мои тесты',
    myTestsDesc: 'Личная база тестов учителя, опубликованные тесты и черновики',
    questionBankTitle: 'Банк вопросов',
    questionBankDesc: 'База тысяч готовых вопросов по предметам и темам программы',
    classesTitle: 'Классы и ученики',
    classesDesc: 'Списки классов, профили учеников и учебные группы',
    resultsTitle: 'Результаты и журнал',
    resultsDesc: 'Баллы учеников, проценты выполнения и электронный журнал оценок',
    statisticsTitle: 'Академическая статистика',
    statisticsDesc: 'Динамика успеваемости классов и предметов с графиками прогресса',
    regionalStatsTitle: 'Региональная статистика (НМР)',
    regionalStatsDesc: 'Академический рейтинг районов и школ Нахчыванской Автономной Республики',
    aboutTitle: 'О системе и видео',
    aboutDesc: 'Презентация платформы ATROQ Education, виртуальная ведущая и видеогид',
    archiveTitle: 'Архив',
    archiveDesc: 'Сохранённые прошлые тесты, учебные материалы и документы',
    settingsTitle: 'Настройки',
    settingsDesc: 'Профиль пользователя, безопасность, пароль и параметры системы',
    usersTitle: 'Управление пользователями',
    usersDesc: 'Полное администрирование учётных записей учителей, учеников и админов',
    auditTitle: 'Журнал аудита',
    auditDesc: 'Записи безопасности системы и история действий администратора',
    activationCodesTitle: 'Коды активации (PRO)',
    activationCodesDesc: 'Генерация 16-значных лицензионных ключей PRO для преподавателей',
    packagesTitle: 'Тарифы и пакеты',
    packagesDesc: 'Управление тарифами ежемесячной и годовой подписки',
    subscriptionsTitle: 'Подписки',
    subscriptionsDesc: 'Активные подписки и статусы платёжных операций',
    statsTitle: 'Статистика использования',
    statsDesc: 'Общие показатели производительности платформы и аналитика',
    enterTestTitle: 'Войти в тест',
    enterTestDesc: 'Начать тестирование по ссылке или PIN-коду учителя',
    activeTestsTitle: 'Активные тесты',
    activeTestsDesc: 'Текущие назначенные тесты, доступные для прохождения',
    completedTestsTitle: 'Завершённые тесты',
    completedTestsDesc: 'Список пройденных тестов с баллами и разбором ответов',
    profileTitle: 'Личные данные',
    profileDesc: 'Профиль ученика, школа и данные учебного класса',

    welcome: 'Добро пожаловать',
    welcomeSubtitle: 'Создавайте выпускные, блочные и лицейские тесты за секунды с помощью ИИ, распечатывайте буклеты А4 и отслеживайте результаты в реальном времени.',
    kpiPublishedTests: 'Опубликованные тесты',
    kpiQuestionBank: 'Банк вопросов',
    kpiStudentSessions: 'Сессии учеников',
    kpiAverageScore: 'Средняя успеваемость',
    fastActionAi: 'Создать тест с ИИ',
    fastActionInteractive: 'Интерактивный тест',
    fastActionOmr: 'OMR тест',
    fastActionRegional: 'Региональный рейтинг',
    hubExamsTitle: 'Портал экзаменов',
    hubExamsDesc: 'Полная база вступительных, выпускных и лицейских тестов',
    hubMyTestsTitle: 'Мои тесты и архив ИИ',
    hubMyTestsDesc: 'Личные тесты, черновики, предметы и категории классов',
    hubClassesTitle: 'Классы и ученики',
    hubClassesDesc: 'Управление классами, списки учеников и коды доступа',
    hubResultsTitle: 'Результаты и журнал',
    hubResultsDesc: 'Баллы за экзамены, проценты, статистический анализ и журналы',
    hubRegionalTitle: 'Региональная статистика (НМР)',
    hubRegionalDesc: 'Академический рейтинг районов и школ Нахчыванской АР',
    hubAboutTitle: 'Об ATROQ и видео',
    hubAboutDesc: 'Возможности платформы, виртуальная ведущая и видеогид',
    recentTests: 'Мои недавние тесты',
    recentSubmissions: 'Недавние сдачи экзаменов',
    noTestsYet: 'Тесты пока не созданы',
    noSubmissionsYet: 'Ни один ученик ещё не проходил тест',
    copyLink: 'Копировать ссылку',
    linkCopied: 'Скопировано',
    shareWhatsapp: 'Поделиться в WhatsApp',
    openEditor: 'Редактировать',
    allTests: 'Все тесты →',
    allResults: 'Все результаты →',
    closeEsc: 'Закрыть (Esc)',
    functionsCount: 'Функций',
    sectionsCount: 'Разделов',
    currentSection: 'Текущий раздел',
  },
};

// Local storage keys
const LANG_STORAGE_KEY = 'atroq_language';

export function getStoredLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'az' || saved === 'en' || saved === 'ru') {
      return saved;
    }
  } catch (e) {
    // ignore
  }
  return 'az';
}

export function saveStoredLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (e) {
    // ignore
  }
}
