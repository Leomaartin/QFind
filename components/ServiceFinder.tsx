"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCategories,
  getCitiesByCategoryAndSubcategory,
  getSubcategoriesByCategory,
} from "@/lib/services/catalog";

export default function ServiceFinder() {
  const router = useRouter();

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [citySlug, setCitySlug] = useState("");

  const categories = useMemo(() => getCategories(), []);
  const subcategories = useMemo(
    () => getSubcategoriesByCategory(categoryId),
    [categoryId]
  );
  const cities = useMemo(
    () => getCitiesByCategoryAndSubcategory(categoryId, subcategoryId),
    [categoryId, subcategoryId]
  );

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubcategoryId("");
    setCitySlug("");
  };

  const handleSubcategoryChange = (value: string) => {
    setSubcategoryId(value);
    setCitySlug("");
  };

  const handleCityChange = (value: string) => {
    setCitySlug(value);

    if (!categoryId || !subcategoryId || !value) return;

    router.push(
      `/results?category=${encodeURIComponent(
        categoryId
      )}&subcategory=${encodeURIComponent(
        subcategoryId
      )}&city=${encodeURIComponent(value)}`
    );
  };

  return (
    <div
      className="d-flex flex-column gap-3 align-items-center"
      style={{ width: "100%", maxWidth: "460px", margin: "0 auto" }}
    >
      <select
        className="form-select"
        value={categoryId}
        onChange={(e) => handleCategoryChange(e.target.value)}
        style={selectStyle}
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {categoryId && (
        <select
          className="form-select"
          value={subcategoryId}
          onChange={(e) => handleSubcategoryChange(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select a subcategory</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>
      )}

      {subcategoryId && (
        <select
          className="form-select"
          value={citySlug}
          onChange={(e) => handleCityChange(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select a city</option>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

const selectStyle = {
  padding: "14px",
  borderRadius: "14px",
  background: "#1D2526",
  color: "#fff",
  border: "none",
  outline: "2px solid rgba(253, 251, 251, 0.84)",
  outlineOffset: "4px",
};