import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { validate } from '../utils/validate.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const ownershipDirectorSchema = z.object({
  name: z.string().min(1, 'Director name is required'),
  pan: z.string().min(1, 'PAN is required'),
  dob: z.string().optional(),
  designation: z.string().min(1, 'Designation is required')
});

const saveBasicInfoSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  applicantType: z.enum(['INDIVIDUAL', 'BUSINESS'], { required_error: 'Applicant type is required' }),
  name: z.string().min(1, 'Name is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  industry: z.string().min(1, 'Industry is required'),
  country: z.string().min(1, 'Country is required'),

  // Government Registrations - Individual
  pan: z.string().optional(),
  aadhaar: z.string().optional(),

  // Government Registrations - Business
  businessPan: z.string().optional(),
  gstin: z.string().optional(),
  cin: z.string().optional(),
  udyam: z.string().optional(),

  // Contact Details
  contactPerson: z.string().min(1, 'Contact person name is required'),
  phoneNumber: z.string().min(1, 'Mobile number is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),

  // Key Person Details (for Business)
  keyPersonPan: z.string().optional(),
  keyPersonDob: z.string().optional(),

  // Addresses
  address: z.string().optional(),
  registeredAddress: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),

  // Ownership/Directors
  ownershipDirectors: z.array(ownershipDirectorSchema).optional()
}).refine((data) => {
  // For Individual: PAN is required
  if (data.applicantType === 'INDIVIDUAL') {
    return data.pan && data.pan.length > 0;
  }
  return true;
}, {
  message: 'PAN number is required for Individual applicants',
  path: ['pan']
}).refine((data) => {
  // For Business: Business PAN, GSTIN, and CIN are required
  if (data.applicantType === 'BUSINESS') {
    return data.businessPan && data.businessPan.length > 0;
  }
  return true;
}, {
  message: 'Business PAN is required for Business applicants',
  path: ['businessPan']
}).refine((data) => {
  if (data.applicantType === 'BUSINESS') {
    return data.gstin && data.gstin.length > 0;
  }
  return true;
}, {
  message: 'GSTIN is required for Business applicants',
  path: ['gstin']
}).refine((data) => {
  if (data.applicantType === 'BUSINESS') {
    return data.cin && data.cin.length > 0;
  }
  return true;
}, {
  message: 'CIN/LLPIN is required for Business applicants',
  path: ['cin']
}).refine((data) => {
  // For Business: Key Person PAN and DOB are required
  if (data.applicantType === 'BUSINESS') {
    return data.keyPersonPan && data.keyPersonPan.length > 0;
  }
  return true;
}, {
  message: 'Authorized person PAN is required for Business applicants',
  path: ['keyPersonPan']
}).refine((data) => {
  if (data.applicantType === 'BUSINESS') {
    return data.keyPersonDob && data.keyPersonDob.length > 0;
  }
  return true;
}, {
  message: 'Authorized person DOB is required for Business applicants',
  path: ['keyPersonDob']
}).refine((data) => {
  // For Individual: address is required
  if (data.applicantType === 'INDIVIDUAL') {
    return data.address && data.address.length > 0;
  }
  return true;
}, {
  message: 'Address is required for Individual applicants',
  path: ['address']
}).refine((data) => {
  // For Business: registeredAddress is required
  if (data.applicantType === 'BUSINESS') {
    return data.registeredAddress && data.registeredAddress.length > 0;
  }
  return true;
}, {
  message: 'Registered address is required for Business applicants',
  path: ['registeredAddress']
});

// All routes require authentication
router.use(authenticateToken);

// Routes
router.post('/basic-info', validate(saveBasicInfoSchema), customerController.saveBasicInfo);
router.get('/basic-info/:leadId', customerController.getBasicInfo);

export default router;
