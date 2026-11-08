import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin, Send, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useBookingModal } from '../context/BookingModalContext';

export const Footer: React.FC = () => {
  const { openBookingModal } = useBookingModal();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/api/settings'),
  });

  const settings = settingsData?.settings || {
    clinic_name: 'BrightSmile Dental Clinic',
    phone: '(555) 123-4567',
    address: '123 Smiles Ave, Los Angeles, CA 90001',
    working_hours: 'Mon - Sat: 8:00 AM - 6:00 PM',
    email: 'contact@brightsmile.com',
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer id="contact" className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-navy-900">
          {/* Col 1: Brand Info & Socials */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-cyanCustom-500 flex items-center justify-center text-white shadow-md">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6.5 2.5 10 .5 1.8 1.5 4 3.5 4s3-2.2 3.5-4c1-3.5 2.5-7 2.5-10 0-3.5-2.5-6-6-6z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white tracking-tight">
                  Bright<span className="text-brand-400">Smile</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
                  Dental Clinic
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              We provide exceptional dental care with a gentle touch. Your smile, comfort, and lifelong oral health are our highest passion.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#contact"
                className="w-9 h-9 rounded-full bg-navy-900 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="w-9 h-9 rounded-full bg-navy-900 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="w-9 h-9 rounded-full bg-navy-900 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs uppercase font-extrabold text-white tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#about" className="hover:text-brand-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-brand-400 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-brand-400 transition-colors">
                  For Patients
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-brand-400 transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openBookingModal()}
                  className="hover:text-brand-400 transition-colors text-left"
                >
                  Book Appointment
                </button>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 transition-colors font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="lg:col-span-3">
            <h4 className="text-xs uppercase font-extrabold text-white tracking-wider mb-4">
              Our Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => openBookingModal('General Dentistry')}
                  className="hover:text-brand-400 transition-colors text-left"
                >
                  General Dentistry
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openBookingModal('Cosmetic Dentistry')}
                  className="hover:text-brand-400 transition-colors text-left"
                >
                  Cosmetic Dentistry & Whitening
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openBookingModal('Dental Implants')}
                  className="hover:text-brand-400 transition-colors text-left"
                >
                  Permanent Dental Implants
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openBookingModal('Orthodontics')}
                  className="hover:text-brand-400 transition-colors text-left"
                >
                  Orthodontics & Aligners
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openBookingModal('Pediatric Dentistry')}
                  className="hover:text-brand-400 transition-colors text-left"
                >
                  Pediatric Dentistry
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openBookingModal('Emergency Care')}
                  className="hover:text-brand-400 transition-colors text-left"
                >
                  Emergency Dental Care
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Newsletter */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <h4 className="text-xs uppercase font-extrabold text-white tracking-wider mb-1">
              Contact & Hours
            </h4>

            <div className="space-y-2.5 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`} className="hover:text-brand-400 transition-colors">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-brand-400 transition-colors">
                  {settings.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{settings.working_hours}</span>
              </div>
            </div>

            {/* Newsletter input */}
            <div className="pt-3">
              <p className="text-xs text-slate-400 mb-2">
                Subscribe for dental wellness tips & seasonal offers:
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-navy-900 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 flex-1"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center justify-center transition-colors shrink-0"
                  title="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              {subscribed && (
                <p className="text-[11px] text-brand-400 mt-1.5 animate-fadeIn">
                  Thank you! You have been subscribed.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BrightSmile Dental Clinic. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#contact" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#contact" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </a>
            <a href="#contact" className="hover:text-slate-400 transition-colors">
              HIPAA Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
