import Navbar from "@/components/Navbar";
import Aprove from "@/components/Aprove";
import AdminGuard from "@/components/AdminGuard";

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <AdminGuard>
        <Aprove />
      </AdminGuard>
    </>
  );
}
