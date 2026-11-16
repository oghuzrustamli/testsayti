// src/types/index.ts

export type UserRole = 'teacher' | 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  school?: string;
  status: 'active' | 'inactive' | 'suspended';
  is_pro: boolean;
  pro_expires_at?: string | null;
}

export type ExamModel = 
  | 'Buraxılış imtahanı'
  | 'Blok imtahanı'
  | 'Sinif imtahanı'
  | 'Məktəbdaxili test'
  | 'Şagird qrupu'
  | 'Liseylərə qəbul imtahanı';

export type GradingRule = 'standard' | 'negative_penalty' | 'proportional';
export type TestMode = 'interactive' | 'answered';
export type TestStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'archived';

export type QuestionType = 
  | 'single_choice'
  | 'open_ended'
  | 'situation'
  | 'multiple_choice'
  | 'true_false'
  | 'matching'
  | 'fill_blank'
  | 'numeric';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
  is_correct?: boolean;
}

export interface GraphCurve {
  id: string;
  type: 'linear' | 'quadratic' | 'modulus' | 'rational' | 'exponential' | 'logarithmic' | 'trigonometric' | 'piecewise' | 'circle' | 'triangle' | 'polygon' | 'point';
  a: number;
  b: number;
  c: number;
  k?: number;
  r?: number;
  points?: { x: number; y: number; label?: string }[];
  label?: string;
  color: string;
  customFormula?: string;
}

export interface GraphData {
  curves: GraphCurve[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  showGrid: boolean;
  showRoots: boolean;
  showVertex: boolean;
  showIntersections: boolean;
  imageDataUrl?: string;
}

export type SituationGradingMode = 'keywords_10' | 'dim_tiered';

export interface SituationEvaluationResult {
  score: number;
  max_points: number;
  percentage: number;
  grading_mode: SituationGradingMode;
  tier_label?: string;
  matched_keywords: Array<{ keyword: string; matched_term: string }>;
  missing_keywords: string[];
  ai_feedback: string;
  needs_review: boolean;
  teacher_override_score?: number | null;
}

export interface Question {
  id: string;
  teacher_id?: string;
  bank_id?: string | null;
  exam_model?: string;
  subject: string;
  topic?: string;
  grade?: number;
  question_text: string;
  question_type: QuestionType;
  options: QuestionOption[];
  correct_answer: string;
  points: number;
  explanation?: string;
  image_url?: string;
  graph_data?: GraphData | null;
  order_index?: number;
  situation_text?: string;
  situation_title?: string;
  situation_model_answer?: string;
  situation_keywords?: string[];
  situation_synonyms?: Record<string, string[]>;
  situation_grading_mode?: SituationGradingMode;
  situation_evaluation?: SituationEvaluationResult;
  sub_questions?: Question[];
}

export interface Test {
  id: string;
  teacher_id?: string;
  title: string;
  exam_model: ExamModel;
  grade_group: string;
  subject: string;
  topic: string;
  duration_minutes: number;
  total_questions: number;
  total_points: number;
  grading_rule: GradingRule;
  start_time?: string;
  end_time?: string;
  result_display_mode: 'immediate' | 'after_deadline' | 'manual';
  test_mode: TestMode;
  status: TestStatus;
  questions?: Question[];
  share_code?: string;
  is_link_active?: boolean;
  pdf_url?: string;
  answer_key_json?: string;
  completed_attempts?: number;
  avg_score?: number;
  max_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TestSession {
  id: string;
  test_id: string;
  student_name: string;
  student_surname: string;
  class_name?: string;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed' | 'timed_out';
  score: number;
  percentage: number;
  correct_count: number;
  incorrect_count: number;
  blank_count: number;
  duration_seconds: number;
  test_title?: string;
  subject?: string;
  exam_model?: string;
  total_questions?: number;
  total_points?: number;
}

export interface StudentAnswerDetail {
  question_id: string;
  selected_answer: string;
  is_correct: number;
  question_text: string;
  options: QuestionOption[];
  correct_answer: string;
  explanation?: string;
  image_url?: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  duration_months: number;
  amount_azn: number;
  is_used: number;
  used_by_user_id?: string;
  used_by_name?: string;
  used_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface ClassItem {
  id: string;
  name: string;
  grade: number;
  description?: string;
  student_count?: number;
}

export interface StudentItem {
  id: string;
  full_name: string;
  student_number: string;
  phone?: string;
  class_id?: string;
  class_name?: string;
  grade?: number;
}

export interface PdfQuestionItem {
  id: string;
  orderNumber: number;
  type: 'crop' | 'text';
  imageDataUrl?: string;
  questionText?: string;
  options?: QuestionOption[];
  correctAnswer?: string; // 'A', 'B', 'C', 'D', 'E'
  points?: number;
  explanation?: string;
}
