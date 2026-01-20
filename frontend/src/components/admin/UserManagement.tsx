import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Download,
  UserPlus,
  Shield,
  Award,
  Target,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  X,
  FileText
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { toPng } from 'html-to-image';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastActivityDate: string | null;
  xp: number;
  level: number;
  avatar: string | null;
  completedSimulations: number;
  activeSeconds: number;
  auditCorrect: number;
  auditTotal: number;
  taxCorrect: number;
  taxTotal: number;
  caselawCorrect: number;
  caselawTotal: number;
  correctAnswers: number;
  totalQuestions: number;
  stats?: Array<{
    moduleType: string;
    correctCount: number;
    totalCount: number;
    accuracy: number;
  }>;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Student' | 'Partner' | 'Admin'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
        role: roleFilter,
        status: statusFilter
      });
      const data = await api.get<{ users: User[], pagination: any }>(`/api/admin/users?${query.toString()}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, roleFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchUsers();
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === users.length && users.length > 0
        ? []
        : users.map(user => user.id)
    );
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleExportUsers = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'XP', 'Level', 'Joined'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => [u.id, u.name, u.email, u.role, u.status, u.xp, u.level, u.createdAt].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'finopoly-citizens.csv');
    link.click();
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setLoading(true);
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as string,
        status: formData.get('status') as string,
      };

      await api.put(`/api/admin/users/${editingUser.id}`, data);
      setShowUserModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to decommission this record?")) return;
    try {
      setLoading(true);
      await api.delete(`/api/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowReport = async (user: User) => {
    setEditingUser(user);
    setShowReportModal(true);
    setLoadingReport(true);
    setReportData(null);
    try {
      const data = await api.get<{ trend: any[] }>(`/api/admin/users/${user.id}/report`);
      setReportData(data.trend);
    } catch (err) {
      console.error("Failed to fetch report", err);
    } finally {
      setLoadingReport(false);
    }
  };

  const downloadReport = async () => {
    if (reportRef.current === null) return;
    try {
      const dataUrl = await toPng(reportRef.current, { cacheBust: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `${editingUser?.name || 'user'}-report.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-1">Population Registry</h2>
          <p className="text-gray-500 font-medium text-sm">Manage citizens, roles, and ecosystem permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-black transition-all hover:bg-gray-50 active:scale-95 uppercase tracking-widest text-[10px]"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={() => { setEditingUser(null); setShowUserModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black transition-all hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95 uppercase tracking-widest text-[10px]"
          >
            <UserPlus size={14} />
            Onboard Citizen
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 items-center">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Name, Email or ID Protocol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-800 placeholder-gray-300 text-sm"
          />
        </form>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <Filter size={12} />
            Filters:
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-[11px] text-gray-600 outline-none cursor-pointer hover:bg-white transition-all min-w-[120px]"
          >
            <option value="All">All Roles</option>
            <option value="Student">Student</option>
            <option value="Partner">Partner</option>
            <option value="Admin">Council</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-[11px] text-gray-600 outline-none cursor-pointer hover:bg-white transition-all min-w-[120px]"
          >
            <option value="All">All Status</option>
            <option value="Active">Authorized</option>
            <option value="Suspended">Restricted</option>
          </select>
          <button
            onClick={fetchUsers}
            className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="p-8 w-14">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-blue-500 bg-white"
                  />
                </th>
                <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest">Identity Protocol</th>
                <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Authorization</th>
                <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Status</th>
                <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">XP Yield</th>
                <th className="px-6 py-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center px-10">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-white rounded-full animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Population...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-gray-400 font-bold uppercase tracking-tighter text-2xl">No Citizens Identified</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                    <td className="p-8">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-blue-500 transition-all"
                      />
                    </td>
                    <td className="px-6 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center text-gray-400 font-black border border-gray-100 group-hover:scale-110 transition-transform overflow-hidden shadow-sm">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.name?.[0]?.toUpperCase() || '?'
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm uppercase tracking-tighter">{user.name}</p>
                          <p className="text-xs text-gray-400 font-medium lowercase">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm border ${user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          user.role === 'Partner' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="flex justify-center">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                          <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'} shadow-[0_0_8px] ${user.status === 'Active' ? 'shadow-emerald-200' : 'shadow-red-200'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${user.status === 'Active' ? 'text-emerald-700' : 'text-red-700'}`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className="text-sm font-black text-gray-900">{user.xp?.toLocaleString() || 0}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Level {user.level || 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleShowReport(user)}
                          className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-95"
                          title="Diagnostics"
                        >
                          <BarChart2 size={16} />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                          title="Modify Record"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                          title="Decommission"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sentinel Pagination */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900">{users.length}</span> of <span className="text-gray-900">{pagination.total}</span> Registered Citizens
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-6 py-4 bg-white border border-gray-200 rounded-2xl font-black text-xs text-blue-600 shadow-xl shadow-gray-200">
              {pagination.currentPage} <span className="text-gray-300 mx-2">/</span> {pagination.pages}
            </div>
            <button
              disabled={pagination.currentPage === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-lg border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">{editingUser ? 'Modify Citizenship' : 'Onboard New Citizen'}</h3>
                <p className="text-gray-400 text-xs font-bold mt-1">Update parameters and authorization levels.</p>
              </div>
              <button
                onClick={() => { setShowUserModal(false); setEditingUser(null); }}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Full Identity Name</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingUser?.name || ''}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Credential Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editingUser?.email || ''}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Protocol Role</label>
                    <select
                      name="role"
                      defaultValue={editingUser?.role || 'Student'}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-black"
                    >
                      <option value="Student">Student</option>
                      <option value="Partner">Partner</option>
                      <option value="Admin">Council</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Status</label>
                    <select
                      name="status"
                      defaultValue={editingUser?.status || 'Active'}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-black"
                    >
                      <option value="Active">Authorized</option>
                      <option value="Suspended">Restricted</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowUserModal(false); setEditingUser(null); }}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  Deploy Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 overflow-y-auto p-4 md:p-8">
          <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl p-6 md:p-12 w-full max-w-4xl border border-gray-100 animate-in slide-in-from-bottom-10 duration-500 relative my-auto">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all z-10"
            >
              <X size={24} />
            </button>

            <div ref={reportRef} className="bg-white">
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-12 gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest mb-4">
                    Analytical Diagnostic Report
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-2 break-words">{editingUser?.name}</h3>
                  <p className="text-gray-400 font-bold text-sm">Citizen ID Protocol: <span className="text-xs">{editingUser?.id}</span></p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-gray-300 font-black text-5xl uppercase tracking-tighter opacity-20">FINOPOLY</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10 mb-8 md:mb-12">
                <div className="bg-gray-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Core Competency</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl md:text-4xl font-black text-gray-900">{editingUser?.xp?.toLocaleString() || 0}</span>
                    <span className="text-xs md:text-sm font-black text-blue-600 mb-1 uppercase">XP</span>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <div className="px-3 py-1 bg-white rounded-lg text-[9px] font-black text-gray-600 border border-gray-100 uppercase tracking-widest">
                      Rank: Level {editingUser?.level || 1}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Simulations Deployed</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl md:text-4xl font-black text-gray-900">{editingUser?.completedSimulations || 0}</span>
                    <span className="text-xs md:text-sm font-black text-emerald-600 mb-1 uppercase">Units</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">System Engagement</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl md:text-4xl font-black text-gray-900">{Math.floor((editingUser?.activeSeconds || 0) / 3600)}</span>
                    <span className="text-xs md:text-sm font-black text-amber-600 mb-1 uppercase">Hours</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 h-auto md:h-[300px]">
                <div className="bg-gray-50 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden h-[300px] md:h-auto">
                  <p className="absolute top-6 left-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Competency Vectors</p>
                  {/* Simplified Radar Chart representation */}
                  <div className="w-full h-full flex items-center justify-center mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                        { subject: 'Forensic Audit', A: editingUser?.auditCorrect || 0, fullMark: editingUser?.auditTotal || 100 },
                        { subject: 'Tax Law', A: editingUser?.taxCorrect || 0, fullMark: editingUser?.taxTotal || 100 },
                        { subject: 'Case Law', A: editingUser?.caselawCorrect || 0, fullMark: editingUser?.caselawTotal || 100 },
                        { subject: 'Compliance', A: editingUser?.correctAnswers || 0, fullMark: editingUser?.totalQuestions || 100 },
                        { subject: 'Ethics', A: 85, fullMark: 100 },
                      ]}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 900 }} />
                        <Radar name="Competency" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border border-gray-100 flex flex-col h-[300px] md:h-auto">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Performance Progression</p>
                  <div className="flex-1 flex items-end justify-between gap-1">
                    {reportData ? reportData.map((d: any, i: number) => (
                      <div key={i} className="flex-1 bg-white rounded-t-lg relative group border-x border-transparent hover:border-blue-100">
                        <div className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-t-lg opacity-20" style={{ height: '100%' }} />
                        <div className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-lg" style={{ height: `${(d.total / 1000) * 100}%` }} />
                      </div>
                    )) : (
                      <div className="flex-1 flex items-center justify-center text-gray-300 font-black uppercase text-[10px] tracking-widest">Synchronizing History...</div>
                    )}
                  </div>
                  <p className="text-center text-[8px] font-black text-gray-400 uppercase tracking-widest mt-4">Last 7 Operational Cycles</p>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-12 flex gap-4">
              <button
                onClick={downloadReport}
                className="flex-1 py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Download size={18} />
                Download PNG Directive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;