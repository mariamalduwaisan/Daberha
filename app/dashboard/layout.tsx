import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <LanguageProvider>
      <div className="flex min-h-screen bg-neutral">
        <SideNav />
        <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 md:mr-64">
          {children}
        </div>
        <BottomNav />
      </div>
    </LanguageProvider>
  );
}
