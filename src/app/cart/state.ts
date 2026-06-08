export type CartActionState = {
  error: string | null;
  success: string | null;
};

export const initialCartState: CartActionState = {
  error: null,
  success: null,
};

export function calculateCartSubtotal(
  items: Array<{ quantity: number; menu_item: { price: number } | null }>,
) {
  return items.reduce((total, item) => {
    if (!item.menu_item) return total;
    return total + item.quantity * item.menu_item.price;
  }, 0);
}
