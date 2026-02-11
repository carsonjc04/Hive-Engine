import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Employee } from '../api/client';

type Role = 'hr' | 'employee';

interface RoleContextValue {
  role: Role;
  selectedEmployee: Employee | null;
  showEmployeePicker: boolean;
  switchToHR: () => void;
  openEmployeePicker: () => void;
  selectEmployee: (employee: Employee) => void;
  closeEmployeePicker: () => void;
}

const RoleContext = createContext<RoleContextValue>({
  role: 'hr',
  selectedEmployee: null,
  showEmployeePicker: false,
  switchToHR: () => {},
  openEmployeePicker: () => {},
  selectEmployee: () => {},
  closeEmployeePicker: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('hr');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);

  const switchToHR = useCallback(() => {
    setRole('hr');
    setSelectedEmployee(null);
    setShowEmployeePicker(false);
  }, []);

  const openEmployeePicker = useCallback(() => {
    setShowEmployeePicker(true);
  }, []);

  const selectEmployee = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setRole('employee');
    setShowEmployeePicker(false);
  }, []);

  const closeEmployeePicker = useCallback(() => {
    setShowEmployeePicker(false);
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        selectedEmployee,
        showEmployeePicker,
        switchToHR,
        openEmployeePicker,
        selectEmployee,
        closeEmployeePicker,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
