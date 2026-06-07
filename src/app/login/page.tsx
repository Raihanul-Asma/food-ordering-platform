import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
  searchParams: Promise<{ redirectTo?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to your account to continue."
    >
      <LoginForm redirectTo={redirectTo ?? "/dashboard"} />
      <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
        <Link href="/" className="hover:underline">
          ← Back to home
        </Link>
      </p>
    </AuthCard>
  );
}
