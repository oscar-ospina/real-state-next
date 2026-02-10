import { Header } from "@/components/layout/Header";

export default function RentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {children}
      </main>
    </div>
  );
}
