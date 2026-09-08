import { User, InventoryItem, ProcurementAlert, PurchaseOrder } from './types';
import { INITIAL_USERS } from './data/seedUsers';

/**
 * Safely extracts supplier name from any item, alert, purchase order, or supplier object/string
 */
export function getSupplierName(
  target?:
    | InventoryItem
    | ProcurementAlert
    | PurchaseOrder
    | { supplier?: any; name?: string }
    | string
    | null
): string {
  if (!target) return 'Apex Industrial Supplies';

  if (typeof target === 'string') return target;

  // If target has a direct 'supplier' property
  if ('supplier' in target && target.supplier) {
    if (typeof target.supplier === 'string') {
      return target.supplier;
    }
    if (typeof target.supplier === 'object' && target.supplier !== null && target.supplier.name) {
      return target.supplier.name;
    }
  }

  // If target is directly a supplier object { name: string }
  if (typeof target === 'object' && target !== null && 'name' in target && typeof target.name === 'string') {
    return target.name;
  }

  return 'Apex Industrial Supplies';
}

/**
 * Safely extracts supplier contact email/phone
 */
export function getSupplierContact(
  target?:
    | InventoryItem
    | ProcurementAlert
    | PurchaseOrder
    | { supplier?: any; contact?: string }
    | string
    | null
): string {
  if (!target) return 'orders@apexindustrial.com';

  if (typeof target === 'object' && target !== null) {
    if ('supplier' in target && target.supplier && typeof target.supplier === 'object') {
      return target.supplier.contact || 'orders@apexindustrial.com';
    }
    if ('contact' in target && typeof target.contact === 'string') {
      return target.contact;
    }
  }

  return 'orders@apexindustrial.com';
}

/**
 * Ensures currentUser always has a valid User object with non-null name, role, etc.
 */
export function ensureValidUser(user?: any): User {
  if (user && typeof user === 'object' && user.name && user.role) {
    return user as User;
  }
  return INITIAL_USERS[0];
}
