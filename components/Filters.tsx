import "./viewServices.css";
import { useEffect, useState } from "react";

type FilterOption = {
  label: string;
  value: string;
};

type CityOption = FilterOption & {
  placeId?: string;
  source?: "google" | "fallback";
};

type FiltersProps = {
  cityLoading: boolean;
  cityOptions: CityOption[];
  cityQuery: string;
  onCityQueryChange: (value: string) => void;
};

export default function Filters({
  cityLoading,
  cityOptions,
  cityQuery,
  onCityQueryChange,
}: FiltersProps) {
  const [category, setCategory] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const [subcategory, setSubcategory] = useState<any[]>([]);
  const [subcategoryId, setSubcategoryId] = useState<string>("");

  useEffect(() => {
    const fetchSubcategory = async () => {
      if (!categoryId) return;

      const res = await fetch("/api/filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: categoryId }),
      });

      const subcategory = await res.json();
      setSubcategory(subcategory);
    };

    fetchSubcategory();
  }, [categoryId]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch("/api/filters");

        if (!res.ok) throw new Error("Error al traer categorías");

        const category = await res.json();
        console.log(category);

        setCategory(category);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategory();
  }, []);

  return (
    <section className="filters-section">
      <div className="filters-container">
        <div className="filter-group filter-group-city">
          <label htmlFor="city-search">City</label>
          <input
            id="city-search"
            className="filter-input"
            list="city-suggestions"
            placeholder="Search for a city"
            type="text"
            value={cityQuery}
            onChange={(event) => onCityQueryChange(event.target.value)}
          />
          <datalist id="city-suggestions">
            {cityOptions.map((city) => (
              <option
                key={`${city.value}-${city.placeId ?? city.source ?? "local"}`}
                value={city.label}
              />
            ))}
          </datalist>
          <span className="filter-help">
            {cityLoading
              ? "Searching cities..."
              : "City suggestions from Google Maps"}
          </span>
        </div>

        <div className="filter-group">
          <label>Category</label>
          <select
            className="filter-select"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
            }}
          >
            <option value="">Select a category</option>

            {category.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Subcategory</label>
          <select
            className="filter-select"
            value={subcategoryId}
            onChange={(event) => setSubcategoryId(event.target.value)}
            disabled={!categoryId}
          >
            <option value="">Select a subcategory</option>

            {subcategory.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
