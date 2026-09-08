import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Boxes,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { DEPARTMENTS } from '../../data/seedUsers';
import { Priority } from '../../types';

interface NewRequestPageProps {
  onNavigate: (tabId: string) => void;
}

interface ItemRow {
  itemId: string;
  requestedQuantity: number;
}

export const NewRequestPage: React.FC<NewRequestPageProps> = ({ onNavigate }) => {
  const { currentUser, items, submitRequest, requests, getStockStatus } = useInventory();

  const nextReqId = `REQ-${String(requests.length + 1).padStart(4, '0')}`;
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const [department, setDepartment] = useState(currentUser.department);
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [purpose, setPurpose] = useState('');
  const [remarks, setRemarks] = useState('');
  const [itemRows, setItemRows] = useState<ItemRow[]>([
    { itemId: items[0]?.id || '', requestedQuantity: 1 },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter active items for selection
  const activeItems = items.filter((i) => i.active);

  const handleAddItemRow = () => {
    // Pick first unused item
    const usedIds = new Set(itemRows.map((r) => r.itemId));
    const available = activeItems.find((i) => !usedIds.has(i.id));
    if (!available) {
      setErrorMsg('All catalog items have already been added to this request.');
      return;
    }
    setErrorMsg(null);
    setItemRows([...itemRows, { itemId: available.id, requestedQuantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (itemRows.length <= 1) {
      setErrorMsg('A request must contain at least one item.');
      return;
    }
    setErrorMsg(null);
    setItemRows(itemRows.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, newItemId: string) => {
    // Check if item already chosen in another row
    const isDuplicate = itemRows.some((r, idx) => idx !== index && r.itemId === newItemId);
    if (isDuplicate) {
      setErrorMsg('This item is already included in another row. Duplicate items are not allowed.');
      return;
    }
    setErrorMsg(null);
    const updated = [...itemRows];
    updated[index].itemId = newItemId;
    setItemRows(updated);
  };

  const handleQuantityChange = (index: number, val: number) => {
    setErrorMsg(null);
    const updated = [...itemRows];
    updated[index].requestedQuantity = Math.max(1, val);
    setItemRows(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!purpose.trim()) {
      setErrorMsg('Please specify the Purpose / Reason for requisition.');
      return;
    }

    if (itemRows.length === 0) {
      setErrorMsg('Please add at least one item.');
      return;
    }

    // Validate quantities against stock
    for (const row of itemRows) {
      const targetItem = items.find((i) => i.id === row.itemId);
      if (!targetItem) {
        setErrorMsg('Selected item not found.');
        return;
      }
      if (row.requestedQuantity <= 0) {
        setErrorMsg(`Requested quantity for ${targetItem.itemCode} must be greater than zero.`);
        return;
      }
      if (row.requestedQuantity > targetItem.currentStock) {
        setErrorMsg(
          `Requested quantity (${row.requestedQuantity}) for ${targetItem.itemCode} exceeds available stock (${targetItem.currentStock}).`
        );
        return;
      }
    }

    const res = submitRequest({
      items: itemRows,
      department,
      priority,
      purpose: purpose.trim(),
      remarks: remarks.trim() || undefined,
    });

    if (res.success) {
      setSuccessMsg(`Request ${res.requestId} submitted successfully with status PENDING!`);
      setTimeout(() => {
        onNavigate('my_requests');
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Failed to submit request.');
    }
  };

  return (
    <div id="new-request-page" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <h2 className="text-xl font-bold text-slate-900">Create Inventory Request</h2>
          <p className="text-xs text-slate-500">
            Submit auxiliary requisition. Validated atomically against live warehouse stocks.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Generated ID</div>
          <div className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            {nextReqId}
          </div>
        </div>
      </div>

      {/* Error / Success Banners */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Validation Issue</div>
            <div>{errorMsg}</div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-semibold">{successMsg}</div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Info Metadata */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Request ID
            </label>
            <input
              type="text"
              disabled
              value={nextReqId}
              className="w-full text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Request Date
            </label>
            <input
              type="text"
              disabled
              value={currentDateStr}
              className="w-full text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Requestor
            </label>
            <input
              type="text"
              disabled
              value={`${currentUser?.name || 'Requestor'} (${currentUser?.title || 'Staff'})`}
              className="w-full text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 cursor-not-allowed truncate"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority & Reason */}
        <div className="p-6 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full text-xs bg-white text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="LOW">Low (Routine consumable)</option>
              <option value="NORMAL">Normal (Standard requirement)</option>
              <option value="HIGH">High (Urgent project / Turnaround)</option>
              <option value="URGENT">Urgent (Line-down / Emergency)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Purpose / Reason for Requisition <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Scheduled maintenance overhaul on Line 2, replacement PPE for night shift..."
              className="w-full text-xs bg-white text-slate-900 p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Multi-Item Line Items */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Requested Items ({itemRows.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Select items and enter required quantities. Duplicate items are prevented.
              </p>
            </div>
            <button
              type="button"
              id="add-item-row-btn"
              onClick={handleAddItemRow}
              className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another Item
            </button>
          </div>

          <div className="space-y-3">
            {itemRows.map((row, idx) => {
              const selectedItem = items.find((i) => i.id === row.itemId);
              const availableStock = selectedItem ? selectedItem.currentStock : 0;
              const isOverStock = row.requestedQuantity > availableStock;
              const isLow = availableStock <= (selectedItem?.reorderLevel || 0);

              return (
                <div
                  key={idx}
                  id={`item-row-${idx}`}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  {/* Item Selector */}
                  <div className="md:col-span-6">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Item #{idx + 1}
                    </label>
                    <select
                      value={row.itemId}
                      onChange={(e) => handleItemChange(idx, e.target.value)}
                      className="w-full text-xs font-medium bg-white text-slate-900 p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      {activeItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.itemCode} — {item.itemName} ({item.unitOfMeasurement})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Available Stock Indicator */}
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Available Stock
                    </span>
                    <div
                      className={`text-xs font-mono font-bold px-2.5 py-1.5 rounded border ${
                        availableStock === 0
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isLow
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white text-slate-800 border-slate-200'
                      }`}
                    >
                      {availableStock} {selectedItem?.unitOfMeasurement}
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div className="md:col-span-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Requested Quantity
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={availableStock}
                        value={row.requestedQuantity}
                        onChange={(e) =>
                          handleQuantityChange(idx, parseInt(e.target.value) || 1)
                        }
                        className={`w-full text-xs font-mono font-bold p-2 rounded-md border ${
                          isOverStock
                            ? 'bg-rose-50 border-rose-400 text-rose-900 focus:ring-rose-400'
                            : 'bg-white border-slate-300 text-slate-900 focus:ring-slate-400'
                        } focus:outline-none focus:ring-2`}
                      />
                      {isOverStock && (
                        <span className="text-[10px] font-semibold text-rose-600 absolute -bottom-4 left-0">
                          Exceeds available stock ({availableStock})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="md:col-span-1 text-right pt-4 md:pt-0">
                    <button
                      type="button"
                      disabled={itemRows.length === 1}
                      onClick={() => handleRemoveItemRow(idx)}
                      className={`p-2 rounded-md transition-colors ${
                        itemRows.length === 1
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                      }`}
                      title="Remove line item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Remarks */}
        <div className="p-6 border-b border-slate-200">
          <label className="text-xs font-bold text-slate-800 block mb-1.5">
            Remarks (Optional)
          </label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g., Deliver directly to Tool Crib 3 before 2:00 PM..."
            className="w-full text-xs bg-white text-slate-900 p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Submission Actions */}
        <div className="p-6 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="submit-request-btn"
            className="px-6 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-sm flex items-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Submit Request ({itemRows.length} items)
          </button>
        </div>
      </form>
    </div>
  );
};
