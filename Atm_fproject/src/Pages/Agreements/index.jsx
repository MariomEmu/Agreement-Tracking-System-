import AgreementTable from '../../components/Agreement/AgreementTable';
import { useNavigate } from 'react-router-dom';

export default function Agreements() {
  const navigate = useNavigate();
  return (
    <div className="agreements-page-content">
      <div className="agreements-header">
        <h2>My Agreements</h2>
        <button className="add-button" onClick={() => navigate('/agreements/create')}>+ Add New</button>
      </div>
      <AgreementTable />
    </div>
  );
}