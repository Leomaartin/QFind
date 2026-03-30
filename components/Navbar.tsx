export default function Navbar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(12px)",
        background: "rgba(15, 15, 16, 0.6)",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}
      className="px-4 py-3"
    >
      <strong>QFind</strong>
    </nav>
  );
}