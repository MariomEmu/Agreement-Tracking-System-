import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosConfig';
import { useAgreementContext } from '../../context/AgreementContext';
import { getUserData, getUserPermissions, isUserLoggedIn } from '../../utils/userUtils';
import AgreementPreview from './AgreementPreview';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AgreementForm({ onSubmit, initialData }) {
  const { isEditing: contextIsEditing } = useAgreementContext();
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    title: '',
    agreement_reference: '',
    agreement_type: '',
    status: '',
    start_date: '',
    expiry_date: '',
    reminder_time: '',
    party_name: '',
    attachment: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  // User access management state
  const [usersWithAccess, setUsersWithAccess] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  const [isTestingReminder, setIsTestingReminder] = useState(false);

    // NEW FUNCTION: Test reminder handler
    const testReminder = async () => {
      if (!initialData?.id) {
        alert('Please save the agreement first before testing reminders');
        return;
      }
      
      setIsTestingReminder(true);
      try {
        const response = await axiosInstance.post(
          `/api/agreements/${initialData.id}/test-reminder/`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': await getCSRFToken(),
            }
          }
        );
        
        if (response.data.success) {
          alert(`Test reminder sent successfully to ${response.data.email}`);
        } else {
          alert(response.data.message || 'Test reminder failed');
        }
      } catch (error) {
        console.error('Reminder test failed:', error);
        alert(error.response?.data?.message || 'Failed to send test reminder');
      } finally {
        setIsTestingReminder(false);
      }
    };


  // Check user authentication and permissions
  useEffect(() => {
    if (!isUserLoggedIn()) {
      console.error('User not logged in');
      return;
    }
    const userData = getUserData();
    const permissions = getUserPermissions();
    if (userData && permissions) {
      setUserInfo({ userData, permissions });
    }
  }, []);

  // Fetch available users and current users with access
  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const response = await axiosInstance.get('users/available/');
        setAvailableUsers(response.data.available_users);
        
        if (initialData?.id) {
          const accessResponse = await axiosInstance.get(`agreements/${initialData.id}/users/`);
          setUsersWithAccess(accessResponse.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchAvailableUsers();
  }, [initialData]);

  // Set initial data if editing
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        agreement_reference: initialData.agreement_reference || '',
        agreement_type: initialData.agreement_type || '',
        status: initialData.status || '',
        start_date: initialData.start_date || '',
        expiry_date: initialData.expiry_date || '',
        reminder_time: initialData.reminder_time || '',
        party_name: initialData.party_name || '',
        attachment: initialData.attachment || null,
        original_filename: initialData.original_filename || '',
      });
      setIsEditing(true);
    }
  }, [initialData]);

  // Fetch departments and vendors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const formDataResponse = await axiosInstance.get('agreements/form-data/');
        setDepartments(formDataResponse.data.departments);
        if (formDataResponse.data.user_info) {
          setUserInfo(prev => ({
            ...(prev || {}),
            userData: formDataResponse.data.user_info,
            permissions: {
              canCreateAgreements: true,
              permittedDepartments: formDataResponse.data.departments
            }
          }));
        }
        
        const vendorsResponse = await axiosInstance.get('accounts/vendors/');
        setVendors(vendorsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ general: 'Failed to load form data.' });
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const file = e.target.files[0];
      setForm({
        ...form,
        attachment: file,
        original_filename: file ? file.name : form.original_filename, // update original name
      });
    } else {
      setForm({ ...form, [name]: value });
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.agreement_reference.trim()) newErrors.agreement_reference = 'Reference is required';
    if (!form.agreement_type) newErrors.agreement_type = 'Department is required';
    if (!form.status) newErrors.status = 'Status is required';
    if (!form.start_date) newErrors.start_date = 'Start date is required';
    if (!form.expiry_date) newErrors.expiry_date = 'Expiry date is required';
    if (!form.reminder_time) newErrors.reminder_time = 'Reminder date is required';
    if (!form.party_name) newErrors.party_name = 'Vendor is required';
    if (!form.attachment) newErrors.attachment = 'Attachment is required';
    
    // Date validation
    if (form.start_date && form.expiry_date) {
      const start = new Date(form.start_date);
      const expiry = new Date(form.expiry_date);
      if (expiry < start) {
        newErrors.expiry_date = 'Expiry date cannot be before start date';
      }
    }
    if (form.start_date && form.expiry_date && form.reminder_time) {
      const start = new Date(form.start_date);
      const expiry = new Date(form.expiry_date);
      const reminder = new Date(form.reminder_time);
      if (reminder <= start || reminder >= expiry) {
        newErrors.reminder_time = 'Reminder date must be after start date and before expiry date';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const validateDates = () => {
    const errors = {};
    const { start_date, expiry_date, reminder_time } = form;
  
    if (start_date && expiry_date && new Date(expiry_date) <= new Date(start_date)) {
      errors.expiry_date = "Expiry must be after start date";
    }
  
    if (reminder_time && start_date && new Date(reminder_time) <= new Date(start_date)) {
      errors.reminder_time = "Reminder must be after start date";
    }
  
    if (reminder_time && expiry_date && new Date(reminder_time) >= new Date(expiry_date)) {
      errors.reminder_time = "Reminder must be before expiry date";
    }
  
    return errors;
  };
  
  // Update your submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dateErrors = validateDates();
    if (Object.keys(dateErrors).length > 0) {
      setErrors(dateErrors);
      return;
    }
  }


  const handleUserAccessChange = async (userId, shouldHaveAccess) => {
    try {
      await axiosInstance.post(`agreements/${initialData.id}/users/`, {
        user_id: userId,
        should_have_access: shouldHaveAccess
      });
      
      if (shouldHaveAccess) {
        const userToAdd = availableUsers.find(u => u.id === userId);
        setUsersWithAccess([...usersWithAccess, userToAdd]);
      } else {
        setUsersWithAccess(usersWithAccess.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Error updating user access:', error);
    }
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowPreview(true);
  };

  const handleEdit = () => setShowPreview(false);

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let payload, headers, endpoint, method;
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

      if (isEditing && initialData?.id) {
        // EDIT: send FormData if a new file is selected, otherwise send JSON
        let payload, headers, endpoint, method;
        endpoint = `edit/${initialData.id}/`;
        method = 'put';

        if (form.attachment instanceof File) {
          // New file selected: use FormData
          payload = new FormData();
          payload.append('title', form.title);
          payload.append('agreement_reference', form.agreement_reference);
          payload.append('agreement_type', form.agreement_type);
          payload.append('status', form.status);
          payload.append('start_date', form.start_date);
          payload.append('expiry_date', form.expiry_date);
          payload.append('reminder_time', form.reminder_time);
          payload.append('party_name', form.party_name);
          payload.append('attachment', form.attachment);
          headers = {
            'Content-Type': 'multipart/form-data',
            'X-CSRFToken': csrfToken,
          };
        } else {
          // No new file: use JSON
          payload = {
            title: form.title,
            agreement_reference: form.agreement_reference,
            agreement_type: form.agreement_type,
            status: form.status,
            start_date: form.start_date,
            expiry_date: form.expiry_date,
            reminder_time: form.reminder_time,
            party_name: form.party_name,
          };
          headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          };
        }

        const response = await axiosInstance[method](endpoint, payload, { headers, withCredentials: true });

        if (response.data.success) {
          navigate('/agreements');
        } else {
          setErrors(response.data.errors || { general: response.data.message });
        }
      } else {
        // CREATE: send FormData
        endpoint = 'agreements/submit/';
        method = 'post';
        payload = new FormData();
        payload.append('title', form.title);
        payload.append('agreement_reference', form.agreement_reference);
        payload.append('agreement_type', form.agreement_type);
        payload.append('status', form.status);
        payload.append('start_date', form.start_date);
        payload.append('expiry_date', form.expiry_date);
        payload.append('reminder_time', form.reminder_time);
        payload.append('party_name', form.party_name);
        if (form.attachment instanceof File) {
          // User selected a new file
          payload.append('attachment', form.attachment);
        } else if (typeof form.attachment === 'string') {
          // No new file selected, keep the existing one
          payload.append('existing_attachment', form.attachment);
        }
        if (csrfToken) {
          payload.append('csrfmiddlewaretoken', csrfToken);
        }
        headers = {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrfToken,
        };
      }

      const response = await axiosInstance[method](endpoint, payload, {
        headers,
        withCredentials: true,
      });

      if (response.data.success) {
        navigate('/agreements');
      } else {
        setErrors(response.data.errors || { general: response.data.message });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({
        general: error.response?.data?.message || 'Failed to submit agreement'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === parseInt(vendorId));
    return vendor ? vendor.name : '';
  };

  if (!userInfo) {
    return <div className="loading">Loading user information...</div>;
  }

  if (!userInfo.permissions.canCreateAgreements) {
    return (
      <div className="error-message">
        <div>You do not have permission to create agreements.</div>
        <div>Please contact your administrator.</div>
      </div>
    );
  }

   if (showPreview) {
    return (
      <AgreementPreview
        data={{
          agreementTitle: form.title,
          agreementReference: form.agreement_reference,
          department: form.agreement_type,
          party_name: form.party_name,
          startDate: form.start_date,
          expiryDate: form.expiry_date,
          reminderDate: form.reminder_time,
          status: form.status,
          attachment: form.attachment,
          usersWithAccess,
          availableUsers,
          id: initialData?.id, // Ensure ID is passed to preview
          agreement_id: initialData?.agreement_id, // Add agreement_id
          creator_name: initialData?.creator_name || userInfo?.userData?.full_name, // Add creator_name from initialData or current user
        }}
        vendors={vendors}
        departments={departments}
        onEdit={handleEdit}
        onSave={handleSave}
        onUserAccessChange={handleUserAccessChange}
        viewMode={false}
        onDataChange={(updatedData) => {
          if (updatedData.party_name !== form.party_name) {
            setForm(prev => ({
              ...prev,
              party_name: updatedData.party_name
            }));
          }
        }}
        onTestReminder={testReminder}
        isTestingReminder={isTestingReminder}
      />
    );
  }

  return (
    <form className="agreement-form" onSubmit={handlePreview} style={{maxWidth: 800, margin: '0 auto'}}>
      <h2>{isEditing ? 'Edit Agreement' : 'Create Agreement'}</h2>
      
      <div className="user-info">
        <strong>User:</strong> {userInfo.userData.full_name} | 
        <strong> Department:</strong> {userInfo.userData.department?.name || 'None'}
      </div>
      
      {errors.general && (
        <div className="error-alert">{errors.general}</div>
      )}

      <div className="form-group">
        <label>Agreement Title *</label>
        <input 
          name="title" 
          value={form.title || ''} 
          onChange={handleChange} 
          className={errors.title ? 'error' : ''}
          required 
        />
        {errors.title && <div className="error-text">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label>Agreement Reference *</label>
        <input 
          name="agreement_reference" 
          value={form.agreement_reference || ''} 
          onChange={handleChange} 
          className={errors.agreement_reference ? 'error' : ''}
          required 
        />
        {errors.agreement_reference && <div className="error-text">{errors.agreement_reference}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Department *</label>
          <select 
            name="agreement_type" 
            value={form.agreement_type || ''} 
            onChange={handleChange} 
            className={errors.agreement_type ? 'error' : ''}
            required
          >
            <option value="">Select Department</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.agreement_type && <div className="error-text">{errors.agreement_type}</div>}
        </div>

        <div className="form-group">
          <label>Party *</label>
          <select 
            name="party_name" 
            value={form.party_name || ''} 
            onChange={handleChange} 
            className={errors.party_name ? 'error' : ''}
            required
          >
            <option value="">Select Vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          {errors.party_name && <div className="error-text">{errors.party_name}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Date *</label>
          <input 
            type="date" 
            name="start_date" 
            value={form.start_date || ''} 
            onChange={handleChange} 
            className={errors.start_date ? 'error' : ''}
            required 
          />
          {errors.start_date && <div className="error-text">{errors.start_date}</div>}
        </div>

        <div className="form-group">
          <label>Expiry Date *</label>
          <input 
            type="date" 
            name="expiry_date" 
            value={form.expiry_date || ''} 
            onChange={handleChange} 
            className={errors.expiry_date ? 'error' : ''}
            required 
          />
          {errors.expiry_date && <div className="error-text" style={{ color: 'red' }}>{errors.expiry_date}</div>}
        </div>

        <div className="form-group">
          <label>Reminder Date *</label>
          <input 
            type="date" 
            name="reminder_time" 
            value={form.reminder_time || ''} 
            onChange={handleChange} 
            className={errors.reminder_time ? 'error' : ''}
            required 
          />
          {errors.reminder_time && <div className="error-text" style={{ color: 'red' }}>{errors.reminder_time}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Status *</label>
          <select 
            name="status" 
            value={form.status || ''} 
            onChange={handleChange} 
            className={errors.status ? 'error' : ''}
            required
          >
            <option value="">Select Status</option>
            <option value="ongoing">Ongoing</option>
            <option value="expired">Expired</option>
          </select>
          {errors.status && <div className="error-text">{errors.status}</div>}
        </div>

        <div className="form-group">
          <label>Attachment *</label>
          <input 
            type="file" 
            name="attachment" 
            onChange={handleChange} 
            className={errors.attachment ? 'error' : ''}
            accept=".pdf,.doc,.docx,.txt"
            required={!isEditing} // Only required when creating
          />
          {errors.attachment && <div className="error-text">{errors.attachment}</div>}
          {isEditing && form.attachment && form.original_filename && (
            <div>
              Current file: <a href={form.attachment} download={form.original_filename}>
                {form.original_filename}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : (isEditing ? 'Preview Agreement' : 'Preview')}
        </button>
        <button 
          type="button" 
          className="btn"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Back
        </button>
      </div>
    </form>
  );
}
