"use server";

import { revalidatePath } from "next/cache";
import { requireLoggedInUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import type { CartActionState } from "@/app/cart/state";

async function getOwnedCartItem(cartItemId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cart_items")
    .select("id, quantity, user_id")
    .eq("id", cartItemId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function addToCart(
  _prevState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const user = await requireLoggedInUser();
  const menuItemId = String(formData.get("menuItemId") ?? "").trim();
  const restaurantId = String(formData.get("restaurantId") ?? "").trim();

  if (!menuItemId) {
    return { error: "Menu item ID is missing.", success: null };
  }

  const supabase = await createClient();

  const { data: menuItem, error: menuError } = await supabase
    .from("menu_items")
    .select("id, is_available")
    .eq("id", menuItemId)
    .single();

  if (menuError || !menuItem) {
    return { error: "Menu item not found.", success: null };
  }

  if (!menuItem.is_available) {
    return { error: "This item is not available.", success: null };
  }

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("menu_item_id", menuItemId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id)
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message, success: null };
    }
  } else {
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      menu_item_id: menuItemId,
      quantity: 1,
    });

    if (error) {
      return { error: error.message, success: null };
    }
  }

  revalidatePath("/cart");
  if (restaurantId) {
    revalidatePath(`/restaurants/${restaurantId}/menu`);
  }

  return { error: null, success: "Added to cart." };
}

export async function increaseQuantity(formData: FormData) {
  const user = await requireLoggedInUser("/cart");
  const cartItemId = String(formData.get("cartItemId") ?? "").trim();

  if (!cartItemId) {
    return;
  }

  const cartItem = await getOwnedCartItem(cartItemId, user.id);

  if (!cartItem) {
    return;
  }

  const supabase = await createClient();

  await supabase
    .from("cart_items")
    .update({ quantity: cartItem.quantity + 1 })
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  revalidatePath("/cart");
}

export async function decreaseQuantity(formData: FormData) {
  const user = await requireLoggedInUser("/cart");
  const cartItemId = String(formData.get("cartItemId") ?? "").trim();

  if (!cartItemId) {
    return;
  }

  const cartItem = await getOwnedCartItem(cartItemId, user.id);

  if (!cartItem) {
    return;
  }

  const supabase = await createClient();

  if (cartItem.quantity <= 1) {
    await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("cart_items")
      .update({ quantity: cartItem.quantity - 1 })
      .eq("id", cartItemId)
      .eq("user_id", user.id);
  }

  revalidatePath("/cart");
}

export async function removeFromCart(formData: FormData) {
  const user = await requireLoggedInUser("/cart");
  const cartItemId = String(formData.get("cartItemId") ?? "").trim();

  if (!cartItemId) {
    return;
  }

  const supabase = await createClient();

  await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  revalidatePath("/cart");
}
