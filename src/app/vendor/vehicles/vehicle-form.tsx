"use client";

import { useState } from "react";
import { createVehicle, updateVehicle, deleteVehicle } from "./actions";
import { uploadVehicleImage, deleteVehicleImage, reorderVehicleImages } from "./image-actions";

interface VehicleFormProps {
  organizationId: string;
  branches: Array<{
    id: string;
    name: string;
    city: string;
  }>;
  isAtLimit: boolean;
  editVehicle: {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    seats: number;
    fuel: string;
    transmission: string;
    category: string;
    price_per_day_aud: number;
    branch_id: string;
    status: string;
  } | null;
  editImages: Array<{
    id: string;
    storage_path: string;
    alt_text: string;
    sort_order: number;
    approved: boolean;
    url: string | null;
  }>;
}

const categories = ["Sedan", "SUV", "People mover", "Van", "Ute", "Luxury"];
const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];
const transmissions = ["Automatic", "Manual"];

export default function VehicleForm({
  organizationId,
  branches,
  isAtLimit,
  editVehicle,
  editImages,
}: VehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);

    formData.append("organizationId", organizationId);

    try {
      const result = editVehicle
        ? await updateVehicle(formData)
        : await createVehicle(formData);

      if (result.success) {
        setMessage({
          type: "success",
          text: editVehicle ? "Vehicle updated successfully!" : "Vehicle created successfully!",
        });
        if (!editVehicle) {
          // Reset form on create
          const form = document.getElementById("vehicle-form") as HTMLFormElement;
          form?.reset();
        }
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleImageUpload(formData: FormData) {
    if (!editVehicle) return;

    setUploadingImage(true);
    setMessage(null);

    try {
      const result = await uploadVehicleImage(formData);

      if (result.success) {
        setMessage({ type: "success", text: "Image uploaded successfully! Awaiting admin approval." });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Image upload failed" });
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!editVehicle || !confirm("Delete this image?")) return;

    const formData = new FormData();
    formData.append("imageId", imageId);
    formData.append("organizationId", organizationId);

    const result = await deleteVehicleImage(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Image deleted" });
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        {editVehicle ? "Edit Vehicle" : "Add New Vehicle"}
      </h2>

      {message && (
        <div
          className={`mt-4 rounded-md p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {isAtLimit && !editVehicle && (
        <div className="mt-4 rounded-md bg-amber-50 p-4 text-amber-800">
          You have reached your vehicle limit. Upgrade your plan to add more vehicles.
        </div>
      )}

      <form id="vehicle-form" action={handleSubmit} className="mt-6 space-y-4">
        {editVehicle && <input type="hidden" name="vehicleId" value={editVehicle.id} />}

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Title
            <input
              name="title"
              defaultValue={editVehicle?.title || ""}
              required
              maxLength={140}
              placeholder="e.g., 2023 Toyota Camry Hybrid"
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Make
            <input
              name="make"
              defaultValue={editVehicle?.make || ""}
              required
              maxLength={80}
              placeholder="e.g., Toyota"
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Model
            <input
              name="model"
              defaultValue={editVehicle?.model || ""}
              required
              maxLength={80}
              placeholder="e.g., Camry"
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Year
            <input
              name="year"
              type="number"
              defaultValue={editVehicle?.year || new Date().getFullYear()}
              required
              min={1990}
              max={2030}
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Seats
            <input
              name="seats"
              type="number"
              defaultValue={editVehicle?.seats || 5}
              required
              min={2}
              max={12}
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Daily Price (AUD)
            <input
              name="pricePerDayAud"
              type="number"
              defaultValue={editVehicle?.price_per_day_aud || ""}
              required
              min={20}
              max={2000}
              placeholder="e.g., 75"
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Fuel Type
            <select
              name="fuel"
              defaultValue={editVehicle?.fuel || "Petrol"}
              required
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            >
              {fuelTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Transmission
            <select
              name="transmission"
              defaultValue={editVehicle?.transmission || "Automatic"}
              required
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            >
              {transmissions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Category
            <select
              name="category"
              defaultValue={editVehicle?.category || "Sedan"}
              required
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Branch
          <select
            name="branchId"
            defaultValue={editVehicle?.branch_id || ""}
            required
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
          >
            <option value="">Select a branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.city})
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || (isAtLimit && !editVehicle)}
            className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400"
          >
            {isSubmitting
              ? editVehicle
                ? "Updating..."
                : "Saving..."
              : editVehicle
                ? "Update Vehicle"
                : "Save as Pending Listing"}
          </button>

          {editVehicle && (
            <a
              href={`/vendor/vehicles?org=${organizationId}`}
              className="rounded-md border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50"
            >
              Cancel Edit
            </a>
          )}
        </div>
      </form>

      {/* Image Upload Section (Edit Mode Only) */}
      {editVehicle && (
        <div className="mt-8 border-t border-slate-200 pt-8">
          <h3 className="text-lg font-semibold">Vehicle Images</h3>
          <p className="mt-1 text-sm text-slate-600">
            Upload up to 10 images. Images require admin approval before appearing in search.
          </p>

          {/* Existing Images */}
          {editImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {editImages.map((img) => (
                <div key={img.id} className="relative">
                  {img.url ? (
                    <img
                      src={img.url}
                      alt={img.alt_text || "Vehicle image"}
                      className="aspect-square rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-lg bg-slate-100">
                      <span className="text-slate-400">Image</span>
                    </div>
                  )}
                  <div className="absolute right-2 top-2 flex gap-1">
                    {!img.approved && (
                      <span className="rounded-full bg-amber-500 px-2 py-1 text-xs text-white">
                        Pending
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      title="Delete image"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Form */}
          <form
            action={handleImageUpload}
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <input type="hidden" name="vehicleId" value={editVehicle.id} />
            <input type="hidden" name="organizationId" value={organizationId} />

            <label className="flex-1">
              <span className="text-sm font-medium text-slate-700">Image File</span>
              <input
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp"
                required
                className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-slate-800"
              />
            </label>

            <label className="flex-1">
              <span className="text-sm font-medium text-slate-700">Alt Text (Optional)</span>
              <input
                type="text"
                name="altText"
                maxLength={200}
                placeholder="Describe the image for accessibility"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <button
              type="submit"
              disabled={uploadingImage || editImages.length >= 10}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400"
            >
              {uploadingImage ? "Uploading..." : "Upload Image"}
            </button>
          </form>

          {editImages.length >= 10 && (
            <p className="mt-2 text-sm text-amber-600">
              Maximum 10 images per vehicle reached. Delete existing images to upload new ones.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
