const { z } = require('zod');
const { AttendanceStatus } = require('@prisma/client');

const checkInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  selfieBase64: z.string().optional()
});

const checkOutSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

const updateAttendanceSchema = z.object({
  checkInTime: z.string().datetime().optional(),
  checkOutTime: z.string().datetime().optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
  notes: z.string().optional()
});

module.exports = {
  checkInSchema,
  checkOutSchema,
  updateAttendanceSchema
};
