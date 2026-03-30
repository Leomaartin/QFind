import { catalogData } from "@/data/catalog";

export type City = {
  id: string;
  name: string;
  slug: string;
};

export type Subcategory = {
  id: string;
  name: string;
  slug: string;
  cities: City[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
};

export function getCategories(): Category[] {
  return catalogData.categories;
}

export function getSubcategoriesByCategory(categoryId: string): Subcategory[] {
  const category = catalogData.categories.find((item) => item.id === categoryId);
  return category?.subcategories ?? [];
}

export function getCitiesByCategoryAndSubcategory(
  categoryId: string,
  subcategoryId: string
): City[] {
  const category = catalogData.categories.find((item) => item.id === categoryId);
  const subcategory = category?.subcategories.find(
    (item) => item.id === subcategoryId
  );

  return subcategory?.cities ?? [];
}