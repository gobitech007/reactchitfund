import Icon from "@mui/material/Icon";

import Dashboard from "./pages/dashboard";
import Pay from "./pages/pay";
import TransactionHistory from "./pages/transactionhistory";
import Register from './pages/register';
import Login from './pages/login';
import ForgotPassword from './pages/forgot-password';

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