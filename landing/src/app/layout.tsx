import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Endroll — A personal film journal",
  description: "Endroll is a calm, private place to log every film you watch, remember how it made you feel, and watch your taste reveal itself.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
