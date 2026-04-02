import { NextResponse } from "next/server";

import { proxyPost } from "@/lib/forwardBackend";

export async function POST(request, context) {
  const params = await context.params;
  const token = params.token;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }
  return proxyPost(`/auth/reset-password/${encodeURIComponent(token)}`, body);
}
