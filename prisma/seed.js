const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SQLite database...");

  await prisma.timeLog.deleteMany().catch(() => undefined);
  await prisma.otp.deleteMany().catch(() => undefined);
  await prisma.user.deleteMany().catch(() => undefined);

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const demoPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      phone: "9000000001",
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      isActive: 1,
    },
  });

  const demo = await prisma.user.create({
    data: {
      username: "demo",
      phone: "9000000002",
      name: "Demo User",
      email: "demo@example.com",
      password: demoPassword,
      isActive: 1,
    },
  });

  console.log("Created users:", { admin: admin.username, demo: demo.username });

  await prisma.otp.createMany({
    data: [
      {
        phone: admin.phone,
        otpCode: "123456",
        verified: 1,
      },
      {
        phone: admin.phone,
        otpCode: "654321",
        verified: 0,
      },
      {
        phone: demo.phone,
        otpCode: "111222",
        verified: 0,
      },
    ],
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  await prisma.timeLog
    .createMany({
      data: [
        {
          userId: admin.id,
          logDate: today,
          startTime: "09:00",
          endTime: "10:30",
          isActive: 1,
        },
        {
          userId: admin.id,
          logDate: today,
          startTime: "11:00",
          endTime: "12:00",
          isActive: 1,
        },
        {
          userId: demo.id,
          logDate: tomorrow,
          startTime: "13:00",
          endTime: "14:30",
          isActive: 1,
        },
      ],
    })
    .catch(() => undefined);

  console.log("Seeding complete!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
