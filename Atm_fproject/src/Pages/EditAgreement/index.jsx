import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import AgreementForm from '../../components/Agreement/AgreementForm';

export default function EditAgreementPage() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAgreement() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`agreements/${id}/`);
        setInitialData(response.data);
      } catch (err) {
        setError('Failed to load agreement data');
      } finally {
        setLoading(false);
      }
    }
    fetchAgreement();
  }, [id]);

  if (loading) return <div>Loading agreement...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <AgreementForm initialData={initialData} isEditing={true} />
  );
} 