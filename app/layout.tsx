import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
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
      <head>
        {/* Prevent flash of wrong theme — runs before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('daberha-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${cairo.variable} ${tajawal.variable} antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
