import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Filter,
  ArrowRightLeft,
  Calendar,
  FileSpreadsheet,
  Building,
  User,
  Hash,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { TransactionType } from '../../types';

interface TransactionsLedgerPageProps {
  onNavigate?: (tabId: string) => void;
}

export const TransactionsLedgerPage: React.FC<TransactionsLedgerPageProps> = () => {
  const { transactions } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<string>('ALL');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const pName = tx.performedByName || tx.performedBy || '';
      const pRef = tx.referenceId || '';
      const pNotes = tx.notes || tx.remarks || '';
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        (tx.id && tx.id.toLowerCase().includes(q)) ||
        (tx.itemCode && tx.itemCode.toLowerCase().includes(q)) ||
        (tx.itemName && tx.itemName.toLowerCase().includes(q)) ||
        pName.toLowerCase().includes(q) ||
        pRef.toLowerCase().includes(q) ||
        pNotes.toLowerCase().includes(q);

      const matchesType = selectedType === 'ALL' || tx.transactionType === selectedType;

      let matchesTime = true;
      const now = new Date().getTime();
      const timeStr = tx.timestamp || tx.dateTime;
      const txTime = timeStr ? new Date(timeStr).getTime() : now;
      const oneDay = 24 * 60 * 60 * 1000;

      if (timeFilter === 'TODAY') {
        matchesTime = now - txTime < oneDay;
      } else if (timeFilter === 'WEEK') {
        matchesTime = now - txTime < 7 * oneDay;
      } else if (timeFilter === 'MONTH') {
        matchesTime = now - txTime < 30 * oneDay;
      }

      return matchesSearch && matchesType && matchesTime;
    });
  }, [transactions, searchQuery, selectedType, timeFilter]);

  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Timestamp',
      'Type',
      'Item Code',
      'Item Name',
      'Quantity Change',
      'Previous Stock',
      'New Stock',
      'Performed By',
      'Department / Supplier',
      'Reference ID',
      'Notes',
    ];

    const rows = filteredTransactions.map((tx) => {
      const timeStr = tx.timestamp || tx.dateTime || '';
      const qtyChange = typeof tx.quantityChange === 'number' ? tx.quantityChange : tx.quantity;
      const pName = tx.performedByName || tx.performedBy || '';
      const pNotes = tx.notes || tx.remarks || '';
      return [
        `"${tx.id}"`,
        `"${timeStr}"`,
        `"${tx.transactionType}"`,
        `"${tx.itemCode}"`,
        `"${tx.itemName}"`,
        qtyChange,
        tx.previousStock,
        tx.newStock,
        `"${pName}"`,
        `"${tx.department || tx.supplier || ''}"`,
        `"${tx.referenceId || ''}"`,
        `"${pNotes}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.join('\n')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="transactions-ledger-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inventory Transactions Ledger</h2>
          <p className="text-xs text-slate-500">
            Immutable, sequential audit log of every stock intake, requisition issuance, and balance adjustment.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export Ledger CSV ({filteredTransactions.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Tx ID, Item Code, Name, User, Reference..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 shrink-0"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="STOCK_IN">Stock In (Intake)</option>
            <option value="ISSUE">Issue (Requisition)</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="RETURN">Return</option>
          </select>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 shrink-0"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No transactions found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Tx ID</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Item Code & Name</th>
                  <th className="px-4 py-3 text-right">Qty Change</th>
                  <th className="px-4 py-3 text-right">Prev / New Stock</th>
                  <th className="px-4 py-3">Performed By</th>
                  <th className="px-4 py-3">Dept / Supplier</th>
                  <th className="px-4 py-3">Reference / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const qtyChange = typeof tx.quantityChange === 'number' ? tx.quantityChange : tx.quantity;
                  const isPositive = qtyChange > 0;
                  const timeStr = tx.timestamp || tx.dateTime;
                  const performer = tx.performedByName || tx.performedBy;
                  const pNotes = tx.notes || tx.remarks;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {tx.id}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                        {timeStr
                          ? new Date(timeStr).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.transactionType === 'STOCK_IN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.transactionType === 'ISSUE'
                              ? 'bg-blue-100 text-blue-800'
                              : tx.transactionType === 'ADJUSTMENT'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {tx.transactionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <span className="font-mono font-bold text-slate-900 mr-1.5">
                          {tx.itemCode}
                        </span>
                        <span className="text-slate-800 font-medium truncate">
                          {tx.itemName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold">
                        <span
                          className={isPositive ? 'text-emerald-600' : 'text-slate-900'}
                        >
                          {isPositive ? `+${qtyChange}` : qtyChange}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-500 text-[11px]">
                        {tx.previousStock} →{' '}
                        <span className="font-bold text-slate-900">{tx.newStock}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {performer}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                        {tx.department || tx.supplier || '—'}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        {tx.referenceId && (
                          <div className="font-mono font-semibold text-[11px] text-slate-800">
                            {tx.referenceId}
                          </div>
                        )}
                        {pNotes && (
                          <div className="text-[11px] text-slate-400 truncate">
                            {pNotes}
                          </div>
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
    </div>
  );
};
