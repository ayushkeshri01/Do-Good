import { prisma } from "@/lib/prisma";
import { AdminSettingsContent } from "./admin-settings-content";

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await prisma.appSettings.findFirst();

  return (
    <AdminSettingsContent
      initialSettings={{
        allowedDomains: settings?.allowedDomains || [],
        dislikeThreshold: settings?.dislikeThreshold || 0.15,
      }}
    />
  );
}
