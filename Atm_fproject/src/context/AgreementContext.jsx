import React, { createContext, useContext, useState } from 'react';

const AgreementContext = createContext();

export function AgreementProvider({ children }) {
  const [agreements, setAgreements] = useState([]);
  const [agreementData, setAgreementData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const addAgreement = (agreement) => {
    setAgreements([...agreements, agreement]);
  };

  const updateAgreement = (updatedAgreement) => {
    setAgreements(agreements.map(agreement => 
      agreement.agreementId === updatedAgreement.agreementId ? updatedAgreement : agreement
    ));
  };

  const deleteAgreement = (agreementId) => {
    setAgreements(agreements.filter(agreement => agreement.agreementId !== agreementId));
  };

  const prepareNewAgreement = () => {
    setIsEditing(false);
    setAgreementData({});
  };

  const startEditing = (data) => {
    setAgreementData(data);
    setIsEditing(true);
  };

  const stopEditing = () => {
    setIsEditing(false);
  };

  const updateAgreementData = (data) => {
    setAgreementData(data);
  };

  return (
    <AgreementContext.Provider value={{ 
      agreements,
      agreementData, 
      setAgreementData: updateAgreementData, 
      isEditing, 
      startEditing, 
      stopEditing,
      addAgreement,
      updateAgreement,
      deleteAgreement,
      prepareNewAgreement
    }}>
      {children}
    </AgreementContext.Provider>
  );
}

export function useAgreementContext() {
  return useContext(AgreementContext);
} 