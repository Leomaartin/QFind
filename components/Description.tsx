import "./viewServices.css";
type Feature = {
  name: string;
  size: string;
};

const features: Feature[] = [
  { name: "Living Room", size: "31 m²" },
  { name: "Dining Room", size: "12 m²" },
  { name: "Kitchen", size: "9 m²" },
  { name: "Master Bedroom", size: "15 m²" },
  { name: "Bathroom", size: "8 m²" },
];

export default function Description() {
  return (
    <section className="description-section p-4 mb-5">
      <div className="row align-items-center">
        <div className="col-md-6">
          <h2 className="section-title mb-3">HOUSE PLAN</h2>

          <p className="text-secondary mb-4">THE AREA IS 92 M²</p>

          {features.map((f, i) => (
            <div
              key={i}
              className="d-flex justify-content-between border-bottom py-2"
            >
              <span className="text-light">{f.name}</span>
              <span className="text-secondary">{f.size}</span>
            </div>
          ))}
        </div>

        <div className="col-md-6">
          <div className="plan-image" />
        </div>
      </div>
    </section>
  );
}
