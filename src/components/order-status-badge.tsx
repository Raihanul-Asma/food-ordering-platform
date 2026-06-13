import { formatOrderStatus } from "@/app/orders/state";
import type { OrderStatus } from "@/types/database";

const statusStyles: Record<OrderStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  confirmed:
    "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  preparing:
    "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  ready:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  delivered:
    "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}
    >
      {formatOrderStatus(status)}
    </span>
  );
}
