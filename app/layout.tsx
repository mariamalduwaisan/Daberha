import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "دبرها – مساعد المقابلات الوظيفية",
  description: "استعد لمقابلتك في القطاع المصرفي بذكاء",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} antialiased bg-neutral`}>
        <div className="max-w-[430px] mx-auto min-h-screen relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
