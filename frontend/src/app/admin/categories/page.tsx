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
import api from "@/lib/api";
import { ServiceCategory } from "@/lib/types";
import { Plus, Pencil, Trash2, X, Check, ImageOff, Link2, GripVertical } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function resolveImage(url?: string) {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return null;
}

interface FormState { name: string; description: string; icon: string; }
const EMPTY_FORM: FormState = { name: "", description: "", icon: "" };

// ── Sortable card ────────────────────────────────────────────────
function SortableCard({
  cat,
  onEdit,
  onDelete,
}: {
  cat: ServiceCategory;
  onEdit: (cat: ServiceCategory) => void;
  onDelete: (cat: ServiceCategory) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const imgSrc = resolveImage(cat.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start justify-between gap-3 ${
        isDragging ? "shadow-xl ring-2 ring-blue-400" : ""
      }`}
    >
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
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          {imgSrc ? (
            <img src={imgSrc} alt={cat.name} className="w-full h-full object-cover" />
          ) : (
            <ImageOff size={18} className="text-slate-400" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 text-sm">{cat.name}</p>
          <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{cat.description || "No description"}</p>
        </div>
      </div>

      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(cat)}
          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(cat)}
          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<ServiceCategory | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imgError, setImgError] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    api.get("/services/categories").then((r) => setCategories(r.data)).finally(() => setLoading(false));
  }, []);

  // ── Drag end: reorder locally + persist ─────────────────────────
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    setReordering(true);
    try {
      await api.put(
        "/services/categories/reorder",
        reordered.map((c, i) => ({ id: c.id, order: i }))
      );
    } catch {
      toast.error("Failed to save order");
      // Revert on failure
      setCategories(categories);
    } finally {
      setReordering(false);
    }
  }

  // ── Modal helpers ────────────────────────────────────────────────
  function openCreate() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setImgError(false);
    setModal("create");
  }

  function openEdit(cat: ServiceCategory) {
    setForm({ name: cat.name, description: cat.description ?? "", icon: cat.icon ?? "" });
    setEditTarget(cat);
    setImgError(false);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setImgError(false);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
      };
      if (modal === "create") {
        const { data } = await api.post("/services/categories", payload);
        setCategories((prev) => [...prev, data]);
        toast.success("Category created");
      } else if (editTarget) {
        const { data } = await api.put(`/services/categories/${editTarget.id}`, payload);
        setCategories((prev) => prev.map((c) => (c.id === editTarget.id ? data : c)));
        toast.success("Category updated");
      }
      closeModal();
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: ServiceCategory) {
    if (!confirm(`Deactivate "${cat.name}"?`)) return;
    try {
      await api.delete(`/services/categories/${cat.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success("Category deactivated");
    } catch {
      toast.error("Failed to deactivate");
    }
  }

  const previewSrc = resolveImage(form.icon);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Categories</h1>
          <p className="text-slate-500 text-sm mt-1">
            {categories.length} active categories
            {reordering && <span className="ml-2 text-blue-500 text-xs">Saving order…</span>}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} />
          Add Category
        </motion.button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
            <GripVertical size={12} /> Drag cards to reorder — order reflects on home &amp; categories pages
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map((c) => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <SortableCard key={cat.id} cat={cat} onEdit={openEdit} onDelete={handleDelete} />
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-800 text-lg">
                  {modal === "create" ? "New Category" : "Edit Category"}
                </h2>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Cleaning"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Image URL</label>
                  {previewSrc && !imgError && (
                    <div className="mb-2 w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={previewSrc}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    </div>
                  )}
                  {previewSrc && imgError && (
                    <div className="mb-2 w-full h-14 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center gap-2 text-red-500 text-xs font-medium">
                      <ImageOff size={14} /> Could not load image from this URL
                    </div>
                  )}
                  <div className="relative">
                    <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={form.icon}
                      onChange={(e) => { setForm({ ...form, icon: e.target.value }); setImgError(false); }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">Leave empty to show a placeholder.</p>
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
