import Link from "next/link";
import { DeleteMenuItemButton } from "@/components/delete-menu-item-button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatPrice } from "@/app/restaurants/menu/state";
import { getRestaurantWithAccess } from "@/lib/auth/require-restaurant-owner";
import { createClient } from "@/lib/supabase/server";
import type { MenuItem } from "@/types/database";

type MenuPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    deleted?: string;
  }>;
};

function MenuItemCard({
  item,
  restaurantId,
  isOwner,
  isLoggedIn,
}: {
  item: MenuItem;
  restaurantId: string;
  isOwner: boolean;
  isLoggedIn: boolean;
}) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex gap-4">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="h-20 w-20 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            No image
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {item.name}
            </h2>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {formatPrice(item.price)}
            </span>
          </div>

          {item.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {item.description}
            </p>
          ) : null}

          {isOwner && !item.is_available ? (
            <span className="mt-3 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Unavailable
            </span>
          ) : null}

          {isOwner ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={`/restaurants/${restaurantId}/menu/${item.id}/edit`}
                className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
              >
                Edit
              </Link>
              <DeleteMenuItemButton
                restaurantId={restaurantId}
                menuItemId={item.id}
                menuItemName={item.name}
              />
            </div>
          ) : item.is_available ? (
            isLoggedIn ? (
              <AddToCartButton
                menuItemId={item.id}
                restaurantId={restaurantId}
              />
            ) : (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                <Link
                  href={`/login?redirectTo=${encodeURIComponent(`/restaurants/${restaurantId}/menu`)}`}
                  className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                >
                  Log in
                </Link>{" "}
                to add to cart
              </p>
            )
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default async function MenuPage({ params, searchParams }: MenuPageProps) {
  const { id } = await params;
  const { error, deleted } = await searchParams;
  const { restaurant, isOwner, user } = await getRestaurantWithAccess(id);
  const supabase = await createClient();

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: false })
    .returns<MenuItem[]>();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href={`/restaurants/${id}`}
        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to {restaurant.name}
      </Link>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            Menu
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {isOwner
              ? "Manage items for your restaurant."
              : `Browse items from ${restaurant.name}.`}
          </p>
        </div>

        {isOwner ? (
          <Link
            href={`/restaurants/${id}/menu/new`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Add menu item
          </Link>
        ) : null}
      </div>

      {deleted === "1" ? (
        <p className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          Menu item deleted successfully.
        </p>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error === "unauthorized"
            ? "You are not allowed to manage this menu."
            : error === "not-found"
              ? "Menu item not found."
              : decodeURIComponent(error)}
        </p>
      ) : null}

      {menuItems && menuItems.length > 0 ? (
        <div className="mt-8 grid gap-4">
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              restaurantId={id}
              isOwner={isOwner}
              isLoggedIn={Boolean(user)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          {isOwner
            ? "No menu items yet. Add your first item to get started."
            : "No menu items available right now."}
        </p>
      )}
    </main>
  );
}
