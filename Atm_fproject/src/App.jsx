import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import Dashboard from './Pages/Dashboard';
import AgreementsPage from './Pages/Agreements';
import CreateAgreement from './Pages/CreateAgreement';
import PreviewAgreement from './Pages/PreviewAgreement';
import EditAgreementPage from './Pages/EditAgreement';
import SignIn from './Pages/SignIn';
import React, { useEffect } from 'react';
import ChangePassword from './Pages/ChangePassword';

function isLoggedIn() {
  // For now, check a flag in localStorage
  return localStorage.getItem('isLoggedIn') === 'true';
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/get-csrf/', { credentials: 'include' });
  }, []);

  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Outlet />
            </MainLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="agreements" element={<AgreementsPage />} />
        <Route path="agreements/create" element={<CreateAgreement />} />
        <Route path="agreements/preview/:id" element={<PreviewAgreement />} />
        <Route path="agreements/preview" element={<PreviewAgreement />} />
        <Route path="agreements/edit/:id" element={<EditAgreementPage />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
    </Routes>
  );
}

export default App;