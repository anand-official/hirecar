"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface FraudRow {
  id: string;
  resource_type: string;
  resource_id: string;
  severity: string;
  reason: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  vendor_name: string;
  vehicle_title: string;
  vendor_id: string | null;
  reviewer: string | null;
}

interface AdminFraudTableProps {
  data: FraudRow[];
  updateFraudFlagStatus: (action: "close" | "reopen", flagId: string) => Promise<void>;
}

const severityBadgeVariant = (severity: string) => {
  switch (severity) {
    case "critical": return "destructive" as const;
    case "high": return "warning" as const;
    case "medium": return "warning" as const;
    default: return "outline" as const;
  }
};

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "open": return "destructive" as const;
    case "reviewing": return "warning" as const;
    case "closed": return "success" as const;
    default: return "outline" as const;
  }
};

export function AdminFraudTable({ data, updateFraudFlagStatus }: AdminFraudTableProps) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (f) =>
        f.reason.toLowerCase().includes(q) ||
        f.vendor_name.toLowerCase().includes(q) ||
        f.resource_type.toLowerCase().includes(q) ||
        f.severity.toLowerCase().includes(q)
    );
  }, [data, search]);

  const columns: DataTableColumn<Record<string, unknown>>[] = [
    {
      key: "severity",
      label: "Severity",
      sortable: true,
      render: (val) => (
        <Badge variant={severityBadgeVariant(val as string)}>
          {val as string}
        </Badge>
      ),
    },
    {
      key: "resource_type",
      label: "Type",
      sortable: true,
      render: (val) => (
        <Badge variant="outline" className="capitalize">
          {(val as string).replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="text-sm text-foreground">{val as string}</p>
          {(row.vendor_name as string) !== "Unknown" && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Vendor: {row.vendor_name as string}
              {row.vehicle_title ? ` · Vehicle: ${row.vehicle_title as string}` : null}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val) => (
        <Badge variant={statusBadgeVariant(val as string)}>
          {val as string}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (val) => (
        <span className="text-sm text-muted-foreground">
          {new Date(val as string).toLocaleDateString("en-AU")}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (_val, row) => (
        <div className="flex items-center gap-2">
          {row.status === "open" && (
            <>
              <form action={updateFraudFlagStatus.bind(null, "close", row.id as string)}>
                <Button type="submit" size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Close
                </Button>
              </form>
              <Link href={`/admin/audit?type=${row.resource_type}&id=${row.resource_id}`}>
                <Button variant="ghost" size="sm">Audit</Button>
              </Link>
            </>
          )}
          {row.status === "reviewing" && (
            <>
              <form action={updateFraudFlagStatus.bind(null, "close", row.id as string)}>
                <Button type="submit" size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Close
                </Button>
              </form>
              <form action={updateFraudFlagStatus.bind(null, "reopen", row.id as string)}>
                <Button type="submit" size="sm" variant="outline">
                  Reopen
                </Button>
              </form>
            </>
          )}
          {row.status === "closed" && (
            <span className="text-xs text-muted-foreground">
              {row.reviewer ? `By ${row.reviewer}` : "Closed"}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filter control */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by reason, vendor, type, or severity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {filteredData.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No fraud flags found.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData as unknown as Record<string, unknown>[]}
          pageSize={20}
          pageSizeOptions={[10, 20, 50]}
        />
      )}
    </div>
  );
}
