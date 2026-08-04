import type { ServiceCardItem } from "@/lib/services/businesses";
import "./viewServices.css";
import { useEffect, useMemo, useState } from "react";
import Popup from "@/components/Popup.tsx";

type CardsProps = {
  services: ServiceCardItem[];
  showTitle?: boolean;
};

export default function ServicesCards({
  services,
  showTitle = false,
}: CardsProps) {
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [servicesList, setServicesList] = useState<ServiceCardItem[]>(services);
  useEffect(() => {
    setServicesList(services);
  }, [services]);
  const handleEdit = async (id: number) => {
    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Error al obtener el servicio");
      }

      const service = await response.json();

      setSelectedService(service);
      setOpenPopup(true);

    } catch (error) {
      console.error(error);
    }
  };
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch("/api/crud", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el servicio");
      }

      setServicesList(prev =>
        prev.filter(service => service.id !== id)
      );

    } catch (error) {
      console.error(error);
    }
  };
  return (
    <section className="services-section mb-5">
      {showTitle ? <h2 className="section-title mb-4">OUR SERVICES</h2> : null}

      {services.length ? (
        <div className="services-grid">
          {servicesList.map((service, index) => {
            return (
              <div
                key={service.slug}
                className="service-card-item"
                style={{
                  animation: `fadeInCard 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                  animationDelay: `${index * 0.04}s`,
                  opacity: 0
                }}
              >
                <div className="service-card-compact">
                  {/* Image Container with Gradient */}
                  <div className="service-card-media">
                    <div
                      className="service-card-img"
                      style={{ backgroundImage: `url("${service.image}")` }}
                    />
                    <div className="service-card-gradient" />
                  </div>

                  {/* Card Main Info */}
                  <div className="service-card-body">
                    <button className="btn btn-danger" onClick={() => handleDelete(service.slug)}>Delete</button>

                    <button className="btn btn-edit" onClick={() => handleEdit(service.slug)}>Edit</button>


                  </div>
                </div>

              </div>
            );
          })}
          {openPopup && (
            <Popup
              onClose={() => setOpenPopup(false)}
              categories={[]}
              cityOptions={[]}
              stateOptions={[]}
              countryOptions={[]}
              user={null}
              initialData={selectedService}
            />
          )}
        </div>
      ) : (
        <div className="services-empty-state">
          <h3>No services found for this combination</h3>
          <p>Try a different city, category, or subcategory.</p>
        </div>
      )}
    </section>
  );
}


