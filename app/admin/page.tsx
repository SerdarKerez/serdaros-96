/* /admin — server gate (requireAdmin) + fresh site data, then the client editor. */
import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSiteDataForAdmin } from "@/lib/site-data/server";
import AdminApp from "@/components/admin/AdminApp";
import { AdminLoading } from "@/components/admin/LoginForm";

async function Editor() {
  await connection(); // always per-request (session), never prerendered
  const user = await requireAdmin();
  const { data, storedKeys, error } = await getSiteDataForAdmin();
  return <AdminApp initial={data} storedKeys={storedKeys} email={user.email ?? ""} loadError={error} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Editor />
    </Suspense>
  );
}
