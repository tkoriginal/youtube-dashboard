import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Youtube Dashboard",
  description: "Youtube Dashboard by Supademo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen">{children}</body>
    </html>
  );
}
