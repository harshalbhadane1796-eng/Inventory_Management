import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  PlusCircle,
  ClipboardList,
  Eye,
  Boxes,
  ArrowRight,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';
import { InventoryRequest } from '../../types';

interface RequestorDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const RequestorDashboard: React.FC<RequestorDashboardProps> = ({ onNavigate }) => {
  const { currentUser, requests, items } = useInventory();
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);

  // Filter requests for current user
  const myRequests = requests.filter(
    (r) => r.requestorId === currentUser.id || currentUser.role === 'ADMIN'
  );

  const pendingCount = myRequests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = myRequests.filter((r) => r.status === 'APPROVED').length;
  const issuedCount = myRequests.filter((r) => r.status === 'ISSUED').length;
  const rejectedCount = myRequests.filter((r) => r.status === 'REJECTED').length;

  const recentRequests = myRequests.slice(0, 5);

  return (
    <div id="requestor-dashboard" className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
            Requestor Portal · {currentUser?.department || 'Operations'}
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Welcome back, {currentUser?.name || 'Requestor'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Requisition auxiliary supplies, track multi-item approvals, and inspect real-time stock levels across all 70 catalog items.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            id="quick-new-request-btn"
            onClick={() => onNavigate('new_request')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-sky-400" />
            New Request
          </button>
          <button
            id="quick-view-items-btn"
            onClick={() => onNavigate('my_requests')}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors border border-slate-200 flex items-center gap-1.5"
          >
            <ClipboardList className="w-4 h-4" />
            My Requests
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card */}
        <div
          id="summary-card-pending"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Requests</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            {pendingCount}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
            <span>Awaiting supervisor review</span>
          </div>
        </div>

        {/* Approved Card */}
        <div
          id="summary-card-approved"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approved Requests</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            {approvedCount}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            <span>Authorized by management</span>
          </div>
        </div>

        {/* Issued Card */}
        <div
          id="summary-card-issued"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Issued Requests</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            {issuedCount}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            <span>Fulfilled & deducted from stock</span>
          </div>
        </div>

        {/* Rejected Card */}
        <div
          id="summary-card-rejected"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rejected Requests</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            {rejectedCount}
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">
            <span>With reason logged</span>
          </div>
        </div>
      </div>

      {/* Request Lifecycle Visualization Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-xs font-bold text-slate-900 mb-3 flex items-center justify-between">
          <span>Standard Request Lifecycle</span>
          <span className="text-[11px] font-normal text-slate-500">
            Automated stock deduction only occurs upon approval
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Step 1</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">Submitted</div>
            <div className="text-[11px] text-slate-500 mt-1">Multi-item form validated against stock</div>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="text-[10px] font-bold text-amber-600 uppercase">Step 2</div>
            <div className="text-xs font-bold text-amber-900 mt-0.5">Pending Approval</div>
            <div className="text-[11px] text-amber-700 mt-1">Approver checks live stock & purpose</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-[10px] font-bold text-blue-600 uppercase">Step 3</div>
            <div className="text-xs font-bold text-blue-900 mt-0.5">Approved</div>
            <div className="text-[11px] text-blue-700 mt-1">Stock deducted atomically & transaction logged</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="text-[10px] font-bold text-emerald-600 uppercase">Step 4</div>
            <div className="text-xs font-bold text-emerald-900 mt-0.5">Issued / Fulfilled</div>
            <div className="text-[11px] text-emerald-700 mt-1">Procurement alerted if stock ≤ reorder level</div>
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">My Recent Requests</h3>
            <p className="text-xs text-slate-500">Track current status and approver reviews</p>
          </div>
          <button
            onClick={() => onNavigate('my_requests')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            View all ({myRequests.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No requests created yet. Click "New Request" to create your first requisition.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Request ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Number of Items</th>
                  <th className="px-6 py-3">Total Quantity</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Approver</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests.map((req) => {
                  const totalQty = req.items.reduce((sum, i) => sum + i.requestedQuantity, 0);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                        {req.id}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {new Date(req.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {req.items.length} {req.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">
                        {totalQty}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {req.approverName || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          id={`view-req-${req.id}`}
                          onClick={() => setSelectedRequest(req)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
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

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {selectedRequest.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">Request Details</h3>
              </div>
              <StatusBadge status={selectedRequest.status} size="lg" />
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium">Requestor: </span>
                  <span className="font-semibold text-slate-800">{selectedRequest.requestorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Department: </span>
                  <span className="font-semibold text-slate-800">{selectedRequest.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Date Submitted: </span>
                  <span className="text-slate-800">
                    {new Date(selectedRequest.requestDate).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Approver: </span>
                  <span className="text-slate-800">
                    {selectedRequest.approverName || 'Pending Assignment'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Purpose / Reason:</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedRequest.purpose}
                </p>
              </div>

              {selectedRequest.rejectionReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Rejection Reason:
                  </span>
                  <p className="text-xs text-rose-700">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">Requested Items</span>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2">Item Code</th>
                        <th className="px-4 py-2">Item Name</th>
                        <th className="px-4 py-2 text-right">Requested Quantity</th>
                        <th className="px-4 py-2">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRequest.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                            {item.itemCode}
                          </td>
                          <td className="px-4 py-2.5 text-slate-800 font-medium">
                            {item.itemName}
                          </td>
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-900 text-right">
                            {item.requestedQuantity}
                          </td>
                          <td className="px-4 py-2.5 text-slate-500">{item.unitOfMeasurement}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
