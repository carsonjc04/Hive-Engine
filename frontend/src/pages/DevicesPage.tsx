import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Laptop, Smartphone, Tablet } from 'lucide-react';
import { deviceApi } from '../api/client';

const typeIcons: Record<string, typeof Laptop> = {
  LAPTOP: Laptop,
  MOBILE: Smartphone,
  TABLET: Tablet,
};

export default function DevicesPage() {
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: deviceApi.getAll,
  });

  const active = devices.filter((d) => !d.isLocked).length;
  const locked = devices.filter((d) => d.isLocked).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Devices</h1>
          <p className="page-subtitle">{devices.length} devices managed</p>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue"><Laptop size={20} /></div>
            <div className="stat-label">Total Devices</div>
            <div className="stat-value">{devices.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green"><Laptop size={20} /></div>
            <div className="stat-label">Active</div>
            <div className="stat-value">{active}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-red"><Laptop size={20} /></div>
            <div className="stat-label">Locked</div>
            <div className="stat-value">{locked}</div>
          </div>
        </div>

        <div className="card">
          {isLoading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : devices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-text">No devices assigned yet. Assign devices from an employee's profile.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Type</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => {
                  const Icon = typeIcons[d.type] ?? Laptop;
                  return (
                    <tr key={d.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{d.serialNumber}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Icon size={15} /> {d.type}
                        </span>
                      </td>
                      <td>
                        <Link to={`/people/${d.employee.id}`} className="table-link">{d.employee.fullName}</Link>
                      </td>
                      <td>
                        <span className={`badge ${d.isLocked ? 'badge-locked' : 'badge-active'}`}>
                          <span className="badge-dot" />{d.isLocked ? 'LOCKED' : 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
