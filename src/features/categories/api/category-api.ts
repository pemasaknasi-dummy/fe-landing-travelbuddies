import { httpClient } from "@/lib/api/http-client";

export interface Category {
  id: number;
  name: string;
  slug: string
}

export const categoryApi = {
  getCategories: async () => {
    return httpClient.get<{ items: Category[] }>("/categories");
  },
};
