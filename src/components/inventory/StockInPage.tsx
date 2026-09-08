import React, { useState } from 'react';
import {
  ArrowDownToLine,
  CheckCircle2,
  AlertCircle,
  Boxes,
  DollarSign,
  FileText,
  Building,
  User,
  Search,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { getSupplierName } from '../../utils';

interface StockInPageProps {
  initialItemId?: string;
  onNavigate: (tabId: string) => void;
}

export const StockInPage: React.FC<StockInPageProps> = ({
  initialItemId,
  onNavigate,
}) => {
  const { items, addStock, currentUser } = useInventory();

  const [selectedItemId, setSelectedItemId] = useState<string>(
    initialItemId || items[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(10);
  const [poNumber, setPoNumber] = useState<string>('PO-2024-088');
  const [supplierName, setSupplierName] = useState<string>('');
  const [unitCost, setUnitCost] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Standard supplier shipment receipt');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync item details when selectedItemId changes
  const activeItem = items.find((i) => i.id === selectedItemId) || items[0];

  React.useEffect(() => {
    if (activeItem) {
      setSupplierName(getSupplierName(activeItem));
      setUnitCost(activeItem.unitCost);
    }
  }, [selectedItemId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (quantity <= 0) {
      setFeedback({ type: 'error', message: 'Quantity received must be greater than zero.' });
      return;
    }

    const res = addStock({
      itemId: selectedItemId,
      quantityReceived: quantity,
      purchaseOrderNumber: poNumber.trim() || `PO-${Date.now().toString().slice(-4)}`,
      supplier: supplierName.trim() || 'Apex Industrial Supplies',
      receivedDate: new Date().toISOString(),
      remarks: notes.trim() || undefined,
    });

    if (res.success) {
      const updatedBalance = (activeItem?.currentStock || 0) + quantity;
      setFeedback({
        type: 'success',
        message: `Successfully received ${quantity} units of ${activeItem.itemCode}. New warehouse stock balance is ${updatedBalance} ${activeItem.unitOfMeasurement}.`,
      });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to record stock in.' });
    }
  };

  return (
    <div id="stock-in-page" className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Stock In (Receive Inventory)</h2>
        <p className="text-xs text-slate-500">
          Process warehouse intake shipments, increment balance records, and resolve low-stock procurement flags.
        </p>
      </div>

      {/* Feedback Alert */}
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
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          {feedback.type === 'success' && (
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-bold underline shrink-0"
            >
              View in Ledger
            </button>
          )}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Item Selector Section */}
        <div className="p-6 border-b border-slate-200 space-y-4 bg-slate-50/40">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Select Catalog Item to Receive
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.itemCode} — {item.itemName} (Current Stock: {item.currentStock} {item.unitOfMeasurement})
              </option>
            ))}
          </select>

          {/* Current Stock Preview Card */}
          {activeItem && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Current Balance</span>
                <span className="font-mono font-bold text-base text-slate-900">
                  {activeItem.currentStock} {activeItem.unitOfMeasurement}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Reorder Level</span>
                <span className="font-mono font-bold text-base text-amber-600">
                  {activeItem.reorderLevel}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Location</span>
                <span className="font-mono font-bold text-slate-800">
                  {activeItem.storageLocation}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Category</span>
                <span className="font-semibold text-slate-700">
                  {activeItem.category}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Intake Parameters Grid */}
        <div className="p-6 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Quantity Received <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full font-mono font-bold text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Resulting stock will be:{' '}
              <span className="font-bold text-emerald-600">
                {(activeItem?.currentStock || 0) + quantity} {activeItem?.unitOfMeasurement}
              </span>
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              PO / Shipment Reference Number
            </label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. PO-2024-001 or WAYBILL-994"
              className="w-full font-mono p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Supplier / Source
            </label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Unit Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={unitCost}
              onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
              className="w-full font-mono p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Receiver & Notes */}
        <div className="p-6 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Received By
            </label>
            <input
              type="text"
              disabled
              value={`${currentUser.name} (${currentUser.role.replace('_', ' ')})`}
              className="w-full p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Intake Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified seals intact, inspected quality certificate..."
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('inventory')}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="confirm-stock-in-btn"
            className="px-6 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-sm flex items-center gap-2 transition-all"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
            Process Intake (+{quantity} units)
          </button>
        </div>
      </form>
    </div>
  );
};
