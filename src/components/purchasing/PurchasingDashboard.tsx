import React from 'react';
import {
  ShoppingCart,
  AlertTriangle,
  Mail,
  CheckCircle2,
  Clock,
  DollarSign,
  Building,
  ArrowRight,
  PlusCircle,
  FileCheck,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';
import { getSupplierName } from '../../utils';

interface PurchasingDashboardProps {
  onNavigate: (tabId: string) => void;
  onCreatePO?: (itemId?: string) => void;
}

export const PurchasingDashboard: React.FC<PurchasingDashboardProps> = ({
  onNavigate,
  onCreatePO,
}) => {
  const { procurementAlerts, purchaseOrders, items, emails } = useInventory();

  const activeAlerts = procurementAlerts.filter((a) => a.status !== 'CLOSED');
  const criticalAlerts = activeAlerts.filter((a) => a.status === 'NEW');
  const openPOs = purchaseOrders.filter((po) => po.status !== 'RECEIVED' && po.status !== 'CANCELLED');
  const totalPOSpend = purchaseOrders.reduce((sum, po) => sum + po.totalCost, 0);

  // Unique suppliers
  const suppliers = Array.from(new Set(items.map((i) => getSupplierName(i))));

  return (
    <div id="purchasing-dashboard" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">
            Procurement & Vendor Replenishment
          </div>
          <h2 className="text-xl font-bold text-slate-900">Purchasing Command Center</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Monitor automated inventory shortfall alerts, track supplier purchase orders, and fulfill incoming stock requisitions.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => {
              if (onCreatePO) onCreatePO();
              else onNavigate('purchase_orders');
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-sky-400" />
            New Purchase Order
          </button>
          <button
            onClick={() => onNavigate('procurement_alerts')}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Active Alerts ({activeAlerts.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('procurement_alerts')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Alerts</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono mt-3">
            {activeAlerts.length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            {criticalAlerts.length} new unacknowledged
          </div>
        </div>

        <div
          onClick={() => onNavigate('purchase_orders')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Open POs</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-700 font-mono mt-3">
            {openPOs.length}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            Pending supplier delivery
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Committed PO Spend</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            ${totalPOSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Across {purchaseOrders.length} total orders
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approved Suppliers</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            {suppliers.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Contracted vendor partners
          </div>
        </div>
      </div>

      {/* Procurement Alerts Stream */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Procurement Alerts ({activeAlerts.length})
            </h3>
            <p className="text-xs text-slate-500">
              Triggered automatically when inventory balance hits safety reorder limits
            </p>
          </div>
          <button
            onClick={() => onNavigate('procurement_alerts')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            Manage All Alerts
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No active replenishment alerts. Warehouse inventory meets safety requirements.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Alert ID</th>
                  <th className="px-6 py-3">Item Code & Name</th>
                  <th className="px-6 py-3 text-right">Current Stock</th>
                  <th className="px-6 py-3 text-right">Reorder Level</th>
                  <th className="px-6 py-3 text-right">Suggested Reorder</th>
                  <th className="px-6 py-3">Supplier</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeAlerts.slice(0, 5).map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                      {alert.id}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-mono font-bold text-slate-900 mr-1.5">
                        {alert.itemCode}
                      </span>
                      <span className="font-medium text-slate-800">{alert.itemName}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold text-rose-700">
                      {alert.currentStock}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-amber-700">
                      {alert.reorderLevel}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold text-blue-700">
                      +{alert.suggestedOrderQuantity}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">
                      {getSupplierName(alert)}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={alert.status} size="sm" />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => {
                          if (onCreatePO) onCreatePO(alert.itemId);
                          else onNavigate('purchase_orders');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                      >
                        Convert to PO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
