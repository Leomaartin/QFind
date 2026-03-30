import ServiceFinder from "@/components/ServiceFinder";

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1500px",
          borderRadius: "28px",
          outline: "2px solid rgba(253, 251, 251, 0.84)",
          outlineOffset: "4px",
        }}
      >
        <div
          style={{
            position: "relative",
            minHeight: "80vh",
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >
          <img
            src="/home.png"
            alt="home"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.85,
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, #0f0f10 20%, #1D2526 100%)",
              opacity: 0.15,
            }}
          />

          <div
            className="container text-center"
            style={{
              position: "relative",
              zIndex: 2,
              minHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h1 className="fw-bold mb-3" style={{ fontSize: "36px" }}>
              Encuentra servicios
              <br />
              en tu ciudad
            </h1>

            <p style={{ color: "#809BA6" }} className="mb-4">
              Todo en un solo lugar
            </p>

            <ServiceFinder />
          </div>
        </div>
      </div>
    </section>
  );
}