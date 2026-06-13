import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatPrice } from "@/app/restaurants/menu/state";
import { getCurrentUserProfile } from "@/lib/auth/require-restaurant-owner";
import { requireLoggedInUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import type { OrderWithDetails } from "@/types/database";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const { id } = await params;
  const { placed } = await searchParams;
  const user = await requireLoggedInUser(`/orders/${id}`);
  const { profile } = await getCurrentUserProfile();
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      restaurants ( name, owner_id, address, city ),
      order_items ( * )
    `,
    )
    .eq("id", id)
    .single<OrderWithDetails>();

  if (error || !order) {
    notFound();
  }

  const isCustomer = order.customer_id === user.id;
  const isRestaurantOwner =
    order.restaurants?.owner_id === user.id &&
    (profile?.role === "restaurant_owner" || profile?.role === "admin");

  if (!isCustomer && !isRestaurantOwner) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/orders"
        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to orders
      </Link>

      {placed === "1" ? (
        <p className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          Order placed successfully.
        </p>
      ) : null}

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Order details
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {order.restaurants?.name ?? "Restaurant"}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Order ID
            </dt>
            <dd className="mt-1 break-all font-mono text-xs text-zinc-900 dark:text-zinc-100">
              {order.id}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Placed on
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {new Date(order.created_at).toLocaleString()}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Delivery address
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {order.delivery_address}
            </dd>
          </div>
          {order.notes ? (
            <div className="sm:col-span-2">
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Notes
              </dt>
              <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
                {order.notes}
              </dd>
            </div>
          ) : null}
          {isRestaurantOwner ? (
            <div className="sm:col-span-2">
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Viewing as
              </dt>
              <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
                Restaurant owner
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Items
          </h2>
          <ul className="mt-4 space-y-3">
            {order.order_items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {item.item_name}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatPrice(item.unit_price)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <span className="text-base font-medium text-zinc-700 dark:text-zinc-300">
            Total
          </span>
          <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatPrice(order.total_amount)}
          </span>
        </div>
      </div>
    </main>
  );
}
