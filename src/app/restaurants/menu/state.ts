export type MenuItemActionState = {
  error: string | null;
  success: string | null;
};

export const initialMenuItemState: MenuItemActionState = {
  error: null,
  success: null,
};

export type MenuItemFormFields = {
  name: string;
  description: string;
  price: string;
  image_url: string;
  is_available: boolean;
};

export function parseMenuItemFormData(formData: FormData): MenuItemFormFields {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: String(formData.get("price") ?? "").trim(),
    image_url: String(formData.get("image_url") ?? "").trim(),
    is_available: formData.get("is_available") === "on",
  };
}

export function validateMenuItemFields(
  fields: MenuItemFormFields,
): string | null {
  if (!fields.name) return "Item name is required.";

  if (!fields.price) return "Price is required.";

  const price = Number(fields.price);

  if (Number.isNaN(price) || price < 0) {
    return "Price must be a valid number greater than or equal to 0.";
  }

  return null;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);
}
