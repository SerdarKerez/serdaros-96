/* Built-in content: seed data for Supabase and fallback when the database is empty or unreachable. */
import type { SiteData } from "./types";
import { CONTENT } from "@/lib/content";
import { CONTENT_EN } from "@/lib/content.en";
import { DEFAULT_LABELS } from "./default-labels";
import { post as progressiveOverload } from "@/lib/blog/progressive-overload";
import { post as dataEngineeringAi } from "@/lib/blog/data-engineering-ai";
import { post as rawDnaMapping } from "@/lib/blog/raw-dna-mapping";
import { post as progressiveOverloadEn } from "@/lib/blog/progressive-overload.en";
import { post as dataEngineeringAiEn } from "@/lib/blog/data-engineering-ai.en";
import { post as rawDnaMappingEn } from "@/lib/blog/raw-dna-mapping.en";
import { details as anketPortali } from "@/lib/projects/anket-portali";
import { details as genomikCrm } from "@/lib/projects/genomik-crm";
import { details as veriBilimi } from "@/lib/projects/veri-bilimi";
import { details as anketPortaliEn } from "@/lib/projects/anket-portali.en";
import { details as genomikCrmEn } from "@/lib/projects/genomik-crm.en";
import { details as veriBilimiEn } from "@/lib/projects/veri-bilimi.en";

export const DEFAULT_SITE_DATA: SiteData = {
  content: { tr: CONTENT, en: CONTENT_EN },
  labels: DEFAULT_LABELS,
  blog: {
    tr: [progressiveOverload, dataEngineeringAi, rawDnaMapping],
    en: [progressiveOverloadEn, dataEngineeringAiEn, rawDnaMappingEn],
  },
  projects: {
    tr: [anketPortali, genomikCrm, veriBilimi],
    en: [anketPortaliEn, genomikCrmEn, veriBilimiEn],
  },
};
