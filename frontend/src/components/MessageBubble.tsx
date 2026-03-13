import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={clsx("flex max-w-[80%]", isUser ? "flex-row-reverse" : "flex-row")}>
        <div className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
          isUser ? "bg-blue-600 text-white ml-3" : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white mr-3"
        )}>
          {isUser ? <User size={16} /> : <Sparkles size={16} />}
        </div>
        
        <div className={clsx(
          "px-5 py-4 rounded-2xl shadow-sm border",
          isUser 
            ? "bg-blue-600 text-white rounded-tr-sm border-blue-700" 
            : "bg-white text-gray-800 border-gray-100 rounded-tl-sm"
        )}>
          {/* Note: In a real app we would use react-markdown here */}
          <div className="whitespace-pre-wrap leading-relaxed font-medium">
            {message.content}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
