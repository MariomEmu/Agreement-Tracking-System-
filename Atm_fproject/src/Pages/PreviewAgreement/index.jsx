import AgreementPreview from '../../components/Agreement/AgreementPreview';
import { useAgreementContext } from '../../context/AgreementContext';
import { useNavigate } from 'react-router-dom';

export default function PreviewAgreement() {
  const { agreementData } = useAgreementContext();
  const navigate = useNavigate();

  const handleSave = () => {
    // Here you would normally save to backend
    navigate('/agreements');
  };
  const handleEdit = () => {
    navigate('/agreements/create');
  };

  return <AgreementPreview data={agreementData} onSave={handleSave} onEdit={handleEdit} />;
} 