import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, RotateCcw, PenTool, AlertCircle } from 'lucide-react';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';

export const DigitalWaiverModal = ({ isOpen, onClose, artistName = "Shane Vance", onWaiverSigned }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [clientData, setClientData] = useState({
    fullName: '',
    dob: '',
    phone: '',
    email: '',
    agreedSobriety: false,
    agreedHealth: false,
    agreedPermanence: false,
    agreedPhotoRelease: true
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e) => {
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    playClickSound();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasSignature || !clientData.fullName || !clientData.agreedSobriety || !clientData.agreedHealth || !clientData.agreedPermanence) {
      alert('Please fill all required fields and provide a digital signature.');
      return;
    }

    playClickSound();
    playSuccessChime();

    const signedDoc = {
      id: 'WVR-' + Date.now(),
      ...clientData,
      artist: artistName,
      signedAt: new Date().toISOString(),
      status: 'Verified & Executed'
    };

    if (onWaiverSigned) onWaiverSigned(signedDoc);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#11111a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-[#0a0a10] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bebas text-2xl text-white tracking-wide">
              Digital Client Tattoo Release & Medical Consent
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-zinc-900 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
              <h4 className="font-bebas text-3xl text-white">Consent Form Legally Executed</h4>
              <p className="text-xs text-slate-400">
                A digital copy has been securely logged to Shane's Studio Health Records.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="First & Last Name"
                    value={clientData.fullName}
                    onChange={(e) => setClientData({ ...clientData, fullName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">Date of Birth (18+)</label>
                  <input
                    type="date"
                    required
                    value={clientData.dob}
                    onChange={(e) => setClientData({ ...clientData, dob: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Legal Checklist */}
              <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 space-y-2.5 text-slate-300">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientData.agreedSobriety}
                    onChange={(e) => setClientData({ ...clientData, agreedSobriety: e.target.checked })}
                    className="accent-rose-600 mt-0.5"
                  />
                  <span>I am not under the influence of alcohol, drugs, or anticoagulants (blood thinners).</span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientData.agreedHealth}
                    onChange={(e) => setClientData({ ...clientData, agreedHealth: e.target.checked })}
                    className="accent-rose-600 mt-0.5"
                  />
                  <span>I have disclosed any skin allergies, heart conditions, diabetes, or bloodborne pathogens.</span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientData.agreedPermanence}
                    onChange={(e) => setClientData({ ...clientData, agreedPermanence: e.target.checked })}
                    className="accent-rose-600 mt-0.5"
                  />
                  <span>I acknowledge that tattoo art is permanent and I have verified the spelling and stencil placement.</span>
                </label>
              </div>

              {/* Canvas Signature Pad */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-rose-400" />
                    Digital Signature Pad (Draw with Mouse or Touch)
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[10px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear Signature
                  </button>
                </div>

                <div className="bg-zinc-950 border-2 border-dashed border-zinc-700 rounded-xl overflow-hidden h-32 relative">
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={128}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair touch-none"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-600 text-xs font-mono">
                      Sign on line above
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Legally Sign & Execute Release Form</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
