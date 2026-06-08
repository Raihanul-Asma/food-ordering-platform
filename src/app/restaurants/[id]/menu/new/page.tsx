import Link from "next/link";
import { MenuItemForm } from "@/components/menu-item-form";
import { requireOwnedRestaurant } from "@/lib/auth/require-restaurant-owner";

type NewMenuItemPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewMenuItemPage({ params }: NewMenuItemPageProps) {
  const { id } = await params;
  const { restaurant } = await requireOwnedRestaurant(
    id,
    `/restaurants/${id}/menu/new`,
  );

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link
        href={`/restaurants/${id}/menu`}
        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to menu
      </Link>

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          Add menu item
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Add a new item to {restaurant.name}.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <MenuItemForm mode="create" restaurantId={id} />
      </div>
    </main>
  );
}
