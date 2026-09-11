import React from 'react';
import Loader from './Loader';

export default function Button({ children, loading, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-600/25',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
  };

  return (
    <button
      disabled={loading}
      className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm tracking-tight transition-all duration-200 flex items-center justify-center gap-2 
        ${variants[variant] || variants.primary} ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'} ${className}`}
      {...props}
    >
      {loading ? <Loader size="sm" color="white" /> : children}
    </button>
  );
}
