import { prisma } from "../prisma";

export const otpRepository = {
  create(data: Parameters<typeof prisma.otp.create>[0]["data"]) {
    return prisma.otp.create({ data });
  },
  findLatestByPhone(phone: string) {
    return prisma.otp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });
  },
  invalidatePrevious(phone: string, keepId?: number) {
    return prisma.otp.deleteMany({
      where: {
        phone,
        ...(keepId ? { id: { not: keepId } } : {}),
      },
    });
  },
  markVerified(id: number) {
    return prisma.otp.update({
      where: { id },
      data: { verified: 1 },
    });
  },
};
