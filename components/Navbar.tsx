import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.shell}>
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

        <div className={styles.aura} aria-hidden="true">
          <span className={styles.auraDot} />
          <span className={styles.auraLine} />
        </div>
      </nav>
    </header>
  );
}
