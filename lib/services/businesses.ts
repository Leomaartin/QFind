import { businessSeeds } from "@/data/businesses";
import { mvpCategories, mvpCities } from "@/data/mvpCatalog";

export type ServiceCardItem = {
  id?: number;
  slug: string | number;
  name: string;
  address: string;
  phone: string;
  instagram: string;
  image: string;
  citySlug: string;
  cityName: string;
  categorySlug: string;
  subcategorySlug: string;
  label?: string;
  categoryName?: string;
  countryId?: string;
  stateId?: string;
  cityId?: string;
  categoryId?: string;
  subcategoryId?: string;
  active?: boolean;
  paid?: boolean;
  plans?: any[];
};

export function getServices(): ServiceCardItem[] {
  return businessSeeds.map((business) => {
    const city = mvpCities.find((item) => item.slug === business.citySlug);
    const category = mvpCategories.find(
      (item) => item.slug === business.categorySlug
    );
    const subcategory = category?.subcategories.find(
      (item) => item.slug === business.subcategorySlug
    );

    return {
      slug: business.slug,
      name: business.name,
      address: business.addressLine1,
      phone: business.phone || business.whatsappNumber || "",
      contact: business.whatsappNumber ?? business.phone,
      instagram: business.instagramHandle
        ? `@${business.instagramHandle}`
        : "@qfind",
      image:
        business.coverImageUrl ??
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
      citySlug: business.citySlug,
      cityName: city?.name ?? business.citySlug,
      categorySlug: category?.slug ?? business.categorySlug,
      subcategorySlug: subcategory?.slug ?? business.subcategorySlug,
    };
  });
}

export function filterServices(
  services: ServiceCardItem[],
  filters: {
    citySlug: string;
    categorySlug: string;
    subcategorySlug: string;
  }
): ServiceCardItem[] {
  return services.filter((service) => {
    const matchesCity = !filters.citySlug || service.citySlug === filters.citySlug;
    const matchesCategory =
      !filters.categorySlug || service.categorySlug === filters.categorySlug;
    const matchesSubcategory =
      !filters.subcategorySlug ||
      service.subcategorySlug === filters.subcategorySlug;

    return matchesCity && matchesCategory && matchesSubcategory;
  });
}
