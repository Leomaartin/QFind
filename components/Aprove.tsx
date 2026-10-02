"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import "./viewServices.css";
import toast from "react-hot-toast";

interface Service {
  id: string;
  name: string;
  label: string;
  description: string;
  phone: string;
  instagram: string;
  email: string;
  image: string;
  active: boolean;
  validated: boolean;
  paid: boolean;
}

export default function Approve() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }

      const data: Service[] = await response.json();
      // Show only services pending approval (active === false)
      const filtered = data.filter((service) => !service.active);
      setServices(filtered);
      if (isManual) {
        toast.success("Listing queue updated!");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services queue.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleChange = (
    serviceId: string,
    field: "active" | "paid",
    value: boolean
  ) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId ? { ...service, [field]: value } : service
      )
    );
  };

  const handleConfirm = async (service: Service, overrides?: Partial<Service>) => {
    const targetService = { ...service, ...overrides };
    setUpdatingId(targetService.id);
    const loadingToast = toast.loading("Saving changes...");

    try {
      const response = await fetch("/api/services", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: targetService.id,
          active: targetService.active,
          paid: targetService.paid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedService: Service = await response.json();

      // If service is now approved (active === true), remove from the pending queue
      if (updatedService.active) {
        setServices((prev) => prev.filter((s) => s.id !== updatedService.id));
        toast.success(`"${service.name}" approved & published!`, {
          id: loadingToast,
        });
      } else {
        setServices((prev) =>
          prev.map((s) => (s.id === updatedService.id ? updatedService : s))
        );
        toast.success("Service status updated successfully.", {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Please try again.", {
        id: loadingToast,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickApprove = (service: Service) => {
    handleConfirm(service, { active: true, paid: true });
  };

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase().trim();
    return services.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.label?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  if (loading) {
    return (
      <section className="aprove-page-container">
        <div className="aprove-loading-box">
          <div className="aprove-spinner" />
          <p className="aprove-loading-text">Loading approval queue...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="aprove-page-container">
      {/* Hero / Header Section */}
      <div className="aprove-header">
        <div className="aprove-header-left">
          <div className="aprove-badge">
            <i className="fa-solid fa-shield-halved me-1"></i>
            ADMINISTRATIVE REVIEW
          </div>
          <h1 className="aprove-title">Approval Panel</h1>
          <p className="aprove-subtitle">
            Review incoming business listings, verify subscription details, and authorize services to go live on the public directory.
          </p>
        </div>

        <div className="aprove-header-actions">
          <button
            type="button"
            className="aprove-refresh-btn"
            onClick={() => fetchServices(true)}
            disabled={isRefreshing}
            title="Refresh listing queue"
          >
            <i className={`fa-solid fa-arrows-rotate ${isRefreshing ? "fa-spin" : ""}`}></i>
            <span>Refresh</span>
          </button>

          <Link href="/crud" className="aprove-nav-link">
            <i className="fa-solid fa-list-check me-2"></i>
            All Services (CRUD)
          </Link>
        </div>
      </div>

      {/* Metrics & Filter Bar */}
      <div className="aprove-toolbar">
        <div className="aprove-stats-group">
          <div className="aprove-stat-chip">
            <span className="aprove-stat-dot" />
            <span className="aprove-stat-num">{services.length}</span>
            <span className="aprove-stat-label">Pending Approval</span>
          </div>
          {searchQuery && (
            <div className="aprove-stat-chip chip-secondary">
              <span className="aprove-stat-num">{filteredServices.length}</span>
              <span className="aprove-stat-label">Matching Search</span>
            </div>
          )}
        </div>

        {services.length > 0 && (
          <div className="aprove-search-wrap">
            <i className="fa-solid fa-magnifying-glass aprove-search-icon"></i>
            <input
              type="text"
              className="aprove-search-input"
              placeholder="Search by business name, category, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="aprove-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Services Grid or Empty State */}
      {filteredServices.length > 0 ? (
        <div className="aprove-grid">
          {filteredServices.map((service) => {
            const isUpdating = updatingId === service.id;

            return (
              <div
                key={service.id}
                className={`aprove-card ${isUpdating ? "is-updating" : ""}`}
              >
                {/* Media Header */}
                <div className="aprove-card-media">
                  <div
                    className="aprove-card-img"
                    style={{
                      backgroundImage: `url("${service.image || "/placeholder.jpg"}")`,
                    }}
                  />
                  <div className="aprove-card-overlay" />

                  {/* Badges on top of image */}
                  <div className="aprove-card-floating-badges">
                    {service.label && (
                      <span className="aprove-category-tag">
                        <i className="fa-solid fa-tag me-1"></i>
                        {service.label}
                      </span>
                    )}

                    <span
                      className={`aprove-status-pill ${
                        service.active ? "pill-active" : "pill-pending"
                      }`}
                    >
                      {service.active ? "Ready to Publish" : "Pending Review"}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="aprove-card-body">
                  <div className="aprove-card-main-info">
                    <h3 className="aprove-card-title" title={service.name}>
                      {service.name}
                    </h3>

                    {service.description && (
                      <p className="aprove-card-desc" title={service.description}>
                        {service.description}
                      </p>
                    )}
                  </div>

                  {/* Contact details */}
                  <div className="aprove-contact-list">
                    {service.phone && (
                      <a
                        href={`tel:${service.phone}`}
                        className="aprove-contact-item"
                        title={`Phone: ${service.phone}`}
                      >
                        <i className="fa-solid fa-phone"></i>
                        <span>{service.phone}</span>
                      </a>
                    )}

                    {service.email && (
                      <a
                        href={`mailto:${service.email}`}
                        className="aprove-contact-item"
                        title={`Email: ${service.email}`}
                      >
                        <i className="fa-solid fa-envelope"></i>
                        <span>{service.email}</span>
                      </a>
                    )}

                    {service.instagram && (
                      <a
                        href={`https://instagram.com/${service.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="aprove-contact-item"
                        title={`Instagram: ${service.instagram}`}
                      >
                        <i className="fa-brands fa-instagram"></i>
                        <span>{service.instagram}</span>
                      </a>
                    )}
                  </div>

                  {/* Controls Box: Status & Payment Switches */}
                  <div className="aprove-controls-panel">
                    <div className="aprove-switch-row">
                      <div className="aprove-switch-info">
                        <span className="aprove-switch-title">
                          <i className="fa-solid fa-globe me-2 text-primary"></i>
                          Live Directory Status
                        </span>
                        <span className="aprove-switch-hint">
                          {service.active ? "Visible to public" : "Hidden from search"}
                        </span>
                      </div>
                      <label className="aprove-toggle-switch">
                        <input
                          type="checkbox"
                          checked={service.active}
                          onChange={(e) =>
                            handleChange(service.id, "active", e.target.checked)
                          }
                        />
                        <span className="aprove-toggle-slider" />
                      </label>
                    </div>

                    <div className="aprove-switch-row">
                      <div className="aprove-switch-info">
                        <span className="aprove-switch-title">
                          <i className="fa-solid fa-credit-card me-2 text-success"></i>
                          Subscription Billing
                        </span>
                        <span className="aprove-switch-hint">
                          {service.paid ? "Plan Paid & Verified" : "Payment Pending"}
                        </span>
                      </div>
                      <label className="aprove-toggle-switch">
                        <input
                          type="checkbox"
                          checked={service.paid}
                          onChange={(e) =>
                            handleChange(service.id, "paid", e.target.checked)
                          }
                        />
                        <span className="aprove-toggle-slider slider-success" />
                      </label>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="aprove-card-actions">
                    <button
                      type="button"
                      className="aprove-btn aprove-btn-quick"
                      onClick={() => handleQuickApprove(service)}
                      disabled={isUpdating}
                      title="Set active & paid, then immediately publish"
                    >
                      <i className="fa-solid fa-bolt me-1"></i>
                      Quick Approve
                    </button>

                    <button
                      type="button"
                      className="aprove-btn aprove-btn-save"
                      onClick={() => handleConfirm(service)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <i className="fa-solid fa-circle-notch fa-spin me-2"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-check me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="aprove-empty-state">
          <div className="aprove-empty-icon-wrap">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h2 className="aprove-empty-title">All Caught Up!</h2>
          <p className="aprove-empty-desc">
            {searchQuery
              ? `No pending services match your search for "${searchQuery}".`
              : "There are currently no listings awaiting approval. All registered businesses are active and verified."}
          </p>
          <div className="aprove-empty-actions">
            {searchQuery ? (
              <button
                type="button"
                className="aprove-btn-outline"
                onClick={() => setSearchQuery("")}
              >
                Clear Search Filter
              </button>
            ) : (
              <>
                <Link href="/crud" className="aprove-btn-primary">
                  <i className="fa-solid fa-table-cells me-2"></i>
                  Manage All Services
                </Link>
                <Link href="/" className="aprove-btn-secondary">
                  <i className="fa-solid fa-house me-2"></i>
                  Back to Home
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
