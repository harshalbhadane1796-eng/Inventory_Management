import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  Plus,
  ArrowDownToLine,
  SlidersHorizontal,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';
import { InventoryItem, ItemCategory, StockStatus } from '../../types';
import { getSupplierName, getSupplierContact } from '../../utils';

interface InventoryTablePageProps {
  onNavigate: (tabId: string) => void;
  onStockInItem?: (itemId: string) => void;
}

export const InventoryTablePage: React.FC<InventoryTablePageProps> = ({
  onNavigate,
  onStockInItem,
}) => {
  const { items, categories, getStockStatus, adjustStock } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'name' | 'stock' | 'value'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal States
  const [selectedItemDetail, setSelectedItemDetail] = useState<InventoryItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [newStockInput, setNewStockInput] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustFeedback, setAdjustFeedback] = useState<string | null>(null);

  // Filter & Sort
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const status = getStockStatus(item);
      const supplierName = getSupplierName(item);
      const matchesSearch =
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.storageLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [items, searchQuery, selectedCategory, selectedStatus, getStockStatus]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'code') cmp = a.itemCode.localeCompare(b.itemCode);
      else if (sortBy === 'name') cmp = a.itemName.localeCompare(b.itemName);
      else if (sortBy === 'stock') cmp = a.currentStock - b.currentStock;
      else if (sortBy === 'value')
        cmp = a.currentStock * a.unitCost - b.currentStock * b.unitCost;

      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [filteredItems, sortBy, sortOrder]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Item Code',
      'Item Name',
      'Category',
      'Unit',
      'Current Stock',
      'Min Stock',
      'Reorder Level',
      'Max Stock',
      'Unit Cost',
      'Total Value',
      'Status',
      'Storage Location',
      'Supplier',
    ];

    const rows = sortedItems.map((item) => {
      const status = getStockStatus(item);
      const totalVal = (item.currentStock * item.unitCost).toFixed(2);
      return [
        `"${item.itemCode}"`,
        `"${item.itemName}"`,
        `"${item.category}"`,
        `"${item.unitOfMeasurement}"`,
        item.currentStock,
        item.minimumStockLevel,
        item.reorderLevel,
        item.maximumStockLevel,
        item.unitCost.toFixed(2),
        totalVal,
        status,
        `"${item.storageLocation}"`,
        `"${getSupplierName(item)}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auxiliary_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustingItem(item);
    setNewStockInput(item.currentStock);
    setAdjustReason('');
    setAdjustFeedback(null);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || !adjustReason.trim()) return;

    const res = adjustStock(adjustingItem.id, newStockInput, adjustReason.trim());
    if (res.success) {
      setAdjustFeedback(`Stock for ${adjustingItem.itemCode} updated to ${newStockInput}.`);
      setTimeout(() => {
        setAdjustingItem(null);
        setAdjustFeedback(null);
      }, 1200);
    } else {
      setAdjustFeedback(res.error || 'Failed to adjust stock.');
    }
  };

  return (
    <div id="inventory-table-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Auxiliary Inventory Master Table</h2>
          <p className="text-xs text-slate-500">
            Complete warehouse stock balances, reorder parameters, valuation, and bin locations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({sortedItems.length})
          </button>
          <button
            onClick={() => onNavigate('add_stock')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
            Stock In
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Code, Name, Location, Supplier..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white"
            />
          </div>

          {/* Category Selector */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="ALL">All Categories ({items.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW_STOCK">Low Stock (≤ Reorder)</option>
              <option value="CRITICAL">Critical (≤ Min Stock)</option>
              <option value="OUT_OF_STOCK">Out of Stock (= 0)</option>
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center space-x-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="code">Sort by Item Code</option>
              <option value="name">Sort by Item Name</option>
              <option value="stock">Sort by Current Stock</option>
              <option value="value">Sort by Total Value</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-mono"
              title="Toggle Sort Order"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Main Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Item Code</th>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Current Stock</th>
                <th className="px-4 py-3 text-right">Min / Reorder / Max</th>
                <th className="px-4 py-3 text-right">Unit Cost</th>
                <th className="px-4 py-3 text-right">Total Value</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedItems.map((item) => {
                const status = getStockStatus(item);
                const totalVal = item.currentStock * item.unitCost;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {item.itemCode}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">
                      {item.itemName}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {item.currentStock} <span className="text-[10px] text-slate-400 font-sans">{item.unitOfMeasurement}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-500">
                      <span className="text-rose-600 font-medium" title="Min Stock">{item.minimumStockLevel}</span>
                      {' / '}
                      <span className="text-amber-600 font-medium" title="Reorder Level">{item.reorderLevel}</span>
                      {' / '}
                      <span className="text-slate-400" title="Max Stock">{item.maximumStockLevel}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      ${item.unitCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {item.storageLocation}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px] max-w-xs truncate">
                      {getSupplierName(item)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 shrink-0">
                      <button
                        onClick={() => setSelectedItemDetail(item)}
                        className="px-2 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-medium text-[11px]"
                        title="View Full Item Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenAdjust(item)}
                        className="px-2 py-1 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded font-medium text-[11px]"
                        title="Adjust Stock Balance"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (onStockInItem) onStockInItem(item.id);
                          else onNavigate('add_stock');
                        }}
                        className="px-2 py-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded font-medium text-[11px]"
                        title="Receive Stock In"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              Adjust Stock Balance: {adjustingItem.itemCode}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {adjustingItem.itemName} ({adjustingItem.unitOfMeasurement})
            </p>

            {adjustFeedback && (
              <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {adjustFeedback}
              </div>
            )}

            <form onSubmit={handleConfirmAdjust} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium block">Current Stock</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    {adjustingItem.currentStock}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Unit Cost</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    ${adjustingItem.unitCost.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  New Adjusted Stock Balance <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockInput}
                  onChange={(e) => setNewStockInput(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-sm font-mono font-bold p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Adjustment Delta:{' '}
                  <span
                    className={
                      newStockInput - adjustingItem.currentStock >= 0
                        ? 'text-emerald-600 font-bold'
                        : 'text-rose-600 font-bold'
                    }
                  >
                    {newStockInput - adjustingItem.currentStock >= 0
                      ? `+${newStockInput - adjustingItem.currentStock}`
                      : newStockInput - adjustingItem.currentStock}
                  </span>
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for Adjustment <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g., Physical count discrepancy, damaged packaging disposal..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-sm"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {selectedItemDetail.itemCode}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedItemDetail.itemName}
                </h3>
              </div>
              <StatusBadge status={getStockStatus(selectedItemDetail)} size="lg" />
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <span className="font-semibold text-slate-400 uppercase text-[10px] block">
                  Description
                </span>
                <p className="text-slate-700 mt-1">{selectedItemDetail.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium">Category:</span>
                  <div className="font-bold text-slate-900">{selectedItemDetail.category}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Unit:</span>
                  <div className="font-bold text-slate-900">{selectedItemDetail.unitOfMeasurement}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Storage Location:</span>
                  <div className="font-bold text-slate-900 font-mono">{selectedItemDetail.storageLocation}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Unit Cost:</span>
                  <div className="font-bold text-slate-900 font-mono">${selectedItemDetail.unitCost.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 uppercase text-[10px] block mb-2">
                  Inventory Thresholds
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded bg-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">Current</span>
                    <span className="font-mono font-bold text-sm text-slate-900">{selectedItemDetail.currentStock}</span>
                  </div>
                  <div className="p-2 rounded bg-rose-50 border border-rose-200">
                    <span className="text-[10px] text-rose-600 font-medium block">Min Stock</span>
                    <span className="font-mono font-bold text-sm text-rose-700">{selectedItemDetail.minimumStockLevel}</span>
                  </div>
                  <div className="p-2 rounded bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-600 font-medium block">Reorder</span>
                    <span className="font-mono font-bold text-sm text-amber-700">{selectedItemDetail.reorderLevel}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">Max Stock</span>
                    <span className="font-mono font-bold text-sm text-slate-900">{selectedItemDetail.maximumStockLevel}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 uppercase text-[10px] block mb-1">
                  Supplier Information
                </span>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900">{getSupplierName(selectedItemDetail)}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{getSupplierContact(selectedItemDetail)}</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
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
