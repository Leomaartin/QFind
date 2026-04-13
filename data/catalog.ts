import { mvpCategories, mvpCities } from "./mvpCatalog";

export const catalogData = {
  categories: mvpCategories.map((category, catIdx) => ({
    id: (catIdx + 1).toString(),
    name: category.name,
    slug: category.slug,
    subcategories: category.subcategories.map((subcategory, subIdx) => ({
      id: ((catIdx + 1) * 100 + (subIdx + 1)).toString(),
      name: subcategory.name,
      slug: subcategory.slug,
      cities: mvpCities.map((city, cityIdx) => ({
        id: (cityIdx + 1).toString(),
        name: city.name,
        slug: city.slug,
      })),
    })),
  })),
};
