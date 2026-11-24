/* Proje detay sayfaları. Her proje lib/projects/<slug>.ts içinde `export const details: ProjectDetails` olarak durur.
   Gövde blokları blog ile aynı modeli kullanır (lib/blog/types.ts). */
import type { Block } from "@/lib/blog/types";

export interface ProjectDetails {
  slug: string;              // lib/content.ts'teki projects[].slug ile aynı
  status: string;            // ör. "Geliştiriliyor", "Konsept", "Tamamlandı"
  role: string;              // ör. "Tek geliştirici", "Ekip üyesi"
  period: string;            // ör. "2025 – devam ediyor"
  cover: string;             // /projects/<slug>/cover.svg (1200x630)
  coverAlt: string;
  highlights: string[];      // 3-4 kısa madde, kartın başında gösterilir
  blocks: Block[];
}
