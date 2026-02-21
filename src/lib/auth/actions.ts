"use server";

import { redirect } from "next/navigation";

export async function loginAction() {
  redirect("/auth/login");
}

export async function logoutAction() {
  redirect("/auth/logout");
}
