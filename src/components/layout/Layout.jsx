/* ─────────────────────────────────────────
   components/layout/Layout.jsx
   Header + <Outlet> + Footer 를 감싸는 공통 레이아웃
───────────────────────────────────────── */
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
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
