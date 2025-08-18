import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCSRFToken, ensureCSRFToken } from '../../utils/csrf';
import axiosInstance from '../../axiosConfig';

export default function AgreementPreview({
  data,
  vendors = [],
  departments = [],
  agreementTypes = [],
  onSave,
  onEdit,
  viewMode,
  onDataChange,
  onTestReminder,
  isTestingReminder
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedVendor, setSelectedVendor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usersWithAccess, setUsersWithAccess] = useState([]);

  // ---------------------- FIXED: AGREEMENT TYPE DISPLAY ----------------------
  const [agreementTypeLabel, setAgreementTypeLabel] = useState('');
  useEffect(() => {
    if (!data) return;

    let typeValue = data.agreement_type;

    if (typeof typeValue === 'object' && typeValue?.name) {
      setAgreementTypeLabel(typeValue.name); // object with name
    } else if ((typeof typeValue === 'number' || !isNaN(Number(typeValue))) && agreementTypes.length > 0) {
      const foundType = agreementTypes.find(t => String(t.id) === String(typeValue));
      setAgreementTypeLabel(foundType ? foundType.name : '');
    } else if (typeof typeValue === 'string') {
      // Try to find by string id
      const foundType = agreementTypes.find(t => String(t.id) === typeValue);
      setAgreementTypeLabel(foundType ? foundType.name : typeValue);
    } else {
      setAgreementTypeLabel('Not specified');
    }
  }, [data?.agreement_type, agreementTypes]);
  // --------------------------------------------------------------------------

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
    if (partyName) setSelectedVendor(partyName);
  }, [partyName]);

  // Prepare attachment link
  let attachmentLink = null;
  let attachmentName = '';
  if (data?.attachment) {
    attachmentLink = data.attachment;
    attachmentName = data.original_filename || (typeof data.attachment === 'string' ? data.attachment.split('/').pop() : data.attachment.name);
  }

  // Map department id to name
  let departmentDisplay = data?.department;
  if (departmentsArray && departmentsArray.length > 0) {
    if (typeof data?.department === 'number' || (typeof data?.department === 'string' && !isNaN(Number(data?.department)))) {
      const foundDept = departmentsArray.find(d => String(d.id) === String(data?.department));
      if (foundDept) departmentDisplay = foundDept.name;
    } else if (typeof data?.department === 'object' && data?.department?.name) {
      departmentDisplay = data.department.name;
    }
  }

  // Test Reminder function
  const testReminder = async () => {
    const agreementId = data?.id || id;
    if (!agreementId) {
      alert('Please save the agreement first');
      return;
    }
    try {
      const response = await axiosInstance.post(
        `/api/agreements/${agreementId}/test-reminder/`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': await getCSRFToken(),
          },
        }
      );
      alert(`Test reminder sent to ${response.data.to}`);
    } catch (error) {
      alert(`Failed: ${error.response?.data?.error || error.message}`);
      console.error('Test reminder error:', error);
    }
  };

  // Vendor change handler
  const handleVendorChange = (e) => {
    const newVendorName = e.target.value;
    setSelectedVendor(newVendorName);
    const selectedVendorObj = vendorsArray.find(v => v.name === newVendorName);
    const vendorId = selectedVendorObj ? selectedVendorObj.id : null;
    if (onDataChange) {
      onDataChange({ ...data, party_name: vendorId, partyName: newVendorName });
    }
  };

  // Save handler (create/edit)
  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave();
        return;
      }

      await ensureCSRFToken();

      let endpoint = 'api/agreements/submit/';
      let method = 'post';
      let payload;
      let config;

      // EDIT MODE
      if (data.id || data.agreementId) {
        const agreementId = data.id || data.agreementId;
        endpoint = `api/edit/${agreementId}/`;
        method = 'put';
        payload = {
          title: data.agreementTitle || data.title,
          agreement_reference: data.agreementReference || data.agreement_reference,
          agreement_type: data.agreement_type?.id || data.agreement_type,
          department: data.department?.id || data.department,
          party_name: data.party_name,
          start_date: data.startDate || data.start_date,
          expiry_date: data.expiryDate || data.expiry_date,
          reminder_time: data.reminderDate || data.reminder_time,
        };
        if (data.attachment && typeof data.attachment === 'string') payload.attachment_path = data.attachment;
        config = { headers: { 'Content-Type': 'application/json' } };
      }
      // CREATE MODE
      else {
        payload = new FormData();
        payload.append('title', data.agreementTitle || data.title);
        payload.append('agreement_reference', data.agreementReference || data.agreement_reference);
  payload.append('agreement_type', typeof data.agreement_type === 'object' ? data.agreement_type.id : data.agreement_type);
  payload.append('department', typeof data.department === 'object' ? data.department.id : data.department);
        payload.append('party_name', data.party_name);
        payload.append('start_date', data.startDate || data.start_date);
        payload.append('expiry_date', data.expiryDate || data.expiry_date);
        payload.append('reminder_time', data.reminderDate || data.reminder_time);
        if (data.attachment) {
          if (typeof data.attachment === 'string') payload.append('attachment_path', data.attachment);
          else payload.append('attachment', data.attachment);
        }
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      }

      const response = await axiosInstance[method](endpoint, payload, config);
      if (response.data.success) navigate('/agreements');
      else alert('Error saving agreement: ' + response.data.message);
    } catch (error) {
      alert('Error submitting agreement. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute users with access
  function computeUsersWithAccessForNewAgreement() {
    if (!data?.department || !Array.isArray(data.availableUsers)) return [];
    const deptId = typeof data.department === 'object' ? data.department.id : data.department;
    const deptUsers = data.availableUsers.filter(u =>
      u.department === deptId ||
      u.department_id === deptId ||
      u.department?.id === deptId ||
      u.department__id === deptId
    );
    const permUsers = data.availableUsers.filter(u =>
      u.department_permissions?.some(p => p.department === deptId || p.department_id === deptId)
    );
    const all = [...deptUsers, ...permUsers];
    const seen = new Set();
    return all.filter(u => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
  }

  // Fetch users with access
  useEffect(() => {
    const agreementId = data?.id || id;
    if (agreementId) {
      axiosInstance.get(`/agreements/${agreementId}/users-with-access/`)
        .then(res => setUsersWithAccess(res.data.assigned_users || []))
        .catch(() => setUsersWithAccess([]));
    } else if (data?.availableUsers && data?.department) {
      setUsersWithAccess(computeUsersWithAccessForNewAgreement());
    }
  }, [data?.id, id, data?.department, data?.availableUsers]);

  return (
    <div className="agreement-preview" style={{ width: '100%', maxWidth: '800px', margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Agreement Details</h2>

      {/* Agreement ID */}
      <div className="preview-row">
        <div className="preview-group" style={{ flex: 1 }}>
          <label>Agreement ID</label>
          <div>{data?.agreement_id || 'Not assigned yet'}</div>
        </div>
      </div>

      {/* Created By */}
      <div className="preview-row">
        <div className="preview-group" style={{ flex: 1 }}>
          <label>Created By</label>
          <div>{data?.creator_name || 'Not specified'}</div>
        </div>
      </div>

      {/* Title & Reference */}
      <div className="preview-row">
        <div className="preview-group" style={{ flex: 1 }}>
          <label>Agreement Title</label>
          <div>{data?.agreementTitle || data?.title}</div>
        </div>
      </div>

      <div className="preview-row" style={{ display: 'flex', gap: 16 }}>
        <div className="preview-group" style={{ flex: 1 }}>
          <label>Agreement Reference</label>
          <div>{data?.agreementReference || data?.agreement_reference}</div>
        </div>
      </div>

      {/* Agreement Type & Department */}
      <div className="preview-group" style={{ flex: 1 }}>
        <label>Agreement Type</label>
        <div>{data?.agreement_type_name || <em>Not specified</em>}</div>
      </div>

      <div className="preview-row" style={{ display: 'flex', gap: 16 }}>
        <div className="preview-group" style={{ flex: 1 }}>
          <label>Department</label>
          <div>{departmentDisplay}</div>
        </div>
        <div className="preview-group" style={{ flex: 1 }}>
          <label>Party Name</label>
          <div>{selectedVendor || partyName}</div>
        </div>
      </div>

      {/* Dates */}
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

      {/* Attachment */}
      <div className="preview-row">
        <div className="preview-group">
          <label>Attachment</label>
          <div>
            {attachmentLink ? (
              <a href={attachmentLink} target="_blank" rel="noopener noreferrer" download={attachmentName} style={{ color: '#008fd5', textDecoration: 'underline' }}>
                {attachmentName}
              </a>
            ) : 'No file uploaded'}
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="preview-row" style={{ marginTop: '1rem' }}>
        <div className="preview-group" style={{ flex: 1 }}>
          <label>Remarks</label>
          <div style={{ whiteSpace: 'pre-wrap', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', backgroundColor: '#f9f9f9' }}>
            {data?.remarks || <em>No remarks provided.</em>}
          </div>
        </div>
      </div>

      {/* Users with Access */}
      <div className="preview-row">
        <div className="preview-group" style={{ flex: 1 }}>
          <label>Users with Access</label>
          <div style={{ marginTop: 8 }}>
            <strong>Department Users: </strong>
            {usersWithAccess.length ? usersWithAccess.map(u => u.full_name + (u.department__name ? ` (${u.department__name})` : '')).join(', ') : 'No users found'}
          </div>
          {data.executive_users && data.executive_users.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Executive Users: </strong>
              {data.executive_users.map(u => `${u.full_name} (${u.department__name})`).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions" style={{ marginTop: 24 }}>
        {viewMode ? (
          <button className="btn btn-primary" onClick={() => navigate('/agreements')}>Back</button>
        ) : (
          <div style={{ display: 'flex', gap: '20px' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button className="btn" onClick={onEdit}>Edit</button>
          </div>
        )}
      </div>
    </div>
  );
}
