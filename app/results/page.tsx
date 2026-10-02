type ResultsPageProps = {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    city?: string;
  }>;
};

export default async function ResultsPage({
  searchParams,
}: ResultsPageProps) {
  const params = await searchParams;

  const category = params.category ?? "";
  const subcategory = params.subcategory ?? "";
  const city = params.city ?? "";

  return (
    <main className="container py-5 text-white">
      <h1 className="mb-4">Results</h1>

      <div
        className="card p-4"
        style={{
          background: "#162422",
          borderRadius: "18px",
          border: "1px solid rgba(45, 212, 191, 0.15)",
        }}
      >
        <p>
          <strong>Category:</strong> {category}
        </p>
        <p>
          <strong>Subcategory:</strong> {subcategory}
        </p>
        <p>
          <strong>City:</strong> {city}
        </p>
      </div>
    </main>
  );
}
