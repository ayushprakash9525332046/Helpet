"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api, { invalidateServiceCache } from "@/lib/api";
import { Service, ServiceCategory, SubService } from "@/lib/types";
import {
  Plus, Pencil, Trash2, X, Check, Search,
  ChevronDown, Clock, IndianRupee, GripVertical, Settings2, ChevronUp, Layers,
} from "lucide-react";
import { getServiceIcon } from "@/lib/icons";
import { resolveImage } from "@/lib/image";
import toast from "react-hot-toast";

interface FormState {
  name: string;
  description: string;
  price: string;
  discount_percentage: string;
  platform_fee_percentage: string;
  duration_minutes: string;
  image: string;
  category_id: string;
}
const EMPTY_FORM: FormState = {
  name: "", description: "", price: "", discount_percentage: "15", platform_fee_percentage: "10", duration_minutes: "60", image: "", category_id: "",
};

// ── Sub-service inline form ───────────────────────────────────────
interface SubForm { name: string; description: string; price: string; }
const EMPTY_SUB: SubForm = { name: "", description: "", price: "" };

function SubServicePanel({ svc, onUpdated }: { svc: Service; onUpdated: (updated: Service) => void }) {
  const [open, setOpen]             = useState(false);
  const [form, setForm]             = useState<SubForm>(EMPTY_SUB);
  const [editTarget, setEditTarget] = useState<SubService | null>(null);
  const [formOpen, setFormOpen]     = useState(false);
  const [saving, setSaving]         = useState(false);

  function openAdd() {
    setForm(EMPTY_SUB);
    setEditTarget(null);
    setFormOpen(true);
    setOpen(true);
  }

  function openEdit(sub: SubService) {
    setForm({ name: sub.name, description: sub.description ?? "", price: String(sub.price) });
    setEditTarget(sub);
    setFormOpen(true);
    setOpen(true);
  }

  function cancelForm() {
    setFormOpen(false);
    setEditTarget(null);
    setForm(EMPTY_SUB);
  }

  async function refreshService() {
    const { data } = await api.get(`/services/${svc.id}`);
    onUpdated(data);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("Valid price is required"); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/services/${svc.id}/sub-services/${editTarget.id}`, {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
        });
        toast.success("Option updated");
      } else {
        await api.post(`/services/${svc.id}/sub-services`, {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
        });
        toast.success("Option added");
      }
      invalidateServiceCache();
      cancelForm();
      await refreshService();
    } catch {
      toast.error("Failed to save option");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(sub: SubService) {
    if (!confirm(`Remove "${sub.name}"?`)) return;
    try {
      await api.delete(`/services/${svc.id}/sub-services/${sub.id}`);
      invalidateServiceCache();
      toast.success("Option removed");
      await refreshService();
    } catch {
      toast.error("Failed to remove option");
    }
  }

  const count = svc.sub_services?.length ?? 0;

  return (
    <div className="border-t border-slate-100 mt-3 pt-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Layers size={12} />
          Sub-options {count > 0 && <span className="bg-blue-100 text-blue-600 rounded-full px-1.5 py-0.5 text-[10px] font-bold">{count}</span>}
          {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
        <button
          onClick={openAdd}
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
        >
          <Plus size={11} /> Add option
        </button>
      </div>

      {open && (
        <div className="mt-2 space-y-1.5">
          {count === 0 && !formOpen && (
            <p className="text-xs text-slate-400 text-center py-2">No options yet — add one above</p>
          )}
          {svc.sub_services?.map(sub => (
            <div key={sub.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-700 truncate">{sub.name}</p>
                {sub.description && <p className="text-[10px] text-slate-400 truncate">{sub.description}</p>}
              </div>
              <span className="text-xs font-black text-blue-600 shrink-0">₹{Number(sub.price).toLocaleString("en-IN")}</span>
              <div className="flex gap-0.5 shrink-0">
                <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Pencil size={11} />
                </button>
                <button onClick={() => handleDelete(sub)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}

          {formOpen && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2 mt-2">
              <p className="text-[11px] font-bold text-blue-700 mb-1">{editTarget ? "Edit option" : "New option"}</p>
              <input
                type="text"
                placeholder="Name (e.g. 1 BHK, Wall Mounted)"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white"
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                min="0"
                className="w-full px-3 py-2 text-xs border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={cancelForm}
                  className="flex-1 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-500 hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
                >
                  {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={11} /> Save</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sortable service card ─────────────────────────────────────────
function SortableServiceCard({
  svc,
  onEdit,
  onDelete,
  onSubUpdated,
}: {
  svc: Service;
  onEdit: (svc: Service) => void;
  onDelete: (svc: Service) => void;
  onSubUpdated: (updated: Service) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: svc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const imgSrc = resolveImage(svc.image, 96);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-0 ${
        isDragging ? "shadow-xl ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-1 -ml-1 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors cursor-grab active:cursor-grabbing touch-none"
          title="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>

        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Image / icon thumbnail */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-blue-50 border border-slate-200 flex items-center justify-center shrink-0">
            {imgSrc ? (
              <img src={imgSrc} alt={svc.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            ) : (
              (() => { const I = getServiceIcon(svc.name); return <I size={22} className="text-blue-400" />; })()
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-800 text-sm truncate">{svc.name}</p>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                {svc.category.name}
              </span>
            </div>
            {svc.description && (
              <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{svc.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="flex items-center gap-0.5 text-sm font-bold text-slate-700">
                <IndianRupee size={11} className="text-blue-500" />
                {Number(svc.price).toLocaleString("en-IN")}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={11} />
                {svc.duration_minutes} min
              </span>
              {(svc.discount_percentage ?? 0) > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                  {svc.discount_percentage}% off
                </span>
              )}
              {(svc.platform_fee_percentage ?? 0) > 0 && (
                <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-full">
                  {svc.platform_fee_percentage}% fee
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(svc)}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(svc)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <SubServicePanel svc={svc} onUpdated={onSubUpdated} />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function ServicesPage() {
  const [services, setServices]     = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [reordering, setReordering] = useState(false);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("all");
  const [modal, setModal]           = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [form, setForm]             = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [defaultDiscount, setDefaultDiscount]       = useState("15");
  const [defaultPlatformFee, setDefaultPlatformFee] = useState("10");
  const [settingsOpen, setSettingsOpen]             = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    Promise.all([api.get("/services/"), api.get("/services/categories")])
      .then(([sRes, cRes]) => {
        setServices(sRes.data);
        setCategories(cRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Drag end: reorder locally + persist ─────────────────────────
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Only reorder within the filtered view if no filter is active,
    // otherwise reorder within full list
    const listToReorder = isFiltered ? filtered : services;
    const oldIndex = listToReorder.findIndex((s) => s.id === active.id);
    const newIndex  = listToReorder.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(listToReorder, oldIndex, newIndex);

    // Merge back into full list preserving non-filtered items
    if (isFiltered) {
      const reorderedIds = new Set(reordered.map((s) => s.id));
      const others = services.filter((s) => !reorderedIds.has(s.id));
      setServices([...reordered, ...others]);
    } else {
      setServices(reordered);
    }

    setReordering(true);
    try {
      await api.put(
        "/services/reorder",
        reordered.map((s, i) => ({ id: s.id, order: i }))
      );
    } catch {
      toast.error("Failed to save order");
      setServices(services); // revert
    } finally {
      setReordering(false);
    }
  }

  // ── Modal helpers ────────────────────────────────────────────────
  function openCreate() {
    setForm({
      ...EMPTY_FORM,
      category_id: categories[0]?.id ?? "",
      discount_percentage: defaultDiscount,
      platform_fee_percentage: defaultPlatformFee,
    });
    setEditTarget(null);
    setModal("create");
  }

  function openEdit(svc: Service) {
    setForm({
      name: svc.name,
      description: svc.description ?? "",
      price: String(svc.price),
      discount_percentage: String(svc.discount_percentage ?? 0),
      platform_fee_percentage: String(svc.platform_fee_percentage ?? 10),
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
          discount_percentage: Number(form.discount_percentage) || 0,
          platform_fee_percentage: Number(form.platform_fee_percentage) || 0,
          duration_minutes: Number(form.duration_minutes) || 60,
          image: form.image.trim() || null,
          category_id: form.category_id,
        };
        const { data } = await api.post("/services/", payload);
        setServices((prev) => [...prev, data]);
        invalidateServiceCache();
        toast.success("Service created");
      } else if (editTarget) {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
          discount_percentage: Number(form.discount_percentage) || 0,
          platform_fee_percentage: Number(form.platform_fee_percentage) || 0,
          duration_minutes: Number(form.duration_minutes) || 60,
          image: form.image.trim() || null,
        };
        const { data } = await api.put(`/services/${editTarget.id}`, payload);
        setServices((prev) => prev.map((s) => (s.id === editTarget.id ? data : s)));
        invalidateServiceCache();
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
      invalidateServiceCache();
      toast.success("Service deactivated");
    } catch {
      toast.error("Failed to deactivate");
    }
  }

  const isFiltered = search.trim() !== "" || catFilter !== "all";
  const filtered = services.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "all" || s.category.id === catFilter;
    return matchSearch && matchCat;
  });

  const previewSrc = resolveImage(form.image || null, 400);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Services</h1>
          <p className="text-slate-500 text-sm mt-1">
            {services.length} active services
            {reordering && <span className="ml-2 text-blue-500 text-xs">Saving order…</span>}
          </p>
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

      {/* Default pricing settings */}
      <div className="mb-4 border border-slate-200 rounded-2xl bg-white overflow-hidden">
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Settings2 size={15} className="text-slate-400" />
            Default Pricing Defaults
            <span className="text-[11px] font-normal text-slate-400">
              (applied to every new service you create)
            </span>
          </span>
          {settingsOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </button>

        {settingsOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Default Discount (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={defaultDiscount}
                    onChange={(e) => setDefaultDiscount(e.target.value)}
                    min="0"
                    max="90"
                    className="w-full px-4 py-2.5 pr-8 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  New services will default to {defaultDiscount || 0}% off
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Default Platform Fee (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={defaultPlatformFee}
                    onChange={(e) => setDefaultPlatformFee(e.target.value)}
                    min="0"
                    max="50"
                    className="w-full px-4 py-2.5 pr-8 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Platform keeps {defaultPlatformFee || 0}% of each booking
                </p>
              </div>
            </div>

            <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
              These are session defaults — each service can still be overridden individually when you add or edit it.
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          No services found
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
            <GripVertical size={12} /> Drag cards to reorder — order reflects on all service listings
            {isFiltered && <span className="ml-1 text-amber-500">(filtering active — reorder applies to visible items)</span>}
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map((s) => s.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((svc) => (
                  <SortableServiceCard
                    key={svc.id}
                    svc={svc}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onSubUpdated={(updated) =>
                      setServices(prev => prev.map(s => s.id === updated.id ? updated : s))
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Discount (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={form.discount_percentage}
                        onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })}
                        placeholder="0"
                        min="0"
                        max="90"
                        className="w-full px-4 py-2.5 pr-8 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Platform Fee (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={form.platform_fee_percentage}
                        onChange={(e) => setForm({ ...form, platform_fee_percentage: e.target.value })}
                        placeholder="10"
                        min="0"
                        max="50"
                        className="w-full px-4 py-2.5 pr-8 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Price breakdown preview */}
                {form.price && Number(form.price) > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price Breakdown</p>
                    {Number(form.discount_percentage) > 0 ? (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Original price</span>
                        <span className="text-slate-400 line-through">
                          ₹{Math.round(Number(form.price) / (1 - Number(form.discount_percentage) / 100)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">Customer pays</span>
                      <span className="text-blue-600">₹{Number(form.price).toLocaleString("en-IN")}</span>
                    </div>
                    {Number(form.discount_percentage) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-emerald-600">Discount ({form.discount_percentage}% off)</span>
                        <span className="text-emerald-600">
                          −₹{(Math.round(Number(form.price) / (1 - Number(form.discount_percentage) / 100)) - Number(form.price)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {Number(form.platform_fee_percentage) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-violet-600">Platform fee ({form.platform_fee_percentage}%)</span>
                        <span className="text-violet-600">
                          ₹{Math.round(Number(form.price) * Number(form.platform_fee_percentage) / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-2 flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Provider receives</span>
                      <span className="text-slate-800">
                        ₹{Math.round(Number(form.price) * (1 - Number(form.platform_fee_percentage) / 100)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Image */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Service Image</label>
                  {previewSrc && (
                    <div className="relative mb-2 w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={previewSrc} alt="preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
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
                    <><Check size={14} />{modal === "create" ? "Create" : "Save"}</>
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
