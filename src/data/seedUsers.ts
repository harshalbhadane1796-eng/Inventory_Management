import { User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-req-1',
    name: 'John Davis',
    email: 'j.davis@company.internal',
    role: 'REQUESTOR',
    department: 'Maintenance',
    title: 'Senior Maintenance Technician',
    active: true,
  },
  {
    id: 'usr-req-2',
    name: 'Sarah Jenkins',
    email: 's.jenkins@company.internal',
    role: 'REQUESTOR',
    department: 'Operations & Production',
    title: 'Line Lead Specialist',
    active: true,
  },
  {
    id: 'usr-app-1',
    name: 'Michael Chang',
    email: 'm.chang@company.internal',
    role: 'APPROVER',
    department: 'Maintenance & Engineering',
    title: 'Operations Manager & Approver',
    active: true,
  },
  {
    id: 'usr-app-2',
    name: 'Elena Vance',
    email: 'e.vance@company.internal',
    role: 'APPROVER',
    department: 'Facilities & Safety',
    title: 'Facility Director & Approver',
    active: true,
  },
  {
    id: 'usr-inv-1',
    name: 'Marcus Brody',
    email: 'm.brody@company.internal',
    role: 'INVENTORY_ADMIN',
    department: 'Logistics & Warehouse',
    title: 'Inventory & Materials Lead',
    active: true,
  },
  {
    id: 'usr-pur-1',
    name: 'Rachel Adams',
    email: 'r.adams@company.internal',
    role: 'PURCHASING',
    department: 'Administration & Procurement',
    title: 'Procurement Specialist',
    active: true,
  },
  {
    id: 'usr-adm-1',
    name: 'David Sterling',
    email: 'd.sterling@company.internal',
    role: 'ADMIN',
    department: 'Executive IT & Ops',
    title: 'System Administrator',
    active: true,
  },
];

export const DEPARTMENTS = [
  'Maintenance',
  'Operations & Production',
  'Facilities & Safety',
  'Engineering & Quality Control',
  'Logistics & Warehouse',
  'Administration & Procurement',
  'Research & Lab',
];

export const CATEGORIES = [
  'Safety & PPE',
  'Janitorial & Maintenance',
  'Electrical & Instrumentation',
  'Mechanical & Hardware',
  'Lubricants & Chemicals',
  'Packaging & Shipping',
  'Tools & Accessories',
];
