import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'Verified Patient',
      treatment: 'Invisalign & Routine Cleaning',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      comment:
        'The entire team at BrightSmile is extraordinary! As someone who used to have massive dental anxiety, their gentle approach made me feel relaxed and completely pain-free. My teeth have never looked better!',
    },
    {
      id: 2,
      name: 'Michael Torres',
      role: 'Verified Patient',
      treatment: 'Dental Implants',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      comment:
        'Professional, prompt, and truly state-of-the-art. Dr. Harrison explained every phase of my implant surgery. The results feel 100% like my natural teeth. I cannot recommend BrightSmile enough!',
    },
    {
      id: 3,
      name: 'Emily Rogers',
      role: 'Verified Patient',
      treatment: 'Cosmetic Teeth Whitening',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      comment:
        'Great experience every single time! The clinic is spotless and beautiful, and they respect your schedule with zero waiting room delays. My smile makeover gave me so much confidence!',
    },
    {
      id: 4,
      name: 'David Reynolds',
      role: 'Verified Patient',
      treatment: 'Pediatric & Family Dentistry',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
      comment:
        'I bring my two young children here. The pediatric dental team is so patient, funny, and reassuring that my kids actually look forward to their visits! Five stars all around.',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="testimonials" className="py-20 bg-slate-50 border-t border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-brand-600 mb-2 block">
              PATIENT TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
              Loved by Our Patients
            </h2>
          </div>

          {/* Carousel Arrow Buttons */}
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              type="button"
              onClick={prev}
              className="p-3 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="p-3 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[0, 1, 2].map((offset) => {
            const index = (currentIndex + offset) % testimonials.length;
            const item = testimonials[index];

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-brand-200/60" />
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed italic mb-6">
                    "{item.comment}"
                  </p>
                </div>

                {/* Patient Info */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-sm font-bold text-navy-900">{item.name}</h4>
                      <CheckCircle className="w-3.5 h-3.5 text-brand-600 fill-brand-100" />
                    </div>
                    <p className="text-xs text-brand-700 font-medium">{item.treatment}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
