import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';

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
      if (!token && !sessionStorage.getItem('is_demo')) return;

      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.get(`http://localhost:5000/api/chat/sessions?intent=${intent}`, { headers });
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [intent, activeSessionId]); // Refetch if intent or new session is activated

  const handleCreateNew = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-demo-session-id'] = sessionStorage.getItem('is_demo') ? 'demo' : undefined;

      const res = await axios.post(`http://localhost:5000/api/chat/sessions`, { intent }, { headers });
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

      await axios.delete(`http://localhost:5000/api/chat/sessions/${id}`, { headers });
      setSessions(sessions.filter(s => s.id !== id));
      if (activeSessionId === id) {
        onSelectSession(''); // Deselect if deleted
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-20 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={handleCreateNew}
          className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2.5 rounded-xl font-semibold transition-colors border border-blue-200"
        >
          <Plus size={18} /> New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
        {isLoading ? (
          <div className="flex justify-center p-4 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-4 text-sm text-gray-500 font-medium my-10">
            No previous chats
          </div>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                activeSessionId === session.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className={`shrink-0 ${activeSessionId === session.id ? 'text-blue-200' : 'text-gray-400'}`} />
                <span className="truncate text-sm font-medium">
                  {session.messages?.[0]?.content || 'New Conversation'}
                </span>
              </div>
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                  activeSessionId === session.id
                    ? 'hover:bg-blue-700 text-blue-200 hover:text-white'
                    : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                }`}
                title="Delete Chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
