/* Current site data for the client OS. Server passes fresh data as a prop to <SerdarOS>, which calls
   setSiteData() before rendering; accessors (getContent, getPosts, projectDetails, label) read it. */
import type { SiteData } from "./types";
import { DEFAULT_SITE_DATA } from "./defaults";

let current: SiteData = DEFAULT_SITE_DATA;

export function setSiteData(data: SiteData | null | undefined): void {
  current = data ?? DEFAULT_SITE_DATA;
}

export function siteData(): SiteData {
  return current;
}
