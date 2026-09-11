import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Share2, Printer, QrCode as QrIcon, Check, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function QRCard({ qrId, patientName, scansCount = 0 }) {
  const qrRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const cleanQrId = qrId || 'demo_qr_01';
  const emergencyUrl = `${window.location.origin}/e/${cleanQrId}`;

  // Download QR Code image as PNG
  const handleDownload = () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) return toast.error('QR Canvas not ready');

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `MERS_Emergency_ID_${cleanQrId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Emergency QR Code saved to device!');
    } catch (err) {
      toast.error('Failed to download QR code');
    }
  };

  // Copy or Share Emergency Link
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MERS Emergency Medical ID',
          text: `Emergency Medical Profile for ${patientName || 'Patient'}`,
          url: emergencyUrl
        });
        toast.success('Emergency link shared!');
        return;
      } catch (err) {}
    }

    navigator.clipboard.writeText(emergencyUrl);
    setCopied(true);
    toast.success('Emergency QR URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Print Emergency Badge
  const handlePrint = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const imgData = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <html>
        <head>
          <title>MERS Emergency Medical Badge - ${cleanQrId}</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; padding: 40px; background: #f8fafc; }
            .card { border: 4px solid #dc2626; background: white; border-radius: 28px; padding: 32px; display: inline-block; width: 340px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            h1 { color: #dc2626; font-size: 22px; margin-bottom: 4px; text-transform: uppercase; font-weight: 900; tracking: -0.5px; }
            p { color: #64748b; font-size: 12px; margin-top: 0; font-weight: 600; }
            img { margin: 20px 0; width: 220px; height: 220px; border-radius: 16px; border: 2px solid #fee2e2; }
            .token { background: #f1f5f9; padding: 8px 14px; border-radius: 12px; font-family: monospace; font-size: 13px; font-weight: 700; color: #334155; }
            .footer { font-size: 10px; color: #94a3b8; font-weight: 800; margin-top: 20px; text-transform: uppercase; tracking: 1px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Emergency Medical ID</h1>
            <p>First Responders: Scan to View Critical Health Info</p>
            <img src="${imgData}" />
            <div class="token">TOKEN: ${cleanQrId}</div>
            <div class="footer">SMART EMERGENCY MEDICAL SYSTEM (MERS SID)</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/80 flex flex-col items-center text-center font-sans h-full justify-between">
      <div className="flex flex-col items-center">
        <div className="w-13 h-13 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-3 border border-red-100 shadow-sm">
          <QrIcon size={24} />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Emergency QR Code</h3>
        <p className="text-slate-500 text-xs mt-1 mb-6 max-w-xs leading-relaxed font-medium">
          Instant access QR code for first responders and ER personnel in case of emergency.
        </p>

        {/* High Resolution Scannable QR Container */}
        <motion.div 
          ref={qrRef}
          whileHover={{ scale: 1.02 }}
          className="bg-white p-5 rounded-3xl border-2 border-red-500/30 shadow-xl shadow-red-500/10 relative group flex items-center justify-center animate-pulse-qr"
        >
          <QRCodeCanvas 
            value={emergencyUrl}
            size={185}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
        </motion.div>

        <div className="mt-4 flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80">
            ID: {cleanQrId}
          </span>
          <button 
            onClick={() => window.open(`/e/${cleanQrId}`, '_blank')}
            className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition-all border border-slate-200/80"
            title="Test Public Emergency Page"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      <div className="w-full mt-6 space-y-4">
        {/* Action Buttons: Save, Share, Print */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          <button 
            onClick={handleDownload}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-slate-50 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200/80 group"
            title="Download PNG image"
          >
            <Download size={18} className="text-slate-600 group-hover:text-red-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 group-hover:text-red-600">Save PNG</span>
          </button>

          <button 
            onClick={handleShare}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-slate-50 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200/80 group"
            title="Share Emergency Link"
          >
            {copied ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} className="text-slate-600 group-hover:text-red-600" />}
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 group-hover:text-red-600">
              {copied ? 'Copied!' : 'Share Link'}
            </span>
          </button>

          <button 
            onClick={handlePrint}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-slate-50 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200/80 group"
            title="Print Badge Card"
          >
            <Printer size={18} className="text-slate-600 group-hover:text-red-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 group-hover:text-red-600">Print Badge</span>
          </button>
        </div>

        {/* Scan Counter Footer */}
        <div className="pt-3.5 border-t border-slate-100 w-full flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Gateway Scans</span>
          <span className="bg-red-50 text-red-600 text-xs font-black px-3 py-1 rounded-xl border border-red-100 shadow-sm">
            {scansCount} Active Scans
          </span>
        </div>
      </div>
    </div>
  );
}
