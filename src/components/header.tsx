import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Food Ordering
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/restaurants"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Restaurants
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Dashboard
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
