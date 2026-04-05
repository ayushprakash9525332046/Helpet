"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import BackHeader from "@/components/BackHeader";
import toast from "react-hot-toast";
import { User, Mail, Phone, MapPin, Building2, Hash, Camera } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "http://localhost:8000";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name ?? "",
    email:     user?.email ?? "",
    address:   "",
    city:      "",
    pincode:   "",
  });
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setAvatarUploading(true);
    try {
      const { data } = await api.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(data);
      toast.success("Profile picture updated");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/users/me", {
        full_name: form.full_name || undefined,
        email:     form.email    || undefined,
        address:   form.address  || undefined,
        city:      form.city     || undefined,
        pincode:   form.pincode  || undefined,
      });
      toast.success("Profile updated successfully");
      router.back();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "full_name", label: "Full Name",     placeholder: "Your full name",        icon: User,      type: "text" },
    { key: "email",     label: "Email Address", placeholder: "your@email.com",        icon: Mail,      type: "email" },
    { key: "address",   label: "Address",       placeholder: "Street, area, landmark",icon: MapPin,    type: "text" },
    { key: "city",      label: "City",          placeholder: "Mumbai",                icon: Building2, type: "text" },
    { key: "pincode",   label: "Pincode",       placeholder: "400001",                icon: Hash,      type: "text" },
  ];

  const initial = user?.full_name?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-10">
      <BackHeader title="Edit Profile" />

      {/* Avatar section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center pt-7 pb-5"
      >
        <div className="relative">
          {user?.profile_picture ? (
            <img
              src={`${API_BASE}${user.profile_picture}`}
              alt="Profile"
              className="w-24 h-24 rounded-2xl object-cover shadow-xl shadow-blue-200"
            />
          ) : (
            <div className="w-24 h-24 bg-linear-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-200">
              {initial}
            </div>
          )}
          <motion.div
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center border-2 border-white shadow-md cursor-pointer"
          >
            {avatarUploading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera size={15} className="text-white" />
            )}
          </motion.div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <p className="text-slate-800 font-bold text-base mt-4">{user?.full_name}</p>
        <p className="text-slate-400 text-sm">{user?.phone}</p>
      </motion.div>

      <div className="px-5 flex flex-col gap-4">
        {/* Phone — read only */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Phone size={14} className="text-slate-400" />
            </div>
            <input
              type="tel"
              value={user?.phone ?? ""}
              disabled
              className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-100 text-slate-400 text-sm cursor-not-allowed"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 px-1">Phone number cannot be changed</p>
        </motion.div>

        {fields.map(({ key, label, placeholder, icon: Icon, type }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.05 }}
          >
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
              {label}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Icon size={14} className="text-blue-500" />
              </div>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => update(key, e.target.value)}
                className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition shadow-sm"
              />
            </div>
          </motion.div>
        ))}

        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={loading}
          className="btn-primary disabled:opacity-60 mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving Changes...
            </span>
          ) : "Save Changes"}
        </motion.button>
      </div>
    </div>
  );
}
