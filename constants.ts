import { Language } from './types';

export const NUMBER_OF_QUESTIONS_TO_GENERATE = 50; // Default number of questions
export const QUESTION_COUNT_OPTIONS = [25, 50, 75, 100]; // Options for the dropdown

export const QUIZ_TOTAL_TIME_SECONDS = 30 * 60; // 30 minutes for 50 questions
export const NEGATIVE_MARKING_PER_QUESTION = 1/3; // Changed from 0.25
export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash';
export const DEFAULT_QUIZ_SECTION_NAME = "General Knowledge"; // Added default

export const SOUND_FILES = {
  CLICK: 'clickSound',
  SWIPE: 'swipeSound',
  CORRECT: 'correctSound',
  WRONG: 'wrongSound',
};

export const CONFETTI_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#da70d6'];

export const DEFAULT_LANGUAGE: Language = 'hi';
export const SUPPORTED_LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

export const DEFAULT_APP_NAME = "Apni Taiyarii";
export const DEFAULT_YOUTUBE_LINK = "https://www.youtube.com/@apnitaiyarii";
export const DEFAULT_TELEGRAM_LINK = "https://t.me/apnitaiyarii";


export const INSTRUCTION_STRINGS = {
  en: {
    screenTitle: "Quiz Instructions",
    quizNamePrefix: "Quiz Name:",
    totalTime: (time: number) => `Time: ${time} Minutes`,
    totalMarks: (marks: number) => `Max Marks: ${marks}`,
    instructionsHeader: "Please read the following instructions carefully:",
    instruction1: (numQuestions: number) => `The quiz consists of ${numQuestions} questions.`,
    instruction2: "Each question has 4 options, out of which only 1 is correct.",
    instruction3: (time: number) => `You will have ${time} minutes to complete the quiz.`,
    instruction4: (negMarking: number) => `There is negative marking for incorrect answers. ${negMarking.toFixed(2)} marks will be deducted for each wrong answer.`,
    instruction5: "1 mark will be awarded for each correct answer.",
    instruction6: "No marks will be deducted for unattempted questions.",
    instruction7: "Please ensure you complete the quiz before submitting or closing the browser.",
    defaultLangMessage: (langName: string) => `Your default language for the quiz is: ${langName}`,
    defaultLangDisclaimer: "All questions will be displayed in this language. This cannot be changed later.",
    agreeCheckboxLabel: "I have read and understood all the instructions and agree to abide by them.",
    proceedButton: "I am ready to begin",
    backButton: "Go Back",
  },
  hi: {
    screenTitle: "परीक्षा निर्देश",
    quizNamePrefix: "परीक्षा का नाम:",
    totalTime: (time: number) => `समय: ${time} मिनट`,
    totalMarks: (marks: number) => `पूर्णांक: ${marks}`,
    instructionsHeader: "कृपया निम्नलिखित निर्देशों को ध्यानपूर्वक पढ़ें:",
    instruction1: (numQuestions: number) => `परीक्षा में ${numQuestions} प्रश्न हैं।`,
    instruction2: "प्रत्येक प्रश्न में दिए गए 4 विकल्पों में से केवल 1 विकल्प सही उत्तर के रूप में उपलब्ध होगा।",
    instruction3: (time: number) => `आपको परीक्षा समाप्त करने के लिए ${time} मिनट का समय मिलेगा।`,
    instruction4: (negMarking: number) => `गलत उत्तर पर नकारात्मक अंकन है: प्रत्येक गलत उत्तर के लिए ${negMarking.toFixed(2)} अंक काटे जाएंगे।`,
    instruction5: "प्रत्येक सही उत्तर के लिए 1 अंक दिया जाएगा।",
    instruction6: "प्रयास न किए गए प्रश्नों के लिए कोई अंक नहीं काटा जाएगा।",
    instruction7: "कृपया सुनिश्चित करें कि आप परीक्षा सबमिट करने से पहले या ब्राउज़र को बंद करने से पहले परीक्षा पूरी कर लें।",
    defaultLangMessage: (langName: string) => `आपकी परीक्षा की डिफ़ॉल्ट भाषा है: ${langName}`,
    defaultLangDisclaimer: "सभी प्रश्न इसी भाषा में प्रदर्शित होंगे। इसे बाद में बदला नहीं जा सकता।",
    agreeCheckboxLabel: "मैंने सभी निर्देशों को ध्यान से पढ़ लिया है और समझ लिया है, और मैं उनका पालन करने के लिए सहमत हूं।",
    proceedButton: "मैं शुरू करने के लिए तैयार हूं",
    backButton: "पीछे जाएं",
  }
};