import { clearGrantAdminSession } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await clearGrantAdminSession();
  return NextResponse.redirect(new URL("/admin/grant/login", request.url));
}
