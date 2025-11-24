import { api, ApiResponse } from './api';

export interface OwnershipDirector {
  name: string;
  pan: string;
  dob?: string;
  designation: string;
}

export interface CustomerBasicInfoData {
  leadId: string;
  applicantType: 'INDIVIDUAL' | 'BUSINESS';
  name: string;
  entityType?: string;
  industry?: string;
  country?: string;

  // Government Registrations - Individual
  pan?: string;
  aadhaar?: string;

  // Government Registrations - Business
  businessPan?: string;
  gstin?: string;
  cin?: string;
  udyam?: string;

  // Contact Details
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;

  // Key Person Details (for Business)
  keyPersonPan?: string;
  keyPersonDob?: string;

  // Addresses
  address?: string;
  registeredAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;

  // Ownership/Directors
  ownershipDirectors?: OwnershipDirector[];
}

export interface CustomerBasicInfo extends CustomerBasicInfoData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

class CustomerService {
  async saveBasicInfo(data: CustomerBasicInfoData): Promise<ApiResponse<CustomerBasicInfo>> {
    return api.post<CustomerBasicInfo>('/api/customers/basic-info', data);
  }

  async getBasicInfo(leadId: string): Promise<ApiResponse<CustomerBasicInfo>> {
    return api.get<CustomerBasicInfo>(`/api/customers/basic-info/${leadId}`);
  }
}

export const customerService = new CustomerService();
