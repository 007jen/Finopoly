import React, { useState, useEffect } from 'react';
import { Upload, Users, BarChart3, FileText, Save, X, Target, Image, File, Shield, Calculator, Zap, PieChart as PieChartIcon, Activity } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import UserManagement from './UserManagement';
import ContentManagement from './ContentManagement';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { api } from '../../lib/api';

// --- Safe Configuration ---
const ADMIN_KEY_ENV = import.meta.env.VITE_ADMIN_KEY || 'FINOPOLY_ADMIN_2024';



const AdminPanel: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [securityKey, setSecurityKey] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'content' | 'files' | 'analytics' | 'users' | 'audit'>('analytics');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const { getToken } = useClerkAuth();

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

  const fetchMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const token = await getToken();
      const data = await api.get('/api/admin/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch metrics", err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Check storage on mount
  useEffect(() => {
    if (sessionStorage.getItem('finopoly_admin_auth') === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchMetrics();
    }
  }, [isAuthorized]);

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Citizens', value: metrics?.totalUsers?.toLocaleString() || '---', icon: Users, color: 'from-blue-600 to-blue-400', bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Deployments', value: metrics?.totalActivities?.toLocaleString() || '---', icon: Target, color: 'from-purple-600 to-purple-400', bg: 'bg-purple-50', text: 'text-purple-600' },
          { label: 'Avg Competency', value: metrics?.avgXpPerUser?.toLocaleString() || '---', icon: BarChart3, color: 'from-emerald-600 to-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-600' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className={`px-3 py-1 ${stat.bg} ${stat.text} rounded-full text-[10px] font-black uppercase tracking-wider`}>
                  Live Update
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="space-y-10">
            {/* System Pulse Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Activity size={18} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">System Pulse</h3>
                </div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Traffic Load (24h)</p>
              </div>
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.activityPulse || []}>
                    <defs>
                      <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#9ca3af' }}
                      interval={3}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontSize: '9px',
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPulse)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Module Affinity Section (Below) */}
            <div className="pt-8 border-t border-gray-50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <PieChartIcon size={18} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Module Affinity</h3>
                </div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Resource Distribution</p>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics?.moduleDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(metrics?.moduleDistribution || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      layout="horizontal"
                      formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mx-2">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Activity Feed</h3>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <div className="space-y-6">
            {(metrics?.recentActivities || []).length > 0 ? (
              metrics.recentActivities.map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-4 group cursor-default slide-in-bottom" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-50 group-hover:scale-110 transition-transform ${activity.type === 'audit' ? 'bg-blue-50 text-blue-600' :
                    activity.type === 'tax' ? 'bg-emerald-50 text-emerald-600' :
                      activity.type === 'caselaw' ? 'bg-gray-50 text-gray-600' :
                        'bg-amber-50 text-amber-600'
                    }`}>
                    {activity.type === 'audit' ? <Shield className="w-5 h-5" /> :
                      activity.type === 'tax' ? <Calculator className="w-5 h-5" /> :
                        activity.type === 'caselaw' ? <FileText className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-black text-gray-900 text-sm truncate uppercase tracking-tighter">{activity.user}</p>
                    <p className="text-[10px] text-gray-400 font-bold truncate uppercase tracking-widest">{activity.action}</p>
                  </div>
                  <span className="ml-auto text-[9px] font-black text-gray-300 uppercase shrink-0">
                    {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs">
                No recent signals
              </div>
            )}
          </div>
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
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter uppercase">Platform Control</h1>
            </div>
            <p className="text-gray-500 font-medium text-sm sm:text-base">Mission Control for Finopoly Ecosystem & Governance</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchMetrics}
              disabled={loadingMetrics}
              className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm hover:shadow-md active:scale-95 flex-1 md:flex-none flex justify-center"
              title="Refresh Global Metrics"
            >
              <Save className={`w-5 h-5 ${loadingMetrics ? 'animate-spin' : ''}`} />
            </button>
            <div className="px-4 py-3 md:py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs uppercase border border-emerald-100 flex items-center justify-center gap-2 flex-1 md:flex-none">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Systems Online
            </div>
          </div>
        </header>

        {/* Tab Navigation - Command Bar Style */}
        <div className="flex flex-wrap gap-2 mb-8 sm:mb-10 p-1.5 bg-gray-200/50 backdrop-blur-sm rounded-[2rem] border border-gray-200 w-full sm:w-fit overflow-x-auto">
          {[
            { id: 'analytics', label: 'Monitor', icon: BarChart3 },
            { id: 'users', label: 'Inhabitants', icon: Users },
            { id: 'content', label: 'Content Forge', icon: FileText },
            { id: 'files', label: 'Assets', icon: Image },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 sm:px-6 py-3 rounded-[1.5rem] transition-all duration-300 font-bold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap ${isActive
                  ? 'bg-white text-blue-600 shadow-xl shadow-gray-200/50 border border-gray-100 scale-105 z-10'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="inline sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="min-h-[600px] animate-in fade-in duration-500 pb-20 sm:pb-0">
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'content' && renderContentTab()}
          {activeTab === 'files' && renderFilesTab()}
        </div>
      </div>

      {/* Create Content Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Content</h2>
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
      )
      }
    </div >
  );
};

export default AdminPanel;