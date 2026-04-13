"use client";

import { useState, useEffect } from "react";
import "./viewServices.css";

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

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
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
      <h2 className="section-title mb-4">Gestión de Servicios</h2>
      
      {services.length ? (
        <div className="row g-3">
          {services.map((service) => (
            <div key={service.id} className="service-col">
              <div className="service-card-shell" style={{ paddingBottom: "160px" }}>
                <div className="service-card" style={{ minHeight: "280px", aspectRatio: "4/4" }}>
                  <div
                    className="service-image"
                    style={{ backgroundImage: `url("${service.image}")` }}
                  />

                  <div className="service-overlay">
                    <h5>{service.name}</h5>
                    <p className="small mb-0" style={{ color: "var(--text-muted)" }}>{service.label}</p>
                  </div>
                </div>

                <div className="service-drawer" style={{ opacity: 1, transform: "translateY(0)", pointerEvents: "auto", padding: "18px" }}>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="text-white small fw-bold">ACTIVO</span>
                      <div className="custom-checkbox">
                        <input
                          type="checkbox"
                          id={`active-${service.id}`}
                          checked={service.active}
                          onChange={() => {}}
                          style={{ 
                            width: "20px", 
                            height: "20px", 
                            accentColor: "#f2d4ba",
                            cursor: "pointer"
                          }}
                        />
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="text-white small fw-bold">PAGADO</span>
                      <div className="custom-checkbox">
                        <input
                          type="checkbox"
                          id={`paid-${service.id}`}
                          checked={service.paid}
                          onChange={() => {}}
                          style={{ 
                            width: "20px", 
                            height: "20px", 
                            accentColor: "#f2d4ba",
                            cursor: "pointer"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="services-empty-state">
          <h3>No hay servicios registrados</h3>
          <p>Los servicios que se registren aparecerán aquí para su aprobación.</p>
        </div>
      )}
    </section>
  );
}
