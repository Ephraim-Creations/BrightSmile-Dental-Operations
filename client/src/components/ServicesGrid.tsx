import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, ShieldCheck, Smile, HeartHandshake, Clock, Stethoscope } from 'lucide-react';
import { api } from '../lib/api';
import { useBookingModal } from '../context/BookingModalContext';

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  icon_reference: string;
  image_url?: string;
  is_active: number;
}

const iconMap: Record<string, React.ElementType> = {
  Tooth: Stethoscope,
  Sparkles: Sparkles,
  ShieldCheck: ShieldCheck,
  Smile: Smile,
  HeartHandshake: HeartHandshake,
  Clock: Clock,
  Default: Stethoscope,
};

export const ServicesGrid: React.FC = () => {
  const { openBookingModal } = useBookingModal();

  const { data, isLoading, isError } = useQuery<{ success: boolean; services: ServiceItem[] }>({
    queryKey: ['services'],
    queryFn: () => api.get('/api/services'),
  });

  const services = data?.services || [];

  return (
    <section id="services" className="py-20 bg-slate-50/70 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-brand-600 mb-3 block">
            OUR SERVICES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight leading-tight mb-4">
            Complete Dental Care Solutions
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            From routine cleanings to sophisticated cosmetic and surgical treatments, our experienced clinical team delivers gentle, world-class dental care.
          </p>
        </div>

        {/* Loading state skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
                <div className="h-52 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="h-6 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-5/6 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-red-100 p-8 max-w-md mx-auto">
            <p className="text-red-600 font-semibold mb-2">Unable to load services currently.</p>
            <p className="text-sm">Please refresh the page or contact our front desk at (555) 123-4567.</p>
          </div>
        )}

        {/* Services Grid (6 Core items matching reference) */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = iconMap[service.icon_reference] || iconMap.Default;

              return (
                <div
                  key={service.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-brand-300 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Service Image Banner with overlay */}
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <img
                        src={service.image_url || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80'}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 to-transparent opacity-60" />

                      {/* Overlapping Round Floating Icon */}
                      <div className="absolute -bottom-5 left-6 w-12 h-12 rounded-2xl bg-white border-2 border-brand-100 shadow-md flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white group-hover:border-transparent transition-all duration-300">
                        <IconComponent className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="pt-8 px-6 pb-4">
                      <h3 className="text-xl font-bold text-navy-900 mb-2.5 group-hover:text-brand-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Action */}
                  <div className="px-6 pb-6 pt-2">
                    <button
                      type="button"
                      onClick={() => openBookingModal(service.title)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 group-hover:translate-x-1 transition-all"
                    >
                      <span>Book Consultation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Services / Callout CTA */}
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={() => openBookingModal()}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white bg-navy-900 hover:bg-navy-800 shadow-md transition-all hover:shadow-lg"
          >
            <span>Schedule an Appointment for Any Service</span>
            <ArrowRight className="w-4 h-4 text-brand-400" />
          </button>
        </div>
      </div>
    </section>
  );
};
