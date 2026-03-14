import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
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

  // Listen for study mode changes from NavSidebar
  useEffect(() => {
    const handleIntentChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setIntent(customEvent.detail);
      setActiveSessionId(null); // Reset to fresh session for new mode
    };
    window.addEventListener('intentChanged', handleIntentChange);
    return () => window.removeEventListener('intentChanged', handleIntentChange);
  }, []);

  if (!intent) return null;

  return (
    <div className="flex h-full bg-[#F8FAFC] text-[#0F172A] overflow-hidden">
      {/* Chat Session Sidebar - Collapsible */}
      <div className={`transition-all duration-200 ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden h-full flex-shrink-0 z-20`}>
        <Sidebar 
          intent={intent} 
          activeSessionId={activeSessionId} 
          onSelectSession={setActiveSessionId} 
        />
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Minimal toggle button floating at top-left */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors duration-150 text-[#94A3B8] hover:text-[#0F172A] z-30"
            title="Show Chat History"
          >
            <Menu size={20} />
          </button>
        )}

        <main className="flex-1 overflow-hidden relative">
          <ChatWindow intent={intent} sessionId={activeSessionId} onSessionCreated={setActiveSessionId} />
        </main>
      </div>
    </div>
  );
}
