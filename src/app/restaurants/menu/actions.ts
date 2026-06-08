"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseMenuItemFormData,
  validateMenuItemFields,
} from "@/app/restaurants/menu/state";
import type { MenuItemActionState } from "@/app/restaurants/menu/state";
import { requireOwnedRestaurant } from "@/lib/auth/require-restaurant-owner";
import { createClient } from "@/lib/supabase/server";

function menuPath(restaurantId: string) {
  return `/restaurants/${restaurantId}/menu`;
}

export async function createMenuItem(
  _prevState: MenuItemActionState,
  formData: FormData,
): Promise<MenuItemActionState> {
  const restaurantId = String(formData.get("restaurantId") ?? "").trim();

  if (!restaurantId) {
    return { error: "Restaurant ID is missing.", success: null };
  }

  await requireOwnedRestaurant(
    restaurantId,
    `/restaurants/${restaurantId}/menu/new`,
  );

  const fields = parseMenuItemFormData(formData);
  const validationError = validateMenuItemFields(fields);

  if (validationError) {
    return { error: validationError, success: null };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("menu_items").insert({
    restaurant_id: restaurantId,
    name: fields.name,
    description: fields.description || null,
    price: Number(fields.price),
    image_url: fields.image_url || null,
    is_available: fields.is_available,
  });

  if (error) {
    return { error: error.message, success: null };
  }

  revalidatePath(menuPath(restaurantId));
  redirect(menuPath(restaurantId));
}

export async function updateMenuItem(
  _prevState: MenuItemActionState,
  formData: FormData,
): Promise<MenuItemActionState> {
  const restaurantId = String(formData.get("restaurantId") ?? "").trim();
  const menuItemId = String(formData.get("menuItemId") ?? "").trim();

  if (!restaurantId || !menuItemId) {
    return { error: "Restaurant or menu item ID is missing.", success: null };
  }

  await requireOwnedRestaurant(
    restaurantId,
    `/restaurants/${restaurantId}/menu/${menuItemId}/edit`,
  );

  const fields = parseMenuItemFormData(formData);
  const validationError = validateMenuItemFields(fields);

  if (validationError) {
    return { error: validationError, success: null };
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("menu_items")
    .select("restaurant_id")
    .eq("id", menuItemId)
    .single();

  if (fetchError || !existing) {
    return { error: "Menu item not found.", success: null };
  }

  if (existing.restaurant_id !== restaurantId) {
    return { error: "Menu item does not belong to this restaurant.", success: null };
  }

  const { error } = await supabase
    .from("menu_items")
    .update({
      name: fields.name,
      description: fields.description || null,
      price: Number(fields.price),
      image_url: fields.image_url || null,
      is_available: fields.is_available,
    })
    .eq("id", menuItemId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    return { error: error.message, success: null };
  }

  revalidatePath(menuPath(restaurantId));
  revalidatePath(`/restaurants/${restaurantId}/menu/${menuItemId}/edit`);

  return { error: null, success: "Menu item updated successfully." };
}

export async function deleteMenuItem(formData: FormData) {
  const restaurantId = String(formData.get("restaurantId") ?? "").trim();
  const menuItemId = String(formData.get("menuItemId") ?? "").trim();

  if (!restaurantId || !menuItemId) {
    redirect("/restaurants?error=missing-id");
  }

  await requireOwnedRestaurant(
    restaurantId,
    menuPath(restaurantId),
  );

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("menu_items")
    .select("restaurant_id")
    .eq("id", menuItemId)
    .single();

  if (fetchError || !existing) {
    redirect(`${menuPath(restaurantId)}?error=not-found`);
  }

  if (existing.restaurant_id !== restaurantId) {
    redirect(`${menuPath(restaurantId)}?error=unauthorized`);
  }

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", menuItemId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    redirect(
      `${menuPath(restaurantId)}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(menuPath(restaurantId));
  redirect(`${menuPath(restaurantId)}?deleted=1`);
}
