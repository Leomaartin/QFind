"use client";

import { useEffect, useMemo, useState } from "react";
import "./viewServices.css";
import Cards from "@/components/EditCards";
import Filters from "@/components/Filters";
import { type ServiceCardItem } from "@/lib/services/businesses";

export default function ViewServiceContent() {

  const [allServices, setAllServices] = useState<ServiceCardItem[]>([]);
  const [filters, setFilters] = useState({
    countryId: "",
    stateId: "",
    cityId: "",
    categoryId: "",
    subcategoryId: "",
  });
  const [isDark, setIsDark] = useState(true);
  const [userService, setUserService] = useState<any>(null);



  const handleToggle = () => {
    setIsDark((prevIsDark) => !prevIsDark);
  };
  useEffect(() => {
    if (!isDark) {
      document.body.classList.add("LigthVersion");
    } else {
      document.body.classList.remove("LigthVersion");
    }
  }, [isDark]);



  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch("/api/crud");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((s: any) => ({
            slug: String(s.id),
            name: s.name,
            address: s.description || "",
            phone: s.phone || "",
            instagram: s.instagram || "",
            image: s.image || "",
            label: s.label || "",
            active: s.active,
            citySlug: String(s.cityId || ""),
            cityName: "",
            categorySlug: String(s.categoryId || ""),
            subcategorySlug: String(s.subcategoryId || ""),
            countryId: s.countryId ? String(s.countryId) : "",
            stateId: s.stateId ? String(s.stateId) : "",
            cityId: s.cityId ? String(s.cityId) : "",
            categoryId: s.categoryId ? String(s.categoryId) : "",
            subcategoryId: s.subcategoryId ? String(s.subcategoryId) : "",
          }));
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchService();
  }, []);


  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const res = await fetch("/api/services");
        console.log(res)
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((s: any) => ({
            slug: String(s.id),
            name: s.name,
            address: s.description || "",
            phone: s.phone || "",
            instagram: s.instagram || "",
            image: s.image || "",
            label: s.label || "",
            citySlug: String(s.cityId || ""),
            cityName: "",
            categorySlug: String(s.categoryId || ""),
            subcategorySlug: String(s.subcategoryId || ""),
            countryId: s.countryId ? String(s.countryId) : "",
            stateId: s.stateId ? String(s.stateId) : "",
            cityId: s.cityId ? String(s.cityId) : "",
            categoryId: s.categoryId ? String(s.categoryId) : "",
            subcategoryId: s.subcategoryId ? String(s.subcategoryId) : "",
            active: s.active,
            paid: s.paid
          }));
          setAllServices(mapped);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchAllServices();
  }, []);

  const isFullyFiltered = Boolean(
    filters.countryId &&
    filters.stateId &&
    filters.cityId &&
    filters.categoryId &&
    filters.subcategoryId,
  );

  const filteredServices = useMemo<ServiceCardItem[]>(() => {
    return allServices.filter((s) => {
      const matchCountry =
        !filters.countryId || s.countryId === filters.countryId;
      const matchState = !filters.stateId || s.stateId === filters.stateId;
      const matchCity = !filters.cityId || s.cityId === filters.cityId;
      const matchCategory =
        !filters.categoryId || s.categoryId === filters.categoryId;
      const matchSubcategory =
        !filters.subcategoryId || s.subcategoryId === filters.subcategoryId;

      return (
        matchCountry &&
        matchState &&
        matchCity &&
        matchCategory &&
        matchSubcategory
      );
    });
  }, [allServices, filters]);





  const fetchUserService = async (email: string) => {
    try {
      const response = await fetch(
        `/api/services?email=${encodeURIComponent(email)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setUserService(data);
      }
    } catch (error) {
      console.error("Error fetching user service:", error);
    }
  };

  return (
    <div className="container-service">
      <label className="theme-switch" aria-label="Cambiar tema">
        <input
          type="checkbox"
          checked={isDark}
          onChange={handleToggle}
        />
        <div className="switch-slider">
          <i className="fa-solid fa-sun icon-sun"></i>
          <i className="fa-solid fa-moon icon-moon"></i>
          <span className="switch-thumb"></span>
        </div>
      </label>

      <Filters onFiltersChange={setFilters} />
      {isFullyFiltered ? <Cards services={filteredServices} showTitle /> : null}
    </div>
  );
}
