import SerdarOS from "@/components/SerdarOS";
import { getSiteData } from "@/lib/site-data/server";

export default async function Home() {
  const data = await getSiteData();
  return <SerdarOS data={data} />;
}
