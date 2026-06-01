const { z } = require('zod');
const { VisitType, VisitStatus } = require('@prisma/client');

const createVisitReportSchema = z.object({
  taskAssignmentId: z.string().cuid().nullable().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  visitType: z.nativeEnum(VisitType).default('OTHER'),
  visitStatus: z.nativeEnum(VisitStatus).default('COMPLETED'),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  images: z.array(z.string()).default([]), // Base64 strings
  signatureBase64: z.string().nullable().optional(), // Base64 string
  checkInTime: z.string().datetime().nullable().optional(),
  checkOutTime: z.string().datetime().nullable().optional(),
  nextFollowUpDate: z.string().datetime().nullable().optional()
});

module.exports = {
  createVisitReportSchema
};
