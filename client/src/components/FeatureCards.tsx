import React from 'react';
import { ShieldCheck, Heart, Calendar, Stethoscope, Sparkles } from 'lucide-react';

export const FeatureCards: React.FC = () => {
  const features = [
    {
      title: 'Comprehensive Care',
      desc: "From routine checkups to advanced treatments, we've got you covered.",
      icon: Sparkles,
    },
    {
      title: 'Advanced Technology',
      desc: 'State-of-the-art equipment for accurate diagnosis and effective treatment.',
      icon: ShieldCheck,
    },
    {
      title: 'Expert Dentists',
      desc: 'Our experienced team is dedicated to your comfort and oral health.',
      icon: Stethoscope,
    },
    {
      title: 'Patient Comfort',
      desc: 'We prioritize a pain-free, relaxing experience for every patient.',
      icon: Heart,
    },
    {
      title: 'Flexible Scheduling',
      desc: 'Convenient appointment times that fit your busy lifestyle.',
      icon: Calendar,
    },
  ];

  return (
    <section id="features" className="py-12 bg-white relative -mt-6 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative bg-[#fcfdfd] hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-brand-200/80 shadow-sm hover:shadow-card transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center"
              >
                {/* Icon Circle */}
                <div className="w-14 h-14 rounded-2xl bg-brand-50 group-hover:bg-gradient-to-br group-hover:from-brand-500 group-hover:to-cyanCustom-500 text-brand-600 group-hover:text-white flex items-center justify-center mb-4 transition-all duration-300 shadow-sm">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>

                <h3 className="text-base font-bold text-navy-900 mb-2 group-hover:text-brand-700 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {feature.desc}
                </p>

                {/* Subtle bottom accent line on hover */}
                <div className="absolute bottom-0 inset-x-6 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
