import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle, Plus, Laptop, AppWindow } from 'lucide-react';
import { employeeApi, deviceApi, appAccessApi, ApiError } from '../api/client';
import { useToast } from '../hooks/useToast';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const employeeId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showTerminate, setShowTerminate] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showAddApp, setShowAddApp] = useState(false);

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeeApi.getById(employeeId),
  });

  const { data: devices = [] } = useQuery({
    queryKey: ['devices', 'employee', employeeId],
    queryFn: () => deviceApi.getByEmployee(employeeId),
  });

  const { data: apps = [] } = useQuery({
    queryKey: ['apps', 'employee', employeeId],
    queryFn: () => appAccessApi.getByEmployee(employeeId),
  });

  const terminateMutation = useMutation({
    mutationFn: () => employeeApi.terminate(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      // Also invalidate the employee-specific queries
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['devices', 'employee', employeeId] });
        queryClient.invalidateQueries({ queryKey: ['apps', 'employee', employeeId] });
      }, 1000); // slight delay for event processing
      toast('Employee terminated. Devices locked & app access revoked.');
      setShowTerminate(false);
    },
    onError: () => toast('Failed to terminate employee', 'error'),
  });

  if (isLoading) {
    return <div className="loading-spinner" style={{ marginTop: '100px' }}><div className="spinner" /></div>;
  }

  if (!employee) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <div className="empty-state-text">Employee not found</div>
          <Link to="/people" className="btn btn-outline" style={{ marginTop: '16px' }}>Back to People</Link>
        </div>
      </div>
    );
  }

  const isActive = employee.status === 'ACTIVE';

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/people')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-title">{employee.fullName}</h1>
              <span className={`badge badge-${employee.status.toLowerCase()}`}>
                <span className="badge-dot" />{employee.status}
              </span>
            </div>
            <p className="page-subtitle">{employee.email}</p>
          </div>
        </div>
        {isActive && (
          <button className="btn btn-danger" onClick={() => setShowTerminate(true)}>
            <AlertTriangle size={16} /> Terminate
          </button>
        )}
      </div>

      <div className="page-body">
        {/* Info Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="detail-info">
            <div className="detail-field">
              <span className="detail-field-label">Employee ID</span>
              <span className="detail-field-value">#{employee.id}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Department</span>
              <span className="detail-field-value">{employee.department ?? '—'}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Email</span>
              <span className="detail-field-value">{employee.email}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Status</span>
              <span className="detail-field-value">{employee.status}</span>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          {/* Devices */}
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Laptop size={16} /> Devices ({devices.length})
              </span>
              {isActive && (
                <button className="btn btn-outline btn-sm" onClick={() => setShowAddDevice(true)}>
                  <Plus size={14} /> Add
                </button>
              )}
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

          {/* App Access */}
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AppWindow size={16} /> App Access ({apps.length})
              </span>
              {isActive && (
                <button className="btn btn-outline btn-sm" onClick={() => setShowAddApp(true)}>
                  <Plus size={14} /> Add
                </button>
              )}
            </div>
            {apps.length === 0 ? (
              <div className="empty-state"><div className="empty-state-text">No app access assigned</div></div>
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
        </div>
      </div>

      {/* Terminate Modal */}
      {showTerminate && (
        <div className="modal-overlay" onClick={() => setShowTerminate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Terminate Employee</h2>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to terminate <span className="confirm-highlight">{employee.fullName}</span>?
              </p>
              <p className="confirm-text" style={{ marginTop: '12px' }}>
                This will automatically:
              </p>
              <ul style={{ margin: '8px 0 0 20px', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                <li>Lock all assigned devices ({devices.length})</li>
                <li>Revoke all app access ({apps.length})</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowTerminate(false)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => terminateMutation.mutate()}
                disabled={terminateMutation.isPending}
              >
                {terminateMutation.isPending ? 'Terminating...' : 'Terminate Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddDevice && (
        <AddDeviceModal
          employeeId={employeeId}
          onClose={() => setShowAddDevice(false)}
          onAdded={async () => {
            setShowAddDevice(false);
            await queryClient.invalidateQueries({ queryKey: ['devices', 'employee', employeeId] });
            await queryClient.invalidateQueries({ queryKey: ['devices'] });
            toast('Device assigned successfully');
          }}
        />
      )}

      {/* Add App Modal */}
      {showAddApp && (
        <AddAppModal
          employeeId={employeeId}
          onClose={() => setShowAddApp(false)}
          onAdded={async () => {
            setShowAddApp(false);
            await queryClient.invalidateQueries({ queryKey: ['apps', 'employee', employeeId] });
            await queryClient.invalidateQueries({ queryKey: ['apps'] });
            toast('App access granted successfully');
            setShowAddApp(false);
          }}
        />
      )}
    </>
  );
}

function AddDeviceModal({ employeeId, onClose, onAdded }: { employeeId: number; onClose: () => void; onAdded: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ deviceType: 'LAPTOP', serialNumber: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: deviceApi.assign,
    onSuccess: onAdded,
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrors(err.body);
      } else {
        toast('Failed to assign device', 'error');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate({ employeeId, ...form });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Assign Device</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Device Type *</label>
              <select
                className="form-select"
                value={form.deviceType}
                onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
              >
                <option value="LAPTOP">Laptop</option>
                <option value="MOBILE">Mobile</option>
                <option value="TABLET">Tablet</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number *</label>
              <input
                className="form-input"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                placeholder="SN-XXXX-XXXX"
                required
              />
              {errors.serialNumber && <div className="form-error">{errors.serialNumber}</div>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Assigning...' : 'Assign Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddAppModal({ employeeId, onClose, onAdded }: { employeeId: number; onClose: () => void; onAdded: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ appName: '', role: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: appAccessApi.assign,
    onSuccess: onAdded,
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrors(err.body);
      } else {
        toast('Failed to grant app access', 'error');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate({ employeeId, ...form });
  };

  const appOptions = ['Slack', 'Jira', 'GitHub', 'Google Workspace', 'Figma', 'Notion', 'AWS', 'Salesforce'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Grant App Access</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Application *</label>
              <select
                className="form-select"
                value={form.appName}
                onChange={(e) => setForm({ ...form, appName: e.target.value })}
                required
              >
                <option value="">Select an application...</option>
                {appOptions.map((app) => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
              {errors.appName && <div className="form-error">{errors.appName}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <input
                className="form-input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Admin, Member, Viewer"
                required
              />
              {errors.role && <div className="form-error">{errors.role}</div>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Granting...' : 'Grant Access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
