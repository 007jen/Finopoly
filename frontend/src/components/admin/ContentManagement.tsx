import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Save, X, FileText, Scale, Calculator } from 'lucide-react';
import { db } from '../../lib/database';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

type ContentType = 'caselaw' | 'audit' | 'tax';

const ContentManagement: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [contentType, setContentType] = useState<ContentType>('caselaw');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadContent();
  }, [contentType]);

  const loadContent = async () => {
    setLoading(true);
    try {
      let data = [];
      if (contentType === 'caselaw') {
        data = await db.getCaseLaws();
      } else if (contentType === 'audit') {
        // fetch from new API
        const token = await getToken();
        const res = await fetch('/api/audit/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const rawData = await res.json();
          // Map backend camelCase to frontend snake_case
          data = rawData.map((item: any) => ({
            ...item,
            xp_reward: item.xpReward,
            time_limit: item.timeLimit,
            is_active: item.isActive,
            company: item.companyName
          }));
        } else {
          console.error("Failed to load audit cases");
        }
      } else {
        data = await db.getTaxSimulations();
      }
      setItems(data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (contentType === 'caselaw') {
        await db.deleteCaseLaw(id);
      } else if (contentType === 'audit') {
        const token = await getToken();
        const res = await fetch(`/api/audit/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to delete audit case");
      } else {
        // Tax deletion not dynamically implemented yet, likely mock
        alert("Tax simulation deletion not supported yet.");
        return;
      }
      loadContent();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting item');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleSave = async (formData: any) => {
    // if (!user) return; // Removed usage of user object, using token instead
    try {
      if (contentType === 'caselaw') {
        if (editingItem) {
          await db.updateCaseLaw(editingItem.id, formData);
        } else {
          // Legacy creation requires user.id, but since we switched to Clerk auth here, 
          // we might need to adjust, but let's focus on Audit for now.
          await db.createCaseLaw(formData, 'legacy-user-id');
        }
      } else if (contentType === 'audit') {
        const token = await getToken();

        // Map frontend snake_case to backend camelCase
        // Strictly construct payload to avoid sending unknown fields (snake_case) to Prisma
        const payload = {
          title: formData.title,
          companyName: formData.company,
          difficulty: formData.difficulty,
          description: formData.description,
          xpReward: formData.xp_reward,
          timeLimit: formData.time_limit,
          isActive: formData.is_active,

          // Dynamic Data
          invoiceDetails: formData.invoiceDetails,
          ledgerDetails: formData.ledgerDetails,
          expectedAction: formData.expectedAction,
          violationReason: formData.violationReason,
          tags: formData.tags || []
        };

        if (editingItem && editingItem.id) {
          // UPDATE
          const res = await fetch(`/api/audit/${editingItem.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error("Failed to update audit case");
        } else {
          // CREATE
          const res = await fetch('/api/audit/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error("Failed to create audit case");
        }
      } else {
        await db.createTaxSimulation(formData, 'legacy-user-id');
      }
      setShowForm(false);
      setEditingItem(null);
      loadContent();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving item');
    }
  };



  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <button
          onClick={handleNew}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setContentType('caselaw')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${contentType === 'caselaw'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
        >
          <Scale className="w-5 h-5" />
          Case Laws
        </button>
        <button
          onClick={() => setContentType('audit')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${contentType === 'audit'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
        >
          <FileText className="w-5 h-5" />
          Audit Cases
        </button>
        <button
          onClick={() => setContentType('tax')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${contentType === 'tax'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
        >
          <Calculator className="w-5 h-5" />
          Tax Simulations
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Title</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Difficulty</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">XP Reward</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{item.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                      item.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {item.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-semibold">{item.xp_reward} XP</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ContentForm
          contentType={contentType}
          item={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

interface ContentFormProps {
  contentType: ContentType;
  item: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ContentForm: React.FC<ContentFormProps> = ({ contentType, item, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    item || {
      title: '',
      difficulty: 'Beginner',
      xp_reward: 100,
      is_active: true,
      facts: '',
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      category: '',
      description: '',
      company: '',
      time_limit: 60,
      scenario: '',
      client_data: {},
      questions: [],
      // Audit Defaults
      expectedAction: 'ACCEPT',
      violationReason: '',
      invoiceDetails: { vendor: "Vendor Name", amount: 1000 },
      ledgerDetails: { particulars: "Expense", debit: 1000 }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {item ? 'Edit' : 'Create New'} {contentType === 'caselaw' ? 'Case Law' : contentType === 'audit' ? 'Audit Case' : 'Tax Simulation'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Pro">Pro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">XP Reward</label>
              <input
                type="number"
                value={formData.xp_reward}
                onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {contentType === 'caselaw' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Facts</label>
                <textarea
                  value={formData.facts}
                  onChange={(e) => setFormData({ ...formData, facts: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Question</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Options</label>
                {formData.options.map((option: string, index: number) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-2"
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Answer</label>
                <input
                  type="text"
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Explanation</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {contentType === 'audit' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Limit (minutes)</label>
                <input
                  type="number"
                  value={formData.time_limit}
                  onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Action</label>
                  <select
                    value={formData.expectedAction || 'ACCEPT'}
                    onChange={(e) => setFormData({ ...formData, expectedAction: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="ACCEPT">ACCEPT</option>
                    <option value="REJECT">REJECT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Violation Reason (if Reject)</label>
                  <input
                    type="text"
                    value={formData.violationReason || ''}
                    onChange={(e) => setFormData({ ...formData, violationReason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Simplified JSON Editors for Invoice/Ledger for MVP - Ideally these should be structured forms */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Invoice JSON</label>
                <textarea
                  value={JSON.stringify(formData.invoiceDetails || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      setFormData({ ...formData, invoiceDetails: JSON.parse(e.target.value) });
                    } catch (err) { /* ignore parse error while typing */ }
                  }}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                />
                <p className="text-xs text-gray-500">Enter valid JSON for invoice details</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Ledger JSON</label>
                <textarea
                  value={JSON.stringify(formData.ledgerDetails || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      setFormData({ ...formData, ledgerDetails: JSON.parse(e.target.value) });
                    } catch (err) { /* ignore parse error while typing */ }
                  }}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                />
              </div>
            </>
          )}

          {contentType === 'tax' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Scenario</label>
                <textarea
                  value={formData.scenario}
                  onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentManagement;
