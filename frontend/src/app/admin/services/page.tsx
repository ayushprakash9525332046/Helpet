"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Service, ServiceCategory } from "@/lib/types";
import { Plus, Pencil, Trash2, X, Check, Search, ChevronDown, Clock, IndianRupee, ImagePlus, Link2 } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function resolveImage(url: string) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${API_BASE}${url}`;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  duration_minutes: string;
  image: string;
  category_id: string;
}

const EMPTY_FORM: FormState = {
  name: "", description: "", price: "", duration_minutes: "60", image: "", category_id: "",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgTab, setImgTab] = useState<"upload" | "url">("upload");

  async function handleImageFile(file: File) {
    if (!file) return;
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/services/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, image: data.url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setImgUploading(false);
    }
  }

  useEffect(() => {
    Promise.all([
      api.get("/services/"),
      api.get("/services/categories"),
    ]).then(([sRes, cRes]) => {
      setServices(sRes.data);
      setCategories(cRes.data);
    }).finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id ?? "" });
    setEditTarget(null);
    setModal("create");
  }

  function openEdit(svc: Service) {
    setForm({
      name: svc.name,
      description: svc.description ?? "",
      price: String(svc.price),
      duration_minutes: String(svc.duration_minutes),
      image: svc.image ?? "",
      category_id: svc.category.id,
    });
    setEditTarget(svc);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("Valid price is required"); return; }
    if (!form.category_id) { toast.error("Category is required"); return; }
    setSaving(true);
    try {
      if (modal === "create") {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
          duration_minutes: Number(form.duration_minutes) || 60,
          image: form.image.trim() || null,
          category_id: form.category_id,
        };
        const { data } = await api.post("/services/", payload);
        setServices((prev) => [...prev, data]);
        toast.success("Service created");
      } else if (editTarget) {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
          duration_minutes: Number(form.duration_minutes) || 60,
          image: form.image.trim() || null,
        };
        const { data } = await api.put(`/services/${editTarget.id}`, payload);
        setServices((prev) => prev.map((s) => (s.id === editTarget.id ? data : s)));
        toast.success("Service updated");
      }
      closeModal();
    } catch (err: any) {
      const msg = err?.response?.data?.detail;
      toast.error(Array.isArray(msg) ? msg[0]?.msg : msg || "Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(svc: Service) {
    if (!confirm(`Deactivate "${svc.name}"?`)) return;
    try {
      await api.delete(`/services/${svc.id}`);
      setServices((prev) => prev.filter((s) => s.id !== svc.id));
      toast.success("Service deactivated");
    } catch {
      toast.error("Failed to deactivate");
    }
  }

  const filtered = services.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || s.category.id === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Services</h1>
          <p className="text-slate-500 text-sm mt-1">{services.length} active services</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} />
          Add Service
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
        <div className="relative">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          No services found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-lg">
                      {svc.image
                        ? <img src={resolveImage(svc.image)} alt={svc.name} className="w-full h-full object-cover" />
                        : svc.category.name === "Cleaning" ? "🧹" : svc.category.name === "Plumbing" ? "🔧" : "🏠"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{svc.name}</p>
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {svc.category.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(svc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(svc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {svc.description && (
                  <p className="text-slate-400 text-xs mb-3 line-clamp-2">{svc.description}</p>
                )}
                <div className="flex items-center gap-4 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                    <IndianRupee size={12} className="text-blue-500" />
                    {svc.price.toLocaleString("en-IN")}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={11} />
                    {svc.duration_minutes} min
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-800 text-lg">
                  {modal === "create" ? "New Service" : "Edit Service"}
                </h2>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {modal === "create" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category *</label>
                    <div className="relative">
                      <select
                        value={form.category_id}
                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                        className="w-full appearance-none px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                      >
                        <option value="">Select category...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Deep House Cleaning"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the service..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Price (₹) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="500"
                      min="0"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Duration (min)</label>
                    <input
                      type="number"
                      value={form.duration_minutes}
                      onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                      placeholder="60"
                      min="15"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    />
                  </div>
                </div>
                {/* Image picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Service Image</label>

                  {/* Preview */}
                  {form.image && (
                    <div className="relative mb-2 w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={resolveImage(form.image)} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setImgTab("upload")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${imgTab === "upload" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
                    >
                      <ImagePlus size={12} /> Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImgTab("url")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${imgTab === "url" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
                    >
                      <Link2 size={12} /> URL
                    </button>
                  </div>

                  {imgTab === "upload" ? (
                    <label className={`flex flex-col items-center justify-center gap-2 w-full py-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${imgUploading ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"}`}>
                      {imgUploading ? (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <ImagePlus size={20} className="text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">Click to upload or drag an image</span>
                          <span className="text-[10px] text-slate-400">JPEG, PNG, WebP — max 5 MB</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={imgUploading}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }}
                      />
                    </label>
                  ) : (
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    />
                  )}
                  <p className="text-[10px] text-slate-400 mt-1.5">Leave empty to use an emoji icon as fallback</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={14} />
                      {modal === "create" ? "Create" : "Save"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
