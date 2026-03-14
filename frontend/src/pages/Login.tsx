import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, UserPlus } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || loading) return;

    setLoading(true);
    try {
      const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:5000${endpoint}`, { email, password });
      
      if (isLoginView) {
        localStorage.setItem('auth_token', res.data.token);
        toast.success(res.data.message);
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        toast.success("Account created successfully. Please sign in.");
        setIsLoginView(true);
        setPassword('');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Authentication failed. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center p-4 selection:bg-blue-100">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="w-full max-w-md bg-white rounded-xl p-10 shadow-sm border border-[#E5E7EB] relative overflow-hidden transition-all duration-200">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3B82F6] to-[#6366F1]"></div>
        <div className="text-center mb-10 mt-2">
          <h1 className="text-4xl font-extrabold text-[#0F172A] mb-3 tracking-tight">CATalyst <span className="text-[#3B82F6]">AI</span></h1>
          <p className="text-[#64748B] font-medium">
            {isLoginView ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-2" htmlFor="email">University Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-4 py-3.5 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all duration-150 font-medium placeholder-[#94A3B8]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-4 py-3.5 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all duration-150 font-medium placeholder-[#94A3B8]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white font-semibold py-3.5 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                {isLoginView ? <LogIn size={20} className="mr-2" /> : <UserPlus size={20} className="mr-2" />} 
                {isLoginView ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-center">
          <button 
            type="button"
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-[#3B82F6] font-medium hover:text-[#1D4ED8] transition-colors duration-150 text-sm"
          >
            {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
