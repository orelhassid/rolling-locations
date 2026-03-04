"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Clock, CheckCircle, DollarSign } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCreatorStore } from "@/stores/creator-store";
import type { BookingStatus } from "@/types";

function formatCurrency(amount: number) {
  return `₪${amount.toLocaleString("he-IL")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
  });
}

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  requested: "default",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

export default function CreatorOverviewPage() {
  const t = useTranslations("creator");
  const creatorBookings = useCreatorStore((s) => s.getCreatorBookings());

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7937/ingest/46418d2a-1ca7-40ce-acd2-210424890731", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "706b3d" },
      body: JSON.stringify({
        sessionId: "706b3d",
        location: "creator/overview/page.tsx",
        message: "Creator overview mounted",
        data: { bookingsCount: creatorBookings.length },
        timestamp: Date.now(),
        hypothesisId: "H3",
      }),
    }).catch(() => {});
  }, [creatorBookings.length]);
  // #endregion
  const locations = useCreatorStore((s) => s.locations);

  const activeBookings = creatorBookings.filter(
    (r) => r.status === "approved"
  ).length;
  const pendingRequests = creatorBookings.filter(
    (r) => r.status === "requested"
  ).length;
  const completedBookings = creatorBookings.filter(
    (r) => r.status === "approved" && new Date(r.end) < new Date()
  ).length;
  const totalSpent = creatorBookings
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.priceEstimate, 0);

  const kpis = [
    { label: t("overview.activeBookings"), value: activeBookings, icon: BookOpen },
    { label: t("overview.pendingRequests"), value: pendingRequests, icon: Clock },
    { label: t("overview.completedBookings"), value: completedBookings, icon: CheckCircle },
    { label: t("overview.totalSpent"), value: formatCurrency(totalSpent), icon: DollarSign },
  ];

  const recentBookings = [...creatorBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("overview.title")}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">
                {kpi.label}
              </CardDescription>
              <kpi.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("overview.recentBookings")}</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/creator/bookings">{t("overview.viewAll")}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("overview.noBookings")}
            </p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => {
                const location = locations.find(
                  (l) => l.id === booking.locationId
                );
                return (
                  <Link
                    key={booking.id}
                    href={`/creator/bookings/${booking.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        {location?.title ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(booking.start)} · {formatCurrency(booking.priceEstimate)}
                      </span>
                    </div>
                    <Badge variant={statusVariant[booking.status]}>
                      {t(`bookings.status.${booking.status}` as "bookings.status.requested")}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
