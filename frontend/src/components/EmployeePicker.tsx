import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../api/client';
import { useRole } from '../context/RoleContext';
import { User, Search } from 'lucide-react';
import { useState } from 'react';

export default function EmployeePicker() {
  const { selectEmployee, closeEmployeePicker } = useRole();
  const [search, setSearch] = useState('');

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
  });

  const activeEmployees = employees.filter(
    (e) =>
      e.status === 'ACTIVE' &&
      (e.fullName.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="modal-overlay" onClick={closeEmployeePicker}>
      <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Log in as Employee</h2>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            Select an employee to view their personal dashboard.
          </p>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input
              className="form-input"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
              autoFocus
            />
          </div>
          <div className="picker-list">
            {isLoading ? (
              <div className="loading-spinner" style={{ padding: '24px' }}><div className="spinner" /></div>
            ) : activeEmployees.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                {search ? 'No matching employees' : 'No active employees'}
              </div>
            ) : (
              activeEmployees.map((emp) => (
                <button
                  key={emp.id}
                  className="picker-item"
                  onClick={() => selectEmployee(emp)}
                >
                  <div className="picker-avatar">
                    <User size={18} />
                  </div>
                  <div className="picker-info">
                    <span className="picker-name">{emp.fullName}</span>
                    <span className="picker-email">{emp.email}</span>
                  </div>
                  <span className="picker-dept">{emp.department ?? ''}</span>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={closeEmployeePicker}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
