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
  onSuccess?: () => void;
  categories?: Category[];
  cityOptions?: Option[];
  stateOptions?: Option[];
  countryOptions?: Option[];
  user?: GoogleUser | null;
  initialData?: any;
  isAdmin?: boolean;
}

export default function AddServicePopup({
  onClose,
  onSuccess,
  user,
  initialData,
  isAdmin = false,
}: AddServicePopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    phone: "",
    instagram: "",
    image: "",
    email: "",
  });

  const [active, setActive] = useState<boolean>(true);
  const [paid, setPaid] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
        email: initialData.email || "",
      });
      if (initialData.image) {
        setImagePreview(initialData.image);
      }
      if (initialData.categoryId) setCategoryId(String(initialData.categoryId));
      if (initialData.subcategoryId) setSubcategoryId(String(initialData.subcategoryId));
      if (initialData.countryId) setCountryId(String(initialData.countryId));
      if (initialData.stateId) setStateId(String(initialData.stateId));
      if (initialData.cityId) setCityId(String(initialData.cityId));
      setActive(initialData.active !== undefined ? Boolean(initialData.active) : true);
      setPaid(initialData.paid !== undefined ? Boolean(initialData.paid) : false);
    } else {
      setActive(true);
      setPaid(false);
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
        alert("Image is too large. Maximum size is 2MB.");
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
    const storedUser = localStorage.getItem("user");
    const userEmail =
      user?.email ||
      (storedUser ? JSON.parse(storedUser).email : null) ||
      formData.email ||
      initialData?.email ||
      "admin@qfind.local";

    const dataToSend = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      ...formData,
      categoryId,
      subcategoryId,
      countryId,
      stateId,
      cityId,
      email: formData.email || userEmail,
      userEmail: userEmail,
      active: isAdmin ? active : (initialData?.active ?? false),
      paid: isAdmin ? paid : (initialData?.paid ?? false),
      validated: isAdmin ? true : (initialData?.validated ?? false),
    };

    const method = initialData ? "PUT" : "POST";
    setIsSaving(true);
    const loadingToast = toast.loading(
      initialData ? "Updating service..." : "Creating service...",
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
            `Failed to ${initialData ? "edit" : "create"} service`,
        );
      }

      // Smooth visual delay so user sees the branded QFind saving experience
      await new Promise((r) => setTimeout(r, 750));

      toast.success(
        initialData
          ? "Service updated successfully!"
          : "Service created successfully!",
        { id: loadingToast },
      );

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      setIsSaving(false);
      console.error("🔥 Error:", error.message);
      toast.error(`Error: ${error.message}`, { id: loadingToast });
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        {isSaving ? (
          <div className="service-saving-anim-card animate-reveal-results">
            {/* Pulsing radar rings */}
            <div className="search-radar-halo halo-1" />
            <div className="search-radar-halo halo-2" />
            <div className="search-radar-halo halo-3" />

            {/* QFind Logo with scanner beam */}
            <div className="search-anim-logo-wrap">
              <img
                src="/logo-white.png"
                alt="Saving QFind"
                className="search-anim-logo-img"
              />
              <div className="search-scanner-beam" />
            </div>

            {/* Animated details */}
            <div className="search-anim-details">
              <div className="search-anim-badge">
                <span className="search-live-dot" />
                {initialData ? "Updating Service" : "Publishing Service"}
              </div>
              <h3 className="search-anim-title">
                {initialData
                  ? "Saving your changes to QFind..."
                  : "Publishing your service to QFind..."}
              </h3>
              <p className="search-anim-subtitle">
                Syncing business profile, Google Maps location, and coverage status
              </p>
            </div>

            {/* Progress bar */}
            <div className="search-progress-bar-track">
              <div className="search-progress-bar-fill" />
            </div>
          </div>
        ) : (
          <>
            <div className="popup-header">
              <h2>
                {initialData ? "Edit Service" : "Add New Service"}
              </h2>
              <button className="close-btn" onClick={onClose}>
                &times;
              </button>
            </div>

        <form onSubmit={handleSubmit} className="add-service-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Business Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. El Paso Restaurant"
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
              <label>Country</label>
              <select
                className="filter-select"
                value={countryId}
                onChange={(event) => {
                  setCountryId(event.target.value);
                  setStateId("");
                  setCityId("");
                }}
              >
                <option value="">Select a country</option>
                {country.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>State / Province</label>
              <select
                className="filter-select"
                value={stateId}
                onChange={(event) => {
                  setStateId(event.target.value);
                  setCityId("");
                }}
                disabled={!countryId}
              >
                <option value="">Select a state / province</option>
                {state.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>City</label>
              <select
                className="filter-select"
                value={cityId}
                onChange={(event) => setCityId(event.target.value)}
                disabled={!stateId}
              >
                <option value="">Select a city</option>
                {city.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Exact name as it appears on Google Maps</label>
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. El Paso Restaurant, Main Street..."
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +1 555 123 4567"
              />
            </div>

            <div className="form-group">
              <label>Instagram</label>
              <input
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@your_business"
              />
            </div>

            <div className="form-group full-width">
              <label>Service Image</label>
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
                      <span>Click to upload image</span>
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
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Admin exclusive options: Active & Paid */}
          {isAdmin && (
            <div className="popup-toggles-container">
              <div className="popup-toggle-card">
                <div className="toggle-info">
                  <span className="toggle-title">
                    <i className="fa-solid fa-eye" style={{ marginRight: '8px', color: active ? '#22c55e' : '#94a3b8' }}></i>
                    Show service on the web (Active)
                  </span>
                  <span className="toggle-desc">
                    {active ? "The service will be visible to users in searches" : "The service will be hidden from users"}
                  </span>
                </div>
                <label className="switch-control" aria-label="Show service">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  <span className="switch-control-slider"></span>
                </label>
              </div>

              <div className="popup-toggle-card">
                <div className="toggle-info">
                  <span className="toggle-title">
                    <i className="fa-solid fa-credit-card" style={{ marginRight: '8px', color: paid ? '#2dd4bf' : '#94a3b8' }}></i>
                    Payment status (Paid)
                  </span>
                  <span className="toggle-desc">
                    {paid ? "Service enabled with confirmed payment" : "Service pending payment"}
                  </span>
                </div>
                <label className="switch-control" aria-label="Payment status">
                  <input
                    type="checkbox"
                    checked={paid}
                    onChange={(e) => setPaid(e.target.checked)}
                  />
                  <span className="switch-control-slider"></span>
                </label>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn text-white">
              {initialData ? "Save Changes" : "Create Service"}
            </button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
