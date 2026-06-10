import { NextResponse } from "next/server";
import { getUserById, updateUser, updateUserSchema, userIdSchema } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const user = await getUserById(userIdSchema.parse(id));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const body = await req.json();
    const { id } = await params;
    const user = await updateUser(userIdSchema.parse(id), updateUserSchema.parse(body));

    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
