export const AgreementDetails = () => {
  return (
    <div className="agreement-details">
      <div className="details-header">
        <h2>Agreement Details</h2>
      </div>

      <div className="details-section">
        <table className="details-table">
          <thead>
            <tr>
              <th>Agreement ID</th>
              <th>Agreement Reference</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A202501</td>
              <td>Agreement/2025/CBS/2001</td>
              <td>Malaysia</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="details-section">
        <h3>Intellect CBS AMC</h3>
      </div>

      <div className="details-grid">
        <div className="detail-item">
          <label>Start Date</label>
          <div>02 Mar 2025</div>
        </div>
        <div className="detail-item">
          <label>Expiry Date</label>
          <div>02 Mar 2025</div>
        </div>
        <div className="detail-item">
          <label>Reminder Date</label>
          <div>02 Mar 2025</div>
        </div>
        <div className="detail-item">
          <label>Department</label>
          <div>Business Development (BD)</div>
        </div>
        <div className="detail-item">
          <label>Status</label>
          <div>Active</div>
        </div>
        <div className="detail-item">
          <label>Attachment</label>
          <div>Sample agreement.pdf</div>
        </div>
      </div>

      <div className="users-section">
        <h4>Users with Access</h4>
        <ul>
          {['Saim Bin Selim', 'Ayrur Rahman', 'S M Jahangir Akriter'].map(user => (
            <li key={user}>
              {user} <button className="remove-btn">X</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="action-buttons">
        <button className="secondary-button">Preview</button>
        <button className="primary-button">Back</button>
      </div>
    </div>
  );
};