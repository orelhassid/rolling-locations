"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCreatorStore } from "@/stores/creator-store";
import { mockUsers } from "@/mocks/users";
import type { BookingStatus } from "@/types";

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  requested: "default",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

const statusIcon: Record<BookingStatus, React.ElementType> = {
  requested: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle,
};

function formatFull(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CreatorBookingDetailPage() {
  const t = useTranslations("creator");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const booking = useCreatorStore((s) => s.getBookingById(params.id));

  // #region agent log
  React.useEffect(() => {
    fetch("http://127.0.0.1:7937/ingest/46418d2a-1ca7-40ce-acd2-210424890731", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "706b3d" },
      body: JSON.stringify({
        sessionId: "706b3d",
        location: "creator/bookings/[id]/page.tsx",
        message: "Creator booking detail mounted",
        data: { bookingId: params.id, found: !!booking },
        timestamp: Date.now(),
        hypothesisId: "H4",
      }),
    }).catch(() => {});
  }, [params.id, booking]);
  // #endregion
  const getLocationById = useCreatorStore((s) => s.getLocationById);
  const cancelBooking = useCreatorStore((s) => s.cancelBooking);

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">{t("bookings.noBookings")}</p>
      </div>
    );
  }

  const location = getLocationById(booking.locationId);
  const host = mockUsers.find((u) => u.id === location?.hostId);
  const StatusIcon = statusIcon[booking.status];
  const canCancel = booking.status === "requested" || booking.status === "approved";

  function handleCancel() {
    cancelBooking(params.id);
    router.push("/creator/bookings");
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/creator/bookings" className="hover:text-foreground">
          {t("bookings.title")}
        </Link>
        <ArrowRight className="size-3 rtl:rotate-180" />
        <span>{t("bookings.bookingDetails")}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("bookings.bookingDetails")}
          </h1>
          <Badge variant={statusVariant[booking.status]} className="gap-1">
            <StatusIcon className="size-3" />
            {t(`bookings.status.${booking.status}` as "bookings.status.requested")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("bookings.location")}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="size-16 overflow-hidden rounded-lg bg-muted">
                {location?.mediaGallery[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={location.mediaGallery[0].url}
                    alt={location.title}
                    className="size-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-medium">{location?.title ?? "—"}</p>
                <p className="text-sm text-muted-foreground">
                  {location?.address.city}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{t("bookings.host")}</p>
                <p className="font-medium">{host?.name ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{host?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("bookings.date")}</p>
                <p className="font-medium">{formatFull(booking.start)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("bookings.time")}</p>
                <p className="font-medium">
                  {formatTime(booking.start)} – {formatTime(booking.end)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("bookings.duration")}</p>
                <p className="font-medium">
                  {booking.durationHours} {t("bookings.hours")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("bookings.priceEstimate")}</p>
                <p className="text-lg font-bold">
                  ₪{booking.priceEstimate.toLocaleString("he-IL")}
                </p>
              </div>
              {booking.notes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">{t("bookings.notes")}</p>
                  <p className="text-sm">{booking.notes}</p>
                </div>
              )}
              {booking.hostNote && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">{t("bookings.hostNote")}</p>
                  <p className="text-sm">{booking.hostNote}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="me-2 size-4" />
                  {t("bookings.cancel")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("bookings.cancelConfirm")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("bookings.cancelDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("bookings.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>
                    {t("bookings.cancelConfirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t("bookings.timeline")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 size-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {t("bookings.status.requested")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(booking.createdAt)}
                  </p>
                </div>
              </div>
              {booking.status !== "requested" && (
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 size-2 rounded-full ${
                      booking.status === "approved"
                        ? "bg-green-500"
                        : booking.status === "rejected"
                          ? "bg-destructive"
                          : "bg-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {t(`bookings.status.${booking.status}` as "bookings.status.requested")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(booking.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
