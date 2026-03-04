"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatorIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/creator/overview");
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
