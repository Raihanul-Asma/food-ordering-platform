"use client";

import { useActionState } from "react";
import { addToCart } from "@/app/cart/actions";
import { initialCartState } from "@/app/cart/state";
import { SubmitButton } from "@/components/submit-button";

type AddToCartButtonProps = {
  menuItemId: string;
  restaurantId: string;
};

export function AddToCartButton({
  menuItemId,
  restaurantId,
}: AddToCartButtonProps) {
  const [state, formAction] = useActionState(addToCart, initialCartState);

  return (
    <div className="mt-4">
      <form action={formAction}>
        <input type="hidden" name="menuItemId" value={menuItemId} />
        <input type="hidden" name="restaurantId" value={restaurantId} />
        <SubmitButton label="Add to cart" pendingLabel="Adding…" />
      </form>
      {state.error ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
