"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "./Navbar.module.css";

interface GoogleUser {
  id?: string | number;
  name: string;
  email: string;
  picture: string;
}

export default function Navbar() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const loadSavedUser = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    const syncWithServer = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
            return;
          }
        }
      } catch {
        // Fallback al localStorage
      }
      loadSavedUser();
    };

    syncWithServer();

    const handleAuthChange = (event: any) => {
      if (event.detail !== undefined) {
        setUser(event.detail);
      } else {
        syncWithServer();
      }
    };

    window.addEventListener("user-auth-change", handleAuthChange);
    window.addEventListener("storage", loadSavedUser);

    return () => {
      window.removeEventListener("user-auth-change", handleAuthChange);
      window.removeEventListener("storage", loadSavedUser);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.body.classList.add("LigthVersion");
      setIsLight(true);
    } else if (savedTheme === "dark") {
      document.body.classList.remove("LigthVersion");
      setIsLight(false);
    } else {
      setIsLight(document.body.classList.contains("LigthVersion"));
    }

    const updateTheme = () => {
      setIsLight(document.body.classList.contains("LigthVersion"));
    };

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleThemeToggle = () => {
    const nextIsLight = !isLight;
    setIsLight(nextIsLight);
    if (nextIsLight) {
      document.body.classList.add("LigthVersion");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("LigthVersion");
      localStorage.setItem("theme", "dark");
    }
    window.dispatchEvent(
      new CustomEvent("theme-change", { detail: { isLight: nextIsLight } })
    );
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("user");
    setUser(null);

    window.dispatchEvent(
      new CustomEvent("user-auth-change", { detail: null })
    );

    toast.success("Signed out successfully");
  };

  return (
    <header className={styles.shell}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <nav className={styles.nav}>
        <Link href="/viewService" className={styles.brandLink}>
          <div className={styles.brand}>
            <div className={styles.logoContainer}>
              <img
                src={isLight ? "/logo-dark.png" : "/logo-white.png"}
                alt="Q-Find"
                className={styles.brandLogoImg}
              />
            </div>
            <span className={styles.brandTag}>Services near you</span>
          </div>
        </Link>

        <div className={styles.authContainer}>
          {/* Dark / Light Theme Toggle Pill Switch */}
          <label
            className="theme-switch"
            aria-label="Toggle theme"
            title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            <input
              type="checkbox"
              checked={!isLight}
              onChange={handleThemeToggle}
            />
            <div className="switch-slider">
              <i className="fa-solid fa-sun icon-sun"></i>
              <i className="fa-solid fa-moon icon-moon"></i>
              <span className="switch-thumb"></span>
            </div>
          </label>

          {user && (
            <div className={styles.userInfo}>
              <img
                src={user.picture}
                alt={user.name}
                className={styles.avatar}
              />
              <span className={styles.userName}>
                {user.name.split(" ")[0]}
              </span>
              <button
                className={styles.logoutBtn}
                onClick={handleLogout}
                title="Sign out"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span className={styles.logoutText}>Sign out</span>
              </button>
              <button
                type="button"
                className={styles.hamburgerBtn}
                onClick={() => window.dispatchEvent(new CustomEvent("open-mobile-drawer"))}
                aria-label="Open menu"
                title="Open menu"
              >
                <i className="fa-solid fa-bars"></i>
              </button>
            </div>
          )}

          {!user && (
            <button
              type="button"
              className={styles.hamburgerBtnGuest}
              onClick={() => window.dispatchEvent(new CustomEvent("open-mobile-drawer"))}
              aria-label="Open menu"
              title="Open menu"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
