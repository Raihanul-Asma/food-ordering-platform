import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Sign up to start ordering food."
    >
      <SignupForm />
      <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
        <Link href="/" className="hover:underline">
          ← Back to home
        </Link>
      </p>
    </AuthCard>
  );
}
