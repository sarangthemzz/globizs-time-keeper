import { prisma } from "../prisma";

export const userRepository = {
  create(data: Parameters<typeof prisma.user.create>[0]["data"]) {
    return prisma.user.create({ data });
  },
  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        timeLogs: true,
      },
    });
  },
  findByMobile(mobile: string) {
    return prisma.user.findUnique({
      where: { mobile },
      include: {
        timeLogs: true,
      },
    });
  },
  update(id: number, data: Parameters<typeof prisma.user.update>[0]["data"]) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
  deactivate(id: number) {
    return prisma.user.update({
      where: { id },
      data: { isActive: 0 },
    });
  },
  activate(id: number) {
    return prisma.user.update({
      where: { id },
      data: { isActive: 1 },
    });
  },
};
