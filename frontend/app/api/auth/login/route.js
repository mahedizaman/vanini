import { NextResponse } from "next/server";

import { proxyPost } from "@/lib/forwardBackend";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }
  return proxyPost("/auth/login", body);
}
