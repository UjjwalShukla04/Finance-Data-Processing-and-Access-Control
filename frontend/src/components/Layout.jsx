import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, canManageUsers, canCreateRecords, isAnalyst } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/records', label: 'Records', icon: '💳' },
    ...(isAnalyst() ? [{ path: '/users', label: 'Users', icon: '👥' }] : [])
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>💰 Finance</h1>
          <p>Dashboard</p>
        </div>

        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content">
        <div className="header">
          <div></div>
          <div className="user-info">
            <span className="user-badge">{user?.role}</span>
            <span>{user?.name}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
