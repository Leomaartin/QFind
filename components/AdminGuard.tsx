"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { getApiUrl } from "@/lib/config";
import "./viewServices.css";

const ADMIN_EMAILS = [
  "leonelmartin9808@gmail.com",
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
]
  .filter(Boolean)
  .map((e) => e.toLowerCase().trim());

export const checkIsAdmin = (userOrEmail?: any): boolean => {
  if (!userOrEmail) return false;

  if (typeof userOrEmail === "object") {
    if (userOrEmail.admin === true) return true;
    if (userOrEmail.email && ADMIN_EMAILS.includes(userOrEmail.email.toLowerCase().trim())) {
      return true;
    }
    return false;
  }

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
  const [isServerAdmin, setIsServerAdmin] = useState(false);
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

  // Verificacin de seguridad contra el SERVIDOR (No vulnerable a manipulacin de localStorage)
  const verifyServerSession = useCallback(async () => {
    try {
      setIsChecking(true);
      const res = await fetch("/api/auth/me", {
        headers: { "Cache-Control": "no-cache" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          const isAdm = Boolean(data.user.admin || checkIsAdmin(data.user));
          setCurrentUser(data.user);
          setIsServerAdmin(isAdm);
          localStorage.setItem("user", JSON.stringify(data.user));
          return;
        }
      }

      // Si el servidor indica que no hay sesin o no es admin
      setIsServerAdmin(false);
      const saved = localStorage.getItem("user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCurrentUser(parsed);
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Error verificando sesin en el servidor:", err);
      setIsServerAdmin(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    verifyServerSession();

    const handleAuthChange = () => {
      verifyServerSession();
    };

    window.addEventListener("user-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("user-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [verifyServerSession]);

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
            credential: response.credential,
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

      // Re-verificar contra el servidor
      await verifyServerSession();

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

  const handleSignOut = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (err) {
      console.error("Error signing out:", err);
    }
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsServerAdmin(false);
    window.dispatchEvent(new CustomEvent("user-auth-change", { detail: null }));
    toast.success("Signed out");
  };

  if (isChecking) {
    return (
      <div className="admin-guard-loading-screen">
        <div className="admin-guard-spinner" />
        <p>Verifying administrator credentials on server...</p>
      </div>
    );
  }

  // La autorizacin requiere que tanto el servidor como el email sean vlidos
  const isAdmin = isServerAdmin && checkIsAdmin(currentUser);

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
