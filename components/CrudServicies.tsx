"use client";

import { useEffect, useMemo, useState } from "react";
import "./viewServices.css";
import Cards from "@/components/EditCards";
import Filters from "@/components/Filters";
import Popup from "@/components/Popup";
import { type ServiceCardItem } from "@/lib/services/businesses";
import { getApiUrl } from "@/lib/config";

export default function CrudServices() {
  const [allServices, setAllServices] = useState<ServiceCardItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filters, setFilters] = useState({
    countryId: "",
    stateId: "",
    cityId: "",
    categoryId: "",
    subcategoryId: "",
  });
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail?.isLight !== undefined) {
        setIsDark(!e.detail.isLight);
      } else {
        setIsDark(!document.body.classList.contains("LigthVersion"));
      }
    };
    setIsDark(!document.body.classList.contains("LigthVersion"));
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const fetchAllServices = async () => {
    try {
      const res = await fetch(getApiUrl("/api/services"));
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((s: any) => ({
          id: s.id,
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
          active: Boolean(s.active),
          paid: Boolean(s.paid),
          plans: s.plans || [],
        }));
        setAllServices(mapped);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchAllServices();
  }, []);

  const filteredServices = useMemo<ServiceCardItem[]>(() => {
    return allServices.filter((s) => {
      const matchCountry =
        !filters.countryId || s.countryId === filters.countryId;
      const matchState =
        !filters.stateId || s.stateId === filters.stateId;
      const matchCity =
        !filters.cityId || s.cityId === filters.cityId;
      const matchCategory =
        !filters.categoryId || s.categoryId === filters.categoryId;
      const matchSubcategory =
        !filters.subcategoryId || s.subcategoryId === filters.subcategoryId;

      const q = searchQuery.toLowerCase().trim();
      const matchName =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.label && s.label.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q));

        return (
          matchCountry &&
          matchState &&
          matchCity &&
          matchCategory &&
          matchSubcategory &&
          matchName
        );
      });
  }, [allServices, filters, searchQuery]);

  // Statistics counters
  const totalCount = allServices.length;
  const activeCount = allServices.filter((s) => s.active).length;
  const pendingCount = allServices.filter((s) => !s.active).length; // Pendientes de revisión en Approve Panel
  const paidCount = allServices.filter((s) => s.paid).length;

  return (
    <div className="container-service">
      {/* CRUD Header & Action Bar */}
      <div className="crud-header-panel">
        <div className="crud-header-info">
          <h1 className="crud-main-title">
            <i className="fa-solid fa-sliders me-2"></i>
            Service Management
          </h1>
          <p className="crud-subtitle">
            Create new services, manage visibility, and oversee payment plans.
          </p>

          <div className="crud-stats-bar">
            <span className="crud-stat-badge">
              Total: <strong>{totalCount}</strong>
            </span>
            <span className="crud-stat-badge stat-active">
              <i className="fa-solid fa-circle-check me-1"></i>
              Approved / Visible: <strong>{activeCount}</strong>
            </span>
            <a
              href="/admin"
              className="crud-stat-badge stat-unpaid"
              style={{ textDecoration: "none", cursor: "pointer" }}
              title="Go to Approval Panel to check pending services"
            >
              <i className="fa-solid fa-shield-halved me-1"></i>
              Pending Review: <strong>{pendingCount}</strong>
            </a>
            <span className="crud-stat-badge stat-paid">
              <i className="fa-solid fa-receipt me-1"></i>
              Paid: <strong>{paidCount}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn-create-service"
          onClick={() => setIsCreateOpen(true)}
        >
          <i className="fa-solid fa-plus-circle"></i>
          <span>Create Service</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="search-bar-wrapper">
        <div className="search-input-container">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="Search by name, title or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              type="button"
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      <Filters onFiltersChange={setFilters} />

      <Cards
        services={filteredServices}
        showTitle
        onServiceUpdated={fetchAllServices}
      />

      {isCreateOpen && (
        <Popup
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            fetchAllServices();
          }}
          isAdmin={true}
        />
      )}
    </div>
  );
}