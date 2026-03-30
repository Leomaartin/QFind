type ResultadosPageProps = {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    city?: string;
  }>;
};

export default async function ResultadosPage({
  searchParams,
}: ResultadosPageProps) {
  const params = await searchParams;

  const category = params.category ?? "";
  const subcategory = params.subcategory ?? "";
  const city = params.city ?? "";

  return (
    <main className="container py-5 text-white">
      <h1 className="mb-4">Resultados</h1>

      <div
        className="card p-4"
        style={{
          background: "#1D2526",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p>
          <strong>Categoría:</strong> {category}
        </p>
        <p>
          <strong>Subcategoría:</strong> {subcategory}
        </p>
        <p>
          <strong>Ciudad:</strong> {city}
        </p>
      </div>
    </main>
  );
}