"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

const NOT_CONFIGURED =
  "Database write is not configured. Set SUPABASE_SERVICE_ROLE_KEY in the server environment.";

export async function createExpenseAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const expenseType = String(formData.get("expenseType") ?? "miscellaneous")
    .trim()
    .toLowerCase();
  const amount = Number(formData.get("amount"));
  const date =
    String(formData.get("date") ?? "").trim() ||
    new Date().toISOString().slice(0, 10);

  if (!title) return { status: "error", message: "Enter an expense title." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { status: "error", message: "Enter a valid amount." };

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const { error } = await supabase.from("expenses").insert({
    title,
    expense_type: expenseType,
    amount,
    expense_date: date,
  } as never);

  if (error) {
    console.error("[admin] createExpense failed:", error.message);
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/expenses");
  revalidatePath("/admin/profit");
  return { status: "success", message: "Expense added." };
}

export async function deleteExpenseAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("expenseId") ?? "").trim();
  if (!id) return;
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) {
    console.error("[admin] deleteExpense failed:", error.message);
    return;
  }
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/profit");
  revalidatePath("/admin");
}
