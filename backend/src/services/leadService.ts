import prisma from '../config/db';
import { LeadStatus, LeadSource, LeadType, LeadPriority } from '@prisma/client';

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
  createdById: string;
}

export interface UpdateLeadData {
  firstName?: string;
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

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  assignedRM?: string;
  search?: string;
  createdById?: string;
  startDate?: string;
  endDate?: string;
}

export const createLead = async (data: CreateLeadData) => {
  return prisma.lead.create({
    data,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const getLeadById = async (id: string) => {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const getAllLeads = async (filters?: LeadFilters) => {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.source) {
    where.source = filters.source;
  }

  if (filters?.assignedRM) {
    where.assignedRM = filters.assignedRM;
  }

  if (filters?.createdById) {
    where.createdById = filters.createdById;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters?.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    if (filters?.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters?.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { companyName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { contactPerson: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.lead.findMany({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const updateLead = async (id: string, data: UpdateLeadData) => {
  return prisma.lead.update({
    where: { id },
    data,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const deleteLead = async (id: string) => {
  return prisma.lead.delete({
    where: { id },
  });
};

export const getLeadsByUser = async (userId: string) => {
  return prisma.lead.findMany({
    where: { createdById: userId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getLeadStats = async (userId?: string) => {
  const where = userId ? { createdById: userId } : {};

  const [total, byStatus] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>),
  };
};
