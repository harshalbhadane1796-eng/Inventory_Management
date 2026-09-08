import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Boxes,
  FileText,
  User,
  Building,
  Calendar,
  Layers,
  Sparkles,
  Mail,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';

interface ApprovalDetailPageProps {
  requestId: string;
  onBack: () => void;
}

export const ApprovalDetailPage: React.FC<ApprovalDetailPageProps> = ({
  requestId,
  onBack,
}) => {
  const { requests, items, approveRequest, rejectRequest, getStockStatus } = useInventory();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const request = requests.find((r) => r.id === requestId);

  if (!request) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-700">Request not found.</p>
        <button
          onClick={onBack}
          className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
        >
          Back to Approvals
        </button>
      </div>
    );
  }

  // Calculate live item inventory stats for this request
  const lineItemDetails = request.items.map((lineItem) => {
    const invItem = items.find(
      (i) => i.id === lineItem.itemId || i.itemCode === lineItem.itemCode
    );
    const currentStock = invItem ? invItem.currentStock : 0;
    const reorderLevel = invItem ? invItem.reorderLevel : 0;
    const isSufficient = currentStock >= lineItem.requestedQuantity;
    const remainingAfterApproval = currentStock - lineItem.requestedQuantity;
    const willTriggerLowStock = remainingAfterApproval <= reorderLevel;

    return {
      ...lineItem,
      currentStock,
      reorderLevel,
      isSufficient,
      remainingAfterApproval,
      willTriggerLowStock,
      invItem,
    };
  });

  const hasInsufficientStock = lineItemDetails.some((i) => !i.isSufficient);
  const isPending = request.status === 'PENDING';

  const handleApprove = () => {
    setActionFeedback(null);
    const res = approveRequest(request.id);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: `Request ${request.id} successfully approved! Stock has been atomically deducted, transaction recorded, and threshold checks performed.`,
      });
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Failed to approve request.',
      });
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    const res = rejectRequest(request.id, rejectReason.trim());
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: `Request ${request.id} has been REJECTED. Rejection reason recorded, and requestor notified.`,
      });
      setShowRejectModal(false);
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Failed to reject request.',
      });
    }
  };

  return (
    <div id="approval-detail-page" className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-approvals-btn"
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Approvals
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Status:</span>
          <StatusBadge status={request.status} size="lg" />
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* INSUFFICIENT STOCK WARNING BANNER (Section 6 requirement) */}
      {hasInsufficientStock && isPending && (
        <div
          id="insufficient-stock-alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 shadow-xs flex items-start gap-3.5"
        >
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-sm text-rose-800">
              CANNOT APPROVE: Insufficient Warehouse Stock
            </h4>
            <p className="mt-1 text-rose-700 leading-relaxed">
              One or more requested line items exceed the current warehouse stock level. To maintain inventory integrity, stock must be replenished (via Stock In or Purchasing) before this requisition can be approved.
            </p>
          </div>
        </div>
      )}

      {/* Main Request Meta Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Requisition Authorization Request
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-mono flex items-center gap-2">
              {request.id}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Priority:</span>
            <StatusBadge status={request.priority} size="sm" />
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-200 bg-slate-50/20 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block mb-0.5">Requestor</span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              {request.requestorName}
            </div>
            <div className="text-[11px] text-slate-500">{request.requestorEmail}</div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-0.5">Department</span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              {request.department}
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-0.5">Submission Date</span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {new Date(request.requestDate).toLocaleDateString()}
            </div>
            <div className="text-[11px] text-slate-500">
              {new Date(request.requestDate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-0.5">Current Status</span>
            <div>
              <StatusBadge status={request.status} size="sm" />
            </div>
            {request.approverName && (
              <div className="text-[11px] text-slate-500 mt-1">
                Reviewed by: {request.approverName}
              </div>
            )}
          </div>
        </div>

        {/* Purpose & Remarks */}
        <div className="p-6 border-b border-slate-200 space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Purpose / Reason for Requisition
            </h4>
            <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {request.purpose}
            </p>
          </div>

          {request.remarks && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Requester Remarks
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {request.remarks}
              </p>
            </div>
          )}

          {request.rejectionReason && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                <XCircle className="w-4 h-4 text-rose-600" />
                Rejection Reason Logged:
              </h4>
              <p className="text-xs text-rose-700">{request.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Requisition Line Items & Live Warehouse Comparison */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Requisition Line Items & Stock Availability Check
              </h3>
              <p className="text-[11px] text-slate-500">
                Compares requested quantities directly against live warehouse balance.
              </p>
            </div>
            <div className="text-xs font-medium text-slate-500">
              {lineItemDetails.length} {lineItemDetails.length === 1 ? 'item' : 'items'}
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Item Code</th>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3 text-right">Requested Qty</th>
                  <th className="px-4 py-3 text-right">Current Stock</th>
                  <th className="px-4 py-3 text-right">Reorder Level</th>
                  <th className="px-4 py-3 text-right">Post-Approval Stock</th>
                  <th className="px-4 py-3 text-center">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItemDetails.map((line, idx) => {
                  return (
                    <tr
                      key={idx}
                      className={
                        !line.isSufficient ? 'bg-rose-50/50' : 'hover:bg-slate-50/50'
                      }
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {line.itemCode}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {line.itemName}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 text-right">
                        {line.requestedQuantity} {line.unitOfMeasurement}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 text-right">
                        {line.currentStock} {line.unitOfMeasurement}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-right">
                        {line.reorderLevel}
                      </td>
                      <td className="px-4 py-3 font-mono text-right">
                        <span
                          className={`font-bold ${
                            line.remainingAfterApproval < 0
                              ? 'text-rose-600'
                              : line.willTriggerLowStock
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {line.remainingAfterApproval}
                        </span>
                        {line.willTriggerLowStock && line.remainingAfterApproval >= 0 && (
                          <span className="block text-[10px] text-amber-600 font-sans font-medium">
                            Triggers Reorder Alert
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {line.isSufficient ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            SUFFICIENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                            DEFICIT (Short {line.requestedQuantity - line.currentStock})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Decision Footer */}
        {isPending ? (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              {hasInsufficientStock ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Approval disabled until inventory is replenished.
                </span>
              ) : (
                <span className="text-slate-600">
                  Ready for authorization. Approving will automatically deduct stock and issue transaction.
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 self-end sm:self-auto">
              <button
                id="reject-modal-trigger-btn"
                onClick={() => {
                  setShowRejectModal(true);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Reject Request
              </button>

              <button
                id="approve-action-btn"
                onClick={handleApprove}
                disabled={hasInsufficientStock}
                className={`px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                  hasInsufficientStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
                title={
                  hasInsufficientStock
                    ? 'Cannot approve: Requested quantity exceeds current available stock.'
                    : 'Approve and immediately deduct stock'
                }
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve & Issue Stock
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              This request was finalized on{' '}
              {request.approvalDate
                ? new Date(request.approvalDate).toLocaleString()
                : 'a previous date'}
              .
            </span>
            <button
              onClick={onBack}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
            >
              Back to List
            </button>
          </div>
        )}
      </div>

      {/* Mandatory Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <XCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Reject Request {request.id}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Per compliance rules, a specific reason must be provided to the requestor. No inventory will be deducted.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Exceeds monthly departmental budget allocation; alternate item AUX-022 recommended..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-rejection-btn"
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
