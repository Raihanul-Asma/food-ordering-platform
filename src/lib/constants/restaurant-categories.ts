export const RESTAURANT_CATEGORIES = [
  "Indian",
  "Chinese",
  "Italian",
  "Mexican",
  "American",
  "Thai",
  "Japanese",
  "Fast Food",
  "Cafe",
  "Other",
] as const;

export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number];
