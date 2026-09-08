import React from 'react';
import { Bell, Check, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

interface NotificationsPageProps {
  onNavigate: (tabId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currentUser,
  } = useInventory();

  return (
    <div id="notifications-page" className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Notifications</h2>
          <p className="text-xs text-slate-500">
            Real-time updates regarding requisition approvals, stock reorder alerts, and PO intake.
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllNotificationsAsRead}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications available.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.entityType === 'REQUEST') {
                  if (currentUser.role === 'APPROVER') onNavigate('pending_approvals');
                  else if (currentUser.role === 'REQUESTOR') onNavigate('my_requests');
                } else if (notif.entityType === 'PROCUREMENT_ALERT') {
                  onNavigate('procurement_alerts');
                }
              }}
              className={`p-4 transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                notif.read ? 'bg-white hover:bg-slate-50/70' : 'bg-blue-50/40 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                    notif.read ? 'bg-slate-300' : 'bg-blue-600'
                  }`}
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(notif.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationAsRead(notif.id);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
