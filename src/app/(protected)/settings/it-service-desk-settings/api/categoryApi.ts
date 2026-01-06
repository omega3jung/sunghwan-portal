// src/app/(protected)/settings/it-service-desk-settings/api/categoryApi.ts
import { Category } from "@/feature/it-service-desk/types";

export const itServiceDeskCategoryApi = {
  post: async (data: Category) => {
    const res = await fetch("/api/it-service-desk/category", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: Category) => {
    const res = await fetch("/api/it-service-desk/category", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  delete: async (data: Category) => {
    await fetch("/api/it-service-desk/category", {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return null;
  },
};
