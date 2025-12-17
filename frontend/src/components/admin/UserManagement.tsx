import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download, 
  UserPlus,
  Mail,
  Shield,
  Award,
  Target,
  Calendar,
  MoreVertical,
  Eye,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Partner';
  status: 'Active' | 'Inactive';
  joinDate: string;
  lastActive: string;
  totalXP: number;
  completedSimulations: number;
  currentLevel: number;
  badges: number;
  progress: {
    audit: number;
    tax: number;
    caselaw: number;
  };
}

const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Student' | 'Partner'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@email.com',
      role: 'Student',
      status: 'Active',
      joinDate: '2024-01-15',
      lastActive: '2024-01-28',
      totalXP: 2450,
      completedSimulations: 28,
      currentLevel: 5,
      badges: 3,
      progress: { audit: 85, tax: 78, caselaw: 92 }
    },
    {
      id: '2',
      name: 'Priya Patel',
      email: 'priya.patel@email.com',
      role: 'Student',
      status: 'Active',
      joinDate: '2024-01-10',
      lastActive: '2024-01-28',
      totalXP: 3200,
      completedSimulations: 35,
      currentLevel: 7,
      badges: 5,
      progress: { audit: 92, tax: 88, caselaw: 95 }
    },
    {
      id: '3',
      name: 'Dr. Amit Kumar',
      email: 'amit.kumar@firm.com',
      role: 'Partner',
      status: 'Active',
      joinDate: '2024-01-05',
      lastActive: '2024-01-27',
      totalXP: 1800,
      completedSimulations: 15,
      currentLevel: 4,
      badges: 2,
      progress: { audit: 95, tax: 90, caselaw: 88 }
    },
    {
      id: '4',
      name: 'Sneha Gupta',
      email: 'sneha.gupta@email.com',
      role: 'Student',
      status: 'Inactive',
      joinDate: '2024-01-20',
      lastActive: '2024-01-25',
      totalXP: 1200,
      completedSimulations: 12,
      currentLevel: 3,
      badges: 1,
      progress: { audit: 70, tax: 65, caselaw: 75 }
    },
    {
      id: '5',
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      role: 'Student',
      status: 'Active',
      joinDate: '2024-01-12',
      lastActive: '2024-01-28',
      totalXP: 2100,
      completedSimulations: 22,
      currentLevel: 4,
      badges: 4,
      progress: { audit: 80, tax: 85, caselaw: 78 }
    }
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    );
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleExportUsers = () => {
    // In a real app, this would generate and download a CSV/Excel file
    console.log('Exporting users:', filteredUsers);
    alert('User data exported successfully!');
  };

  const getStatusBadge = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getRoleBadge = (role: string) => {
    return role === 'Student' 
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
              onClick={() => setShowUserModal(true)}
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
                <p className="text-3xl font-bold text-gray-900">{mockUsers.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{mockUsers.filter(u => u.status === 'Active').length}</p>
              </div>
              <Shield className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Students</p>
                <p className="text-3xl font-bold text-gray-900">{mockUsers.filter(u => u.role === 'Student').length}</p>
              </div>
              <Target className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Partners</p>
                <p className="text-3xl font-bold text-gray-900">{mockUsers.filter(u => u.role === 'Partner').length}</p>
              </div>
              <Award className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
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
                </select>
              </div>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 bg-white text-sm font-medium"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
              Users ({filteredUsers.length})
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
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
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
              {filteredUsers.map((user) => (
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
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{user.name}</div>
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
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-12 text-gray-500">Audit:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${user.progress.audit}%` }}
                          />
                        </div>
                        <span className="w-8 text-gray-700 font-medium">{user.progress.audit}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-12 text-gray-500">Tax:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${user.progress.tax}%` }}
                          />
                        </div>
                        <span className="w-8 text-gray-700 font-medium">{user.progress.tax}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-12 text-gray-500">Law:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${user.progress.caselaw}%` }}
                          />
                        </div>
                        <span className="w-8 text-gray-700 font-medium">{user.progress.caselaw}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-bold text-gray-900">{user.totalXP.toLocaleString()}</div>
                      <div className="text-gray-500">Level {user.currentLevel}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-all ${
                          user.status === 'Active' 
                            ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                        title={user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      >
                        {user.status === 'Active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-all"
                        title="More Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={editingUser?.name || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue={editingUser?.email || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    defaultValue={editingUser?.role || 'Student'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="Student">Student</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    defaultValue={editingUser?.status || 'Active'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter password"
                  />
                </div>
              )}

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
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;