import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface SidebarProps {
  intent: string;
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
}

interface Session {
  id: string;
  intent: string;
  created_at: string;
  messages: { content: string }[];
}

export default function Sidebar({ intent, activeSessionId, onSelectSession }: SidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.get(`${API_BASE_URL}/api/chat/sessions?intent=${intent}`, { headers });
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [intent]);

  const handleCreateNew = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.post(`${API_BASE_URL}/api/chat/sessions`, { intent }, { headers });
      setSessions([res.data, ...sessions]);
      onSelectSession(res.data.id);
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await axios.delete(`${API_BASE_URL}/api/chat/sessions/${id}`, { headers });
      setSessions(sessions.filter(s => s.id !== id));
      if (activeSessionId === id) {
        onSelectSession('');
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  return (
    <div className="w-64 bg-transparent border-r border-[#E5E7EB] flex flex-col h-full z-20 overflow-hidden">
      {/* Heading - moved from chat header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#E5E7EB]">
        <h1 className="text-base font-semibold capitalize text-[#0F172A]">
          {intent.replace('_', ' ')} Session
        </h1>
        <p className="text-xs text-[#64748B] font-medium tracking-wide mt-0.5">CATalyst AI Tutor</p>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
        {isLoading ? (
          <div className="flex justify-center p-4 text-[#94A3B8]">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-4 text-sm text-[#94A3B8] font-medium my-10">
            No previous chats
          </div>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150 ${activeSessionId === session.id
                  ? 'bg-[#3B82F6] text-white shadow-sm'
                  : 'hover:bg-[#EFF6FF] text-[#334155]'
                }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className={`shrink-0 ${activeSessionId === session.id ? 'text-blue-200' : 'text-[#94A3B8]'}`} />
                <span className="truncate text-sm font-medium">
                  {session.messages?.[0]?.content || 'New Conversation'}
                </span>
              </div>
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${activeSessionId === session.id
                    ? 'hover:bg-blue-600 text-blue-200 hover:text-white'
                    : 'hover:bg-red-50 text-[#94A3B8] hover:text-red-500'
                  }`}
                title="Delete Chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* New Chat button at bottom */}
      <div className="p-3 border-t border-[#E5E7EB]">
        <button
          onClick={handleCreateNew}
          className="w-full flex items-center justify-center gap-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] py-2.5 rounded-lg font-medium transition-all duration-150 text-sm"
        >
          <Plus size={18} /> New Chat
        </button>
      </div>
    </div>
  );
}
