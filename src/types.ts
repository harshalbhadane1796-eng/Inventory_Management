export type UserRole = 
  | 'REQUESTOR' 
  | 'APPROVER' 
  | 'INVENTORY_ADMIN' 
  | 'PURCHASING' 
  | 'ADMIN';

export type StockStatus = 'NORMAL' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'ISSUED' | 'REJECTED' | 'CANCELLED';

export type TransactionType = 'STOCK_IN' | 'ISSUE' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER';

export type ProcurementStatus = 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'ORDERED' | 'RECEIVED' | 'CLOSED';

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type ItemCategory =
  | 'Safety & PPE'
  | 'Tools & Hardware'
  | 'Cleaning & Janitorial'
  | 'Packaging & Shipping'
  | 'Office & Stationery'
  | 'Electrical & Maintenance';

export type POStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  active: boolean;
  avatarUrl?: string;
  title: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string; // e.g. AUX-001
  itemName: string;
  category: string;
  description: string;
  unitOfMeasurement: string; // e.g. Pieces, Pairs, Rolls, Boxes, Liters
  currentStock: number;
  minimumStockLevel: number; // Critical threshold
  reorderLevel: number; // Low stock threshold
  maximumStockLevel: number; // Target ceiling
  storageLocation: string; // e.g. Aisle 3, Bin 12
  unitCost: number; // In USD
  supplier?: { name: string; contact?: string } | string;
  active: boolean;
  createdDate: string;
  lastUpdated: string;
}

export interface RequestItemEntry {
  itemId: string;
  itemCode: string;
  itemName: string;
  requestedQuantity: number;
  unitOfMeasurement: string;
  currentStockAtRequest?: number;
  currentStockAtApproval?: number;
}

export interface InventoryRequest {
  id: string; // REQ-0001
  requestDate: string;
  requestorId: string;
  requestorName: string;
  requestorEmail: string;
  department: string;
  priority: Priority;
  purpose: string;
  remarks?: string;
  items: RequestItemEntry[];
  status: RequestStatus;
  approverId?: string;
  approverName?: string;
  approvalDate?: string;
  rejectionReason?: string;
  issuedDate?: string;
}

export interface InventoryTransaction {
  id: string; // TXN-0001
  itemCode: string;
  itemName: string;
  transactionType: TransactionType;
  quantity: number; // Positive for Stock In, Negative for Issue
  quantityChange?: number;
  previousStock: number;
  newStock: number;
  referenceId: string; // e.g. REQ-0001, PO-1049, ADJ-02
  performedBy: string; // User name
  performedByName?: string;
  performedByRole?: UserRole;
  dateTime: string;
  timestamp?: string;
  remarks: string;
  notes?: string;
  department?: string;
  supplier?: string;
}

export interface ProcurementAlert {
  id: string; // PA-001
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  currentStock: number;
  minimumLevel: number;
  reorderLevel: number;
  maximumLevel: number;
  suggestedOrderQuantity: number; // maximumLevel - currentStock
  alertDate: string;
  status: ProcurementStatus;
  purchaseOrderId?: string;
  supplier?: string;
  orderDate?: string;
  receivedDate?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  orderedQuantity: number;
  unitCost: number;
  totalCost: number;
  unitOfMeasurement?: string;
}

export interface PurchaseOrder {
  id: string; // e.g. po-1
  poNumber: string; // e.g. PO-2026-001
  alertId?: string;
  itemCode?: string;
  itemName?: string;
  quantity?: number;
  unitCost?: number;
  items: PurchaseOrderItem[];
  supplier: { name: string; contact?: string } | string;
  orderDate: string;
  expectedDeliveryDate?: string;
  expectedDate?: string;
  status: POStatus;
  totalCost: number;
  orderedBy: string;
  receivedDate?: string;
  receivedBy?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  recipientRole?: UserRole | 'ALL';
  recipientUserId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  entityType?: 'REQUEST' | 'ITEM' | 'PROCUREMENT' | 'STOCK';
  entityId?: string;
  timestamp: string;
  read: boolean;
}

export interface EmailMessage {
  id: string;
  to: string;
  subject: string;
  itemCode: string;
  itemName: string;
  currentStock: number;
  minimumStockLevel: number;
  reorderLevel: number;
  maximumStockLevel: number;
  suggestedOrderQuantity: number;
  timestamp: string;
  body: string;
  status: 'SENT' | 'QUEUED';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  entity: 'REQUEST' | 'INVENTORY' | 'ITEM_MASTER' | 'PROCUREMENT' | 'USER' | 'SYSTEM';
  entityId: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  details?: string;
}
