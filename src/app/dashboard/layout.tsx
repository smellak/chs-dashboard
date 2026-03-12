import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getCHSUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCHSUser();

  // Default period - in production this would come from URL params or user preference
  const anio = 2025;
  const mes = 7;

  return (
    <div className="flex min-h-screen bg-[var(--chs-bg)]">
      <Sidebar />
      <div className="ml-[232px] flex flex-1 flex-col">
        <Header anio={anio} mes={mes} userName={user?.name} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
