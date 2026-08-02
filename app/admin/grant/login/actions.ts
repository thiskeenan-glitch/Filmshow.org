"use server";

import {
  setGrantAdminSession,
  signInGrantAdmin,
} from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export type GrantLoginState = {
  message?: string;
};

export async function grantLoginAction(
  _state: GrantLoginState,
  formData: FormData,
): Promise<GrantLoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { message: "Enter your admin email and password." };
  }

  try {
    const session = await signInGrantAdmin({ email, password });
    await setGrantAdminSession(session);
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Unable to sign in.",
    };
  }

  redirect("/admin/grant");
}
