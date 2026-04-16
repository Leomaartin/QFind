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
  user,
  initialData,
}: AddServicePopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    phone: "",
    instagram: "",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const [subcategory, setSubcategory] = useState<any[]>([]);
  const [subcategoryId, setSubcategoryId] = useState<string>("");

  const [country, setCountry] = useState<any[]>([]);
  const [countryId, setCountryId] = useState<string>("");

  const [state, setState] = useState<any[]>([]);
  const [stateId, setStateId] = useState<string>("");

  const [city, setCity] = useState<any[]>([]);
  const [cityId, setCityId] = useState<string>("");

  useEffect(() => {
    const fetchSubcategory = async () => {
      if (!categoryId) return;

      const res = await fetch("/api/filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: categoryId }),
      });

      const subcategory = await res.json();
      setSubcategory(subcategory);
    };

    fetchSubcategory();
  }, [categoryId]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch("/api/filters");

        if (!res.ok) throw new Error("Error al traer categorías");

        const category = await res.json();
        console.log(category);

        setCategory(category);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategory();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("/api/places");
        if (!res.ok) throw new Error("Error al traer países");
        const data = await res.json();
        setCountry(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (!countryId) {
        setState([]);
        return;
      }
      try {
        const res = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryId }),
        });
        const data = await res.json();
        setState(data);
      } catch (error) {}
    };
    fetchStates();
  }, [countryId]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!stateId) {
        setCity([]);
        return;
      }
      try {
        const res = await fetch("/api/city", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stateId }),
        });
        const data = await res.json();
        setCity(data);
      } catch (error) {}
    };
    fetchCities();
  }, [stateId]);

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
      if (initialData.categoryId) setCategoryId(String(initialData.categoryId));
      if (initialData.subcategoryId) setSubcategoryId(String(initialData.subcategoryId));
      if (initialData.countryId) setCountryId(String(initialData.countryId));
      if (initialData.stateId) setStateId(String(initialData.stateId));
      if (initialData.cityId) setCityId(String(initialData.cityId));
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
      if (file.size > 2 * 1024 * 1024) {
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
    const userEmail =
      user?.email ||
      (localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!).email
        : null);

    if (!userEmail) {
      toast.error("No se pudo encontrar tu correo de sesión.");
      return;
    }

    const dataToSend = {
      ...formData,
      categoryId,
      subcategoryId,
      countryId,
      stateId,
      cityId,
      email: userEmail,
      userEmail: userEmail,
      validated: false,
      paid: false,
    };

    const method = initialData ? "PUT" : "POST";
    const loadingToast = toast.loading(
      initialData ? "Actualizando servicio..." : "Creando servicio...",
    );

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
        throw new Error(
          errorData.error ||
            `Error al ${initialData ? "editar" : "crear"} servicio`,
        );
      }

      toast.success(
        initialData
          ? "¡Servicio actualizado!"
          : "¡Servicio creado exitosamente!",
        { id: loadingToast },
      );

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
          <h2>
            {initialData ? "Editar Mi Servicio" : "Agregar Nuevo Servicio"}
          </h2>
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

            <div className="filter-group">
              <label>Category</label>
              <select
                className="filter-select"
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setSubcategoryId("");
                }}
              >
                <option value="">Select a category</option>

                {category.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Subcategory</label>
              <select
                className="filter-select"
                value={subcategoryId}
                onChange={(event) => setSubcategoryId(event.target.value)}
                disabled={!categoryId}
              >
                <option value="">Select a subcategory</option>

                {subcategory.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>País</label>
              <select
                className="filter-select"
                value={countryId}
                onChange={(event) => {
                  setCountryId(event.target.value);
                  setStateId("");
                  setCityId("");
                }}
              >
                <option value="">Selecciona un país</option>
                {country.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Provincia</label>
              <select
                className="filter-select"
                value={stateId}
                onChange={(event) => {
                  setStateId(event.target.value);
                  setCityId("");
                }}
                disabled={!countryId}
              >
                <option value="">Selecciona una provincia</option>
                {state.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Ciudad</label>
              <select
                className="filter-select"
                value={cityId}
                onChange={(event) => setCityId(event.target.value)}
                disabled={!stateId}
              >
                <option value="">Selecciona una ciudad</option>
                {city.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>¿Cómo aparece exactamente tu local en Google Maps?</label>
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ejemplo: Restaurant El Paso, Córdoba..."
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
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-preview"
                    />
                  ) : (
                    <div className="upload-placeholder">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
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
                      setFormData((prev) => ({ ...prev, image: "" }));
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
