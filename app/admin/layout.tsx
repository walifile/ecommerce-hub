import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  // Middleware already requires a logged-in user for /admin; here we enforce
  // that the user actually has the admin role.
  if (!profile) {
    redirect("/login?redirect=/admin");
  }
  if (profile.role !== "admin") {
    redirect("/account");
  }

  return children;
}
