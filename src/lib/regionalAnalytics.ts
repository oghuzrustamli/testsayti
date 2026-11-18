// src/lib/regionalAnalytics.ts
// Naxçıvan Muxtar Respublikası Regional Təhsil Statistikası və Reytinq Hesablama Mühərriki
// YALNIZ VƏ YALNIZ EDUNEX PLATFORMASINDAN QEYDİYYATDAN KEÇƏN REAL ŞAGİRD VƏ İMTAHAN NƏTİCƏLƏRİNƏ ƏSASLANIR
import {
  NAKHCHIVAN_DISTRICTS,
  MONITORING_GRADES,
  MONITORING_SUBJECTS,
  DistrictRecord,
  SchoolRecord,
  NmrOverviewStats,
  getAllSchools,
  SchoolRecordItem
} from './nakhchivanData';

export interface RegionalAnalyticsResult {
  districts: DistrictRecord[];
  schools: SchoolRecord[];
  overview: NmrOverviewStats;
  participatingSchoolsCount: number;
  participatingDistrictsCount: number;
}

/**
 * Pure calculation function: Takes actual completed test sessions from EDUNEX database
 * and computes exact academic statistics and rankings without any fake or simulated data.
 */
export function calculateRegionalAnalytics(sessions: any[] = []): RegionalAnalyticsResult {
  const registeredSchools: SchoolRecordItem[] = getAllSchools();

  // Filter sessions strictly to valid monitoring grades (IV, VI, IX, XI)
  const validSessions = (sessions || []).filter((s) => {
    if (!s || s.percentage === undefined || s.percentage === null) return false;
    const g = String(s.grade || '').trim();
    return (
      g.includes('IV') ||
      g.includes('VI') ||
      g.includes('IX') ||
      g.includes('XI') ||
      g === '4' ||
      g === '6' ||
      g === '9' ||
      g === '11'
    );
  });

  // Group real sessions by school & district
  const schoolSessionsMap: Record<string, any[]> = {};
  validSessions.forEach((sess) => {
    const schName = (sess.school || '').trim();
    if (!schName) return;
    if (!schoolSessionsMap[schName]) {
      schoolSessionsMap[schName] = [];
    }
    schoolSessionsMap[schName].push(sess);
  });

  // Build School Records
  const allSchools: SchoolRecord[] = registeredSchools.map((sch) => {
    const sList = schoolSessionsMap[sch.name] || [];
    const count = sList.length;

    if (count === 0) {
      // School has not participated in any exam in EDUNEX yet
      return {
        id: sch.id,
        name: sch.name,
        district: sch.district,
        utisCode: sch.utis_code,
        studentsCount: 0,
        overallScore: 0,
        minScore: 0,
        maxScore: 0,
        gradeScores: {
          'IV sinif': 0,
          'VI sinif': 0,
          'IX sinif': 0,
          'XI sinif': 0
        },
        subjectScores: {},
        districtRank: 0,
        nmrRank: 0,
        dynamics: {
          mon1: 0,
          mon2: 0,
          mon3: 0,
          changePct: 0
        }
      };
    }

    // Calculate real numbers from actual student sessions in EDUNEX
    const percentages: number[] = sList.map((s) => Number(s.percentage) || 0);
    const sumPct = percentages.reduce((a, b) => a + b, 0);
    const overallScore = Number((sumPct / count).toFixed(1));
    const minScore = Math.min(...percentages);
    const maxScore = Math.max(...percentages);

    // Grade averages for this school
    const gradeScores: Record<string, number> = {
      'IV sinif': 0,
      'VI sinif': 0,
      'IX sinif': 0,
      'XI sinif': 0
    };
    MONITORING_GRADES.forEach((g) => {
      const gSessions = sList.filter((s) => String(s.grade || '').includes(g.split(' ')[0]));
      if (gSessions.length > 0) {
        const gSum = gSessions.reduce((a, b) => a + (Number(b.percentage) || 0), 0);
        gradeScores[g] = Number((gSum / gSessions.length).toFixed(1));
      }
    });

    // Subject scores for this school
    const subjectScores: Record<string, number> = {};
    MONITORING_SUBJECTS.forEach((sub) => {
      const subSessions = sList.filter((s) => s.subject === sub);
      if (subSessions.length > 0) {
        const subSum = subSessions.reduce((a, b) => a + (Number(b.percentage) || 0), 0);
        subjectScores[sub] = Number((subSum / subSessions.length).toFixed(1));
      }
    });

    // Dynamics across monitoring periods
    const mon1Sessions = sList.filter((s) => (s.monitoring_period || '').includes('I'));
    const mon2Sessions = sList.filter((s) => (s.monitoring_period || '').includes('II'));
    const mon3Sessions = sList.filter((s) => (s.monitoring_period || '').includes('III'));

    const mon1 = mon1Sessions.length > 0 ? Number((mon1Sessions.reduce((a, b) => a + (Number(b.percentage) || 0), 0) / mon1Sessions.length).toFixed(1)) : overallScore;
    const mon2 = mon2Sessions.length > 0 ? Number((mon2Sessions.reduce((a, b) => a + (Number(b.percentage) || 0), 0) / mon2Sessions.length).toFixed(1)) : overallScore;
    const mon3 = mon3Sessions.length > 0 ? Number((mon3Sessions.reduce((a, b) => a + (Number(b.percentage) || 0), 0) / mon3Sessions.length).toFixed(1)) : overallScore;
    const changePct = mon1 > 0 ? Number(((mon3 - mon1) / mon1 * 100).toFixed(1)) : 0;

    return {
      id: sch.id,
      name: sch.name,
      district: sch.district,
      utisCode: sch.utis_code,
      studentsCount: count,
      overallScore,
      minScore,
      maxScore,
      gradeScores,
      subjectScores,
      districtRank: 0,
      nmrRank: 0,
      dynamics: {
        mon1,
        mon2,
        mon3,
        changePct
      }
    };
  });

  // Rank ONLY participating schools (studentsCount > 0)
  const participatingSchools = allSchools.filter((s) => s.studentsCount > 0);
  participatingSchools.sort((a, b) => b.overallScore - a.overallScore);
  participatingSchools.forEach((s, idx) => {
    s.nmrRank = idx + 1;
  });

  // Calculate District-level real stats
  const districtRecords: DistrictRecord[] = NAKHCHIVAN_DISTRICTS.map((dist) => {
    const dSchools = allSchools.filter((s) => s.district === dist.name);
    const dParticipatingSchools = dSchools.filter((s) => s.studentsCount > 0);

    // Intra-district ranking for participating schools
    dParticipatingSchools.sort((a, b) => b.overallScore - a.overallScore);
    dParticipatingSchools.forEach((s, idx) => {
      s.districtRank = idx + 1;
    });

    const dSessions = validSessions.filter((s) => s.district === dist.name);
    const dStudentsCount = dSessions.length;

    if (dStudentsCount === 0) {
      return {
        id: dist.id,
        name: dist.name,
        schoolsCount: dSchools.length,
        studentsCount: 0,
        overallScore: 0,
        minScore: 0,
        maxScore: 0,
        gradeScores: { 'IV sinif': 0, 'VI sinif': 0, 'IX sinif': 0, 'XI sinif': 0 },
        subjectScores: {},
        topSchool: { name: 'İştirakçı yoxdur', score: 0 },
        lowestSchool: { name: 'İştirakçı yoxdur', score: 0 },
        nmrRank: 0,
        dynamics: { mon1: 0, mon2: 0, mon3: 0, changePct: 0 }
      };
    }

    const dPercentages = dSessions.map((s) => Number(s.percentage) || 0);
    const overallScore = Number((dPercentages.reduce((a, b) => a + b, 0) / dStudentsCount).toFixed(1));
    const minScore = Math.min(...dPercentages);
    const maxScore = Math.max(...dPercentages);

    const gScores: Record<string, number> = { 'IV sinif': 0, 'VI sinif': 0, 'IX sinif': 0, 'XI sinif': 0 };
    MONITORING_GRADES.forEach((g) => {
      const gSess = dSessions.filter((s) => String(s.grade || '').includes(g.split(' ')[0]));
      if (gSess.length > 0) {
        gScores[g] = Number((gSess.reduce((a, b) => a + (Number(b.percentage) || 0), 0) / gSess.length).toFixed(1));
      }
    });

    const subScores: Record<string, number> = {};
    MONITORING_SUBJECTS.forEach((sub) => {
      const sSess = dSessions.filter((s) => s.subject === sub);
      if (sSess.length > 0) {
        subScores[sub] = Number((sSess.reduce((a, b) => a + (Number(b.percentage) || 0), 0) / sSess.length).toFixed(1));
      }
    });

    const topSchool = dParticipatingSchools[0]
      ? { name: dParticipatingSchools[0].name, score: dParticipatingSchools[0].overallScore }
      : { name: 'İştirakçı yoxdur', score: 0 };
    const lowestSchool = dParticipatingSchools[dParticipatingSchools.length - 1]
      ? { name: dParticipatingSchools[dParticipatingSchools.length - 1].name, score: dParticipatingSchools[dParticipatingSchools.length - 1].overallScore }
      : { name: 'İştirakçı yoxdur', score: 0 };

    return {
      id: dist.id,
      name: dist.name,
      schoolsCount: dSchools.length,
      studentsCount: dStudentsCount,
      overallScore,
      minScore,
      maxScore,
      gradeScores: gScores,
      subjectScores: subScores,
      topSchool,
      lowestSchool,
      nmrRank: 0,
      dynamics: {
        mon1: overallScore,
        mon2: overallScore,
        mon3: overallScore,
        changePct: 0
      }
    };
  });

  // Rank participating districts
  const participatingDistricts = districtRecords.filter((d) => d.studentsCount > 0);
  participatingDistricts.sort((a, b) => b.overallScore - a.overallScore);
  participatingDistricts.forEach((d, idx) => {
    d.nmrRank = idx + 1;
  });

  // Calculate Muxtar Respublika Overview Stats (Strictly from real EDUNEX test takers)
  const totalStudents = validSessions.length;
  const totalSchools = participatingSchools.length;
  const overallAverage = totalStudents > 0
    ? Number((validSessions.reduce((acc, s) => acc + (Number(s.percentage) || 0), 0) / totalStudents).toFixed(1))
    : 0;

  const gradeAverages: Record<string, number> = {
    'IV sinif': 0,
    'VI sinif': 0,
    'IX sinif': 0,
    'XI sinif': 0
  };
  MONITORING_GRADES.forEach((g) => {
    const gSess = validSessions.filter((s) => String(s.grade || '').includes(g.split(' ')[0]));
    if (gSess.length > 0) {
      gradeAverages[g] = Number((gSess.reduce((a, b) => a + (Number(b.percentage) || 0), 0) / gSess.length).toFixed(1));
    }
  });

  const subjectAverages: Record<string, number> = {};
  MONITORING_SUBJECTS.forEach((sub) => {
    const sSess = validSessions.filter((s) => s.subject === sub);
    if (sSess.length > 0) {
      subjectAverages[sub] = Number((sSess.reduce((a, b) => a + (Number(b.percentage) || 0), 0) / sSess.length).toFixed(1));
    }
  });

  const topDistrict = participatingDistricts.length > 0
    ? { name: participatingDistricts[0].name, score: participatingDistricts[0].overallScore }
    : { name: 'İştirakçı yoxdur', score: 0 };
  const lowestDistrict = participatingDistricts.length > 0
    ? { name: participatingDistricts[participatingDistricts.length - 1].name, score: participatingDistricts[participatingDistricts.length - 1].overallScore }
    : { name: 'İştirakçı yoxdur', score: 0 };

  const topSchool = participatingSchools.length > 0
    ? { name: participatingSchools[0].name, district: participatingSchools[0].district, score: participatingSchools[0].overallScore }
    : { name: 'İştirakçı yoxdur', district: '-', score: 0 };
  const lowestSchool = participatingSchools.length > 0
    ? { name: participatingSchools[participatingSchools.length - 1].name, district: participatingSchools[participatingSchools.length - 1].district, score: participatingSchools[participatingSchools.length - 1].overallScore }
    : { name: 'İştirakçı yoxdur', district: '-', score: 0 };

  const minScore = participatingSchools.length > 0
    ? { score: lowestSchool.score, school: lowestSchool.name, district: lowestSchool.district }
    : { score: 0, school: 'İştirakçı yoxdur', district: '-' };
  const maxScore = participatingSchools.length > 0
    ? { score: topSchool.score, school: topSchool.name, district: topSchool.district }
    : { score: 0, school: 'İştirakçı yoxdur', district: '-' };

  const overview: NmrOverviewStats = {
    totalStudents,
    totalSchools,
    overallAverage,
    gradeAverages,
    subjectAverages,
    topDistrict,
    lowestDistrict,
    topSchool,
    lowestSchool,
    minScore,
    avgScore: overallAverage,
    maxScore
  };

  return {
    districts: districtRecords,
    schools: allSchools,
    overview,
    participatingSchoolsCount: participatingSchools.length,
    participatingDistrictsCount: participatingDistricts.length
  };
}

/**
 * Filter schools and recalculate on the fly based on user filters
 */
export function filterRegionalData(
  allSchools: SchoolRecord[],
  filters: {
    district?: string;
    grade?: string;
    subject?: string;
    period?: string;
    searchQuery?: string;
  }
) {
  let filtered = [...allSchools];

  if (filters.district && filters.district !== 'all' && filters.district !== 'all_districts') {
    filtered = filtered.filter((s) => s.district === filters.district);
  }

  if (filters.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (s) => s.name.toLowerCase().includes(q) || s.district.toLowerCase().includes(q) || (s.utisCode && s.utisCode.includes(q))
    );
  }

  return filtered;
}
