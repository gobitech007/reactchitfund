import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import routes from './route';
import './App.css';
import Header from "./view/header";
import Login from './pages/login';
import Register from './pages/register';
import ForgotPassword from './pages/forgot-password';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { performCorsCheck } from './utils/cors-check';

function App() {
  // Filter routes that require authentication (canView: true)
  const authRoutes = routes.filter(route => route.canView);
  // Filter routes that don't require authentication (canView: false)
  const publicRoutes = routes.filter(route => !route.canView);

  // Check CORS configuration on component mount
  useEffect(() => {
    // Perform CORS check when the app starts
    performCorsCheck().catch(error => {
      console.error('CORS check failed:', error);
    });
  }, []);

  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Map other public routes */}
            {publicRoutes.map((route) => (
              route.route && (
                <Route
                  exact
                  path={route.route}
                  element={route.element}
                  key={route.key}
                />
              )
            ))}

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              {authRoutes.map((route) => (
                route.route && (
                  <Route
                    exact
                    path={route.route}
                    element={route.element}
                    key={route.key}
                  />
                )
              ))}
            </Route>

            {/* Default route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch all route - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
