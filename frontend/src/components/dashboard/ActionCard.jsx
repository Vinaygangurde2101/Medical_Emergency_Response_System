import React from 'react';
import { UserPlus, FileText, HeartPulse, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ActionCard() {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: <UserPlus size={20} />, 
      label: 'Update Medical Records', 
      desc: 'Add allergies, blood group & emergency contacts',
      gradient: 'from-blue-600 to-indigo-600', 
      path: '/profile' 
    },
    { 
      icon: <FileText size={20} />, 
      label: 'AI Report Analyzer', 
      desc: 'Upload lab reports for instant AI diagnosis',
      gradient: 'from-cyan-500 to-emerald-600', 
      path: '/dashboard/analyzer' 
    },
    { 
      icon: <HeartPulse size={20} />, 
      label: 'First-Aid Assistant', 
      desc: 'Interactive CPR & emergency guidance',
      gradient: 'from-rose-600 to-red-600', 
      path: null,
      onClick: () => {
        const fab = document.querySelector('button[title="Emergency AI Assistant"]');
        if (fab) fab.click();
      }
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/80 flex-1 font-sans flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Zap size={18} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Quick Operations Hub</h3>
        </div>

        <div className="space-y-3.5">
          {actions.map((action, i) => (
            <motion.button 
              key={i}
              whileHover={{ x: 4 }}
              onClick={() => action.path ? navigate(action.path) : (action.onClick && action.onClick())}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/60 hover:border-blue-200 hover:shadow-md transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`bg-gradient-to-br ${action.gradient} text-white p-3 rounded-2xl shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  {action.icon}
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block leading-tight group-hover:text-blue-600 transition-colors">
                    {action.label}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{action.desc}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-all flex-shrink-0">
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
