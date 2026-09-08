import React, { useState, useEffect } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { NotificationsPage } from './components/common/NotificationsPage';
import { UserProfilePage } from './components/common/UserProfilePage';

// Requestor Components
import { RequestorDashboard } from './components/requestor/RequestorDashboard';
import { NewRequestPage } from './components/requestor/NewRequestPage';
import { MyRequestsPage } from './components/requestor/MyRequestsPage';

// Approver Components
import { ApproverDashboard } from './components/approver/ApproverDashboard';
import { ApprovalDetailPage } from './components/approver/ApprovalDetailPage';
import { ApprovalHistoryPage } from './components/approver/ApprovalHistoryPage';

// Inventory Admin Components
import { InventoryAdminDashboard } from './components/inventory/InventoryAdminDashboard';
import { InventoryTablePage } from './components/inventory/InventoryTablePage';
import { ItemMasterPage } from './components/inventory/ItemMasterPage';
import { StockInPage } from './components/inventory/StockInPage';
import { TransactionsLedgerPage } from './components/inventory/TransactionsLedgerPage';
import { LowStockPage } from './components/inventory/LowStockPage';
import { AuditTrailPage } from './components/inventory/AuditTrailPage';

// Purchasing Components
import { PurchasingDashboard } from './components/purchasing/PurchasingDashboard';
import { ProcurementAlertsPage } from './components/purchasing/ProcurementAlertsPage';
import { PurchaseOrdersPage } from './components/purchasing/PurchaseOrdersPage';

// Reports
import { ReportsPage } from './components/reports/ReportsPage';

const AppContent: React.FC = () => {
  const { currentUser, requests } = useInventory();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedStockInItemId, setSelectedStockInItemId] = useState<string | null>(null);
  const [selectedPOItemId, setSelectedPOItemId] = useState<string | null>(null);

  // When role changes, default back to 'dashboard' if the active tab is role-incompatible
  useEffect(() => {
    setActiveTab('dashboard');
  }, [currentUser.role]);

  // Main view router
  const renderMainView = () => {
    // 1. Common Tabs
    if (activeTab === 'notifications') {
      return <NotificationsPage onNavigate={setActiveTab} />;
    }
    if (activeTab === 'profile') {
      return <UserProfilePage />;
    }
    if (activeTab === 'reports') {
      return <ReportsPage />;
    }

    // 2. Requestor Role
    if (currentUser.role === 'REQUESTOR') {
      switch (activeTab) {
        case 'new_request':
          return <NewRequestPage onNavigate={setActiveTab} />;
        case 'my_requests':
          return <MyRequestsPage onNavigate={setActiveTab} />;
        case 'dashboard':
        default:
          return <RequestorDashboard onNavigate={setActiveTab} />;
      }
    }

    // 3. Approver Role
    if (currentUser.role === 'APPROVER') {
      switch (activeTab) {
        case 'approval_detail':
          return (
            <ApprovalDetailPage
              requestId={selectedRequestId || requests[0]?.id || ''}
              onBack={() => setActiveTab('pending_approvals')}
              onNavigate={setActiveTab}
            />
          );
        case 'approval_history':
          return (
            <ApprovalHistoryPage
              onNavigate={setActiveTab}
              onSelectRequest={(reqId) => {
                setSelectedRequestId(reqId);
                setActiveTab('approval_detail');
              }}
            />
          );
        case 'pending_approvals':
        case 'dashboard':
        default:
          return (
            <ApproverDashboard
              onNavigate={setActiveTab}
              onSelectRequest={(reqId) => {
                setSelectedRequestId(reqId);
                setActiveTab('approval_detail');
              }}
            />
          );
      }
    }

    // 4. Inventory Admin Role
    if (currentUser.role === 'INVENTORY_ADMIN') {
      switch (activeTab) {
        case 'inventory':
          return (
            <InventoryTablePage
              onNavigate={setActiveTab}
              onStockInItem={(id) => {
                setSelectedStockInItemId(id);
                setActiveTab('add_stock');
              }}
            />
          );
        case 'item_master':
          return <ItemMasterPage onNavigate={setActiveTab} />;
        case 'add_stock':
          return (
            <StockInPage
              initialItemId={selectedStockInItemId || undefined}
              onNavigate={setActiveTab}
            />
          );
        case 'transactions':
          return <TransactionsLedgerPage onNavigate={setActiveTab} />;
        case 'low_stock':
          return (
            <LowStockPage
              onNavigate={setActiveTab}
              onStockInItem={(id) => {
                setSelectedStockInItemId(id);
                setActiveTab('add_stock');
              }}
              onCreatePO={(id) => {
                setSelectedPOItemId(id);
                setActiveTab('purchase_orders');
              }}
            />
          );
        case 'audit_trail':
        case 'audit_logs':
          return <AuditTrailPage />;
        case 'dashboard':
        default:
          return (
            <InventoryAdminDashboard
              onNavigate={setActiveTab}
              onStockInItem={(id) => {
                setSelectedStockInItemId(id);
                setActiveTab('add_stock');
              }}
            />
          );
      }
    }

    // 5. Purchasing Role
    if (currentUser.role === 'PURCHASING') {
      switch (activeTab) {
        case 'procurement_alerts':
          return (
            <ProcurementAlertsPage
              onNavigate={setActiveTab}
              onCreatePO={(id) => {
                setSelectedPOItemId(id);
                setActiveTab('purchase_orders');
              }}
            />
          );
        case 'purchase_orders':
          return (
            <PurchaseOrdersPage
              initialItemId={selectedPOItemId}
              onClearInitialItem={() => setSelectedPOItemId(null)}
            />
          );
        case 'procurement_history':
          return <TransactionsLedgerPage onNavigate={setActiveTab} />;
        case 'dashboard':
        default:
          return (
            <PurchasingDashboard
              onNavigate={setActiveTab}
              onCreatePO={(id) => {
                setSelectedPOItemId(id || null);
                setActiveTab('purchase_orders');
              }}
            />
          );
      }
    }

    // 6. Admin Role (Super-user)
    switch (activeTab) {
      case 'inventory':
        return (
          <InventoryTablePage
            onNavigate={setActiveTab}
            onStockInItem={(id) => {
              setSelectedStockInItemId(id);
              setActiveTab('add_stock');
            }}
          />
        );
      case 'item_master':
        return <ItemMasterPage onNavigate={setActiveTab} />;
      case 'all_requests':
        return <MyRequestsPage onNavigate={setActiveTab} />;
      case 'pending_approvals':
        return (
          <ApproverDashboard
            onNavigate={setActiveTab}
            onSelectRequest={(reqId) => {
              setSelectedRequestId(reqId);
              setActiveTab('approval_detail');
            }}
          />
        );
      case 'procurement_alerts':
        return (
          <ProcurementAlertsPage
            onNavigate={setActiveTab}
            onCreatePO={(id) => {
              setSelectedPOItemId(id);
              setActiveTab('purchase_orders');
            }}
          />
        );
      case 'transactions':
        return <TransactionsLedgerPage onNavigate={setActiveTab} />;
      case 'reports':
        return <ReportsPage />;
      case 'audit_logs':
      case 'audit_trail':
        return <AuditTrailPage />;
      case 'users':
      case 'roles':
      case 'settings':
        return <UserProfilePage />;
      case 'dashboard':
      default:
        return (
          <InventoryAdminDashboard
            onNavigate={setActiveTab}
            onStockInItem={(id) => {
              setSelectedStockInItemId(id);
              setActiveTab('add_stock');
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      {/* Top Application Header */}
      <Header onNavigate={setActiveTab} />

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Role-Specific Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Page Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {renderMainView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
}
