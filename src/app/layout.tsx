import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const posterFont = Noto_Sans_Thai({
  variable: "--font-poster",
  subsets: ["thai", "latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Walk Run Bike 12th",
  description: "Walk Run Bike 12th",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={posterFont.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
