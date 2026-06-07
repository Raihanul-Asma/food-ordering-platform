import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/require-restaurant-owner";
import { createClient } from "@/lib/supabase/server";
import { DeleteRestaurantButton } from "@/components/delete-restaurant-button";
import { RestaurantForm } from "@/components/restaurant-form";
import type { Restaurant } from "@/types/database";

type RestaurantDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function RestaurantDetailPage({
  params,
  searchParams,
}: RestaurantDetailPageProps) {
  const { id } = await params;
  const { error: queryError } = await searchParams;
  const { user } = await getCurrentUserProfile();
  const supabase = await createClient();

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single<Restaurant>();

  if (error || !restaurant) {
    notFound();
  }

  const isOwner = user?.id === restaurant.owner_id;

  if (!restaurant.is_active && !isOwner) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/restaurants"
        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to restaurants
      </Link>

      <article className="mt-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {restaurant.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="mb-6 h-48 w-full rounded-xl object-cover"
          />
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {restaurant.name}
            </h1>
            {restaurant.category ? (
              <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {restaurant.category}
              </p>
            ) : null}
          </div>

          {!restaurant.is_active && isOwner ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Inactive
            </span>
          ) : null}
        </div>

        {restaurant.description ? (
          <p className="mt-6 text-zinc-700 dark:text-zinc-300">
            {restaurant.description}
          </p>
        ) : null}

        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Address
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {restaurant.address}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              City
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {restaurant.city}
            </dd>
          </div>
        </dl>
      </article>

      {isOwner ? (
        <section className="mt-8 space-y-8">
          {queryError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {decodeURIComponent(queryError)}
            </p>
          ) : null}

          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Edit restaurant
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Update your restaurant details below.
            </p>
            <div className="mt-6">
              <RestaurantForm mode="edit" restaurant={restaurant} />
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900 dark:bg-red-950">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-200">
              Danger zone
            </h2>
            <p className="mt-2 text-sm text-red-800 dark:text-red-300">
              Deleting a restaurant is permanent. Restaurants with existing
              orders cannot be deleted.
            </p>
            <div className="mt-4">
              <DeleteRestaurantButton
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
              />
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
