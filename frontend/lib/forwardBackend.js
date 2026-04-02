import { NextResponse } from "next/server";

export function backendUrl(path) {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function forwardSetCookies(upstream, res) {
  if (typeof upstream.headers.getSetCookie === "function") {
    const list = upstream.headers.getSetCookie();
    for (const c of list) {
      res.headers.append("Set-Cookie", c);
    }
  } else {
    const c = upstream.headers.get("set-cookie");
    if (c) res.headers.append("Set-Cookie", c);
  }
}

export async function proxyPost(path, body) {
  const upstream = await fetch(backendUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  const text = await upstream.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { success: false, message: text || "Request failed" };
  }

  const res = NextResponse.json(data, { status: upstream.status });
  forwardSetCookies(upstream, res);
  return res;
}
