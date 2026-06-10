"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ListingRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  fuel: string;
  transmission: string;
  seats: number;
  price_per_day_aud: number;
  status: string;
  vendor_name: string;
  vendor_slug: string;
  vendor_status: string;
  branch_name: string;
  branch_city: string;
  branch_state: string;
  created_at: string;
  suspended_at: string | null;
}

interface AdminListingsTableProps {
  data: ListingRow[];
  statusFilter: string;
  moderateListing: (action: string, listingId: string, reason: string, reindex: boolean) => Promise<void>;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "approved": return "success" as const;
    case "pending": return "warning" as const;
    case "suspended": return "destructive" as const;
    default: return "outline" as const;
  }
};

export function AdminListingsTable({ data, statusFilter, moderateListing }: AdminListingsTableProps) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.vendor_name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.branch_city.toLowerCase().includes(q)
    );
  }, [data, search]);

  const columns: DataTableColumn<Record<string, unknown>>[] = [
    {
      key: "title",
      label: "Vehicle",
      sortable: true,
      render: (_val, row) => (
        <div>
          <div className="font-medium text-foreground">{row.title as string}</div>
          <div className="text-xs text-muted-foreground">
            {row.category as string} · {row.fuel as string} · {row.transmission as string}
          </div>
        </div>
      ),
    },
    {
      key: "price_per_day_aud",
      label: "Price/Day",
      sortable: true,
      render: (val) => <span className="font-medium">${val as number}</span>,
    },
    {
      key: "vendor_name",
      label: "Vendor",
      sortable: true,
      render: (_val, row) => (
        <div>
          <Link href={`/vendors/${row.vendor_slug}`} className="text-primary hover:underline text-sm">
            {row.vendor_name as string}
          </Link>
          <div className="mt-0.5">
            <Badge variant={statusBadgeVariant(row.vendor_status as string)} className="text-[10px]">
              {row.vendor_status as string}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: "branch_city",
      label: "Location",
      sortable: true,
      render: (_val, row) => (
        <span className="text-sm text-muted-foreground">
          {row.branch_name as string} · {row.branch_city as string}, {row.branch_state as string}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Submitted",
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
          {row.status === "pending" && (
            <>
              <form action={moderateListing.bind(null, "approve", row.id as string, "Approved from admin dashboard", true)}>
                <Button type="submit" size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Approve
                </Button>
              </form>
              <form action={moderateListing.bind(null, "reject", row.id as string, "Rejected from admin dashboard", false)}>
                <Button type="submit" size="sm" variant="destructive">
                  Reject
                </Button>
              </form>
            </>
          )}
          {row.status === "approved" && (
            <>
              <form action={moderateListing.bind(null, "suspend", row.id as string, "Suspended from admin dashboard", false)}>
                <Button type="submit" size="sm" variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-600 dark:hover:bg-amber-900/20">
                  Suspend
                </Button>
              </form>
              <Link href={`/cars/${row.slug}`} target="_blank">
                <Button variant="ghost" size="sm">View</Button>
              </Link>
            </>
          )}
          {(row.status === "suspended" || row.status === "rejected") && (
            <form action={moderateListing.bind(null, "restore", row.id as string, "Restored from admin dashboard", true)}>
              <Button type="submit" size="sm" variant="default">
                Restore
              </Button>
            </form>
          )}
          <Link href={`/admin/audit?type=vehicle&id=${row.id}`}>
            <Button variant="ghost" size="sm">Audit</Button>
          </Link>
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
          placeholder="Search by vehicle, vendor, category, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {filteredData.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No {statusFilter} listings found.</p>
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
