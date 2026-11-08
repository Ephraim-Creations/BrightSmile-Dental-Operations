import React from 'react';
import { Award, Users, Smile, Star, ArrowRight, Check } from 'lucide-react';
import { useBookingModal } from '../context/BookingModalContext';

export const AboutSection: React.FC = () => {
  const { openBookingModal } = useBookingModal();

  const stats = [
    { label: 'Years of Experience', value: '15+', icon: Award },
    { label: 'Expert Dentists', value: '20+', icon: Users },
    { label: 'Happy Patients', value: '5K+', icon: Smile },
    { label: 'Patient Rating', value: '4.9', icon: Star },
  ];

  const highlights = [
    'State-of-the-art 3D imaging & low-radiation digital X-rays',
    'Pain-free sedation options for nervous or anxious patients',
    'Direct insurance billing and transparent, zero-surprise pricing',
    'Sterilization protocols meeting and exceeding OSHA & CDC guidelines',
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Modern Operatory Imagery & Floating Shield */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Decorative background shape */}
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-brand-100 rounded-3xl -z-10 transform -rotate-3" />

              {/* Main Clinic Operatory Photo */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/3] sm:aspect-[16/11]">
                <img
                  src="https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1000&q=80"
                  alt="Bright Modern Dental Operatory Room"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Floating Clinic Badge Overlay */}
              <div className="absolute -bottom-6 sm:-bottom-8 left-6 sm:left-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-100 flex items-center gap-3.5 max-w-xs">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-cyanCustom-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Smile className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accredited Facility</p>
                  <p className="text-sm font-extrabold text-navy-900 leading-tight">BrightSmile Center of Excellence</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative, Key Points, and Stats Grid */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold tracking-wider uppercase">
              ABOUT US
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight leading-tight">
              Your Smile is Our Priority
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              At BrightSmile Dental Clinic, we are committed to providing high-quality dental care in a comfortable, welcoming environment. Our goal is to help you achieve a healthy, radiant smile that lasts a lifetime through compassionate clinical excellence.
            </p>

            {/* Checklist items */}
            <div className="space-y-3 py-2 w-full">
              {highlights.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{point}</span>
                </div>
              ))}
            </div>

            {/* 4 Stats Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 w-full border-t border-slate-100">
              {stats.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-brand-600 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="text-2xl font-extrabold text-navy-900">{item.value}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 leading-snug">{item.label}</p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => openBookingModal()}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all"
              >
                <span>Learn More & Meet Our Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
