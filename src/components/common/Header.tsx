import React, { useState } from 'react';
import {
  Boxes,
  Bell,
  Mail,
  RotateCcw,
  UserCheck,
  Search,
  Check,
  ChevronDown,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { EmailNotificationModal } from './EmailNotificationModal';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigate?: (tabId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onNavigate }) => {
  const {
    currentUser,
    users,
    setCurrentUser,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    emails,
    resetToDemoData,
  } = useInventory();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (onSearch) onSearch(q);
  };

  const roleColorMap: Record<string, string> = {
    REQUESTOR: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    APPROVER: 'bg-blue-100 text-blue-800 border-blue-300',
    INVENTORY_ADMIN: 'bg-amber-100 text-amber-800 border-amber-300',
    PURCHASING: 'bg-purple-100 text-purple-800 border-purple-300',
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <>
      <header
        id="main-header"
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & System Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Boxes className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Auxiliary Inventory Management System
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 rounded-full">
                  70 Predefined Items
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Role-Based Approval Engine & Automated Replenishment
              </p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search Item Code (e.g. AUX-001), Request ID, User..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center space-x-2.5">
            {/* Email Automation Logs Button */}
            <button
              id="header-email-logs-btn"
              onClick={() => setIsEmailModalOpen(true)}
              title="View Automated Purchasing Emails"
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="hidden xl:inline">Email Outbox</span>
              {emails.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  {emails.length}
                </span>
              )}
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                id="header-notif-btn"
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="In-App Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifDropdownOpen && (
                <div
                  id="notif-dropdown-menu"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="font-bold text-xs text-slate-900">
                      Notifications ({notifications.length})
                    </span>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] font-medium text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.entityType === 'REQUEST' && onNavigate) {
                              if (currentUser.role === 'APPROVER') onNavigate('pending_approvals');
                              else if (currentUser.role === 'REQUESTOR') onNavigate('my_requests');
                            }
                          }}
                          className={`p-3 text-xs cursor-pointer transition-colors ${
                            notif.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-800 truncate">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                              {new Date(notif.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role / User Switcher */}
            <div className="relative">
              <button
                id="role-switcher-dropdown-btn"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-xs text-left"
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser?.name?.[0] || 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="font-semibold text-slate-900 leading-tight">
                    {currentUser?.name || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span
                      className={`inline-block px-1 py-0.2 rounded border font-semibold text-[9px] ${
                        roleColorMap[currentUser?.role || 'REQUESTOR']
                      }`}
                    >
                      {(currentUser?.role || 'REQUESTOR').replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* User Switcher Dropdown */}
              {isUserDropdownOpen && (
                <div
                  id="user-switcher-menu"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Role & User
                  </div>
                  <div className="space-y-1">
                    {users.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          id={`switch-user-${u.id}`}
                          onClick={() => {
                            setCurrentUser(u);
                            setIsUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-slate-100 font-semibold text-slate-900'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-slate-900">{u.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {u.department} ·{' '}
                              <span className="font-semibold text-slate-700">
                                {u.role.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Database Button */}
            <button
              id="reset-demo-data-btn"
              onClick={() => setShowResetConfirm(true)}
              title="Reset Demo Data"
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Reset Demo System State?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              This will reload the 70 predefined items, reset sample requests (including REQ-0001 pending), and restore baseline transactions.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                id="confirm-reset-btn"
                onClick={() => {
                  resetToDemoData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Outbox Modal */}
      <EmailNotificationModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </>
  );
};
