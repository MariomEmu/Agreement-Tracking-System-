import { FiBell } from 'react-icons/fi';

const notifications = [
  { id: 1, text: 'New agreement created', time: 'Just now' },
  { id: 2, text: 'New permission - Saim', time: '59 minutes ago' },
  { id: 3, text: 'New agreement created', time: 'Today, 11:59 AM' },
  { id: 4, text: 'New agreement created', time: '14 Jan 2025, 11:57 AM' }
];

const RightPanel = ({ show, onClose }) => {
  return (
    <div className={`right-panel${show ? ' active' : ''}`}>
      <button 
        className="close-sidebar-btn" 
        onClick={onClose}
        aria-label="Close notifications"
      >
        ×
      </button>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <FiBell size={20} style={{color: '#1a237e', marginRight: '8px'}} />
          <span className="badge" style={{background: '#e74c3c', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: 11, marginRight: '8px'}}>{notifications.length}</span>
          <h2 style={{fontSize: 20, fontWeight: 600, margin: 0}}>Notifications</h2>
        </div>
        <a href="#" style={{fontSize: 13, color: '#aaa', textDecoration: 'none'}}>See all</a>
      </div>
      <div className="notifications-list">
        {notifications.map(notification => (
          <div key={notification.id} className="notification-item" style={{padding: '10px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.2s'}} onMouseOver={e => e.currentTarget.style.background='#f5f7fa'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
            <div className="notification-text" style={{fontWeight: 500, fontSize: '16px'}}>{notification.text}</div>
            <div className="notification-time" style={{fontSize: 12, color: '#888'}}>{notification.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightPanel;