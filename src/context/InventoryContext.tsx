import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  InventoryItem,
  InventoryRequest,
  InventoryTransaction,
  ProcurementAlert,
  PurchaseOrder,
  Notification,
  EmailMessage,
  AuditLog,
  StockStatus,
  RequestStatus,
  ProcurementStatus,
  Priority,
  RequestItemEntry,
} from '../types';
import { INITIAL_ITEMS } from '../data/seedItems';
import { INITIAL_USERS } from '../data/seedUsers';
import {
  INITIAL_REQUESTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ALERTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_EMAILS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';

interface InventoryContextType {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  items: InventoryItem[];
  requests: InventoryRequest[];
  transactions: InventoryTransaction[];
  procurementAlerts: ProcurementAlert[];
  purchaseOrders: PurchaseOrder[];
  notifications: Notification[];
  emails: EmailMessage[];
  auditLogs: AuditLog[];
  unreadNotificationCount: number;

  // Stock Status Calculation
  getStockStatus: (item: InventoryItem) => StockStatus;

  // Requestor Actions
  submitRequest: (data: {
    items: { itemId: string; requestedQuantity: number }[];
    department: string;
    priority: Priority;
    purpose: string;
    remarks?: string;
  }) => { success: boolean; error?: string; requestId?: string };
  cancelRequest: (requestId: string) => { success: boolean; error?: string };

  // Approver Actions
  approveRequest: (requestId: string) => { success: boolean; error?: string };
  rejectRequest: (requestId: string, reason: string) => { success: boolean; error?: string };

  // Inventory Admin Actions
  addStock: (data: {
    itemId: string;
    quantityReceived: number;
    supplier: string;
    purchaseOrderNumber: string;
    receivedDate: string;
    remarks?: string;
  }) => { success: boolean; error?: string };
  adjustStock: (data: {
    itemId: string;
    newStock: number;
    reason: string;
  }) => { success: boolean; error?: string };
  createItem: (item: Omit<InventoryItem, 'id' | 'createdDate' | 'lastUpdated'>) => {
    success: boolean;
    error?: string;
  };
  updateItem: (itemId: string, updates: Partial<InventoryItem>) => {
    success: boolean;
    error?: string;
  };
  toggleItemActive: (itemId: string) => { success: boolean; error?: string };

  // Purchasing Actions
  updateProcurementStatus: (
    alertId: string,
    newStatus: ProcurementStatus,
    notes?: string,
    poDetails?: { supplier: string; poNumber: string }
  ) => { success: boolean; error?: string };
  updateProcurementAlertStatus: (alertId: string, newStatus: ProcurementStatus) => {
    success: boolean;
    error?: string;
  };
  createPurchaseOrder: (data: {
    supplier: { name: string; contact?: string } | string;
    items: { itemId: string; quantity: number }[];
    expectedDeliveryDate?: string;
    notes?: string;
  }) => { success: boolean; error?: string; poNumber?: string };
  receivePurchaseOrder: (poId: string) => { success: boolean; error?: string };

  // Notification Actions
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Admin Actions
  createUser: (user: Omit<User, 'id'>) => { success: boolean; error?: string };
  updateUser: (userId: string, updates: Partial<User>) => { success: boolean; error?: string };
  resetToDemoData: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'aims_storage_v1_';

function safeStorageLoad<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or fallback to initial seed
  const [users, setUsers] = useState<User[]>(() => {
    const loaded = safeStorageLoad<User[]>(`${STORAGE_KEY_PREFIX}users`, INITIAL_USERS);
    return Array.isArray(loaded) && loaded.length > 0 && loaded[0]?.name ? loaded : INITIAL_USERS;
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const loaded = safeStorageLoad<User>(`${STORAGE_KEY_PREFIX}currentUser`, INITIAL_USERS[0]);
    return loaded && typeof loaded === 'object' && loaded.name && loaded.role ? loaded : INITIAL_USERS[0];
  });

  const setCurrentUser = (user: User | ((prev: User) => User)) => {
    if (typeof user === 'function') {
      setCurrentUserState((prev) => {
        const next = user(prev);
        return next && typeof next === 'object' && next.name && next.role ? next : prev;
      });
    } else if (user && typeof user === 'object' && user.name && user.role) {
      setCurrentUserState(user);
    } else {
      setCurrentUserState(INITIAL_USERS[0]);
    }
  };

  const [items, setItems] = useState<InventoryItem[]>(() =>
    safeStorageLoad(`${STORAGE_KEY_PREFIX}items`, INITIAL_ITEMS)
  );

  const [requests, setRequests] = useState<InventoryRequest[]>(() =>
    safeStorageLoad(`${STORAGE_KEY_PREFIX}requests`, INITIAL_REQUESTS)
  );

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() =>
    safeStorageLoad(`${STORAGE_KEY_PREFIX}transactions`, INITIAL_TRANSACTIONS)
  );

  const [procurementAlerts, setProcurementAlerts] = useState<ProcurementAlert[]>(() =>
    safeStorageLoad(`${STORAGE_KEY_PREFIX}alerts`, INITIAL_ALERTS)
  );

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() =>
    safeStorageLoad(`${STORAGE_KEY_PREFIX}po`, INITIAL_PURCHASE_ORDERS)
  );

  const [notifications, setNotifications] = useState<Notification[]>(() =>
    safeStorageLoad(`${STORAGE_KEY_PREFIX}notifications`, INITIAL_NOTIFICATIONS)
  );

  const [emails, setEmails] = useState<EmailMessage[]>(() =>
    safeStorageLoad(`${STORAGE_KEY_PREFIX}emails`, INITIAL_EMAILS)
  );

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    safeStorageLoad(`${STORAGE_KEY_PREFIX}audit_logs`, INITIAL_AUDIT_LOGS)
  );

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}currentUser`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}items`, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}requests`, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}alerts`, JSON.stringify(procurementAlerts));
  }, [procurementAlerts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}po`, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}emails`, JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Stock Status Calculation
  const getStockStatus = (item: InventoryItem): StockStatus => {
    if (item.currentStock <= 0) return 'OUT_OF_STOCK';
    if (item.currentStock <= item.minimumStockLevel) return 'CRITICAL';
    if (item.currentStock <= item.reorderLevel) return 'LOW_STOCK';
    return 'NORMAL';
  };

  // Helper: Log audit action
  const logAudit = (
    action: string,
    entity: AuditLog['entity'],
    entityId: string,
    details?: string,
    previousValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: `LOG-${String(auditLogs.length + 1).padStart(4, '0')}`,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      entity,
      entityId,
      previousValue,
      newValue,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper: Create notification
  const addNotification = (
    title: string,
    message: string,
    type: Notification['type'],
    recipientRole?: UserRole | 'ALL',
    recipientUserId?: string,
    entityType?: Notification['entityType'],
    entityId?: string
  ) => {
    const newNotification: Notification = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientRole,
      recipientUserId,
      title,
      message,
      type,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Helper: Dispatch automated email for low / critical stock
  const triggerAutomatedLowStockEmail = (item: InventoryItem, newStock: number) => {
    const isCritical = newStock <= item.minimumStockLevel;
    const suggestedQty = Math.max(0, item.maximumStockLevel - newStock);
    const alertType = isCritical ? 'CRITICAL STOCK' : 'LOW STOCK';

    const subject = `${alertType} ALERT — [${item.itemCode}] — [${item.itemName}]`;
    const body = `Automated Procurement Alert:
---------------------------------------------
Alert Classification: ${alertType} THRESHOLD BREACH
Item Code: ${item.itemCode}
Item Name: ${item.itemName}
Category: ${item.category}
Current Stock: ${newStock} ${item.unitOfMeasurement}
Minimum Stock Level: ${item.minimumStockLevel} ${item.unitOfMeasurement}
Reorder Level: ${item.reorderLevel} ${item.unitOfMeasurement}
Maximum Stock Level: ${item.maximumStockLevel} ${item.unitOfMeasurement}
Suggested Order Quantity: ${suggestedQty} ${item.unitOfMeasurement}
Storage Location: ${item.storageLocation}
Date/Time: ${new Date().toISOString()}

Notice: Inventory has crossed into the ${alertType.toLowerCase()} state. Immediate procurement review is requested.

Auxiliary Inventory Automation Engine
System Automated Dispatch`;

    const newEmail: EmailMessage = {
      id: `EML-${Date.now()}`,
      to: 'purchasing-team@company.internal',
      subject,
      itemCode: item.itemCode,
      itemName: item.itemName,
      currentStock: newStock,
      minimumStockLevel: item.minimumStockLevel,
      reorderLevel: item.reorderLevel,
      maximumStockLevel: item.maximumStockLevel,
      suggestedOrderQuantity: suggestedQty,
      timestamp: new Date().toISOString(),
      body,
      status: 'SENT',
    };

    setEmails((prev) => [newEmail, ...prev]);
  };

  // 1. Submit Request (Requestor)
  const submitRequest = ({
    items: requestedItemEntries,
    department,
    priority,
    purpose,
    remarks,
  }: {
    items: { itemId: string; requestedQuantity: number }[];
    department: string;
    priority: Priority;
    purpose: string;
    remarks?: string;
  }): { success: boolean; error?: string; requestId?: string } => {
    if (currentUser.role !== 'REQUESTOR' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Only Requestors or Admins can submit inventory requests.' };
    }

    if (!requestedItemEntries || requestedItemEntries.length === 0) {
      return { success: false, error: 'Request must contain at least one item.' };
    }

    // Check duplicate items
    const itemIds = requestedItemEntries.map((i) => i.itemId);
    const uniqueIds = new Set(itemIds);
    if (uniqueIds.size !== itemIds.length) {
      return { success: false, error: 'Cannot add duplicate items to the same request.' };
    }

    // Validate quantities & active items & available stock
    const lineItems: RequestItemEntry[] = [];
    for (const entry of requestedItemEntries) {
      if (entry.requestedQuantity <= 0) {
        return { success: false, error: 'Requested quantity must be strictly greater than zero.' };
      }

      const invItem = items.find((i) => i.id === entry.itemId);
      if (!invItem) {
        return { success: false, error: `Item with ID ${entry.itemId} not found in master.` };
      }
      if (!invItem.active) {
        return { success: false, error: `Item ${invItem.itemCode} is deactivated and cannot be requested.` };
      }
      if (entry.requestedQuantity > invItem.currentStock) {
        return {
          success: false,
          error: `Requested quantity (${entry.requestedQuantity}) for ${invItem.itemCode} exceeds available stock (${invItem.currentStock}).`,
        };
      }

      lineItems.push({
        itemId: invItem.id,
        itemCode: invItem.itemCode,
        itemName: invItem.itemName,
        requestedQuantity: entry.requestedQuantity,
        unitOfMeasurement: invItem.unitOfMeasurement,
        currentStockAtRequest: invItem.currentStock,
      });
    }

    const nextNumber = requests.length + 1;
    const newRequestId = `REQ-${String(nextNumber).padStart(4, '0')}`;

    const newRequest: InventoryRequest = {
      id: newRequestId,
      requestDate: new Date().toISOString(),
      requestorId: currentUser.id,
      requestorName: currentUser.name,
      requestorEmail: currentUser.email,
      department: department || currentUser.department,
      priority,
      purpose,
      remarks,
      items: lineItems,
      status: 'PENDING',
    };

    setRequests((prev) => [newRequest, ...prev]);

    // Notify approvers
    addNotification(
      'New Request Awaiting Approval',
      `${currentUser.name} (${department}) submitted ${newRequestId} with ${lineItems.length} item(s)`,
      'INFO',
      'APPROVER',
      undefined,
      'REQUEST',
      newRequestId
    );

    // Audit log
    logAudit(
      'REQUEST_SUBMITTED',
      'REQUEST',
      newRequestId,
      `Submitted by ${currentUser.name} for ${lineItems.map((i) => `${i.requestedQuantity}x ${i.itemCode}`).join(', ')}`,
      undefined,
      'Status: PENDING'
    );

    return { success: true, requestId: newRequestId };
  };

  // 2. Cancel Request (Requestor / Admin)
  const cancelRequest = (requestId: string): { success: boolean; error?: string } => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return { success: false, error: 'Request not found.' };

    if (request.status !== 'PENDING') {
      return { success: false, error: `Cannot cancel request in '${request.status}' status.` };
    }

    // Role check: requestor can only cancel their own, admin can cancel any
    if (currentUser.role === 'REQUESTOR' && request.requestorId !== currentUser.id) {
      return { success: false, error: 'You can only cancel your own requests.' };
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'CANCELLED' as RequestStatus } : r))
    );

    // Notification to requestor and approver
    addNotification(
      'Request Cancelled',
      `Request ${requestId} was cancelled by ${currentUser.name}`,
      'WARNING',
      'APPROVER',
      undefined,
      'REQUEST',
      requestId
    );

    logAudit('REQUEST_CANCELLED', 'REQUEST', requestId, `Cancelled by ${currentUser.name}`, 'PENDING', 'CANCELLED');

    return { success: true };
  };

  // 3. Approve Request (Approver / Admin) with Atomic Stock Deduction
  const approveRequest = (requestId: string): { success: boolean; error?: string } => {
    if (currentUser.role !== 'APPROVER' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Only Approvers or Admins can approve requests.' };
    }

    const request = requests.find((r) => r.id === requestId);
    if (!request) return { success: false, error: 'Request not found.' };

    if (request.status !== 'PENDING') {
      return { success: false, error: `Request ${requestId} is already ${request.status}.` };
    }

    // CRITICAL BUSINESS RULE: Re-fetch latest current stock and validate all requested items
    for (const reqItem of request.items) {
      const currentItem = items.find((i) => i.id === reqItem.itemId || i.itemCode === reqItem.itemCode);
      if (!currentItem) {
        return { success: false, error: `Item ${reqItem.itemCode} does not exist in master catalog.` };
      }
      if (reqItem.requestedQuantity > currentItem.currentStock) {
        // Show insufficient stock warning & block approval
        addNotification(
          'Approval Blocked: Insufficient Stock',
          `Cannot approve ${requestId}: Item ${currentItem.itemCode} has only ${currentItem.currentStock} in stock, but ${reqItem.requestedQuantity} was requested.`,
          'ALERT',
          'APPROVER',
          currentUser.id,
          'REQUEST',
          requestId
        );
        return {
          success: false,
          error: `Insufficient stock for ${currentItem.itemCode} (${currentItem.itemName}). Available: ${currentItem.currentStock}, Requested: ${reqItem.requestedQuantity}. Approval blocked.`,
        };
      }
    }

    // If all items are sufficient, proceed with ATOMIC deduction, transactions, and alert checks
    const now = new Date().toISOString();
    const newTransactions: InventoryTransaction[] = [];
    const updatedItems = [...items];
    const newAlerts = [...procurementAlerts];

    request.items.forEach((reqItem, idx) => {
      const itemIndex = updatedItems.findIndex(
        (i) => i.id === reqItem.itemId || i.itemCode === reqItem.itemCode
      );
      const prevStock = updatedItems[itemIndex].currentStock;
      const newStock = prevStock - reqItem.requestedQuantity;

      // Update item
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        currentStock: newStock,
        lastUpdated: now,
      };

      // Record transaction
      const txnId = `TXN-${String(transactions.length + 1 + idx).padStart(4, '0')}`;
      newTransactions.push({
        id: txnId,
        itemCode: reqItem.itemCode,
        itemName: reqItem.itemName,
        transactionType: 'ISSUE',
        quantity: -reqItem.requestedQuantity,
        quantityChange: -reqItem.requestedQuantity,
        previousStock: prevStock,
        newStock: newStock,
        referenceId: request.id,
        performedBy: currentUser.name,
        performedByName: currentUser.name,
        performedByRole: currentUser.role,
        dateTime: now,
        timestamp: now,
        remarks: `Approved & Issued for ${request.requestorName} (${request.department})`,
        notes: `Approved & Issued for ${request.requestorName} (${request.department})`,
        department: request.department,
      });

      // LOW STOCK AUTOMATION CHECK: newStock <= reorderLevel
      const currentItem = updatedItems[itemIndex];
      if (newStock <= currentItem.reorderLevel) {
        const existingAlertIndex = newAlerts.findIndex(
          (a) => a.itemCode === currentItem.itemCode && a.status !== 'CLOSED'
        );
        const suggestedQty = Math.max(0, currentItem.maximumStockLevel - newStock);

        if (existingAlertIndex >= 0) {
          // Update existing active alert
          newAlerts[existingAlertIndex] = {
            ...newAlerts[existingAlertIndex],
            currentStock: newStock,
            suggestedOrderQuantity: suggestedQty,
            alertDate: now,
          };
        } else {
          // Create new alert
          const nextAlertId = `PA-${String(newAlerts.length + 1).padStart(3, '0')}`;
          newAlerts.unshift({
            id: nextAlertId,
            itemId: currentItem.id,
            itemCode: currentItem.itemCode,
            itemName: currentItem.itemName,
            category: currentItem.category,
            currentStock: newStock,
            minimumLevel: currentItem.minimumStockLevel,
            reorderLevel: currentItem.reorderLevel,
            maximumLevel: currentItem.maximumStockLevel,
            suggestedOrderQuantity: suggestedQty,
            alertDate: now,
            status: 'NEW',
          });
        }

        // Send simulated email to Purchasing Team
        triggerAutomatedLowStockEmail(currentItem, newStock);

        // Send in-app notification to Purchasing
        addNotification(
          `${newStock <= currentItem.minimumStockLevel ? 'CRITICAL' : 'LOW'} Stock Alert`,
          `Item ${currentItem.itemCode} (${currentItem.itemName}) stock fell to ${newStock} (Reorder point: ${currentItem.reorderLevel}).`,
          newStock <= currentItem.minimumStockLevel ? 'ALERT' : 'WARNING',
          'PURCHASING',
          undefined,
          'ITEM',
          currentItem.itemCode
        );
      }
    });

    // Update state atomically
    setItems(updatedItems);
    setTransactions((prev) => [...newTransactions, ...prev]);
    setProcurementAlerts(newAlerts);

    // Update Request status to ISSUED
    const updatedRequest: InventoryRequest = {
      ...request,
      status: 'ISSUED',
      approverId: currentUser.id,
      approverName: currentUser.name,
      approvalDate: now,
      issuedDate: now,
      items: request.items.map((i) => ({
        ...i,
        currentStockAtApproval: items.find((it) => it.id === i.itemId)?.currentStock,
      })),
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));

    // Notify Requestor
    addNotification(
      'Request Approved & Issued',
      `Your request ${request.id} was approved by ${currentUser.name}. Items have been issued from inventory.`,
      'SUCCESS',
      'REQUESTOR',
      request.requestorId,
      'REQUEST',
      request.id
    );

    // Audit log
    logAudit(
      'REQUEST_APPROVED',
      'REQUEST',
      request.id,
      `Approved by ${currentUser.name}. Automatically deducted stock and recorded ${newTransactions.length} transaction(s).`,
      'PENDING',
      'ISSUED'
    );

    return { success: true };
  };

  // 4. Reject Request (Approver / Admin)
  const rejectRequest = (requestId: string, reason: string): { success: boolean; error?: string } => {
    if (currentUser.role !== 'APPROVER' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Only Approvers or Admins can reject requests.' };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'A mandatory rejection reason must be provided.' };
    }

    const request = requests.find((r) => r.id === requestId);
    if (!request) return { success: false, error: 'Request not found.' };

    if (request.status !== 'PENDING') {
      return { success: false, error: `Request ${requestId} is already ${request.status}.` };
    }

    const now = new Date().toISOString();
    const updatedRequest: InventoryRequest = {
      ...request,
      status: 'REJECTED',
      approverId: currentUser.id,
      approverName: currentUser.name,
      approvalDate: now,
      rejectionReason: reason.trim(),
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));

    // Notify Requestor
    addNotification(
      'Request Rejected',
      `Your request ${request.id} was rejected by ${currentUser.name}. Reason: ${reason}`,
      'WARNING',
      'REQUESTOR',
      request.requestorId,
      'REQUEST',
      request.id
    );

    logAudit(
      'REQUEST_REJECTED',
      'REQUEST',
      request.id,
      `Rejected by ${currentUser.name}. Reason: ${reason}`,
      'PENDING',
      'REJECTED'
    );

    return { success: true };
  };

  // 5. Add Stock (Inventory Admin / Admin)
  const addStock = ({
    itemId,
    quantityReceived,
    supplier,
    purchaseOrderNumber,
    receivedDate,
    remarks,
  }: {
    itemId: string;
    quantityReceived: number;
    supplier: string;
    purchaseOrderNumber: string;
    receivedDate: string;
    remarks?: string;
  }): { success: boolean; error?: string } => {
    if (currentUser.role !== 'INVENTORY_ADMIN' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Only Inventory Admins or Admins can record stock received.' };
    }

    if (quantityReceived <= 0) {
      return { success: false, error: 'Quantity received must be greater than zero.' };
    }

    const item = items.find((i) => i.id === itemId || i.itemCode === itemId);
    if (!item) return { success: false, error: 'Item not found in master catalogue.' };

    const previousStock = item.currentStock;
    const newStock = previousStock + quantityReceived;
    const now = new Date().toISOString();

    // Update item stock
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, currentStock: newStock, lastUpdated: now } : i
      )
    );

    // Create transaction
    const txnId = `TXN-${String(transactions.length + 1).padStart(4, '0')}`;
    const newTxn: InventoryTransaction = {
      id: txnId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      transactionType: 'STOCK_IN',
      quantity: quantityReceived,
      quantityChange: quantityReceived,
      previousStock,
      newStock,
      referenceId: purchaseOrderNumber || `PO-${Date.now().toString().slice(-4)}`,
      performedBy: currentUser.name,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
      dateTime: receivedDate || now,
      timestamp: receivedDate || now,
      remarks: remarks || `Received from ${supplier || 'Standard Supplier'}`,
      notes: remarks || `Received from ${supplier || 'Standard Supplier'}`,
      supplier: supplier || 'Standard Supplier',
    };
    setTransactions((prev) => [newTxn, ...prev]);

    // Check procurement alert: if there was an active alert for this item and stock is now above reorder level, close it!
    setProcurementAlerts((prev) =>
      prev.map((alert) => {
        if (alert.itemCode === item.itemCode && alert.status !== 'CLOSED') {
          if (newStock > item.reorderLevel) {
            return {
              ...alert,
              status: 'CLOSED',
              currentStock: newStock,
              receivedDate: now,
              notes: `Replenishment fulfilled via ${purchaseOrderNumber || txnId}. Stock restored to ${newStock}.`,
            };
          } else {
            return {
              ...alert,
              currentStock: newStock,
              suggestedOrderQuantity: Math.max(0, item.maximumStockLevel - newStock),
            };
          }
        }
        return alert;
      })
    );

    // Notification
    addNotification(
      'Stock Received & Added',
      `${quantityReceived} units of ${item.itemCode} (${item.itemName}) recorded by ${currentUser.name}. Stock: ${previousStock} -> ${newStock}`,
      'SUCCESS',
      'ALL',
      undefined,
      'STOCK',
      item.itemCode
    );

    logAudit(
      'STOCK_ADDED',
      'INVENTORY',
      item.itemCode,
      `Added ${quantityReceived} units via PO ${purchaseOrderNumber || 'N/A'}. Previous: ${previousStock}, New: ${newStock}`,
      `Stock: ${previousStock}`,
      `Stock: ${newStock}`
    );

    return { success: true };
  };

  // 6. Adjust Stock (Discrepancy correction with mandatory reason)
  const adjustStock = ({
    itemId,
    newStock,
    reason,
  }: {
    itemId: string;
    newStock: number;
    reason: string;
  }): { success: boolean; error?: string } => {
    if (currentUser.role !== 'INVENTORY_ADMIN' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Only Inventory Admins or Admins can adjust inventory.' };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'A mandatory discrepancy reason must be provided.' };
    }

    if (newStock < 0) {
      return { success: false, error: 'Inventory stock quantity cannot be negative.' };
    }

    const item = items.find((i) => i.id === itemId || i.itemCode === itemId);
    if (!item) return { success: false, error: 'Item not found.' };

    const previousStock = item.currentStock;
    const diff = newStock - previousStock;
    if (diff === 0) return { success: true };

    const now = new Date().toISOString();

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, currentStock: newStock, lastUpdated: now } : i))
    );

    // Create ADJUSTMENT transaction
    const txnId = `TXN-${String(transactions.length + 1).padStart(4, '0')}`;
    const newTxn: InventoryTransaction = {
      id: txnId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      transactionType: 'ADJUSTMENT',
      quantity: diff,
      quantityChange: diff,
      previousStock,
      newStock,
      referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
      performedBy: currentUser.name,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
      dateTime: now,
      timestamp: now,
      remarks: reason.trim(),
      notes: reason.trim(),
    };
    setTransactions((prev) => [newTxn, ...prev]);

    // Check low stock triggers
    if (newStock <= item.reorderLevel) {
      triggerAutomatedLowStockEmail(item, newStock);
    }

    logAudit(
      'STOCK_ADJUSTED',
      'INVENTORY',
      item.itemCode,
      `Inventory adjusted by ${diff > 0 ? '+' : ''}${diff}. Reason: ${reason}`,
      `Stock: ${previousStock}`,
      `Stock: ${newStock}`
    );

    return { success: true };
  };

  // 7. Item Master Actions
  const createItem = (
    itemData: Omit<InventoryItem, 'id' | 'createdDate' | 'lastUpdated'>
  ): { success: boolean; error?: string } => {
    if (currentUser.role !== 'INVENTORY_ADMIN' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized to create items.' };
    }

    // Check unique Item Code
    const trimmedCode = itemData.itemCode.trim().toUpperCase();
    if (items.some((i) => i.itemCode.toUpperCase() === trimmedCode)) {
      return { success: false, error: `Item Code "${trimmedCode}" already exists. Item codes must be strictly unique.` };
    }

    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      itemCode: trimmedCode,
      createdDate: now,
      lastUpdated: now,
    };

    setItems((prev) => [newItem, ...prev]);

    logAudit('ITEM_CREATED', 'ITEM_MASTER', trimmedCode, `Created item ${newItem.itemName} by ${currentUser.name}`);

    return { success: true };
  };

  const updateItem = (
    itemId: string,
    updates: Partial<InventoryItem>
  ): { success: boolean; error?: string } => {
    if (currentUser.role !== 'INVENTORY_ADMIN' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized to edit item master.' };
    }

    const existing = items.find((i) => i.id === itemId);
    if (!existing) return { success: false, error: 'Item not found.' };

    if (updates.itemCode && updates.itemCode !== existing.itemCode) {
      const trimmedCode = updates.itemCode.trim().toUpperCase();
      if (items.some((i) => i.id !== itemId && i.itemCode.toUpperCase() === trimmedCode)) {
        return { success: false, error: `Item Code "${trimmedCode}" is already in use by another item.` };
      }
    }

    const now = new Date().toISOString();
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...updates, lastUpdated: now } : i))
    );

    logAudit('ITEM_UPDATED', 'ITEM_MASTER', existing.itemCode, `Updated item details by ${currentUser.name}`);

    return { success: true };
  };

  const toggleItemActive = (itemId: string): { success: boolean; error?: string } => {
    if (currentUser.role !== 'INVENTORY_ADMIN' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized to modify item status.' };
    }

    const item = items.find((i) => i.id === itemId);
    if (!item) return { success: false, error: 'Item not found.' };

    const newActive = !item.active;
    const now = new Date().toISOString();

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, active: newActive, lastUpdated: now } : i))
    );

    logAudit(
      'ITEM_STATUS_TOGGLED',
      'ITEM_MASTER',
      item.itemCode,
      `Item active state changed to ${newActive} by ${currentUser.name}`
    );

    return { success: true };
  };

  // 8. Purchasing Actions
  const updateProcurementStatus = (
    alertId: string,
    newStatus: ProcurementStatus,
    notes?: string,
    poDetails?: { supplier: string; poNumber: string }
  ): { success: boolean; error?: string } => {
    if (currentUser.role !== 'PURCHASING' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Only Purchasing Team or Admins can manage procurement workflows.' };
    }

    const alert = procurementAlerts.find((a) => a.id === alertId);
    if (!alert) return { success: false, error: 'Procurement alert not found.' };

    const now = new Date().toISOString();
    let poId = alert.purchaseOrderId;

    // If marking ORDERED and PO details provided, create purchase order record
    if (newStatus === 'ORDERED' && poDetails) {
      poId = poDetails.poNumber || `PO-${Date.now().toString().slice(-4)}`;
      const targetItem = items.find((i) => i.itemCode === alert.itemCode);
      const unitCost = targetItem?.unitCost || 10;
      const totalCost = alert.suggestedOrderQuantity * unitCost;

      const newPO: PurchaseOrder = {
        id: poId,
        poNumber: poId,
        alertId: alert.id,
        itemCode: alert.itemCode,
        itemName: alert.itemName,
        quantity: alert.suggestedOrderQuantity,
        unitCost,
        totalCost,
        items: [
          {
            itemId: targetItem?.id || alert.itemId,
            itemCode: alert.itemCode,
            itemName: alert.itemName,
            orderedQuantity: alert.suggestedOrderQuantity,
            unitCost,
            totalCost,
            unitOfMeasurement: targetItem?.unitOfMeasurement || 'Units',
          },
        ],
        supplier: {
          name: poDetails.supplier || 'Standard Supplier',
          contact: 'procurement@internal.vendor',
        },
        orderDate: now,
        expectedDeliveryDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        expectedDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        status: 'ORDERED',
        orderedBy: currentUser.name,
      };

      setPurchaseOrders((prev) => [newPO, ...prev]);
    }

    setProcurementAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: newStatus,
              purchaseOrderId: poId,
              supplier: poDetails?.supplier || a.supplier,
              orderDate: newStatus === 'ORDERED' ? now : a.orderDate,
              receivedDate: newStatus === 'RECEIVED' || newStatus === 'CLOSED' ? now : a.receivedDate,
              notes: notes || a.notes,
            }
          : a
      )
    );

    addNotification(
      'Procurement Status Updated',
      `Alert ${alertId} (${alert.itemCode}) marked as ${newStatus} by ${currentUser.name}`,
      'INFO',
      'INVENTORY_ADMIN',
      undefined,
      'PROCUREMENT',
      alertId
    );

    logAudit(
      'PROCUREMENT_STATUS_CHANGED',
      'PROCUREMENT',
      alertId,
      `Status changed from ${alert.status} to ${newStatus} by ${currentUser.name}`,
      alert.status,
      newStatus
    );

    return { success: true };
  };

  const updateProcurementAlertStatus = (
    alertId: string,
    newStatus: ProcurementStatus
  ): { success: boolean; error?: string } => {
    return updateProcurementStatus(alertId, newStatus);
  };

  const createPurchaseOrder = (data: {
    supplier: { name: string; contact?: string } | string;
    items: { itemId: string; quantity: number }[];
    expectedDeliveryDate?: string;
    notes?: string;
  }): { success: boolean; error?: string; poNumber?: string } => {
    if (currentUser.role !== 'PURCHASING' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Only Purchasing Team or Admins can create Purchase Orders.' };
    }

    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'At least one item must be added to the purchase order.' };
    }

    const supplierObj =
      !data.supplier
        ? { name: 'Apex Industrial Supplies', contact: 'orders@industrial.internal' }
        : typeof data.supplier === 'string'
        ? { name: data.supplier, contact: 'orders@industrial.internal' }
        : data.supplier;

    const supplierNameStr = supplierObj?.name || 'Apex Industrial Supplies';

    if (!supplierNameStr || supplierNameStr.trim().length === 0) {
      return { success: false, error: 'Supplier name is required.' };
    }

    const nextSeq = purchaseOrders.length + 1;
    const poNumber = `PO-2026-${String(nextSeq).padStart(3, '0')}`;
    const now = new Date().toISOString();

    let totalCost = 0;
    const poLineItems = data.items.map((line) => {
      const it = items.find((i) => i.id === line.itemId || i.itemCode === line.itemId);
      const uCost = it?.unitCost || 10;
      const lineTotal = uCost * line.quantity;
      totalCost += lineTotal;
      return {
        itemId: it?.id || line.itemId,
        itemCode: it?.itemCode || 'AUX-000',
        itemName: it?.itemName || 'Auxiliary Item',
        orderedQuantity: line.quantity,
        unitCost: uCost,
        totalCost: lineTotal,
        unitOfMeasurement: it?.unitOfMeasurement || 'Pieces',
      };
    });

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplier: supplierObj,
      items: poLineItems,
      orderDate: now,
      expectedDeliveryDate:
        data.expectedDeliveryDate || new Date(Date.now() + 5 * 86400000).toISOString(),
      status: 'SUBMITTED',
      totalCost,
      orderedBy: currentUser.name,
      notes: data.notes,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);

    addNotification(
      'New Purchase Order Created',
      `Purchase order ${poNumber} generated for ${supplierNameStr} (${poLineItems.length} items, $${totalCost.toFixed(2)}).`,
      'INFO',
      'INVENTORY_ADMIN',
      undefined,
      'PROCUREMENT',
      poNumber
    );

    logAudit(
      'PO_CREATED',
      'PROCUREMENT',
      poNumber,
      `Created PO for ${supplierNameStr} with ${poLineItems.length} item(s) totaling $${totalCost.toFixed(2)}`
    );

    return { success: true, poNumber };
  };

  const receivePurchaseOrder = (poId: string): { success: boolean; error?: string } => {
    const po = purchaseOrders.find((p) => p.id === poId || p.poNumber === poId);
    if (!po) return { success: false, error: 'Purchase order not found.' };

    if (po.status === 'RECEIVED') {
      return { success: false, error: 'This purchase order has already been received.' };
    }

    const now = new Date().toISOString();
    const updatedItems = [...items];
    const newTxns: InventoryTransaction[] = [];
    const updatedAlerts = [...procurementAlerts];

    po.items.forEach((line) => {
      const itemIndex = updatedItems.findIndex(
        (i) => i.id === line.itemId || i.itemCode === line.itemCode
      );
      if (itemIndex >= 0) {
        const targetItem = updatedItems[itemIndex];
        const prevStock = targetItem.currentStock;
        const newStock = prevStock + line.orderedQuantity;

        updatedItems[itemIndex] = {
          ...targetItem,
          currentStock: newStock,
          lastUpdated: now,
        };

        const txnId = `TXN-${String(transactions.length + newTxns.length + 1).padStart(4, '0')}`;
        newTxns.push({
          id: txnId,
          itemCode: targetItem.itemCode,
          itemName: targetItem.itemName,
          transactionType: 'STOCK_IN',
          quantity: line.orderedQuantity,
          quantityChange: line.orderedQuantity,
          previousStock: prevStock,
          newStock,
          referenceId: po.poNumber,
          performedBy: currentUser?.name || 'System Admin',
          performedByName: currentUser?.name || 'System Admin',
          performedByRole: currentUser?.role || 'ADMIN',
          dateTime: now,
          timestamp: now,
          remarks: `Receipt against ${po.poNumber} from ${
            po.supplier
              ? typeof po.supplier === 'object'
                ? po.supplier.name || 'Supplier'
                : po.supplier
              : 'Supplier'
          }`,
          notes: `Receipt against ${po.poNumber} from ${
            po.supplier
              ? typeof po.supplier === 'object'
                ? po.supplier.name || 'Supplier'
                : po.supplier
              : 'Supplier'
          }`,
          supplier: po.supplier
            ? typeof po.supplier === 'object'
              ? po.supplier.name || 'Supplier'
              : po.supplier
            : 'Supplier',
        });

        // Close open procurement alerts if stock restored above reorder level
        const alertIndex = updatedAlerts.findIndex(
          (a) => a.itemCode === targetItem.itemCode && a.status !== 'CLOSED'
        );
        if (alertIndex >= 0 && newStock > targetItem.reorderLevel) {
          updatedAlerts[alertIndex] = {
            ...updatedAlerts[alertIndex],
            status: 'CLOSED',
            currentStock: newStock,
            receivedDate: now,
            purchaseOrderId: po.poNumber,
            notes: `Replenishment received via ${po.poNumber}. Stock restored to ${newStock}.`,
          };
        }
      }
    });

    // Update PO status
    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === po.id
          ? {
              ...p,
              status: 'RECEIVED',
              receivedDate: now,
              receivedBy: currentUser.name,
            }
          : p
      )
    );

    setItems(updatedItems);
    setTransactions((prev) => [...newTxns, ...prev]);
    setProcurementAlerts(updatedAlerts);

    addNotification(
      'Purchase Order Received & Stock Added',
      `PO ${po.poNumber} marked as received. Stock balances for ${po.items.length} item(s) incremented.`,
      'SUCCESS',
      'INVENTORY_ADMIN',
      undefined,
      'PROCUREMENT',
      po.poNumber
    );

    logAudit(
      'PO_RECEIVED',
      'PROCUREMENT',
      po.poNumber,
      `Shipment intake confirmed by ${currentUser.name}. Recorded ${newTxns.length} stock-in ledger entries.`
    );

    return { success: true };
  };

  // 9. Notification Actions
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationCount = notifications.filter(
    (n) => !n.read && (!n.recipientRole || n.recipientRole === currentUser.role || n.recipientRole === 'ALL')
  ).length;

  // 10. Admin User Management
  const createUser = (userData: Omit<User, 'id'>): { success: boolean; error?: string } => {
    if (currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Only administrators can create user accounts.' };
    }

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };

    setUsers((prev) => [...prev, newUser]);
    logAudit('USER_CREATED', 'USER', newUser.id, `Created account for ${newUser.name} with role ${newUser.role}`);
    return { success: true };
  };

  const updateUser = (userId: string, updates: Partial<User>): { success: boolean; error?: string } => {
    if (currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Only administrators can modify user accounts.' };
    }

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }

    logAudit('USER_UPDATED', 'USER', userId, `User ${userId} modified by ${currentUser.name}`);
    return { success: true };
  };

  // 11. Reset to initial demo data
  const resetToDemoData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setItems(INITIAL_ITEMS);
    setRequests(INITIAL_REQUESTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setProcurementAlerts(INITIAL_ALERTS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setEmails(INITIAL_EMAILS);
    setAuditLogs(INITIAL_AUDIT_LOGS);

    Object.keys(localStorage).forEach((key) => {
      if (key && typeof key === 'string' && key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });

    logAudit('DATABASE_RESET', 'SYSTEM', 'SYS-RESET', 'Reset application state to baseline demo dataset');
  };

  return (
    <InventoryContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        items,
        requests,
        transactions,
        procurementAlerts,
        purchaseOrders,
        notifications,
        emails,
        auditLogs,
        unreadNotificationCount,
        getStockStatus,
        submitRequest,
        cancelRequest,
        approveRequest,
        rejectRequest,
        addStock,
        adjustStock,
        createItem,
        updateItem,
        toggleItemActive,
        updateProcurementStatus,
        updateProcurementAlertStatus,
        createPurchaseOrder,
        receivePurchaseOrder,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        createUser,
        updateUser,
        resetToDemoData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
