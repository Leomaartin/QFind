"use client";

import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { getApiUrl } from "@/lib/config";
import "./Login.css";

interface GoogleUser {
  id?: string | number;
  name: string;
  email: string;
  picture: string;
  admin?: boolean;
}

interface LoginProps {
  onUserChange?: (user: GoogleUser | null) => void;
}

const handleSubmitGoogle = async (
  googleUser: GoogleUser
): Promise<{ id?: string | number; admin?: boolean } | null> => {
  try {
    const response = await fetch(getApiUrl("/api/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        google_id: googleUser.email,
        nombre: googleUser.name,
        email: googleUser.email,
        foto: googleUser.picture,
      }),
    });

    const data = await response.json();
    return {
      id: data.user?.id,
      admin: data.user?.admin ?? false,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default function Login({ onUserChange }: LoginProps) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);

      setUser(parsedUser);
      onUserChange?.(parsedUser);
    }
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      setIsLight(document.body.classList.contains("LigthVersion"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const onGoogleSuccess = async (response: any) => {
    try {
      if (!response.credential) return;

      const decoded = jwtDecode<any>(response.credential);

      const userData: GoogleUser = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        admin: false,
      };

      const serverData = await handleSubmitGoogle(userData);

      if (serverData) {
        if (serverData.id) userData.id = serverData.id;
        userData.admin = serverData.admin ?? false;
      }

      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

      onUserChange?.(userData);

      toast.success(`Welcome, ${userData.name}!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    onUserChange?.(null);
    toast.success("Signed out successfully");
  };

  return (
    <div className="login-wrapper">
      <Toaster position="top-right" />

      {user ? (
        <div className="user-info-section">
          <div className="user-info">
            <div className="user-data">
              <img
                src={user.picture}
                alt={user.name}
                className="user-avatar"
              />

              <div className="content">
                <h5 className="user-title">
                  Welcome, {user.name.split(" ")[0]}!
                </h5>

                <p className="user-subtitle">
                  Your session is active
                </p>
              </div>
            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <div className="login-card-container">
          <div className="login-card">
            <h4 className="login-title">
              Member Access
            </h4>

            <p className="login-description">
              Sign in with Google to continue managing and adding services
            </p>

            <div className="google-login">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => toast.error("Failed to sign in")}
                theme={isLight ? "outline" : "filled_black"}
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