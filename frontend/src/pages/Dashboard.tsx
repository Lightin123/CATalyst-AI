import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Zap, LineChart, Brain } from 'lucide-react';

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
    sessionStorage.setItem('current_intent', intentId);
    navigate('/workspace');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col items-center py-20 px-4 selection:bg-blue-100 relative">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-[#0F172A]">
          CATalyst <span className="text-[#3B82F6]">AI</span>
        </h1>
        <p className="text-lg text-[#64748B] font-medium">
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
              className="group relative flex flex-col items-start p-6 text-left bg-white border border-[#E5E7EB] shadow-sm rounded-xl hover:shadow-md hover:border-[#93C5FD] transition-all duration-200 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#EFF6FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="p-3 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl mb-4 text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white group-hover:border-[#3B82F6] transition-all duration-200">
                <Icon size={26} />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-1.5 relative z-10">{item.title}</h3>
              <p className="text-[#64748B] text-sm leading-relaxed relative z-10">{item.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

