import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, ArrowLeft, Loader2, Sparkles, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../context/LanguageContext';
import { analyzeReport } from '../../services/api';

export default function ReportAnalyzer() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [outputLanguage, setOutputLanguage] = useState(lang);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelection(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  };

  const handleFileSelection = (file) => {
    if (!file.type.match('image.*') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file.');
      return;
    }
    
    setFile(file);
    setResult(null);
    
    if (file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('report', file);
    formData.append('language', outputLanguage);

    try {
      const response = await analyzeReport(formData);

      if (response.data.success) {
        setResult(response.data.data);
        toast.success('AI Medical Report Analysis Complete!');
      } else {
        toast.error(response.data.message || 'Analysis failed.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.message || 'Failed to connect to AI analysis server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4 sm:px-8 relative font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed top-1/4 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors border border-slate-700"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 inline-flex items-center gap-1.5 mb-1">
                <Sparkles size={12} /> Gemini AI Diagnostic Intelligence
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{t('reportAnalyzer')}</h1>
            </div>
          </div>

          {/* Language Picker */}
          <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2">
            <Languages size={18} className="text-cyan-400" />
            <select 
              value={outputLanguage}
              onChange={(e) => setOutputLanguage(e.target.value)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer font-bold"
            >
              <option value="en" className="bg-slate-900 text-white">English Summary</option>
              <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
              <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
            </select>
          </div>
        </div>

        {/* Dropzone Upload Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden shadow-2xl"
        >
          <div 
            className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center transition-all ${
              isDragging ? 'border-cyan-400 bg-cyan-400/5 scale-[1.01]' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-950/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
            />
            
            {previewUrl ? (
              <div className="relative w-full max-w-xs aspect-video rounded-2xl overflow-hidden mb-4 border border-slate-700 shadow-lg">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-bold">Click to replace file</p>
                </div>
              </div>
            ) : file ? (
              <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mb-4 border border-cyan-500/30">
                <FileText className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                <UploadCloud className="w-8 h-8" />
              </div>
            )}

            <h3 className="text-lg font-black text-white mb-1.5 text-center">
              {file ? file.name : t('uploadReport')}
            </h3>
            <p className="text-slate-400 text-xs text-center max-w-md font-medium leading-relaxed">
              {file ? 'File attached and ready for AI diagnosis.' : 'Drag & drop medical lab reports, blood tests, or discharge summaries (PDF, JPG, PNG).'}
            </p>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (file) handleAnalyze();
                else fileInputRef.current?.click();
              }}
              disabled={isAnalyzing}
              className={`mt-6 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-xl ${
                isAnalyzing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 
                file ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:opacity-90 shadow-cyan-500/25 active:scale-95' : 
                'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>ANALYZING LAB REPORT...</span>
                </>
              ) : (
                file ? t('analyzeBtn') : 'Select File'
              )}
            </button>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Summary Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-cyan-500/20 rounded-2xl border border-cyan-500/30">
                    <FileText className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-black text-white">{t('summary')}</h2>
                </div>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base font-medium">{result.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Findings Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-black text-white">{t('keyFindings')}</h2>
                  </div>
                  <ul className="space-y-3.5">
                    {result.keyFindings?.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                        <span className="w-2 h-2 mt-2 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    </div>
                    <h2 className="text-lg font-black text-white">{t('recommendations')}</h2>
                  </div>
                  <ul className="space-y-3.5">
                    {result.recommendations?.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                        <span className="w-2 h-2 mt-2 rounded-full bg-amber-400 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Medical Disclaimer */}
              {result.disclaimer && (
                <div className="text-center text-slate-500 text-xs italic mt-4 font-medium">
                  {result.disclaimer}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
