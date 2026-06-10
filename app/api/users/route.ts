import { NextResponse } from "next/server";
import { createUser, createUserSchema } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await createUser(createUserSchema.parse(body));

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
