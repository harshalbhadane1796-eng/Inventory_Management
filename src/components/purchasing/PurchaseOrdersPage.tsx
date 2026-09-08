import React, { useState } from 'react';
import {
  Plus,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Calendar,
  DollarSign,
  PackageCheck,
  Building,
  Clock,
  ArrowDownToLine,
  Trash2,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';
import { PurchaseOrder, POStatus } from '../../types';
import { getSupplierName, getSupplierContact } from '../../utils';

interface PurchaseOrdersPageProps {
  initialItemId?: string | null;
  onClearInitialItem?: () => void;
}

interface POLineInput {
  itemId: string;
  quantity: number;
}

export const PurchaseOrdersPage: React.FC<PurchaseOrdersPageProps> = ({
  initialItemId,
  onClearInitialItem,
}) => {
  const {
    purchaseOrders,
    createPurchaseOrder,
    receivePurchaseOrder,
    items,
    currentUser,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(!!initialItemId);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [receivingPOId, setReceivingPOId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const getItemSupplierName = (item?: any): string => getSupplierName(item);
  const getItemSupplierContact = (item?: any): string => getSupplierContact(item);
  const getPOSupplierName = (po?: any): string => getSupplierName(po?.supplier || po);

  // Form State
  const initialItem = items.find((i) => i.id === initialItemId);
  const [supplierName, setSupplierName] = useState(
    getItemSupplierName(initialItem || items[0])
  );
  const [supplierContact, setSupplierContact] = useState(
    getItemSupplierContact(initialItem || items[0])
  );
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('Standard auxiliary replenishment order');
  const [poLines, setPoLines] = useState<POLineInput[]>([
    {
      itemId: initialItemId || items[0]?.id || '',
      quantity: initialItem ? initialItem.maximumStockLevel - initialItem.currentStock : 25,
    },
  ]);

  const filteredPOs = purchaseOrders.filter((po) => {
    const sName = getPOSupplierName(po);
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.items.some(
        (i) =>
          i.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddLine = () => {
    const usedIds = new Set(poLines.map((l) => l.itemId));
    const nextItem = items.find((i) => !usedIds.has(i.id)) || items[0];
    setPoLines([...poLines, { itemId: nextItem.id, quantity: 20 }]);
  };

  const handleRemoveLine = (idx: number) => {
    if (poLines.length <= 1) return;
    setPoLines(poLines.filter((_, i) => i !== idx));
  };

  const handleLineItemChange = (idx: number, newItemId: string) => {
    const targetItem = items.find((i) => i.id === newItemId);
    const updated = [...poLines];
    updated[idx].itemId = newItemId;
    if (targetItem && idx === 0) {
      setSupplierName(getItemSupplierName(targetItem));
      setSupplierContact(getItemSupplierContact(targetItem));
    }
    setPoLines(updated);
  };

  const handleLineQtyChange = (idx: number, qty: number) => {
    const updated = [...poLines];
    updated[idx].quantity = Math.max(1, qty);
    setPoLines(updated);
  };

  // Calculate live PO cost
  const calculatedTotalCost = poLines.reduce((sum, line) => {
    const item = items.find((i) => i.id === line.itemId);
    return sum + (item ? item.unitCost * line.quantity : 0);
  }, 0);

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = createPurchaseOrder({
      supplier: { name: supplierName.trim(), contact: supplierContact.trim() },
      items: poLines.map((l) => ({ itemId: l.itemId, quantity: l.quantity })),
      expectedDeliveryDate: deliveryDate,
      notes: notes.trim(),
    });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Purchase Order ${res.poNumber} created and submitted successfully!`,
      });
      setIsCreateModalOpen(false);
      if (onClearInitialItem) onClearInitialItem();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to create PO.' });
    }
  };

  const handleConfirmReceive = (poId: string) => {
    const res = receivePurchaseOrder(poId);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Purchase Order ${poId} marked as RECEIVED! All inventory quantities have been automatically added to warehouse stock balances and transactions recorded.`,
      });
      setReceivingPOId(null);
      if (selectedPO?.id === poId) {
        setSelectedPO((prev) => (prev ? { ...prev, status: 'RECEIVED' } : null));
      }
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to receive PO.' });
    }
  };

  return (
    <div id="purchase-orders-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Purchase Orders & Replenishment</h2>
          <p className="text-xs text-slate-500">
            Create supplier orders and mark deliveries as received to trigger automated stock intake.
          </p>
        </div>
        <button
          id="open-create-po-modal-btn"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          Create Purchase Order
        </button>
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
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO #, Supplier, Item Code..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
          {['ALL', 'SUBMITTED', 'APPROVED', 'RECEIVED', 'DRAFT'].map((st) => (
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

      {/* POs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPOs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No purchase orders found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Line Items</th>
                  <th className="px-4 py-3 text-right">Total Cost</th>
                  <th className="px-4 py-3">Expected Delivery</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPOs.map((po) => {
                  const isPendingReceipt = po.status === 'SUBMITTED' || po.status === 'APPROVED';

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {po.poNumber}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {new Date(po.orderDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-medium">
                        {getPOSupplierName(po)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800">
                          {po.items.length} {po.items.length === 1 ? 'item' : 'items'}
                        </span>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {po.items.map((i) => `${i.orderedQuantity}x ${i.itemCode}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        ${po.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                        {po.expectedDeliveryDate
                          ? new Date(po.expectedDeliveryDate).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={po.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => setSelectedPO(po)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded"
                        >
                          View
                        </button>
                        {isPendingReceipt && (
                          <button
                            id={`receive-po-${po.poNumber}`}
                            onClick={() => setReceivingPOId(po.id)}
                            className="px-2.5 py-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded inline-flex items-center gap-1"
                            title="Receive shipment and update inventory"
                          >
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                            Receive
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

      {/* Receive PO Confirmation Modal */}
      {receivingPOId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Receive Shipment for PO {purchaseOrders.find((p) => p.id === receivingPOId)?.poNumber}?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Marking this PO as RECEIVED will automatically increment the warehouse stock balances for every line item, create official STOCK_IN ledger transactions, and resolve open procurement alerts.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setReceivingPOId(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                id="confirm-po-receive-btn"
                onClick={() => handleConfirmReceive(receivingPOId)}
                className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
              >
                Confirm Intake
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Purchasing Portal
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Generate Supplier Purchase Order
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  if (onClearInitialItem) onClearInitialItem();
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Supplier Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Supplier Contact</label>
                  <input
                    type="text"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Expected Delivery Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-800 uppercase text-[11px]">
                    Ordered Auxiliary Items ({poLines.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-md font-semibold text-xs hover:bg-sky-100 flex items-center gap-1 border border-sky-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {poLines.map((line, idx) => {
                    const item = items.find((i) => i.id === line.itemId);
                    const lineTotal = (item?.unitCost || 0) * line.quantity;

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                      >
                        <div className="sm:col-span-6">
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">
                            Item SKU #{idx + 1}
                          </label>
                          <select
                            value={line.itemId}
                            onChange={(e) => handleLineItemChange(idx, e.target.value)}
                            className="w-full p-2 text-xs border border-slate-300 rounded-md"
                          >
                            {items.map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.itemCode} — {i.itemName} (Stock: {i.currentStock}, Cost: ${i.unitCost.toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">
                            Order Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => handleLineQtyChange(idx, parseInt(e.target.value) || 1)}
                            className="w-full font-mono font-bold p-2 text-xs border border-slate-300 rounded-md"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">
                            Line Total
                          </label>
                          <span className="font-mono font-bold text-xs text-slate-900 block pt-1">
                            ${lineTotal.toFixed(2)}
                          </span>
                        </div>

                        <div className="sm:col-span-1 text-right pt-4 sm:pt-0">
                          <button
                            type="button"
                            disabled={poLines.length === 1}
                            onClick={() => handleRemoveLine(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Special Instructions</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Include Certificate of Conformance with delivery..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              {/* Total & Submit */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Estimated PO Value
                  </span>
                  <span className="font-mono font-bold text-xl text-slate-900">
                    ${calculatedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      if (onClearInitialItem) onClearInitialItem();
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-po-btn"
                    className="px-5 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-sm flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4 text-sky-400" />
                    Issue Purchase Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO Detail Modal */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {selectedPO.poNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">Purchase Order Summary</h3>
              </div>
              <StatusBadge status={selectedPO.status} size="lg" />
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium block">Order Date</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedPO.orderDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Expected Delivery</span>
                  <span className="font-semibold text-slate-800">
                    {selectedPO.expectedDeliveryDate
                      ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString()
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Supplier</span>
                  <span className="font-semibold text-slate-800">{getPOSupplierName(selectedPO)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Total Cost</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${selectedPO.totalCost.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase text-[10px] block mb-2">
                  Line Items ({selectedPO.items.length})
                </span>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2">Item Code</th>
                        <th className="px-4 py-2">Item Name</th>
                        <th className="px-4 py-2 text-right">Quantity</th>
                        <th className="px-4 py-2 text-right">Unit Cost</th>
                        <th className="px-4 py-2 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPO.items.map((line, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                            {line.itemCode}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-slate-800">
                            {line.itemName}
                          </td>
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-900 text-right">
                            {line.orderedQuantity} {line.unitOfMeasurement}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-600 text-right">
                            ${line.unitCost.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-900 text-right">
                            ${line.lineTotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedPO.notes && (
                <div>
                  <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">
                    Notes
                  </span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                    {selectedPO.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {selectedPO.status !== 'RECEIVED' && selectedPO.status !== 'CANCELLED' ? (
                <button
                  onClick={() => {
                    setSelectedPO(null);
                    setReceivingPOId(selectedPO.id);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  Receive PO & Add Stock
                </button>
              ) : (
                <span className="text-xs text-slate-500">Order finalized.</span>
              )}
              <button
                onClick={() => setSelectedPO(null)}
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
