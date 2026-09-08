import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Ban,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  Calendar,
  Layers,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';
import { InventoryRequest, RequestStatus } from '../../types';

interface MyRequestsPageProps {
  onNavigate: (tabId: string) => void;
}

export const MyRequestsPage: React.FC<MyRequestsPageProps> = ({ onNavigate }) => {
  const { currentUser, requests, cancelRequest } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
  const [cancellingReqId, setCancellingReqId] = useState<string | null>(null);

  // Filter requests
  const userRequests = requests.filter(
    (r) => r.requestorId === currentUser.id || currentUser.role === 'ADMIN'
  );

  const filteredRequests = userRequests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.items.some(
        (i) =>
          i.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmCancel = (reqId: string) => {
    cancelRequest(reqId);
    setCancellingReqId(null);
    if (selectedRequest?.id === reqId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
    }
  };

  return (
    <div id="my-requests-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Inventory Requests</h2>
          <p className="text-xs text-slate-500">
            Track requisition lifecycles, approval authorizations, and issuance records.
          </p>
        </div>
        <button
          onClick={() => onNavigate('new_request')}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-sky-400" />
          Create New Request
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Request ID, Item Code, Purpose..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
          {['ALL', 'PENDING', 'APPROVED', 'ISSUED', 'REJECTED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
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

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No matching requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Request ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Line Items</th>
                  <th className="px-6 py-3">Purpose</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Approver</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const totalUnits = req.items.reduce((s, i) => s + i.requestedQuantity, 0);
                  const isPending = req.status === 'PENDING';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                        {req.id}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {new Date(req.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        <div>
                          {req.items.length} {req.items.length === 1 ? 'item' : 'items'} ({totalUnits} total)
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {req.items.map((i) => `${i.itemCode}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-700 max-w-xs truncate">
                        {req.purpose}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={req.priority} size="sm" />
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {req.approverName || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        {isPending && (
                          <button
                            onClick={() => setCancellingReqId(req.id)}
                            className="px-2.5 py-1 text-xs font-medium text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded transition-colors inline-flex items-center gap-1"
                            title="Cancel Request"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancellingReqId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Ban className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Cancel Request {cancellingReqId}?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              This request will be marked as CANCELLED. No inventory will be deducted.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCancellingReqId(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                No, Keep It
              </button>
              <button
                onClick={() => handleConfirmCancel(cancellingReqId)}
                className="flex-1 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {selectedRequest.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">Request Lifecycle Detail</h3>
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
                  <span className="text-slate-400 font-medium">Priority: </span>
                  <span className="font-semibold text-slate-800">{selectedRequest.priority}</span>
                </div>
                {selectedRequest.approvalDate && (
                  <div>
                    <span className="text-slate-400 font-medium">Approval Date: </span>
                    <span className="text-slate-800">
                      {new Date(selectedRequest.approvalDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedRequest.approverName && (
                  <div>
                    <span className="text-slate-400 font-medium">Approver: </span>
                    <span className="font-semibold text-slate-800">{selectedRequest.approverName}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Purpose / Reason:</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedRequest.purpose}
                </p>
              </div>

              {selectedRequest.remarks && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Remarks:</span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedRequest.remarks}
                  </p>
                </div>
              )}

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
                <span className="text-xs font-bold text-slate-700 block mb-2">Item Requisition Breakdown</span>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2">Item Code</th>
                        <th className="px-4 py-2">Item Name</th>
                        <th className="px-4 py-2 text-right">Requested Qty</th>
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

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                {selectedRequest.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      setCancellingReqId(selectedRequest.id);
                    }}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100"
                  >
                    Cancel This Request
                  </button>
                )}
              </div>
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
