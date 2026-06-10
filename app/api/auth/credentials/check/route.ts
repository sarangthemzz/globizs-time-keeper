import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const checkCredentialsSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});

const formatIndianMobile = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const mobileNumber = digits.startsWith("91") && digits.length === 12
    ? digits.slice(2)
    : digits;

  if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
    return value.trim();
  }

  return `+91${mobileNumber}`;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password } = checkCredentialsSchema.parse(body);
    const mobile = formatIndianMobile(phone);
    const user =
      await prisma.user.findUnique({ where: { mobile } }) ??
      await prisma.user.findUnique({ where: { mobile: phone.trim() } });

    if (!user?.password) {
      return NextResponse.json({ message: "Invalid phone number or password" }, { status: 401 });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return NextResponse.json({ message: "Invalid phone number or password" }, { status: 401 });
    }

    return NextResponse.json({ phone: user.mobile }, { status: 200 });
  } catch (error) {
    console.error("Credential check error:", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
