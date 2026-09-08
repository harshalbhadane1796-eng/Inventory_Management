import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  Download,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  Package,
  Boxes,
  Building,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';

export const ReportsPage: React.FC = () => {
  const { items, requests, transactions, getStockStatus, categories } = useInventory();
  const [activeReportTab, setActiveReportTab] = useState<
    'inventory' | 'consumption' | 'stockin' | 'lowstock' | 'requests'
  >('inventory');

  // --- 1. Inventory Summary Calculations ---
  const totalItems = items.length;
  const totalValuation = items.reduce((s, i) => s + i.currentStock * i.unitCost, 0);

  const statusDistribution = useMemo(() => {
    let normal = 0,
      low = 0,
      critical = 0,
      out = 0;
    items.forEach((item) => {
      const s = getStockStatus(item);
      if (s === 'NORMAL') normal++;
      else if (s === 'LOW_STOCK') low++;
      else if (s === 'CRITICAL') critical++;
      else if (s === 'OUT_OF_STOCK') out++;
    });
    return [
      { name: 'Normal', value: normal, color: '#10b981' },
      { name: 'Low Stock', value: low, color: '#f59e0b' },
      { name: 'Critical', value: critical, color: '#ef4444' },
      { name: 'Out of Stock', value: out, color: '#1e293b' },
    ].filter((x) => x.value > 0);
  }, [items, getStockStatus]);

  const categoryValuationData = useMemo(() => {
    const map: Record<string, { value: number; stock: number }> = {};
    items.forEach((i) => {
      if (!map[i.category]) map[i.category] = { value: 0, stock: 0 };
      map[i.category].value += i.currentStock * i.unitCost;
      map[i.category].stock += i.currentStock;
    });
    return Object.entries(map).map(([name, d]) => ({
      category: name.replace(' & ', '\n& '),
      valuation: Math.round(d.value),
      stock: d.stock,
    }));
  }, [items]);

  // --- 2. Department Consumption Calculations ---
  const departmentConsumptionData = useMemo(() => {
    const deptMap: Record<string, { totalUnits: number; requestCount: number }> = {};
    requests
      .filter((r) => r.status === 'ISSUED' || r.status === 'APPROVED')
      .forEach((r) => {
        if (!deptMap[r.department]) deptMap[r.department] = { totalUnits: 0, requestCount: 0 };
        deptMap[r.department].requestCount += 1;
        r.items.forEach((item) => {
          deptMap[r.department].totalUnits += item.requestedQuantity;
        });
      });
    return Object.entries(deptMap).map(([dept, d]) => ({
      department: dept,
      unitsIssued: d.totalUnits,
      requests: d.requestCount,
    }));
  }, [requests]);

  // Top Consumed Items
  const topConsumedItems = useMemo(() => {
    const itemMap: Record<string, { code: string; name: string; quantity: number }> = {};
    requests
      .filter((r) => r.status === 'ISSUED' || r.status === 'APPROVED')
      .forEach((r) => {
        r.items.forEach((i) => {
          if (!itemMap[i.itemCode]) {
            itemMap[i.itemCode] = { code: i.itemCode, name: i.itemName, quantity: 0 };
          }
          itemMap[i.itemCode].quantity += i.requestedQuantity;
        });
      });
    return Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [requests]);

  // --- 3. Stock In Receipts Calculations ---
  const stockInTransactions = transactions.filter((t) => t.transactionType === 'STOCK_IN');
  const totalStockInUnits = stockInTransactions.reduce((s, t) => s + t.quantityChange, 0);

  // --- 4. Low Stock Valuation Calculations ---
  const lowStockItems = items.filter((i) => {
    const s = getStockStatus(i);
    return s === 'LOW_STOCK' || s === 'CRITICAL' || s === 'OUT_OF_STOCK';
  });

  const estimatedReplenishCost = lowStockItems.reduce((sum, item) => {
    const needed = Math.max(item.maximumStockLevel - item.currentStock, item.reorderLevel);
    return sum + needed * item.unitCost;
  }, 0);

  // --- 5. Request Status Breakdown ---
  const requestStatusCounts = useMemo(() => {
    const counts = { PENDING: 0, APPROVED: 0, ISSUED: 0, REJECTED: 0, CANCELLED: 0 };
    requests.forEach((r) => {
      if (counts[r.status] !== undefined) counts[r.status]++;
    });
    return [
      { status: 'Pending Review', count: counts.PENDING, color: '#f59e0b' },
      { status: 'Approved', count: counts.APPROVED, color: '#3b82f6' },
      { status: 'Issued / Fulfilled', count: counts.ISSUED, color: '#10b981' },
      { status: 'Rejected', count: counts.REJECTED, color: '#ef4444' },
      { status: 'Cancelled', count: counts.CANCELLED, color: '#64748b' },
    ];
  }, [requests]);

  // Export CSV based on active tab
  const handleExportReportCSV = () => {
    let filename = `inventory_report_${activeReportTab}.csv`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeReportTab === 'inventory') {
      headers = ['Item Code', 'Item Name', 'Category', 'Current Stock', 'Unit', 'Unit Cost', 'Total Value', 'Status'];
      rows = items.map((i) => [
        i.itemCode,
        i.itemName,
        i.category,
        i.currentStock,
        i.unitOfMeasurement,
        i.unitCost.toFixed(2),
        (i.currentStock * i.unitCost).toFixed(2),
        getStockStatus(i),
      ]);
    } else if (activeReportTab === 'consumption') {
      headers = ['Department', 'Units Issued', 'Requests Count'];
      rows = departmentConsumptionData.map((d) => [d.department, d.unitsIssued, d.requests]);
    } else if (activeReportTab === 'stockin') {
      headers = ['Tx ID', 'Timestamp', 'Item Code', 'Item Name', 'Quantity Received', 'Performed By', 'Reference'];
      rows = stockInTransactions.map((t) => {
        const timeStr = t.timestamp || t.dateTime || '';
        const qtyChange = typeof t.quantityChange === 'number' ? t.quantityChange : t.quantity;
        const performer = t.performedByName || t.performedBy || '';
        return [
          t.id,
          timeStr,
          t.itemCode,
          t.itemName,
          qtyChange,
          performer,
          t.referenceId || '',
        ];
      });
    } else if (activeReportTab === 'lowstock') {
      headers = ['Item Code', 'Item Name', 'Current Stock', 'Min Stock', 'Reorder Level', 'Unit Cost', 'Replenishment Qty', 'Estimated Cost'];
      rows = lowStockItems.map((i) => {
        const qty = Math.max(i.maximumStockLevel - i.currentStock, i.reorderLevel);
        return [
          i.itemCode,
          i.itemName,
          i.currentStock,
          i.minimumStockLevel,
          i.reorderLevel,
          i.unitCost.toFixed(2),
          qty,
          (qty * i.unitCost).toFixed(2),
        ];
      });
    } else {
      headers = ['Request ID', 'Date', 'Requestor', 'Department', 'Status', 'Total Items'];
      rows = requests.map((r) => [
        r.id,
        r.requestDate,
        r.requestorName,
        r.department,
        r.status,
        r.items.length,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="reports-analytics-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reports & Inventory Intelligence</h2>
          <p className="text-xs text-slate-500">
            Enterprise analytics covering consumption velocity, warehouse valuation, intake, and replenishment costs.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportReportCSV}
            className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 text-xs font-bold">
        {[
          { id: 'inventory', label: '1. Inventory Summary' },
          { id: 'consumption', label: '2. Department Consumption' },
          { id: 'stockin', label: '3. Stock In (Intake)' },
          { id: 'lowstock', label: '4. Low Stock Valuation' },
          { id: 'requests', label: '5. Request Status' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`report-tab-${tab.id}`}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-3 py-2 rounded-lg transition-all shrink-0 ${
              activeReportTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: INVENTORY SUMMARY REPORT */}
      {activeReportTab === 'inventory' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Total Catalog Items</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-2">{totalItems}</div>
              <div className="text-[11px] text-slate-400 mt-1">Across {categories.length} categories</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Warehouse Asset Value</span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-2">
                ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 font-medium">Based on current stock * cost</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Healthy Stock Items</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
                {items.filter((i) => getStockStatus(i) === 'NORMAL').length}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">&gt; Reorder threshold</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Items Requiring Reorder</span>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-2">
                {lowStockItems.length}
              </div>
              <div className="text-[11px] text-amber-700 mt-1 font-medium">≤ Reorder threshold</div>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Category Valuation Chart */}
            <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
                Total Stock Valuation by Category ($)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryValuationData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Valuation']}
                      contentStyle={{ borderRadius: '8px', fontSize: '11px', border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="valuation" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stock Health Donut Chart */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
                Stock Health Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENT CONSUMPTION REPORT */}
      {activeReportTab === 'consumption' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
                Total Auxiliary Units Consumed by Department
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentConsumptionData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="unitsIssued" name="Units Consumed" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
                Top Consumed Auxiliary SKUs
              </h3>
              <div className="space-y-3">
                {topConsumedItems.length === 0 ? (
                  <div className="text-slate-400 text-xs py-8 text-center">
                    No consumption issued yet. Approve requests to track consumption trends.
                  </div>
                ) : (
                  topConsumedItems.map((item, idx) => (
                    <div
                      key={item.code}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-mono font-bold text-slate-900 mr-1">{item.code}</span>
                          <span className="text-slate-700">{item.name}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-blue-700 shrink-0 ml-2">
                        {item.quantity} units
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK IN (INTAKE) REPORT */}
      {activeReportTab === 'stockin' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Total Stock In Transactions</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {stockInTransactions.length} receipts
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">Total Units Received</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                +{totalStockInUnits} units
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800">
              Recent Warehouse Receipts Log
            </div>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Tx ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Item Code & Name</th>
                  <th className="px-4 py-3 text-right">Units Received</th>
                  <th className="px-4 py-3">Received By</th>
                  <th className="px-4 py-3">Reference / PO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockInTransactions.map((tx) => {
                  const timeStr = tx.timestamp || tx.dateTime;
                  const qtyChange = typeof tx.quantityChange === 'number' ? tx.quantityChange : tx.quantity;
                  const performer = tx.performedByName || tx.performedBy;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{tx.id}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {timeStr
                          ? new Date(timeStr).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-900 mr-1">{tx.itemCode}</span>
                        <span className="text-slate-700">{tx.itemName}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                        +{qtyChange}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{performer}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{tx.referenceId || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LOW STOCK & REPLENISHMENT COST REPORT */}
      {activeReportTab === 'lowstock' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Deficit SKUs</span>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
                {lowStockItems.length} items
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Below safety thresholds</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Est. Replenishment Capital</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ${estimatedReplenishCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">To restore catalog to max capacity</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Critical Status SKUs</span>
              <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
                {lowStockItems.filter((i) => getStockStatus(i) === 'CRITICAL').length} items
              </div>
              <div className="text-[11px] text-rose-600 mt-0.5">≤ Minimum threshold</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800">
              Low Stock Reorder Valuation Breakdown
            </div>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Item Code</th>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3 text-right">Current Stock</th>
                  <th className="px-4 py-3 text-right">Reorder Level</th>
                  <th className="px-4 py-3 text-right">Target Replenish Qty</th>
                  <th className="px-4 py-3 text-right">Unit Cost</th>
                  <th className="px-4 py-3 text-right">Total Est. Cost</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockItems.map((item) => {
                  const status = getStockStatus(item);
                  const replenishQty = Math.max(item.maximumStockLevel - item.currentStock, item.reorderLevel);
                  const cost = replenishQty * item.unitCost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.itemCode}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.itemName}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-rose-700">
                        {item.currentStock} {item.unitOfMeasurement}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-700">{item.reorderLevel}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">+{replenishQty}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">${item.unitCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">${cost.toFixed(2)}</td>
                      <td className="px-4 py-3"><StatusBadge status={status} size="sm" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REQUEST STATUS REPORT */}
      {activeReportTab === 'requests' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {requestStatusCounts.map((sc) => (
              <div key={sc.status} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 block">{sc.status}</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">{sc.count}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800">
              Master Requisition Ledger ({requests.length} Requests)
            </div>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Requestor</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Line Items</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Approver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{req.id}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{req.requestorName}</td>
                    <td className="px-4 py-3 text-slate-600">{req.department}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {req.items.length} {req.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} size="sm" /></td>
                    <td className="px-4 py-3 text-slate-600">{req.approverName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
