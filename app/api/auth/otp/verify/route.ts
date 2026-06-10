// app/api/auth/otp/verify/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const verifySchema = z.object({
  phone: z.string().min(1),
  otp: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, otp } = verifySchema.parse(body);

    // phone is not unique on the Otp model, so use findFirst with latest record
    const record = await prisma.otp.findFirst({
      where: { phone, verified: 0 },
      orderBy: { createdAt: "desc" },
    });
    if (!record || record.otpCode !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (record.expiresAt && record.expiresAt < new Date()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // Mark as verified using the unique id
    await prisma.otp.update({
      where: { id: record.id },
      data: { verified: 1 },
    });

    return NextResponse.json({ message: "OTP verified" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
}
