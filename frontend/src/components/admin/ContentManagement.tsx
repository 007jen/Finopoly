import React, { useState, useEffect } from 'react';
import {
  Plus,
  CreditCard as Edit,
  Trash2,
  Save,
  X,
  FileText,
  Scale,
  Calculator,
  Zap,
  Eye,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Target,
  Award,
  Shield,
  Clock,
  Layers,
  Upload,
  FileVideo,
  CheckCircle
} from 'lucide-react';
import { ContextPanel } from '../Challenges/ContextPanel';
import { db } from '../../lib/database';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { api } from '../../lib/api';
import AdminAuditPanel from './AdminAuditPanel';

import CoursesPage from '../courses/CoursesPage';

type ContentType = 'caselaw' | 'audit' | 'tax' | 'arcade' | 'courses';

const ContentManagement: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [contentType, setContentType] = useState<ContentType>('caselaw');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (contentType === 'courses') return;
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
        const rawData = await api.get<any[]>('/api/audit/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
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
          difficulty: item.difficulty.charAt(0) + item.difficulty.slice(1).toLowerCase()
        }));
      } else if (contentType !== 'courses') {
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
    if (!confirm('Are you sure you want to delete this resource blueprint?')) return;
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
    try {
      if (contentType === 'caselaw') {
        if (editingItem) {
          await db.updateCaseLaw(editingItem.id, formData);
        } else {
          await db.createCaseLaw(formData, 'admin');
        }
      } else if (contentType === 'audit') {
        const token = await getToken();
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
          expectedAction: formData.expectedAction || (formData.faultyField ? 'REJECT' : 'ACCEPT'),
          faultyField: formData.faultyField || null,
          violationReason: formData.violationReason,
          tags: formData.tags || []
        };
        if (editingItem && editingItem.id) {
          await api.put(`/api/audit/${editingItem.id}`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          await api.post('/api/audit/create', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } else if (contentType === 'arcade') {
        const token = await getToken();
        const payload = {
          title: formData.title,
          slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          richTextContext: formData.richTextContext || null,
          isActive: formData.is_active,
          difficulty: formData.difficulty.toUpperCase(),
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
      } else if (contentType === 'courses') {
        // Handled within ContentForm for multipart/progress or via specific logic
        // But here we might receive the raw data if we move logic up.
        // However, video upload is special. Let's assume ContentForm handles the upload 
        // OR we handle it here if formData contains a File.

        // Actually, the best pattern for file upload reuse is to invoke the API directly
        // or let the form handle it. Given the existing structure, let's let handleSave
        // dispatch the API call if we pass the File object up.

        // For now, let's assume formData comes with the necessary fields.
        // But wait, standard JSON save might not work for files.
        // We will implement the upload logic inside ContentForm for courses 
        // to handle the progress bar UI which is local to the modal.
        // So this block might just be a placeholder or for metadata updates if editing.

        if (formData instanceof FormData) {
          await api.postMultipart('/api/courses', formData);
        }
      }
      setShowForm(false);
      setEditingItem(null);
      loadContent();
    } catch (error: any) {
      console.error('Error saving:', error);
      alert('Save operation failed: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-1">Resource Matrix</h2>
          <p className="text-gray-500 font-medium text-sm">Forge and calibrate learning simulations for the ecosystem.</p>
        </div>
        {contentType !== 'audit' && (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black transition-all hover:bg-black shadow-xl shadow-gray-200 active:scale-95 uppercase tracking-widest text-[10px]"
          >
            <Plus size={16} />
            Forge New Content
          </button>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-3">
        {(['caselaw', 'audit', 'tax', 'arcade', 'courses'] as ContentType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setContentType(tab)}
            className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all ${contentType === tab
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50'
              : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
              }`}
          >
            {tab === 'caselaw' && <Scale size={14} className="inline mr-2" />}
            {tab === 'audit' && <FileText size={14} className="inline mr-2" />}
            {tab === 'tax' && <Calculator size={14} className="inline mr-2" />}
            {tab === 'arcade' && <Zap size={14} className="inline mr-2" />}
            {tab === 'courses' && <Eye size={14} className="inline mr-2" />}
            {tab}
          </button>
        ))}
      </div>

      {contentType === 'audit' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <AdminAuditPanel />
        </div>
      ) : contentType === 'courses' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <CoursesPage />
        </div>
      ) : (
        <>
          {/* Control Bar */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources by title, vector, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-800 placeholder-gray-300 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadContent} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all active:rotate-180">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Content Table / Cards */}
          <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            {/* Mobile Card View */}
            <div className="block md:hidden">
              {loading ? (
                <div className="p-10 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-white rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Matrix...</span>
                  </div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-tighter text-xl">No Blueprints Identified</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="p-5 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center text-blue-600 border border-gray-100 shadow-sm shrink-0">
                            {contentType === 'caselaw' && <Scale size={20} />}
                            {contentType === 'tax' && <Calculator size={20} />}
                            {contentType === 'arcade' && <Zap size={20} />}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-sm uppercase tracking-tighter mb-1 line-clamp-1">{item.title}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.company || item.category || 'General'}</span>
                              {item.difficulty && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{item.difficulty}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`flex flex-col items-end px-2 py-1 rounded-lg border ${item.is_active ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-200'}`}>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${item.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {item.is_active ? 'Live' : 'Draft'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pl-16">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-gray-900">+{item.xp_reward || 0} XP</span>
                          <span className="text-gray-300 text-[10px]">•</span>
                          <span className="text-[10px] font-bold text-gray-500">{item.time_limit || 0}m</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(item)} className="p-2 bg-blue-50 text-blue-600 rounded-xl active:scale-95 transition-all">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-xl active:scale-95 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest">Resource Identity</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Parameters</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Status</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Yield</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-blue-600 border-t-white rounded-full animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Matrix...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-24 text-center text-gray-400 font-bold uppercase tracking-tighter text-2xl">No Blueprints Identified</td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-50 rounded-[1.25rem] flex items-center justify-center text-blue-600 border border-gray-100 group-hover:scale-110 transition-transform shadow-sm">
                              {contentType === 'caselaw' && <Scale size={24} />}
                              {contentType === 'tax' && <Calculator size={24} />}
                              {contentType === 'arcade' && <Zap size={24} />}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 text-base uppercase tracking-tighter mb-1 leading-none">{item.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.company || item.category || 'General protocol'}</span>
                                {item.difficulty && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                )}
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{item.difficulty}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-8">
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                              <Clock size={10} className="text-gray-400" />
                              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{item.time_limit || 0}m Limit</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                              <Layers size={10} className="text-gray-400" />
                              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{contentType} Class</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-8">
                          <div className="flex justify-center">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm ${item.is_active ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                              <span className="text-[9px] font-black uppercase tracking-widest">{item.is_active ? 'Deployed' : 'Draft'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-8 text-right">
                          <div className="inline-flex flex-col items-end">
                            <span className="text-sm font-black text-gray-900">+{item.xp_reward || 0}</span>
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">XP Yield</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
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
      expectedAction: 'ACCEPT',
      violationReason: '',
      faultyField: '',
      invoiceDetails: { vendor: "", amount: 0, tax: 0, total: 0, date: '', invoiceNo: '', description: '', paymentMode: 'BANK', gstin: '' },
      ledgerDetails: { particulars: "", debit: 0, date: '', vchType: 'Journal', vchNo: '' },
      slug: '',
      richTextContext: '',
      chartUrl: '',
      datasetUrl: '',
      videoUrl: '',
      instructions: '',
      answerType: 'NUMBER',
      correctVal: '',
      tolerance: 0.5,
      tags: []
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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl sm:rounded-[3.5rem] shadow-2xl p-6 sm:p-12 w-full max-w-4xl border border-gray-100 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-start mb-6 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest mb-4">
              Forge Simulation Unit
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">{item ? 'Recalibrate' : 'Manifest'} Resource</h3>
            <p className="text-gray-400 font-bold text-xs sm:text-sm mt-2">Configure logic protocols and yield parameters.</p>
          </div>
          <button
            onClick={onCancel}
            className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-[1.25rem] transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {contentType === 'courses' ? (
          <CourseUploadForm onCancel={onCancel} onSuccess={() => { onSave({}); }} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
            {/* Section: Basic Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Protocol Title</label>
                  <input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                    placeholder="Resource designation..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-gray-800"
                    >
                      {contentType === 'arcade' ? (
                        <>
                          <option value="Junior">Junior</option>
                          <option value="Senior">Senior</option>
                          <option value="Partner">Partner</option>
                        </>
                      ) : (
                        <>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Pro">Pro</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">XP Yield</label>
                    <input
                      type="number"
                      value={formData.xp_reward}
                      onChange={e => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-gray-800"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Context Vector ({contentType === 'caselaw' ? 'Category' : 'Company'})</label>
                  <input
                    value={contentType === 'caselaw' ? formData.category : formData.company}
                    onChange={e => setFormData({ ...formData, [contentType === 'caselaw' ? 'category' : 'company']: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                    placeholder="Organizational context..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Time Buffer (min)</label>
                    <input
                      type="number"
                      value={formData.time_limit}
                      onChange={e => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-gray-800"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      id="form_active"
                      checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="form_active" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Deployment</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Scenario Sections */}
            <div className="space-y-8 bg-gray-50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-gray-100">
              {contentType === 'caselaw' && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Juridical Facts</label>
                    <textarea
                      rows={4}
                      value={formData.facts}
                      onChange={e => setFormData({ ...formData, facts: e.target.value })}
                      className="w-full bg-white border border-gray-100 rounded-3xl px-8 py-6 focus:border-blue-500 outline-none transition-all font-medium text-gray-800 resize-none"
                      placeholder="Legal scenario narrative..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Vector Question</label>
                    <input
                      value={formData.question}
                      onChange={e => setFormData({ ...formData, question: e.target.value })}
                      className="w-full bg-white border border-gray-100 rounded-3xl px-8 py-6 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                      placeholder="The core inquiry..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.options.map((option: string, i: number) => (
                      <div key={i}>
                        <label className="block text-[9px] text-gray-300 font-black uppercase mb-2 tracking-widest">Option {i + 1}</label>
                        <input
                          value={option}
                          onChange={e => updateOption(i, e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 sm:text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Consensus Answer</label>
                    <input
                      value={formData.correct_answer}
                      onChange={e => setFormData({ ...formData, correct_answer: e.target.value })}
                      className="w-full bg-white border border-emerald-500/30 rounded-3xl px-8 py-6 focus:border-emerald-500 outline-none transition-all font-black text-emerald-700"
                      placeholder="Must exactly match an option..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Rationale Disclosure</label>
                    <textarea
                      rows={3}
                      value={formData.explanation}
                      onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                      className="w-full bg-white border border-gray-100 rounded-3xl px-8 py-6 focus:border-blue-500 outline-none transition-all font-medium text-gray-800 resize-none"
                      placeholder="Why this answer is authoritative..."
                    />
                  </div>
                </div>
              )}

              {contentType === 'audit' && (
                <div className="space-y-10">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Audit Scenario Overview</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white border border-gray-100 rounded-3xl px-8 py-6 focus:border-blue-500 outline-none transition-all font-medium text-gray-800 resize-none"
                      placeholder="Macro context for the investigation..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* INVOICE FORGE */}
                    <div className="space-y-6">
                      <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest bg-blue-50 inline-block px-4 py-1 rounded-lg">Invoice Artifact</p>
                      <div className="space-y-4">
                        <input placeholder="Vendor" className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 font-bold text-sm"
                          value={formData.invoiceDetails.vendor} onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, vendor: e.target.value } })} />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="number" placeholder="Amt" className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 font-bold text-sm"
                            value={formData.invoiceDetails.amount} onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, amount: parseFloat(e.target.value) } })} />
                          <input type="number" placeholder="Total" className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 font-bold text-sm"
                            value={formData.invoiceDetails.total} onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, total: parseFloat(e.target.value) } })} />
                        </div>
                        <input placeholder="Inv Number" className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 font-bold text-sm"
                          value={formData.invoiceDetails.invoiceNo} onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, invoiceNo: e.target.value } })} />
                        <input placeholder="Date (DD-MM-YYYY)" className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 font-bold text-sm"
                          value={formData.invoiceDetails.date} onChange={e => setFormData({ ...formData, invoiceDetails: { ...formData.invoiceDetails, date: e.target.value } })} />
                      </div>
                    </div>

                    {/* LEDGER FORGE */}
                    <div className="space-y-6">
                      <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest bg-emerald-50 inline-block px-4 py-1 rounded-lg">Ledger Entry</p>
                      <div className="space-y-4">
                        <input placeholder="Particulars" className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 font-bold text-sm"
                          value={formData.ledgerDetails.particulars} onChange={e => setFormData({ ...formData, ledgerDetails: { ...formData.ledgerDetails, particulars: e.target.value } })} />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="number" placeholder="Debit" className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 font-bold text-sm"
                            value={formData.ledgerDetails.debit} onChange={e => setFormData({ ...formData, ledgerDetails: { ...formData.ledgerDetails, debit: parseFloat(e.target.value) } })} />
                          <input placeholder="Vch Type" className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 font-bold text-sm"
                            value={formData.ledgerDetails.vchType} onChange={e => setFormData({ ...formData, ledgerDetails: { ...formData.ledgerDetails, vchType: e.target.value } })} />
                        </div>
                        <input placeholder="Vch Number" className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 font-bold text-sm"
                          value={formData.ledgerDetails.vchNo} onChange={e => setFormData({ ...formData, ledgerDetails: { ...formData.ledgerDetails, vchNo: e.target.value } })} />
                        <input placeholder="Date (DD-MM-YYYY)" className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 font-bold text-sm"
                          value={formData.ledgerDetails.date} onChange={e => setFormData({ ...formData, ledgerDetails: { ...formData.ledgerDetails, date: e.target.value } })} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Expected Directive</label>
                      <select
                        value={formData.expectedAction}
                        onChange={e => setFormData({ ...formData, expectedAction: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-[1.5rem] px-6 py-4 focus:border-blue-500 outline-none transition-all font-black"
                      >
                        <option value="ACCEPT">AUTHORIZE (ACCEPT)</option>
                        <option value="REJECT">FLAG (REJECT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Violation Reason (Null if Accept)</label>
                      <input
                        value={formData.violationReason}
                        onChange={e => setFormData({ ...formData, violationReason: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-[1.5rem] px-6 py-4 focus:border-blue-500 outline-none transition-all font-bold"
                        placeholder="Regulatory breach reason..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Arcade / Other forms can be extended here similarly */}
              {contentType === 'arcade' && (
                <div className="space-y-8">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Challenge parameters omitted for brevity in this view, assuming standard number prompt.</p>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Challenge Inquiry</label>
                    <input
                      value={formData.question}
                      onChange={e => setFormData({ ...formData, question: e.target.value })}
                      className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold"
                      placeholder="What is the user solving?"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Correct Valuation</label>
                      <input
                        value={formData.correctVal}
                        onChange={e => setFormData({ ...formData, correctVal: e.target.value })}
                        className="w-full bg-white border border-emerald-500/30 rounded-2xl px-6 py-4 font-black text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Error Tolerance</label>
                      <input
                        type="number"
                        value={formData.tolerance}
                        onChange={e => setFormData({ ...formData, tolerance: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 sm:gap-6 pt-6 flex-col sm:flex-row">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 sm:py-5 bg-gray-100 text-gray-500 rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all active:scale-95"
              >
                Cancel Protocol
              </button>
              <button
                type="submit"
                className="flex-2 px-8 sm:px-12 py-4 sm:py-5 bg-blue-600 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
              >
                Authorize & Deploy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// COURSE UPLOAD SUB-COMPONENT
const CourseUploadForm: React.FC<{ onCancel: () => void, onSuccess: () => void }> = ({ onCancel, onSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploadStatus('uploading');
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('video', uploadFile);
    formData.append('title', uploadFile.name.replace(/\.[^/.]+$/, ""));
    formData.append('description', description);
    formData.append('duration', '15 min');
    formData.append('expert', 'Admin'); // Default to Admin
    formData.append('level', 'Intermediate');

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      await api.postMultipart('/api/courses', formData);

      clearInterval(interval);
      setUploadProgress(100);
      setUploadStatus('success');

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      {!uploadFile ? (
        <div
          className={`border-3 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input type="file" id="file-upload" className="hidden" accept="video/*" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <FileVideo className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Drag & Drop Video Here</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">Supported formats: MP4, MOV, AVI (Max 500MB)</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">Browse Files</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <FileVideo className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 truncate">{uploadFile.name}</h4>
              <p className="text-xs text-gray-500">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button onClick={() => setUploadFile(null)} className="text-gray-400 hover:text-red-500 p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {uploadStatus === 'uploading' || uploadStatus === 'success' ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                <span>{uploadStatus === 'success' ? 'Upload Complete' : 'Uploading...'}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${uploadStatus === 'success' ? 'bg-green-500' : 'bg-blue-600 progress-bar-striped'}`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {uploadStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-bold bg-green-50 p-3 rounded-xl mt-4">
                  <CheckCircle className="w-5 h-5" />
                  <span>Video uploaded successfully! Redirecting...</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Enter course description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <button onClick={onCancel} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                <button onClick={handleUpload} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">Upload Video</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};


export default ContentManagement;
