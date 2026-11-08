import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, User, Phone, Mail, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';
import { useBookingModal } from '../context/BookingModalContext';

export const AppointmentModal: React.FC = () => {
  const { isOpen, closeBookingModal, selectedService } = useBookingModal();
  const queryClient = useQueryClient();

  // Form State
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(selectedService || 'General Dentistry');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00 AM (Morning)');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedAppt, setConfirmedAppt] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch active services for dropdown
  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.get('/api/services'),
  });

  const services = servicesData?.services || [];

  // Update selected service if parent prop changes
  useEffect(() => {
    if (selectedService) {
      setService(selectedService);
    }
  }, [selectedService]);

  // Set default date to tomorrow
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPreferredDate(tomorrow.toISOString().split('T')[0]);
      setIsSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  // TanStack Query Mutation
  const appointmentMutation = useMutation({
    mutationFn: (newAppointment: any) => api.post('/api/appointments', newAppointment),
    onSuccess: (data) => {
      setIsSuccess(true);
      setConfirmedAppt(data.appointment);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });

      // Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#06b6d4', '#14b8a6', '#f59e0b'],
        });
      } catch {
        // Ignore if canvas-confetti is not loaded
      }
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to submit appointment. Please check your information.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!patientName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please provide a valid phone number for appointment confirmation.');
      return;
    }
    if (!preferredDate) {
      setErrorMessage('Please choose a preferred appointment date.');
      return;
    }

    appointmentMutation.mutate({
      patient_name: patientName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      service_requested: service,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      notes: notes.trim() || undefined,
    });
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setConfirmedAppt(null);
    setPatientName('');
    setPhone('');
    setEmail('');
    setNotes('');
    closeBookingModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-cyanCustom-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Book Your Visit</h3>
              <p className="text-xs text-brand-100">BrightSmile Gentle Dental Care</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isSuccess ? (
            /* Success Confirmation Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-50 border-4 border-brand-100 text-brand-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-2xl font-extrabold text-navy-900">Appointment Requested!</h4>
                <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                  Thank you, <strong className="text-navy-900">{confirmedAppt?.patient_name}</strong>. Your appointment request has been scheduled in our system.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-brand-50/70 rounded-2xl p-4 text-left border border-brand-100 max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-brand-200/50">
                  <span className="text-slate-500 font-medium">Reference Code:</span>
                  <span className="font-mono font-bold text-brand-800">#BS-{confirmedAppt?.id || '2026'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Service:</span>
                  <span className="font-bold text-navy-900">{confirmedAppt?.service_requested}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Date & Time:</span>
                  <span className="font-bold text-navy-900">{confirmedAppt?.preferred_date} • {confirmedAppt?.preferred_time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    Pending Confirmation
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Our front desk coordinator will phone you at <strong>{confirmedAppt?.phone}</strong> to confirm your slot.
              </p>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all mt-4"
              >
                Done
              </button>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Patient Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Jessica Sterling"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Service Requested */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Service Requested *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 appearance-none"
                  >
                    {services.length > 0 ? (
                      services.map((s: { id: number; title: string }) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="General Dentistry">General Dentistry & Cleaning</option>
                        <option value="Cosmetic Dentistry">Cosmetic Dentistry & Whitening</option>
                        <option value="Dental Implants">Dental Implants</option>
                        <option value="Orthodontics">Orthodontics & Clear Aligners</option>
                        <option value="Pediatric Dentistry">Pediatric Dentistry</option>
                        <option value="Emergency Care">Emergency Care</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Time Slot
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="09:00 AM (Morning)">09:00 AM (Morning)</option>
                      <option value="10:00 AM (Morning)">10:00 AM (Morning)</option>
                      <option value="11:30 AM (Late Morning)">11:30 AM (Late Morning)</option>
                      <option value="02:00 PM (Afternoon)">02:00 PM (Afternoon)</option>
                      <option value="03:30 PM (Afternoon)">03:30 PM (Afternoon)</option>
                      <option value="05:00 PM (Late Afternoon)">05:00 PM (Late Afternoon)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Symptoms or Notes (Optional)
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 left-3.5 pointer-events-none text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us about any symptoms, dental anxiety, or specific requirements..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-navy-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={appointmentMutation.isPending}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-cyanCustom-600 hover:from-brand-700 hover:to-cyanCustom-700 shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {appointmentMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Book Appointment</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                🔒 Your personal health information is strictly confidential and protected.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
