import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { Lock, User, Shield, Database, Layers, GitBranch } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login({ setAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Teacher');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await authService.login(username, password);
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify({ username: res.data.username, role: res.data.role }));
        setAuth(true);
        toast.success(`Welcome back, ${res.data.username}!`);
        navigate('/');
      } else {
        await authService.register(username, password, role);
        setIsLogin(true);
        toast.success('Account created! Please wait for administrator approval before signing in.', { duration: 6000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Database className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">ADFS</span>
          </div>
          
          <h1 className="text-6xl font-extrabold text-white leading-tight mb-8">
            The Future of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">School Filing</span>
          </h1>
          <p className="text-slate-400 text-xl leading-relaxed mb-12 max-w-lg">
            A premium, high-performance document management system designed exclusively for modern educational institutions.
          </p>
          
          <div className="space-y-5">
            {[
              { icon: Layers, label: 'Comprehensive File History', desc: 'Securely track every document version and change' },
              { icon: GitBranch, label: 'Intelligent Organization', desc: 'Manage complex hierarchies with effortless simplicity' },
              { icon: Shield, label: 'Enterprise-Grade Security', desc: 'Advanced encryption for sensitive student records' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-base">{label}</p>
                  <p className="text-slate-400 text-sm mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-900 font-bold text-lg">ADFS</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Sign in to your account' : 'Create an account'}
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              {isLogin ? 'Enter your credentials to access the system.' : 'Fill in your details to get started.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. john.doe"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-all"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                    <option value="Principal">Principal</option>
                    <option value="Registrar">Registrar</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
