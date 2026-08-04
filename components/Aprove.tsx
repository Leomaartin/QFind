"use client";

import { useState, useEffect } from "react";
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");

      if (!response.ok) {
        throw new Error("Error al obtener los servicios");
      }

      const data: Service[] = await response.json();

      // Mostrar únicamente los servicios pendientes
      const filtered = data.filter(
        (service) => !service.active
      );

      setServices(filtered);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("No se pudieron cargar los servicios.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    serviceId: string,
    field: "active" | "paid",
    value: boolean
  ) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, [field]: value }
          : service
      )
    );
  };

  const handleConfirm = async (service: Service) => {
    setUpdatingId(service.id);
    const loadingToast = toast.loading("Actualizando estado...");

    try {
      const response = await fetch("/api/services", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: service.id,
          active: service.active,
          paid: service.paid,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      const updatedService: Service = await response.json();

      // Como este panel solo muestra pendientes,
      // si deja de estar pendiente lo quitamos.
      if (updatedService.active || updatedService.paid) {
        setServices((prev) =>
          prev.filter((s) => s.id !== updatedService.id)
        );
      }

      toast.success("Estado actualizado correctamente", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("No se pudo actualizar el estado.", {
        id: loadingToast,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <section className="services-section mb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="services-section mb-5">
      <h2 className="section-title mb-4">Approval Panel</h2>

      {services.length ? (
        <div className="admin-grid">
          {services.map((service) => (
            <div key={service.id} className="admin-card">
              {/* Header Image */}
              <div className="admin-card-media">
                <div
                  className="admin-card-img"
                  style={{
                    backgroundImage: `url("${service.image}")`,
                  }}
                />
                <div className="admin-card-gradient" />
              </div>

              {/* Body & Admin Controls */}
              <div className="admin-card-body">
                <h5 className="admin-card-title" title={service.name}>
                  {service.name}
                </h5>

                {service.label ? (
                  <span className="admin-card-label">
                    {service.label}
                  </span>
                ) : null}

                {/* Toggle Controls Box */}
                <div className="admin-controls-box">
                  <div className="admin-toggle-row">
                    <span className="admin-toggle-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      ACTIVE
                    </span>
                    <label className="admin-toggle-switch">
                      <input
                        type="checkbox"
                        checked={service.active}
                        onChange={(e) => handleChange(service.id, "active", e.target.checked)}
                      />
                      <span className="admin-slider" />
                    </label>
                  </div>

                  <div className="admin-toggle-row">
                    <span className="admin-toggle-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                      PAID
                    </span>
                    <label className="admin-toggle-switch">
                      <input
                        type="checkbox"
                        checked={service.paid}
                        onChange={(e) => handleChange(service.id, "paid", e.target.checked)}
                      />
                      <span className="admin-slider slider-green" />
                    </label>
                  </div>
                </div>

                <button
                  className="submit-btn w-100"
                  style={{
                    padding: "10px 16px",
                    fontSize: "0.85rem",
                    borderRadius: "10px",
                    opacity: updatingId === service.id ? 0.7 : 1,
                  }}
                  onClick={() => handleConfirm(service)}
                  disabled={updatingId === service.id}
                >
                  {updatingId === service.id ? "Guardando..." : "Confirmar Cambios"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="services-empty-state">
          <h3>No hay servicios pendientes</h3>
          <p>Todos los servicios registrados tienen su estado activo y pago al día.</p>
        </div>
      )}
    </section>
  );
}
