import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import MarkdownRenderer from './MarkdownRenderer';
import InteractiveQuiz, { type QuizData } from './InteractiveQuiz';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

import React from 'react';

export default React.memo(function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  let quizData: QuizData | null = null;
  if (!isUser) {
    let jsonString = '';
    
    // First try to extract from markdown block
    if (message.content.includes('```json')) {
      const match = message.content.match(/```json\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        jsonString = match[1];
      }
    } else if (message.content.trim().startsWith('{') && message.content.trim().endsWith('}')) {
      // Fallback: the LLM just returned a raw JSON object without markdown
      jsonString = message.content.trim();
    }

    if (jsonString) {
      try {
        // Robustly fix LLM unescaped LaTeX backslashes before parsing
        const sanitized = jsonString.replace(/\\\\|\\(["\\nrt])|\\/g, (match, validEscape) => {
          if (match === '\\\\') return '\\\\'; // Keep double backslashes unchanged
          if (validEscape) return match;       // Keep valid JSON escapes unchanged (e.g. \n, \")
          return '\\\\';                       // Double escape literal backslashes (e.g. \frac -> \\frac)
        });
        
        const parsed = JSON.parse(sanitized);
        if (parsed && Array.isArray(parsed.questions)) {
          quizData = parsed as QuizData;
        }
      } catch (e) {
        console.error("Failed to parse quiz JSON", e);
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={clsx("flex flex-1", isUser ? "flex-row-reverse max-w-[80%] ml-auto" : "flex-row")}>
        <div className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
          isUser ? "bg-[#3B82F6] text-white ml-3" : "bg-gradient-to-br from-[#6366F1] to-[#3B82F6] text-white mr-3"
        )}>
          {isUser ? <User size={16} /> : <Sparkles size={16} />}
        </div>
        
        <div className={clsx(
          "rounded-2xl border shadow-sm",
          isUser 
            ? "px-5 py-4 bg-[#3B82F6] text-white rounded-tr-sm border-[#2563EB] shadow-blue-500/10" 
            : quizData
              ? "bg-transparent border-transparent shadow-none w-full max-w-3xl"
              : "px-5 py-4 bg-white text-[#334155] border-[#E5E7EB] rounded-tl-sm w-full max-w-3xl"
        )}>
          {isUser ? (
            <div className="whitespace-pre-wrap leading-relaxed font-medium">
              {message.content}
            </div>
          ) : quizData ? (
            <InteractiveQuiz quiz={quizData} />
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
      </div>
    </motion.div>
  );
});
