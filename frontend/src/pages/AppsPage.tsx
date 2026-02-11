import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AppWindow } from 'lucide-react';
import { appAccessApi } from '../api/client';

export default function AppsPage() {
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: appAccessApi.getAll,
  });

  const active = apps.filter((a) => a.status === 'ACTIVE').length;
  const revoked = apps.filter((a) => a.status === 'REVOKED').length;

  // Group by app name
  const grouped = apps.reduce<Record<string, number>>((acc, a) => {
    if (a.status === 'ACTIVE') {
      acc[a.appName] = (acc[a.appName] ?? 0) + 1;
    }
    return acc;
  }, {});

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">App Access</h1>
          <p className="page-subtitle">{apps.length} total access records</p>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-icon stat-icon-amber"><AppWindow size={20} /></div>
            <div className="stat-label">Total Records</div>
            <div className="stat-value">{apps.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green"><AppWindow size={20} /></div>
            <div className="stat-label">Active</div>
            <div className="stat-value">{active}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-red"><AppWindow size={20} /></div>
            <div className="stat-label">Revoked</div>
            <div className="stat-value">{revoked}</div>
          </div>
        </div>

        {/* Active apps breakdown */}
        {Object.keys(grouped).length > 0 && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <span className="card-title">Active Licenses by App</span>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(grouped).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                <span key={name} className="badge badge-active" style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {name}: {count}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          {isLoading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : apps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-text">No app access records yet. Grant access from an employee's profile.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500 }}>{a.appName}</td>
                    <td>
                      <Link to={`/people/${a.employee.id}`} className="table-link">{a.employee.fullName}</Link>
                    </td>
                    <td>{a.role}</td>
                    <td>
                      <span className={`badge ${a.status === 'ACTIVE' ? 'badge-active' : 'badge-revoked'}`}>
                        <span className="badge-dot" />{a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
