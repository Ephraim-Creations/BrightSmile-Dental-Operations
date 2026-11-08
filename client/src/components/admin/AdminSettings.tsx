import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, CheckCircle2, Phone, MapPin, Clock, Mail, Megaphone, Building, Lock, KeyRound, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const { changePassword } = useAuth();

  // Clinic Settings State
  const [clinicName, setClinicName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/api/settings'),
  });

  useEffect(() => {
    if (data?.settings) {
      setClinicName(data.settings.clinic_name || '');
      setPhone(data.settings.phone || '');
      setEmail(data.settings.email || '');
      setAddress(data.settings.address || '');
      setWorkingHours(data.settings.working_hours || '');
      setAnnouncement(data.settings.announcement || '');
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (newSettings: any) => api.put('/api/settings', newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    },
  });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      clinic_name: clinicName,
      phone,
      email,
      address,
      working_hours: workingHours,
      announcement,
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPassword) {
      setPwdError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirmation do not match.');
      return;
    }

    try {
      setPwdLoading(true);
      const res = await changePassword(currentPassword, newPassword);
      setPwdSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(''), 5000);
    } catch (err: any) {
      setPwdError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">
          Clinic Settings & Security
        </h2>
        <p className="text-sm text-slate-500">
          Manage clinic public details, operations, and your administrative login credentials
        </p>
      </div>

      {/* SECTION 1: SECURITY & PASSWORD CHANGE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-navy-900">Administrator Password & Security</h3>
            <p className="text-xs text-slate-500">Update your account password to protect access</p>
          </div>
        </div>

        {pwdSuccess && (
          <div className="flex items-center gap-2.5 p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-semibold">{pwdSuccess}</span>
          </div>
        )}

        {pwdError && (
          <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{pwdError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={pwdLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-navy-900 hover:bg-navy-800 shadow-sm transition-all disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{pwdLoading ? 'Updating Password...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: CLINIC DETAILS & INFORMATION */}
      {saveSuccess && (
        <div className="flex items-center gap-2.5 p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="font-semibold">
            Clinic configuration updated successfully! Changes are live on the public website.
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading clinic configuration...</div>
      ) : (
        <form onSubmit={handleSettingsSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Building className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-900">Clinic Profile & Operating Details</h3>
              <p className="text-xs text-slate-500">Contact information displayed to prospective patients</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Clinic Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinic Brand Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Front Desk Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinical Working Hours
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Physical Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinic Street Address & City
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Top Banner Announcement */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Top Bar Announcement Text
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Megaphone className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="e.g. New Patient Special: Get 15% Off on Your First Visit!"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
