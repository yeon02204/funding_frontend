/* ─────────────────────────────────────────
   App.jsx — RouterProvider 진입점
───────────────────────────────────────── */
import { RouterProvider } from "react-router-dom";
import router from "./router";

export default function App() {
  return <RouterProvider router={router} />;
}
