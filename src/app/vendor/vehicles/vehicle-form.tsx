"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVehicle, updateVehicle } from "./actions";
import { uploadVehicleImage, deleteVehicleImage } from "./image-actions";

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
    daily_distance_limit_km?: number | null;
    extra_distance_fee_aud?: number | null;
    instant_book?: boolean;
    vin?: string | null;
    license_plate?: string | null;
    color?: string | null;
    hourly_rate_aud?: number | null;
    weekly_rate_aud?: number | null;
    monthly_rate_aud?: number | null;
    weekend_rate_aud?: number | null;
    notes?: string | null;
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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);

    formData.append("organizationId", organizationId);

    try {
      const result = editVehicle
        ? await updateVehicle(formData)
        : await createVehicle(formData);

      if (!result.success) {
        setMessage({ type: "error", text: result.error });
        setIsSubmitting(false);
        return;
      }

      const vehicleId = editVehicle ? editVehicle.id : result.vehicleId;

      if (pendingUploads.length > 0) {
        setUploadingImage(true);
        let uploadErrors = 0;
        
        for (const file of pendingUploads) {
          const imgFormData = new FormData();
          imgFormData.append("vehicleId", vehicleId);
          imgFormData.append("organizationId", organizationId);
          imgFormData.append("file", file);
          
          try {
            const upRes = await uploadVehicleImage(imgFormData);
            if (!upRes.success) uploadErrors++;
          } catch {
            uploadErrors++;
          }
        }
        
        setUploadingImage(false);
        
        if (uploadErrors > 0) {
           setMessage({ type: "error", text: `Vehicle saved, but ${uploadErrors} images failed to upload.` });
           router.push(`/vendor/vehicles?org=${organizationId}&edit=${vehicleId}`);
           return;
        }
      }

      setMessage({
        type: "success",
        text: editVehicle ? "Vehicle updated successfully!" : "Vehicle created successfully!",
      });
      
      router.push(`/vendor/vehicles?org=${organizationId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage({ type: "error", text: `Error: ${msg}` });
    } finally {
      setIsSubmitting(false);
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
            Daily Distance Limit (km)
            <input
              name="dailyDistanceLimitKm"
              type="number"
              defaultValue={editVehicle?.daily_distance_limit_km || ""}
              min={50}
              max={1000}
              placeholder="Leave blank for unlimited"
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Extra Distance Fee (AUD/km)
            <input
              name="extraDistanceFeeAud"
              type="number"
              step="0.01"
              defaultValue={editVehicle?.extra_distance_fee_aud || ""}
              min={0.10}
              max={5.00}
              placeholder="e.g., 0.35"
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Hourly Rate (AUD)
            <input
              name="hourlyRateAud"
              type="number"
              defaultValue={editVehicle?.hourly_rate_aud || ""}
              min={0}
              placeholder="e.g., 15"
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Weekly Rate (AUD)
            <input
              name="weeklyRateAud"
              type="number"
              defaultValue={editVehicle?.weekly_rate_aud || ""}
              min={0}
              placeholder="e.g., 400"
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Monthly Rate (AUD)
            <input
              name="monthlyRateAud"
              type="number"
              defaultValue={editVehicle?.monthly_rate_aud || ""}
              min={0}
              placeholder="e.g., 1200"
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Weekend Rate (AUD)
            <input
              name="weekendRateAud"
              type="number"
              defaultValue={editVehicle?.weekend_rate_aud || ""}
              min={0}
              placeholder="e.g., 150"
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            VIN (Vehicle ID Number)
            <input
              name="vin"
              defaultValue={editVehicle?.vin || ""}
              maxLength={100}
              placeholder="e.g., 1HGCM82633A004..."
              className="rounded-md border border-slate-300 px-3 py-2 font-normal uppercase"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            License Plate
            <input
              name="licensePlate"
              defaultValue={editVehicle?.license_plate || ""}
              maxLength={40}
              placeholder="e.g., ABC-123"
              className="rounded-md border border-slate-300 px-3 py-2 font-normal uppercase"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Color
            <input
              name="color"
              defaultValue={editVehicle?.color || ""}
              maxLength={60}
              placeholder="e.g., White"
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

          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-3">
            Internal Notes
            <textarea
              name="notes"
              defaultValue={editVehicle?.notes || ""}
              maxLength={1000}
              rows={2}
              placeholder="Internal fleet notes, e.g., Public holiday rate may vary..."
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
            />
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

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            name="instantBook"
            defaultChecked={editVehicle?.instant_book || false}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
          />
          <div>
            <span className="block font-medium text-slate-900">Allow Instant Booking ⚡</span>
            <span className="block text-sm text-slate-500">
              Customers can book this vehicle instantly without waiting for your manual approval.
            </span>
          </div>
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || (isAtLimit && !editVehicle)}
            className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400"
          >
            {isSubmitting || uploadingImage
              ? uploadingImage
                ? "Uploading Images..."
                : editVehicle
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

      {/* Image Upload Section */}
      <div className="mt-8 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold">Vehicle Images</h3>
        <p className="mt-1 text-sm text-slate-600">
          Upload up to 10 images. You can select multiple files at once.
        </p>

        {/* Existing Images */}
        {editImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {editImages.map((img) => (
              <div key={img.id} className="relative">
                {img.url ? (
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                    <Image
                      src={img.url}
                      alt={img.alt_text || "Vehicle image"}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
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
                    type="button"
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

        {/* Pending Uploads Preview */}
        {pendingUploads.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {pendingUploads.map((file, idx) => (
              <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Pending upload"
                  fill
                  className="object-cover opacity-70"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="rounded bg-black/50 px-2 py-1 text-xs text-white">Pending Save</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingUploads(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 z-10"
                  title="Remove image"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Selection */}
        <div className="mt-4 flex flex-col gap-3">
          <label className="block w-full sm:w-1/2">
            <span className="text-sm font-medium text-slate-700">Add Images</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={editImages.length + pendingUploads.length >= 10 || isSubmitting || uploadingImage}
              onChange={(e) => {
                if (e.target.files) {
                  setPendingUploads(prev => [...prev, ...Array.from(e.target.files!)]);
                  e.target.value = ""; // Reset input so same files can be selected again if removed
                }
              }}
              className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-slate-800 disabled:opacity-50"
            />
          </label>

          {editImages.length + pendingUploads.length >= 10 && (
            <p className="mt-2 text-sm text-amber-600">
              Maximum 10 images per vehicle reached. Remove images to add new ones.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
