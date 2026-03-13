import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, UserPlus } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    try {
      const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:5000${endpoint}`, { email });
      
      localStorage.setItem('auth_token', res.data.token);
      toast.success(res.data.message);
      
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Authentication failed. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    sessionStorage.setItem('is_demo', 'true');
    toast.info('Starting demo mode');
    setTimeout(() => navigate('/dashboard'), 500);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-gray-900 flex items-center justify-center p-4 selection:bg-blue-100">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-xl border border-gray-100 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="text-center mb-10 mt-2">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 tracking-tight">CATalyst AI</h1>
          <p className="text-gray-500 font-medium">
            {isLoginView ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">University Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
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

        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-col gap-4 text-center">
            <button 
              type="button"
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm"
            >
              {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">Or continue without account</span>
              </div>
            </div>

            <button
              onClick={handleDemo}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-colors border border-gray-200 shadow-sm"
            >
              Continue in Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
