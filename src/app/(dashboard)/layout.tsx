"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useSidebarConfig } from "@/hooks/use-sidebar-config";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { config } = useSidebarConfig();
  const user = useAuthStore((s) => s.user);
  const roleFromUser = user?.role as Exclude<UserRole, "guest"> | undefined;
  const roleFromPath =
    pathname?.startsWith("/creator")
      ? "creator"
      : pathname?.startsWith("/host")
        ? "host"
        : pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")
          ? "admin"
          : null;
  const role = (roleFromUser ?? roleFromPath ?? "admin") as Exclude<
    UserRole,
    "guest"
  >;

  // #region agent log
  React.useEffect(() => {
    if (pathname?.startsWith("/creator"))
      fetch("http://127.0.0.1:7937/ingest/46418d2a-1ca7-40ce-acd2-210424890731", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "706b3d" },
        body: JSON.stringify({
          sessionId: "706b3d",
          runId: "post-fix",
          location: "layout.tsx:DashboardLayout",
          message: "Creator route layout",
          data: { pathname, role, roleFromUser, roleFromPath, userId: user?.id ?? null },
          timestamp: Date.now(),
          hypothesisId: "H2",
        }),
      }).catch(() => {});
  }, [pathname, role, user?.id]);
  // #endregion

  return (
    <AuthGuard>
      <SidebarProvider
        style={{
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties}
        className={config.collapsible === "none" ? "sidebar-none-mode" : ""}
      >
        <AppSidebar
          role={role}
          variant={config.variant}
          collapsible={config.collapsible}
          // Hebrew (RTL) layout: sidebar must stay on the physical right
          side="right"
        />
        <SidebarInset className="min-w-0">
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {children}
              </div>
            </div>
          </div>
          <SiteFooter />
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
