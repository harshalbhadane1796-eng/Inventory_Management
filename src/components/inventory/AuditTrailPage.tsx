import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  Filter,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const AuditTrailPage: React.FC = () => {
  const { auditLogs } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.performedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;

      let matchesTime = true;
      const now = new Date().getTime();
      const logTime = new Date(log.timestamp).getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (timeFilter === 'TODAY') {
        matchesTime = now - logTime < oneDay;
      } else if (timeFilter === 'WEEK') {
        matchesTime = now - logTime < 7 * oneDay;
      }

      return matchesSearch && matchesAction && matchesTime;
    });
  }, [auditLogs, searchQuery, actionFilter, timeFilter]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.actionType))).sort();
  }, [auditLogs]);

  const handleExportCSV = () => {
    const headers = [
      'Log ID',
      'Timestamp',
      'Action Type',
      'Performed By',
      'User Role',
      'Target Entity',
      'Details',
      'Previous State',
      'New State',
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.actionType}"`,
      `"${log.performedByName}"`,
      `"${log.performedByRole}"`,
      `"${log.targetEntity}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${log.previousState ? JSON.stringify(log.previousState).replace(/"/g, '""') : ''}"`,
      `"${log.newState ? JSON.stringify(log.newState).replace(/"/g, '""') : ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.join('\n')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('APPROVED') || action.includes('RECEIVED')) return 'bg-emerald-100 text-emerald-800';
    if (action.includes('REJECTED') || action.includes('CANCELLED') || action.includes('DEACTIVATED'))
      return 'bg-rose-100 text-rose-800';
    if (action.includes('CREATED') || action.includes('TRIGGERED')) return 'bg-sky-100 text-sky-800';
    if (action.includes('ADJUSTED') || action.includes('UPDATED')) return 'bg-amber-100 text-amber-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div id="audit-trail-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Immutable System Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-proof chronological log recording every request authorization, stock adjustment, item update, and procurement event.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export Audit Trail ({filteredLogs.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Action, Entity, User, Details..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 shrink-0"
          >
            <option value="ALL">All Event Types ({uniqueActions.length})</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 shrink-0"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit records found matching the query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Log ID</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action Type</th>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-4 py-3">Performed By</th>
                  <th className="px-4 py-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {log.id}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getActionBadgeColor(
                          log.actionType
                        )}`}
                      >
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {log.targetEntity}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{log.performedByName}</div>
                      <div className="text-[10px] text-slate-400">
                        {log.performedByRole.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-md">
                      <div>{log.details}</div>
                      {log.previousState && log.newState && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {typeof log.previousState === 'object'
                            ? JSON.stringify(log.previousState)
                            : log.previousState}{' '}
                          →{' '}
                          {typeof log.newState === 'object'
                            ? JSON.stringify(log.newState)
                            : log.newState}
                        </div>
                      )}
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
