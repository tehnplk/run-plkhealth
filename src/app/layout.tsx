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
  title: "เดิน วิ่ง ปั่น ป้องกันอัมพาต ครั้งที่ 11 | จังหวัดพิษณุโลก",
  description: "สรุปจำนวนผู้สมัคร เดิน วิ่ง ปั่น ป้องกันอัมพาต ครั้งที่ 11 จังหวัดพิษณุโลก",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={posterFont.variable}>
      <body>{children}</body>
    </html>
  );
}
