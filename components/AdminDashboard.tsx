import React, { useState, useEffect, useMemo } from 'react';
import { getSupabaseService, Dealership, UserProfile } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';
import Button from './common/Button';
import Icon from './common/Icon';
import Modal from './common/Modal';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { userProfile } = useAuth();
  const isSoftwareOwnerAdmin = userProfile?.role === 'admin';
  const isDealershipAdmin = userProfile?.role === 'manager';

  // Only software owner admins and dealership managers can access admin panel
  if (!isSoftwareOwnerAdmin && !isDealershipAdmin) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 rounded-2xl max-w-2xl w-full p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-neutral-400 mb-6">You don't have permission to access the admin panel.</p>
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
      </div>
    );
  }

  // ==================== STATE ====================
  // Tab state
  const [activeTab, setActiveTab] = useState<'dealerships' | 'users' | 'stats'>('dealerships');
  const [dealershipActiveTab, setDealershipActiveTab] = useState<'users' | 'settings'>('users');

  // Data state
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [dealershipUsers, setDealershipUsers] = useState<UserProfile[]>([]);
  const [currentDealership, setCurrentDealership] = useState<Dealership | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter state
  const [dealershipSearch, setDealershipSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [teamMemberSearch, setTeamMemberSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'manager' | 'salesperson'>('all');

  // Sort state
  const [dealershipSort, setDealershipSort] = useState<'name' | 'created'>('name');
  const [userSort, setUserSort] = useState<'name' | 'email' | 'role'>('name');

  // Bulk operations state
  const [selectedDealerships, setSelectedDealerships] = useState<Set<string>>(new Set());
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<Set<string>>(new Set());

  // Form states
  const [showDealershipForm, setShowDealershipForm] = useState(false);
  const [editingDealership, setEditingDealership] = useState<Dealership | null>(null);
  const [dealershipName, setDealershipName] = useState('');
  const [dealershipAddress, setDealershipAddress] = useState('');
  const [dealershipPhone, setDealershipPhone] = useState('');
  const [dealershipEmail, setDealershipEmail] = useState('');
  const [dealershipErrors, setDealershipErrors] = useState<Record<string, string>>({});

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'salesperson'>('salesperson');
  const [userDealership, setUserDealership] = useState('');
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadData();
  }, [activeTab, dealershipActiveTab]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isSoftwareOwnerAdmin && activeTab === 'dealerships') {
          (document.querySelector('[data-search-dealerships]') as HTMLInputElement)?.focus();
        } else if (isSoftwareOwnerAdmin && activeTab === 'users') {
          (document.querySelector('[data-search-users]') as HTMLInputElement)?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isSoftwareOwnerAdmin]);

  // ==================== DATA FILTERING & SORTING ====================
  const filteredDealerships = useMemo(() => {
    let result = dealerships;

    if (dealershipSearch) {
      const search = dealershipSearch.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(search) ||
        d.email?.toLowerCase().includes(search) ||
        d.phone?.toLowerCase().includes(search)
      );
    }

    if (dealershipSort === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [dealerships, dealershipSearch, dealershipSort]);

  const filteredUsers = useMemo(() => {
    let result = users;

    if (userSearch) {
      const search = userSearch.toLowerCase();
      result = result.filter(u =>
        (u.full_name?.toLowerCase() || '').includes(search)
      );
    }

    if (userRoleFilter !== 'all') {
      result = result.filter(u => u.role === userRoleFilter);
    }

    if (userSort === 'name') {
      result = [...result].sort((a, b) => (a.full_name || 'Z').localeCompare(b.full_name || 'Z'));
    } else if (userSort === 'role') {
      result = [...result].sort((a, b) => a.role.localeCompare(b.role));
    }

    return result;
  }, [users, userSearch, userRoleFilter, userSort]);

  const filteredTeamMembers = useMemo(() => {
    let result = dealershipUsers;

    if (teamMemberSearch) {
      const search = teamMemberSearch.toLowerCase();
      result = result.filter(u =>
        (u.full_name?.toLowerCase() || '').includes(search) ||
        u.phone?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [dealershipUsers, teamMemberSearch]);

  // ==================== FORM VALIDATION ====================
  const validateDealershipForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!dealershipName.trim()) {
      errors.name = 'Dealership name is required';
    }
    if (dealershipEmail && !isValidEmail(dealershipEmail)) {
      errors.email = 'Invalid email format';
    }

    setDealershipErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUserForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!editingUser) {
      if (!userEmail.trim()) {
        errors.email = 'Email is required';
      } else if (!isValidEmail(userEmail)) {
        errors.email = 'Invalid email format';
      }

      if (!userPassword) {
        errors.password = 'Password is required';
      } else if (userPassword.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    if (!userFullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (userRole !== 'admin' && !userDealership) {
      errors.dealership = 'Managers and Salespersons must be assigned to a dealership';
    }

    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ==================== DATA LOADING ====================
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const supabase = getSupabaseService();

      if (isSoftwareOwnerAdmin) {
        if (activeTab === 'dealerships') {
          const data = await supabase.getDealerships();
          setDealerships(data || []);
        } else if (activeTab === 'users') {
          const data = await supabase.getUserProfiles();
          setUsers(data || []);
        }
      } else if (isDealershipAdmin) {
        if (!currentDealership && userProfile?.dealership_id) {
          const dealData = await supabase.getDealerships();
          const myDealership = dealData?.find((d) => d.id === userProfile.dealership_id);
          if (myDealership) {
            setCurrentDealership(myDealership);
          }
        }

        if (dealershipActiveTab === 'users' && currentDealership) {
          const allUsers = await supabase.getUserProfiles();
          const filtered = allUsers?.filter((u) => u.dealership_id === currentDealership.id) || [];
          setDealershipUsers(filtered);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ==================== DEALERSHIP OPERATIONS ====================
  const handleCreateDealership = async () => {
    if (!validateDealershipForm()) return;

    try {
      const supabase = getSupabaseService();
      await supabase.createDealership({
        name: dealershipName,
        address: dealershipAddress,
        phone: dealershipPhone,
        email: dealershipEmail,
        settings: {},
      });
      setShowDealershipForm(false);
      resetDealershipForm();
      setSuccessMessage('✓ Dealership created successfully!');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create dealership');
    }
  };

  const handleUpdateDealership = async () => {
    if (!editingDealership || !validateDealershipForm()) return;

    try {
      const supabase = getSupabaseService();
      await supabase.updateDealership(editingDealership.id, {
        name: dealershipName,
        address: dealershipAddress,
        phone: dealershipPhone,
        email: dealershipEmail,
      });
      setShowDealershipForm(false);
      resetDealershipForm();
      setSuccessMessage('✓ Dealership updated successfully!');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update dealership');
    }
  };

  const handleDeleteDealership = async (id: string) => {
    if (!confirm('⚠️ Are you sure? This will delete the dealership, all users, and all associated photos. This action cannot be undone.')) {
      return;
    }
    try {
      const supabase = getSupabaseService();
      await supabase.deleteDealership(id);
      setSuccessMessage('✓ Dealership deleted successfully!');
      loadData();
      setSelectedDealerships(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete dealership');
    }
  };

  const handleBulkDeleteDealerships = async () => {
    if (selectedDealerships.size === 0) return;
    if (!confirm(`⚠️ Delete ${selectedDealerships.size} dealership(s)? This action cannot be undone.`)) return;

    try {
      const supabase = getSupabaseService();
      for (const id of selectedDealerships) {
        await supabase.deleteDealership(id);
      }
      setSuccessMessage(`✓ ${selectedDealerships.size} dealership(s) deleted!`);
      setSelectedDealerships(new Set());
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete dealerships');
    }
  };

  const editDealership = (dealership: Dealership) => {
    setEditingDealership(dealership);
    setDealershipName(dealership.name);
    setDealershipAddress(dealership.address || '');
    setDealershipPhone(dealership.phone || '');
    setDealershipEmail(dealership.email || '');
    setDealershipErrors({});
    setShowDealershipForm(true);
  };

  const resetDealershipForm = () => {
    setEditingDealership(null);
    setDealershipName('');
    setDealershipAddress('');
    setDealershipPhone('');
    setDealershipEmail('');
    setDealershipErrors({});
  };

  // ==================== USER OPERATIONS ====================
  const handleCreateUser = async () => {
    if (!validateUserForm()) return;

    try {
      const supabase = getSupabaseService();
      await supabase.createUser(userEmail, userPassword, {
        full_name: userFullName,
        phone: userPhone,
        role: userRole,
        dealership_id: userDealership || undefined,
      });
      setShowUserForm(false);
      resetUserForm();
      setSuccessMessage('✓ User created successfully!');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !validateUserForm()) return;

    try {
      const supabase = getSupabaseService();
      await supabase.updateUserProfile(editingUser.id, {
        full_name: userFullName,
        phone: userPhone,
        role: userRole,
        dealership_id: userDealership || undefined,
      });
      setShowUserForm(false);
      resetUserForm();
      setSuccessMessage('✓ User updated successfully!');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('⚠️ Delete this user? Their account will be removed but photos will be preserved.')) return;

    try {
      const supabase = getSupabaseService();
      await supabase.deleteUser(userId);
      setSuccessMessage('✓ User deleted successfully!');
      loadData();
      setSelectedUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedUsers.size === 0) return;
    if (!confirm(`⚠️ Delete ${selectedUsers.size} user(s)? This action cannot be undone.`)) return;

    try {
      const supabase = getSupabaseService();
      for (const id of selectedUsers) {
        await supabase.deleteUser(id);
      }
      setSuccessMessage(`✓ ${selectedUsers.size} user(s) deleted!`);
      setSelectedUsers(new Set());
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete users');
    }
  };

  const editUser = (u: UserProfile) => {
    setEditingUser(u);
    setUserFullName(u.full_name || '');
    setUserPhone(u.phone || '');
    setUserRole(u.role);
    setUserDealership(u.dealership_id || '');
    setUserErrors({});
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
    setUserErrors({});
  };

  // ==================== EXPORT FUNCTIONALITY ====================
  const exportAsCSV = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ==================== HELPER COMPONENTS ====================
  const FormFieldWithError = ({ label, value, onChange, error, type = 'text', placeholder = '', autoFocus = false }: any) => (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 bg-neutral-800 border rounded-lg text-white focus:outline-none transition-colors ${
          error
            ? 'border-red-500/50 focus:border-red-500'
            : 'border-neutral-700 focus:border-purple-500'
        }`}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {error && <p className="text-red-400 text-sm mt-1">⚠️ {error}</p>}
    </div>
  );

  const RoleDescription = ({ role }: { role: string }) => {
    const descriptions: Record<string, string> = {
      admin: 'Full system access, manage all dealerships and users',
      manager: 'Manage team members within their dealership',
      salesperson: 'Can take and edit photos, view dealership presets',
    };
    return <span className="text-xs text-neutral-400">{descriptions[role]}</span>;
  };

  // ==================== RENDER SOFTWARE OWNER ADMIN ====================
  if (isSoftwareOwnerAdmin) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900/95 backdrop-blur-sm z-10">
            <div>
              <h2 className="text-2xl font-bold text-white">🔐 Software Owner Admin</h2>
              <p className="text-sm text-neutral-400 mt-1">Manage all dealerships and users across the platform</p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors p-2 hover:bg-neutral-800 rounded-lg"
              title="Close (Esc)"
            >
              <Icon name="close" size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-neutral-800 px-6 overflow-x-auto">
            {[
              { id: 'dealerships', label: '🏢 Dealerships', count: dealerships.length },
              { id: 'users', label: '👥 Users', count: users.length },
              { id: 'stats', label: '📊 Statistics', count: null }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
                {tab.count !== null && <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="px-6 pt-6">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-start gap-3 animate-in fade-in">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 flex items-start gap-3 animate-in fade-in">
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Dealerships Tab */}
            {activeTab === 'dealerships' && (
              <div>
                {/* Search & Controls */}
                <div className="mb-6 space-y-4">
                  <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[250px]">
                      <label className="block text-sm text-neutral-400 mb-2">🔍 Search dealerships (Cmd+K)</label>
                      <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={dealershipSearch}
                        onChange={(e) => setDealershipSearch(e.target.value)}
                        data-search-dealerships
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <select
                      value={dealershipSort}
                      onChange={(e) => setDealershipSort(e.target.value as any)}
                      className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="name">Sort: Name</option>
                      <option value="created">Sort: Created</option>
                    </select>
                    <Button onClick={() => { resetDealershipForm(); setShowDealershipForm(true); }} variant="primary" size="sm">
                      + New Dealership
                    </Button>
                    {selectedDealerships.size > 0 && (
                      <Button onClick={handleBulkDeleteDealerships} variant="primary" size="sm" className="bg-red-600 hover:bg-red-700">
                        🗑️ Delete {selectedDealerships.size}
                      </Button>
                    )}
                  </div>
                  {selectedDealerships.size > 0 && (
                    <p className="text-sm text-neutral-400">{selectedDealerships.size} dealership(s) selected</p>
                  )}
                </div>

                {loading ? (
                  <div className="text-center text-neutral-400 py-12">⏳ Loading...</div>
                ) : filteredDealerships.length === 0 ? (
                  <div className="text-center text-neutral-400 py-12 bg-neutral-800/30 rounded-lg p-12">
                    <p className="text-lg mb-4">
                      {dealershipSearch ? '🔍 No dealerships found' : '🏢 No dealerships yet'}
                    </p>
                    <p className="text-sm mb-6">
                      {dealershipSearch
                        ? 'Try adjusting your search criteria'
                        : 'Create your first dealership to get started'}
                    </p>
                    {!dealershipSearch && (
                      <Button
                        onClick={() => { resetDealershipForm(); setShowDealershipForm(true); }}
                        variant="primary"
                      >
                        + Create First Dealership
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredDealerships.map((dealership) => (
                      <div
                        key={dealership.id}
                        className="bg-neutral-800 rounded-lg p-5 hover:bg-neutral-750 transition-colors border border-neutral-700 flex items-start justify-between group"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedDealerships.has(dealership.id)}
                            onChange={(e) => {
                              setSelectedDealerships(prev => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(dealership.id);
                                else next.delete(dealership.id);
                                return next;
                              });
                            }}
                            className="mt-1.5 w-4 h-4 cursor-pointer"
                          />
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-2">{dealership.name}</h4>
                            <div className="space-y-1 text-sm text-neutral-400">
                              {dealership.address && <p>📍 {dealership.address}</p>}
                              {dealership.phone && <p>📞 {dealership.phone}</p>}
                              {dealership.email && <p>✉️ {dealership.email}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => editDealership(dealership)}
                            className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors text-sm font-medium whitespace-nowrap"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDealership(dealership.id)}
                            className="px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors text-sm font-medium whitespace-nowrap"
                          >
                            🗑️ Delete
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
                {/* Search & Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[250px]">
                      <label className="block text-sm text-neutral-400 mb-2">🔍 Search users (Cmd+K)</label>
                      <input
                        type="text"
                        placeholder="Search by name..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        data-search-users
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value as any)}
                      className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin Only</option>
                      <option value="manager">Managers Only</option>
                      <option value="salesperson">Salespersons Only</option>
                    </select>
                    <select
                      value={userSort}
                      onChange={(e) => setUserSort(e.target.value as any)}
                      className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="name">Sort: Name</option>
                      <option value="role">Sort: Role</option>
                    </select>
                    <Button onClick={() => { resetUserForm(); setShowUserForm(true); }} variant="primary" size="sm">
                      + New User
                    </Button>
                    {selectedUsers.size > 0 && (
                      <Button onClick={handleBulkDeleteUsers} variant="primary" size="sm" className="bg-red-600 hover:bg-red-700">
                        🗑️ Delete {selectedUsers.size}
                      </Button>
                    )}
                  </div>
                  {selectedUsers.size > 0 && (
                    <p className="text-sm text-neutral-400">{selectedUsers.size} user(s) selected</p>
                  )}
                </div>

                {loading ? (
                  <div className="text-center text-neutral-400 py-12">⏳ Loading...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center text-neutral-400 py-12 bg-neutral-800/30 rounded-lg p-12">
                    <p className="text-lg mb-4">
                      {userSearch || userRoleFilter !== 'all' ? '🔍 No users found' : '👥 No users yet'}
                    </p>
                    <p className="text-sm mb-6">
                      {userSearch || userRoleFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first user to get started'}
                    </p>
                    {!userSearch && userRoleFilter === 'all' && (
                      <Button
                        onClick={() => { resetUserForm(); setShowUserForm(true); }}
                        variant="primary"
                      >
                        + Create First User
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className="bg-neutral-800 rounded-lg p-5 hover:bg-neutral-750 transition-colors border border-neutral-700 flex items-start justify-between group"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(u.id)}
                            onChange={(e) => {
                              setSelectedUsers(prev => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(u.id);
                                else next.delete(u.id);
                                return next;
                              });
                            }}
                            className="mt-1.5 w-4 h-4 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold mb-2">{u.full_name || 'Unnamed User'}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                                  u.role === 'admin'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : u.role === 'manager'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-green-500/20 text-green-400'
                                }`}
                              >
                                {u.role}
                              </span>
                              {u.phone && <span className="text-neutral-400">📞 {u.phone}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() => editUser(u)}
                            className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors text-sm font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors text-sm font-medium"
                          >
                            🗑️ Delete
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
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">📊 System Overview</h3>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-6 border border-purple-500/20">
                    <div className="text-4xl font-bold text-purple-400 mb-2">{dealerships.length}</div>
                    <div className="text-neutral-400 text-sm">Total Dealerships</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-6 border border-blue-500/20">
                    <div className="text-4xl font-bold text-blue-400 mb-2">{users.length}</div>
                    <div className="text-neutral-400 text-sm">Total Users</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-lg p-6 border border-red-500/20">
                    <div className="text-4xl font-bold text-red-400 mb-2">
                      {users.filter((u) => u.role === 'admin').length}
                    </div>
                    <div className="text-neutral-400 text-sm">Software Admins</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-6 border border-green-500/20">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      {users.filter((u) => u.role === 'manager').length}
                    </div>
                    <div className="text-neutral-400 text-sm">Dealership Managers</div>
                  </div>
                </div>

                {/* Distribution */}
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  <h4 className="text-white font-semibold mb-6">User Distribution</h4>
                  <div className="space-y-6">
                    {[
                      { role: 'Salespersons', color: 'bg-green-500', count: users.filter(u => u.role === 'salesperson').length },
                      { role: 'Managers', color: 'bg-blue-500', count: users.filter(u => u.role === 'manager').length },
                      { role: 'Admins', color: 'bg-purple-500', count: users.filter(u => u.role === 'admin').length },
                    ].map(item => (
                      <div key={item.role}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-neutral-400">{item.role}</span>
                          <span className="text-white font-semibold">
                            {item.count} ({users.length > 0 ? Math.round((item.count / users.length) * 100) : 0}%)
                          </span>
                        </div>
                        <div className="w-full bg-neutral-700 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`${item.color} h-full rounded-full transition-all duration-500`}
                            style={{
                              width: `${users.length > 0 ? (item.count / users.length) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
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
              title={editingDealership ? '✏️ Edit Dealership' : '➕ Create New Dealership'}
            >
              <div className="space-y-5">
                <FormFieldWithError
                  label="Dealership Name *"
                  value={dealershipName}
                  onChange={(e: any) => setDealershipName(e.target.value)}
                  error={dealershipErrors.name}
                  placeholder="ABC Motors"
                  autoFocus
                />
                <FormFieldWithError
                  label="Address"
                  value={dealershipAddress}
                  onChange={(e: any) => setDealershipAddress(e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                />
                <FormFieldWithError
                  label="Phone"
                  value={dealershipPhone}
                  onChange={(e: any) => setDealershipPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  type="tel"
                />
                <FormFieldWithError
                  label="Email"
                  value={dealershipEmail}
                  onChange={(e: any) => setDealershipEmail(e.target.value)}
                  error={dealershipErrors.email}
                  placeholder="contact@abcmotors.com"
                  type="email"
                />
                <div className="flex gap-3 pt-6">
                  <Button
                    onClick={editingDealership ? handleUpdateDealership : handleCreateDealership}
                    variant="primary"
                    disabled={!dealershipName}
                    className="flex-1"
                  >
                    {editingDealership ? '💾 Update' : '➕ Create'} Dealership
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
              title={editingUser ? '✏️ Edit User' : '➕ Create New User'}
            >
              <div className="space-y-5">
                {!editingUser && (
                  <>
                    <FormFieldWithError
                      label="Email *"
                      value={userEmail}
                      onChange={(e: any) => setUserEmail(e.target.value)}
                      error={userErrors.email}
                      placeholder="user@dealership.com"
                      type="email"
                      autoFocus
                    />
                    <FormFieldWithError
                      label="Password *"
                      value={userPassword}
                      onChange={(e: any) => setUserPassword(e.target.value)}
                      error={userErrors.password}
                      placeholder="Minimum 6 characters"
                      type="password"
                    />
                  </>
                )}
                <FormFieldWithError
                  label="Full Name *"
                  value={userFullName}
                  onChange={(e: any) => setUserFullName(e.target.value)}
                  error={userErrors.fullName}
                  placeholder="John Doe"
                />
                <FormFieldWithError
                  label="Phone"
                  value={userPhone}
                  onChange={(e: any) => setUserPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  type="tel"
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Role *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="salesperson">Salesperson</option>
                    <option value="manager">Dealership Manager</option>
                    <option value="admin">Software Admin</option>
                  </select>
                  <RoleDescription role={userRole} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Dealership {userRole !== 'admin' && '*'}
                  </label>
                  <select
                    value={userDealership}
                    onChange={(e) => setUserDealership(e.target.value)}
                    className={`w-full px-4 py-2 bg-neutral-800 border rounded-lg text-white focus:outline-none transition-colors ${
                      userErrors.dealership
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-neutral-700 focus:border-purple-500'
                    }`}
                  >
                    <option value="">
                      {userRole === 'admin' ? 'Optional - No dealership' : 'Select a dealership'}
                    </option>
                    {dealerships.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {userErrors.dealership && <p className="text-red-400 text-sm mt-1">⚠️ {userErrors.dealership}</p>}
                </div>
                <div className="flex gap-3 pt-6">
                  <Button
                    onClick={editingUser ? handleUpdateUser : handleCreateUser}
                    variant="primary"
                    disabled={!editingUser && (!userEmail || !userPassword || !userFullName)}
                    className="flex-1"
                  >
                    {editingUser ? '💾 Update' : '➕ Create'} User
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

  // ==================== RENDER DEALERSHIP ADMIN ====================
  if (isDealershipAdmin) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900/95 backdrop-blur-sm z-10">
            <div>
              <h2 className="text-2xl font-bold text-white">🏢 Dealership Manager</h2>
              <p className="text-sm text-neutral-400 mt-1">
                Manage your team at {currentDealership?.name || 'loading...'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors p-2 hover:bg-neutral-800 rounded-lg"
            >
              <Icon name="close" size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-neutral-800 px-6">
            {[
              { id: 'users', label: '👥 Team Members', count: dealershipUsers.length },
              { id: 'settings', label: '⚙️ Settings', count: null }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDealershipActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  dealershipActiveTab === tab.id
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
                {tab.count !== null && <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="px-6 pt-6">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-start gap-3">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 flex items-start gap-3">
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Team Members Tab */}
            {dealershipActiveTab === 'users' && (
              <div>
                {/* Search & Controls */}
                <div className="mb-6 space-y-4">
                  <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[250px]">
                      <label className="block text-sm text-neutral-400 mb-2">🔍 Search team members</label>
                      <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={teamMemberSearch}
                        onChange={(e) => setTeamMemberSearch(e.target.value)}
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <Button onClick={() => { resetUserForm(); setUserDealership(userProfile?.dealership_id || ''); setShowUserForm(true); }} variant="primary" size="sm">
                      + Add Member
                    </Button>
                    {selectedTeamMembers.size > 0 && (
                      <Button onClick={async () => {
                        if (!confirm(`Delete ${selectedTeamMembers.size} member(s)?`)) return;
                        try {
                          const supabase = getSupabaseService();
                          for (const id of selectedTeamMembers) {
                            await supabase.deleteUser(id);
                          }
                          setSuccessMessage(`✓ ${selectedTeamMembers.size} member(s) removed!`);
                          setSelectedTeamMembers(new Set());
                          loadData();
                        } catch (err: any) {
                          setError(err.message || 'Failed to remove members');
                        }
                      }} variant="primary" size="sm" className="bg-red-600 hover:bg-red-700">
                        🗑️ Remove {selectedTeamMembers.size}
                      </Button>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center text-neutral-400 py-12">⏳ Loading...</div>
                ) : filteredTeamMembers.length === 0 ? (
                  <div className="text-center text-neutral-400 py-12 bg-neutral-800/30 rounded-lg p-12">
                    <p className="text-lg mb-4">
                      {teamMemberSearch ? '🔍 No team members found' : '👥 No team members yet'}
                    </p>
                    <p className="text-sm mb-6">
                      {teamMemberSearch
                        ? 'Try adjusting your search'
                        : 'Add your first team member to get started'}
                    </p>
                    {!teamMemberSearch && (
                      <Button
                        onClick={() => { resetUserForm(); setUserDealership(userProfile?.dealership_id || ''); setShowUserForm(true); }}
                        variant="primary"
                      >
                        + Add First Member
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredTeamMembers.map((u) => (
                      <div
                        key={u.id}
                        className="bg-neutral-800 rounded-lg p-5 hover:bg-neutral-750 transition-colors border border-neutral-700 flex items-start justify-between group"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedTeamMembers.has(u.id)}
                            onChange={(e) => {
                              setSelectedTeamMembers(prev => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(u.id);
                                else next.delete(u.id);
                                return next;
                              });
                            }}
                            className="mt-1.5 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <h4 className="text-white font-semibold mb-2">{u.full_name || 'Unnamed Member'}</h4>
                            <div className="flex items-center gap-3 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full font-medium ${
                                  u.role === 'manager'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-green-500/20 text-green-400'
                                }`}
                              >
                                {u.role === 'manager' ? '⭐ Co-Manager' : 'Salesperson'}
                              </span>
                              {u.phone && <span className="text-neutral-400">📞 {u.phone}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() => editUser(u)}
                            className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors text-sm font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors text-sm font-medium"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {dealershipActiveTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Dealership Information</h3>
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 space-y-5">
                  {currentDealership ? (
                    <>
                      <div>
                        <label className="block text-sm text-neutral-400 mb-1">Name</label>
                        <p className="text-white font-medium text-lg">{currentDealership.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-400 mb-1">Address</label>
                        <p className="text-white font-medium">{currentDealership.address || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-400 mb-1">Phone</label>
                        <p className="text-white font-medium">{currentDealership.phone || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-400 mb-1">Email</label>
                        <p className="text-white font-medium">{currentDealership.email || '—'}</p>
                      </div>
                      <div className="pt-4 border-t border-neutral-700">
                        <p className="text-xs text-neutral-500">
                          💡 To edit dealership information, contact the software owner administrator.
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-neutral-400">⏳ Loading dealership information...</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Form Modal */}
          {showUserForm && (
            <Modal
              isOpen={showUserForm}
              onClose={() => {
                setShowUserForm(false);
                resetUserForm();
              }}
              title={editingUser ? '✏️ Edit Team Member' : '➕ Add Team Member'}
            >
              <div className="space-y-5">
                {!editingUser && (
                  <>
                    <FormFieldWithError
                      label="Email *"
                      value={userEmail}
                      onChange={(e: any) => setUserEmail(e.target.value)}
                      error={userErrors.email}
                      placeholder="user@dealership.com"
                      type="email"
                      autoFocus
                    />
                    <FormFieldWithError
                      label="Password *"
                      value={userPassword}
                      onChange={(e: any) => setUserPassword(e.target.value)}
                      error={userErrors.password}
                      placeholder="Minimum 6 characters"
                      type="password"
                    />
                  </>
                )}
                <FormFieldWithError
                  label="Full Name *"
                  value={userFullName}
                  onChange={(e: any) => setUserFullName(e.target.value)}
                  error={userErrors.fullName}
                  placeholder="John Doe"
                />
                <FormFieldWithError
                  label="Phone"
                  value={userPhone}
                  onChange={(e: any) => setUserPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  type="tel"
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Role *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="salesperson">Salesperson</option>
                    <option value="manager">Co-Manager</option>
                  </select>
                  <RoleDescription role={userRole === 'manager' ? 'manager' : 'salesperson'} />
                </div>
                <div className="flex gap-3 pt-6">
                  <Button
                    onClick={editingUser ? handleUpdateUser : handleCreateUser}
                    variant="primary"
                    disabled={!editingUser && (!userEmail || !userPassword || !userFullName)}
                    className="flex-1"
                  >
                    {editingUser ? '💾 Update' : '➕ Add'} Member
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

  return null;
}
