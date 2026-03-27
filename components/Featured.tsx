const services = ["Restaurante X", "Peluquería Y", "Plomero Z"];

export default function Featured() {
  return (
    <section className="mb-5">
      <h2 className="mb-4">Destacados</h2>

      <div className="row g-3">
        {services.map((srv, i) => (
          <div key={i} className="col-12 col-md-4">
            <div className="card p-4 h-100">
              <h5 className="fw-bold mb-1">{srv}</h5>
              <small className="text-secondary">Descripción breve</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}