import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { api } from '../lib/api';

export const TopUtilityBar: React.FC = () => {
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/api/settings'),
  });

  const settings = settingsData?.settings || {
    clinic_name: 'BrightSmile Dental Clinic',
    phone: '(555) 123-4567',
    address: '123 Smiles Ave, Los Angeles, CA 90001',
    working_hours: 'Mon - Sat: 8:00 AM - 6:00 PM',
    announcement: 'New Patient Special: Get 15% Off on Your First Visit!',
  };

  return (
    <div className="bg-navy-900 text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-navy-800 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left: Announcement Tag */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-brand-500/20 text-brand-300 text-[11px] border border-brand-500/30">
            Special Offer
          </span>
          <span className="text-slate-200 font-medium truncate max-w-xs sm:max-w-md">
            {settings.announcement}
          </span>
        </div>

        {/* Right: Contact details, Address, Hours & Admin Access */}
        <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-slate-400">
          <div className="hidden lg:flex items-center gap-1.5 hover:text-slate-200 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>{settings.address}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 hover:text-slate-200 transition-colors">
            <Clock className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>{settings.working_hours}</span>
          </div>

          <a
            href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`}
            className="flex items-center gap-1.5 text-brand-300 font-semibold hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>{settings.phone}</span>
          </a>

          {/* Quick link to admin portal */}
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-300 bg-navy-800/80 hover:bg-navy-800 px-2 py-1 rounded transition-colors border border-navy-700/60"
            title="Clinic Administrative Dashboard"
          >
            <ShieldCheck className="w-3 h-3 text-brand-400" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
