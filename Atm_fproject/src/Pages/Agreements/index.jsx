import React from 'react';
import AgreementList from '../../components/Agreement/AgreementList';
import { useAgreementContext } from '../../context/AgreementContext';

export default function AgreementsPage() {
  const { agreements } = useAgreementContext();

  return (
    <div>
      <AgreementList agreements={agreements} />
    </div>
  );
}