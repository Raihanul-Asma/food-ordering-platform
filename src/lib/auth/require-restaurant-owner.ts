import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

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
