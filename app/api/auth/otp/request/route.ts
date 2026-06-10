import { prisma } from '@/lib/prisma';
import { generateOTP, sendOtpSMS } from '@/lib/otp';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  phone: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('OTP request body:', body);
    const parsed = requestSchema.parse(body);
    console.log('Parsed OTP request:', parsed);
    const otpCode = generateOTP();

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV OTP] ${parsed.phone}: ${otpCode}`);
    }

    await prisma.otp.create({
      data: {
        phone: parsed.phone,
        otpCode,
        verified: 0,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    await sendOtpSMS(parsed.phone, otpCode);

    return NextResponse.json({ message: 'OTP sent' }, { status: 200 });
    } catch (error) {
      console.error('OTP request error:', error);
      // Return detailed error for client debugging
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request' }, { status: 400 });
    }
}
