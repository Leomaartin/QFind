"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import "./viewServices.css";
import toast from "react-hot-toast";
import Banner from "@/components/Banner";
import Cards from "@/components/Cards";
import Filters from "@/components/Filters";
import AddServicePopup from "@/components/Popup";
import PlanSelectorPopup from "@/components/PlanSelectorPopup";
import ServicesMap from "@/components/ServicesMap";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { type ServiceCardItem } from "@/lib/services/businesses";
import { getApiUrl } from "@/lib/config";
import { checkIsAdmin } from "@/components/AdminGuard";

export default function ViewServiceContent() {
  const [allServices, setAllServices] = useState<ServiceCardItem[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");

  // Sync theme with Navbar
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

  const [filters, setFilters] = useState({
    countryId: "",
    stateId: "",
    cityId: "",
    categoryId: "",
    subcategoryId: "",
    cityName: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleFiltersChange = useCallback(
    (newFilters: {
      countryId: string;
      stateId: string;
      cityId: string;
      categoryId: string;
      subcategoryId: string;
      cityName?: string;
    }) => {
      setFilters((prev) => {
        const cityName = newFilters.cityName || "";
        const isSame =
          prev.countryId === newFilters.countryId &&
          prev.stateId === newFilters.stateId &&
          prev.cityId === newFilters.cityId &&
          prev.categoryId === newFilters.categoryId &&
          prev.subcategoryId === newFilters.subcategoryId &&
          prev.cityName === cityName;

        if (isSame) {
          return prev;
        }

        const hadAny = Boolean(
          prev.countryId ||
          prev.stateId ||
          prev.cityId ||
          prev.categoryId ||
          prev.subcategoryId
        );
        const hasAny = Boolean(
          newFilters.countryId ||
          newFilters.stateId ||
          newFilters.cityId ||
          newFilters.categoryId ||
          newFilters.subcategoryId
        );

        if (hasAny) {
          setIsSearching(true);
          setIsClearing(false);
        } else if (hadAny && !hasAny) {
          // Filters were reset/cleared!
          setIsSearching(false);
          setIsClearing(true);
        } else {
          setIsSearching(false);
          setIsClearing(false);
        }

        return {
          countryId: newFilters.countryId,
          stateId: newFilters.stateId,
          cityId: newFilters.cityId,
          categoryId: newFilters.categoryId,
          subcategoryId: newFilters.subcategoryId,
          cityName,
        };
      });
    },
    []
  );

  // Switch back to cards view if city filter is cleared
  useEffect(() => {
    if (!filters.cityId && viewMode === "map") {
      setViewMode("cards");
    }
  }, [filters.cityId, viewMode]);

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const res = await fetch(getApiUrl("/api/services"));
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

  const hasActiveFilters = Boolean(
    filters.countryId ||
    filters.stateId ||
    filters.cityId ||
    filters.categoryId ||
    filters.subcategoryId
  );

  const isFullyFiltered = Boolean(
    filters.countryId &&
    filters.stateId &&
    filters.cityId &&
    filters.categoryId &&
    filters.subcategoryId
  );

  const shouldShowResults = isFullyFiltered || Boolean(filters.cityId || filters.categoryId || filters.subcategoryId);

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

  const [nameSearch, setNameSearch] = useState("");

  const displayedServices = useMemo<ServiceCardItem[]>(() => {
    if (!nameSearch.trim()) return filteredServices;
    const q = nameSearch.toLowerCase().trim();
    return filteredServices.filter((s) =>
      s.name.toLowerCase().includes(q)
    );
  }, [filteredServices, nameSearch]);

  // Live search animation timer
  useEffect(() => {
    if (isSearching) {
      const timer = setTimeout(() => {
        setIsSearching(false);
        const resultsEl = document.getElementById("services-results");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [isSearching]);

  // Reset filters animation timer
  useEffect(() => {
    if (isClearing) {
      setNameSearch("");
      const timer = setTimeout(() => {
        setIsClearing(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isClearing]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPlanPopupOpen, setIsPlanPopupOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userService, setUserService] = useState<any>(null);

  const handleSubmitGoogle = async (googleUser: any): Promise<string | number | null> => {
    try {
      const response = await fetch(getApiUrl("/api/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          google_id: googleUser.email,
          nombre: googleUser.name,
          email: googleUser.email,
          foto: googleUser.picture,
        }),
      });

      const data = await response.json();
      return data.user?.id || null;
    } catch (error) {
      console.error("Backend login error:", error);
      return null;
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      if (!response.credential) return;

      const decoded = jwtDecode<any>(response.credential);

      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        id: undefined as string | number | undefined,
      };

      const id = await handleSubmitGoogle(userData);
      if (id) {
        userData.id = id;
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setCurrentUser(userData);

      window.dispatchEvent(
        new CustomEvent("user-auth-change", { detail: userData })
      );

      setIsAuthModalOpen(false);
      toast.success(`Welcome, ${userData.name}!`);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Failed to sign in with Google");
    }
  };

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    loadUser();

    const handleAuthChange = (event: any) => {
      if (event.detail !== undefined) {
        setCurrentUser(event.detail);
      } else {
        loadUser();
      }
    };

    window.addEventListener("user-auth-change", handleAuthChange);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("user-auth-change", handleAuthChange);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

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
      const response = await fetch(getApiUrl(`/api/services?email=${encodeURIComponent(email)}`));
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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Listen for open/toggle drawer events (e.g. from Navbar hamburger)
  useEffect(() => {
    const handleOpenDrawer = () => setIsMobileMenuOpen(true);
    const handleToggleDrawer = () => setIsMobileMenuOpen((prev) => !prev);
    const handleCloseDrawer = () => setIsMobileMenuOpen(false);

    window.addEventListener("open-mobile-drawer", handleOpenDrawer);
    window.addEventListener("toggle-mobile-drawer", handleToggleDrawer);
    window.addEventListener("close-mobile-drawer", handleCloseDrawer);

    return () => {
      window.removeEventListener("open-mobile-drawer", handleOpenDrawer);
      window.removeEventListener("toggle-mobile-drawer", handleToggleDrawer);
      window.removeEventListener("close-mobile-drawer", handleCloseDrawer);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    setUserService(null);
    setIsMobileMenuOpen(false);

    window.dispatchEvent(
      new CustomEvent("user-auth-change", { detail: null })
    );

    toast.success("Signed out successfully");
  };

  return (
    <div className="container-service">
      <Banner />

      {/* Desktop Action Buttons: Hidden on mobile (<= 768px) */}
      <div className="desktop-action-buttons-container">
        {/* Guest Notice: Clarify that to add a service you must sign in */}
        {!currentUser ? (
          <div className="guest-service-notice-card animate-reveal-results">
            <div className="guest-notice-icon-box">
              <i className="fa-solid fa-store"></i>
            </div>
            <div className="guest-notice-body">
              <h4 className="guest-notice-title">Offer a service or own a local business?</h4>
              <p className="guest-notice-desc">
                Sign in with Google to register, publish and manage your services on QFind.
              </p>
            </div>
            <div className="guest-notice-actions">
              <button
                type="button"
                className="guest-notice-btn"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <i className="fa-brands fa-google me-2"></i>
                Sign in to Register or Login
              </button>
            </div>
          </div>
        ) : null}

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
            {checkIsAdmin(currentUser?.email) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <a
                  href="/admin"
                  className="add-service-trigger-btn"
                  style={{ textDecoration: 'none' }}
                >
                  <i className="fa-solid fa-crown" ></i> Approve Services
                </a>

                <a
                  href="/crud"
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
                  My Plan: {activePlan.planType?.label || 'Active'}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  ({daysRemaining} {daysRemaining === 1 ? 'day left' : 'days left'})
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
      </div>

      {/* Mobile Drawer Trigger Bar: Shown only on mobile (<= 768px) below the photo */}
      <div className="mobile-drawer-trigger-bar">
        <button
          type="button"
          className="mobile-drawer-trigger-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open options menu"
        >
          <div className="mobile-drawer-trigger-left">
            <i className="fa-solid fa-bars-staggered"></i>
            <span>Options Menu</span>
          </div>
          {currentUser ? (
            <span className="mobile-drawer-trigger-badge">
              <i className="fa-solid fa-circle-check me-1"></i>
              {userService ? (activePlan ? "Active Plan" : "My Service") : "Connected"}
            </span>
          ) : (
            <span className="mobile-drawer-trigger-badge guest">
              <i className="fa-solid fa-user-plus me-1"></i>
              Sign in
            </span>
          )}
        </button>
      </div>

      {/* Mobile Left Drawer (Menu lateral desplegable izquierdo negro) */}
      <div
        className={`mobile-left-drawer-overlay ${isMobileMenuOpen ? "is-open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      >
        <div
          className={`mobile-left-drawer ${isMobileMenuOpen ? "is-open" : ""}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Options navigation menu"
        >
          {/* Drawer Header */}
          <div className="mobile-drawer-header">
            <div className="mobile-drawer-brand">
              <img
                src={isDark ? "/logo-white.png" : "/logo-dark.png"}
                alt="Q-Find"
                className="mobile-drawer-logo"
              />
              <span className="mobile-drawer-subtitle">Services</span>
            </div>
            <button
              type="button"
              className="mobile-drawer-close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* User / Guest Status */}
          <div className="mobile-drawer-user-section">
            {currentUser ? (
              <div className="mobile-drawer-profile-card">
                {currentUser.picture ? (
                  <img
                    src={currentUser.picture}
                    alt={currentUser.name}
                    className="mobile-drawer-user-img"
                  />
                ) : (
                  <div className="mobile-drawer-user-placeholder">
                    <i className="fa-solid fa-user"></i>
                  </div>
                )}
                <div className="mobile-drawer-user-details">
                  <span className="mobile-drawer-user-name">{currentUser.name}</span>
                  <span className="mobile-drawer-user-email">{currentUser.email}</span>
                </div>
              </div>
            ) : (
              <div className="mobile-drawer-guest-card">
                <div className="mobile-drawer-guest-badge">
                  <i className="fa-solid fa-store"></i>
                </div>
                <div>
                  <h5 className="mobile-drawer-guest-title">Offer a service or business?</h5>
                  <p className="mobile-drawer-guest-desc">
                    Sign in with Google to register, publish and manage your services on QFind.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Active Plan Card (if any) */}
          {currentUser && userService && activePlan && (
            <div className="mobile-drawer-plan-info">
              <div className="mobile-drawer-plan-icon">
                <i className="fa-solid fa-award"></i>
              </div>
              <div className="mobile-drawer-plan-text">
                <span className="mobile-drawer-plan-name">
                  My Plan: {activePlan.planType?.label || "Active"}
                </span>
                <span className="mobile-drawer-plan-expiry">
                  {daysRemaining} {daysRemaining === 1 ? "day left" : "days left"}
                </span>
              </div>
            </div>
          )}

          {/* Actions & Buttons */}
          <div className="mobile-drawer-content">
            <div className="mobile-drawer-group-title">
              <i className="fa-solid fa-bolt me-1"></i> Quick Actions
            </div>

            {!currentUser ? (
              <button
                type="button"
                className="mobile-drawer-action-btn mobile-btn-login"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
              >
                <i className="fa-brands fa-google"></i>
                <div className="mobile-btn-text">
                  <strong>Sign in with Google</strong>
                  <small>Register or manage your services</small>
                </div>
                <i className="fa-solid fa-chevron-right ms-auto"></i>
              </button>
            ) : (
              <>
                {/* Choose plan button */}
                {userService && !activePlan && (
                  <button
                    type="button"
                    className="mobile-drawer-action-btn mobile-btn-plan"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsPlanPopupOpen(true);
                    }}
                  >
                    <i className="fa-solid fa-credit-card"></i>
                    <div className="mobile-btn-text">
                      <strong>Choose a plan</strong>
                      <small>Activate and feature your service</small>
                    </div>
                    <i className="fa-solid fa-chevron-right ms-auto"></i>
                  </button>
                )}

                {/* Add / Edit Service Button */}
                <button
                  type="button"
                  className="mobile-drawer-action-btn mobile-btn-primary"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsPopupOpen(true);
                  }}
                >
                  {userService ? (
                    <>
                      <i className="fa-solid fa-pen-to-square"></i>
                      <div className="mobile-btn-text">
                        <strong>Edit Service</strong>
                        <small>Update your business listing</small>
                      </div>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-plus"></i>
                      <div className="mobile-btn-text">
                        <strong>Add Service</strong>
                        <small>Publish your service on QFind</small>
                      </div>
                    </>
                  )}
                  <i className="fa-solid fa-chevron-right ms-auto"></i>
                </button>

                {/* Admin options */}
                {checkIsAdmin(currentUser?.email) && (
                  <div className="mobile-drawer-admin-group">
                    <div className="mobile-drawer-group-title admin-title">
                      <i className="fa-solid fa-crown me-1"></i> Admin Panel
                    </div>
                    <a
                      href="/admin"
                      className="mobile-drawer-action-btn mobile-btn-admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className="fa-solid fa-circle-check"></i>
                      <div className="mobile-btn-text">
                        <strong>Approve Services</strong>
                        <small>Review pending submissions</small>
                      </div>
                      <i className="fa-solid fa-chevron-right ms-auto"></i>
                    </a>
                    <a
                      href="/crud"
                      className="mobile-drawer-action-btn mobile-btn-admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className="fa-solid fa-list-check"></i>
                      <div className="mobile-btn-text">
                        <strong>Manage Services</strong>
                        <small>Manage active business entries</small>
                      </div>
                      <i className="fa-solid fa-chevron-right ms-auto"></i>
                    </a>
                  </div>
                )}

                {/* Sign out button */}
                <button
                  type="button"
                  className="mobile-drawer-action-btn mobile-btn-logout"
                  onClick={handleLogout}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <div className="mobile-btn-text">
                    <strong>Sign out</strong>
                    <small>Sign out of your account</small>
                  </div>
                  <i className="fa-solid fa-chevron-right ms-auto"></i>
                </button>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="mobile-drawer-footer">
            <div className="mobile-drawer-footer-brand">
              <i className="fa-solid fa-magnifying-glass-location me-1 text-teal"></i>
              <span>Q-FIND • All services in one place</span>
            </div>
          </div>
        </div>
      </div>

      <Filters onFiltersChange={handleFiltersChange} />

      {/* Clearing Filters Animation with Brand Logo */}
      {isClearing ? (
        <div className="search-anim-panel animate-reveal-results">
          <div className="search-anim-card reset-mode">
            <div className="search-radar-halo halo-1" />
            <div className="search-radar-halo halo-2" />

            <div className="search-anim-logo-wrap reset-spin">
              <img
                src={isDark ? "/logo-white.png" : "/logo-dark.png"}
                alt="Resetting QFind"
                className="search-anim-logo-img"
              />
              <div className="search-scanner-beam" />
            </div>

            <div className="search-anim-details">
              <div className="search-anim-badge badge-reset">
                <i className="fa-solid fa-rotate-left me-1"></i>
                Resetting
              </div>
              <h3 className="search-anim-title">
                Clearing all filters...
              </h3>
              <p className="search-anim-subtitle">
                Restoring default catalog and resetting location filters
              </p>
            </div>

            <div className="search-progress-bar-track">
              <div className="search-progress-bar-fill reset-fill" />
            </div>
          </div>
        </div>
      ) : isSearching ? (
        <div className="search-anim-panel animate-reveal-results">
          <div className="search-anim-card search-map-mode">
            {/* Holographic Radar Halos */}
            <div className="search-radar-halo halo-1" />
            <div className="search-radar-halo halo-2" />
            <div className="search-radar-halo halo-3" />

            {/* Interactive Animated Map Stage */}
            <div className="search-map-stage">
              {/* Vector Blueprint Map with roads, buildings and river */}
              <svg className="search-map-svg" viewBox="0 0 500 240" preserveAspectRatio="none">
                <defs>
                  <pattern id="mapGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12" />
                  </pattern>
                  <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.75" />
                  </linearGradient>
                  <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#134e4a" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {/* Grid */}
                <rect width="100%" height="100%" fill="url(#mapGrid)" />

                {/* River contour */}
                <path d="M -20,160 Q 120,200 260,110 T 520,70" fill="none" stroke="url(#riverGrad)" strokeWidth="18" strokeLinecap="round" />

                {/* City Blocks / Buildings */}
                <rect x="50" y="30" width="45" height="35" rx="6" className="map-building b1" />
                <rect x="110" y="25" width="55" height="40" rx="6" className="map-building b2" />
                <rect x="70" y="80" width="60" height="30" rx="6" className="map-building b3" />
                <rect x="320" y="30" width="50" height="35" rx="6" className="map-building b4" />
                <rect x="385" y="45" width="65" height="40" rx="6" className="map-building b5" />
                <rect x="340" y="140" width="55" height="45" rx="6" className="map-building b6" />
                <rect x="410" y="150" width="50" height="35" rx="6" className="map-building b7" />
                <rect x="160" y="170" width="70" height="35" rx="6" className="map-building b8" />

                {/* Roads / Highways */}
                <path d="M 0,90 L 500,90" fill="none" stroke="url(#roadGrad)" strokeWidth="3" strokeDasharray="6,4" className="map-road-dash" />
                <path d="M 220,0 L 220,240" fill="none" stroke="url(#roadGrad)" strokeWidth="3" strokeDasharray="6,4" className="map-road-dash" />
                <path d="M 0,195 Q 180,180 300,195 T 500,130" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
                <path d="M 120,0 Q 150,120 380,240" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeDasharray="4,4" />
                <path d="M 330,0 L 330,100 Q 330,150 480,160" fill="none" stroke="rgba(45,212,191,0.35)" strokeWidth="2" />

                {/* Location Map Markers with Glowing Radar Ping */}
                <g className="map-pin-group pin-1">
                  <circle cx="130" cy="90" r="14" className="pin-pulse-ring" />
                  <circle cx="130" cy="90" r="5" className="pin-center-dot" />
                  <path d="M 130,76 C 126,76 123,79 123,83 C 123,88 130,96 130,96 C 130,96 137,88 137,83 C 137,79 134,76 130,76 Z" className="pin-marker" />
                </g>

                <g className="map-pin-group pin-2">
                  <circle cx="330" cy="70" r="14" className="pin-pulse-ring" />
                  <circle cx="330" cy="70" r="5" className="pin-center-dot" />
                  <path d="M 330,56 C 326,56 323,59 323,63 C 323,68 330,76 330,76 C 330,76 337,68 337,63 C 337,59 334,56 330,56 Z" className="pin-marker" />
                </g>

                <g className="map-pin-group pin-3">
                  <circle cx="220" cy="165" r="14" className="pin-pulse-ring" />
                  <circle cx="220" cy="165" r="5" className="pin-center-dot" />
                  <path d="M 220,151 C 216,151 213,154 213,158 C 213,163 220,171 220,171 C 220,171 227,163 227,158 C 227,154 224,151 220,151 Z" className="pin-marker" />
                </g>

                <g className="map-pin-group pin-4">
                  <circle cx="390" cy="140" r="14" className="pin-pulse-ring" />
                  <circle cx="390" cy="140" r="5" className="pin-center-dot" />
                  <path d="M 390,126 C 386,126 383,129 383,133 C 383,138 390,146 390,146 C 390,146 397,138 397,133 C 397,129 394,126 390,126 Z" className="pin-marker" />
                </g>
              </svg>

              {/* Central Map Scanning Spotlight & Radar Sweep */}
              <div className="map-radar-sweeper" />

              {/* Magical Logo Stage: Logo splits, 'Find' magically vanishes, magnifying glass flips & searches */}
              <div className="search-logo-transform-stage">
                {/* The 'Q' Magnifying Glass that turns around and sweeps the map */}
                <div className="search-magnifier-actor">
                  <img
                    src={isDark ? "/logo-icon-white.png" : "/logo-icon-dark.png"}
                    alt="Q-Search"
                    className="search-magnifier-icon"
                  />
                  {/* Spotlight Lens Light Cone */}
                  <div className="magnifier-lens-glow" />
                  <div className="magnifier-radar-ping" />
                </div>

                {/* The 'Find' word that magically dissolves */}
                <div className="search-logo-find-wrap">
                  <img
                    src={isDark ? "/logo-find-white.png" : "/logo-find-dark.png"}
                    alt="Find"
                    className="search-logo-find-img"
                  />
                  {/* Magical spark bursts */}
                  <span className="magic-sparkle sp-1">✨</span>
                  <span className="magic-sparkle sp-2">✦</span>
                  <span className="magic-sparkle sp-3">★</span>
                  <span className="magic-sparkle sp-4">✨</span>
                </div>
              </div>
            </div>

            {/* Live Search Status */}
            <div className="search-anim-details">
              <div className="search-anim-badge">
                <span className="search-live-dot" />
                Live Map Search
              </div>
              <h3 className="search-anim-title">
                {filters.cityName
                  ? `Exploring services in ${filters.cityName}...`
                  : "Scanning best services across the map..."}
              </h3>
              <p className="search-anim-subtitle">
                Pinpointing verified locations, business coverage, and active providers
              </p>
            </div>

            {/* Animated progress bar */}
            <div className="search-progress-bar-track">
              <div className="search-progress-bar-fill search-map-progress" />
            </div>
          </div>
        </div>
      ) : shouldShowResults ? (
        <div id="services-results" className="services-results-anchor animate-reveal-results">
          {filteredServices.length > 0 ? (
            <>
              <div className="results-feedback-banner">
                <div className="results-feedback-icon">
                  <i className="fa-solid fa-sparkles"></i>
                </div>
                <div className="results-feedback-info">
                  <h3 className="results-feedback-title">
                    <span className="results-title-desktop">Services Found!</span>
                    <span className="results-title-mobile">
                      <i className="fa-solid fa-sparkles me-1 text-teal"></i>
                      {filteredServices.length} {filteredServices.length === 1 ? "Service found" : "Services found"}
                    </span>
                  </h3>
                  <p className="results-feedback-desc">
                    Showing <strong>{filteredServices.length}</strong> {filteredServices.length === 1 ? "service available" : "services available"} matching your search criteria.
                  </p>
                </div>

                <div className="results-actions-group">
                  <span className="results-feedback-pill">
                    <i className="fa-solid fa-check me-1"></i>
                    {filteredServices.length} {filteredServices.length === 1 ? "result" : "results"}
                  </span>

                  {/* View on Map Button: Enabled only when at least City filter is reached */}
                  <button
                    type="button"
                    className={`btn-view-map ${viewMode === "map" ? "btn-view-map-active" : ""}`}
                    onClick={() => {
                      if (filters.cityId) {
                        setViewMode(viewMode === "map" ? "cards" : "map");
                      }
                    }}
                    disabled={!filters.cityId}
                    title={
                      filters.cityId
                        ? viewMode === "map"
                          ? "Switch to Cards View"
                          : "View all located service points on the interactive map"
                        : "Select at least a City filter to activate Map View"
                    }
                  >
                    <i className={`fa-solid ${viewMode === "map" ? "fa-border-all" : "fa-map-location-dot"} me-1`}></i>
                    {viewMode === "map" ? "View Cards" : "View on Map"}
                  </button>
                </div>
              </div>

              {/* Search By Name Input */}
              <div className="search-by-name-bar">
                <div className="search-by-name-input-wrap">
                  <i className="fa-solid fa-magnifying-glass search-by-name-icon"></i>
                  <input
                    type="text"
                    className="search-by-name-input"
                    placeholder="Search by name..."
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                  />
                  {nameSearch && (
                    <button
                      type="button"
                      className="search-by-name-clear-btn"
                      onClick={() => setNameSearch("")}
                      title="Clear name search"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>

                {nameSearch && (
                  <div className="search-by-name-meta">
                    <span>
                      Found <strong>{displayedServices.length}</strong> of {filteredServices.length}
                    </span>
                  </div>
                )}
              </div>

              {displayedServices.length > 0 ? (
                viewMode === "map" && filters.cityId ? (
                  <ServicesMap
                    services={displayedServices}
                    cityId={filters.cityId}
                  />
                ) : (
                  <Cards services={displayedServices} showTitle={false} />
                )
              ) : (
                <div className="services-empty-state">
                  <i className="fa-solid fa-magnifying-glass-location empty-results-icon mb-3"></i>
                  <h3>No services matching &ldquo;{nameSearch}&rdquo;</h3>
                  <p>Try checking the spelling or clear your search by name.</p>
                  <button
                    type="button"
                    className="btn-clear-search-name"
                    onClick={() => setNameSearch("")}
                  >
                    <i className="fa-solid fa-xmark me-2"></i>
                    Clear search by name
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="services-empty-state">
              <i className="fa-solid fa-magnifying-glass-location empty-results-icon mb-3"></i>
              <h3>No services found</h3>
              <p>There are no active services matching your selected filters.</p>
            </div>
          )}
        </div>
      ) : null}

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

      {/* Auth Modal: Sign in to Register or Login */}
      {isAuthModalOpen && (
        <div className="auth-modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="auth-modal-close"
              onClick={() => setIsAuthModalOpen(false)}
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <img
              src={isDark ? "/logo-white.png" : "/logo-dark.png"}
              alt="QFind Logo"
              className="auth-modal-logo"
            />

            <h3 className="auth-modal-title">Sign in to Register or Login</h3>
            <p className="auth-modal-desc">
              Connect your Google account to register your service, manage your business listings, and choose plans on QFind.
            </p>

            <div className="auth-modal-login-wrap">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Failed to sign in with Google")}
                theme={isDark ? "filled_black" : "outline"}
                shape="pill"
                size="large"
                text="signin_with"
              />
            </div>

            <div className="auth-modal-security">
              <i className="fa-solid fa-shield-halved"></i>
              <span>Secure authentication powered by Google</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}