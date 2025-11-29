import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import LoginPage from './pages/Login.page';
import RegisterPage from './pages/Register.page';
import DashboardPage from './pages/Dashboard.page';
import OverviewPage from './pages/DashboardSubpages/Overview.page';

import WaterPage from './pages/DashboardSubpages/Water.page';
import ActivityPage from './pages/DashboardSubpages/Activity.page';
import SleepPage from './pages/DashboardSubpages/Sleep.page';
import CustomCategoryPage from './pages/DashboardSubpages/CustomCategory.page';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: 'overview', element: <OverviewPage /> },
      { path: 'water', element: <WaterPage /> },
      { path: 'activity', element: <ActivityPage /> },
      { path: 'sleep', element: <SleepPage /> },
      { path: 'custom', element: <CustomCategoryPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
}
