import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X, Calendar, ChevronRight } from 'lucide-react';
import { useBookingModal } from '../context/BookingModalContext';

export const Navbar: React.FC = () => {
  const { openBookingModal } = useBookingModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'For Patients', href: '#features' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyanCustom-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              {/* Custom Dental Tooth SVG Icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6.5 2.5 10 .5 1.8 1.5 4 3.5 4s3-2.2 3.5-4c1-3.5 2.5-7 2.5-10 0-3.5-2.5-6-6-6z" />
                <path d="M9.5 7.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-navy-900 tracking-tight leading-tight">
                Bright<span className="text-brand-600">Smile</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Dental Clinic
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('#')) {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }}
                className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 hover:after:w-full after:transition-all after:duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              type="button"
              onClick={() => openBookingModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-cyanCustom-600 hover:from-brand-700 hover:to-cyanCustom-700 shadow-md shadow-brand-600/25 hover:shadow-lg hover:shadow-brand-600/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => openBookingModal()}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-brand-600 shadow-sm"
            >
              Book
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl animate-fadeIn">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('#')) {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}

            <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBookingModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment Online</span>
              </button>

              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-slate-500 hover:text-brand-600"
              >
                Admin Management Portal →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
