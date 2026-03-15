import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface ChatWindowProps {
  intent: string;
  sessionId: string | null;
  onSessionCreated: (id: string) => void;
}

export default function ChatWindow({ intent, sessionId, onSessionCreated }: ChatWindowProps) {
  const initialGreeting: Message = { 
    id: 'initial', 
    role: 'ai', 
    content: `Hello! I'm ready to help you with ${intent.replace('_', ' ')}. What would you like to cover?` 
  };
  
  const [messages, setMessages] = useState<Message[]>([initialGreeting]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Fetch session messages when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([initialGreeting]);
      return;
    }

    const fetchHistory = async () => {
      setIsFetchingHistory(true);
      setMessages([]); // Instantly clear messages to show user we switched chats
      
      try {
        const token = localStorage.getItem('auth_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await axios.get(`${API_BASE_URL}/api/chat/sessions/${sessionId}/messages`, { headers });
        const history: Message[] = res.data.map((msg: any) => ({
          id: msg.id,
          role: msg.role as 'user' | 'ai',
          content: msg.content
        }));

        if (history.length > 0) {
          setMessages(history);
        } else {
          setMessages([initialGreeting]); // Fallback for brand new empty sessions
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        setIsFetchingHistory(false);
      }
    };

    fetchHistory();
  }, [sessionId, intent]);

  useEffect(() => {
    const scrollToBottom = () => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };
    
    // Scroll immediately
    scrollToBottom();
    
    // Scroll again after a short delay to account for KaTeX / Markdown parsing layout shifts
    const timeoutId = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: text,
        intent,
        sessionId  // Pass existing session ID
      }, { headers });

      // If backend created a new session dynamically
      if (res.data.sessionId && res.data.sessionId !== sessionId) {
        onSessionCreated(res.data.sessionId);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: res.data.reply
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Sorry, I encountered an error reaching the server.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <div className="flex-1 overflow-y-auto w-full scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="p-4 md:p-8 space-y-4 max-w-4xl mx-auto w-full">
          {isFetchingHistory ? (
            <div className="flex justify-center p-8 text-[#94A3B8]">
              <span className="flex items-center space-x-2 text-[#94A3B8] text-sm">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-100">●</span>
                <span className="animate-pulse delay-200">●</span>
              </span>
            </div>
          ) : (
            messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
          {isLoading && (
            <div className="flex items-center space-x-2 text-[#94A3B8] text-sm ml-12">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-100">●</span>
              <span className="animate-pulse delay-200">●</span>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
