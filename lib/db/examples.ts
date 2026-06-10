import {
  activateUser,
  createOTP,
  createTimeLog,
  createUser,
  deactivateTimeLog,
  deleteTimeLog,
  getLatestOTP,
  getTimeLogsByDate,
  getUserById,
  getUserByMobile,
  updateTimeLog,
  updateUser,
  verifyOTP,
} from "./index";

export async function exampleCrudUsage() {
  const user = await createUser({
    fullName: "John Doe",
    mobile: "+919999999999",
    isActive: 1,
    password: "password123",
  });

  await updateUser(user.id, {
    fullName: "John Updated",
  });

  await getUserById(user.id);
  await getUserByMobile(user.mobile);
  await activateUser(user.id);

  const otp = await createOTP({ phone: user.mobile });
  await getLatestOTP(user.mobile);
  await verifyOTP({ phone: user.mobile, otpCode: otp.otpCode });

  const timeLog = await createTimeLog({
    userId: user.id,
    logDate: new Date(),
    startTime: "09:00",
    endTime: "10:00",
    work: "Project Work",
    isActive: 1,
  });

  await updateTimeLog(timeLog.id, {
    endTime: "10:30",
  });

  await getTimeLogsByDate(new Date());
  await deactivateTimeLog(timeLog.id);
  await deleteTimeLog(timeLog.id);
}
