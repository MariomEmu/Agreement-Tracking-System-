import AgreementForm from '../../components/Agreement/AgreementForm';
import { useAgreementContext } from '../../context/AgreementContext';
import { useNavigate } from 'react-router-dom';

export default function CreateAgreement() {
  const { setAgreementData } = useAgreementContext();
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    setAgreementData(data);
    navigate('/agreements/preview');
  };

  return <AgreementForm onSubmit={handleSubmit} />;
} 