import Link from "next/link";
import { notFound } from "next/navigation";
import { MenuItemForm } from "@/components/menu-item-form";
import { DeleteMenuItemButton } from "@/components/delete-menu-item-button";
import { requireOwnedRestaurant } from "@/lib/auth/require-restaurant-owner";
import { createClient } from "@/lib/supabase/server";
import type { MenuItem } from "@/types/database";

type EditMenuItemPageProps = {
  params: Promise<{ id: string; menuItemId: string }>;
};

export default async function EditMenuItemPage({ params }: EditMenuItemPageProps) {
  const { id, menuItemId } = await params;

  await requireOwnedRestaurant(
    id,
    `/restaurants/${id}/menu/${menuItemId}/edit`,
  );

  const supabase = await createClient();

  const { data: menuItem, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", menuItemId)
    .eq("restaurant_id", id)
    .single<MenuItem>();

  if (error || !menuItem) {
    notFound();
  }

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
          Edit menu item
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Update details for {menuItem.name}.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <MenuItemForm mode="edit" restaurantId={id} menuItem={menuItem} />
      </div>

      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900 dark:bg-red-950">
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">
          Delete menu item
        </h2>
        <p className="mt-2 text-sm text-red-800 dark:text-red-300">
          Remove this item from your menu permanently.
        </p>
        <div className="mt-4">
          <DeleteMenuItemButton
            restaurantId={id}
            menuItemId={menuItem.id}
            menuItemName={menuItem.name}
          />
        </div>
      </div>
    </main>
  );
}
