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

  const handleSelectPlan = async (planTypeId: number) => {
    const loadingToast = toast.loading("Asignando plan...");
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, planTypeId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al asignar plan");
      }

      toast.success("¡Plan asignado exitosamente!", { id: loadingToast });
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al asignar plan", { id: loadingToast });
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2 >Elegir un Plan para tu Servicio</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="plan-selection-container" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {loading ? (
            <p>Cargando planes...</p>
          ) : planTypes.length === 0 ? (
            <p>No hay planes disponibles por el momento.</p>
          ) : (
            planTypes.map((plan) => (
              <div key={plan.id} style={{
                background: 'var(--bg-soft)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                width: '100%',
                maxWidth: '280px',
                textAlign: 'center',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '1.4rem' }}>{plan.label}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Duración: {plan.duration} días</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '20px' }}>
                  ${plan.price}
                </p>
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    width: '100%',
                    fontWeight: 'bold',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#4a6b76'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
                >
                  Seleccionar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
