import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gårdsbutikk",
  description: "Ferske varer fra gården – se hva som er til salgs og reserver",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
