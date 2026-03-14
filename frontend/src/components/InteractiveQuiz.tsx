import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, LayoutDashboard } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { useNavigate } from 'react-router-dom';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizData {
  title: string;
  topic: string;
  questions: QuizQuestion[];
}

interface InteractiveQuizProps {
  quiz: QuizData;
}

export default function InteractiveQuiz({ quiz }: InteractiveQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const navigate = useNavigate();
  const question = quiz.questions[currentIndex];

  const shuffledOptions = useMemo(() => {
    return [...question.options].sort(() => Math.random() - 0.5);
  }, [currentIndex, quiz]);

  const handleSelectOption = (option: string) => {
    if (isAnswerRevealed) return;
    
    setSelectedOption(option);
    setIsAnswerRevealed(true);

    if (option === question.correct_answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden my-4"
      >
        <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] px-6 py-8 text-center">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Quiz Complete!</h2>
          <p className="text-[#64748B] text-sm font-medium">{quiz.title}</p>
        </div>
        
        <div className="p-8 text-center">
          <div className="inline-flex justify-center items-center w-32 h-32 rounded-full border-8 border-[#EEF2FF] mb-6">
            <div className="text-4xl font-extrabold text-[#3B82F6]">
              {percentage}%
            </div>
          </div>
          
          <p className="text-[#334155] font-medium text-lg mb-8">
            You scored {score} out of {quiz.questions.length} accurately.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={resetQuiz}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-medium transition-colors"
            >
              <RotateCcw size={18} /> Retry Quiz
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] rounded-xl font-medium transition-colors"
            >
              <LayoutDashboard size={18} /> Return to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden my-4">
      {/* Header */}
      <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#0F172A]">{quiz.title}</h3>
          <p className="text-xs font-medium text-[#64748B] mt-0.5">{quiz.topic}</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-full border border-[#E5E7EB] text-xs font-semibold text-[#3B82F6]">
          Question {currentIndex + 1} of {quiz.questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-[#EEF2FF]">
        <motion.div 
          className="h-full bg-[#3B82F6]" 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Body */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Question */}
            <div className="text-[#0F172A] font-medium text-lg leading-relaxed mb-6">
              <MarkdownRenderer content={question.question} />
            </div>

            {/* Options */}
            <div className="space-y-3">
              {shuffledOptions.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrectOption = opt === question.correct_answer;
                
                let optionStyle = "border-[#E5E7EB] hover:border-[#3B82F6] hover:bg-[#EFF6FF]";
                let icon = null;

                if (isAnswerRevealed) {
                  if (isCorrectOption) {
                    optionStyle = "border-green-500 bg-green-50 text-green-800";
                    icon = <CheckCircle2 size={20} className="text-green-500 shrink-0" />;
                  } else if (isSelected) {
                    optionStyle = "border-red-500 bg-red-50 text-red-800";
                    icon = <XCircle size={20} className="text-red-500 shrink-0" />;
                  } else {
                    optionStyle = "border-[#E5E7EB] opacity-50";
                  }
                } else if (isSelected) {
                  optionStyle = "border-[#3B82F6] bg-[#EFF6FF]";
                }

                const labelMap = ['A', 'B', 'C', 'D', 'E'];

                return (
                  <button
                    key={i}
                    disabled={isAnswerRevealed}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 ${optionStyle}`}
                  >
                    <div className="mt-0.5 shrink-0 w-6 h-6 rounded-md bg-white border border-[#E5E7EB] flex items-center justify-center text-xs font-bold text-[#64748B] shadow-sm">
                      {labelMap[i]}
                    </div>
                    <div className="flex-1">
                      <MarkdownRenderer content={opt} />
                    </div>
                    {icon && <div className="mt-0.5">{icon}</div>}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next */}
            {isAnswerRevealed && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className={`p-4 rounded-xl mb-4 text-sm leading-relaxed ${
                  selectedOption === question.correct_answer 
                    ? "bg-green-50 text-green-800 border-l-4 border-green-500" 
                    : "bg-red-50 text-red-800 border-l-4 border-red-500"
                }`}>
                  <strong className="block mb-1 font-bold">
                    {selectedOption === question.correct_answer ? "Correct!" : "Incorrect."}
                  </strong>
                  <MarkdownRenderer content={question.explanation} />
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-medium transition-colors"
                  >
                    {currentIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
