import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "@/app/cart/actions";

type CartQuantityControlsProps = {
  cartItemId: string;
  quantity: number;
};

const buttonClassName =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900";

export function CartQuantityControls({
  cartItemId,
  quantity,
}: CartQuantityControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <form action={decreaseQuantity}>
          <input type="hidden" name="cartItemId" value={cartItemId} />
          <button type="submit" className={buttonClassName} aria-label="Decrease quantity">
            −
          </button>
        </form>
        <span className="min-w-8 text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {quantity}
        </span>
        <form action={increaseQuantity}>
          <input type="hidden" name="cartItemId" value={cartItemId} />
          <button type="submit" className={buttonClassName} aria-label="Increase quantity">
            +
          </button>
        </form>
      </div>

      <form action={removeFromCart}>
        <input type="hidden" name="cartItemId" value={cartItemId} />
        <button
          type="submit"
          className="text-sm font-medium text-red-600 underline-offset-4 hover:underline dark:text-red-400"
        >
          Remove
        </button>
      </form>
    </div>
  );
}
