import "./viewServices.css";

type Service = {
  name: string;
  description: string;
  image: string;
};

type CardsProps = {
  showTitle?: boolean;
};

const services: Service[] = [
  {
    name: "Restaurante X",
    description: "Comida premium",
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1",
  },
  {
    name: "Peluqueria Y",
    description: "Estilo profesional",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e",
  },
  {
    name: "Plomero Z",
    description: "Servicio rapido",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
  },
  {
    name: "Electricista Pro",
    description: "Instalaciones seguras",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc",
  },
  {
    name: "Electricista Pro",
    description: "Instalaciones seguras",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc",
  },
  {
    name: "Electricista Pro",
    description: "Instalaciones seguras",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc",
  },
  {
    name: "Electricista Pro",
    description: "Instalaciones seguras",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc",
  },
  {
    name: "Electricista Pro",
    description: "Instalaciones seguras",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc",
  },
  {
    name: "Electricista Pro",
    description: "Instalaciones seguras",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc",
  },
  {
    name: "Electricista Pro",
    description: "Instalaciones seguras",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc",
  },
  {
    name: "Electricista Pro",
    description: "Instalaciones seguras",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc",
  },
  {
    name: "Electricista Pro",
    description: "Instalaciones seguras",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc",
  },
];

export default function ServicesCards({ showTitle = false }: CardsProps) {
  return (
    <section className="services-section mb-5">
      {showTitle ? <h2 className="section-title mb-4">OUR SERVICES</h2> : null}

      <div className="row g-3">
        {services.map((srv, i) => (
          <div key={i} className="service-col">
            <div className="service-card">
              <div className="service-image" />

              <div className="service-overlay">
                <h5>{srv.name}</h5>
                <small>{srv.description}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
