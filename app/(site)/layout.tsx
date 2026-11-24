/* Public site (SerdarOS 96). OS stylesheets only load on these routes, not in /admin. */
import "@/styles/os.css";
import "@/styles/apps-content.css";
import "@/styles/apps-games.css";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return children;
}
