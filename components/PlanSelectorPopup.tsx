"use client";

import { useState, useEffect } from "react";
import "./viewServices.css";
import toast from "react-hot-toast";

interface PlanType {
  id: number;
  name: string;
  label: string;
  duration: number;
  price: number;
}

interface PlanSelectorPopupProps {
  onClose: () => void;
  serviceId: number;
}

export default function PlanSelectorPopup({ onClose, serviceId }: PlanSelectorPopupProps) {
  const [planTypes, setPlanTypes] = useState<PlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !selectedPlanId) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedPlanId]);

  useEffect(() => {
    const fetchPlanTypes = async () => {
      try {
        const res = await fetch("/api/plan-types");
        if (res.ok) {
          const data = await res.json();
          setPlanTypes(data);
        }
      } catch (error) {
        console.error("Error fetching plan types:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanTypes();
  }, []);

  const getPlanMeta = (name: string, duration: number) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("quarter") || duration === 90) {
      return {
        badge: "Most Popular",
        isPopular: true,
        icon: "fa-solid fa-star",
        title: "Quarterly",
        tagline: "Best balance of visibility & value",
        periodText: "/ 90 days",
        features: [
          "Verified Business Badge",
          "Interactive Map Pin Placement",
          "WhatsApp & Direct Contact Leads",
          "Priority City Search Ranking",
          "Quarterly Continuous Coverage",
        ],
      };
    }
    if (lower.includes("annual") || duration === 365) {
      return {
        badge: "Best Value",
        isPopular: false,
        icon: "fa-solid fa-crown",
        title: "Annual",
        tagline: "Maximum long-term exposure & savings",
        periodText: "/ 365 days",
        features: [
          "Everything in Quarterly",
          "Top-Tier Featured Directory Spot",
          "Full 365-Day City Visibility",
          "Priority Customer Inquiries",
          "Maximum Long-Term Savings",
        ],
      };
    }
    if (lower.includes("semi") || duration === 180) {
      return {
        badge: "Great Savings",
        isPopular: false,
        icon: "fa-solid fa-gem",
        title: "Semiannual",
        tagline: "6 months of uninterrupted customer acquisition",
        periodText: "/ 180 days",
        features: [
          "Verified Business Badge",
          "Interactive Map Pin Placement",
          "WhatsApp & Direct Contact Leads",
          "Higher Search Category Visibility",
          "6 Months Steady Reach",
        ],
      };
    }
    return {
      badge: "Starter",
      isPopular: false,
      icon: "fa-solid fa-bolt",
      title: "Monthly",
      tagline: "Flexible monthly presence to start getting leads",
      periodText: "/ 30 days",
      features: [
        "Verified Business Badge",
        "Interactive Map Pin Placement",
        "WhatsApp & Direct Contact Leads",
        "Standard Directory Presence",
        "Upgrade or Renew Anytime",
      ],
    };
  };

  const handleSelectPlan = async (planTypeId: number) => {
    if (selectedPlanId) return;
    setSelectedPlanId(planTypeId);
    const loadingToast = toast.loading("Activating plan for your service...");
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, planTypeId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to assign plan");
      }

      toast.success("Plan activated successfully! Your service is now live.", { id: loadingToast });
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign plan", { id: loadingToast });
      setSelectedPlanId(null);
    }
  };

  return (
    <div className="plan-popup-overlay" onClick={() => !selectedPlanId && onClose()}>
      <div className="plan-popup-container" onClick={(e) => e.stopPropagation()}>
        {/* Background ambient lighting */}
        <div className="plan-popup-ambient-glow" />

        {/* Modal Header */}
        <div className="plan-popup-header">
          <div className="plan-popup-header-content">
            <span className="plan-popup-pill">
              <i className="fa-solid fa-gem me-1 text-teal"></i>
              Subscription Plans
            </span>
            <h2 className="plan-popup-title">Choose the Perfect Plan</h2>
            <p className="plan-popup-subtitle">
              Select a duration to publish your service, appear on the interactive map, and connect directly with local clients.
            </p>
          </div>
          <button
            type="button"
            className="plan-popup-close-btn"
            onClick={onClose}
            disabled={Boolean(selectedPlanId)}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="plan-cards-grid">
          {loading ? (
            <div className="plan-loading-state">
              <div className="plan-spinner" />
              <p>Fetching available plans...</p>
            </div>
          ) : planTypes.length === 0 ? (
            <div className="plan-empty-state">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>No plans available at the moment. Please check back shortly.</p>
            </div>
          ) : (
            planTypes.map((plan, index) => {
              const meta = getPlanMeta(plan.name, plan.duration);
              const isSelected = selectedPlanId === plan.id;
              const isOtherSelected = selectedPlanId !== null && !isSelected;

              return (
                <div
                  key={plan.id}
                  className={`plan-card ${meta.isPopular ? "is-popular" : ""} ${isSelected ? "is-selected" : ""} ${isOtherSelected ? "is-dimmed" : ""}`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Badge */}
                  {meta.badge && (
                    <div className={`plan-card-badge ${meta.isPopular ? "badge-popular" : ""}`}>
                      <i className={`${meta.icon} me-1`}></i>
                      {meta.badge}
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="plan-card-header">
                    <div className="plan-card-icon-wrap">
                      <i className={meta.icon}></i>
                    </div>
                    <h3 className="plan-card-name">{meta.title}</h3>
                    <p className="plan-card-tagline">{meta.tagline}</p>
                  </div>

                  {/* Price Block */}
                  <div className="plan-card-pricing">
                    <div className="plan-card-price-row">
                      <span className="plan-currency">$</span>
                      <span className="plan-amount">{plan.price.toLocaleString("en-US")}</span>
                    </div>
                    <span className="plan-duration-label">
                      {plan.duration} days of active visibility
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="plan-card-divider" />

                  {/* Feature Checklist */}
                  <ul className="plan-card-features">
                    {meta.features.map((feature, fIndex) => (
                      <li key={fIndex} className="plan-feature-item">
                        <i className="fa-solid fa-circle-check plan-check-icon"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Action Button */}
                  <button
                    type="button"
                    className={`plan-card-cta-btn ${meta.isPopular ? "cta-popular" : ""}`}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={Boolean(selectedPlanId)}
                  >
                    {isSelected ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin me-2"></i>
                        Activating...
                      </>
                    ) : (
                      <>
                        <span>Select {meta.title}</span>
                        <i className="fa-solid fa-arrow-right plan-cta-arrow"></i>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Guarantee / Security Notice */}
        <div className="plan-popup-footer">
          <div className="plan-footer-guarantee">
            <i className="fa-solid fa-shield-halved text-teal me-2"></i>
            <span>Instant activation • Direct client leads • Verified service visibility</span>
          </div>
        </div>
      </div>
    </div>
  );
}
