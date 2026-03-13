import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Zap, LineChart, Brain, LogOut } from 'lucide-react';

const intents = [
  { id: 'cat_prep', title: 'CAT Prep', icon: BookOpen, desc: 'Step-by-step solutions for CA conceptual questions.' },
  { id: 'fat_prep', title: 'FAT Prep', icon: GraduationCap, desc: 'Detailed explanations for Final Assessment exams.' },
  { id: 'concept_builder', title: 'Concept Builder', icon: Brain, desc: 'Gradually introduces concepts from easy to hard.' },
  { id: 'rapid_fire', title: 'Rapid Fire Quiz', icon: Zap, desc: 'Test your knowledge with quick random questions.' },
  { id: 'predict_exam', title: 'Predict Exam', icon: LineChart, desc: 'Generate a mock exam from historical trends.' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const handleSelect = (intentId: string) => {
    // In a real app we'd save this to global state or context
    sessionStorage.setItem('current_intent', intentId);
    navigate('/workspace');
  };

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('is_demo');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-gray-900 flex flex-col items-center py-20 px-4 selection:bg-blue-100 relative">
      <button 
        onClick={handleSignOut}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors font-medium"
      >
        <LogOut size={18} /> Sign Out
      </button>

      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
          CATalyst <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          Your personal intelligent tutor for conquering university exams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        {intents.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="group relative flex flex-col items-start p-6 text-left bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm">
                <Icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed relative z-10">{item.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
