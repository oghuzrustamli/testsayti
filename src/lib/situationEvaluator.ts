// src/lib/situationEvaluator.ts
import { SituationGradingMode, SituationEvaluationResult } from '../types';

/**
 * Normalizes Azerbaijani text for semantic matching:
 * - Converts to lower case
 * - Uniformly handles Azerbaijani letters (ə, ı, ö, ğ, ç, ş, ü)
 * - Removes punctuation marks and excessive whitespace
 */
export function normalizeAzText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»—–\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Common Azerbaijani inflectional suffixes to strip for root comparison:
 * Plural, Cases, Possessive, Copula/predicative, etc.
 */
const AZ_SUFFIX_REGEX = /(lardakı|lərdəki|dakı|dəki|larımız|lərimiz|larımızda|lərimizdə|larınız|ləriniz|lardan|lərdən|larda|lərdə|ların|lərin|lara|lərə|ları|ləri|ından|indən|undan|ündən|sından|sindən|sundan|sündən|ında|ində|unda|ündə|sında|sində|sunda|sündə|ın|in|un|ün|nın|nin|nun|nün|dan|dən|tan|tən|ya|yə|na|nə|da|də|ta|tə|dan|dən|a|ə|lar|lər|mız|miz|muz|müz|nız|niz|nuz|nüz|si|sı|su|sü|ni|nı|nu|nü|i|ı|u|ü|lə|la|nan|nən|dir|dır|dur|dür|tir|tır|tur|tür|lıq|lik|luq|lük|lı|li|lu|lü|suz|süz|sız|siz|maq|mək|araq|ərək|anda|əndə|arkən|ərkən|ınca|incə|dıqda|dikdə|duqda|dükdə|ır|ir|ur|ür|ar|ər|yır|yir|yur|yür|acaq|əcək|yacaq|yəcək|malı|məli|sa|sə|mış|miş|muş|müş|dı|di|du|dü)$/i;

export function stemAzWord(word: string): string {
  const clean = normalizeAzText(word).replace(/\s+/g, '');
  if (clean.length <= 3) return clean;

  let stemmed = clean;
  // Apply suffix stripping up to 2 passes (e.g. kitablardan -> kitablar -> kitab)
  for (let pass = 0; pass < 2; pass++) {
    if (stemmed.length > 3) {
      const replaced = stemmed.replace(AZ_SUFFIX_REGEX, '');
      if (replaced.length >= 3) {
        stemmed = replaced;
      } else {
        break;
      }
    }
  }
  return stemmed;
}

/**
 * Checks if a specific keyword or any of its synonyms is semantically present in student's answer
 */
export function matchKeywordInText(
  keyword: string,
  synonyms: string[] = [],
  studentAnswer: string
): { isMatched: boolean; matchedTerm: string } {
  if (!keyword || !studentAnswer) return { isMatched: false, matchedTerm: '' };

  const normAnswer = normalizeAzText(studentAnswer);
  const answerWords = normAnswer.split(' ').filter(Boolean);
  const stemmedAnswerWords = answerWords.map(stemAzWord);

  const candidateTerms = [keyword, ...synonyms].map(t => t.trim()).filter(Boolean);

  for (const term of candidateTerms) {
    const normTerm = normalizeAzText(term);
    const termWords = normTerm.split(' ').filter(Boolean);

    // 1. Exact substring match
    if (normAnswer.includes(normTerm)) {
      return { isMatched: true, matchedTerm: term };
    }

    // 2. Single-word stemmed match
    if (termWords.length === 1) {
      const stemmedTerm = stemAzWord(termWords[0]);
      if (stemmedAnswerWords.some(sw => sw === stemmedTerm || (sw.length >= 4 && (sw.startsWith(stemmedTerm) || stemmedTerm.startsWith(sw))))) {
        return { isMatched: true, matchedTerm: term };
      }
    } else {
      // 3. Multi-word phrase matching (consecutive or high co-occurrence)
      const stemmedTermWords = termWords.map(stemAzWord);
      let foundAll = true;
      for (const st of stemmedTermWords) {
        const hasWord = stemmedAnswerWords.some(sw => sw === st || (sw.length >= 4 && (sw.startsWith(st) || st.startsWith(sw))));
        if (!hasWord) {
          foundAll = false;
          break;
        }
      }
      if (foundAll) {
        return { isMatched: true, matchedTerm: term };
      }
    }
  }

  return { isMatched: false, matchedTerm: '' };
}

/**
 * Evaluates a student's written response to a situation question
 */
export function evaluateSituationAnswer(params: {
  studentAnswer: string;
  maxPoints: number;
  keywords: string[];
  synonymsMap?: Record<string, string[]>;
  gradingMode?: SituationGradingMode;
}): SituationEvaluationResult {
  const {
    studentAnswer = '',
    maxPoints = 6,
    keywords = [],
    synonymsMap = {},
    gradingMode = 'keywords_10'
  } = params;

  const validKeywords = (keywords || []).filter(k => k && k.trim() !== '');
  const matchedKeywords: Array<{ keyword: string; matched_term: string }> = [];
  const missingKeywords: string[] = [];

  for (const kw of validKeywords) {
    const syns = synonymsMap[kw] || [];
    const match = matchKeywordInText(kw, syns, studentAnswer);
    if (match.isMatched) {
      matchedKeywords.push({ keyword: kw, matched_term: match.matchedTerm });
    } else {
      missingKeywords.push(kw);
    }
  }

  const matchedCount = matchedKeywords.length;
  const totalKeywordsCount = Math.max(1, validKeywords.length);

  let score = 0;
  let percentage = 0;
  let tierLabel = '';

  if (gradingMode === 'dim_tiered') {
    // Mode B: DİM tipli pilləli qiymətləndirmə (0, 1/3, 1/2, 2/3, Tam bal)
    // Based on keyword density out of 10
    if (matchedCount <= 1) {
      score = 0;
      percentage = 0;
      tierLabel = '0 bal (Yetərsiz cavab)';
    } else if (matchedCount <= 3) {
      score = parseFloat(((maxPoints * 1) / 3).toFixed(1));
      percentage = 33;
      tierLabel = 'Maksimum balın 1/3-i';
    } else if (matchedCount <= 5) {
      score = parseFloat(((maxPoints * 1) / 2).toFixed(1));
      percentage = 50;
      tierLabel = 'Maksimum balın 1/2-si';
    } else if (matchedCount <= 7) {
      score = parseFloat(((maxPoints * 2) / 3).toFixed(1));
      percentage = 67;
      tierLabel = 'Maksimum balın 2/3-si';
    } else {
      score = maxPoints;
      percentage = 100;
      tierLabel = 'Maksimum balın hamısı (Tam bal)';
    }
  } else {
    // Mode A: Açar sözlərlə qiymətləndirmə (10 açar söz, hər biri 10%)
    percentage = Math.min(100, Math.round((matchedCount / 10) * 100));
    score = parseFloat(((percentage / 100) * maxPoints).toFixed(1));
    tierLabel = `${matchedCount}/10 açar söz (${percentage}%)`;
  }

  // Determine if ambiguous / needs teacher review
  const isTooShort = studentAnswer.trim().split(/\s+/).length < 4;
  const needsReview = isTooShort && matchedCount > 0 || (percentage >= 20 && percentage <= 60);

  // AI Feedback generation
  let aiFeedback = '';
  if (matchedCount === 10 || percentage >= 90) {
    aiFeedback = `Əla cavab! Situasiyada tələb olunan bütün əsas anlayışlar və açar sözlər tam və elmi cəhətdən düzgün izah edilmişdir.`;
  } else if (matchedCount >= 6 || percentage >= 60) {
    aiFeedback = `Yaxşı nəticə. Əsas anlayışların əksəriyyəti aşkar edildi (${matchedCount} açar söz). Lakin bəzi tamamlayıcı elmi detallar çatışmır.`;
  } else if (matchedCount >= 2 || percentage >= 20) {
    aiFeedback = `Qismən düzgün cavab. Bəzi açar sözlər istifadə olunub, lakin situasiyanın tam elmi mahiyyəti açılmayıb.`;
  } else {
    aiFeedback = `Cavab yetərsizdir. Situasiya üçün tələb olunan açar sözlər və əsas anlayışlar aşkar edilmədi.`;
  }

  return {
    score,
    max_points: maxPoints,
    percentage,
    grading_mode: gradingMode,
    tier_label: tierLabel,
    matched_keywords: matchedKeywords,
    missing_keywords: missingKeywords,
    ai_feedback: aiFeedback,
    needs_review: needsReview
  };
}
