import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, FolderOpen, BarChart2, Users, Bell, Database } from 'lucide-react';
import { Button } from './ui';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function Layout({ setAuth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const navItems = [
    { name: 'File Manager', path: '/', icon: FolderOpen, desc: 'Browse & manage files' },
    { name: 'Analytics', path: '/tasks', icon: BarChart2, desc: 'Usage reports' },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'Admin Center', path: '/admin', icon: Users, desc: 'System oversight' });
  }

  const roleColors = {
    Admin: 'bg-purple-100 text-purple-700',
    Teacher: 'bg-green-100 text-green-700',
    Principal: 'bg-yellow-100 text-yellow-700',
    Registrar: 'bg-blue-100 text-blue-700',
    Finance: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 flex flex-col shadow-2xl shrink-0 relative z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none"></div>
        
        {/* Logo */}
        <div className="h-24 flex items-center px-8 border-b border-white/5 relative">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-2xl shadow-blue-500/40 border border-blue-400/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-tighter leading-none">ADFS</p>
            <p className="text-blue-400 font-bold text-[10px] tracking-widest uppercase mt-1 opacity-80">Institutional</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="text-slate-500 text-[11px] uppercase tracking-[0.2em] font-black px-4 mb-6 opacity-50">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all duration-300 group relative overflow-hidden ${isActive ? 'shadow-2xl shadow-blue-600/40 translate-x-1' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-tight leading-none">{item.name}</p>
                  <p className={`text-[10px] font-medium truncate mt-1.5 ${isActive ? 'text-blue-200' : 'text-slate-500 group-hover:text-slate-400'}`}>{item.desc}</p>
                </div>
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-300 rounded-l-full"></div>
                )}
              </Button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-white/5 bg-slate-950/30">
          {user && (
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xl border border-white/10">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate tracking-tight">{user.username}</p>
                <div className="mt-1.5 inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className={`text-[9px] font-black uppercase tracking-wider text-blue-400`}>
                      {user.role} Account
                    </span>
                </div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl text-slate-400 bg-white/5 hover:bg-slate-800 hover:text-white transition-all duration-300 text-xs font-bold border border-white/5"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Secure Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative bg-[#f8fafc]">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="p-10 max-w-7xl mx-auto relative z-10 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

