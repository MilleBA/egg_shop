import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gårdsegg",
  description: "Ferske egg til salgs – se hvor mange som er tilgjengelig i dag",
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
