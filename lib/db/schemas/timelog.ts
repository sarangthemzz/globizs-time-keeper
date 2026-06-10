import { z } from "zod";

export const timeSchema = z
  .string()
  .trim()
  .regex(
    /^(0?[1-9]|1[0-2]):[0-5]\d\s*([AaPp][Mm])$|^([01]?\d|2[0-3]):[0-5]\d$/,
    "Time must be in HH:MM or h:mm AM/PM format"
  );

export const timeLogIdSchema = z.coerce.number().int().positive();
export const timeLogUserIdSchema = z.coerce.number().int().positive();

export const timeLogEntrySchema = z.object({
  startTime: timeSchema,
  endTime: timeSchema,
  work: z.string().trim().optional().default(""),
});

export const timeLogLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  capturedAt: z.string().datetime().optional(),
});

const baseTimeLogSchema = z.object({
  userId: timeLogUserIdSchema,
  logDate: z.coerce.date(),
  startTime: timeSchema,
  endTime: timeSchema,
  work: z.string().trim().optional().default(""),
  isActive: z.coerce.number().int().optional().default(1),
});

export const createTimeLogSchema = baseTimeLogSchema;

function toMinutes(timeString: string) {
  const normalized = timeString.trim().toUpperCase();
  const match =
    normalized.match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AP]M)$/) ??
    normalized.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);

  if (!match) {
    return null;
  }

  if (match.length === 4) {
    const hours = Number(match[1]) % 12;
    const minutes = Number(match[2]);
    const period = match[3];
    return (period === "PM" ? hours + 12 : hours) * 60 + minutes;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export const createManyTimeLogsSchema = z
  .object({
    userId: timeLogUserIdSchema,
    logDate: z.coerce.date(),
    entries: z.array(timeLogEntrySchema).min(1, "At least one interval is required"),
    location: timeLogLocationSchema.nullish(),
  })
  .superRefine((data, ctx) => {
    const normalizedEntries = data.entries.map((entry) => ({
      startTime: entry.startTime.trim(),
      endTime: entry.endTime.trim(),
      work: entry.work.trim(),
    }));

    normalizedEntries.forEach((entry, index) => {
      const startMinutes = toMinutes(entry.startTime);
      const endMinutes = toMinutes(entry.endTime);

      if (startMinutes === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entries", index, "startTime"],
          message: "Start time must be in HH:MM or h:mm AM/PM format",
        });
        return;
      }

      if (endMinutes === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entries", index, "endTime"],
          message: "End time must be in HH:MM or h:mm AM/PM format",
        });
        return;
      }

    });

    const duplicateTracker = new Map<string, number>();

    normalizedEntries.forEach((entry, index) => {
      const key = `${entry.startTime.toUpperCase()}-${entry.endTime.toUpperCase()}`;
      const previousIndex = duplicateTracker.get(key);

      if (previousIndex !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entries", index, "startTime"],
          message: `Duplicate interval matches entry ${previousIndex + 1}`,
        });
        return;
      }

      duplicateTracker.set(key, index);
    });

  });

export const updateTimeLogSchema = baseTimeLogSchema
  .partial()
  .refine(
    (data) =>
      Object.keys(data).some((key) => data[key as keyof typeof data] !== undefined),
    {
      message: "At least one field is required",
    }
  );

export type CreateTimeLogInput = z.infer<typeof createTimeLogSchema>;
export type CreateManyTimeLogsInput = z.infer<typeof createManyTimeLogsSchema>;
export type UpdateTimeLogInput = z.infer<typeof updateTimeLogSchema>;
