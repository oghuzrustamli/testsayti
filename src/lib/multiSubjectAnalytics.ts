// src/lib/multiSubjectAnalytics.ts
// EDUNEX Çoxfənli Test Nəticələrinin Hesablanması və Analitikası
import { Question, QuestionOption } from '../types';

export interface SubjectStats {
  subject: string;
  total: number;
  correct: number;
  incorrect: number;
  blank: number;
  score: number;
  percentage: number;
}

export interface MultiSubjectEvaluation {
  subjects: SubjectStats[];
  overall: SubjectStats;
}

/**
 * Normalizes an answer string for robust comparison (handles cases, spaces, Azerbaijani commas/dots)
 */
export function normalizeAnswer(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  return str
    .toString()
    .trim()
    .replace(',', '.')
    .replace(/\s+/g, '')
    .toUpperCase();
}

/**
 * Checks if student answer matches the correct answer
 */
export function isAnswerCorrect(studentAns: any, correctAns: any): boolean {
  if (studentAns === undefined || studentAns === null || studentAns.toString().trim() === '') {
    return false;
  }
  const sNorm = normalizeAnswer(studentAns);
  const cNorm = normalizeAnswer(correctAns);

  if (sNorm === cNorm && sNorm !== '') return true;

  // Numeric float tolerance check (e.g. 0.75 vs 0,75)
  const sNum = parseFloat(sNorm);
  const cNum = parseFloat(cNorm);
  if (!isNaN(sNum) && !isNaN(cNum) && Math.abs(sNum - cNum) < 1e-9) {
    return true;
  }

  return false;
}

/**
 * Calculates per-subject and overall score breakdown for multi-subject test
 */
export function calculateMultiSubjectStats(
  questions: Question[],
  answers: Record<string, any>,
  gradingRule: string = 'standard'
): MultiSubjectEvaluation {
  // Group questions by subject
  const subjectMap = new Map<string, Question[]>();

  for (const q of questions) {
    const subName = (q.subject || 'Digər').trim() || 'Ümumi';
    if (!subjectMap.has(subName)) {
      subjectMap.set(subName, []);
    }
    subjectMap.get(subName)!.push(q);
  }

  const subjects: SubjectStats[] = [];

  let overallTotal = 0;
  let overallCorrect = 0;
  let overallIncorrect = 0;
  let overallBlank = 0;
  let overallScore = 0;

  subjectMap.forEach((qList, subName) => {
    let subCorrect = 0;
    let subIncorrect = 0;
    let subBlank = 0;
    let subScore = 0;

    for (const q of qList) {
      const studentAns = answers ? answers[q.id] : null;
      const pts = typeof q.points === 'number' && q.points > 0 ? q.points : 1;

      if (studentAns === undefined || studentAns === null || studentAns.toString().trim() === '') {
        subBlank++;
      } else if (isAnswerCorrect(studentAns, q.correct_answer)) {
        subCorrect++;
        subScore += pts;
      } else {
        subIncorrect++;
        if (gradingRule === 'negative_penalty') {
          // In Azerbaijan block/buraxilis exam: 4 wrongs subtract 1 correct (25% penalty)
          subScore -= pts * 0.25;
        }
      }
    }

    if (subScore < 0) subScore = 0;
    const maxSubPoints = qList.reduce((sum, q) => sum + (q.points || 1), 0) || 1;
    const subPercentage = parseFloat(((subScore / maxSubPoints) * 100).toFixed(1));

    subjects.push({
      subject: subName,
      total: qList.length,
      correct: subCorrect,
      incorrect: subIncorrect,
      blank: subBlank,
      score: parseFloat(subScore.toFixed(1)),
      percentage: Math.min(100, Math.max(0, subPercentage))
    });

    overallTotal += qList.length;
    overallCorrect += subCorrect;
    overallIncorrect += subIncorrect;
    overallBlank += subBlank;
    overallScore += subScore;
  });

  if (overallScore < 0) overallScore = 0;
  const maxOverallPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0) || 1;
  const overallPercentage = parseFloat(((overallScore / maxOverallPoints) * 100).toFixed(1));

  const overall: SubjectStats = {
    subject: 'Ümumi',
    total: overallTotal,
    correct: overallCorrect,
    incorrect: overallIncorrect,
    blank: overallBlank,
    score: parseFloat(overallScore.toFixed(1)),
    percentage: Math.min(100, Math.max(0, overallPercentage))
  };

  return { subjects, overall };
}
