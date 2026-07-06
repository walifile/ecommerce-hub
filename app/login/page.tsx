import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your ToyVerse account."
      footer={
        <>
          New to ToyVerse?{" "}
          <Link href="/signup" className="font-semibold text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm mode="login" redirectTo={redirect} />
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
        <p className="font-semibold text-white">Admin login</p>
        <div className="mt-3 grid gap-2">
          <p>
            Email:{" "}
            <span className="font-medium text-white">waliahmadfiles@gmail.com</span>
          </p>
          <p>
            Password: <span className="font-medium text-white">Admin@123</span>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
