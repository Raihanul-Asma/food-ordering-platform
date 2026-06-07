export type RestaurantActionState = {
  error: string | null;
  success: string | null;
};

export const initialRestaurantState: RestaurantActionState = {
  error: null,
  success: null,
};

export type RestaurantFormFields = {
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  image_url: string;
};

export function parseRestaurantFormData(formData: FormData): RestaurantFormFields {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    image_url: String(formData.get("image_url") ?? "").trim(),
  };
}

export function validateRestaurantFields(
  fields: RestaurantFormFields,
): string | null {
  if (!fields.name) return "Restaurant name is required.";
  if (!fields.address) return "Address is required.";
  if (!fields.city) return "City is required.";
  if (!fields.category) return "Category is required.";
  return null;
}
