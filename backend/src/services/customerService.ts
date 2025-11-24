import prisma from '../config/db.js';
import { ApplicantType } from '@prisma/client';

export interface OwnershipDirectorInput {
  name: string;
  pan: string;
  dob?: string;
  designation: string;
}

export interface CustomerBasicInfoInput {
  leadId: string;
  applicantType: ApplicantType;
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
  ownershipDirectors?: OwnershipDirectorInput[];
}

export const saveCustomerBasicInfo = async (data: CustomerBasicInfoInput) => {
  // Check if basic info already exists for this lead
  const existingInfo = await prisma.customerBasicInfo.findUnique({
    where: { leadId: data.leadId }
  });

  if (existingInfo) {
    // Update existing record
    return await prisma.customerBasicInfo.update({
      where: { leadId: data.leadId },
      data: {
        applicantType: data.applicantType,
        name: data.name,
        entityType: data.entityType,
        industry: data.industry,
        country: data.country,
        pan: data.pan,
        aadhaar: data.aadhaar,
        businessPan: data.businessPan,
        gstin: data.gstin,
        cin: data.cin,
        udyam: data.udyam,
        contactPerson: data.contactPerson,
        phoneNumber: data.phoneNumber,
        email: data.email,
        keyPersonPan: data.keyPersonPan,
        keyPersonDob: data.keyPersonDob ? new Date(data.keyPersonDob) : null,
        address: data.address,
        registeredAddress: data.registeredAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        ownershipDirectors: {
          deleteMany: {},
          create: data.ownershipDirectors?.map(director => ({
            name: director.name,
            pan: director.pan,
            dob: director.dob ? new Date(director.dob) : null,
            designation: director.designation
          })) || []
        }
      },
      include: {
        ownershipDirectors: true
      }
    });
  } else {
    // Create new record
    return await prisma.customerBasicInfo.create({
      data: {
        leadId: data.leadId,
        applicantType: data.applicantType,
        name: data.name,
        entityType: data.entityType,
        industry: data.industry,
        country: data.country,
        pan: data.pan,
        aadhaar: data.aadhaar,
        businessPan: data.businessPan,
        gstin: data.gstin,
        cin: data.cin,
        udyam: data.udyam,
        contactPerson: data.contactPerson,
        phoneNumber: data.phoneNumber,
        email: data.email,
        keyPersonPan: data.keyPersonPan,
        keyPersonDob: data.keyPersonDob ? new Date(data.keyPersonDob) : null,
        address: data.address,
        registeredAddress: data.registeredAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        ownershipDirectors: {
          create: data.ownershipDirectors?.map(director => ({
            name: director.name,
            pan: director.pan,
            dob: director.dob ? new Date(director.dob) : null,
            designation: director.designation
          })) || []
        }
      },
      include: {
        ownershipDirectors: true
      }
    });
  }
};

export const getCustomerBasicInfo = async (leadId: string) => {
  return await prisma.customerBasicInfo.findUnique({
    where: { leadId },
    include: {
      ownershipDirectors: true
    }
  });
};
