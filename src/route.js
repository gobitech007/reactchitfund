import Icon from "@mui/material/Icon";

import Dashboard from "./pages/dashboard-redux";
import Pay from "./pages/pay-redux";
import TransactionHistory from "./pages/transactionhistory-redux";
import Register from './pages/register-redux';
import Login from './pages/login-redux';
import ForgotPassword from './pages/forgot-password-redux';
import Profile from './pages/profile-redux';
import Settings from './pages/settings-redux';

const routes = [
    {
      type: "collapse",
      name: "Dashboard",
      key: "dashboard",
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      element: < Dashboard />,
      canView: true,
    },
    {
      type: "collapse",
      name: "Pay",
      key: "pay",
      icon: <Icon fontSize="small">payment</Icon>,
      route: "/pay",
      element: <Pay />,
      canView: true,
    },
    {
      type: "collapse",
      name: "Transaction History",
      key: "transactionhistory",
      icon: <Icon fontSize="small">history</Icon>,
      route: "/transactionhistory",
      element: <TransactionHistory />,
      canView: true,
    },
    {
      type: "collapse",
      name: "Profile",
      key: "profile",
      icon: <Icon fontSize="small">person</Icon>,
      route: "/profile",
      element: <Profile />,
      canView: true,
    },
    {
      type: "collapse",
      name: "Settings",
      key: "settings",
      icon: <Icon fontSize="small">settings</Icon>,
      route: "/settings",
      element: <Settings />,
      canView: true,
    },
    {
      type: "collapse",
      name: "Register",
      key: "register",
      icon: <Icon fontSize="small">person_add</Icon>,
      route: "/register",
      element: <Register />,
      canView: false,
    },
    {
      type: "collapse",
      name: "Login",
      key: "login",
      icon: <Icon fontSize="small">login</Icon>,
      route: "/login",
      element: <Login />,
      canView: false,
    },
    {
      type: "collapse",
      name: "Forgot-password",
      key: "forgot-password",
      icon: <Icon fontSize="small">help_outline</Icon>,
      route: "/forgot-password",
      element: <ForgotPassword />,
      canView: false,
    },
  ];
export default routes;