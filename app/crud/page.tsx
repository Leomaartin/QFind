import Navbar from "@/components/Navbar";
import Crud from "@/components/CrudServicies";
import AdminGuard from "@/components/AdminGuard";

export default function Home() {
  return (
    <>
      <Navbar />
      <AdminGuard>
        <Crud />
      </AdminGuard>
    </>
  );
}
