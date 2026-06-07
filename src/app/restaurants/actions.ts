"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRestaurantOwner } from "@/lib/auth/require-restaurant-owner";
import { createClient } from "@/lib/supabase/server";
import type { RestaurantActionState } from "@/app/restaurants/state";
import {
  parseRestaurantFormData,
  validateRestaurantFields,
} from "@/app/restaurants/state";

export async function createRestaurant(
  _prevState: RestaurantActionState,
  formData: FormData,
): Promise<RestaurantActionState> {
  const { user } = await requireRestaurantOwner("/restaurants/new");

  const fields = parseRestaurantFormData(formData);
  const validationError = validateRestaurantFields(fields);

  if (validationError) {
    return { error: validationError, success: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurants")
    .insert({
      owner_id: user.id,
      name: fields.name,
      description: fields.description || null,
      category: fields.category,
      address: fields.address,
      city: fields.city,
      image_url: fields.image_url || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message, success: null };
  }

  revalidatePath("/restaurants");
  redirect(`/restaurants/${data.id}`);
}

export async function updateRestaurant(
  _prevState: RestaurantActionState,
  formData: FormData,
): Promise<RestaurantActionState> {
  const { user } = await requireRestaurantOwner("/restaurants");

  const restaurantId = String(formData.get("restaurantId") ?? "").trim();

  if (!restaurantId) {
    return { error: "Restaurant ID is missing.", success: null };
  }

  const fields = parseRestaurantFormData(formData);
  const validationError = validateRestaurantFields(fields);

  if (validationError) {
    return { error: validationError, success: null };
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("restaurants")
    .select("owner_id")
    .eq("id", restaurantId)
    .single();

  if (fetchError || !existing) {
    return { error: "Restaurant not found.", success: null };
  }

  if (existing.owner_id !== user.id) {
    return { error: "You can only edit your own restaurants.", success: null };
  }

  const { error } = await supabase
    .from("restaurants")
    .update({
      name: fields.name,
      description: fields.description || null,
      category: fields.category,
      address: fields.address,
      city: fields.city,
      image_url: fields.image_url || null,
    })
    .eq("id", restaurantId)
    .eq("owner_id", user.id);

  if (error) {
    return { error: error.message, success: null };
  }

  revalidatePath("/restaurants");
  revalidatePath(`/restaurants/${restaurantId}`);

  return { error: null, success: "Restaurant updated successfully." };
}

export async function deleteRestaurant(formData: FormData) {
  const { user } = await requireRestaurantOwner("/restaurants");

  const restaurantId = String(formData.get("restaurantId") ?? "").trim();

  if (!restaurantId) {
    redirect("/restaurants?error=missing-id");
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("restaurants")
    .select("owner_id")
    .eq("id", restaurantId)
    .single();

  if (fetchError || !existing) {
    redirect("/restaurants?error=not-found");
  }

  if (existing.owner_id !== user.id) {
    redirect("/restaurants?error=unauthorized");
  }

  const { error } = await supabase
    .from("restaurants")
    .delete()
    .eq("id", restaurantId)
    .eq("owner_id", user.id);

  if (error) {
    redirect(
      `/restaurants/${restaurantId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/restaurants");
  redirect("/restaurants?deleted=1");
}
