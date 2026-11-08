import React from 'react';
import { Phone, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useBookingModal } from '../context/BookingModalContext';

export const StickyMobileBar: React.FC = () => {
  const { openBookingModal } = useBookingModal();

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/api/settings'),
  });

  const phone = settingsData?.settings?.phone || '(555) 123-4567';
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
        {/* Call Now Button */}
        <a
          href={`tel:${cleanPhone}`}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm text-navy-900 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-center border border-slate-200"
        >
          <Phone className="w-4 h-4 text-brand-600" />
          <span>Call Now</span>
        </a>

        {/* Book Online Button */}
        <button
          type="button"
          onClick={() => openBookingModal()}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-cyanCustom-600 hover:from-brand-700 hover:to-cyanCustom-700 shadow-md shadow-brand-600/30 active:scale-95 transition-all text-center"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Online</span>
        </button>
      </div>
    </div>
  );
};
