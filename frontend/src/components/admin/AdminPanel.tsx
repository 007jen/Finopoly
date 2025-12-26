// src/components/admin/AdminPanel.tsx
// Phase 1 Migration: Safe Admin Panel
// Operates securely with a hardcoded key if env var is missing during dev/demo.
// Uses Mock Data for analytics when DB is unconnected.

import React, { useState, useEffect } from 'react';
import { CreditCard as Edit, Trash2, Upload, Users, BarChart3, FileText, Scale, Save, X, Calculator, Target, BookOpen, Image, File } from 'lucide-react';
import UserManagement from './UserManagement';
import ContentManagement from './ContentManagement';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { api } from '../../lib/api';

// --- Safe Configuration ---
const ADMIN_KEY_ENV = import.meta.env.VITE_ADMIN_KEY || 'FINOPOLY_ADMIN_2024';

interface ContentItem {
  id: string;
  title: string;
  type: 'simulation' | 'case-study' | 'mcq';
  module: 'audit' | 'tax' | 'caselaw';
  difficulty: 'Beginner' | 'Intermediate' | 'Pro';
  content: any;
  files?: string[];
  created: string;
  status: 'draft' | 'published';
}

const AdminPanel: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [securityKey, setSecurityKey] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'content' | 'files' | 'analytics' | 'users'>('content');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { getToken } = useClerkAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const [newContent, setNewContent] = useState({
    title: '',
    type: 'simulation' as 'simulation' | 'case-study' | 'mcq',
    module: 'audit' as 'audit' | 'tax' | 'caselaw',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Pro',
    description: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    xpReward: 100,
    timeLimit: 30,
    // Audit Specific
    invoiceDetails: { vendor: '', amount: 0, tax: 0, total: 0, date: '', invoiceNo: '', description: '', paymentMode: 'BANK', gstin: '' },
    ledgerDetails: { particulars: '', debit: 0, date: '', vchType: 'Journal', vchNo: '' },
    expectedAction: 'ACCEPT', // Deprecated but kept for backward compatibility if needed, or derived
    faultyField: '', // 'Vendor', 'Date', 'Amount', 'Tax', 'Compliance' or ''
    violationReason: ''
  });

  // --- Security Check ---
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityKey === ADMIN_KEY_ENV) {
      setIsAuthorized(true);
      setError("");
      sessionStorage.setItem('finopoly_admin_auth', 'true');
    } else {
      setError("Invalid Security Key");
    }
  };

  // Check storage on mount
  useEffect(() => {
    if (sessionStorage.getItem('finopoly_admin_auth') === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Security Access</h2>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter Security Key</label>
              <input
                type="password"
                value={securityKey}
                onChange={(e) => setSecurityKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter key..."
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Verify Access
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">
              Hint: Default is FINOPOLY_ADMIN_2024
            </p>
          </form>
        </div>
      </div>
    );
  }

  // --- Handlers ---



  const handleCreateContent = async () => {
    // console.log('[Admin] Creating content payload:', newContent);
    try {
      const token = await getToken();
      if (newContent.type === 'simulation' && newContent.module === 'audit') {
        await api.post('/api/audit/create', {
          title: newContent.title,
          companyName: 'Swastik Enterprises', // Default for now
          difficulty: newContent.difficulty,
          description: newContent.description,
          xpReward: newContent.xpReward,
          timeLimit: newContent.timeLimit * 60, // convert mins to seconds
          invoiceDetails: newContent.invoiceDetails,
          ledgerDetails: newContent.ledgerDetails,
          expectedAction: newContent.faultyField ? 'REJECT' : 'ACCEPT',
          faultyField: newContent.faultyField || null,
          violationReason: newContent.violationReason
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        alert('Audit Case Created!');
      } else {
        console.log("Only Audit Cases supported currently via API");
      }
    } catch (e) {
      console.error("Create error", e);
      alert('Error creating content');
    }

    setShowCreateModal(false);
    // Reset form
    setNewContent({
      title: '',
      type: 'simulation',
      module: 'audit',
      difficulty: 'Beginner',
      description: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      xpReward: 100,
      timeLimit: 30,
      invoiceDetails: { vendor: '', amount: 0, tax: 0, total: 0, date: '', invoiceNo: '', description: '', paymentMode: 'BANK', gstin: '' },
      ledgerDetails: { particulars: '', debit: 0, date: '', vchType: 'Journal', vchNo: '' },
      expectedAction: 'ACCEPT',
      faultyField: '',
      violationReason: ''
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      console.log('[Admin] Uploading files:', Array.from(files).map(f => f.name));
    }
  };

  // --- Tab Renderers ---

  const renderContentTab = () => (
    <div className="animate-fade-in">
      {/* ContentManagement handles its own safe mocks or safe data-layer calls */}
      <ContentManagement />
    </div>
  );

  const renderFilesTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">File Management</h2>
        <div>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
          >
            <Upload className="w-5 h-5" />
            Upload Files
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'trial_balance.pdf', type: 'PDF', size: '2.4 MB', icon: File },
          { name: 'asset_register.xlsx', type: 'Excel', size: '1.8 MB', icon: FileText },
          { name: 'company_logo.png', type: 'Image', size: '245 KB', icon: Image },
          { name: 'case_study.docx', type: 'Word', size: '3.1 MB', icon: FileText },
        ].map((file, index) => {
          const Icon = file.icon;
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <Icon className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.type} • {file.size}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                  View
                </button>
                <button className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
      {/* Safe Mock Data for Phase 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '1,247', icon: Users, color: 'from-blue-500 to-blue-600', change: '+12%' },
          { label: 'Content Items', value: '156', icon: FileText, color: 'from-green-500 to-green-600', change: '+8%' },
          { label: 'Completions', value: '3,429', icon: Target, color: 'from-purple-500 to-purple-600', change: '+15%' },
          { label: 'Avg Score', value: '78%', icon: BarChart3, color: 'from-orange-500 to-orange-600', change: '+5%' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-green-600">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { user: 'Rahul Sharma', action: 'Completed Fixed Assets Audit', time: '2 minutes ago' },
            { user: 'Priya Patel', action: 'Started Tax Simulation', time: '5 minutes ago' },
            { user: 'Arjun Kumar', action: 'Earned "Case Law Pro" badge', time: '12 minutes ago' },
            { user: 'Sneha Gupta', action: 'Uploaded new case study', time: '18 minutes ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">{activity.user}</p>
                <p className="text-sm text-gray-600">{activity.action}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="animate-fade-in">
      {/* UserManagement handles its own safe mocks or safe data-layer calls */}
      <UserManagement />
    </div>
  );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 text-lg">Manage content, users, and monitor platform performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-xl mb-8 w-fit shadow-lg border border-white/50">
        {[
          { id: 'content', label: 'Content', icon: FileText },
          { id: 'files', label: 'Files', icon: Upload },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-semibold ${activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'files' && renderFilesTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'users' && renderUsersTab()}
      </div>

      {/* Create Content Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Content</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newContent.title}
                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter content title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={newContent.type}
                    onChange={(e) => setNewContent({ ...newContent, type: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="simulation">Simulation</option>
                    <option value="case-study">Case Study</option>
                    <option value="mcq">MCQ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Module</label>
                  <select
                    value={newContent.module}
                    onChange={(e) => setNewContent({ ...newContent, module: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="audit">Audit</option>
                    <option value="tax">Tax</option>
                    <option value="caselaw">Case Law</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={newContent.difficulty}
                    onChange={(e) => setNewContent({ ...newContent, difficulty: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Pro">Pro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-24 resize-none"
                  placeholder="Enter content description"
                />
              </div>

              {newContent.type === 'mcq' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Question</label>
                    <textarea
                      value={newContent.question}
                      onChange={(e) => setNewContent({ ...newContent, question: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-20 resize-none"
                      placeholder="Enter the question"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Options</label>
                    {newContent.options.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newContent.options];
                          newOptions[index] = e.target.value;
                          setNewContent({ ...newContent, options: newOptions });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all mb-2"
                        placeholder={`Option ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Answer</label>
                    <select
                      value={newContent.correctAnswer}
                      onChange={(e) => setNewContent({ ...newContent, correctAnswer: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select correct answer</option>
                      {newContent.options.map((option, index) => (
                        <option key={index} value={option}>{option || `Option ${index + 1}`}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Explanation</label>
                    <textarea
                      value={newContent.explanation}
                      onChange={(e) => setNewContent({ ...newContent, explanation: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-24 resize-none"
                      placeholder="Explain why this is the correct answer"
                    />
                  </div>
                </>
              )}

              {/* AUDIT CASE SPECIFIC GENERIC UI */}
              {newContent.type === 'simulation' && newContent.module === 'audit' && (
                <div className="space-y-4 border-t pt-4 mt-4 border-gray-200">
                  <h3 className="font-bold text-gray-900">Audit Details</h3>

                  {/* INVOICE SECTION */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Invoice Data</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Vendor Name" className="p-2 border rounded"
                        value={newContent.invoiceDetails.vendor}
                        onChange={e => setNewContent({ ...newContent, invoiceDetails: { ...newContent.invoiceDetails, vendor: e.target.value } })} />
                      <input placeholder="Invoice No" className="p-2 border rounded"
                        value={newContent.invoiceDetails.invoiceNo}
                        onChange={e => setNewContent({ ...newContent, invoiceDetails: { ...newContent.invoiceDetails, invoiceNo: e.target.value } })} />
                      <input type="number" placeholder="Amount" className="p-2 border rounded"
                        value={newContent.invoiceDetails.amount}
                        onChange={e => setNewContent({ ...newContent, invoiceDetails: { ...newContent.invoiceDetails, amount: Number(e.target.value) } })} />
                      <input type="date" className="p-2 border rounded"
                        value={newContent.invoiceDetails.date}
                        onChange={e => setNewContent({ ...newContent, invoiceDetails: { ...newContent.invoiceDetails, date: e.target.value } })} />

                      {/* NEW FIELDS */}
                      <input placeholder="GSTIN" className="p-2 border rounded"
                        value={newContent.invoiceDetails.gstin}
                        onChange={e => setNewContent({ ...newContent, invoiceDetails: { ...newContent.invoiceDetails, gstin: e.target.value } })} />
                      <input placeholder="Description (Service/Item)" className="p-2 border rounded"
                        value={newContent.invoiceDetails.description}
                        onChange={e => setNewContent({ ...newContent, invoiceDetails: { ...newContent.invoiceDetails, description: e.target.value } })} />
                      <select className="p-2 border rounded"
                        value={newContent.invoiceDetails.paymentMode}
                        onChange={e => setNewContent({ ...newContent, invoiceDetails: { ...newContent.invoiceDetails, paymentMode: e.target.value as any } })}
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
                        value={newContent.ledgerDetails.particulars}
                        onChange={e => setNewContent({ ...newContent, ledgerDetails: { ...newContent.ledgerDetails, particulars: e.target.value } })} />
                      <input type="number" placeholder="Debit Amount" className="p-2 border rounded"
                        value={newContent.ledgerDetails.debit}
                        onChange={e => setNewContent({ ...newContent, ledgerDetails: { ...newContent.ledgerDetails, debit: Number(e.target.value) } })} />
                      <input type="date" className="p-2 border rounded"
                        value={newContent.ledgerDetails.date}
                        onChange={e => setNewContent({ ...newContent, ledgerDetails: { ...newContent.ledgerDetails, date: e.target.value } })} />

                      {/* NEW FIELDS */}
                      <input placeholder="Voucher No (e.g. 505)" className="p-2 border rounded"
                        value={newContent.ledgerDetails.vchNo}
                        onChange={e => setNewContent({ ...newContent, ledgerDetails: { ...newContent.ledgerDetails, vchNo: e.target.value } })} />
                      <select className="p-2 border rounded"
                        value={newContent.ledgerDetails.vchType}
                        onChange={e => setNewContent({ ...newContent, ledgerDetails: { ...newContent.ledgerDetails, vchType: e.target.value } })}
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
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                        value={newContent.faultyField}
                        onChange={(e) => setNewContent({ ...newContent, faultyField: e.target.value })}
                      >
                        <option value="">None (Clean Case)</option>
                        <option value="Vendor">Vendor Mismatch</option>
                        <option value="Date">Date Mismatch</option>
                        <option value="Amount">Amount Mismatch</option>
                        <option value="Tax">Tax/GST Mismatch</option>
                        <option value="Compliance">Compliance (e.g. 40A(3), Limit)</option>
                      </select>
                    </div>
                    {newContent.faultyField && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Violation Reason</label>
                        <input className="w-full px-4 py-3 border border-gray-300 rounded-xl" placeholder="Detailed explanation of failure..."
                          value={newContent.violationReason}
                          onChange={(e) => setNewContent({ ...newContent, violationReason: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">XP Reward</label>
                  <input
                    type="number"
                    value={newContent.xpReward}
                    onChange={(e) => setNewContent({ ...newContent, xpReward: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    min="50"
                    max="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={newContent.timeLimit}
                    onChange={(e) => setNewContent({ ...newContent, timeLimit: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    min="5"
                    max="120"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateContent}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
              >
                <Save className="w-4 h-4" />
                Create Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;