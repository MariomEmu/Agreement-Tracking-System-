import LeftPanel from './LeftPanel';
import Header from './Header';
import RightPanel from './RightPanel';

export const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <LeftPanel />
      <main className="main-content">
        {children}
      </main>
      <RightPanel />
    </div>
  );
};