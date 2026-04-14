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
      if (response.ok) {
        const data = await response.json();
        // Filtrar: solo mostrar servicios que NO están activos O que NO están pagos
        const filtered = data.filter((s: Service) => !s.active || !s.paid);
        setServices(filtered);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (serviceId: string, field: "active" | "paid", value: boolean) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, [field]: value } : s
    ));
  };

  const handleConfirm = async (service: Service) => {
    setUpdatingId(service.id);
    const loadingToast = toast.loading("Actualizando estado...");

    try {
      const response = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: service.id,
          active: service.active,
          paid: service.paid
        })
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      const updatedService = await response.json();
      
      // Si el servicio ahora está tanto Activo como Pagado, lo quitamos de la lista
      if (updatedService.active && updatedService.paid) {
        setServices(prev => prev.filter(s => s.id !== service.id));
        toast.success("Servicio aprobado y publicado", { id: loadingToast });
      } else {
        toast.success("Estado actualizado correctamente", { id: loadingToast });
      }

    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("No se pudo actualizar el estado.", { id: loadingToast });
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
      <h2 className="section-title mb-4">Panel de Aprobación</h2>
      
      {services.length ? (
        <div className="row g-4">
          {services.map((service) => (
            <div key={service.id} className="service-col">
              <div 
                className="service-card-shell" 
                style={{ 
                  paddingBottom: "180px", 
                  cursor: "default"
                }}
              >
                <div 
                  className="service-card" 
                  style={{ 
                    minHeight: "280px", 
                    aspectRatio: "4/4",
                    transform: "none",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                  }}
                >
                  <div
                    className="service-image"
                    style={{ 
                      backgroundImage: `url("${service.image}")`,
                      pointerEvents: "none",
                      transform: "none",
                      filter: "brightness(0.7)"
                    }}
                  />

                  <div className="service-overlay" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <h5>{service.name}</h5>
                    <p className="small mb-0" style={{ color: "var(--text-muted)" }}>{service.label}</p>
                  </div>
                </div>

                <div className="service-drawer" style={{ opacity: 1, transform: "translateY(0)", pointerEvents: "auto", padding: "18px" }}>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-white small fw-bold">ACTIVO</span>
                      <input
                        type="checkbox"
                        checked={service.active}
                        onChange={(e) => handleChange(service.id, "active", e.target.checked)}
                        style={{ width: "22px", height: "22px", accentColor: "#f2d4ba", cursor: "pointer" }}
                      />
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-white small fw-bold">PAGADO</span>
                      <input
                        type="checkbox"
                        checked={service.paid}
                        onChange={(e) => handleChange(service.id, "paid", e.target.checked)}
                        style={{ width: "22px", height: "22px", accentColor: "#f2d4ba", cursor: "pointer" }}
                      />
                    </div>
                    
                    <button 
                      className="submit-btn w-100 mt-2"
                      style={{ padding: "8px", fontSize: "0.85rem", opacity: updatingId === service.id ? 0.7 : 1 }}
                      onClick={() => handleConfirm(service)}
                      disabled={updatingId === service.id}
                    >
                      {updatingId === service.id ? "Guardando..." : "Confirmar Cambios"}
                    </button>
                  </div>
                </div>
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
