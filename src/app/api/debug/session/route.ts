import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  // This endpoint dumps the full session/JWT contents — only expose it outside
  // of production to avoid leaking session internals.
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const session = await auth();

  return NextResponse.json({
    session,
    hasSession: !!session,
    user: session?.user || null,
    timestamp: new Date().toISOString(),
  });
}
