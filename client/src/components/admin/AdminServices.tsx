import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Sparkles, X } from 'lucide-react';
import { api } from '../../lib/api';

export const AdminServices: React.FC = () => {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconReference, setIconReference] = useState('Tooth');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Query all services (including inactive)
  const { data, isLoading } = useQuery({
    queryKey: ['services', { all: true }],
    queryFn: () => api.get('/api/services?all=true'),
  });

  const services = data?.services || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newService: any) => api.post('/api/services', newService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      handleCloseModal();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/api/services/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      handleCloseModal();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  // Toggle active switch
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      api.put(`/api/services/${id}`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setTitle('');
    setDescription('');
    setIconReference('Tooth');
    setImageUrl('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (service: any) => {
    setEditingService(service);
    setTitle(service.title);
    setDescription(service.description);
    setIconReference(service.icon_reference);
    setImageUrl(service.image_url || '');
    setIsActive(Boolean(service.is_active));
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      icon_reference: iconReference,
      image_url: imageUrl.trim() || undefined,
      is_active: isActive,
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Services Management
          </h2>
          <p className="text-sm text-slate-500">
            Add, update, or archive dental treatments showcased on the public website
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading services catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any) => (
            <div
              key={service.id}
              className={`bg-white rounded-3xl overflow-hidden border shadow-sm transition-all flex flex-col justify-between ${
                service.is_active ? 'border-slate-200/80 hover:border-brand-300' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={service.image_url || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80'}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => toggleActiveMutation.mutate({ id: service.id, is_active: !service.is_active })}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1 ${
                        service.is_active
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {service.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{service.is_active ? 'Active' : 'Archived'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{service.icon_reference}</span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-2">{service.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(service)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Service</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${service.title}"?`)) {
                      deleteMutation.mutate(service.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy-900">
                {editingService ? 'Edit Dental Service' : 'Add New Dental Service'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Laser Teeth Whitening"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief clinical description for prospective patients..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-navy-900 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Icon Reference
                  </label>
                  <select
                    value={iconReference}
                    onChange={(e) => setIconReference(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 bg-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Tooth">Tooth (Stethoscope)</option>
                    <option value="Sparkles">Sparkles (Cosmetic)</option>
                    <option value="ShieldCheck">Shield (Implants)</option>
                    <option value="Smile">Smile (Orthodontics)</option>
                    <option value="HeartHandshake">Heart (Pediatric)</option>
                    <option value="Clock">Clock (Emergency)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Active Status
                  </label>
                  <div className="flex items-center h-10">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
                      <span className="ml-2 text-xs font-semibold text-slate-700">
                        {isActive ? 'Published' : 'Draft'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
