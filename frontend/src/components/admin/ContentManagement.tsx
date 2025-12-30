import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Save, X, FileText, Scale, Calculator, Zap, Eye } from 'lucide-react';
import { ContextPanel } from '../Challenges/ContextPanel';
import { db } from '../../lib/database';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { api } from '../../lib/api';

type ContentType = 'caselaw' | 'audit' | 'tax' | 'arcade';

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
        const token = await getToken();
        // Use api.get
        const rawData = await api.get<any[]>('/api/audit/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Map backend camelCase to frontend snake_case
        data = rawData.map((item: any) => ({
          ...item,
          xp_reward: item.xpReward,
          time_limit: item.timeLimit,
          is_active: item.isActive,
          company: item.companyName
        }));

      } else if (contentType === 'arcade') {
        const token = await getToken();
        const rawData = await api.get<any[]>('/api/admin/challenges', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        data = rawData.map((item: any) => ({
          ...item,
          xp_reward: item.xpReward,
          is_active: item.isActive,
          difficulty: item.difficulty.charAt(0) + item.difficulty.slice(1).toLowerCase() // Map JUNIOR -> Junior
        }));
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
        await api.delete(`/api/audit/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else if (contentType === 'arcade') {
        const token = await getToken();
        await api.delete(`/api/admin/challenges/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        alert("Tax simulation deletion not supported yet.");
        return;
      }
      loadContent();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting item');
    }
  };

  // ...

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (contentType === 'caselaw') {
        // ... existing logic
        if (editingItem) {
          await db.updateCaseLaw(editingItem.id, formData);
        } else {
          await db.createCaseLaw(formData, 'legacy-user-id');
        }
      } else if (contentType === 'audit') {
        const token = await getToken();

        // Construct payload...
        const payload = {
          title: formData.title,
          companyName: formData.company,
          difficulty: formData.difficulty,
          description: formData.description,
          xpReward: formData.xp_reward,
          timeLimit: formData.time_limit,
          isActive: formData.is_active,
          invoiceDetails: formData.invoiceDetails,
          ledgerDetails: formData.ledgerDetails,
          expectedAction: formData.faultyField ? 'REJECT' : 'ACCEPT',
          faultyField: formData.faultyField || null,
          violationReason: formData.violationReason,
          tags: formData.tags || []
        };

        if (editingItem && editingItem.id) {
          // UPDATE using api.put
          await api.put(`/api/audit/${editingItem.id}`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          // CREATE using api.post
          await api.post('/api/audit/create', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } else if (contentType === 'arcade') {
        const token = await getToken();

        // Map back to camelCase for backend
        const payload = {
          title: formData.title,
          slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          richTextContext: formData.richTextContext || null,
          isActive: formData.is_active,
          difficulty: formData.difficulty.toUpperCase(), // Map Junior -> JUNIOR
          xpReward: formData.xp_reward,
          chartUrl: formData.chartUrl || null,
          datasetUrl: formData.datasetUrl || null,
          videoUrl: formData.videoUrl,
          question: formData.question,
          instructions: formData.instructions,
          answerType: formData.answerType || 'NUMBER',
          correctVal: formData.correctVal,
          tolerance: formData.answerType === 'NUMBER' ? (formData.tolerance || 0) : null
        };

        if (editingItem && editingItem.id) {
          await api.put(`/api/admin/challenges/${editingItem.id}`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          await api.post('/api/admin/challenges', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } else {
        await db.createTaxSimulation(formData, 'legacy-user-id');
      }
      setShowForm(false);
      setEditingItem(null);
      loadContent();
    } catch (error: any) {
      console.error('Error saving:', error);
      // If our api utility worked, error.message will contain the stringified error object or the text.
      const errMsg = error.message || String(error);
      alert('Error saving failed:\n' + errMsg);
    }
  };



  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Content Management</h1>
        <button
          onClick={handleNew}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold shadow-md active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
        <button
          onClick={() => setContentType('caselaw')}
          className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${contentType === 'caselaw'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-100 shadow-sm'
            }`}
        >
          <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
          Case Laws
        </button>
        <button
          onClick={() => setContentType('audit')}
          className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${contentType === 'audit'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-100 shadow-sm'
            }`}
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          Audit Cases
        </button>
        <button
          onClick={() => setContentType('tax')}
          className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${contentType === 'tax'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-100 shadow-sm'
            }`}
        >
          <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
          Tax Simulations
        </button>
        <button
          onClick={() => setContentType('arcade')}
          className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${contentType === 'arcade'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-100 shadow-sm'
            }`}
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          Analyst Drills
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
          <table className="w-full min-w-[700px]">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${(item.difficulty === 'Beginner' || item.difficulty === 'Junior') ? 'bg-green-100 text-green-700' :
                      (item.difficulty === 'Intermediate' || item.difficulty === 'Senior') ? 'bg-yellow-100 text-yellow-700' :
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
      difficulty: contentType === 'arcade' ? 'Junior' : 'Beginner',
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
      faultyField: '',
      invoiceDetails: { vendor: "", amount: 0, tax: 0, total: 0, date: '', invoiceNo: '', description: '', paymentMode: 'BANK', gstin: '' },
      ledgerDetails: { particulars: "", debit: 0, date: '', vchType: 'Journal', vchNo: '' },
      // Arcade Defaults
      slug: '',
      richTextContext: '',
      chartUrl: '',
      datasetUrl: '',
      videoUrl: '',
      instructions: '',
      answerType: 'NUMBER',
      correctVal: '',
      tolerance: 0.5
    }
  );
  const [showPreview, setShowPreview] = useState(false);

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-2xl my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {item ? 'Edit' : 'Create New'} {contentType === 'caselaw' ? 'Case Law' : contentType === 'audit' ? 'Audit Case' : 'Tax Simulation'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
              <select
                value={formData.difficulty || 'Beginner'}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {contentType !== 'arcade' ? (
                  <>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Pro">Pro</option>
                  </>
                ) : (
                  <>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Partner">Partner</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">XP Reward</label>
              <input
                type="number"
                value={formData.xp_reward || 0}
                onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                Active / Published
              </label>
            </div>
          </div>

          {contentType === 'caselaw' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Facts</label>
                <textarea
                  value={formData.facts || ''}
                  onChange={(e) => setFormData({ ...formData, facts: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Question</label>
                <textarea
                  value={formData.question || ''}
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
                  value={formData.correct_answer || ''}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Explanation</label>
                <textarea
                  value={formData.explanation || ''}
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
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
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
                  value={formData.time_limit || 0}
                  onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 0 })}
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

              {/* GRANULAR AUDIT FIELDS */}
              <div className="space-y-4 border-t pt-4 mt-4 border-gray-200">
                <h3 className="font-bold text-gray-900">Audit Details</h3>

                {/* INVOICE SECTION */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Invoice Data</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Vendor Name" className="p-2 border rounded"
                      value={formData.invoiceDetails?.vendor || ''}
                      onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, vendor: e.target.value } })} />
                    <input placeholder="Invoice No" className="p-2 border rounded"
                      value={formData.invoiceDetails?.invoiceNo || ''}
                      onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, invoiceNo: e.target.value } })} />
                    <input type="number" placeholder="Amount" className="p-2 border rounded"
                      value={formData.invoiceDetails?.amount || 0}
                      onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, amount: Number(e.target.value) } })} />
                    <input type="date" className="p-2 border rounded"
                      value={formData.invoiceDetails?.date || ''}
                      onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, date: e.target.value } })} />

                    {/* NEW FIELDS */}
                    <input placeholder="GSTIN" className="p-2 border rounded"
                      value={formData.invoiceDetails?.gstin || ''}
                      onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, gstin: e.target.value } })} />
                    <input placeholder="Description (Service/Item)" className="p-2 border rounded"
                      value={formData.invoiceDetails?.description || ''}
                      onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, description: e.target.value } })} />
                    <select className="p-2 border rounded"
                      value={formData.invoiceDetails?.paymentMode || 'BANK'}
                      onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, paymentMode: e.target.value } })}
                    >
                      <option value="BANK">Bank</option>
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>

                {/* LEDGER SECTION */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Ledger Entry</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Particulars" className="p-2 border rounded"
                      value={formData.ledgerDetails?.particulars || ''}
                      onChange={e => setFormData({ ...formData, ledgerDetails: { ...formData.ledgerDetails, particulars: e.target.value } })} />
                    <input type="number" placeholder="Debit Amount" className="p-2 border rounded"
                      value={formData.ledgerDetails?.debit || 0}
                      onChange={e => setFormData({ ...formData, ledgerDetails: { ...formData.ledgerDetails, debit: Number(e.target.value) } })} />
                    <input type="date" className="p-2 border rounded"
                      value={formData.ledgerDetails?.date || ''}
                      onChange={e => setFormData({ ...formData, ledgerDetails: { ...formData.ledgerDetails, date: e.target.value } })} />

                    {/* NEW FIELDS */}
                    <input placeholder="Voucher No (e.g. 505)" className="p-2 border rounded"
                      value={formData.ledgerDetails?.vchNo || ''}
                      onChange={e => setFormData({ ...formData, ledgerDetails: { ...formData.ledgerDetails, vchNo: e.target.value } })} />
                    <select className="p-2 border rounded"
                      value={formData.ledgerDetails?.vchType || 'Journal'}
                      onChange={e => setFormData({ ...formData, ledgerDetails: { ...formData.ledgerDetails, vchType: e.target.value } })}
                    >
                      <option value="Journal">Journal</option>
                      <option value="Payment">Payment</option>
                      <option value="Receipt">Receipt</option>
                      <option value="Purchase">Purchase</option>
                    </select>
                  </div>
                </div>

                {/* FAULTY FIELD & REASON */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Faulty Field (If any)</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      value={formData.faultyField || ''}
                      onChange={(e) => setFormData({ ...formData, faultyField: e.target.value })}
                    >
                      <option value="">None (Clean Case)</option>
                      <option value="Vendor">Vendor Mismatch</option>
                      <option value="Date">Date Mismatch</option>
                      <option value="Amount">Amount Mismatch</option>
                      <option value="Tax">Tax/GST Mismatch</option>
                      <option value="Compliance">Compliance (e.g. 40A(3), Limit)</option>
                    </select>
                  </div>
                  {formData.faultyField && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Violation Reason</label>
                      <input className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Detailed explanation of failure..."
                        value={formData.violationReason || ''}
                        onChange={(e) => setFormData({ ...formData, violationReason: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* HIDDEN LEGACY FIELDS (Calculated) */}
              {/* expectedAction is derived from faultyField in handleSave, but displayed here for debug if needed */}
            </>
          )}

          {contentType === 'arcade' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL identifier)</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. turning-bullish-07"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rich Text Context (Optional)</label>
                <textarea
                  value={formData.richTextContext || ''}
                  onChange={(e) => setFormData({ ...formData, richTextContext: e.target.value })}
                  rows={4}
                  placeholder="Additional context or background information..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chart URL</label>
                  <input
                    type="url"
                    value={formData.chartUrl || ''}
                    onChange={(e) => setFormData({ ...formData, chartUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dataset URL</label>
                  <input
                    type="url"
                    value={formData.datasetUrl || ''}
                    onChange={(e) => setFormData({ ...formData, datasetUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Direct .csv link (Raw)"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                    Must be a DIRECT link (e.g. GitHub Raw or GSheets /export?format=csv)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL (Solution)</label>
                <input
                  type="url"
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                <textarea
                  value={formData.instructions || ''}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  required
                  rows={4}
                  placeholder="Step-by-step instructions for the analyst..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold text-gray-900 mb-4">Verification Logic</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Question</label>
                    <input
                      type="text"
                      value={formData.question || ''}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Answer Type</label>
                      <select
                        value={formData.answerType || 'NUMBER'}
                        onChange={(e) => setFormData({ ...formData, answerType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="NUMBER">Number</option>
                        <option value="TEXT">Text</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Value</label>
                      <input
                        type="text"
                        value={formData.correctVal || ''}
                        onChange={(e) => setFormData({ ...formData, correctVal: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {formData.answerType === 'NUMBER' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tolerance (±)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.tolerance || 0}
                        onChange={(e) => setFormData({ ...formData, tolerance: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
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
            {contentType === 'arcade' && (
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex-1 bg-teal-50 text-teal-700 px-6 py-3 rounded-xl hover:bg-teal-100 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Preview
              </button>
            )}
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

      {/* ARCADE PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-6 right-6 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
            <div className="p-8">
              <ContextPanel challenge={{ ...formData, id: 'preview-id' }} />
              <div className="text-center pb-10">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">End of Preview</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
