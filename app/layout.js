"use client";
import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/nav";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = ["/", "/login", "/register"].includes(pathname); 

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Nav />
          
          {!isAuthPage && <Sidebar />} {/* Sidebar visible only on authenticated pages */}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
