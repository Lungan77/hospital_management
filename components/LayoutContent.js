"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Nav from "@/components/nav";

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isAuthPage = ["/", "/login", "/register"].includes(pathname);

  return (
    <div>
      <Nav />
      <div className={!isAuthPage ? "flex" : ""}>
        {!isAuthPage && <Sidebar />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
