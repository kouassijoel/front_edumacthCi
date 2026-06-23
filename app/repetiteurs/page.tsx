import Footer from "../component/footer";
import Header from "../component/header";
import type { RepetiteurCard } from "@/lib/services/repetiteur.service";
import SearchSection from "../component/SearchSection";

async function fetchRepetiteurs(limit: number): Promise<{ resultats: RepetiteurCard[]; total: number }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1"}/repetiteurs?limit=${limit}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { resultats: [], total: 0 };
    const json = await res.json();
    const data = json.data as { total: number; resultats: RepetiteurCard[] } | RepetiteurCard[];
    if (Array.isArray(data)) return { resultats: data, total: data.length };
    return { resultats: data.resultats ?? [], total: data.total ?? 0 };
  } catch {
    return { resultats: [], total: 0 };
  }
}

export default async function RepetiteursPage() {
  const { resultats: initial, total: initialTotal } = await fetchRepetiteurs(12);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />
      <SearchSection initial={initial} initialTotal={initialTotal} />
      <Footer />
    </div>
  );
}
