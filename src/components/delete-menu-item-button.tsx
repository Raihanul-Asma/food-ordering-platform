"use client";

import { deleteMenuItem } from "@/app/restaurants/menu/actions";

type DeleteMenuItemButtonProps = {
  restaurantId: string;
  menuItemId: string;
  menuItemName: string;
};

export function DeleteMenuItemButton({
  restaurantId,
  menuItemId,
  menuItemName,
}: DeleteMenuItemButtonProps) {
  return (
    <form
      action={deleteMenuItem}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete "${menuItemName}" from the menu? This cannot be undone.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <input type="hidden" name="menuItemId" value={menuItemId} />
      <button
        type="submit"
        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
      >
        Delete
      </button>
    </form>
  );
}
