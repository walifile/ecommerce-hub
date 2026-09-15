"use server";

import { revalidatePath } from "next/cache";
import type { AdminActionState } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const NOT_CONFIGURED =
  "Database write is not configured. Set SUPABASE_SERVICE_ROLE_KEY in the server environment.";
const EXPENSE_TYPES = ["advertising", "shipping", "salary", "miscellaneous"] as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ExpensePayload = {
  title: string;
  expenseType: (typeof EXPENSE_TYPES)[number];
  amount: number;
  date: string;
};

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function parseExpense(formData: FormData): { value?: ExpensePayload; error?: string } {
  const title = String(formData.get("title") ?? "").trim();
  const expenseType = String(formData.get("expenseType") ?? "miscellaneous").trim().toLowerCase();
  const amount = Number(formData.get("amount"));
  const date = String(formData.get("date") ?? "").trim() || todayUtc();

  if (!title || title.length > 120) return { error: "Enter an expense title of 120 characters or less." };
  if (!EXPENSE_TYPES.includes(expenseType as ExpensePayload["expenseType"])) {
    return { error: "Select a valid expense type." };
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9_999_999_999.99) {
    return { error: "Enter a valid expense amount." };
  }
  if (!isValidDate(date)) return { error: "Enter a valid expense date." };
  if (date > todayUtc()) return { error: "Expense date cannot be in the future." };
  return {
    value: {
      title,
      expenseType: expenseType as ExpensePayload["expenseType"],
      amount: Number(amount.toFixed(2)),
      date,
    },
  };
}

function refreshExpenseSurfaces() {
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/profit");
  revalidatePath("/admin");
}

export async function createExpenseAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = parseExpense(formData);
  if (!parsed.value) return { status: "error", message: parsed.error || "Invalid expense." };
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "").trim();
  if (!UUID_PATTERN.test(idempotencyKey)) {
    return { status: "error", message: "Invalid submission. Refresh the page and try again." };
  }
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const { error } = await supabase.from("expenses").insert({
    title: parsed.value.title,
    expense_type: parsed.value.expenseType,
    amount: parsed.value.amount,
    expense_date: parsed.value.date,
    idempotency_key: idempotencyKey,
  } as never);
  if (error?.code === "23505") {
    const { data: existing } = await supabase
      .from("expenses")
      .select("title, expense_type, amount, expense_date")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    const row = existing as {
      title?: string;
      expense_type?: string;
      amount?: number;
      expense_date?: string;
    } | null;
    const sameRequest = row?.title === parsed.value.title
      && row.expense_type === parsed.value.expenseType
      && Number(row.amount) === parsed.value.amount
      && row.expense_date === parsed.value.date;
    return sameRequest
      ? { status: "success", message: "Expense was already saved." }
      : { status: "error", message: "This submission token was already used. Refresh and try again." };
  }
  if (error) {
    console.error("[admin] createExpense failed:", error.message);
    const missingMigration = error.code === "PGRST204" || error.code === "42703";
    return {
      status: "error",
      message: missingMigration
        ? "Expense security update is not deployed yet. Apply the latest database migrations."
        : "Could not save the expense.",
    };
  }
  refreshExpenseSurfaces();
  return { status: "success", message: "Expense added." };
}

export async function updateExpenseAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("expenseId") ?? "").trim();
  if (!UUID_PATTERN.test(id)) return { status: "error", message: "Invalid expense." };
  const parsed = parseExpense(formData);
  if (!parsed.value) return { status: "error", message: parsed.error || "Invalid expense." };
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const { data, error } = await supabase
    .from("expenses")
    .update({
      title: parsed.value.title,
      expense_type: parsed.value.expenseType,
      amount: parsed.value.amount,
      expense_date: parsed.value.date,
    } as never)
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("[admin] updateExpense failed:", error.message);
    return { status: "error", message: "Could not update the expense." };
  }
  if (!data) return { status: "error", message: "Expense not found." };
  refreshExpenseSurfaces();
  return { status: "success", message: "Expense updated." };
}

export async function deleteExpenseAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("expenseId") ?? "").trim();
  if (!UUID_PATTERN.test(id)) return { status: "error", message: "Invalid expense." };
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const { data, error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("[admin] deleteExpense failed:", error.message);
    return { status: "error", message: "Could not delete the expense." };
  }
  if (!data) return { status: "error", message: "Expense not found." };
  refreshExpenseSurfaces();
  return { status: "success", message: "Expense deleted." };
}
