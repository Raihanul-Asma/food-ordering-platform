"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  calculateOrderTotal,
  groupCartItemsByRestaurant,
} from "@/app/orders/state";
import type { OrderActionState } from "@/app/orders/state";
import { requireLoggedInUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import type { CartLineItem } from "@/types/database";

export async function placeOrder(
  _prevState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const user = await requireLoggedInUser("/cart");
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!deliveryAddress) {
    return { error: "Delivery address is required.", success: null };
  }

  const supabase = await createClient();

  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      menu_item:menu_items (
        id,
        name,
        price,
        is_available,
        restaurant_id,
        restaurants ( name, is_active )
      )
    `,
    )
    .eq("user_id", user.id)
    .returns<CartLineItem[]>();

  if (cartError) {
    return { error: cartError.message, success: null };
  }

  if (!cartItems || cartItems.length === 0) {
    return { error: "Your cart is empty.", success: null };
  }

  const invalidItems = cartItems.filter(
    (item) =>
      !item.menu_item ||
      !item.menu_item.is_available ||
      !item.menu_item.restaurants?.is_active,
  );

  if (invalidItems.length > 0) {
    return {
      error: "Remove unavailable items from your cart before placing an order.",
      success: null,
    };
  }

  const groups = groupCartItemsByRestaurant(cartItems);
  const createdOrderIds: string[] = [];

  for (const [restaurantId, items] of groups) {
    const totalAmount = calculateOrderTotal(items);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: user.id,
        restaurant_id: restaurantId,
        total_amount: totalAmount,
        delivery_address: deliveryAddress,
        notes: notes || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return {
        error: orderError?.message ?? "Failed to create order.",
        success: null,
      };
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item!.id,
      item_name: item.menu_item!.name,
      unit_price: item.menu_item!.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      return { error: itemsError.message, success: null };
    }

    createdOrderIds.push(order.id);
  }

  const { error: clearError } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);

  if (clearError) {
    return { error: clearError.message, success: null };
  }

  revalidatePath("/cart");
  revalidatePath("/orders");

  if (createdOrderIds.length === 1) {
    redirect(`/orders/${createdOrderIds[0]}?placed=1`);
  }

  redirect("/orders?placed=1");
}
