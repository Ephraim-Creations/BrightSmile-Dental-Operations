import React from 'react';
import { ArrowRight, Star, Sparkles, HeartHandshake, Award, DollarSign, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useBookingModal } from '../context/BookingModalContext';

export const HeroSection: React.FC = () => {
  const { openBookingModal } = useBookingModal();

  const handleServicesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const servicesEl = document.getElementById('services');
    if (servicesEl) {
      servicesEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featurePills = [
    { text: 'Advanced Technology', icon: Sparkles },
    { text: 'Gentle & Compassionate Care', icon: HeartHandshake },
    { text: 'Experienced Dentists', icon: Award },
    { text: 'Affordable Pricing', icon: DollarSign },
    { text: 'Convenient Appointments', icon: CalendarCheck },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f0fdfa]/60 via-white to-white pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Decorative background glow blurs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-cyanCustom-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines, Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs sm:text-sm font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
              <span>HEALTHY SMILE. HAPPY LIFE.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.12]">
              Exceptional Care <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-teal-600 to-cyanCustom-600">
                for Every Smile.
              </span>
            </h1>

            {/* Subcopy */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed">
              We combine advanced technology with a gentle touch to provide personalized dental care for you and your family. Experience stress-free dentistry designed around your comfort.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
              <button
                type="button"
                onClick={() => openBookingModal()}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-brand-600 to-cyanCustom-600 hover:from-brand-700 hover:to-cyanCustom-700 shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#services"
                onClick={handleServicesClick}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-base font-bold text-brand-700 bg-brand-50/80 hover:bg-brand-100/80 border border-brand-200/80 transition-all"
              >
                <span>Our Services</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Social Proof Avatars & Rating */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3 overflow-hidden">
                <img
                  className="inline-block h-11 w-11 rounded-full ring-2 ring-white object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Patient"
                />
                <img
                  className="inline-block h-11 w-11 rounded-full ring-2 ring-white object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Patient"
                />
                <img
                  className="inline-block h-11 w-11 rounded-full ring-2 ring-white object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                  alt="Patient"
                />
                <img
                  className="inline-block h-11 w-11 rounded-full ring-2 ring-white object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                  alt="Patient"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm font-bold text-navy-900 ml-1">4.9</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  (320+ Verified Patient Reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Clinical Imagery & Overlay Badge */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Decorative Ring */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-brand-500/20 to-cyanCustom-400/20 rounded-[2.5rem] blur-xl opacity-70" />

              {/* Main Photo Card */}
              <div className="relative rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 aspect-[4/5] sm:aspect-[4/4.5] lg:aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern Gentle Dental Care in Clinical Setting"
                  className="w-full h-full object-cover object-center"
                />
                {/* Subtle gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Feature Overlay Card (Replicating Reference Design) */}
              <div className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-6 bg-gradient-to-br from-brand-700 via-brand-600 to-cyanCustom-700 text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl shadow-brand-900/30 border border-brand-400/30 max-w-[260px] sm:max-w-[290px] backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-brand-500/40">
                  <CheckCircle2 className="w-5 h-5 text-brand-200" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-brand-100">
                    Why BrightSmile
                  </span>
                </div>

                <div className="space-y-2.5">
                  {featurePills.map((pill, idx) => {
                    const Icon = pill.icon;
                    return (
                      <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-white/95">
                        <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                          <Icon className="w-3 h-3 text-brand-200" />
                        </div>
                        <span className="leading-tight">{pill.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
