import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text", placeholder: "9000000001" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;
        const rawPhone = String(credentials.phone);
        const mobile = formatIndianMobile(rawPhone);
        const password = String(credentials.password);
        const user =
          await prisma.user.findUnique({ where: { mobile } }) ??
          await prisma.user.findUnique({ where: { mobile: rawPhone.trim() } });
        if (!user?.password) return null;
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) return null;

        const verifiedOtp = await prisma.otp.findFirst({
          where: {
            phone: user.mobile,
            verified: 1,
            createdAt: {
              gte: new Date(Date.now() - 10 * 60 * 1000),
            },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!verifiedOtp) return null;

        await prisma.otp.update({
          where: { id: verifiedOtp.id },
          data: { verified: 2 },
        });

        return { id: String(user.id), phone: user.mobile, name: user.fullName };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
