"use client";

import { useActionState } from "react";
import { placeOrder } from "@/app/orders/actions";
import { initialOrderState } from "@/app/orders/state";
import { SubmitButton } from "@/components/submit-button";

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function PlaceOrderForm() {
  const [state, formAction] = useActionState(placeOrder, initialOrderState);

  return (
    <form action={formAction} className="mt-6 space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Checkout
      </h2>

      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="deliveryAddress" className={labelClassName}>
          Delivery address
        </label>
        <textarea
          id="deliveryAddress"
          name="deliveryAddress"
          rows={3}
          required
          className={inputClassName}
          placeholder="Street, area, landmark…"
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClassName}>
          Order notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className={inputClassName}
          placeholder="Extra spicy, no onions…"
        />
      </div>

      <SubmitButton label="Place order" pendingLabel="Placing order…" />
    </form>
  );
}
