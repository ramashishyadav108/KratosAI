import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../Dashboard';
import { leadService, Lead, LeadStatus, LeadSource } from '../../services/lead.service';
import './LeadsPage.css';

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<LeadStatus>>(new Set());
  const [selectedSources, setSelectedSources] = useState<Set<LeadSource>>(new Set());
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sourceFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
        setActiveFilterMenu(null);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (sourceFilter) filters.source = sourceFilter;
      if (searchQuery) filters.search = searchQuery;

      const response = await leadService.getAllLeads(filters);
      if (response.success && response.data) {
        setLeads(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const toggleStatusFilter = (status: LeadStatus) => {
    const newSelected = new Set(selectedStatuses);
    if (newSelected.has(status)) {
      newSelected.delete(status);
    } else {
      newSelected.add(status);
    }
    setSelectedStatuses(newSelected);
    // Apply first selected status as filter (for simplicity)
    setStatusFilter(newSelected.size > 0 ? Array.from(newSelected)[0] : '');
  };

  const toggleSourceFilter = (source: LeadSource) => {
    const newSelected = new Set(selectedSources);
    if (newSelected.has(source)) {
      newSelected.delete(source);
    } else {
      newSelected.add(source);
    }
    setSelectedSources(newSelected);
    setSourceFilter(newSelected.size > 0 ? Array.from(newSelected)[0] : '');
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
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFullName = (lead: Lead): string => {
    return [lead.firstName, lead.middleName, lead.lastName].filter(Boolean).join(' ');
  };

  return (
    <DashboardLayout>
      <div className="leads-page">
        <div className="leads-breadcrumb">
          <span className="breadcrumb-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </span>
          <span className="breadcrumb-separator">&gt;&gt;</span>
          <span className="breadcrumb-text">Deal Sourcing & Tracking</span>
        </div>

        <div className="leads-outer-container">
          <div className="leads-outer-header">
            <h1 className="leads-outer-title">Create All Leads in the System</h1>
            <button className="add-lead-btn" onClick={() => navigate('/leads/new')}>
              Add New Lead
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div className="leads-inner-container">
            <div className="leads-toolbar">
            <h2 className="active-leads-title">Active Leads</h2>
            <div className="leads-actions">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search borrowers, applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="leads-search-input"
                  />
                </div>
              </form>
              <div className="filter-dropdown-container" ref={filterDropdownRef}>
                <button className="filter-btn" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                  Filter
                </button>
                {showFilterDropdown && (
                  <div className="filter-dropdown enhanced">
                    <div
                      className={`filter-menu-item ${activeFilterMenu === 'status' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveFilterMenu('status')}
                    >
                      <span>Status</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                    <div
                      className={`filter-menu-item ${activeFilterMenu === 'source' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveFilterMenu('source')}
                    >
                      <span>Source</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                    <div
                      className={`filter-menu-item ${activeFilterMenu === 'rm' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveFilterMenu('rm')}
                    >
                      <span>RM</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                    <div
                      className={`filter-menu-item ${activeFilterMenu === 'date' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveFilterMenu('date')}
                    >
                      <span>Date Range</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>

                    {/* Status submenu */}
                    {activeFilterMenu === 'status' && (
                      <div className="filter-submenu">
                        {(['NEW', 'KNOCKOUT_FAILED', 'MEETING_SCHEDULED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'] as LeadStatus[]).map(status => (
                          <div
                            key={status}
                            className="filter-submenu-item"
                            onClick={() => toggleStatusFilter(status)}
                          >
                            <span>{getStatusLabel(status)}</span>
                            <div className={`filter-checkbox ${selectedStatuses.has(status) ? 'checked' : ''}`}>
                              {selectedStatuses.has(status) && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Source submenu */}
                    {activeFilterMenu === 'source' && (
                      <div className="filter-submenu">
                        {(['WEBSITE', 'REFERRAL', 'LINKEDIN', 'COLD_CALL', 'EMAIL_CAMPAIGN', 'TRADE_SHOW', 'PARTNER', 'OTHER'] as LeadSource[]).map(source => (
                          <div
                            key={source}
                            className="filter-submenu-item"
                            onClick={() => toggleSourceFilter(source)}
                          >
                            <span>{getSourceLabel(source)}</span>
                            <div className={`filter-checkbox ${selectedSources.has(source) ? 'checked' : ''}`}>
                              {selectedSources.has(source) && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* RM submenu placeholder */}
                    {activeFilterMenu === 'rm' && (
                      <div className="filter-submenu">
                        <div className="filter-submenu-item">
                          <span>All RMs</span>
                          <div className="filter-checkbox"></div>
                        </div>
                      </div>
                    )}

                    {/* Date Range submenu placeholder */}
                    {activeFilterMenu === 'date' && (
                      <div className="filter-submenu">
                        <div className="filter-submenu-item">
                          <span>Last 7 days</span>
                          <div className="filter-checkbox"></div>
                        </div>
                        <div className="filter-submenu-item">
                          <span>Last 30 days</span>
                          <div className="filter-checkbox"></div>
                        </div>
                        <div className="filter-submenu-item">
                          <span>Last 90 days</span>
                          <div className="filter-checkbox"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button className="export-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
              </button>
            </div>
          </div>

          <div className="leads-table-container">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Lead Name</th>
                  <th>Source</th>
                  <th>Date Added</th>
                  <th>Assigned RM</th>
                  <th>Current Status</th>
                  <th>Last Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="loading-cell">Loading leads...</td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-cell">No leads found. Click "Add New Lead" to create one.</td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} onClick={() => handleLeadClick(lead.id)}>
                      <td>
                        <div className="lead-name-cell">
                          <div className="lead-avatar">
                            {lead.firstName.charAt(0).toUpperCase()}
                          </div>
                          <div className="lead-info">
                            <span className="lead-name">{getFullName(lead)}</span>
                            <span className="lead-company">{lead.companyName || 'Company details'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{getSourceLabel(lead.source)}</td>
                      <td>{formatDate(lead.createdAt)}</td>
                      <td>
                        <div className="assigned-rm-cell">
                          <div className="rm-avatar"></div>
                          <span>{lead.assignedRM || 'Name'}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(lead.status) }}
                        >
                          {getStatusLabel(lead.status)}
                        </span>
                      </td>
                      <td>{formatTime(lead.updatedAt)}</td>
                      <td>
                        <button className="view-details-btn">
                          View Details
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;
