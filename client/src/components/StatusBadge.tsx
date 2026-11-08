import React from 'react';
import { Clock, CheckCircle2, CheckCheck, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
          <span>Pending</span>
        </span>
      );
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
          <CheckCircle2 className="w-3 h-3 text-teal-600" />
          <span>Confirmed</span>
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCheck className="w-3 h-3 text-blue-600" />
          <span>Completed</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-500" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};
