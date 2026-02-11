import { useQuery } from '@tanstack/react-query';
import { useRole } from '../context/RoleContext';
import { deviceApi } from '../api/client';
import { Laptop, Smartphone, Tablet, Lock } from 'lucide-react';

const typeIcons: Record<string, typeof Laptop> = {
  LAPTOP: Laptop,
  MOBILE: Smartphone,
  TABLET: Tablet,
};

export default function MyDevicesPage() {
  const { selectedEmployee } = useRole();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['my-devices', selectedEmployee?.id],
    queryFn: () => deviceApi.getByEmployee(selectedEmployee!.id),
    enabled: !!selectedEmployee,
    refetchInterval: 3000,
  });

  if (!selectedEmployee) return null;

  const active = devices.filter((d) => !d.isLocked).length;
  const locked = devices.filter((d) => d.isLocked).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Devices</h1>
          <p className="page-subtitle">{devices.length} devices &middot; {active} active &middot; {locked} locked</p>
        </div>
      </div>
      <div className="page-body">
        {isLoading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : devices.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-text">No devices have been assigned to you yet.</div>
            </div>
          </div>
        ) : (
          <div className="device-cards-grid">
            {devices.map((device) => {
              const Icon = typeIcons[device.type] ?? Laptop;
              return (
                <div key={device.id} className={`device-card ${device.isLocked ? 'device-card-locked' : ''}`}>
                  {device.isLocked && (
                    <div className="device-card-lock-overlay">
                      <Lock size={32} />
                      <span>LOCKED</span>
                    </div>
                  )}
                  <div className="device-card-icon">
                    <Icon size={28} />
                  </div>
                  <h3 className="device-card-type">{device.type}</h3>
                  <p className="device-card-serial">{device.serialNumber}</p>
                  <span className={`badge ${device.isLocked ? 'badge-locked' : 'badge-active'}`}>
                    <span className="badge-dot" />{device.isLocked ? 'LOCKED' : 'ACTIVE'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
