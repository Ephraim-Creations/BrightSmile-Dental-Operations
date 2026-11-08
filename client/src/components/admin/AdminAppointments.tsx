import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  CheckCircle2,
  CheckCheck,
  XCircle,
  Trash2,
  Eye,
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';
import { api } from '../../lib/api';
import { StatusBadge } from '../StatusBadge';

export const AdminAppointments: React.FC = () => {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  // TanStack Query for fetching appointments
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['appointments', { status: statusFilter, search: searchQuery }],
    queryFn: () => {
      let url = '/api/appointments?';
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}&`;
      return api.get(url);
    },
  });

  const appointments = data?.appointments || [];

  // Mutation to update appointment status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/api/appointments/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  // Mutation to delete appointment
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      if (selectedAppt) setSelectedAppt(null);
    },
  });

  const tabs = [
    { id: 'all', label: 'All Requests' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Patient Appointments
          </h2>
          <p className="text-sm text-slate-500">
            Review, confirm, schedule, or update incoming patient requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total: {appointments.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, phone, service..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">No appointments found</p>
            <p className="text-xs text-slate-400">Try adjusting your status filter or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Patient</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Service Requested</th>
                  <th className="py-3.5 px-6">Scheduled Date & Time</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {appointments.map((appt: any) => (
                  <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Patient Name & Ref */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-navy-900">{appt.patient_name}</span>
                        <span className="text-[11px] font-mono text-slate-400">Ref: #BS-{appt.id}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-6 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <a href={`tel:${appt.phone}`} className="hover:text-brand-600">
                          {appt.phone}
                        </a>
                      </div>
                      {appt.email && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[150px]">{appt.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Service */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50/70 text-brand-800 border border-brand-100">
                        <Sparkles className="w-3 h-3 text-brand-500" />
                        <span>{appt.service_requested}</span>
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <div className="font-bold text-navy-900">{appt.preferred_date}</div>
                      <div className="text-slate-500">{appt.preferred_time || 'Morning'}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <StatusBadge status={appt.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Status Toggles */}
                        {appt.status !== 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => updateStatusMutation.mutate({ id: appt.id, status: 'confirmed' })}
                            className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 border border-teal-200 transition-colors"
                            title="Confirm Appointment"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {appt.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => updateStatusMutation.mutate({ id: appt.id, status: 'completed' })}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                            title="Mark Completed"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}

                        {appt.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => updateStatusMutation.mutate({ id: appt.id, status: 'cancelled' })}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors"
                            title="Cancel Appointment"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Details Modal Trigger */}
                        <button
                          type="button"
                          onClick={() => setSelectedAppt(appt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                          title="View Details & Notes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete appointment record for ${appt.patient_name}?`)) {
                              deleteMutation.mutate(appt.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono text-slate-400">Appointment Record</span>
                <h3 className="text-xl font-bold text-navy-900">
                  {selectedAppt.patient_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppt(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Phone</span>
                  <a href={`tel:${selectedAppt.phone}`} className="font-bold text-brand-700 hover:underline">
                    {selectedAppt.phone}
                  </a>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Email</span>
                  <span className="font-semibold text-slate-700">{selectedAppt.email || 'None provided'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Service</span>
                  <span className="font-bold text-navy-900">{selectedAppt.service_requested}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Preferred Slot</span>
                  <span className="font-bold text-navy-900">{selectedAppt.preferred_date} • {selectedAppt.preferred_time}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block mb-1">Patient Clinical Notes</span>
                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-xs text-slate-700 leading-relaxed italic">
                  {selectedAppt.notes || 'No special clinical notes submitted with this request.'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-medium">Current Status</span>
                <StatusBadge status={selectedAppt.status} />
              </div>
            </div>

            {/* Actions in Modal */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  updateStatusMutation.mutate({ id: selectedAppt.id, status: 'confirmed' });
                  setSelectedAppt({ ...selectedAppt, status: 'confirmed' });
                }}
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors text-center"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => {
                  updateStatusMutation.mutate({ id: selectedAppt.id, status: 'completed' });
                  setSelectedAppt({ ...selectedAppt, status: 'completed' });
                }}
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors text-center"
              >
                Complete
              </button>
              <button
                type="button"
                onClick={() => {
                  updateStatusMutation.mutate({ id: selectedAppt.id, status: 'cancelled' });
                  setSelectedAppt({ ...selectedAppt, status: 'cancelled' });
                }}
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
