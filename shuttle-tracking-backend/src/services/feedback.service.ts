import { prisma } from '../config/prisma.js';

export interface CreateFeedbackInput {
  type: string;
  vehicleId: string;
  message: string;
}

/**
 * สร้าง feedback ใหม่สำหรับรถที่ระบุ
 * - ตรวจสอบว่า vehicleId มีอยู่จริงในระบบก่อนบันทึก
 * - บันทึก IP address ของผู้ส่ง feedback เพื่อตรวจสอบย้อนหลัง
 */
export const createFeedback = async (
  input: CreateFeedbackInput,
  ipAddress?: string
) => {
  const { type, vehicleId, message } = input;

  // ตรวจสอบว่ารถคันนี้มีอยู่ในระบบ
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, name: true }
  });

  if (!vehicle) {
    throw new Error(`Vehicle with id "${vehicleId}" not found`);
  }

  const feedback = await prisma.feedback.create({
    data: {
      type,
      vehicleId,
      message,
      ipAddress: ipAddress ?? null
    },
    select: {
      id: true,
      type: true,
      vehicleId: true,
      message: true,
      createdAt: true,
      vehicle: {
        select: { id: true, name: true }
      }
    }
  });

  return feedback;
};
