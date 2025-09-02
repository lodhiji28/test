

import React, { useState, useCallback, useEffect } from 'react';
import { Question, QuizResults, AppPhase, UserAnswer, Language, GeneratedQuizData, QuestionStatus, GeneratedPresentationData } from './types';
import { 
  NUMBER_OF_QUESTIONS_TO_GENERATE, 
  QUIZ_TOTAL_TIME_SECONDS, 
  NEGATIVE_MARKING_PER_QUESTION, 
  SOUND_FILES, 
  CONFETTI_COLORS, 
  DEFAULT_LANGUAGE, 
  SUPPORTED_LANGUAGES, 
  DEFAULT_QUIZ_SECTION_NAME,
  QUESTION_COUNT_OPTIONS,
  DEFAULT_APP_NAME,
  DEFAULT_YOUTUBE_LINK,
  DEFAULT_TELEGRAM_LINK
} from './constants';
import TopicForm from '@/components/TopicForm';
import QuizReadyScreen from '@/components/QuizReadyScreen';
import InstructionsScreen from '@/components/InstructionsScreen';
import QuizArea from '@/components/QuizArea';
import ResultsDisplay from '@/components/ResultsDisplay';
import ReviewScreen from '@/components/ReviewScreen';
import { generateQuestions, generateQuestionsFromText } from '@/services/geminiQuizService'; 
import { generatePresentation } from '@/services/presentationService';
import { downloadQuizAsHtml } from '@/services/quizDownloader';

const playSound = (soundId: string) => {
  const sound = document.getElementById(soundId) as HTMLAudioElement | null;
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(error => console.warn(`Error playing sound ${soundId}:`, error));
  }
};

const createConfetti = () => {
  const confettiContainer = document.body;
  for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      confetti.style.left = Math.random() * 100 + 'vw';
      
      confettiContainer.appendChild(confetti);
      
      const animation = confetti.animate([
          { transform: 'translateY(-20px) rotate(0deg)', opacity: 1 },
          { transform: `translateY(${Math.random() * 500 + 500}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], { duration: Math.random() * 3000 + 2000, easing: 'cubic-bezier(.23,1,.32,1)' });
      
      animation.onfinish = () => confetti.remove();
  }
};


const QuizApplication: React.FC = () => {
  const [appPhase, setAppPhase] = useState<AppPhase>(AppPhase.TOPIC_INPUT);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [currentQuizTopic, setCurrentQuizTopic] = useState<string>(''); // Used for both quiz and presentation titles
  const [selectedNumQuestions, setSelectedNumQuestions] = useState<number>(NUMBER_OF_QUESTIONS_TO_GENERATE);
  const [isAutoDownloaded, setIsAutoDownloaded] = useState<boolean>(false);
  
  const [appName, setAppName] = useState<string>(DEFAULT_APP_NAME);
  const [youtubeLink, setYoutubeLink] = useState<string>(DEFAULT_YOUTUBE_LINK);
  const [telegramLink, setTelegramLink] = useState<string>(DEFAULT_TELEGRAM_LINK);

  const apiKey = process.env.API_KEY; 

  useEffect(() => {
    if (!apiKey) {
      setError("API Key is not configured. Please set the API_KEY environment variable.");
      setAppPhase(AppPhase.TOPIC_INPUT); 
    }
  }, [apiKey]);

  const handleLanguageChange = useCallback((lang: Language) => {
    setCurrentLanguage(lang);
  }, []);

  const handleNumQuestionsChange = useCallback((count: number) => {
    setSelectedNumQuestions(count);
  }, []);

  const handleAppNameChange = useCallback((newName: string) => setAppName(newName), []);
  const handleYoutubeLinkChange = useCallback((newLink: string) => setYoutubeLink(newLink), []);
  const handleTelegramLinkChange = useCallback((newLink: string) => setTelegramLink(newLink), []);


  const handleTopicSubmit = useCallback(async (topicInput: string) => {
    if (!apiKey) {
      setError("API Key is not configured. Cannot fetch questions.");
      return;
    }
    setAppPhase(AppPhase.LOADING_QUESTIONS);
    setError(null);
    try {
      const selectedLangName = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name || 'English';
      const generatedData: GeneratedQuizData = await generateQuestions(topicInput, selectedNumQuestions, apiKey, selectedLangName);
      
      setQuizQuestions(generatedData.questions);
      setCurrentQuizTopic(generatedData.quizTitle);

      const timeForQuiz = Math.floor(selectedNumQuestions * (QUIZ_TOTAL_TIME_SECONDS / NUMBER_OF_QUESTIONS_TO_GENERATE));
      downloadQuizAsHtml(
        generatedData.quizTitle,
        generatedData.questions,
        timeForQuiz,
        NEGATIVE_MARKING_PER_QUESTION,
        appName,
        youtubeLink,
        telegramLink,
        currentLanguage
      );
      setIsAutoDownloaded(true);
      
      setAppPhase(AppPhase.QUIZ_READY); 
    } catch (err) {
      console.error("Failed to generate questions from topic:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching questions from topic.");
      setAppPhase(AppPhase.TOPIC_INPUT);
    }
  }, [apiKey, currentLanguage, selectedNumQuestions, appName, youtubeLink, telegramLink]);

  const handlePastedTextSubmit = useCallback(async (pastedText: string, customInstructions: string) => {
    if (!apiKey) {
      setError("API Key is not configured. Cannot fetch questions.");
      return;
    }
    setAppPhase(AppPhase.LOADING_QUESTIONS);
    setError(null);
    try {
      const selectedLangName = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name || 'English';
      const generatedData: GeneratedQuizData = await generateQuestionsFromText(
        pastedText, 
        customInstructions, 
        selectedNumQuestions, 
        apiKey, 
        selectedLangName
      );
      
      setQuizQuestions(generatedData.questions);
      setCurrentQuizTopic(generatedData.quizTitle);
      
      const timeForQuiz = Math.floor(selectedNumQuestions * (QUIZ_TOTAL_TIME_SECONDS / NUMBER_OF_QUESTIONS_TO_GENERATE));
      downloadQuizAsHtml(
        generatedData.quizTitle,
        generatedData.questions,
        timeForQuiz,
        NEGATIVE_MARKING_PER_QUESTION,
        appName,
        youtubeLink,
        telegramLink,
        currentLanguage
      );
      setIsAutoDownloaded(true);

      setAppPhase(AppPhase.QUIZ_READY); 
    } catch (err) {
      console.error("Failed to generate questions from text:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching questions from text.");
      setAppPhase(AppPhase.TOPIC_INPUT);
    }
  }, [apiKey, currentLanguage, selectedNumQuestions, appName, youtubeLink, telegramLink]);

  const handlePresentationSubmit = useCallback(async (input: string, type: 'topic' | 'text', customInstructions?: string) => {
    if (!apiKey) {
      setError("API Key is not configured. Cannot generate presentation.");
      return;
    }
    setAppPhase(AppPhase.LOADING_PRESENTATION);
    setError(null);
    setCurrentQuizTopic(type === 'topic' ? input : 'Pasted Text Content'); // Set a generic or derived title

    try {
      const langName = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name || 'English';
      await generatePresentation(input, type, langName, apiKey, customInstructions);
      // After download is initiated by generatePresentation, return to topic input
      setAppPhase(AppPhase.TOPIC_INPUT);
       alert('Presentation generation initiated! Check your downloads.');
    } catch (err)
      {
      console.error("Failed to generate presentation:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while generating the presentation.");
      setAppPhase(AppPhase.TOPIC_INPUT);
    }
  }, [apiKey, currentLanguage]);

  const dynamicQuizTotalTime = Math.floor(selectedNumQuestions * (QUIZ_TOTAL_TIME_SECONDS / NUMBER_OF_QUESTIONS_TO_GENERATE));

  const handleDownloadQuiz = useCallback(() => {
    if (quizQuestions.length > 0 && currentQuizTopic) {
      downloadQuizAsHtml(
        currentQuizTopic,
        quizQuestions,
        dynamicQuizTotalTime,
        NEGATIVE_MARKING_PER_QUESTION,
        appName,
        youtubeLink,
        telegramLink,
        currentLanguage
      );
    } else {
      setError("Cannot download quiz. Quiz data is not available.");
    }
  }, [quizQuestions, currentQuizTopic, dynamicQuizTotalTime, appName, youtubeLink, telegramLink, currentLanguage]);


  const initializeUserAnswers = useCallback(() => {
     setUserAnswers(quizQuestions.map(q => ({ 
        questionId: q.id, 
        selectedOptionIndex: null, 
        timeTakenSeconds: 0,
        status: QuestionStatus.NotVisited,
        isMarked: false 
      })));
  }, [quizQuestions]);

  const handleProceedToInstructions = useCallback(() => {
    setAppPhase(AppPhase.INSTRUCTIONS);
  }, []);

  const handleStartQuizActual = useCallback(() => {
    initializeUserAnswers();
    setAppPhase(AppPhase.QUIZ_ACTIVE);
  }, [initializeUserAnswers]);
  

  const handleQuizSubmit = useCallback((finalAnswers: UserAnswer[]) => {
    setUserAnswers(finalAnswers);
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let score = 0;
    let negativeMarksApplied = 0;
    let totalTimeSpentOnAttempted = 0;
    let attemptedQuestionsCount = 0;

    const timePerQuestionDetailed = finalAnswers.map(ua => {
        const question = quizQuestions.find(q => q.id === ua.questionId);
        if (!question) return { questionId: ua.questionId, time: ua.timeTakenSeconds, status: 'unattempted' as const };

        if (ua.selectedOptionIndex === null) {
            unattempted++;
            return { questionId: ua.questionId, time: ua.timeTakenSeconds, status: 'unattempted' as const };
        } else {
            attemptedQuestionsCount++;
            totalTimeSpentOnAttempted += ua.timeTakenSeconds;
            if (ua.selectedOptionIndex === question.correctIndex) {
                correct++;
                score++; 
                return { questionId: ua.questionId, time: ua.timeTakenSeconds, status: 'correct' as const };
            } else {
                incorrect++;
                score -= NEGATIVE_MARKING_PER_QUESTION; 
                negativeMarksApplied += NEGATIVE_MARKING_PER_QUESTION;
                return { questionId: ua.questionId, time: ua.timeTakenSeconds, status: 'incorrect' as const };
            }
        }
    });
    
    const totalQuestions = quizQuestions.length;
    score = Math.max(0, score);
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    const avgTimePerQuestion = attemptedQuestionsCount > 0 ? totalTimeSpentOnAttempted / attemptedQuestionsCount : 0;

    const results: QuizResults = {
        correct,
        incorrect,
        unattempted,
        score: parseFloat(score.toFixed(2)),
        negativeMarksApplied: parseFloat(negativeMarksApplied.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(1)),
        totalQuestions,
        avgTimePerQuestion,
        timePerQuestionDetailed
    };
    setQuizResults(results);
    setAppPhase(AppPhase.QUIZ_COMPLETED);

    if (percentage >= 70) {
      playSound(SOUND_FILES.CORRECT);
      createConfetti();
    } else if (percentage < 50 && totalQuestions > 0) {
      playSound(SOUND_FILES.WRONG);
    }
  }, [quizQuestions]);

  const handleReviewAnswers = useCallback(() => {
    setAppPhase(AppPhase.REVIEW_ANSWERS);
  }, []);

  const handleStartNewQuiz = useCallback(() => {
    setQuizQuestions([]);
    setUserAnswers([]);
    setQuizResults(null);
    setError(null);
    setCurrentQuizTopic('');
    setIsAutoDownloaded(false);
    setAppPhase(AppPhase.TOPIC_INPUT);
  }, []);

  const handleReattemptQuiz = useCallback(() => {
    if (quizQuestions.length > 0) {
      initializeUserAnswers();
      setAppPhase(AppPhase.QUIZ_ACTIVE);
    }
  }, [quizQuestions, initializeUserAnswers]);
  
  const displayQuizTitle = currentQuizTopic ? `${appName} - ${currentQuizTopic}` : appName;


  const renderContent = () => {
    switch (appPhase) {
      case AppPhase.TOPIC_INPUT:
      case AppPhase.LOADING_QUESTIONS:
      case AppPhase.LOADING_PRESENTATION:
        return <TopicForm 
                  onTopicSubmit={handleTopicSubmit} 
                  onTextSubmit={handlePastedTextSubmit}
                  onPresentationSubmit={handlePresentationSubmit}
                  error={error} 
                  isLoading={appPhase === AppPhase.LOADING_QUESTIONS || appPhase === AppPhase.LOADING_PRESENTATION} 
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                  currentNumberOfQuestions={selectedNumQuestions}
                  onNumberOfQuestionsChange={handleNumQuestionsChange}
                  numberOfQuestionsOptions={QUESTION_COUNT_OPTIONS}
                  currentAppName={appName}
                  onAppNameChange={handleAppNameChange}
                  currentYoutubeLink={youtubeLink}
                  onYoutubeLinkChange={handleYoutubeLinkChange}
                  currentTelegramLink={telegramLink}
                  onTelegramLinkChange={handleTelegramLinkChange}
                />;
      case AppPhase.QUIZ_READY:
        return <QuizReadyScreen
                  quizTitle={currentQuizTopic} 
                  appName={appName} 
                  onStartQuiz={handleProceedToInstructions}
                  onDownloadQuiz={handleDownloadQuiz}
                  onGoBack={handleStartNewQuiz} 
                  isAutoDownloaded={isAutoDownloaded}
                />;
      case AppPhase.INSTRUCTIONS:
        return <InstructionsScreen
                  quizTitle={currentQuizTopic}
                  language={currentLanguage}
                  totalTimeInSeconds={dynamicQuizTotalTime} 
                  numberOfQuestions={selectedNumQuestions} 
                  negativeMarkingPerQuestion={NEGATIVE_MARKING_PER_QUESTION}
                  onProceed={handleStartQuizActual}
                  onBack={() => setAppPhase(AppPhase.QUIZ_READY)}
                />;
      case AppPhase.QUIZ_ACTIVE:
        return <QuizArea 
                  questions={quizQuestions} 
                  totalTime={dynamicQuizTotalTime} 
                  onSubmit={handleQuizSubmit} 
                  playSound={playSound}
                  quizTopic={currentQuizTopic} 
                  displayTitle={displayQuizTitle} 
                  initialUserAnswers={userAnswers} 
                />;
      case AppPhase.QUIZ_COMPLETED:
        return quizResults && <ResultsDisplay 
                                results={quizResults} 
                                onReview={handleReviewAnswers} 
                                onReattemptThisQuiz={handleReattemptQuiz}
                                onStartNewQuiz={handleStartNewQuiz}
                                youtubeLink={youtubeLink}
                                telegramLink={telegramLink}
                              />;
      case AppPhase.REVIEW_ANSWERS:
        if (!quizResults || quizQuestions.length === 0) {
            return <TopicForm 
                    onTopicSubmit={handleTopicSubmit} 
                    onTextSubmit={handlePastedTextSubmit}
                    onPresentationSubmit={handlePresentationSubmit}
                    error={"Cannot review answers. Quiz data not found. Please start a new quiz."} 
                    isLoading={false} 
                    currentLanguage={currentLanguage}
                    onLanguageChange={handleLanguageChange}
                    currentNumberOfQuestions={selectedNumQuestions}
                    onNumberOfQuestionsChange={handleNumQuestionsChange}
                    numberOfQuestionsOptions={QUESTION_COUNT_OPTIONS}
                    currentAppName={appName}
                    onAppNameChange={handleAppNameChange}
                    currentYoutubeLink={youtubeLink}
                    onYoutubeLinkChange={handleYoutubeLinkChange}
                    currentTelegramLink={telegramLink}
                    onTelegramLinkChange={handleTelegramLinkChange}
                   />;
        }
        return <ReviewScreen 
                  quizTitle={displayQuizTitle} 
                  questions={quizQuestions}
                  userAnswers={userAnswers}
                  quizResults={quizResults}
                  onExitReview={() => setAppPhase(AppPhase.QUIZ_COMPLETED)}
                  currentLanguage={currentLanguage}
                />;
      default:
        return <TopicForm 
                  onTopicSubmit={handleTopicSubmit}
                  onTextSubmit={handlePastedTextSubmit}
                  onPresentationSubmit={handlePresentationSubmit}
                  error={error} 
                  isLoading={false} 
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                  currentNumberOfQuestions={selectedNumQuestions}
                  onNumberOfQuestionsChange={handleNumQuestionsChange}
                  numberOfQuestionsOptions={QUESTION_COUNT_OPTIONS}
                  currentAppName={appName}
                  onAppNameChange={handleAppNameChange}
                  currentYoutubeLink={youtubeLink}
                  onYoutubeLinkChange={handleYoutubeLinkChange}
                  currentTelegramLink={telegramLink}
                  onTelegramLinkChange={handleTelegramLinkChange}
                />;
    }
  };

  const mainContentWrapperClass = appPhase === AppPhase.TOPIC_INPUT || 
                                appPhase === AppPhase.LOADING_QUESTIONS ||
                                appPhase === AppPhase.LOADING_PRESENTATION ||
                                appPhase === AppPhase.QUIZ_READY ||
                                appPhase === AppPhase.INSTRUCTIONS
                                ? "" 
                                : "bg-white shadow-xl rounded-lg overflow-hidden";


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <main className={`flex-grow container mx-auto py-3 px-2 md:px-0 ${ (appPhase !== AppPhase.QUIZ_ACTIVE && appPhase !== AppPhase.REVIEW_ANSWERS) ? 'flex items-center justify-center' : ''}`}>
        <div className={mainContentWrapperClass}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Ensure QuizApplication is exported as a named export
export { QuizApplication };

// Removed default export
// export default QuizApplication;