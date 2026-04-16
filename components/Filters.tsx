import "./viewServices.css";
import { useEffect, useState } from "react";

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
  }) => void;
};

export default function Filters({ onFiltersChange }: FiltersProps) {
  const [category, setCategory] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const [subcategory, setSubcategory] = useState<any[]>([]);
  const [subcategoryId, setSubcategoryId] = useState<string>("");

  const [country, setCountry] = useState<any[]>([]);
  const [countryId, setCountryId] = useState<string>("");

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
    if (onFiltersChange) {
      onFiltersChange({ countryId, stateId, cityId, categoryId, subcategoryId });
    }
  }, [countryId, stateId, cityId, categoryId, subcategoryId, onFiltersChange]);

  return (
    <section className="filters-section">
      <div className="filters-container">
        <div className="filter-group">
          <label>País</label>
          <select
            className="filter-select"
            value={countryId}
            onChange={(event) => {
              setCountryId(event.target.value);
            }}
          >
            <option value="">Selecciona un país</option>
            {country.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Provincia</label>
          <select
            className="filter-select"
            value={stateId}
            onChange={(event) => {
              setStateId(event.target.value);
            }}
            disabled={!countryId}
          >
            <option value="">Selecciona una provincia</option>
            {state.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Ciudad</label>
          <select
            className="filter-select"
            value={cityId}
            onChange={(event) => {
              const selectedCityId = event.target.value;
              setCityId(selectedCityId);
            }}
            disabled={!stateId}
          >
            <option value="">Selecciona una ciudad</option>
            {city.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
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
