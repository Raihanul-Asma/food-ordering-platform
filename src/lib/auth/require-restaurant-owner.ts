import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Restaurant } from "@/types/database";

type RestaurantOwnerContext = {
  user: { id: string; email?: string };
  profile: Profile;
};

export async function requireRestaurantOwner(
  redirectTo = "/restaurants/new",
): Promise<RestaurantOwnerContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (error || !profile) {
    redirect("/dashboard");
  }

  if (profile.role !== "restaurant_owner" && profile.role !== "admin") {
    redirect("/restaurants?error=owner-only");
  }

  return { user, profile };
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile };
}

export async function getRestaurantWithAccess(restaurantId: string) {
  const { user } = await getCurrentUserProfile();
  const supabase = await createClient();

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single<Restaurant>();

  if (error || !restaurant) {
    notFound();
  }

  const isOwner = user?.id === restaurant.owner_id;

  if (!restaurant.is_active && !isOwner) {
    notFound();
  }

  return { restaurant, user, isOwner };
}

export async function requireOwnedRestaurant(
  restaurantId: string,
  redirectTo: string,
) {
  const { user } = await requireRestaurantOwner(redirectTo);
  const supabase = await createClient();

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single<Restaurant>();

  if (error || !restaurant) {
    notFound();
  }

  if (restaurant.owner_id !== user.id) {
    redirect(`/restaurants/${restaurantId}/menu?error=unauthorized`);
  }

  return { user, restaurant };
}
