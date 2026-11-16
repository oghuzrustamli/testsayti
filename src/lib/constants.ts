// src/lib/constants.ts
import { ExamModel, QuestionType } from '../types';

export interface ExamModelConfig {
  name: ExamModel;
  description: string;
  grades: string[];
  subGroups?: { name: string; subjects: string[] }[];
  defaultSubjects?: string[];
}

export const EXAM_MODELS: Record<ExamModel, ExamModelConfig> = {
  'Buraxılış imtahanı': {
    name: 'Buraxılış imtahanı',
    description: 'DİM tərəfindən 9 və 11-ci siniflər üçün keçirilən dövlət buraxılış imtahanı modeli',
    grades: ['9-cu sinif', '11-ci sinif'],
    defaultSubjects: [
      'Tədris dili (Azərbaycan dili)',
      'Riyaziyyat',
      'Xarici dil (İngilis dili)',
      'Rus dili (Tədris dili)'
    ]
  },
  'Blok imtahanı': {
    name: 'Blok imtahanı',
    description: 'Ali məktəblərə qəbul üçün I, II, III və IV ixtisas qrupları üzrə blok imtahanı',
    grades: ['11-ci sinif / Abituriyent', '10-cu sinif'],
    subGroups: [
      {
        name: 'I Qrup (Rİ - Riyaziyyat / İnformatika)',
        subjects: ['Riyaziyyat', 'Fizika', 'İnformatika']
      },
      {
        name: 'I Qrup (RK - Riyaziyyat / Kimya)',
        subjects: ['Riyaziyyat', 'Fizika', 'Kimya']
      },
      {
        name: 'II Qrup (Riyaziyyat / Coğrafiya / Tarix)',
        subjects: ['Riyaziyyat', 'Coğrafiya', 'Tarix']
      },
      {
        name: 'III Qrup (Azərbaycan dili / Ədəbiyyat / Tarix)',
        subjects: ['Azərbaycan dili', 'Ədəbiyyat', 'Tarix']
      },
      {
        name: 'IV Qrup (Biologiya / Kimya / Fizika)',
        subjects: ['Biologiya', 'Kimya', 'Fizika']
      }
    ]
  },
  'Sinif imtahanı': {
    name: 'Sinif imtahanı',
    description: '4-cü, 9-cu və 11-ci siniflər üçün dövlət və ya məktəb səviyyəli monitorinq imtahanı',
    grades: ['4-cü sinif', '9-cu sinif', '11-ci sinif'],
    defaultSubjects: [
      'Riyaziyyat',
      'Azərbaycan dili',
      'İngilis dili',
      'Təbiət / Fizika'
    ]
  },
  'Məktəbdaxili test': {
    name: 'Məktəbdaxili test',
    description: '1-ci sinifdən 11-ci sinfə qədər bütün fənlər üzrə KSQ, BSQ və cari qiymətləndirmə',
    grades: [
      '1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif',
      '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif',
      '9-cu sinif', '10-cu sinif', '11-ci sinif'
    ],
    defaultSubjects: [
      'Riyaziyyat',
      'Azərbaycan dili',
      'İngilis dili',
      'Fizika',
      'Kimya',
      'Biologiya',
      'Tarix',
      'Coğrafiya',
      'İnformatika',
      'Rus dili',
      'Ədəbiyyat'
    ]
  },
  'Şagird qrupu': {
    name: 'Şagird qrupu',
    description: 'Xüsusi repetitor və hazırlıq qrupları üçün sınaq imtahanı',
    grades: ['1-ci sinif', '2-ci sinif', '3-cü sinif', '4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif', '9-cu sinif', '10-cu sinif', '11-ci sinif'],
    defaultSubjects: [
      'Riyaziyyat',
      'Azərbaycan dili',
      'İngilis dili',
      'Fizika',
      'Kimya',
      'Biologiya',
      'Tarix',
      'Coğrafiya',
      'İnformatika',
      'Rus dili',
      'Ədəbiyyat'
    ]
  },
  'Liseylərə qəbul imtahanı': {
    name: 'Liseylərə qəbul imtahanı',
    description: 'Fizika-Riyaziyyat və Texniki Təmayüllü Liseylər, Kimya-Biologiya və DTM qəbul sınaqları',
    grades: ['4-cü sinif', '5-ci sinif', '6-cı sinif', '7-ci sinif', '8-ci sinif'],
    defaultSubjects: [
      'Riyaziyyat',
      'Məntiq',
      'Azərbaycan dili',
      'İngilis dili'
    ]
  }
};

export const QUESTION_TYPES: { type: QuestionType; label: string; icon: string; description: string }[] = [
  {
    type: 'single_choice',
    label: '1. Qapalı test (A, B, C, D, E)',
    icon: 'CheckCircle2',
    description: 'A, B, C, D, E variantları. Bir düzgün cavab. Avtomatik yoxlama.'
  },
  {
    type: 'open_ended',
    label: '2. Açıq test (Yazılı / Ədədi)',
    icon: 'FileText',
    description: 'Şagird cavabı özü daxil edir (ədədi və ya riyazi ifadə).'
  },
  {
    type: 'situation',
    label: '3. Situasiya tipli test',
    icon: 'Layers',
    description: 'Bir mətn / situasiyaya bağlı bir neçə qrup sualı.'
  },
  {
    type: 'multiple_choice',
    label: 'Çoxsaylı düzgün cavablı',
    icon: 'CheckSquare',
    description: 'Birdən çox düzgün variant seçimi.'
  },
  {
    type: 'true_false',
    label: 'Doğru / Yanlış',
    icon: 'ToggleLeft',
    description: 'Müddəanın doğru və ya yanlış olduğunu qeyd etmə.'
  },
  {
    type: 'matching',
    label: 'Uyğunlaşdırma',
    icon: 'GitFork',
    description: 'Müddəalar arasında uyğunluq əlaqəsi.'
  },
  {
    type: 'fill_blank',
    label: 'Boşluqları doldurma',
    icon: 'TextCursorInput',
    description: 'Açar söz və ya ədədin daxil edilməsi.'
  },
  {
    type: 'numeric',
    label: 'Ədədi cavablı sual',
    icon: 'Hash',
    description: 'Yekun cavab konkret ədəd və ya kəsr olaraq yazılır'
  }
];

export const PRO_PACKAGES = [
  {
    id: 'pkg-1',
    months: 1,
    title: '1 Aylıq Standart PRO',
    priceAzn: 7,
    features: [
      'Limitsiz test və sual yaratma',
      'İnteraktiv riyazi formula redaktoru',
      'Qrafik laboratoriyası (Plotly/Canvas)',
      'Limitsiz şagird nəticələri və statistika',
      'Excel və PDF hesabatları ixracı',
      'WhatsApp birbaşa paylaşım linkləri'
    ]
  },
  {
    id: 'pkg-3',
    months: 3,
    title: '3 Aylıq Rüblük PRO',
    priceAzn: 20,
    badge: 'Tövsiyə olunur',
    features: [
      'Bütün 1 aylıq paket xüsusiyyətləri',
      '1 AZN qənaət',
      'Prioritet server emalı və dəstək',
      'Sual bankından testlərə sürətli inteqrasiya'
    ]
  },
  {
    id: 'pkg-6',
    months: 6,
    title: '6 Aylıq Yarımillik PRO',
    priceAzn: 40,
    features: [
      'Bütün PRO xüsusiyyətləri',
      '2 AZN əlavə qənaət',
      'Böyük həcmli imtahan və sinif analitikası',
      'Arxivləşdirilmiş testlərin daimi saxlanması'
    ]
  },
  {
    id: 'pkg-12',
    months: 12,
    title: '12 Aylıq Tam İllik PRO',
    priceAzn: 60,
    badge: 'Ən Sərfəli (24 AZN qənaət)',
    features: [
      'Bütün PRO üstünlükləri 1 il müddətinə',
      'Aylıq cəmi 5 AZN',
      'Eksklüziv yeni funksiyalara erkən çıxış',
      'Fərdi lisey və olimpiada test şablonları'
    ]
  }
];

export interface ExamCategoryItem {
  id: string;
  name: string;
  subject: string;
}

export interface ExamCategory {
  id: string;
  label: string;
  badge: string;
  items: ExamCategoryItem[];
}

export const OMR_CATEGORIES_DATA: ExamCategory[] = [
  {
    id: 'blok',
    label: 'Blok',
    badge: 'I - IV Qruplar',
    items: [
      { id: 'blok-1-ri', name: 'I Qrup (Rİ)', subject: 'Riyaziyyat / İnformatika' },
      { id: 'blok-1-rk', name: 'I Qrup (RK)', subject: 'Riyaziyyat / Kimya' },
      { id: 'blok-2', name: 'II Qrup', subject: 'Riyaziyyat / Coğrafiya' },
      { id: 'blok-3', name: 'III Qrup', subject: 'Azərbaycan dili / Tarix' },
      { id: 'blok-4', name: 'IV Qrup', subject: 'Biologiya / Kimya' },
    ]
  },
  {
    id: 'buraxilis',
    label: 'Buraxılış',
    badge: 'DİM 9 & 11',
    items: [
      { id: 'buraxilis-9', name: '9-cu sinif Buraxılış', subject: 'Riyaziyyat / Ana dili' },
      { id: 'buraxilis-11', name: '11-ci sinif Buraxılış', subject: 'DİM Buraxılış Standartı' },
      { id: 'buraxilis-msi', name: 'Mövzu Sınaq (MSİ)', subject: 'Fənn üzrə sınaq' },
      { id: 'buraxilis-usi', name: 'Ümumi Sınaq (ÜSİ)', subject: 'Tam Buraxılış Sınağı' },
    ]
  },
  {
    id: 'mektebdaxili',
    label: 'Məktəbdaxili',
    badge: 'KSQ / BSQ',
    items: [
      { id: 'ksq', name: 'KSQ Qiymətləndirmə', subject: 'Kiçik Summativ' },
      { id: 'bsq', name: 'BSQ Qiymətləndirmə', subject: 'Böyük Summativ' },
      { id: 'monitorinq', name: 'Məktəb Monitorinqi', subject: 'Diaqnostik test' },
      { id: 'ibtidai', name: 'İbtidai Siniflər (1-4)', subject: 'Sinif Sınaqları' },
    ]
  },
  {
    id: 'liseyler',
    label: 'Liseylər',
    badge: 'Qəbul Sınaqları',
    items: [
      { id: 'frtl', name: 'FRTL Qəbul Sınağı', subject: 'Fizika-Riyaziyyat' },
      { id: 'kbtl', name: 'KBTL Qəbul Sınağı', subject: 'Kimya-Biologiya' },
      { id: 'herbi', name: 'Hərbi Lisey Qəbul', subject: 'Hərbi Lisey Standartı' },
      { id: 'lisey-5-8', name: '5-8-ci Sinif Qəbul', subject: 'İstedadlı Şagird Sınağı' },
    ]
  }
];
