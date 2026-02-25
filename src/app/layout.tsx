import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "RealState - Encuentra tu próximo hogar",
    template: "%s | RealState",
  },
  description:
    "Plataforma de arrendamientos en Colombia. Encuentra apartamentos, casas y habitaciones en arriendo o publica tu propiedad.",
  keywords: [
    "arriendo",
    "alquiler",
    "apartamentos",
    "casas",
    "habitaciones",
    "Colombia",
    "arrendamiento",
    "inmuebles",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "RealState",
    title: "RealState - Encuentra tu próximo hogar",
    description:
      "Plataforma de arrendamientos en Colombia. Encuentra apartamentos, casas y habitaciones en arriendo.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
