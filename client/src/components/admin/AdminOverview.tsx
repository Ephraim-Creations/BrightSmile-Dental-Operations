import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  Calendar,
  Clock,
  CheckCircle2,
  CheckCheck,
  XCircle,
  ArrowRight,
  Phone,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../../lib/api';
import { StatusBadge } from '../StatusBadge';

export const AdminOverview: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/api/appointments/stats'),
  });

  const { data: apptsData, isLoading: apptsLoading, refetch } = useQuery({
    queryKey: ['appointments', { limit: 5 }],
    queryFn: () => api.get('/api/appointments'),
  });

  const { data: servicesData } = useQuery({
    queryKey: ['services', { all: true }],
    queryFn: () => api.get('/api/services?all=true'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/api/appointments/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const stats = statsData?.stats || { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  const appointments = (apptsData?.appointments || []).slice(0, 6);
  const totalServices = servicesData?.services?.length || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-cyanCustom-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
              Welcome Back
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              BrightSmile Administrative Overview
            </h2>
            <p className="text-brand-100 text-sm mt-1 max-w-xl">
              Monitor incoming patient bookings, manage treatment schedules, and update clinic services.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Data</span>
            </button>
            <Link
              to="/admin/appointments"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-brand-50 text-xs font-bold shadow-md transition-all"
            >
              <span>Manage Appointments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Appointments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-3xl font-extrabold text-navy-900 mt-1">
              {statsLoading ? '...' : stats.total}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Lifetime recorded visits</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm flex items-center justify-between bg-amber-50/20">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Action</p>
            <h3 className="text-3xl font-extrabold text-amber-700 mt-1">
              {statsLoading ? '...' : stats.pending}
            </h3>
            <p className="text-xs text-amber-600 mt-1">Awaiting confirmation</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Confirmed Appointments */}
        <div className="bg-white rounded-2xl p-6 border border-teal-200 shadow-sm flex items-center justify-between bg-teal-50/20">
          <div>
            <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">Confirmed</p>
            <h3 className="text-3xl font-extrabold text-teal-700 mt-1">
              {statsLoading ? '...' : stats.confirmed}
            </h3>
            <p className="text-xs text-teal-600 mt-1">Scheduled & ready</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Completed / Total Services */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Services</p>
            <h3 className="text-3xl font-extrabold text-navy-900 mt-1">
              {totalServices}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Clinical offerings listed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Appointments & Fast Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy-900">Recent Patient Appointments</h3>
            <p className="text-xs text-slate-500">Quickly confirm incoming consultation requests</p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            <span>View All ({stats.total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {apptsLoading ? (
          <div className="p-8 text-center text-slate-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No appointments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">ID & Patient</th>
                  <th className="py-3.5 px-6">Service</th>
                  <th className="py-3.5 px-6">Preferred Date & Time</th>
                  <th className="py-3.5 px-6">Phone</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {appointments.map((appt: any) => (
                  <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-navy-900">{appt.patient_name}</span>
                        <span className="text-[11px] font-mono text-slate-400">#BS-{appt.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700">{appt.service_requested}</td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>{appt.preferred_date}</div>
                      <div className="text-xs text-slate-400">{appt.preferred_time || 'Morning'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <a
                        href={`tel:${appt.phone.replace(/[^0-9]/g, '')}`}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-brand-600 font-semibold"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{appt.phone}</span>
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {appt.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => statusMutation.mutate({ id: appt.id, status: 'confirmed' })}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors flex items-center gap-1"
                            title="Confirm Appointment"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        )}
                        {appt.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => statusMutation.mutate({ id: appt.id, status: 'completed' })}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1"
                            title="Mark as Completed"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </button>
                        )}
                        {appt.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => statusMutation.mutate({ id: appt.id, status: 'cancelled' })}
                            className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Cancel Appointment"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
