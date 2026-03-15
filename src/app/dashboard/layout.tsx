import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getCHSUser } from "@/lib/auth";
import { getDefaultPeriod, getAvailablePeriods } from "@/lib/queries/ventas";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCHSUser();
  const { anio, mes } = await getDefaultPeriod();
  const availablePeriods = await getAvailablePeriods();

  return (
    <div className="flex min-h-screen bg-[var(--chs-bg)]">
      <Sidebar />
      <div className="ml-[232px] flex flex-1 flex-col">
        <Suspense fallback={
          <header className="flex h-16 items-center px-6" style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)" }}>
            <h1 className="text-lg font-semibold text-white">Cuadro de Dirección</h1>
          </header>
        }>
          <Header
            defaultAnio={anio}
            defaultMes={mes}
            availablePeriods={availablePeriods}
            userName={user?.name}
          />
        </Suspense>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
