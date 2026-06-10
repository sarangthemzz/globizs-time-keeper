import { randomInt } from "crypto";
import { otpRepository } from "../repositories/otp.repository";
import {
  sendOtpSchema,
  verifyOtpSchema,
  type SendOtpInput,
  type VerifyOtpInput,
} from "../schemas/otp";

export function generateOTP() {
  return randomInt(100000, 1000000).toString();
}

export async function invalidatePreviousOTPs(phone: string, keepId?: number) {
  return otpRepository.invalidatePrevious(phone, keepId);
}

export async function createOTP(input: SendOtpInput & { otpCode?: string }) {
  const { phone } = sendOtpSchema.parse(input);
  const otpCode = input.otpCode ?? generateOTP();

  await invalidatePreviousOTPs(phone);

  return otpRepository.create({
    phone,
    otpCode,
    verified: 0,
  });
}

export async function getLatestOTP(phone: string) {
  return otpRepository.findLatestByPhone(phone);
}

export async function verifyOTP(input: VerifyOtpInput) {
  const { phone, otpCode } = verifyOtpSchema.parse(input);
  const latestOTP = await getLatestOTP(phone);

  if (!latestOTP) {
    return {
      verified: false,
      otp: null,
    };
  }

  if (latestOTP.otpCode !== otpCode) {
    return {
      verified: false,
      otp: latestOTP,
    };
  }

  const otp = await otpRepository.markVerified(latestOTP.id);

  return {
    verified: true,
    otp,
  };
}
