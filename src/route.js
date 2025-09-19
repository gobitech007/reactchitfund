import Icon from "@mui/material/Icon";
import { useTranslation } from 'react-i18next';

import Dashboard from "./pages/dashboard";
import Pay from "./pages/pay";
import TransactionHistory from "./pages/transactionhistory";
import Register from './pages/register';
import Login from './pages/login';
import ForgotPassword from './pages/forgot-password';
import { ROUTE_PERMISSIONS } from './utils/role-utils';
import Interview from "./pages/interview";

const useRoutes = () => {
  const { t } = useTranslation();
  
  return [
    {
      type: "collapse",
      name: t('navigation.dashboard'),
      key: "dashboard",
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      element: < Dashboard />,
      canView: true,
      allowedRoles: ROUTE_PERMISSIONS.DASHBOARD, // All roles can access dashboard
    },
    {
      type: "collapse",
      name: t('header.pay'),
      key: "pay",
      icon: <Icon fontSize="small">payment</Icon>,
      route: "/pay",
      element: <Pay />,
      canView: true,
      allowedRoles: ROUTE_PERMISSIONS.PAY, // Only customers can access payment page
    },
    {
      type: "collapse",
      name: t('transactionHistory.title'),
      key: "transactionhistory",
      icon: <Icon fontSize="small">history</Icon>,
      route: "/transactionhistory",
      element: <TransactionHistory />,
      canView: true,
      allowedRoles: ROUTE_PERMISSIONS.TRANSACTION_HISTORY, // All roles can view transaction history
    },
    {
      type: "collapse",
      name: t('Interview'),
      key: "interview",
      icon: <Icon fontSize="small">Interview</Icon>,
      route: "/interview",
      element: <Interview />,
      canView: true,
      allowedRoles: ROUTE_PERMISSIONS.INTERVIEW, // All roles can view transaction history
    },
    {
      type: "collapse",
      name: t('auth.register'),
      key: "register",
      icon: <Icon fontSize="small">person_add</Icon>,
      route: "/register",
      element: <Register />,
      canView: false,
    },
    {
      type: "collapse",
      name: t('auth.login'),
      key: "login",
      icon: <Icon fontSize="small">login</Icon>,
      route: "/login",
      element: <Login />,
      canView: false,
    },
    {
      type: "collapse",
      name: t('auth.forgotPassword'),
      key: "forgot-password",
      icon: <Icon fontSize="small">help_outline</Icon>,
      route: "/forgot-password",
      element: <ForgotPassword />,
      canView: false,
    },
  ];
};

export default useRoutes;