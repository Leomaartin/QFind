"use client";
import styles from "./Navbar.module.css";


export default function Navbar() {

  return (
    <header className={styles.shell}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

      <nav className={styles.nav}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            QF
          </span>
          <span>
            <span className={styles.brandName}>QFind</span>
            <span className={styles.brandTag}>Services near you</span>
          </span>
        </div>
      </nav>
    </header>
  );
}