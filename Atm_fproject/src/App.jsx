import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import Dashboard from './Pages/Dashboard';
import Agreements from './Pages/Agreements';
import CreateAgreement from './Pages/CreateAgreement';
import PreviewAgreement from './Pages/PreviewAgreement';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agreements" element={<Agreements />} />
        <Route path="/agreements/create" element={<CreateAgreement />} />
        <Route path="/agreements/preview" element={<PreviewAgreement />} />
      </Routes>
    </MainLayout>
  );
}

export default App;