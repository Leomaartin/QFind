"use client";

import { useState, useEffect } from "react";
import "./viewServices.css";

interface Option {
  label: string;
  value: number;
}

interface Category {
  id: string;
  name: string;
}

interface GoogleUser {
  id?: string | number;
  name: string;
  email: string;
  picture: string;
}

interface AddServicePopupProps {
  onClose: () => void;
  categories: Category[];
  cityOptions: Option[];
  stateOptions: Option[];
  countryOptions: Option[];
  user: GoogleUser | null;
  initialData?: any; // Datos iniciales para modo edición
}

export default function AddServicePopup({
  onClose,
  categories,
  cityOptions,
  stateOptions,
  countryOptions,
  user,
  initialData, 
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

  // Pre-cargar datos si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        label: initialData.label || "",
        description: initialData.description || "",
        phone: initialData.phone || "",
        instagram: initialData.instagram || "",
        email: initialData.email || "",
        image: initialData.image || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Obtener el email del usuario desde localStorage o props
    const userEmail = user?.email || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).email : null);

    if (!userEmail) {
      alert("No se pudo encontrar tu correo de sesión. Por favor, intenta cerrar y volver a iniciar sesión.");
      return;
    }

    const dataToSend = {
      ...formData,
      userEmail: userEmail,
      validated: false,
      paid: false,
    };

    const method = initialData ? "PUT" : "POST";
    console.log(`ENVIANDO (${method}):`, dataToSend);

    try {
      const res = await fetch("/api/services", {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error al ${initialData ? "editar" : "crear"} servicio`);
      }

      const data = await res.json();
      console.log(`✅ Servicio ${initialData ? "actualizado" : "creado"} exitosamente:`, data);

      onClose();
      // Recargar la página para ver los cambios (esto se puede mejorar con un callback de refresco)
      window.location.reload();
    } catch (error: any) {
      console.error("🔥 Error:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>{initialData ? "Editar Mi Servicio" : "Agregar Nuevo Servicio"}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-service-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre del Negocio</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Ej: Restaurant El Paso"
                required 
              />
            </div>

            <div className="form-group">
              <label>Categoría / Etiqueta</label>
              <input 
                name="label" 
                value={formData.label} 
                onChange={handleChange} 
                placeholder="Ej: Gastronomía"
              />
            </div>

            <div className="form-group full-width">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe brevemente tu servicio..."
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="Ej: +54 9 11..."
              />
            </div>

            <div className="form-group">
              <label>Instagram</label>
              <input 
                name="instagram" 
                value={formData.instagram} 
                onChange={handleChange} 
                placeholder="@tu_negocio"
              />
            </div>

            <div className="form-group">
              <label>Email de Contacto</label>
              <input 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="contacto@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label>Imagen URL (Opcional)</label>
              <input 
                name="image" 
                value={formData.image} 
                onChange={handleChange} 
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn text-white">
              {initialData ? "Guardar Cambios" : "Crear Servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}