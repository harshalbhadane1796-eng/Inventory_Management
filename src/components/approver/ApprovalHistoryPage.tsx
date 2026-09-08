import React, { useState } from 'react';
import {
  Search,
  Eye,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';
import { InventoryRequest } from '../../types';

interface ApprovalHistoryPageProps {
  onOpenApprovalDetail: (requestId: string) => void;
}

export const ApprovalHistoryPage: React.FC<ApprovalHistoryPageProps> = ({
  onOpenApprovalDetail,
}) => {
  const { requests } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Completed requests (APPROVED, ISSUED, REJECTED)
  const completedRequests = requests.filter(
    (r) => r.status === 'APPROVED' || r.status === 'ISSUED' || r.status === 'REJECTED'
  );

  const filtered = completedRequests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.purpose.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="approval-history-page" className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Approval Decision History</h2>
        <p className="text-xs text-slate-500">
          Permanent log of all historical approvals, issuances, and documented rejections.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Request ID, Requestor, Department..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Filter:</span>
          {['ALL', 'ISSUED', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No historical approval records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Request ID</th>
                  <th className="px-6 py-3">Decision Date</th>
                  <th className="px-6 py-3">Requestor</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Line Items</th>
                  <th className="px-6 py-3">Total Qty</th>
                  <th className="px-6 py-3">Decision</th>
                  <th className="px-6 py-3">Approver</th>
                  <th className="px-6 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => {
                  const totalUnits = req.items.reduce((s, i) => s + i.requestedQuantity, 0);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                        {req.id}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {req.approvalDate
                          ? new Date(req.approvalDate).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        {req.requestorName}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {req.department}
                      </td>
                      <td className="px-6 py-3.5">
                        {req.items.length} {req.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                        {totalUnits}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {req.approverName || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => onOpenApprovalDetail(req.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
