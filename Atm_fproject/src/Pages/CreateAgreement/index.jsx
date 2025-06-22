import AgreementForm from '../../components/Agreement/AgreementForm';
import { useAgreementContext } from '../../context/AgreementContext';
import { useNavigate } from 'react-router-dom';

export default function CreateAgreement() {
  const { agreementData, setAgreementData, isEditing, stopEditing } = useAgreementContext();
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    setAgreementData(data);
    navigate('/agreements/preview');
    if (isEditing) {
      stopEditing();
    }
  };

  return <AgreementForm onSubmit={handleSubmit} initialData={agreementData} />;
} 