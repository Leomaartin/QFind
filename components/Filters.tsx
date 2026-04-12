import "./viewServices.css";

type FilterOption = {
  label: string;
  value: string;
};

type CityOption = FilterOption & {
  placeId?: string;
  source?: "google" | "fallback";
};

type FiltersProps = {
  categoryId: string;
  categoryOptions: FilterOption[];
  cityLoading: boolean;
  cityOptions: CityOption[];
  cityQuery: string;
  onCategoryChange: (value: string) => void;
  onCityQueryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  subcategoryId: string;
  subcategoryOptions: FilterOption[];
};

export default function Filters({
  categoryId,
  categoryOptions,
  cityLoading,
  cityOptions,
  cityQuery,
  onCategoryChange,
  onCityQueryChange,
  onSubcategoryChange,
  subcategoryId,
  subcategoryOptions,
}: FiltersProps) {
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
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">Select a category</option>
            {categoryOptions.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Subcategory</label>
          <select
            className="filter-select"
            value={subcategoryId}
            onChange={(event) => onSubcategoryChange(event.target.value)}
            disabled={!categoryId}
          >
            <option value="">Select a subcategory</option>
            {subcategoryOptions.map((subcategory) => (
              <option key={subcategory.value} value={subcategory.value}>
                {subcategory.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
