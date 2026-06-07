"use client";

import { deleteRestaurant } from "@/app/restaurants/actions";

type DeleteRestaurantButtonProps = {
  restaurantId: string;
  restaurantName: string;
};

export function DeleteRestaurantButton({
  restaurantId,
  restaurantName,
}: DeleteRestaurantButtonProps) {
  return (
    <form
      action={deleteRestaurant}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete "${restaurantName}"? This cannot be undone.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <button
        type="submit"
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
      >
        Delete restaurant
      </button>
    </form>
  );
}
