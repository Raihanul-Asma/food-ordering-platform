"use client";

import { useActionState } from "react";
import {
  createMenuItem,
  updateMenuItem,
} from "@/app/restaurants/menu/actions";
import {
  initialMenuItemState,
  type MenuItemActionState,
} from "@/app/restaurants/menu/state";
import { SubmitButton } from "@/components/submit-button";
import type { MenuItem } from "@/types/database";

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

type MenuItemFormProps = {
  mode: "create" | "edit";
  restaurantId: string;
  menuItem?: MenuItem;
};

export function MenuItemForm({
  mode,
  restaurantId,
  menuItem,
}: MenuItemFormProps) {
  const action = mode === "create" ? createMenuItem : updateMenuItem;

  const [state, formAction] = useActionState<MenuItemActionState, FormData>(
    action,
    initialMenuItemState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      {mode === "edit" && menuItem ? (
        <input type="hidden" name="menuItemId" value={menuItem.id} />
      ) : null}

      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          {state.success}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className={labelClassName}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={menuItem?.name ?? ""}
          className={inputClassName}
          placeholder="Margherita Pizza"
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClassName}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={menuItem?.description ?? ""}
          className={inputClassName}
          placeholder="Describe this menu item…"
        />
      </div>

      <div>
        <label htmlFor="price" className={labelClassName}>
          Price (INR)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={menuItem?.price ?? ""}
          className={inputClassName}
          placeholder="299.00"
        />
      </div>

      <div>
        <label htmlFor="image_url" className={labelClassName}>
          Image URL
        </label>
        <input
          id="image_url"
          name="image_url"
          type="url"
          defaultValue={menuItem?.image_url ?? ""}
          className={inputClassName}
          placeholder="https://example.com/item.jpg"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_available"
          name="is_available"
          type="checkbox"
          defaultChecked={menuItem?.is_available ?? true}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-600"
        />
        <label
          htmlFor="is_available"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Available for ordering
        </label>
      </div>

      <SubmitButton
        label={mode === "create" ? "Add menu item" : "Save changes"}
        pendingLabel={mode === "create" ? "Adding…" : "Saving…"}
      />
    </form>
  );
}
