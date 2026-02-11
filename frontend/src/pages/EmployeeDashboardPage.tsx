import { useQuery } from '@tanstack/react-query';
import { useRole } from '../context/RoleContext';
import { employeeApi, deviceApi, appAccessApi } from '../api/client';
import { AppWindow, Laptop, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function EmployeeDashboardPage() {
  const { selectedEmployee } = useRole();

  const { data: employee } = useQuery({
    queryKey: ['employee', selectedEmployee?.id],
    queryFn: () => employeeApi.getById(selectedEmployee!.id),
    enabled: !!selectedEmployee,
    refetchInterval: 3000,
  });

  const { data: devices = [] } = useQuery({
    queryKey: ['my-devices', selectedEmployee?.id],
    queryFn: () => deviceApi.getByEmployee(selectedEmployee!.id),
    enabled: !!selectedEmployee,
    refetchInterval: 3000,
  });

  const { data: apps = [] } = useQuery({
    queryKey: ['my-apps', selectedEmployee?.id],
    queryFn: () => appAccessApi.getByEmployee(selectedEmployee!.id),
    enabled: !!selectedEmployee,
    refetchInterval: 3000,
  });

  if (!selectedEmployee) return null;

  const isTerminated = employee?.status === 'TERMINATED';
  const activeApps = apps.filter((a) => a.status === 'ACTIVE').length;
  const revokedApps = apps.filter((a) => a.status === 'REVOKED').length;
  const activeDevices = devices.filter((d) => !d.isLocked).length;
  const lockedDevices = devices.filter((d) => d.isLocked).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {selectedEmployee.fullName}</h1>
          <p className="page-subtitle">{selectedEmployee.department ?? 'No department'} &middot; {selectedEmployee.email}</p>
        </div>
        <span className={`badge badge-${isTerminated ? 'terminated' : 'active'}`}>
          <span className="badge-dot" />{isTerminated ? 'TERMINATED' : 'ACTIVE'}
        </span>
      </div>

      <div className="page-body">
        {isTerminated && (
          <div className="termination-banner">
            <ShieldAlert size={20} />
            <div>
              <strong>Your access has been revoked</strong>
              <p>Your employment has been terminated. All devices have been locked and application access has been revoked.</p>
            </div>
          </div>
        )}

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green"><AppWindow size={20} /></div>
            <div className="stat-label">Active Apps</div>
            <div className="stat-value">{activeApps}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-red"><AppWindow size={20} /></div>
            <div className="stat-label">Revoked Apps</div>
            <div className="stat-value">{revokedApps}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue"><Laptop size={20} /></div>
            <div className="stat-label">Active Devices</div>
            <div className="stat-value">{activeDevices}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-amber"><ShieldCheck size={20} /></div>
            <div className="stat-label">Locked Devices</div>
            <div className="stat-value">{lockedDevices}</div>
          </div>
        </div>

        <div className="detail-grid">
          {/* Recent Apps */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">My Applications</span>
            </div>
            {apps.length === 0 ? (
              <div className="empty-state"><div className="empty-state-text">No applications assigned</div></div>
            ) : (
              <table>
                <thead>
                  <tr><th>App</th><th>Role</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {apps.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500 }}>{a.appName}</td>
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

          {/* Devices */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">My Devices</span>
            </div>
            {devices.length === 0 ? (
              <div className="empty-state"><div className="empty-state-text">No devices assigned</div></div>
            ) : (
              <table>
                <thead>
                  <tr><th>Serial</th><th>Type</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{d.serialNumber}</td>
                      <td>{d.type}</td>
                      <td>
                        <span className={`badge ${d.isLocked ? 'badge-locked' : 'badge-active'}`}>
                          <span className="badge-dot" />{d.isLocked ? 'LOCKED' : 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
