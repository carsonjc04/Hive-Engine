import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import PeoplePage from './pages/PeoplePage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import DevicesPage from './pages/DevicesPage';
import AppsPage from './pages/AppsPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import MyAppsPage from './pages/MyAppsPage';
import MyDevicesPage from './pages/MyDevicesPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* HR Routes */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/people/:id" element={<EmployeeDetailPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/apps" element={<AppsPage />} />

        {/* Employee Routes */}
        <Route path="/my-dashboard" element={<EmployeeDashboardPage />} />
        <Route path="/my-apps" element={<MyAppsPage />} />
        <Route path="/my-devices" element={<MyDevicesPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
