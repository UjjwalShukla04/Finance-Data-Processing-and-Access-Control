import { useState, useEffect } from 'react';
import { financesAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const Records = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: '',
    description: '',
    notes: ''
  });
  const [error, setError] = useState('');

  const { canCreateRecords, canEditRecords, user } = useAuth();

  useEffect(() => {
    fetchRecords();
  }, [pagination.page, filters]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await financesAPI.getAll(params);
      setRecords(response.data.data.records);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingRecord) {
        await financesAPI.update(editingRecord.id, formData);
      } else {
        await financesAPI.create(formData);
      }
      setShowModal(false);
      setEditingRecord(null);
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        date: '',
        description: '',
        notes: ''
      });
      fetchRecords();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await financesAPI.delete(id);
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setFormData({
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: record.date.split('T')[0],
      description: record.description || '',
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="header">
        <h2>Financial Records</h2>
        {canCreateRecords() && (
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingRecord(null);
              setFormData({
                amount: '',
                type: 'expense',
                category: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                notes: ''
              });
              setShowModal(true);
            }}
          >
            + Add Record
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="filters">
          <div className="filter-group">
            <label>Type</label>
            <select 
              className="form-select"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <input
              type="text"
              className="form-input"
              placeholder="Filter by category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setFilters({ type: '', category: '', startDate: '', endDate: '' })}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : records.length > 0 ? (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    {canEditRecords() && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{formatDate(record.date)}</td>
                      <td>
                        <span className={`badge badge-${record.type}`}>
                          {record.type}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{record.category}</td>
                      <td>{record.description || '-'}</td>
                      <td style={{ 
                        textAlign: 'right',
                        color: record.type === 'income' ? '#00c48c' : '#ff6b6b',
                        fontWeight: '600'
                      }}>
                        {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                      </td>
                      {canEditRecords() && (
                        <td>
                          <div className="actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(record)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(record.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
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
            <p>No records found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRecord ? 'Edit Record' : 'Add Record'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., salary, food, transportation"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRecord ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
