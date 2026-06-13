import Link from "next/link";
import { calculateCartSubtotal } from "@/app/cart/state";
import { formatPrice } from "@/app/restaurants/menu/state";
import { CartQuantityControls } from "@/components/cart-quantity-controls";
import { PlaceOrderForm } from "@/components/place-order-form";
import { requireLoggedInUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import type { CartLineItem } from "@/types/database";

export default async function CartPage() {
  const user = await requireLoggedInUser("/cart");
  const supabase = await createClient();

  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      menu_item:menu_items (
        id,
        name,
        price,
        image_url,
        is_available,
        restaurant_id,
        restaurants ( name )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<CartLineItem[]>();

  const subtotal = calculateCartSubtotal(cartItems ?? []);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        Your cart
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Review items before checkout.
      </p>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Failed to load cart: {error.message}
        </p>
      ) : null}

      {cartItems && cartItems.length > 0 ? (
        <>
          <ul className="mt-8 space-y-4">
            {cartItems.map((item) => {
              const menuItem = item.menu_item;
              const lineTotal = menuItem
                ? item.quantity * menuItem.price
                : 0;

              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex gap-4">
                    {menuItem?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={menuItem.image_url}
                        alt={menuItem.name}
                        className="h-20 w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                        No image
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                            {menuItem?.name ?? "Unavailable item"}
                          </h2>
                          {menuItem?.restaurants?.name ? (
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                              {menuItem.restaurants.name}
                            </p>
                          ) : null}
                        </div>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {formatPrice(lineTotal)}
                        </span>
                      </div>

                      {menuItem ? (
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {formatPrice(menuItem.price)} each
                        </p>
                      ) : null}

                      {!menuItem?.is_available ? (
                        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                          This item is no longer available.
                        </p>
                      ) : null}

                      <div className="mt-4">
                        <CartQuantityControls
                          cartItemId={item.id}
                          quantity={item.quantity}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between text-base">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Subtotal
              </span>
              <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {formatPrice(subtotal)}
              </span>
            </div>

            <PlaceOrderForm />
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Your cart is empty.
          </p>
          <Link
            href="/restaurants"
            className="mt-4 inline-flex text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
          >
            Browse restaurants
          </Link>
        </div>
      )}
    </main>
  );
}
