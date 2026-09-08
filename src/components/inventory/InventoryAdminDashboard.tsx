import React from 'react';
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRightLeft,
  FileSpreadsheet,
  PlusCircle,
  Database,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';

interface InventoryAdminDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const InventoryAdminDashboard: React.FC<InventoryAdminDashboardProps> = ({
  onNavigate,
}) => {
  const { items, transactions, procurementAlerts, getStockStatus } = useInventory();

  // Metric calculations
  const totalItemsCount = items.length;
  const totalStockValue = items.reduce(
    (sum, item) => sum + item.currentStock * item.unitCost,
    0
  );

  const lowStockItems = items.filter((i) => {
    const s = getStockStatus(i);
    return s === 'LOW_STOCK' || s === 'CRITICAL' || s === 'OUT_OF_STOCK';
  });

  const criticalItems = items.filter((i) => getStockStatus(i) === 'CRITICAL');
  const outOfStockItems = items.filter((i) => getStockStatus(i) === 'OUT_OF_STOCK');

  const todayStr = new Date().toISOString().slice(0, 10);
  const transactionsToday = transactions.filter((t) => {
    const timeStr = t.timestamp || t.dateTime;
    return typeof timeStr === 'string' && timeStr.startsWith(todayStr);
  }).length;

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div id="inventory-admin-dashboard" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
            Warehouse Control & Stock Logistics
          </div>
          <h2 className="text-xl font-bold text-slate-900">Inventory Operations Center</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Real-time stock ledger, automated replenishment triggers, multi-category inventory tracking, and warehouse balance control.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            id="admin-quick-stockin-btn"
            onClick={() => onNavigate('add_stock')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
            Stock In (Receive)
          </button>
          <button
            onClick={() => onNavigate('item_master')}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200 flex items-center gap-1.5"
          >
            <Database className="w-4 h-4" />
            Item Master (70)
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Catalog Items</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            {totalItemsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Predefined master SKUs</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Stock Value</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            ${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">Warehouse asset valuation</div>
        </div>

        <div
          onClick={() => onNavigate('low_stock')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Below Reorder</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono mt-3">
            {lowStockItems.length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">Items need purchasing</div>
        </div>

        <div
          onClick={() => onNavigate('low_stock')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Critical Stock</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono mt-3">
            {criticalItems.length}
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">≤ Minimum stock level</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ledger Movements</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-3">
            {transactionsToday}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Transactions today ({transactions.length} total)</div>
        </div>
      </div>

      {/* Critical Stock Alert Banner if any items are critical */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                {lowStockItems.length} Items Require Procurement Attention
              </h4>
              <p className="text-[11px] text-amber-700">
                Automated threshold checks have dispatched procurement alerts and emails to Purchasing.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('low_stock')}
            className="px-3.5 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 shrink-0 shadow-xs"
          >
            Review Reorder List
          </button>
        </div>
      )}

      {/* Recent Transactions Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Inventory Transactions</h3>
            <p className="text-xs text-slate-500">
              Immutable audit ledger of stock additions, issuances, and balance updates
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            Full Ledger ({transactions.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Tx ID</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Item Code & Name</th>
                <th className="px-6 py-3 text-right">Change</th>
                <th className="px-6 py-3 text-right">Prev / New Stock</th>
                <th className="px-6 py-3">Performed By</th>
                <th className="px-6 py-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
                const qtyChange = typeof tx.quantityChange === 'number' ? tx.quantityChange : tx.quantity;
                const isPositive = qtyChange > 0;
                const timeStr = tx.timestamp || tx.dateTime;
                const performer = tx.performedByName || tx.performedBy;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                      {tx.id}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {timeStr
                        ? new Date(timeStr).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.transactionType === 'STOCK_IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.transactionType === 'ISSUE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {tx.transactionType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-mono font-bold text-slate-900 mr-1.5">
                        {tx.itemCode}
                      </span>
                      <span className="text-slate-700">{tx.itemName}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold">
                      <span
                        className={isPositive ? 'text-emerald-600' : 'text-slate-900'}
                      >
                        {isPositive ? `+${qtyChange}` : qtyChange}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-slate-500">
                      {tx.previousStock} → <span className="font-bold text-slate-900">{tx.newStock}</span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">
                      {performer}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-500">
                      {tx.referenceId || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
