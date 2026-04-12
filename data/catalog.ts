import { mvpCategories, mvpCities } from "./mvpCatalog";

export const catalogData = {
  categories: mvpCategories.map((category) => ({
    id: category.slug,
    name: category.name,
    slug: category.slug,
    subcategories: category.subcategories.map((subcategory) => ({
      id: subcategory.slug,
      name: subcategory.name,
      slug: subcategory.slug,
      cities: mvpCities.map((city) => ({
        id: city.slug,
        name: city.name,
        slug: city.slug,
      })),
    })),
  })),
};
