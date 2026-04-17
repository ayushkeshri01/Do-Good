"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Settings {
  allowedDomains: string[];
  dislikeThreshold: number;
}

interface AdminSettingsContentProps {
  initialSettings: Settings;
}

export function AdminSettingsContent({
  initialSettings,
}: AdminSettingsContentProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [newDomain, setNewDomain] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // The first domain in the list is the admin's original domain and cannot be removed
  const baseDomain = initialSettings.allowedDomains[0];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        router.refresh();
        alert("Settings saved!");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const addDomain = () => {
    if (newDomain && !settings.allowedDomains.includes(newDomain)) {
      setSettings(s => ({
         ...s,
         allowedDomains: [...s.allowedDomains, newDomain]
      }));
      setNewDomain("");
    }
  };

  const removeDomain = (domain: string) => {
    if (domain === baseDomain) return; // Prevent removing base domain
    setSettings(s => ({
       ...s,
       allowedDomains: s.allowedDomains.filter(d => d !== domain)
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>App Configuration</CardTitle>
          <CardDescription>Manage your community settings and domains here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Allowed Email Domains</Label>
            <div className="flex gap-2">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                onKeyDown={(e) => e.key === "Enter" && addDomain()}
              />
              <Button onClick={addDomain} type="button" variant="secondary"><Plus className="h-4 w-4 mr-2" /> Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
               {settings.allowedDomains.map(domain => (
                  <div key={domain} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm">
                     <span>{domain}</span>
                     {domain !== baseDomain && (
                       <button onClick={() => removeDomain(domain)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <X className="h-3.5 w-3.5" />
                       </button>
                     )}
                     {domain === baseDomain && (
                       <span className="text-[10px] uppercase tracking-wider opacity-70 ml-1">(Admin)</span>
                     )}
                  </div>
               ))}
               {settings.allowedDomains.length === 0 && (
                  <p className="text-sm text-muted-foreground">No domains added yet. Adding one will restrict logins to that domain.</p>
               )}
            </div>

            <p className="text-xs text-muted-foreground">
              Users must log in with an email from one of these domains. The primary admin domain cannot be removed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Dislike Threshold (%)</Label>
            <Input
              id="threshold"
              type="number"
              min="0"
              max="100"
              value={settings.dislikeThreshold * 100}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  dislikeThreshold: parseFloat(e.target.value) / 100,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Percentage of dislikes required to auto-hide a post (default: 15%)
            </p>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
