import { apiFetch } from "./client";

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function listCategories(): Promise<CategoryDTO[]> {
  const result = await apiFetch<CategoryDTO[]>("/api/v1/categories", {
    next: { revalidate: 300 },
  });
  return result.data;
}
