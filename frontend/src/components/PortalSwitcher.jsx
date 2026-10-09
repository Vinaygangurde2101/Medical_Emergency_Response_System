import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Building2, ShieldAlert } from 'lucide-react';

export default function PortalSwitcher({ currentPortal }) {
  const portals = [
    {
      id: 'patient',
      label: 'Patient Portal',
      path: '/login',
      icon: User,
      activeStyle: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
    },
    {
      id: 'hospital',
      label: 'Hospital Staff',
      path: '/hospital-login',
      icon: Building2,
      activeStyle: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
    },
    {
      id: 'admin',
      label: 'System Admin',
      path: '/admin-login',
      icon: ShieldAlert,
      activeStyle: 'bg-slate-900 text-white shadow-lg shadow-slate-900/30'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto mb-6 bg-slate-100/90 p-1.5 rounded-2xl flex items-center justify-between border border-slate-200/80 font-extrabold text-xs shadow-inner">
      {portals.map(portal => {
        const Icon = portal.icon;
        const isActive = currentPortal === portal.id;
        return (
          <NavLink
            key={portal.id}
            to={portal.path}
            className={`flex-1 py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-[11px] sm:text-xs ${
              isActive 
                ? portal.activeStyle 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Icon size={15} />
            <span className="whitespace-nowrap">{portal.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
