"use client";

import { useState, useMemo } from "react";
import "./viewServices.css";

interface Option {
  label: string;
  value: number;
}

interface AddServicePopupProps {
  onClose: () => void;
  cityOptions: Option[];
  stateOptions: Option[];
  countryOptions: Option[];
}

export default function AddServicePopup({
  onClose,
  cityOptions,
  stateOptions,
  countryOptions,
}: AddServicePopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    phone: "",
    instagram: "",
    email: "",
    image: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const dataToSend = {
    ...formData,
    active: false,
    validated: false,
    paid: false,
  };

  console.log("DATA FINAL:", dataToSend);
  try {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    if (!res.ok) throw new Error("Error al crear servicio");

    const data = await res.json();

    console.log("✅ Servicio creado:", data);

    onClose();
  } catch (error) {
    console.error("🔥 Error:", error);
  }
};

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Agregar Servicio</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-service-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Label</label>
              <input name="label" value={formData.label} onChange={handleChange} />
            </div>

            <div className="form-group full-width">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input name="phone" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Instagram</label>
              <input name="instagram" value={formData.instagram} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input name="email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Imagen</label>
              <input name="image" value={formData.image} onChange={handleChange} />
            </div>

 
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn">Agregar Servicio</button>
          </div>
        </form>
      </div>
    </div>
  );
}