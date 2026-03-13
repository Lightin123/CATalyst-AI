import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, LogOut } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import Sidebar from '../components/Sidebar';

export default function Workspace() {
  const navigate = useNavigate();
  const [intent, setIntent] = useState<string>('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const currentIntent = sessionStorage.getItem('current_intent');
    if (!currentIntent) {
      navigate('/');
    } else {
      setIntent(currentIntent);
    }
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('is_demo');
    navigate('/');
  };

  if (!intent) return null;

  return (
    <div className="flex h-screen bg-[#FAFAFB] text-gray-900 overflow-hidden">
      {/* Sidebar - Collapsible on small screens */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden h-full flex-shrink-0 z-20`}>
        <Sidebar 
          intent={intent} 
          activeSessionId={activeSessionId} 
          onSelectSession={setActiveSessionId} 
        />
      </div>

      <div className="flex-1 flex flex-col h-screen min-w-0">
        <header className="flex items-center p-4 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 mr-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 mr-4 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold capitalize text-gray-900">
                {intent.replace('_', ' ')} Session
              </h1>
              <p className="text-xs text-blue-600 font-medium tracking-wide">CATalyst AI Tutor is ready</p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white border border-gray-200 shadow-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors font-medium text-sm md:text-base mr-2"
          >
            <LogOut size={16} className="md:w-4 md:h-4" /> <span className="hidden md:inline">Sign Out</span>
          </button>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <ChatWindow intent={intent} sessionId={activeSessionId} onSessionCreated={setActiveSessionId} />
        </main>
      </div>
    </div>
  );
}
