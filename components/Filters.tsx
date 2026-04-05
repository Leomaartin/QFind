import "./viewServices.css";

type FilterOption = {
  label: string;
  value: string;
};

type FiltersProps = {
  categoryId: string;
  categoryOptions: FilterOption[];
  cityOptions: FilterOption[];
  citySlug: string;
  onCategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  subcategoryId: string;
  subcategoryOptions: FilterOption[];
};

export default function Filters({
  categoryId,
  categoryOptions,
  cityOptions,
  citySlug,
  onCategoryChange,
  onCityChange,
  onSubcategoryChange,
  subcategoryId,
  subcategoryOptions,
}: FiltersProps) {
  return (
    <section className="filters-section">
      <div className="filters-container">
        <div className="filter-group">
          <label>Ciudad</label>
          <select
            className="filter-select"
            value={citySlug}
            onChange={(event) => onCityChange(event.target.value)}
          >
            <option value="">Selecciona una ciudad</option>
            {cityOptions.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Categoria</label>
          <select
            className="filter-select"
            value={categoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">Selecciona una categoria</option>
            {categoryOptions.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Subcategoria</label>
          <select
            className="filter-select"
            value={subcategoryId}
            onChange={(event) => onSubcategoryChange(event.target.value)}
            disabled={!categoryId}
          >
            <option value="">Selecciona una subcategoria</option>
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
