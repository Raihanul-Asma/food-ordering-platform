import Link from "next/link";
import { getCurrentUserProfile } from "@/lib/auth/require-restaurant-owner";
import { createClient } from "@/lib/supabase/server";
import type { Restaurant } from "@/types/database";

type RestaurantsPageProps = {
  searchParams: Promise<{
    error?: string;
    deleted?: string;
  }>;
};

function RestaurantCard({
  restaurant,
  isOwnerView = false,
}: {
  restaurant: Restaurant;
  isOwnerView?: boolean;
}) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {restaurant.name}
          </h2>
          {restaurant.category ? (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {restaurant.category}
            </p>
          ) : null}
        </div>
        {isOwnerView && !restaurant.is_active ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Inactive
          </span>
        ) : null}
      </div>

      {restaurant.description ? (
        <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {restaurant.description}
        </p>
      ) : null}

      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
        {restaurant.address}, {restaurant.city}
      </p>
    </Link>
  );
}

export default async function RestaurantsPage({
  searchParams,
}: RestaurantsPageProps) {
  const { error, deleted } = await searchParams;
  const { user, profile } = await getCurrentUserProfile();
  const supabase = await createClient();

  const isOwner =
    profile?.role === "restaurant_owner" || profile?.role === "admin";

  const { data: publicRestaurants } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<Restaurant[]>();

  let myRestaurants: Restaurant[] = [];

  if (user && isOwner) {
    const { data } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .returns<Restaurant[]>();

    myRestaurants = data ?? [];
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            Restaurants
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Browse restaurants or manage your listings.
          </p>
        </div>

        {isOwner ? (
          <Link
            href="/restaurants/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Add restaurant
          </Link>
        ) : null}
      </div>

      {deleted === "1" ? (
        <p className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          Restaurant deleted successfully.
        </p>
      ) : null}

      {error === "owner-only" ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Only restaurant owners can create restaurants. Ask an admin to update
          your profile role to <code className="font-mono">restaurant_owner</code>.
        </p>
      ) : null}

      {error && error !== "owner-only" ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error === "unauthorized"
            ? "You are not allowed to perform that action."
            : error === "not-found"
              ? "Restaurant not found."
              : "Something went wrong."}
        </p>
      ) : null}

      {isOwner ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            My restaurants
          </h2>
          {myRestaurants.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {myRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  isOwnerView
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              You haven&apos;t created any restaurants yet.{" "}
              <Link
                href="/restaurants/new"
                className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
              >
                Add your first one
              </Link>
              .
            </p>
          )}
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {isOwner ? "All active restaurants" : "Browse restaurants"}
        </h2>
        {publicRestaurants && publicRestaurants.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {publicRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            No active restaurants yet.
          </p>
        )}
      </section>
    </main>
  );
}
