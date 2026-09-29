import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Upload, 
  Flame, 
  Sparkles, 
  CreditCard 
} from 'lucide-react';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

export const BookingWizardModal = ({ 
  isOpen, 
  onClose, 
  artists = [], 
  preselectedData = null, 
  onSaveAppointment 
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: preselectedData?.service || 'Custom Tattoo Project',
    artistId: preselectedData?.artistId || 'shane',
    placement: preselectedData?.placement || 'Forearm',
    size: preselectedData?.size || 'Medium (5"-7")',
    description: preselectedData?.description || preselectedData?.conceptPrompt || '',
    date: '2026-10-05',
    timeSlot: '1:00 PM',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    ageVerified: false,
    healthVerified: false,
    depositAmount: preselectedData?.depositAmount || 100,
    referenceImage: preselectedData?.conceptImage || null
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedApptId, setConfirmedApptId] = useState('');

  if (!isOpen) return null;

  const handleNextStep = () => {
    playClickSound();
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    playClickSound();
    setStep(prev => prev - 1);
  };

  const handleCompleteBooking = (e) => {
    e.preventDefault();
    playClickSound();
    playSuccessChime();

    const apptId = 'APT-' + Math.floor(1000 + Math.random() * 9000);
    const selectedArtistObj = artists.find(a => a.id === formData.artistId) || artists[0];

    const newAppt = {
      id: apptId,
      clientName: formData.clientName || 'Client Guest',
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      artistId: formData.artistId,
      artistName: selectedArtistObj.name,
      service: formData.service,
      placement: formData.placement,
      date: formData.date,
      time: formData.timeSlot,
      durationHours: 3.5,
      depositPaid: formData.depositAmount,
      estimatedTotal: formData.depositAmount * 4,
      status: 'Confirmed',
      notes: formData.description
    };

    onSaveAppointment(newAppt);
    setConfirmedApptId(apptId);
    setBookingConfirmed(true);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  const selectedArtist = artists.find(a => a.id === formData.artistId) || artists[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#11111a] border border-rose-900/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-5 bg-[#0b0b12] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h3 className="font-bebas text-2xl text-white tracking-wide">
              {bookingConfirmed ? 'Appointment Confirmed!' : 'Book Studio Consultation & Deposit'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Progress Indicator */}
        {!bookingConfirmed && (
          <div className="px-6 py-3 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center justify-between text-xs">
            <span className={`font-semibold ${step >= 1 ? 'text-rose-400' : 'text-zinc-600'}`}>1. Service</span>
            <span className="text-zinc-700">→</span>
            <span className={`font-semibold ${step >= 2 ? 'text-rose-400' : 'text-zinc-600'}`}>2. Artist</span>
            <span className="text-zinc-700">→</span>
            <span className={`font-semibold ${step >= 3 ? 'text-rose-400' : 'text-zinc-600'}`}>3. Details</span>
            <span className="text-zinc-700">→</span>
            <span className={`font-semibold ${step >= 4 ? 'text-rose-400' : 'text-zinc-600'}`}>4. Slot</span>
            <span className="text-zinc-700">→</span>
            <span className={`font-semibold ${step >= 5 ? 'text-rose-400' : 'text-zinc-600'}`}>5. Confirm</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {bookingConfirmed ? (
            /* Confirmation Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-bebas text-4xl text-white tracking-wide">
                You're Booked In!
              </h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Your consultation and project deposit have been successfully registered with Shane's Studio.
              </p>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference ID:</span>
                  <span className="font-mono text-rose-400 font-bold">{confirmedApptId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Artist:</span>
                  <span className="font-semibold text-white">{selectedArtist.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time:</span>
                  <span className="font-semibold text-white">{formData.date} at {formData.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deposit Paid:</span>
                  <span className="font-bold text-emerald-400">${formData.depositAmount}.00 (Applied to Final Balance)</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Done & Back to Studio
                </button>
              </div>
            </div>
          ) : (
            /* Wizard Steps */
            <div>
              {/* Step 1: Select Service */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Step 1: Choose Your Session Type
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'Custom Tattoo Project', desc: 'Bespoke original piece designed from scratch with artist.' },
                      { id: 'Studio Flash Art Piece', desc: 'Claim an existing flash design from our artists roster.' },
                      { id: 'Cover-Up Consultation', desc: 'Transform or mask old ink with heavy saturation.' },
                      { id: 'Large Sleeve / Backpiece Project', desc: 'Multi-session full body suit, sleeve, or backpiece.' },
                      { id: 'Titanium Body Piercing', desc: 'Precision piercing with APP sterile implant jewelry.' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setFormData({ ...formData, service: item.id });
                        }}
                        className={`p-4 rounded-xl text-left border transition cursor-pointer ${
                          formData.service === item.id
                            ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg'
                            : 'bg-zinc-900/60 border-zinc-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-sm text-rose-300 mb-1">{item.id}</div>
                        <div className="text-xs text-slate-400 leading-snug">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Choose Artist */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Step 2: Select Your Preferred Artist
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {artists.map((artist) => (
                      <button
                        key={artist.id}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setFormData({ ...formData, artistId: artist.id });
                        }}
                        className={`p-3 rounded-xl text-left border flex items-center gap-3 transition cursor-pointer ${
                          formData.artistId === artist.id
                            ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg'
                            : 'bg-zinc-900/60 border-zinc-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                        />
                        <div>
                          <div className="font-bold text-sm text-white">{artist.name}</div>
                          <div className="text-[11px] text-rose-400">{artist.role}</div>
                          <div className="text-[10px] text-amber-400 font-mono">${artist.hourlyRate}/hr</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Placement & Concept */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Step 3: Placement & Concept Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Body Placement</label>
                      <input
                        type="text"
                        value={formData.placement}
                        onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                        placeholder="E.g., Left Outer Forearm, Sternum, Thigh"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Estimated Size</label>
                      <select
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                      >
                        <option value='Small (2"- 4")'>Small (2"- 4")</option>
                        <option value='Medium (5"- 7")'>Medium (5"- 7")</option>
                        <option value='Large (8"- 10")'>Large (8"- 10")</option>
                        <option value="Half Sleeve / Chest Panel">Half Sleeve / Chest Panel</option>
                        <option value="Full Sleeve / Backpiece">Full Sleeve / Backpiece</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Concept Description / Details</label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe symbols, elements, colors, or reference ideas..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white resize-none"
                    />
                  </div>

                  {formData.referenceImage && (
                    <div className="p-3 bg-zinc-900/80 rounded-xl border border-cyan-500/30 flex items-center gap-3">
                      <img src={formData.referenceImage} alt="Ref" className="w-12 h-12 object-cover rounded-lg" />
                      <div className="text-xs text-cyan-300 font-medium">Concept Stencil Blueprint Attached</div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Pick Date & Time */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Step 4: Select Appointment Date & Time
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        min="2026-09-28"
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase block mb-1">Time Slot</label>
                      <select
                        value={formData.timeSlot}
                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                      >
                        <option value="12:00 PM">12:00 PM (Opening Slot)</option>
                        <option value="1:30 PM">1:30 PM</option>
                        <option value="3:30 PM">3:30 PM</option>
                        <option value="5:30 PM">5:30 PM</option>
                        <option value="7:00 PM">7:00 PM (Evening Slot)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Contact Information</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Full Legal Name"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Medical Pre-Screen & Deposit */}
              {step === 5 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Step 5: Pre-Screening & Deposit Confirmation
                  </h4>

                  <div className="space-y-2 bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={formData.ageVerified}
                        onChange={(e) => setFormData({ ...formData, ageVerified: e.target.checked })}
                        className="accent-rose-600 rounded"
                      />
                      <span>I confirm I am 18+ years of age and will present valid government photo ID.</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={formData.healthVerified}
                        onChange={(e) => setFormData({ ...formData, healthVerified: e.target.checked })}
                        className="accent-rose-600 rounded"
                      />
                      <span>I am not pregnant/nursing, not on blood thinners, and free of skin infections.</span>
                    </label>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-gradient-to-r from-zinc-900 to-[#181822] p-4 rounded-xl border border-rose-500/40 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Project Deposit Due Now:</span>
                      <span className="font-bebas text-3xl text-emerald-400 font-bold">${formData.depositAmount}.00</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-black/40 rounded-lg border border-white/5 text-[11px] text-slate-400">
                      <CreditCard className="w-4 h-4 text-slate-300" />
                      <span>Simulated Secure Stripe / ApplePay Checkout (Demo Mode)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Controls */}
        {!bookingConfirmed && (
          <div className="p-4 bg-[#0b0b12] border-t border-zinc-800 flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-300 text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!formData.ageVerified || !formData.healthVerified || !formData.clientName}
                onClick={handleCompleteBooking}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Pay Deposit (${formData.depositAmount})</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
