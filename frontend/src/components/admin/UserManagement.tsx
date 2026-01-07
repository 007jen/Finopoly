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
    console.log('Exporting users:', users);
    alert('User data exported successfully!');
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
      alert("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      setLoading(true);
      await api.delete(`/api/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user");
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

  const downloadCSV = () => {
    if (!reportData || !editingUser) return;

    const headers = ['Date', 'Audit', 'Tax', 'Case Law', 'Quiz', 'Drill', 'Total'];
    const rows = reportData.map((d: any) => [
      d.date,
      d.audit,
      d.tax,
      d.caselaw,
      d.quiz,
      d.drill,
      d.total
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r: any) => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${editingUser.name}-activity-report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    return s === 'ACTIVE'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'admin') return 'bg-orange-100 text-orange-800';
    return r === 'student'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600 text-lg">Manage students, partners, and their learning progress</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportUsers}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button
              onClick={() => { setEditingUser(null); setShowUserModal(true); }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.status === 'ACTIVE').length}</p>
              </div>
              <Shield className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Students</p>
                <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'student').length}</p>
              </div>
              <Target className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Partners</p>
                <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'partner').length}</p>
              </div>
              <Award className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </form>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-sm font-medium"
                >
                  <option value="All">All Roles</option>
                  <option value="Student">Students</option>
                  <option value="Partner">Partners</option>
                  <option value="Admin">Admins</option>
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-sm font-medium"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Users ({pagination.total})
            </h2>
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedUsers.length} selected</span>
                <button className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">XP</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                      <span className="font-medium">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {user.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{user.name || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {['audit', 'tax', 'caselaw'].map(module => {
                        const stat = user.stats?.find(s => s.moduleType === module);
                        let percent = stat ? Math.round(stat.accuracy > 1 ? stat.accuracy : stat.accuracy * 100) : 0;

                        // Fallback to legacy counters
                        if (percent === 0) {
                          if (module === 'audit' && user.auditTotal > 0) percent = Math.round((user.auditCorrect / user.auditTotal) * 100);
                          if (module === 'tax' && user.taxTotal > 0) percent = Math.round((user.taxCorrect / user.taxTotal) * 100);
                          if (module === 'caselaw' && user.caselawTotal > 0) percent = Math.round((user.caselawCorrect / user.caselawTotal) * 100);
                        }
                        const colors = {
                          audit: 'bg-blue-600',
                          tax: 'bg-green-600',
                          caselaw: 'bg-purple-600'
                        }[module];

                        return (
                          <div key={module} className="flex items-center gap-2">
                            <div className="w-10 text-[10px] uppercase font-bold text-gray-400">{module}</div>
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`${colors} h-full transition-all duration-500`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="w-6 text-[10px] font-bold text-gray-600">{percent}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{user.xp.toLocaleString()} XP</span>
                      <span className="text-[10px] font-medium text-blue-600 uppercase">Level {user.level}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">
                    {formatRelativeTime(user.lastActivityDate)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleShowReport(user)}
                        className="p-1 hover:bg-green-100 text-green-600 rounded transition-colors"
                        title="View Analytics"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                        title="Delete User"
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

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {Math.min(pagination.total, (pagination.currentPage - 1) * pagination.limit + 1)} to {Math.min(pagination.total, pagination.currentPage * pagination.limit)} of {pagination.total} users
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.currentPage === 1 || loading}
              onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
              className="p-2 rounded-lg hover:bg-white border border-gray-200 disabled:opacity-50 transition-all font-medium flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setPagination(p => ({ ...p, currentPage: page }))}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${pagination.currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-white text-gray-600'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              disabled={pagination.currentPage === pagination.pages || loading}
              onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
              className="p-2 rounded-lg hover:bg-white border border-gray-200 disabled:opacity-50 transition-all font-medium flex items-center gap-1 text-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingUser?.name || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingUser?.email || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      name="role"
                      defaultValue={editingUser?.role || 'student'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
                    >
                      <option value="student">Student</option>
                      <option value="partner">Partner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      defaultValue={editingUser?.status || 'ACTIVE'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Modules</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Audit', 'Tax', 'Case Law'].map((module) => (
                      <label key={module} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{module}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (editingUser ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Student Performance Report</h2>
                  <p className="text-sm text-gray-500">{editingUser.name} &bull; {editingUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadCSV}
                  disabled={loadingReport || !reportData}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all font-semibold disabled:opacity-50"
                  title="Export to Excel"
                >
                  <FileText className="w-4 h-4" />
                  Excel (CSV)
                </button>
                <button
                  onClick={downloadReport}
                  disabled={loadingReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-semibold disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Save as PNG
                </button>
                <button
                  onClick={() => { setShowReportModal(false); setReportData(null); }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8" ref={reportRef}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Radar Chart for Skills */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Expertise Distribution</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        {
                          subject: 'Audit',
                          A: (() => {
                            const s = editingUser.stats?.find(st => st.moduleType === 'audit');
                            if (s) return s.accuracy > 1 ? s.accuracy : s.accuracy * 100;
                            return editingUser.auditTotal > 0 ? (editingUser.auditCorrect / editingUser.auditTotal) * 100 : 0;
                          })(),
                          fullMark: 100
                        },
                        {
                          subject: 'Tax',
                          A: (() => {
                            const s = editingUser.stats?.find(st => st.moduleType === 'tax');
                            if (s) return s.accuracy > 1 ? s.accuracy : s.accuracy * 100;
                            return editingUser.taxTotal > 0 ? (editingUser.taxCorrect / editingUser.taxTotal) * 100 : 0;
                          })(),
                          fullMark: 100
                        },
                        {
                          subject: 'Case Law',
                          A: (() => {
                            const s = editingUser.stats?.find(st => st.moduleType === 'caselaw');
                            if (s) return s.accuracy > 1 ? s.accuracy : s.accuracy * 100;
                            return editingUser.caselawTotal > 0 ? (editingUser.caselawCorrect / editingUser.caselawTotal) * 100 : 0;
                          })(),
                          fullMark: 100
                        },
                        {
                          subject: 'Quiz',
                          A: (() => {
                            const s = editingUser.stats?.find(st => st.moduleType === 'quiz');
                            if (s) return s.accuracy > 1 ? s.accuracy : s.accuracy * 100;
                            return 0;
                          })(),
                          fullMark: 100
                        },
                        {
                          subject: 'Overall',
                          A: editingUser.totalQuestions > 0 ? (editingUser.correctAnswers / editingUser.totalQuestions) * 100 : 0,
                          fullMark: 100
                        }
                      ]}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name={editingUser.name}
                          dataKey="A"
                          stroke="#2563eb"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Daily Activity Listing (Numbers Instead of Chart) */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 flex flex-col">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Activity Log (Last 7 Days)</h3>
                  {loadingReport ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  ) : reportData ? (
                    <div className="flex-1 overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black text-gray-400 uppercase border-b border-gray-200">
                            <th className="pb-3 px-2">Date</th>
                            <th className="pb-3 px-2 text-center text-green-600">Audit</th>
                            <th className="pb-3 px-2 text-center text-red-600">Tax</th>
                            <th className="pb-3 px-2 text-center text-gray-500">Case</th>
                            <th className="pb-3 px-2 text-center text-orange-600">Quiz</th>
                            <th className="pb-3 px-2 text-center text-blue-600">Drill</th>
                            <th className="pb-3 px-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {[...reportData].reverse().map((day) => (
                            <tr key={day.date} className="text-xs group hover:bg-white/50 transition-colors">
                              <td className="py-2 px-2 font-medium text-gray-600">
                                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                              </td>
                              <td className={`py-2 px-2 text-center font-bold ${day.audit > 0 ? 'text-green-600' : 'text-gray-300'}`}>{day.audit}</td>
                              <td className={`py-2 px-2 text-center font-bold ${day.tax > 0 ? 'text-red-600' : 'text-gray-300'}`}>{day.tax}</td>
                              <td className={`py-2 px-2 text-center font-bold ${day.caselaw > 0 ? 'text-gray-600' : 'text-gray-300'}`}>{day.caselaw}</td>
                              <td className={`py-2 px-2 text-center font-bold ${day.quiz > 0 ? 'text-orange-600' : 'text-gray-300'}`}>{day.quiz}</td>
                              <td className={`py-2 px-2 text-center font-bold ${day.drill > 0 ? 'text-blue-600' : 'text-gray-300'}`}>{day.drill}</td>
                              <td className="py-2 px-2 text-right font-black text-gray-900">{day.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400 italic">
                      No activity data found for this period.
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Summary Table */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="flex justify-center">
                  <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 w-full max-w-sm text-center">
                    <p className="text-xs font-bold text-blue-400 uppercase mb-2 tracking-widest">Total XP Earned</p>
                    <p className="text-5xl font-black text-blue-600">{editingUser.xp.toLocaleString()}</p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-blue-400">
                      <div className="h-[1px] flex-1 bg-blue-100"></div>
                      <span className="text-[10px] font-bold">LIFETIME ACHIEVEMENT</span>
                      <div className="h-[1px] flex-1 bg-blue-100"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-400 font-medium">
              FINOPOLY &bull; STUDENT PERFORMANCE CERTIFICATE &bull; {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;