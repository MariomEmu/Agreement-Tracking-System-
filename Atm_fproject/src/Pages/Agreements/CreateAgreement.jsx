import React, { useState, useEffect } from 'react';
import { useAgreementContext } from '../../context/AgreementContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Layout/Header';
import { LeftPanel } from '../../components/Layout/LeftPanel';
import { RightPanel } from '../../components/Layout/RightPanel';

const CreateAgreement = () => {
  const { agreementData, isEditing, stopEditing, updateAgreementData } = useAgreementContext();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    reference: '',
    type: '',
    party: '',
    startDate: '',
    endDate: '',
    department: '',
    status: 'Draft',
    file: null
  });

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && agreementData) {
      setFormData({
        title: agreementData.agreementTitle || '',
        reference: agreementData.agreementReference || '',
        type: agreementData.type || '',
        party: agreementData.counterParty || '',
        startDate: agreementData.startDate || '',
        endDate: agreementData.expiryDate || '',
        department: agreementData.department || '',
        status: agreementData.status || 'Draft',
        file: agreementData.attachment || null
      });
    }
  }, [isEditing, agreementData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert form data to agreement format
    const updatedAgreementData = {
      agreementTitle: formData.title,
      agreementReference: formData.reference,
      type: formData.type,
      counterParty: formData.party,
      startDate: formData.startDate,
      expiryDate: formData.endDate,
      department: formData.department,
      status: formData.status,
      attachment: formData.file
    };

    if (isEditing) {
      // Update existing agreement
      updateAgreementData(updatedAgreementData);
      stopEditing();
      navigate('/agreements/preview');
    } else {
      // Create new agreement
      updateAgreementData(updatedAgreementData);
      navigate('/agreements/preview');
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      stopEditing();
    }
    navigate('/agreements');
  };

  return (
    <div className="app-layout">
      <Header />
      <div className="main-content">
        <LeftPanel />
        <div className="content-area">
          <h1>{isEditing ? 'Edit Agreement' : 'Create New Agreement'}</h1>
          
          <form onSubmit={handleSubmit} className="agreement-form">
            <div className="form-section">
              <h2>Basic Information</h2>
              <div className="form-group">
                <label>Agreement Title*</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Reference Number*</label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Agreement Type*</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Service">Service Agreement</option>
                    <option value="Lease">Lease Agreement</option>
                    <option value="NDA">NDA</option>
                    <option value="AMC">AMC</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Parties Information</h2>
              <div className="form-group">
                <label>Counter Party*</label>
                <input
                  type="text"
                  name="party"
                  value={formData.party}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date*</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>End Date*</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Additional Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Department*</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="IT">IT</option>
                    <option value="BD">Business Development</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Upload Agreement Document*</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  required
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
              <button type="submit" className="submit-btn">
                {isEditing ? 'Update Agreement' : 'Create Agreement'}
              </button>
            </div>
          </form>
        </div>
        <RightPanel />
      </div>
    </div>
  );
};

export default CreateAgreement;