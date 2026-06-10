"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface VendorRow {
  id: string;
  name: string;
  slug: string;
  abn: string;
  billing_email: string;
  phone: string;
  owner: string;
  branchCount: number;
  status: string;
  created_at: string;
  suspended_at: string | null;
}

interface AdminVendorsTableProps {
  data: VendorRow[];
  statusFilter: string;
  moderateVendor: (action: string, vendorId: string, reason: string) => Promise<void>;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "approved": return "success" as const;
    case "pending": return "warning" as const;
    case "suspended": return "destructive" as const;
    default: return "outline" as const;
  }
};

export function AdminVendorsTable({ data, statusFilter, moderateVendor }: AdminVendorsTableProps) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.abn.toLowerCase().includes(q) ||
        v.billing_email.toLowerCase().includes(q) ||
        v.owner.toLowerCase().includes(q)
    );
  }, [data, search]);

  const columns: DataTableColumn<Record<string, unknown>>[] = [
    {
      key: "name",
      label: "Vendor",
      sortable: true,
      render: (_val, row) => (
        <div>
          <div className="font-medium text-foreground">{row.name as string}</div>
          <div className="text-xs text-muted-foreground">ABN: {row.abn as string}</div>
        </div>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      sortable: true,
    },
    {
      key: "billing_email",
      label: "Email",
      sortable: true,
    },
    {
      key: "branchCount",
      label: "Branches",
      sortable: true,
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
      key: "id",
      label: "Actions",
      render: (_val, row) => (
        <div className="flex items-center gap-2">
          {row.status === "pending" && (
            <>
              <form action={moderateVendor.bind(null, "approve", row.id as string, "Approved from admin dashboard")}>
                <Button type="submit" size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Approve
                </Button>
              </form>
              <form action={moderateVendor.bind(null, "reject", row.id as string, "Rejected from admin dashboard")}>
                <Button type="submit" size="sm" variant="destructive">
                  Reject
                </Button>
              </form>
            </>
          )}
          {row.status === "approved" && (
            <form action={moderateVendor.bind(null, "suspend", row.id as string, "Suspended from admin dashboard")}>
              <Button type="submit" size="sm" variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-600 dark:hover:bg-amber-900/20">
                Suspend
              </Button>
            </form>
          )}
          {(row.status === "suspended" || row.status === "rejected") && (
            <form action={moderateVendor.bind(null, "restore", row.id as string, "Restored from admin dashboard")}>
              <Button type="submit" size="sm" variant="default">
                Restore
              </Button>
            </form>
          )}
          <Link href={`/admin/audit?type=vendor&id=${row.id}`}>
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
          placeholder="Search vendors by name, ABN, email, or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {filteredData.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No {statusFilter} vendors found.</p>
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
