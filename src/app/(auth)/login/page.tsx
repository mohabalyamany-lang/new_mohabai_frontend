import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Mohab AI
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Sign in to your account
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6">
          <LoginForm />
          <p className="text-center text-sm text-[var(--text-muted)] mt-4">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[var(--accent)] hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
