import { z } from "zod";

export const phoneSchema = z.string().min(1, "Phone is required");
export const otpCodeSchema = z.string().regex(/^\d{6}$/, "OTP code must be exactly 6 digits");

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otpCode: otpCodeSchema,
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
