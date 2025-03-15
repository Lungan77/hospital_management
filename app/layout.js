import { Geist, Geist_Mono } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper"; // Move SessionProvider to a Client Component
import LayoutContent from "@/components/LayoutContent"
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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionWrapper>
          <LayoutContent>{children}</LayoutContent>
        </SessionWrapper>
      </body>
    </html>
  );
}
