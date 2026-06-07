import Link from "next/link";
import { requireRestaurantOwner } from "@/lib/auth/require-restaurant-owner";
import { RestaurantForm } from "@/components/restaurant-form";

export default async function NewRestaurantPage() {
  await requireRestaurantOwner("/restaurants/new");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="mb-8">
        <Link
          href="/restaurants"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to restaurants
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          Add a restaurant
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Create a new listing for your food business.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <RestaurantForm mode="create" />
      </div>
    </main>
  );
}
