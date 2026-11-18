// src/lib/nakhchivanData.ts
// Naxçıvan Muxtar Respublikası Regional Təhsil Məlumat Bazası və Sabitləri

export interface DistrictInfo {
  id: string;
  name: string;
  shortName: string;
  center: string;
}

export const NAKHCHIVAN_DISTRICTS: DistrictInfo[] = [
  { id: 'naxcivan_seher', name: 'Naxçıvan şəhəri', shortName: 'Naxçıvan ş.', center: 'Naxçıvan şəhəri' },
  { id: 'babek', name: 'Babək rayonu', shortName: 'Babək ray.', center: 'Babək şəhəri' },
  { id: 'serur', name: 'Şərur rayonu', shortName: 'Şərur ray.', center: 'Şərur şəhəri' },
  { id: 'ordubad', name: 'Ordubad rayonu', shortName: 'Ordubad ray.', center: 'Ordubad şəhəri' },
  { id: 'culfa', name: 'Culfa rayonu', shortName: 'Culfa ray.', center: 'Culfa şəhəri' },
  { id: 'kengerli', name: 'Kəngərli rayonu', shortName: 'Kəngərli ray.', center: 'Qıvraq qəsəbəsi' },
  { id: 'sahbuz', name: 'Şahbuz rayonu', shortName: 'Şahbuz ray.', center: 'Şahbuz şəhəri' },
  { id: 'sederek', name: 'Sədərək rayonu', shortName: 'Sədərək ray.', center: 'Heydərabad qəsəbəsi' },
];

export const MONITORING_GRADES = ['IV sinif', 'VI sinif', 'IX sinif', 'XI sinif'] as const;
export type MonitoringGrade = typeof MONITORING_GRADES[number];

export const MONITORING_SUBJECTS = [
  'Azərbaycan dili',
  'Riyaziyyat',
  'Xarici dil',
  'Təbiət / Həyat bilgisi',
  'Tarix',
  'Fizika'
] as const;

export const MONITORING_PERIODS = [
  { id: 'mon_1', title: 'I Monitorinq', date: 'Oktyabr 2025' },
  { id: 'mon_2', title: 'II Monitorinq', date: 'Yanvar 2026' },
  { id: 'mon_3', title: 'III Monitorinq', date: 'Aprel 2026' },
] as const;

export const DISTRICT_SCHOOLS: Record<string, string[]> = {
  'Naxçıvan şəhəri': [
    'Heydər Əliyev adına Hərbi Lisey',
    'Naxçıvan Qarnizonu Tam Orta Məktəbi',
    '1 nömrəli tam orta məktəb',
    '3 nömrəli rus təmayüllü tam orta məktəb',
    '5 nömrəli tam orta məktəb',
    '12 nömrəli tam orta məktəb',
    'Naxçıvan Qızlar Liseyi',
    'Naxçıvan şəhər Kimya-Biologiya Təmayüllü Lisey'
  ],
  'Babək rayonu': [
    'Babək şəhər 1 nömrəli tam orta məktəb',
    'Nehrəm qəsəbə 1 nömrəli tam orta məktəb',
    'Nehrəm qəsəbə 2 nömrəli tam orta məktəb',
    'Cəhri qəsəbə 1 nömrəli tam orta məktəb',
    'Sirab kənd tam orta məktəbi',
    'Şıxmahmud kənd tam orta məktəbi',
    'Zeynəddin kənd tam orta məktəbi'
  ],
  'Şərur rayonu': [
    'Şərur şəhər 1 nömrəli tam orta məktəb',
    'Şərur şəhər 2 nömrəli tam orta məktəb',
    'Düdəngə kənd tam orta məktəbi',
    'Çərçiboğan kənd tam orta məktəbi',
    'Yengicə kənd tam orta məktəbi',
    'Mahmudkənd tam orta məktəbi',
    'Danyeri kənd tam orta məktəbi'
  ],
  'Ordubad rayonu': [
    'Ordubad şəhər 1 nömrəli tam orta məktəb',
    'M.T.Sidqi adına tam orta məktəb',
    'Vənənd kənd tam orta məktəbi',
    'Dəstə kənd tam orta məktəbi',
    'Unus kənd tam orta məktəbi',
    'Gənzə kənd tam orta məktəbi'
  ],
  'Culfa rayonu': [
    'Culfa şəhər 1 nömrəli tam orta məktəb',
    'Culfa şəhər 2 nömrəli tam orta məktəb',
    'Əbrəqunus kənd tam orta məktəbi',
    'Yaycı kənd tam orta məktəbi',
    'Bənəniyar kənd tam orta məktəbi',
    'Qazançı kənd tam orta məktəbi'
  ],
  'Kəngərli rayonu': [
    'Qıvraq qəsəbə tam orta məktəbi',
    'Şahtaxtı kənd tam orta məktəbi',
    'Qarabağlar kənd 1 nömrəli tam orta məktəb',
    'Qarabağlar kənd 2 nömrəli tam orta məktəb',
    'Xok kənd tam orta məktəbi',
    'Çalxanqala kənd tam orta məktəbi'
  ],
  'Şahbuz rayonu': [
    'Şahbuz şəhər 1 nömrəli tam orta məktəb',
    'Kükü kənd tam orta məktəbi',
    'Badamlı qəsəbə tam orta məktəbi',
    'Nursu kənd tam orta məktəbi',
    'Kolani kənd tam orta məktəbi',
    'Keçili kənd tam orta məktəbi'
  ],
  'Sədərək rayonu': [
    'Heydərabad qəsəbə tam orta məktəbi',
    'Sədərək kənd 1 nömrəli tam orta məktəb',
    'Sədərək kənd 2 nömrəli tam orta məktəb',
    'Qaraağac kənd tam orta məktəbi'
  ]
};

export interface SchoolRecord {
  id: string;
  name: string;
  district: string;
  studentsCount: number;
  overallScore: number; // percentage e.g. 74.5
  gradeScores: Record<string, number>; // { 'IV sinif': 78, 'VI sinif': 72, 'IX sinif': 75, 'XI sinif': 73 }
  subjectScores: Record<string, number>; // { 'Azərbaycan dili': 76, 'Riyaziyyat': 72, ... }
  districtRank: number;
  nmrRank: number;
  dynamics: {
    mon1: number;
    mon2: number;
    mon3: number;
    changePct: number;
  };
}

export interface DistrictRecord {
  id: string;
  name: string;
  schoolsCount: number;
  studentsCount: number;
  overallScore: number;
  gradeScores: Record<string, number>;
  subjectScores: Record<string, number>;
  topSchool: string;
  lowestSchool: string;
  nmrRank: number;
  dynamics: {
    mon1: number;
    mon2: number;
    mon3: number;
    changePct: number;
  };
}

export interface NmrOverviewStats {
  totalStudents: number;
  totalSchools: number;
  overallAverage: number;
  gradeAverages: Record<string, number>;
  subjectAverages: Record<string, number>;
  topDistrict: { name: string; score: number };
  lowestDistrict: { name: string; score: number };
  topSchool: { name: string; district: string; score: number };
  lowestSchool: { name: string; district: string; score: number };
  minScore: { score: number; school: string; district: string };
  avgScore: number;
  maxScore: { score: number; school: string; district: string };
}
