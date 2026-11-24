/* Admin shell: own stylesheet (no OS CSS), never indexed. */
import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "SerdarOS 96 · Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="adm-root">{children}</div>;
}
