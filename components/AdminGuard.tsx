"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { getApiUrl } from "@/lib/config";
import "./viewServices.css";

const ADMIN_EMAILS = [
  "leonelmartin9808@gmail.com",
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
].filter(Boolean).map(e => e.toLowerCase().trim());

export const checkIsAdmin = (userOrEmail?: any): boolean => {
  if (!userOrEmail) return false;

  // Si se pasa el objeto de usuario
  if (typeof userOrEmail === "object") {
    if (userOrEmail.admin === true) return true;
    if (userOrEmail.email && ADMIN_EMAILS.includes(userOrEmail.email.toLowerCase().trim())) {
      return true;
    }
    return false;
  }

  // Si se pasa el string del email directamente
  if (typeof userOrEmail === "string") {
    return ADMIN_EMAILS.includes(userOrEmail.toLowerCase().trim());
  }

  return false;
};

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Sync theme
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail?.isLight !== undefined) {
        setIsDark(!e.detail.isLight);
      } else {
        setIsDark(!document.body.classList.contains("LigthVersion"));
      }
    };
    setIsDark(!document.body.classList.contains("LigthVersion"));
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  // Sync user from localStorage & events
  useEffect(() => {
    const loadUser = () => {
      try {
        const saved = localStorage.getItem("user");
        if (saved) {
          const parsed = JSON.parse(saved);
          setCurrentUser(parsed);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setIsChecking(false);
      }
    };

    loadUser();

    const handleAuth = (e: any) => {
      if (e.detail !== undefined) {
        setCurrentUser(e.detail);
        setIsChecking(false);
      } else {
        loadUser();
      }
    };

    window.addEventListener("user-auth-change", handleAuth);
    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("user-auth-change", handleAuth);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleGoogleSuccess = async (response: any) => {
    try {
      if (!response.credential) return;
      const decoded = jwtDecode<any>(response.credential);
      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        id: undefined as string | number | undefined,
        admin: false as boolean,
      };

      try {
        const res = await fetch(getApiUrl("/api/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            google_id: userData.email,
            nombre: userData.name,
            email: userData.email,
            foto: userData.picture,
          }),
        });
        const data = await res.json();
        if (data.user?.id) userData.id = data.user.id;
        if (data.user?.admin !== undefined) userData.admin = data.user.admin;
      } catch (err) {
        console.error("Backend login error:", err);
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setCurrentUser(userData);
      window.dispatchEvent(new CustomEvent("user-auth-change", { detail: userData }));
      setIsAuthModalOpen(false);

      if (checkIsAdmin(userData)) {
        toast.success(`Welcome Admin, ${userData.name}!`);
      } else {
        toast.error("This account is not authorized as an administrator.");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      toast.error("Failed to sign in with Google");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    window.dispatchEvent(new CustomEvent("user-auth-change", { detail: null }));
    toast.success("Signed out");
  };

  if (isChecking) {
    return (
      <div className="admin-guard-loading-screen">
        <div className="admin-guard-spinner" />
        <p>Verifying administrator credentials...</p>
      </div>
    );
  }

  const isAdmin = checkIsAdmin(currentUser);

  if (!isAdmin) {
    return (
      <div className="admin-guard-blocked-screen">
        <div className="admin-guard-ambient-glow" />

        <div className="admin-guard-card">
          <div className="admin-guard-icon-box">
            <i className="fa-solid fa-lock"></i>
          </div>

          <div className="admin-guard-badge">
            <i className="fa-solid fa-shield-halved me-1"></i>
            Admin Access Only
          </div>

          <h2 className="admin-guard-title">Restricted Control Panel</h2>
          <p className="admin-guard-desc">
            This administration area is restricted to authorized platform administrators only.
            Please sign in with an authorized administrator account to manage services and approvals.
          </p>

          <div className="admin-guard-user-status">
            {currentUser ? (
              <div className="admin-guard-user-row">
                {currentUser.picture && (
                  <img
                    src={currentUser.picture}
                    alt={currentUser.name}
                    className="admin-guard-user-avatar"
                  />
                )}
                <div className="admin-guard-user-meta">
                  <span className="admin-guard-user-name">{currentUser.name}</span>
                  <span className="admin-guard-user-email">{currentUser.email}</span>
                </div>
                <span className="admin-guard-unauth-pill">Not Authorized</span>
              </div>
            ) : (
              <div className="admin-guard-guest-row">
                <i className="fa-solid fa-user-xmark me-2 text-muted"></i>
                <span>You are currently not signed in.</span>
              </div>
            )}
          </div>

          <div className="admin-guard-actions">
            {!currentUser ? (
              <button
                type="button"
                className="admin-guard-btn admin-guard-btn-primary"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <i className="fa-brands fa-google me-2"></i>
                Sign In as Admin
              </button>
            ) : (
              <button
                type="button"
                className="admin-guard-btn admin-guard-btn-switch"
                onClick={handleSignOut}
              >
                <i className="fa-solid fa-arrow-right-from-bracket me-2"></i>
                Switch Account
              </button>
            )}

            <Link href="/" className="admin-guard-btn admin-guard-btn-secondary">
              <i className="fa-solid fa-house me-2"></i>
              Return to Home
            </Link>
          </div>
        </div>

        {/* Auth Modal for Admin Sign In */}
        {isAuthModalOpen && (
          <div className="auth-modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="auth-modal-close"
                onClick={() => setIsAuthModalOpen(false)}
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <img
                src={isDark ? "/logo-white.png" : "/logo-dark.png"}
                alt="QFind Logo"
                className="auth-modal-logo"
              />

              <h3 className="auth-modal-title">Admin Sign In</h3>
              <p className="auth-modal-desc">
                Sign in with your Google administrator account to access the control panel.
              </p>

              <div className="auth-modal-login-wrap">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Failed to sign in with Google")}
                  theme={isDark ? "filled_black" : "outline"}
                  shape="pill"
                  size="large"
                  text="signin_with"
                />
              </div>

              <div className="auth-modal-security">
                <i className="fa-solid fa-shield-halved"></i>
                <span>Protected admin environment powered by Google OAuth</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
