import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE || "http://cosylab.iiitd.edu.in:6969";
const API_KEY = process.env.API_KEY || "";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  // Build the target URL: strip "path" param and forward the rest
  const forwardParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== "path") forwardParams.set(key, value);
  });

  const separator = forwardParams.toString() ? "?" : "";
  const targetUrl = `${API_BASE}${path}${separator}${forwardParams.toString()}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`;

    const res = await fetch(targetUrl, { headers });
    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch from upstream API" },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  const forwardParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== "path") forwardParams.set(key, value);
  });

  const separator = forwardParams.toString() ? "?" : "";
  const targetUrl = `${API_BASE}${path}${separator}${forwardParams.toString()}`;

  try {
    const body = await request.json();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch from upstream API" },
      { status: 502 }
    );
  }
}
