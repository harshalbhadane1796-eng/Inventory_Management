import React, { useState } from 'react';
import { Mail, X, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

interface EmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { emails } = useInventory();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(
    emails[0]?.id || null
  );

  if (!isOpen) return null;

  const activeEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  return (
    <div
      id="email-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="email-modal-container"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Automated Purchasing Email Center
              </h2>
              <p className="text-xs text-slate-500">
                Section 17: Live dispatch logs of automated threshold alerts sent to Purchasing
              </p>
            </div>
          </div>
          <button
            id="close-email-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Email List Sidebar */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto bg-slate-50/50 p-3 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
              Automated Dispatches ({emails.length})
            </div>
            {emails.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No automated emails dispatched yet. Trigger an approval or adjust stock below reorder level to generate alerts.
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = email.id === activeEmail?.id;
                const isCritical = email.subject.includes('CRITICAL');
                return (
                  <button
                    key={email.id}
                    id={`email-item-${email.id}`}
                    onClick={() => setSelectedEmailId(email.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                        : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isCritical ? 'CRITICAL ALERT' : 'LOW STOCK'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(email.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="font-medium text-xs text-slate-900 truncate">
                      {email.itemCode}: {email.itemName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      Stock: {email.currentStock} | Reorder: {email.reorderLevel} | Order: +{email.suggestedOrderQuantity}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Email Preview Detail */}
          <div className="md:col-span-7 flex flex-col bg-white overflow-y-auto p-6">
            {activeEmail ? (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      DISPATCHED (SMTP Engine)
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(activeEmail.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {activeEmail.subject}
                  </h3>
                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-700">To: </span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                        {activeEmail.to}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">From: </span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                        system-alerts@company.internal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Structured Metrics Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">Current Stock</div>
                    <div className="text-base font-bold text-slate-900 font-mono">
                      {activeEmail.currentStock}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">Reorder Level</div>
                    <div className="text-base font-bold text-amber-700 font-mono">
                      {activeEmail.reorderLevel}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">Min Stock</div>
                    <div className="text-base font-bold text-rose-700 font-mono">
                      {activeEmail.minimumStockLevel}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">Suggested Order</div>
                    <div className="text-base font-bold text-blue-700 font-mono">
                      +{activeEmail.suggestedOrderQuantity}
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="mt-2">
                  <div className="text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Rendered Email Body
                  </div>
                  <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-lg whitespace-pre-wrap leading-relaxed shadow-inner">
                    {activeEmail.body}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Select an email alert from the left to inspect dispatch details.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Emails are triggered automatically whenever stock level crosses below reorder threshold.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-800 text-white font-medium hover:bg-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
