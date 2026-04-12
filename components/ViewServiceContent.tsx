"use client";

import { useEffect, useMemo, useState } from "react";
import Banner from "@/components/Banner";
import Cards from "@/components/Cards";
import Filters from "@/components/Filters";
import {
  filterServices,
  getServices,
  type ServiceCardItem,
} from "@/lib/services/businesses";
import { getCategories } from "@/lib/services/catalog";
import { slugify } from "@/lib/utils/text";

type FilterOption = {
  label: string;
  value: string;
};

type CityOption = FilterOption & {
  placeId?: string;
  source?: "google" | "fallback";
};

type CitiesResponse = {
  suggestions?: CityOption[];
};

function sortOptions<T extends FilterOption>(options: T[]) {
  return [...options].sort((left, right) =>
    left.label.localeCompare(right.label)
  );
}

export default function ViewServiceContent() {
  const [cityQuery, setCityQuery] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);

  const categories = useMemo(() => getCategories(), []);
  const allServices = useMemo(() => getServices(), []);

  const localCityOptions = useMemo(() => {
    const cities = new Map<string, string>();

    categories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        subcategory.cities.forEach((city) => {
          if (!cities.has(city.slug)) {
            cities.set(city.slug, city.name);
          }
        });
      });
    });

    return sortOptions(
      Array.from(cities.entries(), ([value, label]) => ({
        label,
        value,
        source: "fallback" as const,
      }))
    );
  }, [categories]);

  useEffect(() => {
    setCityOptions(localCityOptions);
  }, [localCityOptions]);

  useEffect(() => {
    const normalizedValue = slugify(cityQuery);

    if (!normalizedValue) {
      setCitySlug("");
      return;
    }

    const selectedCity = cityOptions.find((option) => {
      return (
        option.value === normalizedValue ||
        slugify(option.label) === normalizedValue
      );
    });

    setCitySlug(selectedCity?.value ?? "");
  }, [cityOptions, cityQuery]);

  useEffect(() => {
    if (!cityQuery.trim()) {
      setCityOptions(localCityOptions);
      setIsCitiesLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsCitiesLoading(true);

      try {
        const response = await fetch(
          `/api/maps/cities?input=${encodeURIComponent(cityQuery)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Cities request failed");
        }

        const data = (await response.json()) as CitiesResponse;
        const suggestions = data.suggestions?.length
          ? sortOptions(data.suggestions)
          : localCityOptions.filter((city) =>
              slugify(city.label).includes(slugify(cityQuery))
            );

        setCityOptions(suggestions);
      } catch {
        setCityOptions(
          localCityOptions.filter((city) =>
            slugify(city.label).includes(slugify(cityQuery))
          )
        );
      } finally {
        setIsCitiesLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [cityQuery, localCityOptions]);

  const categoryOptions = useMemo(
    () =>
      sortOptions(
        categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))
      ),
    [categories]
  );

  const subcategoryOptions = useMemo(() => {
    const selectedCategory = categories.find(
      (category) => category.id === categoryId
    );

    if (!selectedCategory) {
      return [];
    }

    return sortOptions(
      selectedCategory.subcategories.map((subcategory) => ({
        label: subcategory.name,
        value: subcategory.id,
      }))
    );
  }, [categories, categoryId]);

  const filteredServices = useMemo<ServiceCardItem[]>(() => {
    return filterServices(allServices, {
      citySlug,
      categorySlug: categoryId,
      subcategorySlug: subcategoryId,
    });
  }, [allServices, categoryId, citySlug, subcategoryId]);

  const isFullyFiltered = Boolean(citySlug && categoryId && subcategoryId);

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubcategoryId("");
  };

  return (
    <div className="container-service">
      <Banner />
      <Filters
        categoryId={categoryId}
        categoryOptions={categoryOptions}
        cityLoading={isCitiesLoading}
        cityOptions={cityOptions}
        cityQuery={cityQuery}
        onCategoryChange={handleCategoryChange}
        onCityQueryChange={setCityQuery}
        onSubcategoryChange={setSubcategoryId}
        subcategoryId={subcategoryId}
        subcategoryOptions={subcategoryOptions}
      />
      {isFullyFiltered ? <Cards services={filteredServices} showTitle /> : null}
    </div>
  );
}
