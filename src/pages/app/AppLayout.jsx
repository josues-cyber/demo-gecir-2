import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navigation />
      <main className="max-w-[1400px] mx-auto px-4 py-7">
        <Outlet />
      </main>
    </div>
  );
}
