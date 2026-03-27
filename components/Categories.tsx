const categories = ["Gastronomía", "Salud", "Belleza", "Hogar"];

export default function Categories() {
  return (
    <section className="mb-5">
      <h2 className="mb-4">Categorías</h2>

      <div className="row g-3">
        {categories.map((cat, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="card p-4 text-center h-100">
              {cat}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}