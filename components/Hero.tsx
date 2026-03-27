export default function Hero() {
  return (
    <section className="py-5 text-center">
      <h1 className="fw-bold mb-3" style={{ lineHeight: "1.2" }}>
        Encuentra servicios
        <br />
        en tu ciudad
      </h1>

      <p className="text-secondary mb-4">
        Todo en un solo lugar
      </p>

      <div className="d-flex justify-content-center">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar servicios..."
          style={{
            maxWidth: "420px",
            padding: "14px",
            borderRadius: "12px"
          }}
        />
      </div>
    </section>
  );
}