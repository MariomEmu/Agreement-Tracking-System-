import AgreementPreview from '../../components/Agreement/AgreementPreview';
import { useAgreementContext } from '../../context/AgreementContext';
import { useNavigate, useParams } from 'react-router-dom';

export default function PreviewAgreement() {
  const { agreementData, addAgreement, updateAgreement, isEditing, startEditing } = useAgreementContext();
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSave = () => {
    if (isEditing) {
      updateAgreement(agreementData);
    } else {
      addAgreement(agreementData);
    }
    navigate('/agreements');
  };
  
  const handleEdit = () => {
    startEditing(agreementData);
    navigate('/agreements/create');
  };

  // If id exists, we are in view mode
  const isViewMode = Boolean(id);

  return <AgreementPreview data={agreementData} onSave={handleSave} onEdit={handleEdit} viewMode={isViewMode} />;
} 