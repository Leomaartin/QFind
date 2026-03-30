import "./viewServices.css";

export default function Filters() {
  return (
    <section className="filters-section">
      <div className="filters-container">
        {/* Ciudad */}
        <div className="filter-group">
          <label>Ciudad</label>
          <select className="filter-select">
            <option>Todas</option>
            <option>Buenos Aires</option>
            <option>Córdoba</option>
            <option>Rosario</option>
          </select>
        </div>

        {/* Categoría */}
        <div className="filter-group">
          <label>Categoría</label>
          <select className="filter-select">
            <option>Todas</option>
            <option>Gastronomía</option>
            <option>Hogar</option>
            <option>Salud</option>
          </select>
        </div>

        {/* Subcategoría */}
        <div className="filter-group">
          <label>Subcategoría</label>
          <select className="filter-select">
            <option>Todas</option>
            <option>Restaurantes</option>
            <option>Peluquerías</option>
            <option>Electricistas</option>
          </select>
        </div>
      </div>
    </section>
  );
}
