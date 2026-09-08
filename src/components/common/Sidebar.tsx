import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  CheckSquare,
  History,
  Boxes,
  Database,
  ArrowDownToLine,
  ArrowRightLeft,
  AlertTriangle,
  BarChart3,
  Bell,
  User,
  Users,
  ShieldCheck,
  ShoppingCart,
  FileSpreadsheet,
  ScrollText,
  Settings,
  Flame,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, requests, procurementAlerts, items, unreadNotificationCount, getStockStatus } =
    useInventory();

  // Badges
  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;
  const myPendingRequestsCount = requests.filter(
    (r) => r.requestorId === currentUser.id && r.status === 'PENDING'
  ).length;
  const lowStockItemsCount = items.filter((i) => {
    const s = getStockStatus(i);
    return s === 'LOW_STOCK' || s === 'CRITICAL' || s === 'OUT_OF_STOCK';
  }).length;
  const activeAlertsCount = procurementAlerts.filter((a) => a.status !== 'CLOSED').length;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }

  const getNavItems = (): NavItem[] => {
    switch (currentUser.role) {
      case 'REQUESTOR':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'new_request', label: 'New Request', icon: PlusCircle },
          {
            id: 'my_requests',
            label: 'My Requests',
            icon: ClipboardList,
            badge: myPendingRequestsCount,
            badgeColor: 'bg-blue-100 text-blue-700',
          },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            badge: unreadNotificationCount,
            badgeColor: 'bg-rose-100 text-rose-700',
          },
          { id: 'profile', label: 'Profile', icon: User },
        ];

      case 'APPROVER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          {
            id: 'pending_approvals',
            label: 'Pending Approvals',
            icon: CheckSquare,
            badge: pendingRequestsCount,
            badgeColor: 'bg-amber-100 text-amber-800',
          },
          { id: 'approval_history', label: 'Approval History', icon: History },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            badge: unreadNotificationCount,
            badgeColor: 'bg-rose-100 text-rose-700',
          },
          { id: 'profile', label: 'Profile', icon: User },
        ];

      case 'INVENTORY_ADMIN':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'inventory', label: 'Inventory', icon: Boxes },
          { id: 'item_master', label: 'Item Master (70)', icon: Database },
          { id: 'add_stock', label: 'Add Stock (Stock In)', icon: ArrowDownToLine },
          { id: 'transactions', label: 'Transactions Ledger', icon: ArrowRightLeft },
          {
            id: 'low_stock',
            label: 'Low Stock',
            icon: AlertTriangle,
            badge: lowStockItemsCount,
            badgeColor: 'bg-rose-100 text-rose-800',
          },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            badge: unreadNotificationCount,
            badgeColor: 'bg-rose-100 text-rose-700',
          },
          { id: 'profile', label: 'Profile', icon: User },
        ];

      case 'PURCHASING':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          {
            id: 'procurement_alerts',
            label: 'Procurement Alerts',
            icon: AlertTriangle,
            badge: activeAlertsCount,
            badgeColor: 'bg-amber-100 text-amber-800',
          },
          { id: 'purchase_orders', label: 'Purchase Orders', icon: ShoppingCart },
          { id: 'procurement_history', label: 'Procurement History', icon: History },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            badge: unreadNotificationCount,
            badgeColor: 'bg-rose-100 text-rose-700',
          },
          { id: 'profile', label: 'Profile', icon: User },
        ];

      case 'ADMIN':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'roles', label: 'Roles & Perms', icon: ShieldCheck },
          { id: 'inventory', label: 'Inventory', icon: Boxes },
          { id: 'item_master', label: 'Items (70)', icon: Database },
          {
            id: 'all_requests',
            label: 'Requests',
            icon: ClipboardList,
            badge: pendingRequestsCount,
            badgeColor: 'bg-blue-100 text-blue-800',
          },
          { id: 'pending_approvals', label: 'Approvals', icon: CheckSquare },
          {
            id: 'procurement_alerts',
            label: 'Procurement',
            icon: AlertTriangle,
            badge: activeAlertsCount,
            badgeColor: 'bg-amber-100 text-amber-800',
          },
          { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'audit_logs', label: 'Audit Logs', icon: ScrollText },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      id="role-sidebar"
      className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col min-h-[calc(100vh-61px)]"
    >
      {/* Current Role Identity Card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/60">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Active Workspace
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            {currentUser?.name?.[0] || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-slate-900 truncate">
              {currentUser?.name || 'User'}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {currentUser?.department || 'Operations'}
            </div>
          </div>
        </div>
        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-800">
          Role: {(currentUser?.role || 'REQUESTOR').replace('_', ' ')}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-sky-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-sky-500 text-white'
                      : item.badgeColor || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-slate-700">Catalog Size</span>
          <span className="font-mono font-bold text-slate-900">{items.length} Items</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">Stock Health</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Operational
          </span>
        </div>
      </div>
    </aside>
  );
};
