import { Router } from 'express';
import * as leadController from '../controllers/leadController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validate } from '../utils/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  contactPerson: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.enum(['WEBSITE', 'REFERRAL', 'LINKEDIN', 'COLD_CALL', 'EMAIL_CAMPAIGN', 'TRADE_SHOW', 'PARTNER', 'OTHER']).optional(),
  sourceDetails: z.string().optional(),
  leadType: z.enum(['INDIVIDUAL', 'BUSINESS', 'CORPORATE', 'GOVERNMENT']).optional(),
  leadPriority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['NEW', 'KNOCKOUT_FAILED', 'MEETING_SCHEDULED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST']).optional(),
  industry: z.string().optional(),
  dealValue: z.number().positive().optional(),
  notes: z.string().optional(),
  assignedRM: z.string().optional(),
});

const updateLeadSchema = z.object({
  firstName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  contactPerson: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.enum(['WEBSITE', 'REFERRAL', 'LINKEDIN', 'COLD_CALL', 'EMAIL_CAMPAIGN', 'TRADE_SHOW', 'PARTNER', 'OTHER']).optional(),
  sourceDetails: z.string().optional(),
  leadType: z.enum(['INDIVIDUAL', 'BUSINESS', 'CORPORATE', 'GOVERNMENT']).optional(),
  leadPriority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['NEW', 'KNOCKOUT_FAILED', 'MEETING_SCHEDULED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST']).optional(),
  industry: z.string().optional(),
  dealValue: z.number().positive().optional(),
  notes: z.string().optional(),
  assignedRM: z.string().optional(),
});

// All routes require authentication
router.use(authenticateToken);

// Routes
router.post('/', validate(createLeadSchema), leadController.createLead);
router.get('/', leadController.getAllLeads);
router.get('/my-leads', leadController.getMyLeads);
router.get('/stats', leadController.getLeadStats);
router.get('/:id', leadController.getLead);
router.put('/:id', validate(updateLeadSchema), leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

export default router;
