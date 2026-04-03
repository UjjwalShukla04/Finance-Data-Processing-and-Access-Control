import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [categorySummary, setCategorySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const { user, isAnalyst } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, activityRes] = await Promise.all([
        dashboardAPI.getSummary({ period }),
        dashboardAPI.getRecentActivity({ limit: 10 })
      ]);

      setSummary(summaryRes.data.data);
      setRecentActivity(activityRes.data.data);

      if (isAnalyst()) {
        const categoryRes = await dashboardAPI.getCategorySummary({ period });
        setCategorySummary(categoryRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h2>Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            className="form-select" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-grid">
          <div className="summary-card income">
            <div className="summary-label">Total Income</div>
            <div className="summary-value">{formatCurrency(summary.totalIncome)}</div>
            <div style={{ marginTop: '10px', color: '#8892a6', fontSize: '0.9rem' }}>
              {summary.incomeCount} transactions
            </div>
          </div>
          <div className="summary-card expense">
            <div className="summary-label">Total Expenses</div>
            <div className="summary-value">{formatCurrency(summary.totalExpense)}</div>
            <div style={{ marginTop: '10px', color: '#8892a6', fontSize: '0.9rem' }}>
              {summary.expenseCount} transactions
            </div>
          </div>
          <div className="summary-card balance">
            <div className="summary-label">Net Balance</div>
            <div className="summary-value" style={{ 
              color: summary.netBalance >= 0 ? '#00c48c' : '#ff6b6b' 
            }}>
              {formatCurrency(summary.netBalance)}
            </div>
            <div style={{ marginTop: '10px', color: '#8892a6', fontSize: '0.9rem' }}>
              {summary.totalRecords} total records
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isAnalyst() ? '2fr 1fr' : '1fr', gap: '20px' }}>
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          {recentActivity.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((record) => (
                    <tr key={record.id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{record.description || '-'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{record.category}</td>
                      <td>
                        <span className={`badge badge-${record.type}`}>
                          {record.type}
                        </span>
                      </td>
                      <td style={{ 
                        textAlign: 'right',
                        color: record.type === 'income' ? '#00c48c' : '#ff6b6b',
                        fontWeight: '600'
                      }}>
                        {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent activity</p>
            </div>
          )}
        </div>

        {/* Category Summary - Only for Analyst and Admin */}
        {isAnalyst() && categorySummary && (
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '20px' }}>By Category</h3>
            
            {categorySummary.income.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#8892a6', marginBottom: '10px' }}>Income</h4>
                {categorySummary.income.map((cat, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ textTransform: 'capitalize' }}>{cat.category}</span>
                    <span style={{ fontWeight: '600', color: '#00c48c' }}>{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {categorySummary.expense.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#8892a6', marginBottom: '10px' }}>Expenses</h4>
                {categorySummary.expense.map((cat, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ textTransform: 'capitalize' }}>{cat.category}</span>
                    <span style={{ fontWeight: '600', color: '#ff6b6b' }}>{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
