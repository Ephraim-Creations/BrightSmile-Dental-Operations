import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useBookingModal } from '../context/BookingModalContext';

export const PreFooterCTA: React.FC = () => {
  const { openBookingModal } = useBookingModal();

  return (
    <section className="bg-gradient-to-r from-brand-700 via-brand-600 to-cyanCustom-600 py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md items-center justify-center shrink-0 border border-white/20 shadow-inner">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Transform Your Smile?
            </h3>
            <p className="text-brand-100 text-sm sm:text-base mt-1 max-w-xl">
              Book your appointment today and take the first step toward a healthier, brighter smile!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openBookingModal()}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm sm:text-base text-brand-700 bg-white hover:bg-brand-50 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0 group"
        >
          <span>Book Appointment</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};
