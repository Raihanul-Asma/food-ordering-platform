export type OrderActionState = {
  error: string | null;
  success: string | null;
};

export const initialOrderState: OrderActionState = {
  error: null,
  success: null,
};

export function formatOrderStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function groupCartItemsByRestaurant<
  T extends {
    quantity: number;
    menu_item: {
      id: string;
      name: string;
      price: number;
      is_available: boolean;
      restaurant_id: string;
      restaurants: { name: string; is_active: boolean } | null;
    } | null;
  },
>(items: T[]) {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    if (!item.menu_item) continue;

    const restaurantId = item.menu_item.restaurant_id;
    const existing = groups.get(restaurantId) ?? [];
    existing.push(item);
    groups.set(restaurantId, existing);
  }

  return groups;
}

export function calculateOrderTotal<
  T extends {
    quantity: number;
    menu_item: { price: number } | null;
  },
>(items: T[]) {
  return items.reduce((total, item) => {
    if (!item.menu_item) return total;
    return total + item.quantity * item.menu_item.price;
  }, 0);
}
