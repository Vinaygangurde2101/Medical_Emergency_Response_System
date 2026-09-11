import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  FileText, 
  ShieldCheck, 
  LogOut,
  Shield,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar({ isOpen, toggleSidebar, logout }) {
  const { user } = useContext(AuthContext);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard', roles: ['PATIENT', 'HOSPITAL_STAFF', 'ADMIN'] },
    { icon: <UserCircle size={20} />, label: 'My Profile', path: '/profile', roles: ['PATIENT', 'HOSPITAL_STAFF', 'ADMIN'] },
    { icon: <FileText size={20} />, label: 'Report Analyzer', path: '/dashboard/analyzer', roles: ['PATIENT', 'HOSPITAL_STAFF', 'ADMIN'] },
    { icon: <Building2 size={20} />, label: 'Hospital Portal', path: '/hospital', roles: ['HOSPITAL_STAFF', 'ADMIN'] },
    { icon: <ShieldCheck size={20} />, label: 'Admin Audit', path: '/admin', roles: ['ADMIN'] },
  ];

  const userRole = user?.role || 'PATIENT';
  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <motion.aside 
      animate={{ width: isOpen ? 270 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-xl border-r border-slate-200/80 z-50 flex flex-col shadow-xl shadow-slate-200/30 transition-all font-sans"
    >
      {/* Brand Header */}
      <div className="h-16 sm:h-20 flex items-center px-5 justify-between border-b border-slate-100">
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-md shadow-blue-600/20">
              <Shield className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-slate-900 block leading-tight">MERS <span className="text-blue-600">SID</span></span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                {userRole}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl mx-auto shadow-md shadow-blue-600/20">
            <Shield className="text-white w-5 h-5" />
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-6 px-3.5 space-y-2 overflow-y-auto custom-scrollbar">
        {visibleItems.map((item, i) => (
          <NavLink 
            key={i} 
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 font-bold text-sm group relative
              ${isActive 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25' 
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-blue-600'}
            `}
          >
            <div className="flex-shrink-0 transition-transform group-hover:scale-110">{item.icon}</div>
            {isOpen && <span className="tracking-tight whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3.5 border-t border-slate-100">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold text-sm group"
        >
          <LogOut size={20} className="flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
          {isOpen && <span className="tracking-tight">Logout</span>}
        </button>
      </div>

      {/* Sidebar Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all md:flex hidden"
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </motion.aside>
  );
}
