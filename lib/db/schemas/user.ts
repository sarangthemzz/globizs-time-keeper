import { z } from "zod";

export const userIdSchema = z.coerce.number().int().positive();
export const isActiveSchema = z.coerce
  .number()
  .int()
  .refine((value) => value === 0 || value === 1, "isActive must be 0 or 1");

export const createUserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  mobile: z.string().min(1, "Mobile number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isActive: isActiveSchema.optional().default(1),
});

export const updateUserSchema = createUserSchema
  .partial()
  .extend({
    isActive: isActiveSchema.optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).some((key) => data[key as keyof typeof data] !== undefined),
    {
      message: "At least one field is required",
    }
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
