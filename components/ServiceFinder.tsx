"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCategories,
  getCitiesByCategoryAndSubcategory,
  getSubcategoriesByCategory,
} from "@/lib/services/catalog";
import styles from "./ServiceFinder.module.css";

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
    <div className={styles.root}>
      <div className={styles.slot}>
        <select
          className={`form-select ${styles.select}`}
          value={categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">Selecciona una categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.slot}>
        <select
          className={`form-select ${styles.select} ${
            !categoryId ? styles.hidden : ""
          }`}
          value={subcategoryId}
          onChange={(e) => handleSubcategoryChange(e.target.value)}
          disabled={!categoryId}
        >
          <option value="">Selecciona una subcategoria</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.slot}>
        <select
          className={`form-select ${styles.select} ${
            !subcategoryId ? styles.hidden : ""
          }`}
          value={citySlug}
          onChange={(e) => handleCityChange(e.target.value)}
          disabled={!subcategoryId}
        >
          <option value="">Selecciona una ciudad</option>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
