"use client";

import { useMemo, useState } from "react";
import Banner from "@/components/Banner";
import Cards from "@/components/Cards";
import Filters from "@/components/Filters";
import { getCategories } from "@/lib/services/catalog";

type FilterOption = {
  label: string;
  value: string;
};

function sortOptions(options: FilterOption[]) {
  return [...options].sort((left, right) =>
    left.label.localeCompare(right.label)
  );
}

export default function ViewServiceContent() {
  const [citySlug, setCitySlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  const categories = useMemo(() => getCategories(), []);

  const cityOptions = useMemo(() => {
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
      Array.from(cities.entries(), ([value, label]) => ({ label, value }))
    );
  }, [categories]);

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
        cityOptions={cityOptions}
        citySlug={citySlug}
        onCategoryChange={handleCategoryChange}
        onCityChange={setCitySlug}
        onSubcategoryChange={setSubcategoryId}
        subcategoryId={subcategoryId}
        subcategoryOptions={subcategoryOptions}
      />
      {isFullyFiltered ? <Cards showTitle /> : null}
    </div>
  );
}
