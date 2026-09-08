import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Clock,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';
import { ProcurementAlert, ProcurementStatus } from '../../types';

interface ProcurementAlertsPageProps {
  onNavigate: (tabId: string) => void;
  onCreatePO?: (itemId: string) => void;
}

export const ProcurementAlertsPage: React.FC<ProcurementAlertsPageProps> = ({
  onNavigate,
  onCreatePO,
}) => {
  const context = useInventory();
  const procurementAlerts = context.procurementAlerts;
  const updateProcurementAlertStatus =
    (context as any).updateProcurementAlertStatus || context.updateProcurementStatus;
  const items = context.items;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<ProcurementAlert | null>(null);

  const getAlertSupplierName = (alert: ProcurementAlert) => {
    if (!alert.supplier) return 'Apex Industrial Supplies';
    if (typeof alert.supplier === 'string') return alert.supplier;
    return (alert.supplier as any).name || 'Apex Industrial Supplies';
  };

  const getAlertSupplierContact = (alert: ProcurementAlert) => {
    if (!alert.supplier) return 'sales@apexindustrial.com';
    if (typeof alert.supplier === 'string') return 'sales@apexindustrial.com';
    return (alert.supplier as any).contact || 'sales@apexindustrial.com';
  };

  const filteredAlerts = procurementAlerts.filter((a) => {
    const sName = getAlertSupplierName(a);
    const matchesSearch =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (alertId: string, newStatus: ProcurementStatus) => {
    updateProcurementAlertStatus(alertId, newStatus);
    if (selectedAlert?.id === alertId) {
      setSelectedAlert((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div id="procurement-alerts-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Procurement Replenishment Alerts</h2>
          <p className="text-xs text-slate-500">
            Automated alerts dispatched when auxiliary stocks cross below reorder safety thresholds.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Alert ID, Item Code, Supplier..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
          {['ALL', 'NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'ORDERED', 'CLOSED'].map((st) => (
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

      {/* Alerts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No procurement alerts found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Alert ID</th>
                  <th className="px-4 py-3">Generated</th>
                  <th className="px-4 py-3">Item Code & Name</th>
                  <th className="px-4 py-3 text-right">Current Stock</th>
                  <th className="px-4 py-3 text-right">Reorder Level</th>
                  <th className="px-4 py-3 text-right">Suggested Qty</th>
                  <th className="px-4 py-3 text-right">Est. Cost</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlerts.map((alert) => {
                  const item = items.find((i) => i.id === alert.itemId);
                  const unitCost = item?.unitCost || 0;
                  const estimatedCost = alert.suggestedOrderQuantity * unitCost;

                  return (
                    <tr key={alert.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {alert.id}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(alert.createdDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-slate-900 mr-1.5">
                          {alert.itemCode}
                        </span>
                        <span className="font-medium text-slate-800">{alert.itemName}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-700">
                        {alert.currentStock}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-amber-700">
                        {alert.reorderLevel}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-blue-700">
                        +{alert.suggestedOrderQuantity}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-900">
                        ${estimatedCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 text-[11px] max-w-xs truncate">
                        {getAlertSupplierName(alert)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={alert.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1 shrink-0">
                        {alert.status === 'NEW' && (
                          <button
                            onClick={() => handleStatusUpdate(alert.id, 'ACKNOWLEDGED')}
                            className="px-2 py-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded"
                            title="Acknowledge Alert"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (onCreatePO) onCreatePO(alert.itemId);
                            else onNavigate('purchase_orders');
                          }}
                          className="px-2 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded"
                          title="Generate Purchase Order"
                        >
                          PO
                        </button>
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded"
                          title="View Alert Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {selectedAlert.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">Procurement Alert Detail</h3>
              </div>
              <StatusBadge status={selectedAlert.status} size="lg" />
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium block">Item Code</span>
                  <span className="font-mono font-bold text-slate-900">{selectedAlert.itemCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Item Name</span>
                  <span className="font-bold text-slate-900">{selectedAlert.itemName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Current Stock</span>
                  <span className="font-mono font-bold text-rose-700">{selectedAlert.currentStock}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Reorder Level</span>
                  <span className="font-mono font-bold text-amber-700">{selectedAlert.reorderLevel}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="font-bold text-blue-900 block mb-1">Recommended Reorder Quantity</span>
                <div className="font-mono font-bold text-xl text-blue-700">
                  +{selectedAlert.suggestedOrderQuantity} units
                </div>
                <p className="text-[11px] text-blue-600 mt-1">
                  Calculated based on max stock target minus current inventory.
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">
                  Supplier Details
                </span>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900">{getAlertSupplierName(selectedAlert)}</div>
                  <div className="text-slate-500 text-[11px]">{getAlertSupplierContact(selectedAlert)}</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">
                  Update Alert Status
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['ACKNOWLEDGED', 'IN_PROGRESS', 'CLOSED'] as ProcurementStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusUpdate(selectedAlert.id, st)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-colors ${
                        selectedAlert.status === st
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedAlert(null);
                  if (onCreatePO) onCreatePO(selectedAlert.itemId);
                  else onNavigate('purchase_orders');
                }}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Convert to Purchase Order
              </button>
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-300"
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
