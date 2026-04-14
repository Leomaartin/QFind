"use client";

import { useState, useEffect, useRef } from "react";
import "./viewServices.css";
import toast from "react-hot-toast";

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
  initialData?: any;
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
    image: "", // Base64 o URL
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-cargar datos si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        label: initialData.label || "",
        description: initialData.description || "",
        phone: initialData.phone || "",
        instagram: initialData.instagram || "",
        image: initialData.image || "",
      });
      if (initialData.image) {
        setImagePreview(initialData.image);
      }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Límite de 2MB
        alert("La imagen es demasiado grande. El límite es 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData((prev) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Obtener el email del usuario desde localStorage o props
    const userEmail = user?.email || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).email : null);

    if (!userEmail) {
      toast.error("No se pudo encontrar tu correo de sesión.");
      return;
    }

    const dataToSend = {
      ...formData,
      email: userEmail,
      userEmail: userEmail,
      validated: false,
      paid: false,
    };

    const method = initialData ? "PUT" : "POST";
    const loadingToast = toast.loading(initialData ? "Actualizando servicio..." : "Creando servicio...");

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

      toast.success(initialData ? "¡Servicio actualizado!" : "¡Servicio creado exitosamente!", { id: loadingToast });
      
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("🔥 Error:", error.message);
      toast.error(`Error: ${error.message}`, { id: loadingToast });
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

            <div className="form-group full-width">
              <label>Imagen del Servicio</label>
              <div className="image-upload-container">
                <input 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
                <div 
                  className="image-preview-box" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="img-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span>Hacer clic para subir imagen</span>
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: "" }));
                    }}
                  >
                    Eliminar Imagen
                  </button>
                )}
              </div>
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