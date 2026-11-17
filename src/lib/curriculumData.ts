// src/lib/curriculumData.ts
// EDUNEX Rəsmi Dərslik Proqramlarına Uyğun Tam Mövzu Bazası (I-XI Siniflər)
// Bütün ümumtəhsil məktəb fənləri üzrə rəsmi tədris mündəricatı

export type SubjectCategory = 'exact' | 'humanitarian' | 'social' | 'applied';

export interface SubjectMetadata {
  id: string;
  name: string;
  category: SubjectCategory;
  iconName: string;
  grades: string[];
  description: string;
}

export const ALL_SCHOOL_SUBJECTS: SubjectMetadata[] = [
  // 1. DƏQİQ VƏ TƏBİƏT FƏNLƏRİ
  {
    id: 'riyaziyyat',
    name: 'Riyaziyyat',
    category: 'exact',
    iconName: 'Calculator',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Baza riyazi biliklər, hesab əməlləri, məntiq və kəmiyyətlər'
  },
  {
    id: 'cebr',
    name: 'Cəbr',
    category: 'exact',
    iconName: 'Binary',
    grades: ['7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Tənliklər, bərabərsizliklər, funksiyalar, triqonometriya və riyazi analiz'
  },
  {
    id: 'hendese',
    name: 'Həndəsə',
    category: 'exact',
    iconName: 'Shapes',
    grades: ['7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Planimetriya, fiqurların sahəsi, fəza fiqurları və stereometriya'
  },
  {
    id: 'fizika',
    name: 'Fizika',
    category: 'exact',
    iconName: 'Atom',
    grades: ['7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Mexanika, termodinamika, elektrodinamika, optika və atom fizikası'
  },
  {
    id: 'kimya',
    name: 'Kimya',
    category: 'exact',
    iconName: 'FlaskConical',
    grades: ['7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Maddələrin quruluşu, qeyri-üzvi və üzvi kimya, kimyəvi reaksiyalar'
  },
  {
    id: 'biologiya',
    name: 'Biologiya',
    category: 'exact',
    iconName: 'Dna',
    grades: ['6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Botanika, zoologiya, insan anatomiyası, sitologiya və genetika'
  },
  {
    id: 'tebiet',
    name: 'Təbiət',
    category: 'exact',
    iconName: 'Leaf',
    grades: ['5-ci sinif'],
    description: 'Təbiət hadisələri, canlılar aləmi və yer kürəsinin əsasları'
  },
  {
    id: 'informatika',
    name: 'İnformatika',
    category: 'exact',
    iconName: 'Cpu',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'İnformasiya prosesləri, alqoritmlər, proqramlaşdırma və şəbəkələr'
  },

  // 2. HUMANİTAR VƏ DİLLƏR
  {
    id: 'azerbaycan_dili',
    name: 'Azərbaycan dili',
    category: 'humanitarian',
    iconName: 'BookMarked',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Fonetika, leksikologiya, morfologiya, sintaksis və nitq inkişafı'
  },
  {
    id: 'edebiyyat',
    name: 'Ədəbiyyat',
    category: 'humanitarian',
    iconName: 'Feather',
    grades: ['5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Şifahi xalq ədəbiyyatı, klassik və müasir Azərbaycan ədəbiyyatı'
  },
  {
    id: 'ingilis_dili',
    name: 'İngilis dili',
    category: 'humanitarian',
    iconName: 'Languages',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Vocabulary, Grammar, Reading comprehension, Listening & Writing'
  },
  {
    id: 'rus_dili',
    name: 'Rus dili',
    category: 'humanitarian',
    iconName: 'Globe',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Русский язык: фонетика, грамматика, лексика и речевая деятельность'
  },
  {
    id: 'fransiz_dili',
    name: 'Fransız dili',
    category: 'humanitarian',
    iconName: 'Flag',
    grades: ['5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Fransız dili qrammatikası, lüğət ehtiyatı və oxu bacarıqları'
  },

  // 3. İCTİMAİ VƏ TARİX
  {
    id: 'azerbaycan_tarixi',
    name: 'Azərbaycan tarixi',
    category: 'social',
    iconName: 'Landmark',
    grades: ['5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Qədim dövrlərdən müasir dövrə qədər Azərbaycan dövlətçilik tarixi'
  },
  {
    id: 'umumi_tarix',
    name: 'Ümumi tarix',
    category: 'social',
    iconName: 'Hourglass',
    grades: ['6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Qədim Şərq, Antik dövr, Orta əsrlər, Yeni və Ən yeni dünya tarixi'
  },
  {
    id: 'cografiya',
    name: 'Coğrafiya',
    category: 'social',
    iconName: 'Compass',
    grades: ['6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Fiziki, iqtisadi və sosial coğrafiya, xəritəşünaslıq və qlobal proseslər'
  },
  {
    id: 'heyat_bilgisi',
    name: 'Həyat bilgisi',
    category: 'social',
    iconName: 'HeartHandshake',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif'],
    description: 'İnsan və cəmiyyət, təhlükəsizlik qaydaları, mənəvi dəyərlər və hüquq'
  },

  // 4. TƏTBİQİ VƏ XÜSUSİ FƏNLƏR
  {
    id: 'texnologiya',
    name: 'Texnologiya',
    category: 'applied',
    iconName: 'Wrench',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif'],
    description: 'Materialşünaslıq, qrafika, konstruksiya, emal və məişət mədəniyyəti'
  },
  {
    id: 'musiqi',
    name: 'Musiqi',
    category: 'applied',
    iconName: 'Music',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif'],
    description: 'Musiqi savadı, notlar, Azərbaycan xalq musiqisi, bəstəkarlar və janrlar'
  },
  {
    id: 'tesviri_incesenet',
    name: 'Təsviri incəsənət',
    category: 'applied',
    iconName: 'Palette',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif'],
    description: 'Rəngkarlıq, qrafika, heykəltəraşlıq, dekorativ sənət və memarlıq'
  },
  {
    id: 'fiziki_terbiye',
    name: 'Fiziki tərbiyə',
    category: 'applied',
    iconName: 'Activity',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Gimnastika, hərəkətli oyunlar, atletika, idman oyunları və sağlamlıq'
  },
  {
    id: 'cagirisaqedərki_hazirliq',
    name: 'Çağırışaqədərki hazırlıq',
    category: 'applied',
    iconName: 'ShieldAlert',
    grades: ['10-cu sinif', '11-ci sinif'],
    description: 'Hərbi nizamnamələr, sıra hazırlığı, mülki müdafiə və ilk tibbi yardım'
  },
  {
    id: 'mentiq',
    name: 'Məntiq',
    category: 'applied',
    iconName: 'BrainCircuit',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    description: 'Məntiqi mühakimə, fiqur əlaqələri, riyazi qanunauyğunluqlar və verbal testlər'
  }
];

// RƏSMİ DƏRSLİK MÜNDƏRİCATI ÜZRƏ MÖVZU BAZASI
export const CURRICULUM_DATA: Record<string, Record<string, string[]>> = {
  // -------------------------------------------------------------
  // AZƏRBAYCAN DİLİ (1 - 11)
  // -------------------------------------------------------------
  'Azərbaycan dili': {
    '1-ci sinif': [
      'Səslər və hərflər: Sait və samit səslər',
      'Heca və sözün hecalara bölünməsi',
      'Böyük və kiçik hərflərin yazılışı',
      'Cümlə və cümlənin sonunda nöqtə, sual, nida işarələri',
      'Ad, əlamət və hərəkət bildirən sadə sözlər'
    ],
    '2-ci sinif': [
      'Əlifba sırası və lüğətlə iş',
      'Qalın və incə saitlər, ahəng qanununa ilkin baxış',
      'Sözlərin sətirdən sətrə keçirilməsi qaydaları',
      'Ad bildirən sözlər (Kim? Nə? Hara?)',
      'Əlamət bildirən sözlər (Necə? Nə cür? Hansı?)',
      'Hərəkət bildirən sözlər (Nə edir? Nə etdi? Nə edəcək?)'
    ],
    '3-cü sinif': [
      'Sözün tərkibi: Kök və leksik/qrammatik şəkilçilər',
      'Sözönü və sözsonu şəkilçilər',
      'Eyniköklü sözlər',
      'Yaxınmənalı və əksmənalı sözlər (Sinonimlər və antonimlər)',
      'İsim: Tək və cəm isimlər, xüsusi və ümumi isimlər',
      'Cümlənin məqsəd və intonasiyaya görə növləri'
    ],
    '4-cü sinif': [
      'Ahəng qanunu və onun söz yaradıcılığında rolu',
      'İsmin halları və şəkilçiləri',
      'Sifət və onun cümlədə rolu',
      'Say: Miqdar və sıra sayları',
      'Əvəzlik: Şəxs əvəzlikləri',
      'Feil: İndiki, keçmiş və gələcək zamanlar',
      'Mətnin quruluşu: Giriş, əsas hissə və nəticə'
    ],
    '5-ci sinif': [
      'Fonetika: Danışıq səsləri və hərflər',
      'Saitlərin növləri: Qalın/incə, dodaqlanan/dodaqlanmayan, açıq/qapalı',
      'Samitlərin növləri: Kar və cingiltili samitlər',
      'Ahəng qanunu və onun mahiyyəti',
      'Bəzi samitlərin yazılışı və tələffüzü (q-k, b-p, d-t, c-ç)',
      'Heca və vurğu, vurğusu dəyişməklə mənası dəyişən sözlər',
      'Leksikologiya: Sözün həqiqi və məcazi mənası',
      'Çoxmənalı sözlər və omonimlər',
      'Sinonimlər və antonimlər',
      'Frazeoloji birləşmələr (İdiomlar)'
    ],
    '6-cı sinif': [
      'Morfologiya: Əsas və köməkçi nitq hissələri',
      'İsim: Ümumi və xüsusi isimlər, konkret və mücərrəd isimlər',
      'İsmin mənsubiyyətə görə dəyişməsi',
      'İsmin hallanması və xəbərlik şəkilçiləri',
      'Sifət: Sifətin dərəcələri (Adi, azaltma, çoxaltma)',
      'Sifətin quruluşca növləri',
      'Say: Miqdar (müəyyən, qeyri-müəyyən, kəsr) və sıra sayları',
      'Sayların orfoqrafiyası və numerativ sözlər'
    ],
    '7-ci sinif': [
      'Əvəzlik və onun məna növləri (Şəxs, qeyri-müəyyən, təyini, sual, inkar)',
      'Feil: Feilin quruluşca növləri',
      'Təsriflənən feillər: Feilin şəkilləri (Xəbər, əmr, arzu, vacib, lazım, şərt)',
      'İdi və imiş hissəcikləri, isə hissəciyi',
      'Feilin qrammatik məna növləri (Məlum, məchul, qayıdış, qarşılıqlı-birgə, icbar)',
      'Təsriflənməyən feillər: Məsdər, feli sifət və feli bağlama',
      'Zərf: Məna növləri (Tərzi-hərəkət, zaman, yer, kəmiyyət)'
    ],
    '8-ci sinif': [
      'Sintaksis: Söz birləşmələri və onların növləri',
      'Sərbəst və sabit söz birləşmələri',
      'İsmi və feli birləşmələr, təyini söz birləşmələri',
      'Cümlə və cümlə üzvləri',
      'Cümlənin baş üzvləri: Mübtəda və Xəbər, onların ifadə vasitələri',
      'Mübtəda ilə xəbərin uzlaşması',
      'Cümlənin ikinci dərəcəli üzvləri: Tamamlıq, Təyin, Zərflik',
      'Həmcins üzvlər və ümumiləşdirici sözlər',
      'Cümlədə söz sırası və məntiqi vurğu'
    ],
    '9-cu sinif': [
      'Cümlənin qrammatik əsası və cümlə növləri',
      'Təktərkibli cümlələr: Şəxssiz, qeyri-müəyyən şəxsli, ümumi şəxsli, adlıq cümlələr',
      'Xitablar, ara sözlər və ara cümlələr',
      'Mürəkkəb cümlə: Tabesiz mürəkkəb cümlələr və məna əlaqələri',
      'Tabeli mürəkkəb cümlələr: Baş və budaq cümlə, bağlayıcı vasitələr',
      'Budaq cümlənin növləri: Mübtəda, xəbər, tamamlıq, təyin, zərflik budaq cümlələri',
      'Vasitəsiz və vasitəli nitq, durğu işarələri'
    ],
    '10-cu sinif': [
      'Dil və nitq mədəniyyəti, ədəbi dilin normaları',
      'Fonetika və orfoepiya normaları, sözlərin düzgün vurğulanması',
      'Leksik norma və sözün yerində işlədilməsi',
      'Qrammatik norma: Morfoloji və sintaktik normalar',
      'Üslubiyyat: Funksional üslublar (Bədii, elmi, publisistik, rəsmi-işgüzar, məişət)',
      'Mətnşünaslıq: Mətnin mövzusu, ideyası, abzas və kompozisiya quruluşu'
    ],
    '11-ci sinif': [
      'Mətn üzərində kompleks təhlil və situasiya tapşırıqları',
      'Mətnin məntiqi ardıcıllığı və semantik bütövlüyü',
      'Etimologiya və lüğətlər, neologizmlər və arxaizmlər',
      'Dövlət İmtahan Mərkəzi (DİM) Buraxılış və Qəbul modelinə uyğun qrammatik inteqrasiya',
      'Mürəkkəb sintaktik konstruksiyalar və çoxbudaqlı tabeli mürəkkəb cümlələr'
    ]
  },

  // -------------------------------------------------------------
  // ƏDƏBİYYAT (5 - 11)
  // -------------------------------------------------------------
  'Ədəbiyyat': {
    '5-ci sinif': [
      'Şifahi xalq ədəbiyyatı: Nağıllar, atalar sözləri və tapmacalar',
      'Bədii əsərlərdə təbiət təsvirləri və mənzərə',
      'Nizami Gəncəvi: «Kərpickəsən kişinin dastanı»',
      'Məhəmməd Füzuli: «Meyvələrin söhbəti»',
      'Cəlil Məmmədquluzadə: «Qurbanəli bəy» hekayəsi',
      'Səməd Vurğun: «Azərbaycan» şeri və vətənpərvərlik motivləri'
    ],
    '6-cı sinif': [
      'Əfsanələr və rəvayətlər, xalq dastanları',
      '«Kitabi-Dədə Qorqud» dastanı: «Basatın Təpəgözü öldürdüyü boy»',
      'Xaqani Şirvani: «Gənclərə nəsihət»',
      'Şah İsmayıl Xətayi: «Dəhnamə» poemasından parçalar',
      'Mirzə Ələkbər Sabir: Satirik şeirlər və uşaq mənzumələri',
      'Abdulla Şaiq: İbrətamiz mənzum hekayələr'
    ],
    '7-ci sinif': [
      'Qəhrəmanlıq dastanları: «Koroğlu» dastanı («Koroğlu ilə Dəli Həsən»)',
      'Nizami Gəncəvi: «Sirlər xəzinəsi» və «Xosrov və Şirin» poemaları',
      'İmadəddin Nəsimi: Fəlsəfi qəzəlləri və ana dili sevgisi',
      'Molla Pənah Vaqif: Qoşmalar və realizmin başlanğıcı',
      'Mirzə Fətəli Axundzadə: «Hekayəti-Müsyö Jordan və Dərviş Məstəli Şah»',
      'Bədii təsvir və ifadə vasitələri: Epitet, təşbeh, metafora, mübaliğə'
    ],
    '8-ci sinif': [
      'Klassik lirika: Qəzəl, qəsidə, qitə, rübai janrları',
      'Məhəmməd Füzuli: «Leyli və Məcnun» poeması (məzmun və ideya)',
      'Qasım bəy Zakir: Təmsillər və ictimai satiralar',
      'Nəcəf bəy Vəzirov: «Müsibəti-Fəxrəddin» dramı',
      'Cəlil Məmmədquluzadə: «Anamın kitabı» pyesi',
      'Hüseyn Cavid: «Ana» dramı və romantizm cərəyanı'
    ],
    '9-cu sinif': [
      '«Kitabi-Dədə Qorqud» dastanının tam ideya-bədii xüsusiyyətləri',
      'Nizami Gəncəvi: «İsgəndərnamə» poeması («Şərəfnamə» və «İqbalnamə»)',
      'Məhəmməd Füzuli: «Şikayətnamə» bədii nəsri',
      'Mirzə Fətəli Axundzadə: «Aldanmış kəvakib» povesti',
      'Mirzə Ələkbər Sabir: «Hophopnamə» əsərləri və ictimai tənqid',
      'Əhməd Cavad: «Səsli qız» poeması və istiqlal poeziyası',
      'Cəfər Cabbarlı: «Oqtay Eloğlu» və «Almaz» pyesləri'
    ],
    '10-cu sinif': [
      'Azərbaycan ədəbiyyatının qədim və orta əsrlər mərhələsi',
      'İmadəddin Nəsimi poeziyasında insan konsepsiyası',
      'Şah İsmayıl Xətayi: Həm hökmdar, həm şair kimi yaradıcılığı',
      'Molla Vəli Vidadi və Molla Pənah Vaqif dostluğu və yaradıcılığı',
      'Xurşidbanu Natəvan və Aşıq Ələsgər yaradıcılığı',
      'XX əsr ədəbiyyatı: Məhəmmədhüseyn Şəhriyar: «Heydərbabaya salam»',
      'Bəxtiyar Vahabzadə: «Gülüstan» poeması'
    ],
    '11-ci sinif': [
      'Müasir Azərbaycan ədəbiyyatı və istiqlal dövrü',
      'İsmayıl Şıxlı: «Dəli Kür» romanı (obrazlar sistemi və kolorit)',
      'İlyas Əfəndiyev: «Xurşidbanu Natəvan» tarixi dramı',
      'Anar və Elçin yaradıcılığı: Hekayə və povestlər',
      'Qarabağ müharibəsi və Zəfər dövrü ədəbiyyatı',
      'DİM Qəbul imtahanı üzrə ədəbi nəzəriyyə, şeir quruluşu və vəznlər (Heca və Əruz)'
    ]
  },

  // -------------------------------------------------------------
  // RİYAZİYYAT (1 - 6)
  // -------------------------------------------------------------
  'Riyaziyyat': {
    '1-ci sinif': [
      '1-dən 20-yə qədər ədədlər və sayma',
      'Ədədlərin müqayisəsi (böyükdür, kiçikdir, bərabərdir)',
      '10 dairəsində toplama və çıxma',
      'Həndəsi fiqurlar: Dairə, kvadrat, üçbucaq, düzbucaqlı',
      'Sadə mətnli məsələlərin həlli'
    ],
    '2-ci sinif': [
      '100 dairəsində ədədlər və mərtəbə vahidləri (onluq və təklik)',
      'İkirəqəmli ədədlərin toplanması və çıxılması',
      'Vurma və bölmə anlayışları',
      'Vurma cədvəli (2, 3, 4, 5-ə vurma)',
      'Uzunluq, kütlə və tutum ölçü vahidləri'
    ],
    '3-cü sinif': [
      '1000 dairəsində ədədlər, yüzlük, onluq və təkliklər',
      'Üçrəqəmli ədədlərin yazılı toplanması və çıxılması',
      'Vurma cədvəli (bütün rəqəmlər üzrə tam)',
      'Qalıqlı bölmə və əməllər sırası',
      'Perimetr və sahə anlayışı (düzbucaqlı və kvadrat)'
    ],
    '4-cü sinif': [
      'Çoxrəqəmli ədədlər və onların oxunuşu',
      'Çoxrəqəmli ədədlər üzərində dörd hesab əməli',
      'Sürət, zaman və yol məsələləri ($S = v \\cdot t$)',
      'Kəsrlər: Düzgün və düzgün olmayan kəsrlər',
      'Bucağın növləri: İti, düz, kor və açıq bucaqlar'
    ],
    '5-ci sinif': [
      'Natural ədədlər, mərtəbə və siniflər',
      'Natural ədədlər üzərində dörd hesab əməli',
      'Bölünmə əlamətləri (2, 3, 5, 9 və 10-a bölünmə)',
      'Sadə və mürəkkəb ədədlər, vuruqlara ayırma',
      'ƏBOB və ƏKOB-un tapılması',
      'Adi kəsrlər: Düzgün, düzgün olmayan və qarışıq ədədlər',
      'Adi kəsrlərin toplanması, çıxılması, vurulması və bölünməsi',
      'Onluq kəsrlər və onlar üzərində əməllər',
      'Faiz anlayışı və ədədin faizinin tapılması'
    ],
    '6-cı sinif': [
      'Mənfi və müsbət ədədlər, ədəd oxu və koordinat sistemi',
      'Tam ədədlər üzərində hesab əməlləri',
      'Rasional ədədlər və modul anlayışı',
      'Nisbət və tənasüb, tənasübün əsas xassəsi',
      'Düz və tərs mütənasib asılılıqlar',
      'Faizə aid əsas məsələlər və kəmiyyətlərin faizlə dəyişməsi',
      'Sadə xətti tənliklər və onların həlli',
      'Dairə və çevrə, dairəvi dioqramlar',
      'Ehtimal anlayışı və ehtimalın klassik tərifi'
    ]
  },

  // -------------------------------------------------------------
  // CƏBR (7 - 11)
  // -------------------------------------------------------------
  'Cəbr': {
    '7-ci sinif': [
      'Həqiqi ədədlər və rasional ədədlər çoxluğu',
      'Natural üstlü qüvvət və onun xassələri',
      'Birlədhədlilər və çoxhədlilər',
      'Müxtəsər vurma düsturları: Kvadratlar cəmi, fərqi və kublar düsturu',
      'Çoxhədlinin vuruqlara ayrılması üsulları',
      'Birdəyişənli xətti tənliklər və onların tətbiqi ilə məsələ həlli',
      'İkidəyişənli xətti tənliklər sistemi (əvəzetmə və toplama üsulu)'
    ],
    '8-ci sinif': [
      'Rasional kəsrlər və onlar üzərində əməllər',
      'Həqiqi ədədlər və hesab kvadrat kökü',
      'Kvadrat kök daxil olan ifadələrin çevrilməsi',
      'Kvadrat tənliklər: Diskriminant düsturu',
      'Viyet teoremi və onun tətbiqləri',
      'Kvadrat tənliyə gətirilən tənliklər (Bikvadrat tənliklər)',
      'Birdəyişənli xətti bərabərsizliklər və bərabərsizliklər sistemi'
    ],
    '9-cu sinif': [
      'Kvadratik funksiya və onun qrafiki (Parabola)',
      'İkincidərəcəli bərabərsizliklər və intervallar üsulu',
      'Kəsrlə ifadə olunmuş rasional bərabərsizliklər',
      'Ədədi ardıcıllıqlar: Ədədi silsilə və n-ci hədd düsturu',
      'Həndəsi silsilə və sonsuz azalan həndəsi silsilənin cəmi',
      'Kombinatorikanın əsasları: Permutasiya, kombinazon və qruplaşdırma',
      'Hadisənin ehtimalı və statistik orta göstəricilər'
    ],
    '10-cu sinif': [
      'Funksiyalar və onların xassələri: Tək və cüt, artan və azalan funksiyalar',
      'Mürəkkəb və tərs funksiya anlayışı',
      'İxtiyari bucağın triqonometrik funksiyaları (Sinus, Kosinus, Tangens, Kotangens)',
      'Əsas triqonometrik eyniliklər və çevirmə düsturları',
      'Toplama düsturları, ikiqat və üçqat bucaq düsturları',
      'Ən sadə triqonometrik tənliklər və onların həlli üsulları',
      'Üstlü funksiya, üstlü tənliklər və bərabərsizliklər'
    ],
    '11-ci sinif': [
      'Loqarifm anlayışı və loqarifmin xassələri',
      'Loqarifmik tənliklər və loqarifmik bərabərsizliklər',
      'Funksiyanın limiti və kəsilməzliyi',
      'Törəmə anlayışı, törəmənin həndəsi və fiziki mənası',
      'Funksiyanın böhran nöqtələri, ekstremumları və qrafikinin qurulması',
      'İbtidai funksiya və inteqral, Nyuton-Leybnits düsturu',
      'Əyrixətli trapesiyanın sahəsi və inteqralın tətbiqi',
      'Kompleks ədədlər və onlar üzərində əməllər'
    ]
  },

  // -------------------------------------------------------------
  // HƏNDƏSƏ (7 - 11)
  // -------------------------------------------------------------
  'Həndəsə': {
    '7-ci sinif': [
      'Həndəsənin ilkin anlayışları: Nöqtə, düz xətt, şüa və parça',
      'Bucağın növləri: Qonşu və qarşılıqlı bucaqlar',
      'Paralel düz xətlər və üçüncü düz xətlə kəsişməsindən alınan bucaqlar',
      'Üçbucaq və onun elementləri: Median, tənbölən, hündürlük',
      'Üçbucaqların konqruyentlik əlamətləri (I, II və III əlamət)',
      'Bərabəryanlı və bərabərtərəfli üçbucaqlar',
      'Üçbucağın daxili bucaqlarının cəmi haqqında teorem'
    ],
    '8-ci sinif': [
      'Dördbucaqlılar: Paraleloqram və onun xassələri',
      'Romb, Düzbucaqlı və Kvadrat, onların diaqonallarının xassələri',
      'Fales teoremi və parçanın bərabər hissələrə bölünməsi',
      'Trapesiya və onun orta xətti, bərabəryanlı trapesiya',
      'Pifaqor teoremi və düzbucaqlı üçbucaqda metrik münasibətlər',
      'Fiqurların sahələri: Üçbucağın, paraleloqramın, rombun və trapesiyanın sahəsi',
      'Üçbucaqların oxşarlıq əlamətləri'
    ],
    '9-cu sinif': [
      'Çevrə və dairə, mərkəzi və daxilə çəkilmiş bucaqlar',
      'Çevrədə vətər, toxunan və kəsən xassələri',
      'Üçbucağın daxilinə və xaricinə çəkilmiş çevrələr ($r$ və $R$ düsturları)',
      'Sinuslar və Kosinuslar teoremi',
      'Düzgün çoxbucaqlılar və onların sahəsi',
      'Çevrənin uzunluğu və dairə sektorunun sahəsi',
      'Müstəvidə vektorlar, vektorların toplanması və skalyar hasili'
    ],
    '10-cu sinif': [
      'Fəzada həndəsənin əsas anlayışları və aksiomları',
      'Fəzada düz xətlərin və müstəvilərin qarşılıqlı vəziyyəti',
      'Düz xətlə müstəvinin paralellik və perpendikulyarlıq əlamətləri',
      'Üç perpendikulyar haqqında teorem',
      'Fəzada bucaqlar: İkiüzlü bucaqlar və xətti bucaq',
      'Çoxüzlülər: Prizma, düz prizma və paralelepiped',
      'Prizmanın yan və tam səthinin sahəsi, həcmi ($V = S_\\text{ot} \\cdot h$)'
    ],
    '11-ci sinif': [
      'Piramida, düzgün piramida və kəsik piramida',
      'Pirramidanın səthinin sahəsi və həcmi ($V = \\frac{1}{3} S_\\text{ot} h$)',
      'Fırlanma cisimləri: Silindr, onun səthinin sahəsi və həcmi',
      'Konus və kəsik konus, onların səthinin sahəsi və həcmi',
      'Kürə və sfera, sferanın səthinin sahəsi və kürənin həcmi',
      'Fəzada düzbucaqlı koordinat sistemi və fəzada vektorlar',
      'Fəza fiqurlarının müstəvi kəsikləri və kombinasiyaları'
    ]
  },

  // -------------------------------------------------------------
  // FİZİKA (7 - 11)
  // -------------------------------------------------------------
  'Fizika': {
    '7-ci sinif': [
      'Mexaniki hərəkət, trayektoriya, yol və yerdəyişmə',
      'Düzxətli bərabərsürətli hərəkət və sürət',
      'Maddənin quruluşu, atom və molekullar, diffuziya',
      'Kütlə və sıxlıq, sıxlığın təyini',
      'Qüvvə: Cazibə və ağırlıq qüvvəsi, çəki',
      'Elastiklik qüvvəsi və Huk qanunu',
      'Sürtünmə qüvvəsi və onun növləri',
      'Təzyiq, bərk cisimlərin və qazların təzyiqi',
      'Paskal qanunu və hidravlik pres',
      'Mayelərdə hidrostatik təzyiq və birləşmiş qablar',
      'Atmosfer təzyiqi və Torriçelli təcrübəsi',
      'Arximed qanunu və cisimlərin üzmə şərtləri',
      'Mexaniki iş və güc',
      'Sadə mexanizmlər: Ling, blok və mail müstəvi',
      'Mexanikanın «qızıl qaydası» və F.İ.Ə.'
    ],
    '8-ci sinif': [
      'İstilik hərəkəti, daxili enerji və onun dəyişməsi üsulları',
      'İstilikvermənin növləri: İstilikkeçirmə, konveksiya, şüalanma',
      'İstilik miqdarı və xüsusi istilik tutumu ($Q = c m \\Delta t$)',
      'Yanacağın yanma istiliyi və istilik balansı tənliyi',
      'Maddənin aqreqat halları: Ərimə və bərkimə prosesləri',
      'Buxarlanma, qaynama və kondensasiya',
      'Havanın rütubəti və psixrometr',
      'Elektrik yükü və cisimlərin elektriklənməsi',
      'Kulon qanunu və nöqtəvi yüklərin qarşılıqlı təsiri',
      'Elektrik sahəsi və intensivlik',
      'Elektrik cərəyanı və cərəyan şiddəti',
      'Elektrik gərginliyi və dövrə hissəsi üçün Om qanunu',
      'Naqilin müqaviməti və xüsusi müqavimət ($R = \\rho \\frac{l}{S}$)',
      'Naqillərin ardıcıl və paralel birləşdirilməsi',
      'Elektrik cərəyanının işi, gücü və Coul-Lens qanunu',
      'Daimi maqnitlər və maqnit sahəsi'
    ],
    '9-cu sinif': [
      'Kinematika: Bərabərtəcilli hərəkətdə sürət və yerdəyişmə',
      'Çevrə üzrə bərabərsürətli hərəkət, dövretmə periodu və tezliyi',
      'Nyutonun hərəkət qanunları (I, II və III qanun)',
      'Ümumdünya cazibə qanunu və sərbəstdüşmə təcili',
      'Süni peyklər və birinci kosmik sürət',
      'Cismin impulsu və impulsun saxlanması qanunu',
      'Kinetik və potensial enerji, enerjinin saxlanması qanunu',
      'Mexaniki rəqslər, period, tezlik və amplitud',
      'Riyazi və yaylı rəqqaslar',
      'Mexaniki dalğalar, eninə və uzununa dalğalar, dalğa uzunluğu',
      'Səs dalğaları, səsin ucalığı və tonu',
      'Həndəsi optika: İşığın düzxətli yayılması və qayıtması',
      'Müstəvi və sferik güzgülərdə xəyal',
      'İşığın sınması və tam daxili qayıtma',
      'Linzalar, nazik linza düsturu və optik qüvvə ($D = \\frac{1}{F}$)',
      'Atomun quruluşu, Rezerford təcrübəsi və planetar model',
      'Atom nüvəsinin quruluşu, radioaktivlik və zəncirvari nüvə reaksiyaları'
    ],
    '10-cu sinif': [
      'Molekulyar-kinetik nəzəriyyənin əsas müddəaları',
      'İdeal qaz və MKT-nin əsas tənliyi',
      'Mütləq temperatur və istilik tarazlığı',
      'İzoproseslər: Boyl-Mariott, Şarl və Gey-Lüssak qanunları',
      'Mendeleyev-Klapeyron tənliyi ($PV = \\frac{m}{M}RT$)',
      'Doymuş və doymamış buxarlar, böhran temperaturu',
      'Mayelərin səthi gərilməsi və kapillyarlıq hadisəsi',
      'Bərk cisimlərin xassələri, kristal və amorf cisimlər',
      'Deformasiya növləri və Mexaniki gərginlik',
      'Termodinamikanın I qanunu və izoproseslərə tətbiqi',
      'İstilik mühərrikləri və Karno tsikli, F.İ.Ə.',
      'Elektrostatik sahənin potensialı və potensiallar fərqi',
      'Elektrik tutumu və müstəvi kondensator',
      'Müxtəlif mühitlərdə elektrik cərəyanı (metallarda, yarımkeçiricilərdə, elektrolitlərdə)'
    ],
    '11-ci sinif': [
      'Maqnit sahəsinin induksiya vektoru və Amper qüvvəsi',
      'Lorens qüvvəsi və yüklü zərrəciklərin hərəkəti',
      'Maddələrin maqnit xassələri: Dia-, para- və ferromaqnitlər',
      'Elektromaqnit induksiyası və Faradey qanunu, Lens qaydası',
      'Öz-özünə induksiya hadisəsi və induktivlik',
      'Elektromaqnit rəqsləri və rəqs konturu, Tomson düsturu',
      'Dəyişən elektrik cərəyanı, transformatorlar və elektrik enerjisinin ötürülməsi',
      'Elektromaqnit dalğaları şkalası',
      'Dalğa optikası: İşığın interferensiyası və difraksiyası',
      'İşığın dispersiyası və polyarizasiyası',
      'Fotoeffekt hadisəsi və Eynşteyn tənliyi',
      'İşığın kvant təbiəti və fotonun impulsu',
      'Bor postulatları və hidrogen atomunun spektrləri',
      'Nüvə rabitə enerjisi, kütlə defekti və radioaktiv çevrilmələr'
    ]
  },

  // -------------------------------------------------------------
  // KİMYA (7 - 11)
  // -------------------------------------------------------------
  'Kimya': {
    '7-ci sinif': [
      'Kimyanın ilkin anlayışları: Maddə və cisim, fiziki və kimyəvi hadisələr',
      'Saf maddələr və qarışıqlar, qarışıqların ayrılması üsulları',
      'Atom və molekullar, kimyəvi element anlayışı',
      'Kimyəvi işarələr və nisbi atom kütləsi',
      'Bəsit və mürəkkəb maddələr, valentlik anlayışı',
      'Kimyəvi formul üzrə hesablamalar və nisbi molekul kütləsi',
      'Kimyəvi reaksiyalar və maddə kütləsinin saxlanması qanunu',
      'Oksigen: Təbiətdə tapılması, alınması və xassələri',
      'Yanma və oksidləşmə prosesləri',
      'Hidrogen: Alınması və tətbiqi, suyun kimyəvi tərkibi'
    ],
    '8-ci sinif': [
      'Maddə miqdarı: Mol, Avoqadro qanunu və qazların molyar həcmi',
      'Kimyəvi formullar üzrə kəmiyyət hesablamaları',
      'Qeyri-üzvi birləşmələrin əsas sinifləri: Oksidlər və onların təsnifatı',
      'Əsaslar: Təsnifatı, alınması və kimyəvi xassələri',
      'Turşular: Növləri, dissosiasiyası və xassələri',
      'Duzlar: Təsnifatı, adlandırılması və genetik əlaqə',
      'D.İ.Mendeleyevin Dövri qanunu və Dövri sistemi',
      'Atomun quruluşu, energetik səviyyələr və elektron konfiqurasiyası',
      'Kimyəvi rabitə növləri: İon, kovalent (polyar və qeyri-polyar), metal rabitəsi'
    ],
    '9-cu sinif': [
      'Elektrolitik dissosiasiya nəzəriyyəsi və ion mübadiləsi reaksiyaları',
      'Oksidləşmə-dərəcəsi və Oksidləşmə-reduksiya reaksiyaları',
      'Kimyəvi reaksiyaların sürəti və kimyəvi tarazlıq, Le Şatelye prinsipi',
      'Qeyri-metallar: VII qrup (Halogenlər - Xlor, Brom, Yod)',
      'VI qrup: Kükürd və onun birləşmələri, sulfat turşusu',
      'V qrup: Azot, ammonyak və nitrat turşusu, Fosfor',
      'IV qrup: Karbon, karbon dioksid, Dəm qazı və Silisium',
      'Metalların ümumi xassələri və elektrokimyəvi gərginlik sırası',
      'Qələvi və qələvi-torpaq metalları (Natrium, Kalium, Kalsium)',
      'Alüminium və Dəmir, onların ərintiləri'
    ],
    '10-cu sinif': [
      'Üzvi kimyaya giriş: A.M.Butlerovun kimyəvi quruluş nəzəriyyəsi',
      'Karbohidrogenlər: Doymuş karbohidrogenlər (Alkanlar, Metan və homoloqları)',
      'Doymamış karbohidrogenlər: Alkenlər (Etilen sırası)',
      'Alkadienlər və təbii kauçuk, Alkinlər (Asetilen)',
      'Tsikloalkanlar və Aromatik karbohidrogenlər (Arenlər, Benzol)',
      'Karbohidrogenlərin təbii mənbələri: Neft, təbii qaz və daş kömür',
      'Spirtlər: Biraşqarlı və çoxaşqarlı spirtlər (Etanol, Qliserin)',
      'Fenollar və onların xassələri'
    ],
    '11-ci sinif': [
      'Aldehidlər və ketonlar, onların oksidləşməsi',
      'Karbon turşuları: Birəsaslı doymuş turşular (Sirkə turşusu)',
      'Mürəkkəb efirlər və yağlar, sabun və yuyucu vasitələr',
      'Karbohidratlar: Monosaxaridlər (Qlukoza), Disaxaridlər (Saxaroza) və Polisaxaridlər (Nişasta, Sellüloza)',
      'Azotlu üzvi birləşmələr: Aminlər və Aminoturşular',
      'Zülallar: Quruluşu, denaturasiyası və bioloji rolu',
      'İrilhəcmli molekullar və polimerlər (Plastmasslar və liflər)',
      'Kimya və ətraf mühit, ekoloji problemlər və qlobal inteqrasiya'
    ]
  },

  // -------------------------------------------------------------
  // BİOLOGİYA (6 - 11)
  // -------------------------------------------------------------
  'Biologiya': {
    '6-cı sinif': [
      'Canlı orqanizmlərin əsas xüsusiyyətləri və biologiya elmi',
      'Böyüdücü cihazlar: Lupa və Mikroskop',
      'Hüceyrənin quruluşu: Qılaf, sitoplazma, nüvə və vakuol',
      'Bitki toxumaları: Törədici, örtük, ötürücü, əsas və mexaniki toxuma',
      'Çiçəkli bitkilərin orqanları: Kök və kök sistemləri',
      'Göv də və yarpaq, onların daxili quruluşu',
      'Çiçək, toxum və meyvə, tozlanma və mayalanma',
      'Fotosintez və tənəffüs prosesləri'
    ],
    '7-ci sinif': [
      'Bakteriyalar və göbələklər aləmi, onların təbiətdə və insan həyatında rolu',
      'Bitkilər aləminin təsnifatı: Yosunlar, mamırlar, qıjıkimilər',
      'Çılpaqtoxumlular (Şam, Küknar) və Örtülütoxumlular',
      'Heyvanlar aləminə giriş: Birhüceyrəli ibtidailər (Amyob, İnfuzor-tərlik)',
      'Bağırsaqboşluqlular və Qurdlar (Yastı, dairəvi, həlqəvi qurdlar)',
      'Molyusklar və Buğumayaqlılar (Xərçəngkimilər, hörümçəkkimilər, həşəratlar)'
    ],
    '8-ci sinif': [
      'Xordalılar tipi: Balıqlar sinfi, onların quruluşu və çoxalması',
      'Suda-quruda yaşayanlar (Amfibiyalar) və Sürünənlər',
      'Quşlar sinfi: Uçmağa uyğunlaşma xüsusiyyətləri',
      'Məməlilər sinfi və onların ekologiyası',
      'İnsan anatomiyası: İnsanın orqanlar sistemi və toxumaları',
      'Dayanacaq-hərəkət sistemi: Skelet və əzələlər',
      'Qan və qan dövranı sistemi, ürəyin quruluşu və işi',
      'İmmunitet və qan qrupları',
      'Tənəffüs, həzm və ifrazat sistemləri'
    ],
    '9-cu sinif': [
      'İnsanın sinir sistemi: Baş beyin və onurğa beyni',
      'Ali sinir fəaliyyəti, reflektor qövs və yaddaş',
      'Analizatorlar və duyğu orqanları (Göz, qulaq və dərinin quruluşu)',
      'Endokrin sistem: Daxili sekresiya vəziləri və hormonlar',
      'Orqanizmin fərdi inkişafı (Ontogenez)',
      'Sitologiyanın əsasları: Hüceyrə nəzəriyyəsi və hüceyrə orqanoidləri',
      'Hüceyrənin bölünməsi: Mitoz və meyoz bölünmə',
      'Metabolizm: Assimilyasiya və dissimilyasiya'
    ],
    '10-cu sinif': [
      'Hüceyrənin kimyəvi tərkibi: Qeyri-üzvi və üzvi maddələr',
      'Zülallar, nuklein turşuları (DNT, RNT) və genetik kod',
      'Genetikanın əsasları: Q.Mendelin qanunları (Monohibrid və dihibrid çarpazlaşma)',
      'Genlərin ilişikli irsiyyəti və T.Morqan qanunu',
      'Cinsiyyətin genetikası və cinsiyyətlə ilişikli irsiyyət',
      'Dəyişkənlik: Modifikasiya və mutasiya dəyişkənliyi',
      'Seleksiyanın əsasları və biotexnologiya'
    ],
    '11-ci sinif': [
      'Təkamül təlimi: Ç.Darvin nəzəriyyəsi və hərəkətverici qüvvələri',
      'Növ və onun meyarları, mikrotəkamül və makrotəkamül',
      'Həyatın əmələ gəlməsi və Yerin geoloji eraları',
      'Antropogenez: İnsanın mənşəyi və insan irqləri',
      'Ekologiyanın əsasları: Ekoloji amillər (Abiotik, biotik, antropogen)',
      'Ekosistemlər, qida zənciri və ekoloji piramida qaydası',
      'Biosfer və onun sərhədləri, V.İ.Vernadski təlimi',
      'Təbiətin mühafizəsi və qlobal ekoloji problemlər'
    ]
  },

  // -------------------------------------------------------------
  // COĞRAFİYA (6 - 11)
  // -------------------------------------------------------------
  'Coğrafiya': {
    '6-cı sinif': [
      'Coğrafiya elminin inkişaf tarixi və böyük coğrafi kəşflər',
      'Yer səthinin təsviri: Plan, miqyas və şərti işarələr',
      'Qlobus və coğrafi xəritə, dərəcə şəbəkəsi',
      'Coğrafi koordinatlar: Enlik və uzunluq',
      'Yerin forma və ölçüləri, Günəş ətrafında hərəkəti',
      'Litosfer: Yerin daxili quruluşu, süxurlar və relyef',
      'Atmosfer: Havanın temperaturu, atmosfer təzyiqi və küləklər',
      'Hidrosfer: Dünya okeanı və quru suları'
    ],
    '7-ci sinif': [
      'Materiklər və okeanların coğrafiyası',
      'Litosfer tavaları nəzəriyyəsi və seysmik qurşaqlar',
      'İqlim qurşaqları və təbii zonalar',
      'Afrika materiki: Relyefi, iqlimi, daxili suları və əhalisi',
      'Avstraliya və Okeaniya materiki',
      'Cənubi Amerika və Antarktida materikləri',
      'Şimali Amerika materiki',
      'Dünya okeanının hissələri və ekoloji vəziyyəti'
    ],
    '8-ci sinif': [
      'Avrasiya materiki: Fiziki-coğrafi xarakteristikası',
      'Azərbaycanın coğrafi mövqeyi, sərhədləri və sahəsi',
      'Azərbaycanın geoloji quruluşu və relyefi (Böyük Qafqaz, Kiçik Qafqaz, Kür-Araz)',
      'Azərbaycanın faydalı qazıntıları',
      'Azərbaycanın iqlimi və iqlim tipləri',
      'Azərbaycanın daxili suları: Çaylar, göllər və su anbarları',
      'Azərbaycanın torpaq və bitki örtüyü, qoruqlar və milli parklar'
    ],
    '9-cu sinif': [
      'Azərbaycanın əhalisi: Sayı, təbii artımı, sıxlığı və miqrasiyası',
      'Azərbaycanın iqtisadiyyatının ümumi səciyyəsi',
      'Yanacaq-energetika kompleksi və neft sənayesi',
      'Metallurgiya və maşınqayırma sənayesi',
      'Kənd təsərrüfatı: Əkinçilik və heyvandarlıq sahələri',
      'Nəqliyyat sistemi və xarici iqtisadi əlaqələr',
      'Azərbaycanın iqtisadi-coğrafi rayonları (Abşeron, Qarabağ, Şərqi Zəngəzur və s.)'
    ],
    '10-cu sinif': [
      'Dünyanın siyasi xəritəsinin formalaşması mərhələləri',
      'Dövlətlərin idarəetmə və ərazi-quruluş formaları',
      'Dünyanın təbii ehtiyatları və resurs təminatı',
      'Dünya əhalisinin demoqrafiyası, urbanizasiya və milli tərkibi',
      'Dünya təsərrüfatının coğrafiyası və elmi-texniki tərəqqi',
      'Qlobal sənaye qurşaqları və kənd təsərrüfatı'
    ],
    '11-ci sinif': [
      'Dünya regionları və aparıcı dövlətləri (ABŞ, Çin, Yaponiya, Almaniya və s.)',
      'Beynəlxalq təşkilatlar (BMT, Avropa İttifaqı, Qoşulmama Hərəkatı)',
      'Qlobal problemlər: Ərzaq, demoqrafik, xammal və hərbi-siyasi problemlər',
      'Qlobal ekoloji problemlər və dayanıqlı inkişaf konsepsiyası',
      'Geopolitika və geo-iqtisadiyyatın müasir xüsusiyyətləri'
    ]
  },

  // -------------------------------------------------------------
  // AZƏRBAYCAN TARİXİ (5 - 11)
  // -------------------------------------------------------------
  'Azərbaycan tarixi': {
    '5-ci sinif': [
      'Tarix nədir və tarixi mənbələr',
      'Qədim insanların ilk məskənləri: Azıx mağarası',
      'Qobustan qayaüstü rəsmləri',
      'Qədim dövlətlərimiz: Manna, Midiya və Atropatena',
      'Albaniya dövləti və Cavanşir',
      'Babək və Xürrəmilər hərəkatı',
      'Şah İsmayıl Xətai və Səfəvilər dövləti',
      'Qarabağ xanlığı və Pənahəli xan',
      'Azərbaycan Xalq Cümhuriyyəti (1918-1920)',
      'Heydər Əliyev və Müstəqil Azərbaycan',
      '44 günlük Vətən müharibəsi və Şanlı Zəfər'
    ],
    '6-cı sinif': [
      'İbtidai icma quruluşu: Daş dövrü (Paleolit, Mezolit, Neolit, Eneolit)',
      'Tunc və Dəmir dövrləri, qəbilə və tayfa ittifaqları',
      'Qədim tayfa birləşmələri: Lullubi və Kuti dövlət qurumları',
      'Manna dövləti: Yaranması, yüksəlişi və süqutu',
      'Skif-Sak padşahlığı',
      'Atropatena dövləti: Yaranması, idarəçiliyi və mədəniyyəti',
      'Qafqaz Albaniyası: Ərazisi, əhalisi, Roma və Parfiya ilə münasibətləri'
    ],
    '7-ci sinif': [
      'Azərbaycan Sasani imperiyasının tərkibində',
      'Albaniyada Mehranilər sülaləsi və Cavanşirin fəaliyyəti',
      'Ərəb xilafətinin Azərbaycanı işğalı və İslam dininin yayılması',
      'Xürrəmilər hərəkatı və Babəkin mübarizəsi',
      'Feodal dövlətlərinin yaranması: Şirvanşahlar, Sacilər, Salarilər, Şəddadilər, Rəvvadilər',
      'Böyük Səlcuq imperiyası və oğuz-türk tayfalarının rolu',
      'Azərbaycan Atabəylər dövləti (Eldəgizlər)',
      'Şərq intibahı dövründə Azərbaycan mədəniyyəti'
    ],
    '8-ci sinif': [
      'Monqolların Azərbaycana yürüşləri və Hülakülər (Elxanilər) dövləti',
      'Teymurilərin yürüşləri və Şirvanşahlar dövləti',
      'Qaraqoyunlu və Ağqoyunlu dövlətləri, Uzun Həsən',
      'Vahid Azərbaycan dövlətinin yaranması: Qüdrətli Səfəvilər dövləti',
      'Şah İsmayıl Xətainin daxili və xarici siyasəti',
      'Səfəvi-Osmanlı müharibələri və Çaldıran döyüşü',
      'Şah I Abbasın islahatları və paytaxtın İsfahana köçürülməsi',
      'Nadir şah Əfşar və Əfşarlar imperiyası'
    ],
    '9-cu sinif': [
      'Azərbaycan xanlıqları: Qarabağ, Şəki, Quba, Urmiya, Təbriz və Naxçıvan xanlıqları',
      'Xanlıqların birləşdirilməsi cəhdləri (Fətəli xan Qubalı)',
      'Rusiya və Qacarlar dövlətinin Azərbaycan uğrunda müharibələri',
      'Gülüstan (1813) və Türkmənçay (1828) müqavilələri, Azərbaycanın parçalanması',
      'Çar Rusiyasının müstəmləkə rejimi və komendant idarə üsulu',
      'XIX əsr kəndli çıxışları və aqrar islahatlar',
      'Şimali Azərbaycanda kapitalist münasibətlərinin və neft sənayesinin inkişafı',
      'Milli oyanış və maarifçilik hərəkatı (H.Zərdabi, M.F.Axundzadə)'
    ],
    '10-cu sinif': [
      'XX əsrin əvvəllərində Şimali Azərbaycanda ictimai-siyasi vəziyyət',
      'Milli siyasi təşkilatlar və partiyalar (Müsavat, Difai və s.)',
      '1918-ci il 31 Mart soyqırımı və erməni təcavüzü',
      '28 May 1918: Azərbaycan Xalq Cümhuriyyətinin yaranması və İstiqlal Bəyannaməsi',
      'AXC-nin ordu quruculuğu, dövlət dili, sərhədləri və xarici siyasəti',
      '27 Aprel 1920: XI Qırmızı Ordunun işğalı və Sovet rejiminin qurulması',
      'Sovet dövründə irtica və repressiyalar (1937-ci il)',
      'İkinci Dünya müharibəsində Azərbaycan xalqının və Bakı neftinin rolu'
    ],
    '11-ci sinif': [
      'XX əsrin ikinci yarısında Azərbaycan: Heydər Əliyevin birinci rəhbərlik dövrü (1969-1982)',
      'Milli Azadlıq hərəkatı və 20 Yanvar 1990-cı il faciəsi',
      '18 Oktyabr 1991: Dövlət müstəqilliyinin bərpası',
      'Birinci Qarabağ müharibəsi və torpaqlarımızın işğalı',
      '1993-cü il: Heydər Əliyevin xilaskarlıq missiyası və «Əsrin müqaviləsi» (1994)',
      'Prezident İlham Əliyevin rəhbərliyi ilə həyata keçirilən strateji siyasət',
      '27 Sentyabr - 10 Noyabr 2020: 44 günlük Vətən müharibəsi və Şuşa Zəfəri',
      '2023-cü il 19-20 Sentyabr: Antiterror əməliyyatı və suverenliyin tam bərpası'
    ]
  },

  // -------------------------------------------------------------
  // ÜMUMİ TARİX (6 - 11)
  // -------------------------------------------------------------
  'Ümumi tarix': {
    '6-cı sinif': [
      'İbtidai icma quruluşu və insan cəmiyyətinin formalaşması',
      'Qədim Misir sivilizasiyası: Fironlar, piramidalar və mədəniyyət',
      'Qədim Şumer və Babil dövləti, Hammurapi qanunları',
      'Qədim Çin və Hindistan sivilizasiyaları',
      'Qədim Yunanıstan: Afinada demokratiya və Sparta dövləti',
      'Böyük İsgəndər və onun imperiyası',
      'Qədim Roma: Respublika dövrü və Roma imperiyasının yüksəlişi'
    ],
    '7-ci sinif': [
      'Böyük xalqlar köçü və Qərbi Roma imperiyasının süqutu',
      'Bizans imperiyası və onun Şərqi Avropaya təsiri',
      'Frank dövləti və Böyük Karl',
      'Ərəb xilafəti və İslam sivilizasiyasının qızıl dövrü',
      'Səlib yürüşləri və onların nəticələri',
      'Qərbi Avropada feodalizm və mərkəzləşdirilmiş dövlətlərin yaranması (İngiltərə, Fransa)',
      'Slavyan dövlətləri və Kiyev Rus dövləti'
    ],
    '8-ci sinif': [
      'Böyük coğrafi kəşflər və müstəmləkə işğallarının başlanması',
      'İntibah dövrü mədəniyyəti (Humanizm) və Elm inqilabı',
      'Reformasiya hərəkatı və Martin Lüter',
      'Osmanlı imperiyasının yüksəlişi və Qanuni Sultan Süleyman dövrü',
      'İngiltərə burjua inqilabı və parlamentli monarxiyanın bərqərar olması',
      'ABŞ-ın yaranması və İstiqlaliyyət Bəyannaməsi (1776)',
      'Böyük Fransa burjua inqilabı (1789-1794)'
    ],
    '9-cu sinif': [
      'Napoleon Bonapart dövrü və Vyana konqresi (1815)',
      'Sənaye çevrilişi və kapitalist cəmiyyətinin bərqərar olması',
      'Almaniya və İtaliyanın vahid dövlətdə birləşdirilməsi',
      'ABŞ-da vətəndaş müharibəsi və quldarlığın ləğvi',
      'Osmanlı imperiyasında Tənzimat dövrü',
      'Hərbi-siyasi blokların yaranması: Üçlər İttifaqı və Antanta',
      'Birinci Dünya müharibəsi (1914-1918) və Versal-Vaşinqton sistemi'
    ],
    '10-cu sinif': [
      'İki dünya müharibəsi arasında dünya: Böyük İqtisadi böhran (1929-1933)',
      'Faşizm və nasizmin yüksəlişi: İtaliya və Almaniyada totalitar rejimlər',
      'Sovet İttifaqı: Stalinizm və sənayeləşmə',
      'İkinci Dünya müharibəsinin səbəbləri, gedişi və nəticələri (1939-1945)',
      'Nürnberq və Tokio beynəlxalq məhkəmələri',
      'BMT-nin yaranması və müharibədən sonrakı yeni dünya nizamı'
    ],
    '11-ci sinif': [
      'Soyuq müharibə dövrü: İkiqütblü dünya və bloklararası qarşıdurma',
      'NATO və Varşava Müqaviləsi Təşkilatı',
      'Müstəmləkə sisteminin dağılması və Asiya-Afrika ölkələrinin müstəqilliyi',
      'SSRİ-nin süqutu və sosialist düşərgəsinin iflası (1991)',
      'Müasir dünyada inteqrasiya prosesləri: Avropa İttifaqı',
      'Yaxın Şərq münaqişələri və beynəlxalq terrorizmlə mübarizə',
      'Qloballaşma və XXI əsrin beynəlxalq münasibətlər sistemi'
    ]
  },

  // -------------------------------------------------------------
  // İNFORMATİKA (1 - 11)
  // -------------------------------------------------------------
  'İnformatika': {
    '1-ci sinif': [
      'Kompüterlə tanışlıq: Monitor, sistem bloku, siçan və klaviatura',
      'Kompüterdə təhlükəsizlik və davranış qaydaları',
      'İnformasiya və duyğu orqanları ilə qəbul edilən məlumatlar',
      'Sadə hərəkətli proqramlar və öyrədici oyunlar'
    ],
    '2-ci sinif': [
      'İnformasiyanın növləri: Mətn, qrafik, səs və video',
      'Klaviatura ilə iş: Hərflər, rəqəmlər və boşluq düyməsi',
      'Sadə rəsm proqramı (Paint) və rəsm alətləri',
      'Kompüterdə fayl və qovluq anlayışı'
    ],
    '3-cü sinif': [
      'İnformasiyanın saxlanması, ötürülməsi və emalı',
      'Mətn redaktorunda sadə mətnlərin yığılması',
      'Alqoritm anlayışı: Addım-addım hərəkətlər ardıcıllığı',
      'Sadə xətti alqoritmlər və gündəlik həyat nümunələri'
    ],
    '4-cü sinif': [
      'Kompüterin əlavə qurğuları: Printer, skaner, kolonka və mikrofon',
      'İnternetlə ilkin tanışlıq və veb-brauzerlər',
      'Budaqlanan alqoritm anlayışı (Əgər... Əks halda)',
      'Vizual blok proqramlaşdırma (Scratch mühitinə giriş)'
    ],
    '5-ci sinif': [
      'İnformasiya prosesləri və kompüter texnologiyaları',
      'Fərdi kompüterin arxitekturası və əsas blokları',
      'Əməliyyat sistemi və iş masası pəncərələri',
      'Fayl sistemi: Faylın adı, genişlənməsi və fayl ünvanı',
      'Qrafik redaktorda vektor və rastr təsvirlər',
      'Mətn prosessoru: Mətnin formatlanması və cədvəllər'
    ],
    '6-cı sinif': [
      'İnformasiyanın ölçü vahidləri: Bayt, Kilobayt, Meqabayt, Qiqabayt',
      'Kompüterin yaddaş növləri: Əməli yaddaş (RAM) və Daimi yaddaş (ROM/SSD/HDD)',
      'Təqdimat proqramı (MS PowerPoint): Slaydlar, animasiya və keçidlər',
      'Alqoritmin təsvir üsulları: Blok-sxemlər',
      'Scratch mühitində personajların idarə edilməsi və dəyişənlər'
    ],
    '7-ci sinif': [
      'Elektron cədvəllər (MS Excel): Xanalar, verilənlər və düsturlar',
      'Cədvəllərdə sadə riyazi funksiyalar (SUM, AVERAGE, MAX, MIN)',
      'Dioqramların qurulması və verilənlərin vizuallaşdırılması',
      'Kompüter şəbəkələri: Lokal və qlobal şəbəkələr',
      'İnternetdə axtarış sistemləri və e-poçt xidmətləri',
      'Python proqramlaşdırma dili: Sintaksis, `print()` və `input()` əmrləri'
    ],
    '8-ci sinif': [
      'Say sistemləri: İkilik, səkkizlik, onluq və onaltılıq say sistemləri',
      'Bir say sistemindən digərinə keçid alqoritmləri',
      'Kompüterdə mətn, qrafik və səs informasiyasının kodlaşdırılması',
      'Python: Şərt operatorları (`if`, `elif`, `else`)',
      'Dövr operatorları: `for` və `while` dövrləri',
      'İnformasiya təhlükəsizliyi, zərərli proqramlar və antiviruslar'
    ],
    '9-cu sinif': [
      'Məntiq cəbrinin əsasları: Məntiqi mülahizələr, konyunksiya, dizyunksiya və inkar',
      'Məntiqi sxemlər və həqiqilik cədvəlləri',
      'Python-da siyahılar (Lists) və sətirlər (Strings) üzərində əməllər',
      'Funksiyalar (`def`) və modulların qoşulması',
      'Verilənlər bazası anlayışı və relyasiya cədvəlləri (MS Access)',
      'Kiber gigiyena və müəllif hüquqları'
    ],
    '10-cu sinif': [
      'Kompüterin aparat təminatı (Hardware) və arxitekturası (fon Neyman prinsipləri)',
      'Prosessorun (CPU) quruluşu, takt tezliyi və keş yaddaş',
      'Kompüterin proqram təminatı (Software): Sistem, tətbiqi və instrumental proqramlar',
      'Python: İkiölçülü massivlər, lüğətlər (Dictionaries) və çoxluqlar',
      'Alqoritmlərin effektivliyi və zaman mürəkkəbliyi ($O(n)$)',
      'Veb-proqramlaşdırmanın əsasları: HTML5 və CSS teqləri'
    ],
    '11-ci sinif': [
      'Veb-dizayn və müasir internet protokolları (TCP/IP, HTTP, HTTPS, DNS)',
      'Kriptoqrafiyanın əsasları, simmetrik və asimmetrik şifrələmə',
      'Süni intellekt, maşın öyrənməsi və böyük verilənlər (Big Data)',
      'Bulud texnologiyaları (Cloud Computing) və paylanmış sistemlər',
      'DİM Buraxılış və Blok imtahanı (I Qrup Rİ) modelinə uyğun kompleks testlər'
    ]
  },

  // -------------------------------------------------------------
  // İNGİLİS DİLİ (1 - 11)
  // -------------------------------------------------------------
  'İngilis dili': {
    '1-ci sinif': ['Alphabet & Phonics', 'Numbers 1-10', 'Colours & Shapes', 'Family & Animals', 'Simple Greetings'],
    '2-ci sinif': ['Numbers 1-20', 'School Objects', 'Parts of the Body', 'Clothes & Seasons', 'Simple Questions (What is this?)'],
    '3-cü sinif': ['Present Simple (to be: am/is/are)', 'Have got / Has got', 'Singular and Plural Nouns', 'Daily Routine & Telling Time', 'Food & Drinks'],
    '4-cü sinif': ['Present Continuous Tense', 'Can / Can’t for abilities', 'Prepositions of place (in, on, under, behind)', 'Comparative Adjectives', 'My Town & Occupations'],
    '5-ci sinif': ['Nouns: Countable and Uncountable', 'Some / Any / Much / Many', 'Present Simple: Positive, Negative, Questions', 'Adverbs of Frequency', 'Reading Short Stories'],
    '6-cı sinif': ['Past Simple Tense (Regular and Irregular Verbs)', 'Pronouns: Object and Possessive Pronouns', 'Future Simple (will) & be going to', 'Modal Verbs: Must, Should, May', 'Travel & Holidays'],
    '7-ci sinif': ['Present Perfect Tense (ever, never, just, already, yet)', 'Past Continuous Tense', 'Degrees of Adjectives & Adverbs', 'Reflexive Pronouns (myself, himself)', 'Ecology & Environment'],
    '8-ci sinif': ['Passive Voice (Present and Past Simple)', 'Past Perfect Tense', 'Conditionals: Zero & First Conditional', 'Gerund and Infinitive', 'Famous People & Inventions'],
    '9-cu sinif': ['Second Conditional (If I had... I would...)', 'Reported Speech (Statements and Commands)', 'Relative Clauses (who, which, that, where)', 'Modal Verbs in the Past', 'DİM Examination Reading & Dialogue Tasks'],
    '10-cu sinif': ['Third Conditional & Mixed Conditionals', 'Complex Object (see, hear, make, let)', 'Conjunctions and Linking Words', 'Phrasal Verbs and Collocations', 'Academic Essay Writing'],
    '11-ci sinif': ['Inversion and Emphatic Structures', 'Subjunctive Mood', 'Advanced Reading & Text Synthesis', 'SEC (DİM) Admission Model Tests & Situations', 'Listening Comprehension & Lexical Nuances']
  },

  // -------------------------------------------------------------
  // HƏYAT BİLGİSİ (1 - 9)
  // -------------------------------------------------------------
  'Həyat bilgisi': {
    '1-ci sinif': [
      'Mən və mənim ailəm',
      'Məktəb və sinif yoldaşlarım',
      'Gündəlik rejim və şəxsi gigiyena',
      'Yol hərəkəti qaydaları: İşıqforun rəngləri',
      'Canlı və cansız təbiət'
    ],
    '2-ci sinif': [
      'Sağlam qidalanma və bədən tərbiyəsi',
      'Evdə və məktəbdə təhlükəsizlik qaydaları',
      'Vətənimiz Azərbaycan və dövlət rəmzlərimiz',
      'Mövsümlər və təbiətin qorunması',
      'Dostluq və qarşılıqlı hörmət'
    ],
    '3-cü sinif': [
      'İnsanın orqanizmi və onun qorunması',
      'Təbii fəlakətlər zamanı davranış qaydaları (zəlzələ, yanğın)',
      'Təbiətdə suyun dövranı',
      'Cəmiyyət və peşələr aləmi',
      'Hüquq və vəzifələrimiz'
    ],
    '4-cü sinif': [
      'Azərbaycanın zəngin təbii sərvətləri',
      'Ekoloji mədəniyyət və tullantıların çeşidlənməsi',
      'İlk tibbi yardım qaydaları',
      'Milli adət-ənənələrimiz və bayramlarımız',
      'İstehlakçı hüquqları və ailə büdcəsi'
    ],
    '5-ci sinif': [
      'İnsan və cəmiyyət münasibətləri',
      'Şəxsiyyətin mənəvi dəyərləri: Ədalət, dürüstlük, xeyirxahlıq',
      'Fövqəladə hallarda həyat təhlükəsizliyi',
      'Zərərli vərdişlər və onların sağlamlığa fəsadları',
      'Bioloji və sosial varlıq kimi insan'
    ],
    '6-cı sinif': [
      'İnsan hüquqları və Uşaq Hüquqları Konvensiyası',
      'Milli və ümumbəşəri dəyərlər',
      'Yeniyetməlik dövrü və psixoloji sağlamlıq',
      'Ətraf mühitin qorunmasında vətəndaş məsuliyyəti',
      'Konfliktlərin sülh yolu ilə həlli bacarıqları'
    ],
    '7-ci sinif': [
      'Azərbaycan Respublikasının Konstitusiyası və dövlət quruluşu',
      'Vətəndaş cəmiyyəti və hüquqi dövlət anlayışı',
      'Məişətdə və texnogen qəzalarda təhlükəsizlik',
      'İnformasiya təhlükəsizliyi və kiber təhdidlərdən qorunma',
      'Sağlam həyat tərzi və idmanın əhəmiyyəti'
    ],
    '8-ci sinif': [
      'Ailə cəmiyyətin əsasıdır: Ailə hüququ və vəzifələri',
      'Əmək hüququ və peşə seçimi',
      'İqtisadi münasibətlər, sahibkarlıq və vergilər',
      'Mənəvi kamillik və dini tolerantlıq',
      'Qlobal ekoloji böhran və beynəlxalq əməkdaşlıq'
    ],
    '9-cu sinif': [
      'Dövlət orqanları və məhkəmə hakimiyyəti',
      'İnzibati və cinayət məsuliyyəti',
      'Demokratiya və seçki hüququ',
      'Fövqəladə hallar zamanı mülki müdafiə sistemi',
      'Azərbaycanın beynəlxalq arenada rolu və sülhsevər siyasəti'
    ]
  },

  // -------------------------------------------------------------
  // TƏBİƏT (5)
  // -------------------------------------------------------------
  'Təbiət': {
    '5-ci sinif': [
      'Təbiət elmləri və tədqiqat metodları',
      'Yerin quruluşu və Günəş sistemində yeri',
      'Maddələr və onların xassələri, fiziki və kimyəvi çevrilmələr',
      'Hava və atmosfer hadisələri',
      'Su və suyun təbiətdə əhəmiyyəti',
      'Torpaq və onun münbitliyi',
      'Canlılar aləmi: Canlıların xassələri və yaşayış mühiti',
      'Orqanizmlərin bir-biri ilə və təbiətlə əlaqəsi (Ekosistem)',
      'Təbiətdən səmərəli istifadə və təbiətin mühafizəsi'
    ]
  },

  // -------------------------------------------------------------
  // MƏNTİQ (1 - 11)
  // -------------------------------------------------------------
  'Məntiq': {
    '1-ci sinif': ['Fiqurların fərqi və oxşarlığı', 'Məntiqi sıralar və ardıcıllıq', 'Əşyaların təsnifatı', 'Labirintlər və sadə məntiq'],
    '2-ci sinif': ['Qanunauyğunluqların tapılması', 'Riyazi şifrələr', 'Şəkilli tərəzilər', 'Hissə-bütöv əlaqəsi'],
    '3-cü sinif': ['Ədəd ardıcıllıqları', 'Şifrəli sözlər və rəqəmlər', 'Məntiqi tənliklər', 'Fəza təsəvvürü və simmetriya'],
    '4-cü sinif': ['Məntiqi məsələlər və cədvəllər', 'Tərəzilər və tarazlıq prinsipi', 'Operatorlar və riyazi qanunauyğunluqlar', 'Kubların açılışı və fırladılması'],
    '5-ci sinif': ['Qanunauyğunluqların bərpası', 'Şəkil-cədvəl əlaqələri', 'Qeyri-aşkar operatorlar', 'Məntiqi mətnlər və nəticə çıxarma'],
    '6-cı sinif': ['Ədəd-şəkil əlaqələri', 'Fiqur ardıcıllıqları və analoqlar', 'Şifrələr və kodlaşdırma', 'Sübut və inkar məntiqi'],
    '7-ci sinif': ['Riyazi məntiq məsələləri', 'Mürəkkəb tərəzilər', 'Cədvəl operatorları', 'Həndəsi məntiq və fəza fiqurları'],
    '8-ci sinif': ['Analoqlar və anaqramlar', 'Sillogizmlər və məntiqi mühakimə', 'Çoxluqlar üzərində məntiqi əməllər', 'Qrafik məntiq və diaqramlar'],
    '9-cu sinif': ['Verbal məntiq testləri', 'Məntiqi tənliklər sistemi', 'Kriptoqrafik məntiq', 'Lisey və olimpiada tipli məntiq testləri'],
    '10-cu sinif': ['Mürəkkəb riyazi qanunauyğunluqlar', 'Fəzada fırlanmalar və proyeksiya', 'Mühakimə və ziddiyyət qanunları', 'Tənqidi təfəkkür məsələləri'],
    '11-ci sinif': ['Magistratura və dövlət qulluğu tipli məntiq', 'Kompleks verbal və riyazi modelləşdirmə', 'Məntiqi eskalasiya və abstrakt təfəkkür']
  },

  // -------------------------------------------------------------
  // DİGƏR MƏKTƏB FƏNLƏRİ (Ümumi proqram)
  // -------------------------------------------------------------
  'Texnologiya': {
    '5-ci sinif': ['Ağac və metal emalı texnologiyası', 'Qrafik savad və çertyojlar', 'Məişət texnikası və təhlükəsizlik', 'Kulinariya və süfrə mədəniyyəti'],
    '7-ci sinif': ['Konstruksiya materialları və onların mexaniki xassələri', 'Dəzgahlar və mexanizmlər', 'Elektrotexnika işləri', 'Layihələndirmə və dizayn'],
    '9-cu sinif': ['Avtomatlaşdırma və robototexnikanın əsasları', 'Müasir istehsalat texnologiyaları', 'Peşəyönümü və əmək bazarı', 'Biznes-planın tərtibi']
  },

  'Musiqi': {
    '5-ci sinif': ['Azərbaycan xalq musiqisi və muğam sənəti', 'Musiqi alətlərimiz (Tar, kamança, qaval)', 'Klassik bəstəkarlarımız (Üzeyir Hacıbəyli, Qara Qarayev)', 'Musiqi janrları: Mahnı, romans, simfoniya'],
    '7-ci sinif': ['Milli operalar və baletlər («Leyli və Məcnun», «Yeddi gözəl»)', 'Dünya musiqi klassikləri (Bax, Motsart, Bethoven)', 'Xor və orkestr növləri', 'Müasir musiqi cərəyanları və caz']
  },

  'Təsviri incəsənət': {
    '5-ci sinif': ['Rəngkarlıq və rəng dairəsi', 'Qrafika və xətti rəsm', 'Naturadan rəsm: Natürmort', 'Azərbaycan xalçaçılıq məktəbləri'],
    '7-ci sinif': ['Portret janrı və insan anatomiyası rəsmdə', 'Mənzərə janrı və fəza perspektivası', 'Dekorativ-tətbiqi sənət və memarlıq abidələri', 'Tarixi və bədii kompozisiyalar']
  },

  'Fiziki tərbiyə': {
    '5-ci sinif': ['Şəxsi gigiyena və orqanizmin möhkəmləndirilməsi', 'Sıra hərəkətləri və gimnastika', 'Qaçış və tullanma texnikası', 'Hərəkətli və milli oyunlar'],
    '9-cu sinif': ['Yüngül atletika növləri', 'Basketbol və voleybol oyun qaydaları', 'Futbol və taktiki gedişlər', 'Fiziki dözümlülük və güc normativləri']
  },

  'Çağırışaqədərki hazırlıq': {
    '10-cu sinif': ['Azərbaycan Respublikasının Silahlı Qüvvələri və hərbi and', 'Ümumqoşun nizamnamələri', 'Sıra hazırlığı və hərbi intizam', 'Atıcı silahlar: Kalaşnikov avtomatının quruluşu və sökülüb-yığılması', 'Mülki müdafiə və fövqəladə hallar'],
    '11-ci sinif': ['Taktiki hazırlıq və döyüş növləri', 'Hərbi topoqrafiya və kompasla istiqamətin təyini', 'Kütləvi qırğın silahlarından mühafizə', 'Döyüş meydanında ilk tibbi yardım və yaralıların təxliyəsi', 'Vətənə sədaqət və hərbi vətənpərvərlik']
  },

  'Fransız dili': {
    '5-ci sinif': ['Alphabet français et prononciation', 'Salutations et présentations', 'Nombres de 1 à 50', 'La famille et les animaux'],
    '8-ci sinif': ['Le Présent de l’indicatif', 'Le Passé Composé avec avoir et être', 'Les adjectifs possessifs et démonstratifs', 'La France: culture et géographie'],
    '11-ci sinif': ['Le Subjonctif Présent', 'Le Discours Rapporté', 'L’expression de la condition (Si clauses)', 'Préparation aux examens d’admission DİM']
  },

  'Rus dili': {
    '5-ci sinif': ['Звуки и буквы: гласные и согласные', 'Состав слова: корень, приставка, суффикс, окончание', 'Имя существительное: род и число', 'Имя прилагательное'],
    '8-ci sinif': ['Глагол: спряжение, виды глагола (совершенный и несовершенный)', 'Причастие и деепричастие', 'Словосочетание и простое предложение', 'Текст и его типы'],
    '11-ci sinif': ['Сложное предложение: союзные и бессоюзные', 'Сложносочиненные и сложноподчиненные предложения', 'Орфографические и пунктуационные нормы русского языка', 'Комплексный анализ текста']
  }
};

// HELPER FUNCTIONS
export function getSubjectMetadata(subjectName: string): SubjectMetadata | undefined {
  return ALL_SCHOOL_SUBJECTS.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
}

export function getGradesForSubject(subjectName: string): string[] {
  // If defined in metadata, return valid grades
  const meta = getSubjectMetadata(subjectName);
  if (meta && meta.grades.length > 0) {
    return meta.grades;
  }
  // Otherwise check curriculum data keys
  const cur = CURRICULUM_DATA[subjectName];
  if (cur) {
    return Object.keys(cur);
  }
  return [
    '1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif',
    '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif',
    '9-cu sinif', '10-cu sinif', '11-ci sinif'
  ];
}

export function getTopicsFor(subjectName: string, grade: string): string[] {
  const bySubject = CURRICULUM_DATA[subjectName];
  if (bySubject && bySubject[grade]) {
    return bySubject[grade];
  }

  // Fallback for sub-aliases
  if (subjectName === 'Cəbr' || subjectName === 'Həndəsə') {
    const mathGr = CURRICULUM_DATA['Riyaziyyat']?.[grade];
    if (mathGr) return mathGr;
  }

  return [
    `${subjectName} (${grade}): Bölmə 1 – Əsas anlayışlar və nəzəri baza`,
    `${subjectName} (${grade}): Bölmə 2 – Praktiki tətbiq və qanunauyğunluqlar`,
    `${subjectName} (${grade}): Bölmə 3 – Məsələ və situasiyalar`,
    `${subjectName} (${grade}): Bölmə 4 – Ümumiləşdirici təkrar və testlər`
  ];
}

export function searchTopics(subjectName: string, grade: string, query: string): string[] {
  const all = getTopicsFor(subjectName, grade);
  if (!query || !query.trim()) return all;
  const qClean = query.toLowerCase().trim();
  return all.filter(t => t.toLowerCase().includes(qClean));
}
