import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRole } from '../context/RoleContext';
import { appAccessApi } from '../api/client';
import { AppWindow, Eye, EyeOff, ShieldOff } from 'lucide-react';

// Generate a deterministic mock password from employeeId + appName
function generatePassword(employeeId: number, appName: string): string {
  const seed = `${employeeId}-${appName}-hive`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  let h = Math.abs(hash);
  for (let i = 0; i < 14; i++) {
    password += chars[h % chars.length];
    h = Math.floor(h / chars.length) + (i + 1) * 7;
  }
  return password;
}

export default function MyAppsPage() {
  const { selectedEmployee } = useRole();

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['my-apps', selectedEmployee?.id],
    queryFn: () => appAccessApi.getByEmployee(selectedEmployee!.id),
    enabled: !!selectedEmployee,
    refetchInterval: 3000,
  });

  if (!selectedEmployee) return null;

  const active = apps.filter((a) => a.status === 'ACTIVE').length;
  const revoked = apps.filter((a) => a.status === 'REVOKED').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">{apps.length} apps &middot; {active} active &middot; {revoked} revoked</p>
        </div>
      </div>
      <div className="page-body">
        {isLoading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : apps.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-text">No applications have been assigned to you yet.</div>
            </div>
          </div>
        ) : (
          <div className="app-cards-grid">
            {apps.map((app) => (
              <AppCard
                key={app.id}
                appName={app.appName}
                role={app.role}
                status={app.status}
                employeeId={selectedEmployee.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function AppCard({ appName, role, status, employeeId }: {
  appName: string;
  role: string;
  status: string;
  employeeId: number;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isRevoked = status === 'REVOKED';
  const password = generatePassword(employeeId, appName);

  return (
    <div className={`app-card ${isRevoked ? 'app-card-revoked' : ''}`}>
      <div className="app-card-header">
        <div className="app-card-icon">
          {isRevoked ? <ShieldOff size={20} /> : <AppWindow size={20} />}
        </div>
        <span className={`badge ${isRevoked ? 'badge-revoked' : 'badge-active'}`}>
          <span className="badge-dot" />{status}
        </span>
      </div>
      <h3 className="app-card-name">{appName}</h3>
      <p className="app-card-role">Role: {role}</p>
      <div className="app-card-password">
        <label className="app-card-password-label">Password</label>
        {isRevoked ? (
          <div className="app-card-password-revoked">
            <ShieldOff size={14} />
            Access Revoked
          </div>
        ) : (
          <div className="app-card-password-field">
            <code className="app-card-password-value">
              {showPassword ? password : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
            </code>
            <button
              className="app-card-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
