"use client";

import { Trash2 } from "lucide-react";

export function DeleteVehicleButton() {
  return (
    <button
      type="submit"
      className="flex items-center justify-center h-9 w-9 rounded-lg border border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 shadow-sm transition-all"
      title="Delete"
      onClick={(e) => {
        if (!confirm("Are you sure you want to delete this vehicle?")) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
