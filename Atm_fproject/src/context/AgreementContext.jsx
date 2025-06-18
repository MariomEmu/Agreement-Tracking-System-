import React, { createContext, useContext, useState } from 'react';

const AgreementContext = createContext();

export function AgreementProvider({ children }) {
  const [agreementData, setAgreementData] = useState({});
  return (
    <AgreementContext.Provider value={{ agreementData, setAgreementData }}>
      {children}
    </AgreementContext.Provider>
  );
}

export function useAgreementContext() {
  return useContext(AgreementContext);
} 