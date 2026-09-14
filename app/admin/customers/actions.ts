"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validations/admin";
import type { AdminActionState } from "@/app/admin/actions";

const NOT_CONFIGURED = "Database write is not configured.";

function revalidateCustomerSurfaces(id?: string) {
  revalidatePath("/admin/customers");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  if (id) revalidatePath(`/admin/customers/${id}`);
}

export async function updateCustomerAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("customerId") ?? "").trim();
  if (!id) return { status: "error", message: "Missing customer id." };
  const parsed = customerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check customer details." };
  }
  const input = parsed.data;
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const { data, error } = await supabase.from("customers").update({
    name: input.name,
    phone: input.phone.replace(/\D/g, ""),
    email: input.email.toLowerCase() || null,
    address: input.address || null,
    city: input.city || null,
  } as never).eq("id", id).select("id").maybeSingle();
  if (error || !data) {
    console.error("[admin] updateCustomer failed:", error?.message);
    if (error?.code === "23505") {
      return { status: "error", message: "Another customer already uses this phone number." };
    }
    return { status: "error", message: error?.message ?? "Customer not found." };
  }
  revalidateCustomerSurfaces(id);
  return { status: "success", message: `${input.name} updated.` };
}

export async function deleteCustomerAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("customerId") ?? "").trim();
  if (!id) return { status: "error", message: "Missing customer id." };
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const [customerResult, ordersResult] = await Promise.all([
    supabase.from("customers").select("name").eq("id", id).maybeSingle(),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("customer_id", id),
  ]);
  if (customerResult.error || !customerResult.data) {
    return { status: "error", message: customerResult.error?.message ?? "Customer not found." };
  }
  if (ordersResult.error) return { status: "error", message: ordersResult.error.message };
  if ((ordersResult.count ?? 0) > 0) {
    return {
      status: "error",
      message: "Customers with order history cannot be deleted because invoices and audit records must remain intact.",
    };
  }
  const customer = customerResult.data as { name: string };
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { status: "error", message: error.message };
  revalidateCustomerSurfaces(id);
  return { status: "success", message: `${customer.name} deleted.` };
}
