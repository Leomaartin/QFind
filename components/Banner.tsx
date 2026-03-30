import "./viewServices.css";
export default function Banner() {
  return (
    <section
      className="banner-section mb-5 d-flex align-items-end"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c')",
      }}
    >
      <div className="p-4">
        <h1 className="banner-title">GLASSHAVEN</h1>

        <p className="banner-sub">
          A NEW STANDARD <br /> OF MODERN LIVING
        </p>
      </div>
    </section>
  );
}
