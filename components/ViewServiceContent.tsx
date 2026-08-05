"use client";

import { useEffect, useMemo, useState } from "react";
import "./viewServices.css"; // 👈 Un único import con ambas versiones adentro
import Banner from "@/components/Banner";
import Cards from "@/components/Cards";
import Filters from "@/components/Filters";
import AddServicePopup from "@/components/Popup";
import PlanSelectorPopup from "@/components/PlanSelectorPopup";
import Login from "@/components/Login";

import { type ServiceCardItem } from "@/lib/services/businesses";

export default function ViewServiceContent() {
  const [allServices, setAllServices] = useState<ServiceCardItem[]>([]);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (!isDark) {
      document.body.classList.add("LigthVersion");
    } else {
      document.body.classList.remove("LigthVersion");
    }
  }, [isDark]);

  const [filters, setFilters] = useState({
    countryId: "",
    stateId: "",
    cityId: "",
    categoryId: "",
    subcategoryId: "",
  });

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const res = await fetch("/api/services");
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
    filters.subcategoryId
  );

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

      return (
        s.active &&
        matchCountry &&
        matchState &&
        matchCity &&
        matchCategory &&
        matchSubcategory
      );
    });
  }, [allServices, filters]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPlanPopupOpen, setIsPlanPopupOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userService, setUserService] = useState<any>(null);

  const handleToggle = () => {
    setIsDark((prevIsDark) => !prevIsDark);
  };

  const activePlan = useMemo(() => {
    if (!userService?.plans?.length) return null;
    return userService.plans.find((p: any) => new Date(p.endDate).getTime() > Date.now());
  }, [userService]);

  const daysRemaining = useMemo(() => {
    if (!activePlan) return 0;
    const end = new Date(activePlan.endDate).getTime();
    const now = Date.now();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }, [activePlan]);

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
      <Login onUserChange={(user) => setCurrentUser(user)} />

      <Banner />

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
      {currentUser && (
        <div
          className="add-service-trigger-container"
          style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
        >
          {userService && !activePlan && (
            <button
              className="add-service-trigger-btn"
              style={{ background: 'var(--accent)', color: 'white' }}
              onClick={() => setIsPlanPopupOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Choose a plan
            </button>
          )}
          {currentUser?.email === "leonelmartin9808@gmail.com" && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <a
                href="http://localhost:3000/admin"
                className="add-service-trigger-btn"
                style={{ textDecoration: 'none' }}
              >
                <i className="fa-solid fa-crown" ></i> Approve Services
              </a>

              <a
                href="http://localhost:3000/crud"
                className="add-service-trigger-btn"
                style={{ textDecoration: 'none' }}
              >
                <i className="fa-solid fa-crown" ></i> Manage Services
              </a>
            </div>
          )}

          {userService && activePlan && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(58, 81, 88, 0.2)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                border: '1px solid var(--accent)'
              }}
            >
              <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                Mi Plan: {activePlan.planType?.label || 'Activo'}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                ({daysRemaining} días restantes)
              </span>
            </div>
          )}

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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              ) : (
                <>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </>
              )}
            </svg>
            {userService ? "Edit Service" : "Add Service"}
          </button>
        </div>
      )}
      <Filters onFiltersChange={setFilters} />
      {isFullyFiltered ? <Cards services={filteredServices} showTitle /> : null}

      {isPopupOpen && (
        <AddServicePopup
          onClose={() => setIsPopupOpen(false)}
          categories={[]}
          cityOptions={[]}
          stateOptions={[]}
          countryOptions={[]}
          user={currentUser}
          initialData={userService}
        />
      )}

      {isPlanPopupOpen && userService && (
        <PlanSelectorPopup
          onClose={() => {
            setIsPlanPopupOpen(false);
            currentUser?.email && fetchUserService(currentUser.email);
          }}
          serviceId={userService.id}
        />
      )}
    </div>
  );
}