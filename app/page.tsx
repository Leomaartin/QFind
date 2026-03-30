import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="container py-4">
        <Hero />
      </div>
    </>
  );
}
