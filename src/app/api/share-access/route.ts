import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    ok: true,
    mode: "mock",
    received: {
      passport_id: body.passport_id,
      viewer_email: body.viewer_email,
      created_at: new Date().toISOString(),
    },
  });
}
