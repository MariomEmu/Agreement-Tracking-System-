export const Notifications = () => {
  const notifications = [
    { text: 'New agreement created', time: 'Just now' },
    { text: 'New permission- Saim', time: 'Submitted also' },
    { text: 'New agreement created', time: 'Ready to pay out' },
    { text: 'New agreement created', time: '14 Jan 2025, 11:59 AM' }
  ];

  return (
    <div className="notifications-card">
      <h3>Notifications</h3>
      <div className="notification-list">
        {notifications.map((notif, index) => (
          <div key={index} className="notification-item">
            <div className="notification-text">{notif.text}</div>
            <div className="notification-time">{notif.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};