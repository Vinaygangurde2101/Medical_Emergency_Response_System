import React from 'react';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProgressCard({ profile }) {
  const navigate = useNavigate();

  // Calculate completeness
  let score = 25; // Base score for registration
  if (profile?.bloodGroup) score += 15;
  if (profile?.allergies?.length > 0) score += 15;
  if (profile?.emergencyContacts?.length > 0) score += 15;
  if (profile?.medications?.length > 0) score += 15;
  if (profile?.diseases?.length > 0) score += 15;
  
  if (score > 100) score = 100;

  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/80 font-sans flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Emergency Readiness</h3>
          </div>
          <span className="text-xl font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
            {score}%
          </span>
        </div>

        {/* Gradient Progress Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5 mb-4">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
            style={{ width: `${score}%` }}
          />
        </div>

        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          {score < 100 
            ? `Complete the remaining ${100 - score}% medical profile data so first responders get complete emergency records.` 
            : 'Your profile is 100% complete and fully optimized for first responder emergencies!'}
        </p>
      </div>

      {score < 100 && (
        <button 
          onClick={() => navigate('/profile')}
          className="mt-5 w-full py-3 bg-blue-50 hover:bg-blue-100/80 text-blue-700 font-bold text-xs rounded-2xl border border-blue-100 flex items-center justify-center gap-2 transition-all group"
        >
          <Sparkles size={14} />
          <span>Complete Profile Now</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}
