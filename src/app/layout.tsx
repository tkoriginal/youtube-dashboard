import type { Metadata } from "next";
import "./globals.css";
import { Inter } from '@next/font/google'

const inter = Inter({
  weight: ['400', '500', '700'], // choose the weights you need
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

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
    <html lang="en" className={inter.variable}>
      <body className="h-screen">{children}</body>
    </html>
  );
}
