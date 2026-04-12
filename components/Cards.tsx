import type { ServiceCardItem } from "@/lib/services/businesses";
import "./viewServices.css";

type CardsProps = {
  services: ServiceCardItem[];
  showTitle?: boolean;
};

function getPhoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

function getInstagramHandle(handle: string) {
  return handle.replace("@", "");
}

export default function ServicesCards({
  services,
  showTitle = false,
}: CardsProps) {
  return (
    <section className="services-section mb-5">
      {showTitle ? <h2 className="section-title mb-4">OUR SERVICES</h2> : null}

      {services.length ? (
        <div className="row g-3">
          {services.map((service) => {
            const phoneDigits = getPhoneDigits(service.contact);
            const instagramHandle = getInstagramHandle(service.instagram);

            return (
              <div key={service.slug} className="service-col">
                <div className="service-card-shell">
                  <div className="service-card">
                    <div
                      className="service-image"
                      style={{ backgroundImage: `url("${service.image}")` }}
                    />

                    <div className="service-overlay">
                      <h5>{service.name}</h5>
                    </div>
                  </div>

                  <div className="service-drawer">
                    <div className="service-address-row">
                      <p className="service-meta service-address-text">
                        {service.address}
                      </p>

                      <a
                        aria-label={`Open ${service.name} location in Google Maps`}
                        className="service-action"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          service.address
                        )}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 21C12 21 18 15.6 18 10.2C18 6.78 15.31 4 12 4C8.69 4 6 6.78 6 10.2C6 15.6 12 21 12 21Z"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M12 12.9C13.4912 12.9 14.7 11.6912 14.7 10.2C14.7 8.70883 13.4912 7.5 12 7.5C10.5088 7.5 9.3 8.70883 9.3 10.2C9.3 11.6912 10.5088 12.9 12 12.9Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                        </svg>
                      </a>
                    </div>

                    <div className="service-contact-row">
                      <p className="service-meta service-contact-text">
                        {service.contact}
                      </p>

                      <div className="service-contact-actions">
                        <a
                          aria-label={`Open ${service.name} WhatsApp`}
                          className="service-action"
                          href={`https://wa.me/${phoneDigits}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 11.5C20 16.1944 16.1944 20 11.5 20C10.0278 20 8.64292 19.6254 7.43678 18.9681L4 20L5.07979 16.7206C4.3903 15.4784 4 14.0485 4 12.5278C4 7.83338 7.80558 4.0278 12.5 4.0278C17.1944 4.0278 21 7.83338 21 12.5278"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M9.03865 8.89166C8.74344 8.56505 8.25566 8.55366 7.94653 8.85958C7.41847 9.38224 6.97195 10.2368 7.24943 11.2176C7.73334 12.928 9.18563 14.9788 11.6467 16.0602C12.8484 16.5882 13.7566 16.4679 14.4286 16.1168C14.8217 15.9115 14.9025 15.3942 14.6648 15.0199L14.1709 14.2421C13.9566 13.9048 13.5186 13.7856 13.1604 13.9625L12.6191 14.2299C12.2871 14.3939 11.8904 14.3013 11.6655 14.0127L10.4926 12.5077C10.2914 12.2495 10.3045 11.8832 10.5242 11.6402L10.8803 11.2464C11.1392 10.9602 11.1646 10.5315 10.9418 10.2168L9.03865 8.89166Z"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>

                    <div className="service-instagram-row">
                      <a
                        className="service-link"
                        href={`https://instagram.com/${instagramHandle}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {service.instagram}
                      </a>

                      <a
                        aria-label={`Open ${service.name} Instagram`}
                        className="service-action"
                        href={`https://instagram.com/${instagramHandle}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="4.5"
                            y="4.5"
                            width="15"
                            height="15"
                            rx="4"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                          <circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
