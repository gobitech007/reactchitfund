// src/Header.js

import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import '../i18n';
import logo from '../assets/images/SM_LOGO.webp';
import useRoutes from '../route';
import { useAuth } from '../context/AuthContext';
import { hasPermission, getDefaultRole } from '../utils/role-utils';

function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, isAuthenticated, currentUser, login } = useAuth();
  const routes = useRoutes();
  // Make login function available globally for class components
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.login = login;
    }
  }, [login]);

  // private getRoutes = getLinks;
  const getLinks = (getRoutes) => {
    return getRoutes.map((route) => {
      if (route.collapse) {
        return getLinks(route.collapse);
      }
      if (route.route && route.canView && isAuthenticated()) {
        // Check if user has permission to view this route
        if (route.allowedRoles && currentUser) {
          const userRole = currentUser.role || getDefaultRole();
          const userHasPermission = hasPermission(userRole, route.allowedRoles);
          
          if (!userHasPermission) {
            return null; // Don't show the navigation item
          }
        }
        
        return (
          <li className="nav-item" key={route.key}>
            <Link className="nav-link text-info" to={route.route}>{route.name}</Link>
          </li>
        );
      } else if ((route.key === 'login' || route.key === 'register') && !isAuthenticated()) {
        return (
          <li className="nav-item" key={route.key}>
            <Link className="nav-link text-info" to={route.route}>{route.name}</Link>
          </li>
        );
      }
      return null;
  });
}

  const handleLogout = () => {
    // Call the logout function from the auth context
    logout();

    // Use React Router's navigate function to redirect to login page
    navigate('/login');
  };

  return (
    <header className="container-fluid">
      <nav className="navbar navbar-expand-xxl navbar-light bg-success">
      <img src={logo} alt="Logo" className="logo-img-adjust" />
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
             {t('header.brand')}
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mynavbar">
            <ul className="navbar-nav me-auto justify-content-end w-100">
              {getLinks(routes)}
            </ul>
            <div className="d-flex align-items-center">
              <span className="navbar-text text-white text-start me-3">
                <LanguageSelector />
              </span>
              {isAuthenticated() && (
                <div className="d-flex align-items-center">
                  <span className="navbar-text text-white me-3">
                    {currentUser?.fullname}
                  </span>
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={handleLogout}
                  >
                    {t('navigation.logout')}
                  </button>
                </div>
              )}
            </div>
            {/* <form className="d-flex">
              <input className="form-control me-2" type="text" placeholder="Search" />
              <button className="btn btn-primary" type="button">Search</button>
            </form> */}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
