export type Language = 'en' | 'hi';

export interface Question {
  id: number;
  text: string;
  reference?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedQuizData {
  quizTitle: string;
  questions: Question[];
}

export enum QuestionStatus {
  NotVisited = 'notVisited',
  NotAnswered = 'notAnswered',
  Answered = 'answered',
  MarkedForReview = 'markedForReview',
  AnsweredAndMarked = 'answeredAndMarked',
}

export interface UserAnswer {
  questionId: number;
  selectedOptionIndex: number | null;
  timeTakenSeconds: number;
  status: QuestionStatus;
  isMarked: boolean;
}

export interface QuizResults {
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  negativeMarksApplied: number;
  percentage: number;
  totalQuestions: number;
  avgTimePerQuestion: number;
  timePerQuestionDetailed: { questionId: number, time: number, status: 'correct' | 'incorrect' | 'unattempted' }[];
}

export enum AppPhase {
  TOPIC_INPUT,
  LOADING_QUESTIONS,
  LOADING_PRESENTATION,
  QUIZ_READY, 
  INSTRUCTIONS, 
  QUIZ_ACTIVE,
  QUIZ_COMPLETED,
  REVIEW_ANSWERS,
}

export type FilterType = 'all' | 'correct' | 'incorrect' | 'unattempted';

export interface ReviewScreenFilterState {
  correct: boolean;
  incorrect: boolean;
  unattempted: boolean;
}

export type IconName = 'filter' | 'check' | 'xmark' | 'clock' | 'lightbulb' | 'chevronLeft' | 'chevronRight' | 'eye' | 'refreshCcw' | 'summary' | 'questionPaper' | 'youtube' | 'telegram' | 'fullScreen' | 'exitFullScreen' | 'toggleOn' | 'toggleOff' | 'save' | 'clear' | 'bookmark';

// --- Enhanced Types for Presentation Generation ---

export type SlideType = 
  | "TitleSlide"          // For the main presentation title & subtitle
  | "ContentSlide"        // For bullet points or general text content
  | "QuestionSlide"       // For a multiple-choice question with options
  | "ExplanationSlide"    // For a detailed explanation, possibly following a QuestionSlide
  | "SectionHeaderSlide"  // For introducing new sections within the presentation
  | "ImageSlide"          // Placeholder for future image integration - content would be image description
  | "ThankYouSlide";      // For a concluding slide

export interface SlideData {
  slideNumber: number;
  slideTitle: string;         // Title for the slide
  slideType: SlideType;
  content: string[];          // Main text content. 
                              // For TitleSlide: Subtitle (optional, as first element).
                              // For ContentSlide: Array of bullet points or paragraphs.
                              // For QuestionSlide: Question text (as first element).
                              // For ExplanationSlide: Explanation text paragraphs.
                              // For SectionHeaderSlide: Brief section description (optional).
  options?: string[];         // For QuestionSlide: Array of MCQs.
  correctOptionIndex?: number; // For QuestionSlide: 0-based index of the correct option.
  explanation?: string;       // For QuestionSlide: Detailed explanation for the answer. 
                              // Can also be used for additional context on other slides.
  notes?: string;             // Speaker notes for any slide (optional).
}

export interface GeneratedPresentationData {
  presentationTitle: string;
  slides: SlideData[];
}
