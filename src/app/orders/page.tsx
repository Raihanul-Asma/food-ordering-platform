import Link from "next/link";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatPrice } from "@/app/restaurants/menu/state";
import { getCurrentUserProfile } from "@/lib/auth/require-restaurant-owner";
import { requireLoggedInUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import type { OrderWithRestaurant } from "@/types/database";

type OrdersPageProps = {
  searchParams: Promise<{ placed?: string }>;
};

function OrderCard({
  order,
  subtitle,
}: {
  order: OrderWithRestaurant;
  subtitle: string;
}) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {order.restaurants?.name ?? "Restaurant"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">
          {new Date(order.created_at).toLocaleString()}
        </span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {formatPrice(order.total_amount)}
        </span>
      </div>
    </Link>
  );
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const user = await requireLoggedInUser("/orders");
  const { profile } = await getCurrentUserProfile();
  const { placed } = await searchParams;
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      restaurants ( name, owner_id )
    `,
    )
    .order("created_at", { ascending: false })
    .returns<OrderWithRestaurant[]>();

  const myOrders =
    orders?.filter((order) => order.customer_id === user.id) ?? [];

  const isOwner =
    profile?.role === "restaurant_owner" || profile?.role === "admin";

  const restaurantOrders = isOwner
    ? (orders?.filter(
        (order) => order.restaurants?.owner_id === user.id,
      ) ?? [])
    : [];

  const incomingOrders = restaurantOrders.filter(
    (order) => order.customer_id !== user.id,
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        Orders
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        View your order history and incoming restaurant orders.
      </p>

      {placed === "1" ? (
        <p className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
          Order placed successfully.
        </p>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Failed to load orders: {error.message}
        </p>
      ) : null}

      {isOwner ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Incoming orders
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Orders placed at your restaurants.
          </p>
          {incomingOrders.length > 0 ? (
            <div className="mt-4 grid gap-4">
              {incomingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  subtitle="Customer order"
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              No incoming orders yet.
            </p>
          )}
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {isOwner ? "Your orders" : "Order history"}
        </h2>
        {myOrders.length > 0 ? (
          <div className="mt-4 grid gap-4">
            {myOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                subtitle="Placed by you"
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            You haven&apos;t placed any orders yet.{" "}
            <Link
              href="/restaurants"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
            >
              Browse restaurants
            </Link>
            .
          </p>
        )}
      </section>
    </main>
  );
}
