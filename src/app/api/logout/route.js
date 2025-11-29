import { NextResponse } from "next/server";

export async function POST(req) {
  // Clear session cookie (adjust cookie name as needed)
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": "session=; Path=/; HttpOnly; Max-Age=0",
      },
    }
  );
}
