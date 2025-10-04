import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import useRoutes from './route';
import './App.css';
import Header from "./view/header";
import Login from './pages/login';
import Register from './pages/register';
import ForgotPassword from './pages/forgot-password';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/applicationData.tsx';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
// import DebugButton from './components/DebugButton';
// import RoleDebugInfo from './components/RoleDebugInfo';
// import RoleTestComponent from './components/RoleTestComponent';
import { performCorsCheck } from './utils/cors-check';
import { initializeDebugHelpers } from './utils/debug-helpers';
import Interview from './pages/interview';

function App() {
  // Get routes from the hook
  const routes = useRoutes();
  
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

    // Initialize debug helpers
    initializeDebugHelpers();
  }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <div className="App">
          <Header />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              {/* <Route path="/interview" element={<Interview />} /> */}

              {/* Map other public routes */}
              {publicRoutes.map((route) => (
                route.route && (
                  <Route
                    path={route.route}
                    element={route.element}
                    key={route.key}
                  />
                )
              ))}

              {/* Protected routes with role-based access */}
              <Route element={<ProtectedRoute />}>
                {authRoutes.map((route) => (
                  route.route && (
                    <Route
                      path={route.route}
                      element={
                        route.allowedRoles ? (
                          <RoleBasedRoute allowedRoles={route.allowedRoles}>
                            {route.element}
                          </RoleBasedRoute>
                        ) : (
                          route.element
                        )
                      }
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
          
          {/* Debug components - only show in development mode */}
          {/* <DebugButton /> */}
          {/* <RoleDebugInfo /> */}
          {/* <RoleTestComponent /> */}
        </div>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
