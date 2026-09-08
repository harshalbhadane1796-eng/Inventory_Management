import React from 'react';
import { User, ShieldCheck, Mail, Building, Key, Check } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const UserProfilePage: React.FC = () => {
  const { currentUser, users, setCurrentUser } = useInventory();

  const getRoleCapabilities = (role: string) => {
    switch (role) {
      case 'REQUESTOR':
        return [
          'Submit multi-item auxiliary supply requisitions',
          'Track personal request lifecycle & status updates',
          'Cancel requests while in PENDING status',
          'View real-time item availability indicators',
        ];
      case 'APPROVER':
        return [
          'Review pending department requisitions with atomic stock checks',
          'Authorize / Approve requests and deduct inventory automatically',
          'Reject requests with mandatory documented justification',
          'Review complete departmental approval audit logs',
        ];
      case 'INVENTORY_ADMIN':
        return [
          'Full CRUD management of 70 predefined item catalog',
          'Perform Stock In shipments with PO/supplier references',
          'Execute manual inventory count balance adjustments',
          'Access system-wide transaction ledger & replenishment thresholds',
          'Export audit trail logs and analytical reporting data',
        ];
      case 'PURCHASING':
        return [
          'Monitor automated low-stock and safety threshold alerts',
          'Acknowledge and convert shortfall alerts into Purchase Orders',
          'Generate multi-line supplier POs with automated cost computation',
          'Receive supplier deliveries to automatically increment warehouse stock',
          'Inspect outbound SMTP procurement notification dispatches',
        ];
      default:
        return ['Full administrative oversight and governance'];
    }
  };

  return (
    <div id="user-profile-page" className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">User Profile & Permissions</h2>
        <p className="text-xs text-slate-500">
          Current authenticated role credentials and role-based access entitlements.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {currentUser?.name?.[0] || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{currentUser?.name || 'User'}</h3>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {currentUser?.email || ''}
            </div>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              Role: {(currentUser?.role || 'REQUESTOR').replace('_', ' ')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Assigned Department</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {currentUser.department}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">User ID</span>
            <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
              {currentUser.id}
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Active Role Entitlements & Permissions
          </h4>
          <div className="space-y-2">
            {getRoleCapabilities(currentUser.role).map((cap, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Quick Switch Active Role Account:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => setCurrentUser(u)}
                className={`p-2.5 rounded-lg text-left text-xs border transition-colors ${
                  u.id === currentUser.id
                    ? 'border-slate-900 bg-slate-900 text-white font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold">{u.name}</div>
                <div className={`text-[10px] ${u.id === currentUser.id ? 'text-slate-300' : 'text-slate-400'}`}>
                  {u.role.replace('_', ' ')} · {u.department}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
