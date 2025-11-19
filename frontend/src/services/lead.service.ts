import { api, ApiResponse } from './api';

export type LeadStatus = 'NEW' | 'KNOCKOUT_FAILED' | 'MEETING_SCHEDULED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST';
export type LeadSource = 'WEBSITE' | 'REFERRAL' | 'LINKEDIN' | 'COLD_CALL' | 'EMAIL_CAMPAIGN' | 'TRADE_SHOW' | 'PARTNER' | 'OTHER';
export type LeadType = 'INDIVIDUAL' | 'BUSINESS' | 'CORPORATE' | 'GOVERNMENT';
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Lead {
  id: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  contactPerson?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  sourceDetails?: string;
  leadType?: LeadType;
  leadPriority: LeadPriority;
  status: LeadStatus;
  industry?: string;
  dealValue?: number;
  notes?: string;
  assignedRM?: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateLeadData {
  firstName: string;
  middleName?: string;
  lastName?: string;
  contactPerson?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  source?: LeadSource;
  sourceDetails?: string;
  leadType?: LeadType;
  leadPriority?: LeadPriority;
  status?: LeadStatus;
  industry?: string;
  dealValue?: number;
  notes?: string;
  assignedRM?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {}

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  assignedRM?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface LeadStats {
  total: number;
  byStatus: Record<string, number>;
}

class LeadService {
  async createLead(data: CreateLeadData): Promise<ApiResponse<Lead>> {
    return api.post<Lead>('/api/leads', data);
  }

  async getAllLeads(filters?: LeadFilters): Promise<ApiResponse<Lead[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.assignedRM) params.append('assignedRM', filters.assignedRM);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/api/leads?${queryString}` : '/api/leads';
    return api.get<Lead[]>(url);
  }

  async getLeadById(id: string): Promise<ApiResponse<Lead>> {
    return api.get<Lead>(`/api/leads/${id}`);
  }

  async updateLead(id: string, data: UpdateLeadData): Promise<ApiResponse<Lead>> {
    return api.put<Lead>(`/api/leads/${id}`, data);
  }

  async deleteLead(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/leads/${id}`);
  }

  async getMyLeads(): Promise<ApiResponse<Lead[]>> {
    return api.get<Lead[]>('/api/leads/my-leads');
  }

  async getLeadStats(): Promise<ApiResponse<LeadStats>> {
    return api.get<LeadStats>('/api/leads/stats');
  }
}

export const leadService = new LeadService();
