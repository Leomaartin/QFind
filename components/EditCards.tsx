"use client";

import type { ServiceCardItem } from "@/lib/services/businesses";
import "./viewServices.css";
import { useEffect, useState, useRef } from "react";
import Popup from "@/components/Popup";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 20;

type CardsProps = {
  services: ServiceCardItem[];
  showTitle?: boolean;
  onServiceUpdated?: () => void;
};

export default function EditCards({
  services,
  showTitle = false,
  onServiceUpdated,
}: CardsProps) {
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [servicesList, setServicesList] = useState<ServiceCardItem[]>(services);
  const [planTypes, setPlanTypes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setServicesList(services);
    setCurrentPage(1);
  }, [services]);

  useEffect(() => {
    fetch("/api/plan-types")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPlanTypes(data);
      })
      .catch(console.error);
  }, []);

  const handleEdit = async (id: number) => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Error al obtener el servicio");
      }

      const service = await response.json();
      setSelectedService(service);
      setOpenPopup(true);
    } catch (error) {
      console.error(error);
      toast.error("Could not load service information");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const response = await fetch("/api/crud", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Error deleting service");
      }

      setServicesList((prev) =>
        prev.filter((service) => Number(service.id || service.slug) !== id)
      );

      toast.success("Service deleted successfully");
      onServiceUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting service");
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    const newActive = !currentActive;
    setServicesList((prev) =>
      prev.map((s) =>
        Number(s.id || s.slug) === id ? { ...s, active: newActive } : s
      )
    );

    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: newActive }),
      });

      if (!res.ok) throw new Error();
      toast.success(newActive ? "Service is now visible" : "Service is now hidden");
      onServiceUpdated?.();
    } catch {
      toast.error("Error updating visibility");
      setServicesList((prev) =>
        prev.map((s) =>
          Number(s.id || s.slug) === id ? { ...s, active: currentActive } : s
        )
      );
    }
  };

  const handleTogglePaid = async (id: number, currentPaid: boolean) => {
    const newPaid = !currentPaid;
    setServicesList((prev) =>
      prev.map((s) =>
        Number(s.id || s.slug) === id ? { ...s, paid: newPaid } : s
      )
    );

    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paid: newPaid }),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();

      setServicesList((prev) =>
        prev.map((s) =>
          Number(s.id || s.slug) === id
            ? { ...s, paid: newPaid, plans: updated.plans || s.plans }
            : s
        )
      );

      toast.success(newPaid ? "Marked as Paid" : "Marked as Unpaid");
      onServiceUpdated?.();
    } catch {
      toast.error("Error updating payment status");
      setServicesList((prev) =>
        prev.map((s) =>
          Number(s.id || s.slug) === id ? { ...s, paid: currentPaid } : s
        )
      );
    }
  };

  const handlePlanChange = async (id: number, planTypeId: number) => {
    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, planTypeId }),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();

      setServicesList((prev) =>
        prev.map((s) =>
          Number(s.id || s.slug) === id
            ? { ...s, paid: true, plans: updated.plans || s.plans }
            : s
        )
      );

      toast.success("Plan updated");
      onServiceUpdated?.();
    } catch {
      toast.error("Error updating plan");
    }
  };

  const totalPages = Math.ceil(servicesList.length / ITEMS_PER_PAGE);
  const paginatedServices = servicesList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (sectionRef.current) {
      const topOffset =
        sectionRef.current.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
    }
  };

  return (
    <section ref={sectionRef} className="services-section mb-5">
      {showTitle ? (
        <h2 className="section-title mb-4">
          MANAGE SERVICES ({servicesList.length})
        </h2>
      ) : null}

      {paginatedServices.length ? (
        <>
          <div key={currentPage} className="page-transition-wrap">
            <div className="services-grid">
              {paginatedServices.map((service, index) => {
            const serviceId = Number(service.id || service.slug);
            const isActive = Boolean(service.active);
            const isPaid = Boolean(service.paid);

            const activePlan =
              service.plans?.find(
                (p: any) => new Date(p.endDate).getTime() > Date.now()
              ) || service.plans?.[0];

            const daysRemaining = activePlan
              ? Math.max(
                  0,
                  Math.ceil(
                    (new Date(activePlan.endDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                )
              : 0;

            const currentPlanTypeId =
              activePlan?.planTypeId || activePlan?.planType?.id || 1;

            return (
              <div
                key={service.slug}
                className="service-card-item"
                style={{
                  animation: `fadeInCard 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                  animationDelay: `${index * 0.025}s`,
                  opacity: 0,
                }}
              >
                <div className="service-card-compact crud-card-clean">
                  {/* Media */}
                  <div className="crud-clean-media">
                    <div
                      className="crud-clean-img"
                      style={{
                        backgroundImage: `url("${
                          service.image ||
                          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e"
                        }")`,
                      }}
                    />
                  </div>

                  {/* Body */}
                  <div className="crud-clean-body">
                    <div className="crud-clean-header">
                      <h5 className="crud-clean-title" title={service.name}>
                        {service.name}
                      </h5>
                    </div>

                    {/* Single Check Row: Visible (Approved) & Paid */}
                    <div className="crud-checks-row">
                      <label className="crud-checkbox-item" title={isActive ? "Approved and visible on web" : "Pending review in Approval Panel"}>
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() =>
                            handleToggleActive(serviceId, isActive)
                          }
                        />
                        <span className="crud-custom-check check-visible"></span>
                        <span className="crud-check-text">
                          {isActive ? "Approved" : "Pending"}
                        </span>
                      </label>

                      <label className="crud-checkbox-item" title={isPaid ? "Payment confirmed" : "Pending payment"}>
                        <input
                          type="checkbox"
                          checked={isPaid}
                          onChange={() => handleTogglePaid(serviceId, isPaid)}
                        />
                        <span className="crud-custom-check check-paid"></span>
                        <span className="crud-check-text">
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </label>
                    </div>

                    {/* Plan selection and remaining days when paid */}
                    {isPaid ? (
                      <div className="crud-plan-status-box">
                        <div className="crud-plan-header-row">
                          <span className="crud-plan-mini-label">
                            <i className="fa-solid fa-crown me-1 text-warning"></i>
                            Plan
                          </span>
                          <span className="crud-days-badge" title="Remaining days of coverage">
                            <i className="fa-regular fa-clock me-1"></i>
                            {daysRemaining > 0
                              ? `${daysRemaining} days left`
                              : "Expired"}
                          </span>
                        </div>

                        <select
                          className="crud-plan-dropdown"
                          value={currentPlanTypeId}
                          onChange={(e) =>
                            handlePlanChange(
                              serviceId,
                              Number(e.target.value)
                            )
                          }
                          title="Select plan type"
                        >
                          {planTypes.length > 0 ? (
                            planTypes.map((pt) => (
                              <option key={pt.id} value={pt.id}>
                                {pt.label} ({pt.duration} days)
                              </option>
                            ))
                          ) : (
                            <option value="1">
                              {activePlan?.planType?.label || "Monthly"}
                            </option>
                          )}
                        </select>
                      </div>
                    ) : null}

                    {/* Action buttons */}
                    <div className="crud-clean-actions">
                      <button
                        type="button"
                        className="crud-clean-btn-edit"
                        onClick={() => handleEdit(serviceId)}
                      >
                        <i className="fa-solid fa-pen me-1"></i>
                        Edit
                      </button>

                      <button
                        type="button"
                        className="crud-clean-btn-delete"
                        onClick={() => handleDelete(serviceId)}
                      >
                        <i className="fa-solid fa-trash me-1"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={servicesList.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />

          {openPopup && (
            <Popup
              onClose={() => setOpenPopup(false)}
              onSuccess={() => {
                setOpenPopup(false);
                onServiceUpdated?.();
              }}
              initialData={selectedService}
              isAdmin={true}
            />
          )}
        </>
      ) : (
        <div className="services-empty-state">
          <h3>No services found</h3>
          <p>Use the "+ Create Service" button to add a new one.</p>
        </div>
      )}
    </section>
  );
}
