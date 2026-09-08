import React from 'react';
import { StockStatus, RequestStatus, ProcurementStatus, Priority } from '../../types';

interface StatusBadgeProps {
  status: StockStatus | RequestStatus | ProcurementStatus | Priority | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  }[size];

  // Stock statuses
  if (normalized === 'NORMAL') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        NORMAL
      </span>
    );
  }

  if (normalized === 'LOW_STOCK' || normalized === 'LOW') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
        LOW STOCK
      </span>
    );
  }

  if (normalized === 'CRITICAL') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-300 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-ping"></span>
        CRITICAL
      </span>
    );
  }

  if (normalized === 'OUT_OF_STOCK') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-semibold rounded-full bg-slate-900 text-white border border-slate-700 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5"></span>
        OUT OF STOCK
      </span>
    );
  }

  // Request statuses
  if (normalized === 'PENDING') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        PENDING
      </span>
    );
  }

  if (normalized === 'APPROVED') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
        APPROVED
      </span>
    );
  }

  if (normalized === 'ISSUED') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
        ISSUED
      </span>
    );
  }

  if (normalized === 'REJECTED') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-medium rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
        REJECTED
      </span>
    );
  }

  if (normalized === 'CANCELLED') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
      >
        CANCELLED
      </span>
    );
  }

  // Procurement statuses
  if (normalized === 'NEW') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
      >
        NEW
      </span>
    );
  }

  if (normalized === 'ACKNOWLEDGED') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}
      >
        ACKNOWLEDGED
      </span>
    );
  }

  if (normalized === 'IN_PROGRESS') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}
      >
        IN PROGRESS
      </span>
    );
  }

  if (normalized === 'ORDERED') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-medium rounded-full bg-cyan-50 text-cyan-800 border border-cyan-300 ${sizeClasses}`}
      >
        ORDERED
      </span>
    );
  }

  if (normalized === 'RECEIVED') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-medium rounded-full bg-teal-50 text-teal-800 border border-teal-300 ${sizeClasses}`}
      >
        RECEIVED
      </span>
    );
  }

  if (normalized === 'CLOSED') {
    return (
      <span
        id={`status-${normalized.toLowerCase()}`}
        className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
      >
        CLOSED
      </span>
    );
  }

  // Priorities
  if (normalized === 'URGENT') {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-red-100 text-red-800 border border-red-300 ${sizeClasses}`}>
        URGENT
      </span>
    );
  }
  if (normalized === 'HIGH') {
    return (
      <span className={`inline-flex items-center font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-300 ${sizeClasses}`}>
        HIGH
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
      {status}
    </span>
  );
};
