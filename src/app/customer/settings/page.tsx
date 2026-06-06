"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCustomerProfile, deleteCustomerAccount } from "@/app/actions/customer";
import { User, Phone, Mail, AlertTriangle, Save, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function CustomerSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setFormData({
          fullName: profile.full_name || "",
          phone: profile.phone || "",
          email: profile.email || session.user.email || "",
        });
      }
      setIsLoading(false);
    }
    
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("phone", formData.phone);

    const result = await updateCustomerProfile(data);
    
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully." });
    }
    setIsSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "DELETE") {
      setMessage({ type: "error", text: "Please type DELETE to confirm." });
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    const result = await deleteCustomerAccount();
    
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      setIsDeleting(false);
    } else {
      // Successfully deleted on server, sign out locally
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );
      await supabase.auth.signOut();
      router.push("/?deleted=true");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 sm:p-10 flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#ea580c]" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 bg-slate-50/50 min-h-full">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="mt-2 text-slate-500 font-medium">Manage your personal information and account security.</p>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="max-w-2xl space-y-10">
        {/* Profile Information */}
        <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Information</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all font-medium"
                    placeholder="+61 400 000 000"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Email addresses cannot be changed currently.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 rounded-[2rem] border border-red-200 p-8">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h2>
              <p className="text-sm text-red-700 font-medium mb-6">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-white text-red-600 border border-red-200 hover:bg-red-600 hover:text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm"
                >
                  Delete Account
                </button>
              ) : (
                <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm space-y-4">
                  <p className="text-sm font-bold text-slate-900">
                    To confirm deletion, please type <span className="text-red-600 select-all">DELETE</span> below:
                  </p>
                  <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none font-medium"
                    placeholder="Type DELETE"
                  />
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteText !== "DELETE" || isDeleting}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Deletion"}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteText("");
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
