import { NextRequest, NextResponse } from "next/server";

const API_BASE = (process.env.API_BASE || "http://cosylab.iiitd.edu.in:6969").trim();
const API_KEY = (process.env.API_KEY || "").trim();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function proxyFetch(
  targetUrl: string,
  options?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(targetUrl, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "Missing path parameter" },
      { status: 400, headers: corsHeaders }
    );
  }

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

    const res = await proxyFetch(targetUrl, { headers });
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return NextResponse.json(data, {
      status: res.status,
      headers: corsHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Proxy GET error:", targetUrl, message);
    return NextResponse.json(
      { error: "API server is not reachable. The CoSyLab API requires campus network access." },
      { status: 502, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "Missing path parameter" },
      { status: 400, headers: corsHeaders }
    );
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

    const res = await proxyFetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return NextResponse.json(data, {
      status: res.status,
      headers: corsHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Proxy POST error:", targetUrl, message);
    return NextResponse.json(
      { error: "API server is not reachable. The CoSyLab API requires campus network access." },
      { status: 502, headers: corsHeaders }
    );
  }
}
