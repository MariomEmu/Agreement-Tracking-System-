import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import Dashboard from './Pages/Dashboard';
import AgreementsPage from './Pages/Agreements';
import CreateAgreement from './Pages/CreateAgreement';
import PreviewAgreement from './Pages/PreviewAgreement';
import SignIn from './Pages/SignIn';

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
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
                <Route path="/agreements" element={<AgreementsPage />} />
        <Route path="/agreements/create" element={<CreateAgreement />} />
        <Route path="/agreements/preview" element={<PreviewAgreement />} />
                <Route path="/agreements/preview/:id" element={<PreviewAgreement />} />
      </Routes>
    </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;