/* ─────────────────────────────────────────
   components/layout/Layout.jsx
   Header + <Outlet> + Footer 를 감싸는 공통 레이아웃
───────────────────────────────────────── */
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../../context/AuthContext";

export default function Layout() {
  const { loading } = useAuth();

  if (loading) return <div style={{ minHeight: "100vh" }} />;

  return (
    <>
      <ScrollRestoration />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
