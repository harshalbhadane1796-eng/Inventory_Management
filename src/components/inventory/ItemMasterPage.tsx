import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Database,
  Building,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  PackageCheck,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { InventoryItem, ItemCategory } from '../../types';
import { getSupplierName, getSupplierContact } from '../../utils';

interface ItemMasterPageProps {
  onNavigate: (tabId: string) => void;
}

export const ItemMasterPage: React.FC<ItemMasterPageProps> = ({ onNavigate }) => {
  const { items, categories, createItem, updateItem } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form inputs state
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<ItemCategory>('Safety & PPE');
  const [formUnit, setFormUnit] = useState('pieces');
  const [formStock, setFormStock] = useState(50);
  const [formMin, setFormMin] = useState(10);
  const [formReorder, setFormReorder] = useState(20);
  const [formMax, setFormMax] = useState(100);
  const [formCost, setFormCost] = useState(12.5);
  const [formLocation, setFormLocation] = useState('Aisle A - Bin 01');
  const [formSupplierName, setFormSupplierName] = useState('Industrial Supply Corp');
  const [formSupplierContact, setFormSupplierContact] = useState('orders@industrialsupply.com');
  const [formActive, setFormActive] = useState(true);

  const filteredItems = items.filter((item) => {
    const sName = getSupplierName(item);
    const matchesSearch =
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storageLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenCreate = () => {
    setFormCode(`AUX-${String(items.length + 1).padStart(3, '0')}`);
    setFormName('');
    setFormDesc('');
    setFormCategory('Safety & PPE');
    setFormUnit('pieces');
    setFormStock(25);
    setFormMin(10);
    setFormReorder(20);
    setFormMax(100);
    setFormCost(15.0);
    setFormLocation('Warehouse Shelf 01');
    setFormSupplierName('Apex Industrial Supplies');
    setFormSupplierContact('sales@apexindustrial.com');
    setFormActive(true);
    setFormFeedback(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormCode(item.itemCode);
    setFormName(item.itemName);
    setFormDesc(item.description);
    setFormCategory(item.category as ItemCategory);
    setFormUnit(item.unitOfMeasurement);
    setFormStock(item.currentStock);
    setFormMin(item.minimumStockLevel);
    setFormReorder(item.reorderLevel);
    setFormMax(item.maximumStockLevel);
    setFormCost(item.unitCost);
    setFormLocation(item.storageLocation);
    setFormSupplierName(getSupplierName(item));
    setFormSupplierContact(getSupplierContact(item));
    setFormActive(item.active);
    setFormFeedback(null);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const res = createItem({
      itemCode: formCode.trim().toUpperCase(),
      itemName: formName.trim(),
      description: formDesc.trim(),
      category: formCategory,
      unitOfMeasurement: formUnit.trim(),
      currentStock: formStock,
      minimumStockLevel: formMin,
      reorderLevel: formReorder,
      maximumStockLevel: formMax,
      unitCost: formCost,
      storageLocation: formLocation.trim(),
      supplier: {
        name: formSupplierName.trim(),
        contact: formSupplierContact.trim(),
      },
      active: formActive,
    });

    if (res.success) {
      setFormFeedback({ type: 'success', message: 'Item created in catalog successfully!' });
      setTimeout(() => {
        setIsCreateModalOpen(false);
      }, 1000);
    } else {
      setFormFeedback({ type: 'error', message: res.error || 'Failed to create item.' });
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setFormFeedback(null);

    const res = updateItem(editingItem.id, {
      itemName: formName.trim(),
      description: formDesc.trim(),
      category: formCategory,
      unitOfMeasurement: formUnit.trim(),
      minimumStockLevel: formMin,
      reorderLevel: formReorder,
      maximumStockLevel: formMax,
      unitCost: formCost,
      storageLocation: formLocation.trim(),
      supplier: {
        name: formSupplierName.trim(),
        contact: formSupplierContact.trim(),
      },
      active: formActive,
    });

    if (res.success) {
      setFormFeedback({ type: 'success', message: 'Item updated successfully!' });
      setTimeout(() => {
        setEditingItem(null);
      }, 1000);
    } else {
      setFormFeedback({ type: 'error', message: res.error || 'Failed to update item.' });
    }
  };

  return (
    <div id="item-master-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Item Master Data Registry</h2>
          <p className="text-xs text-slate-500">
            Define auxiliary inventory SKUs, reorder thresholds, supplier associations, and active states.
          </p>
        </div>
        <button
          id="create-new-item-btn"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          Create New Item
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Item Code, Name, Location, Supplier..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="ALL">All Categories ({items.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Item Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Item Code</th>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-right">Thresholds (Min/Reorder/Max)</th>
                <th className="px-4 py-3 text-right">Unit Cost</th>
                <th className="px-4 py-3">Storage Location</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {item.itemCode}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">
                    {item.itemName}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    {item.category}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.unitOfMeasurement}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[11px]">
                    <span className="text-rose-600">{item.minimumStockLevel}</span> /{' '}
                    <span className="text-amber-600 font-bold">{item.reorderLevel}</span> /{' '}
                    <span className="text-slate-400">{item.maximumStockLevel}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">
                    ${item.unitCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">
                    {item.storageLocation}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-600 max-w-xs truncate">
                    {getSupplierName(item)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                        INACTIVE
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      id={`edit-item-${item.id}`}
                      onClick={() => handleOpenEdit(item)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(isCreateModalOpen || editingItem) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {isCreateModalOpen ? 'Create New Master Catalog Item' : `Edit Item: ${editingItem?.itemCode}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {formFeedback && (
              <div
                className={`p-3 text-xs font-semibold flex items-center gap-2 ${
                  formFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-800'
                }`}
              >
                {formFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                {formFeedback.message}
              </div>
            )}

            <form
              onSubmit={isCreateModalOpen ? handleSaveCreate : handleSaveEdit}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Item Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isCreateModalOpen}
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full font-mono font-bold p-2 rounded-lg border border-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed uppercase"
                  />
                  <span className="text-[10px] text-slate-400">Must be unique across catalog</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Heavy-Duty Nitrile Work Gloves (XL)"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detailed specifications, dimensions, material composition..."
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ItemCategory)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="pieces, rolls, boxes, liters"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 uppercase text-[11px] mb-2">
                  Inventory Thresholds
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {isCreateModalOpen && (
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium block mb-1">
                        Initial Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formStock}
                        onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                        className="w-full font-mono font-bold p-2 rounded border border-slate-300"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">
                      Min Stock (Critical)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formMin}
                      onChange={(e) => setFormMin(parseInt(e.target.value) || 0)}
                      className="w-full font-mono font-bold p-2 rounded border border-slate-300 text-rose-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formReorder}
                      onChange={(e) => setFormReorder(parseInt(e.target.value) || 0)}
                      className="w-full font-mono font-bold p-2 rounded border border-slate-300 text-amber-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">
                      Max Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formMax}
                      onChange={(e) => setFormMax(parseInt(e.target.value) || 0)}
                      className="w-full font-mono font-bold p-2 rounded border border-slate-300 text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Storage Location</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Shelf 04 - Bin B"
                    className="w-full font-mono p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={formSupplierName}
                    onChange={(e) => setFormSupplierName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Supplier Contact</label>
                  <input
                    type="text"
                    value={formSupplierContact}
                    onChange={(e) => setFormSupplierContact(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-slate-400"
                  />
                  <span className="font-semibold text-slate-700">Item is Active & Requestable</span>
                </label>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-sm"
                  >
                    {isCreateModalOpen ? 'Create SKU' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
