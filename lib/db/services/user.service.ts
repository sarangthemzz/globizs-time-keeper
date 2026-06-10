import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "../schemas/user";

export async function createUser(input: CreateUserInput) {
  const data = createUserSchema.parse(input);
  const password = await bcrypt.hash(data.password, 10);

  return userRepository.create({
    fullName: data.fullName.trim(),
    mobile: data.mobile.trim(),
    password,
    isActive: data.isActive ?? 1,
  });
}

export async function getUserById(id: number) {
  return userRepository.findById(userIdSchema.parse(id));
}

export async function getUserByMobile(mobile: string) {
  return userRepository.findByMobile(mobile);
}

export async function updateUser(id: number, input: UpdateUserInput) {
  const parsedId = userIdSchema.parse(id);
  const data = updateUserSchema.parse(input);

  const password =
    data.password ? await bcrypt.hash(data.password, 10) : undefined;

  return userRepository.update(parsedId, {
    ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
    ...(data.mobile ? { mobile: data.mobile.trim() } : {}),
    ...(typeof data.isActive === "number" ? { isActive: data.isActive } : {}),
    ...(password ? { password } : {}),
  });
}

export async function deactivateUser(id: number) {
  return userRepository.deactivate(userIdSchema.parse(id));
}

export async function activateUser(id: number) {
  return userRepository.activate(userIdSchema.parse(id));
}
