import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/auth";
import { upsertVehicleDocument } from "@/lib/search/typesense";

export async function POST() {
  await requireAdmin();

  const result = await upsertVehicleDocument({
    id: "healthcheck",
    title: "Search reindex healthcheck",
    status: "ok",
  });

  return NextResponse.json({ ok: true, ...result });
}
