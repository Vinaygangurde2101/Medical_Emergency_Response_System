import React from 'react';

export default function InputField({ label, type = 'text', value, onChange, error, ...props }) {
  return (
    <div className="relative mb-5 font-sans">
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`peer w-full border rounded-2xl px-4 pt-5 pb-2 text-sm font-semibold text-slate-900 bg-slate-50/80 focus:bg-white focus:outline-none transition-all duration-200 
          ${error 
            ? 'border-red-500 focus:ring-4 focus:ring-red-500/10' 
            : 'border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600'}
          placeholder-transparent`}
        placeholder={label}
        {...props}
      />
      <label className={`absolute left-4 top-1.5 text-[11px] font-extrabold uppercase tracking-wider transition-all pointer-events-none 
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-semibold peer-placeholder-shown:normal-case peer-placeholder-shown:text-slate-400
        peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:font-extrabold peer-focus:uppercase peer-focus:tracking-wider
        ${error ? 'text-red-500' : 'text-slate-400 peer-focus:text-blue-600'}`}>
        {label}
      </label>
      {error && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{error}</p>}
    </div>
  );
}
