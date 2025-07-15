import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCSRFToken, ensureCSRFToken } from '../../utils/csrf';
import axiosInstance from '../../axiosConfig';

export default function AgreementPreview({ data, vendors = [], departments = [], onSave, onEdit, viewMode, onDataChange, onTestReminder, isTestingReminder }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedVendor, setSelectedVendor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usersWithAccess, setUsersWithAccess] = useState([]);

  // Ensure vendors and departments are arrays
  const vendorsArray = Array.isArray(vendors) ? vendors : [];
  const departmentsArray = Array.isArray(departments) ? departments : [];

  // Find the vendor name if party_name is an ID
  let partyName = data?.party_name || data?.partyName;
  if (vendorsArray.length && partyName && (typeof partyName === 'number' || !isNaN(Number(partyName)))) {
    const found = vendorsArray.find(v => String(v.id) === String(partyName));
    if (found) partyName = found.name;
  }

  // Set initial selected vendor
  useEffect(() => {
    if (partyName) {
      setSelectedVendor(partyName);
    }
  }, [partyName]);

  // Prepare attachment link
  let attachmentLink = null;
  let attachmentName = '';
  if (data?.attachment) {
    attachmentLink = data.attachment;
    // Use the original filename from the API if available, otherwise fallback
    attachmentName = data.original_filename || (typeof data.attachment === 'string' ? data.attachment.split('/').pop() : data.attachment.name);
  }

  // Map department id to name
  let departmentDisplay = data?.department;
  if (departmentsArray && departmentsArray.length > 0) {
    // department can be id or object or name
    if (typeof data?.department === 'number' || (typeof data?.department === 'string' && !isNaN(Number(data?.department)))) {
      const foundDept = departmentsArray.find(d => String(d.id) === String(data?.department));
      if (foundDept) departmentDisplay = foundDept.name;
    } else if (typeof data?.department === 'object' && data?.department !== null && data?.department.name) {
      departmentDisplay = data.department.name;
    }
  }

   // Add the testReminder function
   const testReminder = async () => {
    const agreementId = data?.id || id;
    if (!agreementId) {
      alert('Please save the agreement first');
      return;
    }
  
    try {
      console.log('Attempting to send test reminder...');
      const response = await axiosInstance.post(
        `/api/agreements/${agreementId}/test-reminder/`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': await getCSRFToken(),
          }
        }
      );
      
      console.log('Reminder response:', response.data);
      alert(`Test reminder sent to ${response.data.to}`);
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      alert(`Failed: ${error.response?.data?.error || error.message}`);
    }
  };

  
  const handleVendorChange = (e) => {
    const newVendorName = e.target.value;
    setSelectedVendor(newVendorName);
    // Find the vendor ID for the selected name
    const selectedVendorObj = vendorsArray.find(v => v.name === newVendorName);
    const vendorId = selectedVendorObj ? selectedVendorObj.id : null;
    // Update the data if onDataChange callback is provided
    if (onDataChange) {
      onDataChange({
        ...data,
        party_name: vendorId,
        partyName: newVendorName
      });
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (onSave) {
        onSave();
        return;
      }
      const csrfToken = await ensureCSRFToken();
      let endpoint = 'api/agreements/submit/';
      let method = 'post';
      let payload;
      let config;
      if (data.id || data.agreementId) {
        // EDIT MODE: Use PUT and JSON
        const agreementId = data.id || data.agreementId;
        endpoint = `api/edit/${agreementId}/`;
        method = 'put';
        // Build plain JS object for JSON
        payload = {
          title: data.agreementTitle || data.title,
          agreement_reference: data.agreementReference || data.agreement_reference,
          agreement_type: data.department,
          party_name: data.party_name,
          start_date: data.startDate || data.start_date,
          expiry_date: data.expiryDate || data.expiry_date,
          reminder_time: data.reminderDate || data.reminder_time,
          status: data.status,
        };
        if (data.attachment && typeof data.attachment === 'string') {
          payload.attachment_path = data.attachment;
        }
        config = { headers: { 'Content-Type': 'application/json' } };
      } else {
        // CREATE MODE: Use POST and FormData
        payload = new FormData();
        payload.append('title', data.agreementTitle || data.title);
        payload.append('agreement_reference', data.agreementReference || data.agreement_reference);
        payload.append('agreement_type', data.department);
        payload.append('party_name', data.party_name);
        payload.append('start_date', data.startDate || data.start_date);
        payload.append('expiry_date', data.expiryDate || data.expiry_date);
        payload.append('reminder_time', data.reminderDate || data.reminder_time);
        payload.append('status', data.status);
        if (data.attachment) {
          if (typeof data.attachment === 'string') {
            payload.append('attachment_path', data.attachment);
          } else {
            payload.append('attachment', data.attachment);
          }
        }
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      }
      const response = await axiosInstance[method](endpoint, payload, config);
      if (response.data.success) {
        navigate('/agreements');
      } else {
        console.error('Error saving agreement:', response.data.message);
        alert('Error saving agreement: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error submitting agreement:', error);
      if (error.message === 'Unable to get CSRF token') {
        alert('CSRF token error. Please refresh the page and try again.');
      } else if (error.response?.status === 403) {
        alert('CSRF token error. Please refresh the page and try again.');
      } else {
        alert('Error submitting agreement. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get users with access for new agreements (no ID)
  function computeUsersWithAccessForNewAgreement() {
    if (!data?.department || !Array.isArray(data.availableUsers)) return [];
    // department can be id or object
    const deptId = typeof data.department === 'object' ? data.department.id : data.department;
    // Users with department match
    const deptUsers = data.availableUsers.filter(u => {
      // department__id or department.id or department
      return (
        u.department === deptId ||
        u.department_id === deptId ||
        u.department?.id === deptId ||
        u.department__id === deptId
      );
    });
    // Users with department permission match
    const permUsers = data.availableUsers.filter(u => {
      if (!u.department_permissions) return false;
      return u.department_permissions.some(
        p => p.department === deptId || p.department_id === deptId
      );
    });
    // Deduplicate by user id
    const all = [...deptUsers, ...permUsers];
    const seen = new Set();
    return all.filter(u => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
  }

  // Fetch users with access when viewing an agreement (edit/view mode)
  useEffect(() => {
    const agreementId = data?.id || id;
    if (agreementId) {
      axiosInstance.get(`/agreements/${agreementId}/users-with-access/`)
        .then(res => setUsersWithAccess(res.data.assigned_users || []))
        .catch(() => setUsersWithAccess([]));
    } else if (data?.availableUsers && data?.department) {
      setUsersWithAccess(computeUsersWithAccessForNewAgreement());
    }
    // eslint-disable-next-line
  }, [data?.id, id, data?.department, data?.availableUsers]);

  return (
    <div className="agreement-preview" style={{width: '100%', maxWidth: '800px', margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
      <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Agreement Details</h2>
      
      {/* Agreement ID and Creator Information */}
      <div className="preview-row" style={{display: 'flex', gap: 16, marginBottom: '1rem', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '4px'}}>
        <div className="preview-group" style={{flex: 1}}>
          <label style={{fontWeight: 'bold', color: '#495057'}}>Agreement ID</label>
          <div style={{fontSize: '1.1em', color: '#007bff'}}>{data?.agreement_id || 'Not assigned yet'}</div>
        </div>
        <div className="preview-group" style={{flex: 1}}>
          <label style={{fontWeight: 'bold', color: '#495057'}}>Created By</label>
          <div style={{fontSize: '1.1em', color: '#495057'}}>{data?.creator_name || 'Not specified'}</div>
        </div>
      </div>
      
      <div className="preview-row">
        <div className="preview-group" style={{flex: 1}}>
          <label>Agreement Title</label>
          <div>{data?.agreementTitle || data?.title}</div>
        </div>
      </div>
      <div className="preview-row" style={{display: 'flex', gap: 16}}>
        <div className="preview-group" style={{flex: 1}}>
          <label>Agreement Reference</label>
          <div>{data?.agreementReference || data?.agreement_reference}</div>
        </div>
      </div>
      <div className="preview-row" style={{display: 'flex', gap: 16}}>
        <div className="preview-group" style={{flex: 1}}>
          <label>Department</label>
          <div>{departmentDisplay}</div>
        </div>
        <div className="preview-group" style={{flex: 1}}>
          <label>Party Name</label>
          {viewMode ? (
            <div>{selectedVendor || partyName}</div>
          ) : (
            <select 
              value={selectedVendor} 
              onChange={handleVendorChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Select a vendor</option>
              {vendorsArray.map((vendor) => (
                <option key={vendor.id} value={vendor.name}>
                  {vendor.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="preview-row">
        <div className="preview-group">
          <label>Start Date</label>
          <div>{data?.startDate || data?.start_date}</div>
        </div>
        <div className="preview-group">
          <label>Expiry Date</label>
          <div>{data?.expiryDate || data?.expiry_date}</div>
        </div>
        <div className="preview-group">
          <label>Reminder Date</label>
          <div>{data?.reminderDate || data?.reminder_time}</div>
        </div>
      </div>
      <div className="preview-row">
        <div className="preview-group">
          <label>Status</label>
          <div>{data?.status}</div>
        </div>
        <div className="preview-group">
          <label>Attachment</label>
          <div>
            {attachmentLink ? (
              <a
                href={attachmentLink}
                target="_blank"
                rel="noopener noreferrer"
                download={attachmentName}
                style={{ color: '#008fd5', textDecoration: 'underline' }}
              >
                {attachmentName}
              </a>
            ) : (
              'No file uploaded'
            )}
          </div>
        </div>
      </div>
      <div className="preview-row">
        <div className="preview-group" style={{flex: 1}}>
          <label>Users with Access</label>
          <div style={{marginTop: 8}}>
            <strong>Department Users: </strong>
            {usersWithAccess && usersWithAccess.length ? (
              usersWithAccess
                .map(u => u.full_name + (u.department__name ? ` (${u.department__name})` : ''))
                .join(', ')
            ) : 'No users found'}
          </div>
          {data.executive_users && data.executive_users.length > 0 && (
      <div style={{ marginTop: 8 }}>
        <strong>Executive Users: </strong>
        <span>
          {data.executive_users
            .map(u => `${u.full_name} (${u.department__name})`)
            .join(', ')
          }
        </span>
      </div>
    )}
        </div>
      </div>
      
<div className="form-actions" style={{marginTop: 24}}>
  {viewMode ? (
    <button className="btn btn-primary" onClick={() => navigate('/agreements')}>Back</button>
  ) : (
    <>
      <button 
        className="btn btn-primary" 
        onClick={async () => {
          await onSave();
          navigate('/agreements');
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
      <button className="btn" onClick={onEdit}>Edit</button>
      
      {/* NEW TEST REMINDER BUTTON */}
      {data?.id && (
        <button 
          className="btn btn-warning" 
          onClick={onTestReminder}
          disabled={isTestingReminder}
          style={{ marginLeft: '12px', backgroundColor: '#ffc107', color: '#000' }}
        >
          {isTestingReminder ? 'Sending...' : 'Test Reminder'}
        </button>
      )}
    </>
  )}
</div>
  </div>
  );
} 