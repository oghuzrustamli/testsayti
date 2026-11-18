// src/lib/documentQuestionParser.ts
// EDUNEX Word (.docx, .doc) və PDF sənədlərindən test suallarını tanıyan intellektual parser mühərriki
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { Question, QuestionOption } from '../types';

export interface ParsedQuestionItem {
  id: string;
  number: number;
  question_text: string;
  options: QuestionOption[];
  correct_answer: string;
  subject: string;
  points: number;
  explanation?: string;
  selected: boolean;
}

/**
 * Extracts plain text from a Word document buffer (.docx)
 */
export async function extractTextFromWord(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  } catch (err: any) {
    throw new Error('Word sənədi oxuna bilmədi: ' + (err.message || 'Format xətası'));
  }
}

/**
 * Extracts plain text page by page from a PDF document buffer (.pdf)
 */
export async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    });
    const pdf = await loadingTask.promise;
    const pagesText: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map((item: any) => item.str || '');
      pagesText.push(pageStrings.join(' '));
    }

    return pagesText.join('\n\n');
  } catch (err: any) {
    throw new Error('PDF sənədi oxuna bilmədi: ' + (err.message || 'Format xətası'));
  }
}

/**
 * Parses raw text into structured questions, options, and correct answers
 */
export function parseQuestionsFromRawText(rawText: string, defaultSubject: string = 'Riyaziyyat'): ParsedQuestionItem[] {
  if (!rawText || !rawText.trim()) return [];

  // 1. Check for a dedicated answer key block at the bottom (e.g. "Cavablar: 1-A 2-B 3-C..." or "Açar: 1. A 2. B")
  const answerKeyMap = new Map<number, string>();
  const answerBlockRegex = /(?:Cavablar|Düzgün cavablar|Açar|Cavab açarı|Answers|Answer key)[:\s]+([\s\S]+)$/i;
  const matchAnswerBlock = rawText.match(answerBlockRegex);

  let textWithoutAnswerBlock = rawText;
  if (matchAnswerBlock) {
    const blockContent = matchAnswerBlock[1];
    textWithoutAnswerBlock = rawText.substring(0, matchAnswerBlock.index);

    // Find patterns like: 1-A, 1.A, 1) B, 1: C, etc.
    const keyPairRegex = /(\d+)\s*[\.\-\)\:]\s*([A-Ea-e])/g;
    let kp: RegExpExecArray | null;
    while ((kp = keyPairRegex.exec(blockContent)) !== null) {
      const qNum = parseInt(kp[1]);
      const ansLetter = kp[2].toUpperCase();
      answerKeyMap.set(qNum, ansLetter);
    }
  }

  // 2. Normalize line breaks and clean whitespace
  const normalizedText = textWithoutAnswerBlock
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u00A0/g, ' ')
    .trim();

  // 3. Split into candidate question chunks based on question numbering
  // Matches e.g. "1.", "1)", "1 -", "Sual 1:", "Test 1." at line boundaries or with preceding whitespace
  const lines = normalizedText.split('\n');
  const chunks: string[] = [];
  let currentChunk: string[] = [];

  const questionStartRegex = /^\s*(?:Sual\s+|Test\s+|Q\s*)?(\d+)[\.\)\-\:]\s*(.*)$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentChunk.length > 0) {
        currentChunk.push('');
      }
      continue;
    }

    if (questionStartRegex.test(trimmed)) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
      }
      currentChunk.push(line);
    } else {
      if (currentChunk.length > 0) {
        currentChunk.push(line);
      } else {
        // Preamble or header text before question 1
      }
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  // If numbering split didn't find multiple chunks, try paragraph split
  const rawChunks = chunks.length > 0 ? chunks : normalizedText.split(/\n\s*\n+/);

  const results: ParsedQuestionItem[] = [];

  rawChunks.forEach((chunk, index) => {
    const trimmedChunk = chunk.trim();
    if (!trimmedChunk) return;

    // Detect question number
    let questionNumber = index + 1;
    let body = trimmedChunk;

    const numMatch = trimmedChunk.match(/^\s*(?:Sual\s+|Test\s+|Q\s*)?(\d+)[\.\)\-\:]\s*/i);
    if (numMatch) {
      questionNumber = parseInt(numMatch[1]) || (index + 1);
      body = trimmedChunk.substring(numMatch[0].length).trim();
    }

    // Extract inline answer line if present (e.g., "Cavab: B" or "Düzgün cavab: C")
    let identifiedCorrectAnswer = answerKeyMap.get(questionNumber) || '';
    const answerInChunkRegex = /(?:Cavab|Düzgün cavab|Doğru cavab|Açar|Answer|Correct)[:\s\-]+([A-Ea-e])/i;
    const ansMatch = body.match(answerInChunkRegex);
    if (ansMatch) {
      identifiedCorrectAnswer = ansMatch[1].toUpperCase();
      // Remove the answer declaration from the question text
      body = body.replace(answerInChunkRegex, '').trim();
    }

    // Extract options: A, B, C, D, E
    // Robust sequential detection: find A, then B, then C, then D, then E
    const options: QuestionOption[] = [];
    let questionStem = body;

    // Pattern to find option headers: line-start or preceded by whitespace
    const headerRegex = /(?:^|\n|\r|[ \t]+)(?:(\*|\[x\]\s*))?([A-Ea-e])[\)\.\:\-][ \t]*/g;
    const rawMatches: Array<{ fullMatch: string; isMarked: boolean; letter: string; index: number; contentStartIndex: number }> = [];

    let hm: RegExpExecArray | null;
    while ((hm = headerRegex.exec(body)) !== null) {
      const isMarked = Boolean(hm[1]);
      const letter = hm[2].toUpperCase();
      const matchIndex = hm.index;
      const contentStartIndex = matchIndex + hm[0].length;
      rawMatches.push({
        fullMatch: hm[0],
        isMarked,
        letter,
        index: matchIndex,
        contentStartIndex
      });
    }

    // Verify sequential presence of A -> B -> C -> D -> (E)
    let seqMatches: typeof rawMatches = [];
    const expectedOrder = ['A', 'B', 'C', 'D', 'E'];
    let nextExpectedIdx = 0;

    for (const m of rawMatches) {
      if (m.letter === expectedOrder[nextExpectedIdx]) {
        seqMatches.push(m);
        nextExpectedIdx++;
      }
    }

    // Require at least A, B and C to form valid options
    if (seqMatches.length >= 2) {
      const firstOpt = seqMatches[0];
      questionStem = body.substring(0, firstOpt.index).trim();

      for (let i = 0; i < seqMatches.length; i++) {
        const cur = seqMatches[i];
        const next = seqMatches[i + 1];
        const optTextRaw = next
          ? body.substring(cur.contentStartIndex, next.index)
          : body.substring(cur.contentStartIndex);

        const cleanOptText = optTextRaw.replace(/\s+/g, ' ').trim();

        if (cur.isMarked && !identifiedCorrectAnswer) {
          identifiedCorrectAnswer = cur.letter;
        }

        options.push({
          id: cur.letter,
          text: cleanOptText || `Variant ${cur.letter}`,
          is_correct: false
        });
      }
    } else {
      // Line-by-line fallback parser
      const lines = body.split('\n');
      const stemLines: string[] = [];

      for (const line of lines) {
        const lineTrim = line.trim();
        const lineOptMatch = lineTrim.match(/^(\*|\[x\]\s*)?([A-Ea-e])[\)\.\:\-]\s*(.*)$/);
        if (lineOptMatch) {
          const isMarked = Boolean(lineOptMatch[1]);
          const label = lineOptMatch[2].toUpperCase();
          const text = lineOptMatch[3].trim();
          if (isMarked && !identifiedCorrectAnswer) {
            identifiedCorrectAnswer = label;
          }
          options.push({
            id: label,
            text,
            is_correct: false
          });
        } else if (options.length === 0) {
          stemLines.push(line);
        } else {
          if (options.length > 0) {
            options[options.length - 1].text += ' ' + lineTrim;
          }
        }
      }

      if (options.length >= 2) {
        questionStem = stemLines.join('\n').trim();
      }
    }

    // Default correct answer to A if not identified, or mark the identified one
    if (!identifiedCorrectAnswer && options.length > 0) {
      identifiedCorrectAnswer = options[0].id;
    }

    // Update is_correct flag in options
    options.forEach((opt) => {
      opt.is_correct = opt.id === identifiedCorrectAnswer;
    });

    // If options were not found (e.g. open question or simple text), provide standard 5 options or open
    if (options.length < 2) {
      options.length = 0;
      ['A', 'B', 'C', 'D', 'E'].forEach((label) => {
        options.push({
          id: label,
          text: `Variant ${label}`,
          is_correct: label === 'A'
        });
      });
      identifiedCorrectAnswer = 'A';
    }

    results.push({
      id: 'imp-' + Math.random().toString(36).substring(2, 9),
      number: questionNumber,
      question_text: questionStem || trimmedChunk,
      options,
      correct_answer: identifiedCorrectAnswer,
      subject: defaultSubject,
      points: 1,
      selected: true
    });
  });

  return results;
}

/**
 * Converts parsed questions to EDUNEX standard Question[] format
 */
export function convertParsedToQuestions(
  parsed: ParsedQuestionItem[],
  startIndex: number = 0
): Question[] {
  return parsed.map((p, idx) => ({
    id: p.id || 'q-' + Math.random().toString(36).substring(2, 9),
    subject: p.subject,
    topic: p.subject,
    question_text: p.question_text,
    question_type: p.options.length > 0 ? 'single_choice' : 'open_ended',
    options: p.options,
    correct_answer: p.correct_answer,
    points: p.points || 1,
    explanation: p.explanation || '',
    order_index: startIndex + idx
  }));
}
