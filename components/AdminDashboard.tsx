import React, { useState, useEffect } from 'react';
import { getSupabaseService, Dealership, UserProfile } from '../services/supabaseService';
import Button from './common/Button';
import Icon from './common/Icon';
import Modal from './common/Modal';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dealerships' | 'users' | 'stats'>('dealerships');
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dealership form
  const [showDealershipForm, setShowDealershipForm] = useState(false);
  const [editingDealership, setEditingDealership] = useState<Dealership | null>(null);
  const [dealershipName, setDealershipName] = useState('');
  const [dealershipAddress, setDealershipAddress] = useState('');
  const [dealershipPhone, setDealershipPhone] = useState('');
  const [dealershipEmail, setDealershipEmail] = useState('');
  
  // User form
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'salesperson'>('salesperson');
  const [userDealership, setUserDealership] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const supabase = getSupabaseService();
      
      if (activeTab === 'dealerships') {
        const data = await supabase.getDealerships();
        setDealerships(data || []);
      } else if (activeTab === 'users') {
        const data = await supabase.getUserProfiles();
        setUsers(data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Dealership CRUD
  const handleCreateDealership = async () => {
    try {
      const supabase = getSupabaseService();
      await supabase.createDealership({
        name: dealershipName,
        address: dealershipAddress,
        phone: dealershipPhone,
        email: dealershipEmail,
        settings: {}
      });
      setShowDealershipForm(false);
      resetDealershipForm();
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateDealership = async () => {
    if (!editingDealership) return;
    try {
      const supabase = getSupabaseService();
      await supabase.updateDealership(editingDealership.id, {
        name: dealershipName,
        address: dealershipAddress,
        phone: dealershipPhone,
        email: dealershipEmail
      });
      setShowDealershipForm(false);
      resetDealershipForm();
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteDealership = async (id: string) => {
    if (!confirm('Are you sure? This will remove all users and photos from this dealership.')) return;
    try {
      const supabase = getSupabaseService();
      await supabase.deleteDealership(id);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const editDealership = (dealership: Dealership) => {
    setEditingDealership(dealership);
    setDealershipName(dealership.name);
    setDealershipAddress(dealership.address || '');
    setDealershipPhone(dealership.phone || '');
    setDealershipEmail(dealership.email || '');
    setShowDealershipForm(true);
  };

  const resetDealershipForm = () => {
    setEditingDealership(null);
    setDealershipName('');
    setDealershipAddress('');
    setDealershipPhone('');
    setDealershipEmail('');
  };

  // User CRUD
  const handleCreateUser = async () => {
    try {
      const supabase = getSupabaseService();
      await supabase.createUser(userEmail, userPassword, {
        full_name: userFullName,
        phone: userPhone,
        role: userRole,
        dealership_id: userDealership || undefined
      });
      setShowUserForm(false);
      resetUserForm();
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const supabase = getSupabaseService();
      await supabase.updateUserProfile(editingUser.id, {
        full_name: userFullName,
        phone: userPhone,
        role: userRole,
        dealership_id: userDealership || undefined
      });
      setShowUserForm(false);
      resetUserForm();
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This will permanently delete this user and all their data.')) return;
    try {
      const supabase = getSupabaseService();
      await supabase.deleteUser(userId);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const editUser = (user: UserProfile) => {
    setEditingUser(user);
    setUserFullName(user.full_name || '');
    setUserPhone(user.phone || '');
    setUserRole(user.role);
    setUserDealership(user.dealership_id || '');
    setShowUserForm(true);
  };

  const resetUserForm = () => {
    setEditingUser(null);
    setUserEmail('');
    setUserPassword('');
    setUserFullName('');
    setUserPhone('');
    setUserRole('salesperson');
    setUserDealership('');
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">🔒 Admin Dashboard</h2>
            <p className="text-sm text-neutral-400 mt-1">Manage dealerships and users</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
            title="Close"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 px-6">
          <button
            onClick={() => setActiveTab('dealerships')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'dealerships'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            🏢 Dealerships
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            📊 Statistics
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Dealerships Tab */}
          {activeTab === 'dealerships' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Dealerships ({dealerships.length})</h3>
                <Button
                  onClick={() => {
                    resetDealershipForm();
                    setShowDealershipForm(true);
                  }}
                  variant="primary"
                  size="sm"
                >
                  + Add Dealership
                </Button>
              </div>

              {loading ? (
                <div className="text-center text-neutral-400 py-12">Loading...</div>
              ) : dealerships.length === 0 ? (
                <div className="text-center text-neutral-400 py-12">
                  No dealerships yet. Create your first one!
                </div>
              ) : (
                <div className="grid gap-4">
                  {dealerships.map((dealership) => (
                    <div
                      key={dealership.id}
                      className="bg-neutral-800 rounded-lg p-4 flex items-start justify-between hover:bg-neutral-750 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{dealership.name}</h4>
                        {dealership.address && (
                          <p className="text-sm text-neutral-400">📍 {dealership.address}</p>
                        )}
                        {dealership.phone && (
                          <p className="text-sm text-neutral-400">📞 {dealership.phone}</p>
                        )}
                        {dealership.email && (
                          <p className="text-sm text-neutral-400">✉️ {dealership.email}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editDealership(dealership)}
                          className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDealership(dealership.id)}
                          className="px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Users ({users.length})</h3>
                <Button
                  onClick={() => {
                    resetUserForm();
                    setShowUserForm(true);
                  }}
                  variant="primary"
                  size="sm"
                >
                  + Add User
                </Button>
              </div>

              {loading ? (
                <div className="text-center text-neutral-400 py-12">Loading...</div>
              ) : users.length === 0 ? (
                <div className="text-center text-neutral-400 py-12">
                  No users yet. Create your first one!
                </div>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-neutral-800 rounded-lg p-4 flex items-start justify-between hover:bg-neutral-750 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{user.full_name || 'Unnamed User'}</h4>
                        <div className="flex gap-3 text-sm text-neutral-400">
                          <span className={`px-2 py-1 rounded ${
                            user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                            user.role === 'manager' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {user.role}
                          </span>
                          {user.phone && <span>📞 {user.phone}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editUser(user)}
                          className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-800 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">{dealerships.length}</div>
                <div className="text-neutral-400 text-sm">Total Dealerships</div>
              </div>
              <div className="bg-neutral-800 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">{users.length}</div>
                <div className="text-neutral-400 text-sm">Total Users</div>
              </div>
              <div className="bg-neutral-800 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-neutral-400 text-sm">Admins</div>
              </div>
            </div>
          )}
        </div>

        {/* Dealership Form Modal */}
        {showDealershipForm && (
          <Modal
            isOpen={showDealershipForm}
            onClose={() => {
              setShowDealershipForm(false);
              resetDealershipForm();
            }}
            title={editingDealership ? 'Edit Dealership' : 'Create Dealership'}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Dealership Name *
                </label>
                <input
                  type="text"
                  value={dealershipName}
                  onChange={(e) => setDealershipName(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                  placeholder="ABC Motors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={dealershipAddress}
                  onChange={(e) => setDealershipAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                  placeholder="123 Main St, City, State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={dealershipPhone}
                  onChange={(e) => setDealershipPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={dealershipEmail}
                  onChange={(e) => setDealershipEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                  placeholder="contact@abcmotors.com"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={editingDealership ? handleUpdateDealership : handleCreateDealership}
                  variant="primary"
                  disabled={!dealershipName}
                  className="flex-1"
                >
                  {editingDealership ? 'Update' : 'Create'} Dealership
                </Button>
                <Button
                  onClick={() => {
                    setShowDealershipForm(false);
                    resetDealershipForm();
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* User Form Modal */}
        {showUserForm && (
          <Modal
            isOpen={showUserForm}
            onClose={() => {
              setShowUserForm(false);
              resetUserForm();
            }}
            title={editingUser ? 'Edit User' : 'Create User'}
          >
            <div className="space-y-4">
              {!editingUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                      placeholder="user@dealership.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Role *
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                >
                  <option value="salesperson">Salesperson</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Dealership
                </label>
                <select
                  value={userDealership}
                  onChange={(e) => setUserDealership(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white"
                >
                  <option value="">No Dealership</option>
                  {dealerships.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={editingUser ? handleUpdateUser : handleCreateUser}
                  variant="primary"
                  disabled={!editingUser && (!userEmail || !userPassword)}
                  className="flex-1"
                >
                  {editingUser ? 'Update' : 'Create'} User
                </Button>
                <Button
                  onClick={() => {
                    setShowUserForm(false);
                    resetUserForm();
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
