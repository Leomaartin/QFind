import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Featured from "@/components/Featured";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="container py-4">
        <Hero />
        <Categories />
        <Featured />
      </div>
    </>
  );
}