import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, LogOut, User, FileText, ShieldAlert, Sparkles } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass h-16 sm:h-20 flex items-center px-4 sm:px-8 justify-between border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
          <Shield className="text-white w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tight text-slate-900 leading-none">
            MERS <span className="text-blue-600">SID</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Emergency Gateway</span>
        </div>
      </Link>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link 
          to="/dashboard/analyzer" 
          className="hidden md:flex items-center gap-2 font-bold text-sm text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl hover:bg-blue-50/80 transition-all border border-transparent hover:border-blue-100"
        >
          <FileText size={18} className="text-blue-600" />
          <span>Report Analyzer</span>
        </Link>

        <div className="w-px h-6 bg-slate-200 hidden md:block" />

        <LanguageSwitcher />

        {user ? (
          <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-100 hover:bg-blue-100/80 text-blue-700 font-bold text-sm transition-all"
            >
              <User size={16} />
              <span className="hidden sm:inline">{user.name}</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              to="/login" 
              className="px-4 py-2 text-slate-700 font-bold text-sm hover:text-blue-600 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles size={16} />
              <span>Create ID</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
