// src/lib/regionalAnalytics.ts
// Naxçıvan Muxtar Respublikası Regional Təhsil Statistikası və Reytinq Hesablama Mühərriki
// YALNIZ VƏ YALNIZ EDUNEX PLATFORMASINDAN QEYDİYYATDAN KEÇƏN REAL ŞAGİRD VƏ İMTAHAN NƏTİCƏLƏRİNƏ ƏSASLANIR
import {
  NAKHCHIVAN_DISTRICTS,
  MONITORING_GRADES,
  MONITORING_SUBJECTS,
  DistrictRecord,
  SchoolRecord,
  StudentRankingItem,
  NmrOverviewStats,
  getAllSchools,
  SchoolRecordItem
} from './nakhchivanData';

export interface RegionalAnalyticsResult {
  districts: DistrictRecord[];
  schools: SchoolRecord[];
  students: StudentRankingItem[];
  overview: NmrOverviewStats;
  participatingSchoolsCount: number;
  participatingDistrictsCount: number;
  participatingStudentsCount: number;
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

  // ==========================================
  // 1. PROCESS STUDENTS (Birinci Mərhələ: Şagird Reytinqi)
  // ==========================================
  const studentMap: Record<string, any[]> = {};
  validSessions.forEach((sess) => {
    const rawUtis = (sess.utis_code || '').trim();
    const rawName = (sess.student_name || '').trim();
    const rawSurname = (sess.student_surname || '').trim();
    const rawSch = (sess.school || '').trim();
    const key = rawUtis ? `utis_${rawUtis}` : `name_${rawName}_${rawSurname}_${rawSch}`;

    if (!studentMap[key]) {
      studentMap[key] = [];
    }
    studentMap[key].push(sess);
  });

  const allStudents: StudentRankingItem[] = Object.entries(studentMap).map(([key, sList]) => {
    const first = sList[0];
    const fullName = `${first.student_name || ''} ${first.student_surname || ''}`.trim() || 'Adsız Şagird';
    const utisCode = first.utis_code || '';
    const district = first.district || '';
    const school = first.school || '';
    const grade = first.grade || '';
    const testsCount = sList.length;
    const totalScore = Number(sList.reduce((acc, s) => acc + (Number(s.score) || 0), 0).toFixed(1));
    const avgPercentage = Number((sList.reduce((acc, s) => acc + (Number(s.percentage) || 0), 0) / testsCount).toFixed(1));
    
    const correctAnswersCount = sList.reduce((acc, s) => acc + (Number(s.correct_count) || 0), 0);
    const totalAnswersCount = sList.reduce(
      (acc, s) => acc + (Number(s.correct_count) || 0) + (Number(s.incorrect_count) || 0) + (Number(s.blank_count) || 0),
      0
    );
    const accuracyPercentage = totalAnswersCount > 0
      ? Number(((correctAnswersCount / totalAnswersCount) * 100).toFixed(1))
      : avgPercentage;

    return {
      id: key,
      fullName,
      firstName: first.student_name || '',
      lastName: first.student_surname || '',
      utisCode,
      district,
      school,
      grade,
      testsCount,
      totalScore,
      avgPercentage,
      correctAnswersCount,
      totalAnswersCount,
      accuracyPercentage,
      schoolRank: 0,
      districtRank: 0,
      nmrRank: 0,
      lastCompletedAt: sList[sList.length - 1]?.completed_at
    };
  });

  // Compute NMR overall student ranking (Sort descending by avgPercentage, then totalScore)
  allStudents.sort((a, b) => b.avgPercentage - a.avgPercentage || b.totalScore - a.totalScore);
  allStudents.forEach((st, idx) => {
    st.nmrRank = idx + 1;
  });

  // Compute District student ranking
  NAKHCHIVAN_DISTRICTS.forEach((d) => {
    const dStudents = allStudents.filter((st) => st.district === d.name);
    dStudents.sort((a, b) => b.avgPercentage - a.avgPercentage || b.totalScore - a.totalScore);
    dStudents.forEach((st, idx) => {
      st.districtRank = idx + 1;
    });
  });

  // Compute School student ranking
  registeredSchools.forEach((sch) => {
    const schStudents = allStudents.filter((st) => st.school === sch.name);
    schStudents.sort((a, b) => b.avgPercentage - a.avgPercentage || b.totalScore - a.totalScore);
    schStudents.forEach((st, idx) => {
      st.schoolRank = idx + 1;
    });
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

  // ==========================================
  // 2. PROCESS SCHOOLS (İkinci Mərhələ: Məktəblərarası Reytinq)
  // ==========================================
  const allSchools: SchoolRecord[] = registeredSchools.map((sch) => {
    const sList = schoolSessionsMap[sch.name] || [];
    const count = sList.length;
    const schStudents = allStudents.filter((st) => st.school === sch.name);
    const uniqueStudentsCount = schStudents.length;

    if (count === 0) {
      // School has not participated in any exam in EDUNEX yet
      return {
        id: sch.id,
        name: sch.name,
        district: sch.district,
        utisCode: sch.utis_code,
        studentsCount: 0,
        totalTestsTaken: 0,
        totalScore: 0,
        overallScore: 0,
        successRate: 0,
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
    const totalScore = Number(sList.reduce((acc, s) => acc + (Number(s.score) || 0), 0).toFixed(1));
    const minScore = Math.min(...percentages);
    const maxScore = Math.max(...percentages);

    // Müvəffəqiyyət faizi (Toplanan bal faizi >= 60% olan şagirdlərin nisbəti)
    const successfulCount = percentages.filter((p) => p >= 60).length;
    const successRate = Number(((successfulCount / count) * 100).toFixed(1));

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
      studentsCount: uniqueStudentsCount || count,
      totalTestsTaken: count,
      totalScore,
      overallScore,
      successRate,
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

  // Rank ONLY participating schools (studentsCount > 0) across all Nakhchivan
  const participatingSchools = allSchools.filter((s) => s.studentsCount > 0);
  participatingSchools.sort((a, b) => b.overallScore - a.overallScore || b.successRate - a.successRate);
  participatingSchools.forEach((s, idx) => {
    s.nmrRank = idx + 1;
  });

  // ==========================================
  // 3. PROCESS DISTRICTS (Üçüncü Mərhələ: Rayonlararası Reytinq)
  // ==========================================
  const districtRecords: DistrictRecord[] = NAKHCHIVAN_DISTRICTS.map((dist) => {
    const dSchools = allSchools.filter((s) => s.district === dist.name);
    const dParticipatingSchools = dSchools.filter((s) => s.studentsCount > 0);

    // Intra-district ranking for participating schools
    dParticipatingSchools.sort((a, b) => b.overallScore - a.overallScore || b.successRate - a.successRate);
    dParticipatingSchools.forEach((s, idx) => {
      s.districtRank = idx + 1;
    });

    const dSessions = validSessions.filter((s) => s.district === dist.name);
    const dStudents = allStudents.filter((st) => st.district === dist.name);
    const dStudentsCount = dStudents.length || dSessions.length;
    const totalTestsTaken = dSessions.length;

    if (totalTestsTaken === 0) {
      return {
        id: dist.id,
        name: dist.name,
        schoolsCount: dSchools.length,
        participatingSchoolsCount: 0,
        studentsCount: 0,
        totalTestsTaken: 0,
        totalScore: 0,
        overallScore: 0,
        successRate: 0,
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
    const overallScore = Number((dPercentages.reduce((a, b) => a + b, 0) / totalTestsTaken).toFixed(1));
    const totalScore = Number(dSessions.reduce((acc, s) => acc + (Number(s.score) || 0), 0).toFixed(1));
    const minScore = Math.min(...dPercentages);
    const maxScore = Math.max(...dPercentages);

    const dSuccessfulCount = dPercentages.filter((p) => p >= 60).length;
    const successRate = Number(((dSuccessfulCount / totalTestsTaken) * 100).toFixed(1));

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
      participatingSchoolsCount: dParticipatingSchools.length,
      studentsCount: dStudentsCount,
      totalTestsTaken,
      totalScore,
      overallScore,
      successRate,
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

  // Rank participating districts (Prioritizing average percentage & success rate as requested in Tələb 5)
  const participatingDistricts = districtRecords.filter((d) => d.studentsCount > 0);
  participatingDistricts.sort((a, b) => b.overallScore - a.overallScore || b.successRate - a.successRate);
  participatingDistricts.forEach((d, idx) => {
    d.nmrRank = idx + 1;
  });

  // Calculate Muxtar Respublika Overview Stats (Strictly from real EDUNEX test takers)
  const totalStudents = allStudents.length;
  const totalSchools = participatingSchools.length;
  const overallAverage = validSessions.length > 0
    ? Number((validSessions.reduce((acc, s) => acc + (Number(s.percentage) || 0), 0) / validSessions.length).toFixed(1))
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
    students: allStudents,
    overview,
    participatingSchoolsCount: participatingSchools.length,
    participatingDistrictsCount: participatingDistricts.length,
    participatingStudentsCount: allStudents.length
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

/**
 * Filter students on the fly for Student Leaderboard
 */
export function filterStudentRankings(
  allStudents: StudentRankingItem[],
  filters: {
    district?: string;
    school?: string;
    grade?: string;
    searchQuery?: string;
  }
) {
  let filtered = [...allStudents];

  if (filters.district && filters.district !== 'all') {
    filtered = filtered.filter((s) => s.district === filters.district);
  }

  if (filters.school && filters.school !== 'all') {
    filtered = filtered.filter((s) => s.school === filters.school);
  }

  if (filters.grade && filters.grade !== 'all') {
    const targetGrade = filters.grade;
    filtered = filtered.filter((s) => s.grade === targetGrade || (s.grade && s.grade.includes(targetGrade.split(' ')[0])));
  }

  if (filters.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        (s.utisCode && s.utisCode.includes(q)) ||
        s.school.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
    );
  }

  return filtered;
}
