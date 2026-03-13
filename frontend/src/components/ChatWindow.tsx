import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import axios from 'axios';

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
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Fetch session messages when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([initialGreeting]);
      return;
    }

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await axios.get(`http://localhost:5000/api/chat/sessions/${sessionId}/messages`, { headers });
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
      }
    };

    fetchHistory();
  }, [sessionId, intent]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const isDemo = sessionStorage.getItem('is_demo');
      
      const headers: any = {};
      if (token && !isDemo) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (isDemo) {
        headers['x-demo-session-id'] = sessionStorage.getItem('demo_session_id') || Date.now().toString();
      }

      const res = await axios.post('http://localhost:5000/api/chat', {
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
    <div className="flex flex-col h-full bg-[#FAFAFB]">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 max-w-4xl mx-auto w-full scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-blue-500 text-sm ml-12">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse delay-100">●</span>
            <span className="animate-pulse delay-200">●</span>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
