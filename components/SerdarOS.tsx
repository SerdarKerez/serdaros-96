"use client";
/* SerdarOS 96 — root client component. Renders a black screen until mounted (no SSR of the OS), then the
   desktop with the boot screen on top. */
import { useSyncExternalStore } from "react";
import Boot from "@/components/os/Boot";
import Desktop from "@/components/os/Desktop";
import { OSProvider, useOS, useWM } from "@/components/os/OSContext";
import { LangProvider } from "@/lib/i18n";
import { setSiteData } from "@/lib/site-data/store";
import type { SiteData } from "@/lib/site-data/types";

const noopSubscribe = () => () => {};

function BootLayer() {
  const { ready } = useOS();
  const { bootKey, finishBoot } = useWM();
  if (ready) return null;
  return <Boot key={bootKey} onDone={finishBoot} />;
}

export default function SerdarOS({ data }: { data?: SiteData }) {
  // Accessors (getContent, getPosts, …) read this module store; set it before any child renders.
  setSiteData(data);
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!mounted) return <div id="root" style={{ background: "#000" }} />;
  return (
    <div id="root">
      <LangProvider>
        <OSProvider>
          <Desktop />
          <BootLayer />
        </OSProvider>
      </LangProvider>
    </div>
  );
}
