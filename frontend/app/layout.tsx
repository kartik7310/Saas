import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { AuthModalProvider } from "@/lib/AuthModalContext";
import "leaflet/dist/leaflet.css";
import { Toaster } from "sonner";
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Link2Builder | Talk to Verified Builders & Find Your Dream Home",
  description: "Link2Builder helps you find verified properties, compare builders, and book site visits directly. Talk first, visit smart.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <AuthModalProvider>
            {children}
            <Toaster position="bottom-center" richColors />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}