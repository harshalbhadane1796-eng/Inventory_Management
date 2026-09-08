import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  FileCheck,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';
import { InventoryRequest } from '../../types';

interface ApproverDashboardProps {
  onNavigate: (tabId: string) => void;
  onOpenApprovalDetail: (requestId: string) => void;
}

export const ApproverDashboard: React.FC<ApproverDashboardProps> = ({
  onNavigate,
  onOpenApprovalDetail,
}) => {
  const { requests, approveRequest, rejectRequest, items } = useInventory();

  const [quickRejectReq, setQuickRejectReq] = useState<InventoryRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  // Stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const approvedToday = requests.filter(
    (r) => r.status === 'ISSUED' && typeof r.approvalDate === 'string' && r.approvalDate.startsWith(todayStr)
  ).length;
  const rejectedToday = requests.filter(
    (r) => r.status === 'REJECTED' && typeof r.approvalDate === 'string' && r.approvalDate.startsWith(todayStr)
  ).length;
  const totalThisMonth = requests.length;

  const handleQuickApprove = (reqId: string) => {
    setFeedback(null);
    const res = approveRequest(reqId);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Request ${reqId} approved successfully! Stock deducted atomically & transactions created.`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to approve request.',
      });
    }
  };

  const handleConfirmQuickReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRejectReq || !rejectReason.trim()) return;

    const res = rejectRequest(quickRejectReq.id, rejectReason.trim());
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Request ${quickRejectReq.id} has been rejected. Requestor notified.`,
      });
      setQuickRejectReq(null);
      setRejectReason('');
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to reject request.',
      });
    }
  };

  return (
    <div id="approver-dashboard" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            Management & Approval Engine
          </div>
          <h2 className="text-xl font-bold text-slate-900">Approvals Command Center</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review requisition line items, inspect live warehouse stocks, and authorize atomic inventory issuance with automated threshold checking.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('approval_history')}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors border border-slate-200 flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            Approval History
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Requires authorization
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approved Today</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            {approvedToday}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            Stock issued atomically
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rejected Today</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            {rejectedToday}
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">
            Zero stock deducted
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Requests This Month</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            {totalThisMonth}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            System activity volume
          </div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pending Employee Requests ({pendingRequests.length})
            </h3>
            <p className="text-xs text-slate-500">
              Review requester items, verify real-time available stock, and issue approvals.
            </p>
          </div>
          <div className="text-xs font-medium text-slate-500">
            Atomic validation active
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No requests currently pending approval. All caught up!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Request ID</th>
                  <th className="px-6 py-3">Requestor</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Request Date</th>
                  <th className="px-6 py-3">Line Items</th>
                  <th className="px-6 py-3">Total Qty</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Stock Check</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.map((req) => {
                  const totalUnits = req.items.reduce((s, i) => s + i.requestedQuantity, 0);

                  // Check if any line item has insufficient stock
                  const hasInsufficient = req.items.some((reqItem) => {
                    const inv = items.find((i) => i.id === reqItem.itemId || i.itemCode === reqItem.itemCode);
                    return !inv || reqItem.requestedQuantity > inv.currentStock;
                  });

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                        {req.id}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        {req.requestorName}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {req.department}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {new Date(req.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-slate-800">
                          {req.items.length} {req.items.length === 1 ? 'item' : 'items'}
                        </span>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {req.items.map((i) => `${i.requestedQuantity}x ${i.itemCode}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                        {totalUnits}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={req.priority} size="sm" />
                      </td>
                      <td className="px-6 py-3.5">
                        {hasInsufficient ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            INSUFFICIENT STOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            SUFFICIENT
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-1.5">
                        {/* View Details button */}
                        <button
                          id={`review-req-${req.id}`}
                          onClick={() => onOpenApprovalDetail(req.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          Review & Decide
                        </button>

                        {/* Direct Quick Approve Button */}
                        <button
                          id={`quick-approve-${req.id}`}
                          onClick={() => handleQuickApprove(req.id)}
                          disabled={hasInsufficient}
                          className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                            hasInsufficient
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          }`}
                          title={
                            hasInsufficient
                              ? 'Cannot approve: insufficient stock'
                              : 'Approve & Issue stock atomically'
                          }
                        >
                          Approve
                        </button>

                        {/* Direct Quick Reject Button */}
                        <button
                          id={`quick-reject-${req.id}`}
                          onClick={() => {
                            setQuickRejectReq(req);
                            setRejectReason('');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                        >
                          Reject
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

      {/* Quick Rejection Modal */}
      {quickRejectReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <XCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Reject Request {quickRejectReq.id}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              A mandatory rejection reason is required. No inventory will be deducted, and the requestor will be notified immediately.
            </p>

            <form onSubmit={handleConfirmQuickReject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Requested quantity exceeds budget allocation; please requisition in smaller quantities..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickRejectReq(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-reject-btn"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
