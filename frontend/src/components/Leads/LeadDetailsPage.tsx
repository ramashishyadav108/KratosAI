import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../Dashboard';
import { leadService, Lead, LeadStatus, LeadSource } from '../../services/lead.service';
import './LeadDetailsPage.css';

const LeadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await leadService.getLeadById(id!);
      if (response.success && response.data) {
        setLead(response.data);
        setEditData(response.data);
      } else {
        setError('Lead not found');
      }
    } catch (err) {
      setError('Failed to fetch lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    try {
      const response = await leadService.updateLead(id, editData);
      if (response.success && response.data) {
        setLead(response.data);
        setIsEditing(false);
      }
    } catch (err) {
      setError('Failed to update lead');
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadService.deleteLead(id);
        navigate('/deal-sourcing/create-leads');
      } catch (err) {
        setError('Failed to delete lead');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStatusColor = (status: LeadStatus): string => {
    const colors: Record<LeadStatus, string> = {
      NEW: '#10b981',
      KNOCKOUT_FAILED: '#ef4444',
      MEETING_SCHEDULED: '#f59e0b',
      QUALIFIED: '#3b82f6',
      PROPOSAL_SENT: '#8b5cf6',
      NEGOTIATION: '#6366f1',
      WON: '#10b981',
      LOST: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: LeadStatus): string => {
    const labels: Record<LeadStatus, string> = {
      NEW: 'New',
      KNOCKOUT_FAILED: 'Knockout Failed',
      MEETING_SCHEDULED: 'Meeting Scheduled',
      QUALIFIED: 'Qualified',
      PROPOSAL_SENT: 'Proposal Sent',
      NEGOTIATION: 'Negotiation',
      WON: 'Won',
      LOST: 'Lost',
    };
    return labels[status] || status;
  };

  const getSourceLabel = (source: LeadSource): string => {
    const labels: Record<LeadSource, string> = {
      WEBSITE: 'Website',
      REFERRAL: 'Referral',
      LINKEDIN: 'LinkedIn',
      COLD_CALL: 'Cold Call',
      EMAIL_CAMPAIGN: 'Email Campaign',
      TRADE_SHOW: 'Trade Show',
      PARTNER: 'Partner',
      OTHER: 'Other',
    };
    return labels[source] || source;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount?: number): string => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="lead-details-page">
          <div className="loading-state">Loading lead details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !lead) {
    return (
      <DashboardLayout>
        <div className="lead-details-page">
          <div className="error-state">
            <p>{error || 'Lead not found'}</p>
            <button onClick={() => navigate('/deal-sourcing/create-leads')}>
              Back to Leads
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="lead-details-page">
        <div className="details-header">
          <button className="back-btn" onClick={() => navigate('/deal-sourcing/create-leads')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Leads
          </button>
          <div className="header-actions">
            {isEditing ? (
              <>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleUpdate}>
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button className="delete-btn" onClick={handleDelete}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="details-content">
          <div className="details-card">
            <div className="card-header">
              <div className="lead-avatar-large">
                {lead.firstName.charAt(0).toUpperCase()}
              </div>
              <div className="lead-header-info">
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      name="firstName"
                      value={editData.firstName || ''}
                      onChange={handleChange}
                      className="edit-input"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={editData.lastName || ''}
                      onChange={handleChange}
                      className="edit-input"
                      placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <h1>{`${lead.firstName} ${lead.middleName || ''} ${lead.lastName || ''}`.trim()}</h1>
                )}
                <p>{lead.companyName || 'No company'}</p>
              </div>
              <span
                className="status-badge-large"
                style={{ backgroundColor: getStatusColor(lead.status) }}
              >
                {getStatusLabel(lead.status)}
              </span>
            </div>

            <div className="details-grid">
              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email || ''}
                      onChange={handleChange}
                      className="edit-input"
                    />
                  ) : (
                    <span className="detail-value">{lead.email || '-'}</span>
                  )}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone || ''}
                      onChange={handleChange}
                      className="edit-input"
                    />
                  ) : (
                    <span className="detail-value">{lead.phone || '-'}</span>
                  )}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Company</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="companyName"
                      value={editData.companyName || ''}
                      onChange={handleChange}
                      className="edit-input"
                    />
                  ) : (
                    <span className="detail-value">{lead.companyName || '-'}</span>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Lead Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Source</span>
                  {isEditing ? (
                    <select
                      name="source"
                      value={editData.source || ''}
                      onChange={handleChange}
                      className="edit-input"
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
                  ) : (
                    <span className="detail-value">{getSourceLabel(lead.source)}</span>
                  )}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  {isEditing ? (
                    <select
                      name="status"
                      value={editData.status || ''}
                      onChange={handleChange}
                      className="edit-input"
                    >
                      <option value="NEW">New</option>
                      <option value="KNOCKOUT_FAILED">Knockout Failed</option>
                      <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="PROPOSAL_SENT">Proposal Sent</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="WON">Won</option>
                      <option value="LOST">Lost</option>
                    </select>
                  ) : (
                    <span className="detail-value">{getStatusLabel(lead.status)}</span>
                  )}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Assigned RM</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="assignedRM"
                      value={editData.assignedRM || ''}
                      onChange={handleChange}
                      className="edit-input"
                    />
                  ) : (
                    <span className="detail-value">{lead.assignedRM || '-'}</span>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Deal Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Deal Value</span>
                  <span className="detail-value">{formatCurrency(lead.dealValue)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Lead Priority</span>
                  <span className="detail-value">
                    {lead.leadPriority || '-'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Lead Type</span>
                  <span className="detail-value">
                    {lead.leadType || '-'}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Timeline</h3>
                <div className="detail-row">
                  <span className="detail-label">Created At</span>
                  <span className="detail-value">{formatDate(lead.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">{formatDate(lead.updatedAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created By</span>
                  <span className="detail-value">{lead.createdBy?.name || lead.createdBy?.email}</span>
                </div>
              </div>
            </div>

            {lead.notes && (
              <div className="notes-section">
                <h3>Notes</h3>
                {isEditing ? (
                  <textarea
                    name="notes"
                    value={editData.notes || ''}
                    onChange={handleChange}
                    className="edit-input notes-textarea"
                    rows={4}
                  />
                ) : (
                  <p>{lead.notes}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadDetailsPage;
