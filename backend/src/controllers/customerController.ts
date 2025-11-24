import { Request, Response } from 'express';
import * as customerService from '../services/customerService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const saveBasicInfo = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const customerInfo = await customerService.saveCustomerBasicInfo(data);

    logger.info('Customer basic info saved', {
      id: customerInfo.id,
      leadId: customerInfo.leadId
    });

    return sendSuccess(res, customerInfo, 'Customer basic information saved successfully', 201);
  } catch (err: any) {
    logger.error('Error saving customer basic info', { error: err.message });
    return sendError(res, 'Failed to save customer basic information', 500);
  }
};

export const getBasicInfo = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;

    const customerInfo = await customerService.getCustomerBasicInfo(leadId);

    if (!customerInfo) {
      return sendError(res, 'Customer basic information not found', 404);
    }

    return sendSuccess(res, customerInfo, 'Customer basic information retrieved successfully');
  } catch (err: any) {
    logger.error('Error retrieving customer basic info', { error: err.message });
    return sendError(res, 'Failed to retrieve customer basic information', 500);
  }
};
