import { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-transparent relative z-20 px-4 pb-3 pt-2">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end rounded-3xl border border-[#D1D5DB] bg-[#F4F4F4] px-4 py-2 focus-within:border-[#A3A3A3] focus-within:bg-white focus-within:shadow-sm transition-all duration-200">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              rows={1}
              className="flex-1 resize-none bg-transparent py-2 text-[#0F172A] text-sm focus:outline-none placeholder-[#8E8E93] leading-relaxed max-h-40 overflow-y-auto"
              disabled={isLoading}
              style={{ minHeight: '24px' }}
            />
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              style={{ alignSelf: 'center' }}
              className="ml-2 p-1.5 rounded-full bg-black text-white hover:bg-[#1a1a1a] disabled:bg-[#D1D5DB] disabled:text-white disabled:cursor-not-allowed transition-colors duration-150 shrink-0 self-end mb-0.5"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} strokeWidth={2.5} />}
            </button>
          </div>
        </form>
        <p className="text-center text-[11px] text-[#8E8E93] mt-2">
          CATalyst AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
