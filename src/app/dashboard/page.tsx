import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This route is protected. Only logged-in users can see it.
        </p>

        <dl className="mt-8 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Auth email
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {user.email}
            </dd>
          </div>

          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Profile name
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {profile?.full_name ?? "—"}
            </dd>
          </div>

          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Role
            </dt>
            <dd className="mt-1 capitalize text-zinc-900 dark:text-zinc-100">
              {profile?.role ?? "—"}
            </dd>
          </div>

          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Profile created
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleString()
                : error
                  ? "Could not load profile"
                  : "—"}
            </dd>
          </div>
        </dl>

        {error ? (
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            Profile query failed: {error.message}. Make sure you ran{" "}
            <code className="font-mono">supabase/schema.sql</code> in your
            Supabase project.
          </p>
        ) : null}

        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
