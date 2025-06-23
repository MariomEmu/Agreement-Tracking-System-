import LeftPanel from './LeftPanel';
import Header from './Header';
import RightPanel from './RightPanel';
import React, { useState } from 'react';

export const MainLayout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  return (
    <div className="main-layout">
      <Header onMenuClick={() => setShowSidebar(v => !v)} onRightPanelClick={() => setShowRightPanel(v => !v)} />
      <LeftPanel show={showSidebar} onClose={() => setShowSidebar(false)} />
      <main className="main-content">
        {children}
      </main>
      <RightPanel show={showRightPanel} onClose={() => setShowRightPanel(false)} />
    </div>
  );
};