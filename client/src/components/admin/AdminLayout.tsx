import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  User,
  Bell
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { AdminLogin } from './AdminLogin';
import { api } from '../../lib/api';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Query appointment stats to show pending badge
  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/api/appointments/stats'),
    enabled: isAuthenticated,
    refetchInterval: 15000, // Poll every 15s in dashboard for new bookings
  });

  const pendingCount = statsData?.stats?.pending || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Checking administrator authorization...</p>
        </div>
      </div>
    );
  }

  // Not authenticated? Show strict login verification
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    {
      name: 'Appointments',
      href: '/admin/appointments',
      icon: CalendarCheck,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { name: 'Services Management', href: '/admin/services', icon: Stethoscope },
    { name: 'Clinic Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-navy-950 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } border-r border-navy-800 shadow-xl`}
      >
        <div>
          {/* Brand & Clinic Status */}
          <div className="p-6 border-b border-navy-800/80 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-cyanCustom-500 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Bright<span className="text-brand-400">Smile</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-300">
                  Admin System
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Actions */}
        <div className="p-4 border-t border-navy-800/80 space-y-3">
          <div className="px-3 py-2.5 rounded-xl bg-navy-900/80 border border-navy-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">
                {user?.email || 'Clinic Administrator'}
              </span>
              <span className="text-[10px] text-brand-300 font-medium">Verified Administrator</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-300 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 hover:text-red-100 transition-colors border border-red-900/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-navy-900 hidden sm:block">
              BrightSmile Dental Operations
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {pendingCount > 0 && (
              <Link
                to="/admin/appointments"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>{pendingCount} Pending Bookings</span>
              </Link>
            )}

            <div className="text-right text-xs">
              <p className="font-bold text-navy-900">Live Operatory</p>
              <p className="text-slate-400">Dr. Harrison & Team</p>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
