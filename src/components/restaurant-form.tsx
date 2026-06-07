"use client";

import { useActionState } from "react";
import {
  createRestaurant,
  updateRestaurant,
} from "@/app/restaurants/actions";
import {
  initialRestaurantState,
  type RestaurantActionState,
} from "@/app/restaurants/state";
import { RESTAURANT_CATEGORIES } from "@/lib/constants/restaurant-categories";
import { SubmitButton } from "@/components/submit-button";
import type { Restaurant } from "@/types/database";

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

type RestaurantFormProps = {
  mode: "create" | "edit";
  restaurant?: Restaurant;
};

export function RestaurantForm({ mode, restaurant }: RestaurantFormProps) {
  const action = mode === "create" ? createRestaurant : updateRestaurant;

  const [state, formAction] = useActionState<
    RestaurantActionState,
    FormData
  >(action, initialRestaurantState);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && restaurant ? (
        <input type="hidden" name="restaurantId" value={restaurant.id} />
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
          defaultValue={restaurant?.name ?? ""}
          className={inputClassName}
          placeholder="Joe's Pizza"
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
          defaultValue={restaurant?.description ?? ""}
          className={inputClassName}
          placeholder="Tell customers about your restaurant…"
        />
      </div>

      <div>
        <label htmlFor="category" className={labelClassName}>
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={restaurant?.category ?? ""}
          className={inputClassName}
        >
          <option value="" disabled>
            Select a category
          </option>
          {RESTAURANT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="address" className={labelClassName}>
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          defaultValue={restaurant?.address ?? ""}
          className={inputClassName}
          placeholder="123 Main Street"
        />
      </div>

      <div>
        <label htmlFor="city" className={labelClassName}>
          City
        </label>
        <input
          id="city"
          name="city"
          type="text"
          required
          defaultValue={restaurant?.city ?? "Trichy"}
          className={inputClassName}
          placeholder="Trichy"
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
          defaultValue={restaurant?.image_url ?? ""}
          className={inputClassName}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <SubmitButton
        label={mode === "create" ? "Create restaurant" : "Save changes"}
        pendingLabel={mode === "create" ? "Creating…" : "Saving…"}
      />
    </form>
  );
}
