import ServiceFinder from "@/components/ServiceFinder";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.shell}>
        <div className={styles.panel}>
          <img src="/home.png" alt="home" className={styles.image} />

          <div className={styles.overlay} />

          <div className={`container text-center ${styles.content}`}>
            <h1 className={`fw-bold mb-3 ${styles.title}`}>
              Find services
              <br />
              in your city
            </h1>

            <p className={`mb-4 ${styles.subtitle}`}>
              Everything in one place
            </p>

            <div id="buscar" className={styles.finder}>
              <ServiceFinder />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
