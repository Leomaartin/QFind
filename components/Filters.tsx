import "./viewServices.css";
import { useEffect, useState, useRef } from "react";

type FilterOption = {
  label: string;
  value: string;
};

type FiltersProps = {
  onFiltersChange?: (filters: {
    countryId: string;
    stateId: string;
    cityId: string;
    categoryId: string;
    subcategoryId: string;
    cityName?: string;
  }) => void;
};

export default function Filters({ onFiltersChange }: FiltersProps) {
  const onFiltersChangeRef = useRef(onFiltersChange);
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  const [category, setCategory] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const [subcategory, setSubcategory] = useState<any[]>([]);
  const [subcategoryId, setSubcategoryId] = useState<string>("");

  const [country, setCountry] = useState<any[]>([]);
  const [countryId, setCountryId] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const filtersContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filtersContainerRef.current &&
        !filtersContainerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [state, setState] = useState<any[]>([]);
  const [stateId, setStateId] = useState<string>("");

  const [city, setCity] = useState<any[]>([]);
  const [cityId, setCityId] = useState<string>("");

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("/api/places");
        if (!res.ok) throw new Error("Error al traer países");
        const data = await res.json();
        setCountry(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (!countryId) {
        setState([]);
        setStateId("");
        setCity([]);
        setCityId("");
        return;
      }
      try {
        const res = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryId }),
        });
        const data = await res.json();
        setState(data);
        setStateId("");
        setCity([]);
        setCityId("");
      } catch (error) {
        console.error(error);
      }
    };
    fetchStates();
  }, [countryId]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!stateId) {
        setCity([]);
        setCityId("");
        return;
      }
      try {
        const res = await fetch("/api/city", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stateId }),
        });
        const data = await res.json();
        setCity(data);
        setCityId("");
      } catch (error) {
        console.error(error);
      }
    };
    fetchCities();
  }, [stateId]);

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

  useEffect(() => {
    if (onFiltersChangeRef.current) {
      const selectedCity = city.find((c) => String(c.id) === String(cityId));
      onFiltersChangeRef.current({
        countryId,
        stateId,
        cityId,
        categoryId,
        subcategoryId,
        cityName: selectedCity?.label || "",
      });
    }
  }, [countryId, stateId, cityId, categoryId, subcategoryId]);

  const hasActiveFilters = Boolean(
    countryId || stateId || cityId || categoryId || subcategoryId
  );

  const handleClearFilters = () => {
    setCountryId("");
    setStateId("");
    setCityId("");
    setCategoryId("");
    setSubcategoryId("");
    setState([]);
    setCity([]);
    setSubcategory([]);
    setOpenDropdown(null);
    if (onFiltersChangeRef.current) {
      onFiltersChangeRef.current({
        countryId: "",
        stateId: "",
        cityId: "",
        categoryId: "",
        subcategoryId: "",
        cityName: "",
      });
    }
  };

  const renderCustomDropdown = ({
    id,
    label,
    icon,
    value,
    placeholder,
    options,
    disabled = false,
    onSelect,
  }: {
    id: string;
    label: string;
    icon: string;
    value: string;
    placeholder: string;
    options: { id: string | number; label: string }[];
    disabled?: boolean;
    onSelect: (val: string) => void;
  }) => {
    const isOpen = openDropdown === id;
    const selectedItem = options.find((o) => String(o.id) === String(value));

    return (
      <div
        className={`filter-group custom-select-group ${
          disabled ? "is-disabled" : ""
        }`}
      >
        <label>
          <i className={`${icon} me-1 filter-icon-gray`}></i>
          {label}
        </label>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={`filter-select custom-select-trigger ${
            value ? "has-value" : ""
          } ${isOpen ? "is-open" : ""} ${disabled ? "disabled" : ""}`}
          onClick={() => {
            if (!disabled) {
              setOpenDropdown(isOpen ? null : id);
            }
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpenDropdown(isOpen ? null : id);
            } else if (e.key === "Escape") {
              setOpenDropdown(null);
            }
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          title={disabled ? "Complete preceding filters first" : undefined}
        >
          <span className="custom-select-label">
            {selectedItem?.label || placeholder}
          </span>
          <i
            className={`fa-solid fa-chevron-up custom-select-arrow ${
              isOpen ? "rotate-arrow" : ""
            }`}
          ></i>
        </div>

        {isOpen && !disabled && (
          <div
            className="custom-dropdown-menu custom-dropdown-up animate-dropdown-up"
            role="listbox"
          >
            <div
              className={`custom-dropdown-item ${
                !value ? "is-selected" : ""
              }`}
              onClick={() => {
                onSelect("");
                setOpenDropdown(null);
              }}
            >
              <span>{placeholder}</span>
              {!value && <i className="fa-solid fa-check ms-auto"></i>}
            </div>
            {options.map((opt) => {
              const isSelected = String(opt.id) === String(value);
              return (
                <div
                  key={opt.id}
                  className={`custom-dropdown-item ${
                    isSelected ? "is-selected" : ""
                  }`}
                  onClick={() => {
                    onSelect(String(opt.id));
                    setOpenDropdown(null);
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <i className="fa-solid fa-check ms-auto"></i>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="filters-section">
      <div className="filters-container" ref={filtersContainerRef}>
        {/* Country */}
        {renderCustomDropdown({
          id: "country",
          label: "Country",
          icon: "fa-solid fa-earth-americas",
          value: countryId,
          placeholder: "Select country",
          options: country,
          onSelect: (val) => setCountryId(val),
        })}

        {/* State / Province */}
        {renderCustomDropdown({
          id: "state",
          label: "State / Province",
          icon: "fa-solid fa-map-location-dot",
          value: stateId,
          placeholder: "Select state / province",
          options: state,
          disabled: !countryId,
          onSelect: (val) => setStateId(val),
        })}

        {/* City */}
        {renderCustomDropdown({
          id: "city",
          label: "City",
          icon: "fa-solid fa-city",
          value: cityId,
          placeholder: "Select city",
          options: city,
          disabled: !stateId,
          onSelect: (val) => setCityId(val),
        })}

        {/* Category */}
        {renderCustomDropdown({
          id: "category",
          label: "Category",
          icon: "fa-solid fa-layer-group",
          value: categoryId,
          placeholder: "Select category",
          options: category,
          onSelect: (val) => setCategoryId(val),
        })}

        {/* Subcategory */}
        {renderCustomDropdown({
          id: "subcategory",
          label: "Subcategory",
          icon: "fa-solid fa-tags",
          value: subcategoryId,
          placeholder: "Select subcategory",
          options: subcategory,
          disabled: !categoryId,
          onSelect: (val) => setSubcategoryId(val),
        })}

        <div className="filter-group filter-group-actions">
          <label className="filter-actions-label">Actions</label>
          <button
            type="button"
            className="btn-clear-filters"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            title="Reset all filters"
          >
            <i className="fa-solid fa-rotate-left me-1"></i>
            Clear filters
          </button>
        </div>
      </div>
    </section>
  );
}
