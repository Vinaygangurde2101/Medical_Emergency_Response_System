import React from 'react';
import { Bell, ShieldAlert, User, Menu, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function TopNavbar({ user, onMenuClick }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between font-sans">
      <div className="flex items-center gap-3 sm:gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2.5 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all border border-slate-200/80"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
            Welcome back, <span className="text-blue-600">{user?.name || 'Patient'}</span>
          </h2>
          <p className="text-[11px] font-bold text-slate-400 hidden sm:block">Smart Medical Profile Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Emergency Hotline Button */}
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (user?.qrId) {
              navigate(`/e/${user.qrId}`);
            } else {
              window.open('tel:108');
            }
          }}
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-red-600/25 transition-all"
        >
          <ShieldAlert size={18} className="animate-pulse" />
          <span className="hidden xs:inline">{t('emergencyMode')}</span>
        </motion.button>

        <div className="h-8 w-px bg-slate-200/80 hidden xs:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          <button 
            className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100/80 rounded-2xl transition-all border border-transparent hover:border-slate-200"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white" />
          </button>
          
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200/80">
            <div className="text-right hidden lg:block">
              <div className="text-xs font-black text-slate-900 leading-tight">{user?.name}</div>
              <div className="text-[10px] font-mono text-slate-400 font-bold">ID: {user?.qrId || 'N/A'}</div>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-600/20 font-black">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
