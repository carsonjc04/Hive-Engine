const API_BASE = 'http://localhost:8080/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  status: number;
  body: Record<string, string>;
  constructor(status: number, body: Record<string, string>) {
    super(Object.values(body).join(', ') || `Request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

// ── Types ──────────────────────────────────────────────────────

export interface Employee {
  id: number;
  email: string;
  fullName: string;
  status: 'ACTIVE' | 'TERMINATED';
  department: string | null;
}

export interface Device {
  id: number;
  serialNumber: string;
  type: 'LAPTOP' | 'MOBILE' | 'TABLET';
  isLocked: boolean;
  employee: Employee;
}

export interface AppAccess {
  id: number;
  appName: string;
  status: string;
  role: string;
  employee: Employee;
}

// ── Employee API ───────────────────────────────────────────────

export const employeeApi = {
  getAll: () => request<Employee[]>('/employees'),
  getById: (id: number) => request<Employee>(`/employees/${id}`),
  create: (data: { fullName: string; email: string; department?: string }) =>
    request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  terminate: (id: number) =>
    request<Employee>(`/employees/${id}/terminate`, { method: 'POST' }),
};

// ── Device API ─────────────────────────────────────────────────

export const deviceApi = {
  getAll: () => request<Device[]>('/devices'),
  getByEmployee: (employeeId: number) => request<Device[]>(`/devices/employee/${employeeId}`),
  assign: (data: { employeeId: number; deviceType: string; serialNumber: string }) =>
    request<Device>('/devices', { method: 'POST', body: JSON.stringify(data) }),
};

// ── App Access API ─────────────────────────────────────────────

export const appAccessApi = {
  getAll: () => request<AppAccess[]>('/app-access'),
  getByEmployee: (employeeId: number) => request<AppAccess[]>(`/app-access/employee/${employeeId}`),
  assign: (data: { employeeId: number; appName: string; role: string }) =>
    request<AppAccess>('/app-access', { method: 'POST', body: JSON.stringify(data) }),
};
