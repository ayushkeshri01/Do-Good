import { prisma } from "@/lib/prisma";
import { AdminSettingsContent } from "./admin-settings-content";

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
