import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const timeLogRepository = {
  create(data: Parameters<typeof prisma.timeLog.create>[0]["data"]) {
    return prisma.timeLog.create({ data });
  },
  createMany(data: Prisma.TimeLogCreateManyInput[]) {
    return prisma.timeLog.createMany({ data });
  },
  deleteManyByUserAndDate(userId: number, logDate: Date) {
    return prisma.timeLog.deleteMany({
      where: {
        userId,
        logDate,
      },
    });
  },
  findById(id: number) {
    return prisma.timeLog.findUnique({
      where: { id },
    });
  },
  findByUserId(userId: number) {
    return prisma.timeLog.findMany({
      where: { userId },
      orderBy: [{ logDate: "desc" }, { startTime: "asc" }],
    });
  },
  findByDate(logDate: Date) {
    return prisma.timeLog.findMany({
      where: { logDate },
      orderBy: [{ userId: "asc" }, { startTime: "asc" }],
    });
  },
  update(id: number, data: Parameters<typeof prisma.timeLog.update>[0]["data"]) {
    return prisma.timeLog.update({
      where: { id },
      data,
    });
  },
  deactivate(id: number) {
    return prisma.timeLog.update({
      where: { id },
      data: { isActive: 0 },
    });
  },
  delete(id: number) {
    return prisma.timeLog.delete({
      where: { id },
    });
  },
};
