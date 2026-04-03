import { useState, useEffect } from 'react';
import { usersAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
    status: 'active'
  });
  const [error, setError] = useState('');

  const { canManageUsers } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll({
        page: pagination.page,
        limit: pagination.limit
      });
      setUsers(response.data.data.users);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await usersAPI.update(editingUser.id, updateData);
      } else {
        await usersAPI.create(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'viewer',
        status: 'active'
      });
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await usersAPI.toggleStatus(id);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await usersAPI.delete(id);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!canManageUsers()) {
    return (
      <div className="card">
        <div className="empty-state">
          <h3>Access Denied</h3>
          <p>You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h2>User Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingUser(null);
            setFormData({
              name: '',
              email: '',
              password: '',
              role: 'viewer',
              status: 'active'
            });
            setShowModal(true);
          }}
        >
          + Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="badge" style={{ 
                          background: user.role === 'admin' ? 'rgba(79, 172, 254, 0.1)' : 
                                     user.role === 'analyst' ? 'rgba(0, 196, 140, 0.1)' : 
                                     'rgba(136, 146, 166, 0.1)',
                          color: user.role === 'admin' ? '#4facfe' : 
                                 user.role === 'analyst' ? '#00c48c' : '#8892a6',
                          textTransform: 'capitalize'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(user)}>
                            Edit
                          </button>
                          <button 
                            className={`btn btn-sm ${user.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
                            onClick={() => handleToggleStatus(user.id)}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button 
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>
                <span style={{ padding: '8px 15px' }}>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button 
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="viewer">Viewer</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {editingUser && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
