import LeftPanel from './LeftPanel';
import Header from './Header';
import RightPanel from './RightPanel';
import React, { useState, useEffect } from 'react';

export const MainLayout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  
  // Close panels when clicking on overlay
  const handleOverlayClick = () => {
    setShowSidebar(false);
    setShowRightPanel(false);
  };
  
  // Close panels when pressing Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowSidebar(false);
        setShowRightPanel(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);
  
  // Prevent body scroll when panels are open on mobile
  useEffect(() => {
    if (showSidebar || showRightPanel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSidebar, showRightPanel]);

  return (
    <div className="main-layout">
      <Header 
        onMenuClick={() => setShowSidebar(v => !v)} 
        onRightPanelClick={() => setShowRightPanel(v => !v)} 
      />
      <LeftPanel 
        show={showSidebar} 
        onClose={() => setShowSidebar(false)} 
      />
      <main className="main-content">
        {children}
      </main>
      <RightPanel 
        show={showRightPanel} 
        onClose={() => setShowRightPanel(false)} 
      />
      
      {/* Panel overlay for mobile */}
      <div 
        className={`panel-overlay${showSidebar || showRightPanel ? ' active' : ''}`}
        onClick={handleOverlayClick}
      />
    </div>
  );
};