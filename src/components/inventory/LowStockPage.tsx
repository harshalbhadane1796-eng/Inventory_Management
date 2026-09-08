import React, { useState } from 'react';
import {
  AlertTriangle,
  Mail,
  ArrowDownToLine,
  ShoppingCart,
  CheckCircle2,
  Bell,
  Search,
  Download,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';
import { InventoryItem } from '../../types';
import { getSupplierName, getSupplierContact } from '../../utils';

interface LowStockPageProps {
  onNavigate: (tabId: string) => void;
  onStockInItem?: (itemId: string) => void;
  onCreatePO?: (itemId: string) => void;
}

export const LowStockPage: React.FC<LowStockPageProps> = ({
  onNavigate,
  onStockInItem,
  onCreatePO,
}) => {
  const { items, getStockStatus, procurementAlerts, emails } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  // Items with stock <= reorderLevel
  const lowStockItems = items.filter((i) => {
    const s = getStockStatus(i);
    return s === 'LOW_STOCK' || s === 'CRITICAL' || s === 'OUT_OF_STOCK';
  });

  const filtered = lowStockItems.filter(
    (i) =>
      i.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getSupplierName(i).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="low-stock-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Low Stock & Replenishment Alerts
          </h2>
          <p className="text-xs text-slate-500">
            Active items whose inventory balances have breached minimum or reorder levels.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            {lowStockItems.length} SKUs Require Reorder
          </span>
        </div>
      </div>

      {/* Threshold Automation Explainer Card */}
      <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 text-xs text-amber-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Automated Threshold Automation Active</div>
            <div className="text-[11px] text-amber-800 mt-0.5">
              Whenever inventory drops to or below the reorder level, the system automatically dispatches a Procurement Alert and an SMTP notification to Purchasing with calculated reorder quantities.
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Item Code, Name, Supplier..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing {filtered.length} of {lowStockItems.length} alerts
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            {lowStockItems.length === 0
              ? 'All items currently meet or exceed safety reorder levels. Inventory is fully stocked!'
              : 'No items match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Item Code</th>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3 text-right">Current Stock</th>
                  <th className="px-4 py-3 text-right">Min Stock</th>
                  <th className="px-4 py-3 text-right">Reorder Level</th>
                  <th className="px-4 py-3 text-right">Suggested Order Qty</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const status = getStockStatus(item);
                  const suggestedOrder = Math.max(
                    item.maximumStockLevel - item.currentStock,
                    item.reorderLevel
                  );

                  // Check if procurement alert exists
                  const alert = procurementAlerts.find(
                    (a) => a.itemId === item.id && a.status !== 'CLOSED'
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {item.itemCode}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-900 max-w-xs">
                        <div>{item.itemName}</div>
                        <div className="text-[11px] text-slate-400">{item.category}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        <span
                          className={
                            status === 'CRITICAL' || status === 'OUT_OF_STOCK'
                              ? 'text-rose-600 font-bold'
                              : 'text-amber-700 font-bold'
                          }
                        >
                          {item.currentStock}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 font-sans">{item.unitOfMeasurement}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-rose-700 font-medium">
                        {item.minimumStockLevel}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-amber-700 font-medium">
                        {item.reorderLevel}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-blue-700">
                        +{suggestedOrder}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                        <div className="font-medium text-slate-800">{getSupplierName(item)}</div>
                        <div className="text-slate-400">{getSupplierContact(item)}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => {
                            if (onStockInItem) onStockInItem(item.id);
                            else onNavigate('add_stock');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors inline-flex items-center gap-1"
                          title="Stock In directly"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          Stock In
                        </button>
                        <button
                          onClick={() => {
                            if (onCreatePO) onCreatePO(item.id);
                            else onNavigate('purchase_orders');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded transition-colors inline-flex items-center gap-1"
                          title="Raise Purchase Order"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Create PO
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
