import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Laptop, AppWindow, ArrowLeftRight, Shield, User } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import EmployeePicker from './EmployeePicker';

const hrNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/people', icon: Users, label: 'People' },
  { to: '/devices', icon: Laptop, label: 'Devices' },
  { to: '/apps', icon: AppWindow, label: 'Apps' },
];

const employeeNavItems = [
  { to: '/my-dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
  { to: '/my-apps', icon: AppWindow, label: 'My Apps' },
  { to: '/my-devices', icon: Laptop, label: 'My Devices' },
];

export default function Layout() {
  const { role, selectedEmployee, showEmployeePicker, switchToHR, openEmployeePicker } = useRole();
  const navigate = useNavigate();

  const navItems = role === 'hr' ? hrNavItems : employeeNavItems;

  // Redirect when role changes
  useEffect(() => {
    if (role === 'hr') {
      navigate('/');
    } else if (role === 'employee' && selectedEmployee) {
      navigate('/my-dashboard');
    }
  }, [role, selectedEmployee]);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
            <polygon points="16,8 22,11.5 22,18.5 16,22 10,18.5 10,11.5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="16" cy="15" r="3" fill="#92400e" />
          </svg>
          <h1>Hive Engine</h1>
        </div>

        {/* Role indicator */}
        <div className="role-indicator">
          <div className="role-indicator-icon">
            {role === 'hr' ? <Shield size={16} /> : <User size={16} />}
          </div>
          <div className="role-indicator-text">
            <span className="role-indicator-label">
              {role === 'hr' ? 'HR Dashboard' : 'Employee View'}
            </span>
            {role === 'employee' && selectedEmployee && (
              <span className="role-indicator-name">{selectedEmployee.fullName}</span>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/' || to === '/my-dashboard'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Role Switcher */}
        <div className="role-switcher">
          {role === 'hr' ? (
            <button className="role-switch-btn" onClick={openEmployeePicker}>
              <ArrowLeftRight size={16} />
              Switch to Employee View
            </button>
          ) : (
            <button className="role-switch-btn" onClick={switchToHR}>
              <ArrowLeftRight size={16} />
              Switch to HR Dashboard
            </button>
          )}
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>

      {showEmployeePicker && <EmployeePicker />}
    </div>
  );
}
