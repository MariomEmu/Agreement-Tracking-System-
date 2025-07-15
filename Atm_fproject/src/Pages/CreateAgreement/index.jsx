import AgreementForm from '../../components/Agreement/AgreementForm';
import { useAgreementContext } from '../../context/AgreementContext';
import { useNavigate } from 'react-router-dom';
import { getCSRFToken } from '../../utils/csrf'; // ← correct util import

export default function CreateAgreement() {
  const { agreementData, setAgreementData, isEditing, stopEditing } = useAgreementContext();
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    // Save data to context first
    setAgreementData(data);

    // Immediately navigate to preview screen
    navigate('/agreements/preview');

    const csrfToken = getCSRFToken();  // ← clean util usage

    if (!csrfToken) {
      console.error('CSRF token not found.');
      return;
    }

    // Prepare payload to send to backend
    const payload = {
  title: data.agreementTitle,
  agreement_type: data.type,
  start_date: data.startDate,
  expiry_date: data.expiryDate,
  reminder_time: data.reminderDate,
  department: data.department,
  status: data.status,
  created_by: 1,  // later, replace with logged-in user's id
};

    // Send POST request to backend API
    fetch('http://127.0.0.1:8000/api/agreements/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',  // important to send cookies with request
      body: JSON.stringify(payload),
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to create agreement');
      return res.json();
    })
    .then(response => {
      console.log('✅ Agreement created:', response);
      if (isEditing) {
        stopEditing();
      }
    })
    .catch(err => {
      console.error('❌ Error creating agreement:', err);
    });
  };

  return <AgreementForm onSubmit={handleSubmit} initialData={agreementData} />;
}
