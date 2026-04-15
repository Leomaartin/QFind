"use client";

import { useState, useEffect } from "react";
import "./viewServices.css";
import { GoogleLogin } from "@react-oauth/google";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";


interface GoogleUser {
  id?: string | number; 
  name: string;
  email: string;
  picture: string;
}

const handleSubmitGoogle = async (googleUser: GoogleUser): Promise<string | number | null> => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        google_id: googleUser.email,
        nombre: googleUser.name,
        email: googleUser.email,
        foto: googleUser.picture,
      }),
    });

    const data = await response.json();
    console.log("Usuario guardado/recuperado:", data);
    return data.user?.id || null; 
  } catch (error) {
    console.error("Error al guardar info del usuario:", error);
    return null;
  }
};

interface LoginProps {
  onUserChange?: (user: GoogleUser | null) => void;
}

export default function Login({ onUserChange }: LoginProps) {
  const [user, setUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        onUserChange?.(parsedUser);
      } catch (e) {
        console.error("Error parsing saved user", e);
      }
    }
  }, []);

  const onGoogleSuccess = async (response: any) => {
    try {
      if (!response.credential) throw new Error("No se recibió credential");

      const decoded = jwtDecode<any>(response.credential);

      const userData: GoogleUser = {
        name: decoded.name || "Usuario",
        email: decoded.email || "sin-email@example.com",
        picture: decoded.picture || "/default-user.png",
      };
      const dbId = await handleSubmitGoogle(userData);
      
      if (dbId) {
        userData.id = dbId;
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      onUserChange?.(userData);

      toast.success(`¡Hola, ${userData.name}!`);
    } catch (error) {
      console.error("Error decodificando JWT:", error);
      toast.error("Error procesando los datos de Google");
    }
  };

  const onGoogleError = () => {
    console.log("Algo salió mal con Google");
    toast.error("Error en login con Google");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    onUserChange?.(null);
    toast.success("Has cerrado sesión");
  };

  return (
    <div className="login-wrapper my-4">
      <Toaster position="top-right" />

      {user ? (
        <div className="user-info-section p-3 rounded-4"
             style={{ background: "#182326", border: "1px solid #223236", maxWidth: "450px", margin: "0 auto" }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <img
                src={user.picture}
                alt={user.name}
                width={50}
                height={50}
                className="rounded-circle border border-2"
                style={{ borderColor: "#a3e635" }}
              />
              <div>
                <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "1.1rem" }}>
                  ¡Bienvenido, {user.name.split(' ')[0]}!
                </h5>
                <p className="mb-0 small text-muted-custom" style={{ color: "#9aa8ad" }}>Tu sesión está activa</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline-danger border-0 fw-bold"
              style={{ padding: "8px 12px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <div className="login-card-container d-flex justify-content-center">
          <div
            className="card p-4 shadow-lg border-0"
            style={{
              maxWidth: "450px",
              width: "100%",
              borderRadius: "1.5rem",
              background: "linear-gradient(145deg, #182326 0%, #0c1315 100%)",
              border: "1px solid #223236"
            }}
          >
            <h4 className="text-center mb-1 text-white" style={{ fontWeight: "800" }}>
              Acceso a Miembro
            </h4>
            <p className="text-center small mb-4" style={{ color: "#d1dce0", fontSize: "0.9rem", fontWeight: "500" }}>
              Inicia sesión con Google para continuar registrando servicios
            </p>

            <div className="d-flex justify-content-center py-2">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                theme="filled_black"
                shape="pill"
                size="large"
                text="signin_with"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}