import Navbar from "@/components/Navbar";
import Banner from "@/components/Banner";
import Cards from "@/components/Cards";
import Filters from "@/components/Filters";
import Description from "@/components/Description";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="container-service">
        <Banner />
        <Filters />
        <Cards />
      </div>
    </>
  );
}
