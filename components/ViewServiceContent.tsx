"use client";

import { useEffect, useMemo, useState } from "react";
import "./viewServices.css";
import Banner from "@/components/Banner";
import Cards from "@/components/Cards";
import Filters from "@/components/Filters";
import AddServicePopup from "@/components/Popup";
import Login from "@/components/Login";

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
    left.label.localeCompare(right.label),
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
      })),
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
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Cities request failed");
        }

        const data = (await response.json()) as CitiesResponse;
        const suggestions = data.suggestions?.length
          ? sortOptions(data.suggestions)
          : localCityOptions.filter((city) =>
              slugify(city.label).includes(slugify(cityQuery)),
            );

        setCityOptions(suggestions);
      } catch {
        setCityOptions(
          localCityOptions.filter((city) =>
            slugify(city.label).includes(slugify(cityQuery)),
          ),
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
        })),
      ),
    [categories],
  );

  const subcategoryOptions = useMemo(() => {
    const selectedCategory = categories.find(
      (category) => category.id === categoryId,
    );

    if (!selectedCategory) {
      return [];
    }

    return sortOptions(
      selectedCategory.subcategories.map((subcategory) => ({
        label: subcategory.name,
        value: subcategory.id,
      })),
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

  const [isPopupOpen, setIsPopupOpen] = useState(false);


  const stateOptions = useMemo(() => {
    const states = new Set<string>();
    allServices.forEach((s) => {
   
    });

    return [
      { label: "Buenos Aires", value: 1 },
      { label: "Córdoba", value: 2 },
      { label: "Santa Fe", value: 3 },
    ];
  }, [allServices]);

  const countryOptions = useMemo(() => {
    return [{ label: "Argentina", value: 1 }];
  }, []);


  const popupCityOptions = useMemo(() => {
    return cityOptions.map((opt, index) => ({
      label: opt.label,
      value: index + 1, 
    }));
  }, [cityOptions]);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userService, setUserService] = useState<any>(null);

  const fetchUserService = async (email: string) => {
    try {
      const response = await fetch(`/api/services?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setUserService(data);
      }
    } catch (error) {
      console.error("Error fetching user service:", error);
    }
  };

  useEffect(() => {
    if (currentUser?.email) {
      fetchUserService(currentUser.email);
    } else {
      setUserService(null);
    }
  }, [currentUser]);

  return (
    <div className="container-service">
      <Banner />
      <Login onUserChange={(user) => setCurrentUser(user)} />
      {currentUser && (
        <div className="add-service-trigger-container">

          <button
            className="add-service-trigger-btn"
            onClick={() => setIsPopupOpen(true)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {userService ? (
                // Icono de editar
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              ) : (
                // Icono de más
                <>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </>
              )}
            </svg>
            {userService ? "Editar Servicio" : "Agregar Servicio"}
          </button>
        </div>
      )}
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

      {isPopupOpen && (
        <AddServicePopup
          onClose={() => setIsPopupOpen(false)}
          categories={categories}
          cityOptions={popupCityOptions}
          stateOptions={stateOptions}
          countryOptions={countryOptions}
          user={currentUser}
          initialData={userService} // Pasar los datos del servicio para editar
        />
      )}
    </div>
  );
}
