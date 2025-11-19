import React, { useState } from 'react';
import { leadService, CreateLeadData } from '../../services/lead.service';
import './AddLeadModal.css';

interface AddLeadModalProps {
  onClose: () => void;
  onLeadAdded: () => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ onClose, onLeadAdded }) => {
  const [formData, setFormData] = useState<CreateLeadData>({
    firstName: '',
    middleName: '',
    lastName: '',
    contactPerson: '',
    companyName: '',
    source: 'WEBSITE',
    sourceDetails: '',
    leadType: undefined,
    leadPriority: 'MEDIUM',
    status: 'NEW',
    industry: '',
    dealValue: undefined,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? parseFloat(value) : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim()) {
      setError('Lead First Name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await leadService.createLead(formData);
      if (response.success) {
        onLeadAdded();
      } else {
        setError(response.message || 'Failed to create lead');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content new-lead-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Lead Details</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form new-lead-form">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-section">
            {/* Row 1: Name fields */}
            <div className="form-row three-col">
              <div className="form-group">
                <label htmlFor="firstName">Lead First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder=""
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="middleName">Lead Middle Name</label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder=""
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Lead Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder=""
                />
              </div>
            </div>

            {/* Row 2: Contact, Company, Source */}
            <div className="form-row three-col">
              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder=""
                />
              </div>
              <div className="form-group">
                <label htmlFor="companyName">Company</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder=""
                />
              </div>
              <div className="form-group">
                <label htmlFor="source">Source</label>
                <select
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                >
                  <option value="WEBSITE">Website</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="COLD_CALL">Cold Call</option>
                  <option value="EMAIL_CAMPAIGN">Email Campaign</option>
                  <option value="TRADE_SHOW">Trade Show</option>
                  <option value="PARTNER">Partner</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Row 3: Deal Value, Source Details, Lead Type */}
            <div className="form-row three-col">
              <div className="form-group">
                <label htmlFor="dealValue">Deal Value</label>
                <input
                  type="number"
                  id="dealValue"
                  name="dealValue"
                  value={formData.dealValue || ''}
                  onChange={handleNumberChange}
                  placeholder=""
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label htmlFor="sourceDetails">Lead Source Details</label>
                <input
                  type="text"
                  id="sourceDetails"
                  name="sourceDetails"
                  value={formData.sourceDetails}
                  onChange={handleChange}
                  placeholder=""
                />
              </div>
              <div className="form-group">
                <label htmlFor="leadType">Lead Type</label>
                <input
                  type="text"
                  id="leadType"
                  name="leadType"
                  value={formData.leadType || ''}
                  onChange={handleChange}
                  placeholder=""
                  list="leadTypeOptions"
                />
                <datalist id="leadTypeOptions">
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="BUSINESS">Business</option>
                  <option value="CORPORATE">Corporate</option>
                  <option value="GOVERNMENT">Government</option>
                </datalist>
              </div>
            </div>

            {/* Row 4: Lead Priority, Lead Status, Industry */}
            <div className="form-row three-col">
              <div className="form-group">
                <label htmlFor="leadPriority">Lead Priority</label>
                <input
                  type="text"
                  id="leadPriority"
                  name="leadPriority"
                  value={formData.leadPriority || ''}
                  onChange={handleChange}
                  placeholder=""
                  list="leadPriorityOptions"
                />
                <datalist id="leadPriorityOptions">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </datalist>
              </div>
              <div className="form-group">
                <label htmlFor="status">Lead Status</label>
                <input
                  type="text"
                  id="status"
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  placeholder=""
                  list="leadStatusOptions"
                />
                <datalist id="leadStatusOptions">
                  <option value="NEW">New</option>
                  <option value="KNOCKOUT_FAILED">Knockout Failed</option>
                  <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                </datalist>
              </div>
              <div className="form-group">
                <label htmlFor="industry">Industry</label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder=""
                />
              </div>
            </div>

            {/* Row 5: Initial Notes */}
            <div className="form-group full-width">
              <label htmlFor="notes">Initial Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder=""
                rows={4}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
