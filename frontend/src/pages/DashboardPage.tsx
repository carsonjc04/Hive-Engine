import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Laptop, AppWindow, ShieldAlert } from 'lucide-react';
import { employeeApi, deviceApi, appAccessApi } from '../api/client';

export default function DashboardPage() {
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: employeeApi.getAll });
  const { data: devices = [] } = useQuery({ queryKey: ['devices'], queryFn: deviceApi.getAll });
  const { data: apps = [] } = useQuery({ queryKey: ['apps'], queryFn: appAccessApi.getAll });

  const active = employees.filter((e) => e.status === 'ACTIVE').length;
  const terminated = employees.filter((e) => e.status === 'TERMINATED').length;
  const locked = devices.filter((d) => d.isLocked).length;
  const revoked = apps.filter((a) => a.status === 'REVOKED').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your organization</p>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          <Link to="/people" style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green"><Users size={20} /></div>
              <div className="stat-label">Active Employees</div>
              <div className="stat-value">{active}</div>
            </div>
          </Link>
          <div className="stat-card">
            <div className="stat-icon stat-icon-red"><ShieldAlert size={20} /></div>
            <div className="stat-label">Terminated</div>
            <div className="stat-value">{terminated}</div>
          </div>
          <Link to="/devices" style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue"><Laptop size={20} /></div>
              <div className="stat-label">Total Devices</div>
              <div className="stat-value">{devices.length}</div>
            </div>
          </Link>
          <Link to="/apps" style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div className="stat-icon stat-icon-amber"><AppWindow size={20} /></div>
              <div className="stat-label">App Accesses</div>
              <div className="stat-value">{apps.length}</div>
            </div>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Recent Employees */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Employees</span>
              <Link to="/people" className="btn btn-outline btn-sm">View all</Link>
            </div>
            <table>
              <thead>
                <tr><th>Name</th><th>Status</th></tr>
              </thead>
              <tbody>
                {employees.slice(0, 5).map((e) => (
                  <tr key={e.id}>
                    <td><Link to={`/people/${e.id}`} className="table-link">{e.fullName}</Link></td>
                    <td>
                      <span className={`badge badge-${e.status.toLowerCase()}`}>
                        <span className="badge-dot" />{e.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr><td colSpan={2} className="empty-state"><div className="empty-state-text">No employees yet</div></td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Security Overview</span>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Locked Devices</span>
                <span className="badge badge-locked"><span className="badge-dot" />{locked}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Revoked App Accesses</span>
                <span className="badge badge-revoked"><span className="badge-dot" />{revoked}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Active Devices</span>
                <span className="badge badge-active"><span className="badge-dot" />{devices.length - locked}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Active App Accesses</span>
                <span className="badge badge-active"><span className="badge-dot" />{apps.length - revoked}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
