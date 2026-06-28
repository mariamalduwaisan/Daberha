import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "دبرها – مساعد المقابلات الوظيفية",
  description: "استعد لمقابلتك في القطاع المصرفي بذكاء",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${tajawal.variable} antialiased`}>
        <div className="max-w-[430px] mx-auto min-h-screen relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
