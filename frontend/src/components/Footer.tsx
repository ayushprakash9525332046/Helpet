"use client";

import Link from "next/link";
import { 
  Globe, 
  Share2, 
  Link as LinkIcon, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Users 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="container-fluid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand section */}
          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/home" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <span className="text-white font-black text-xl italic">H</span>
              </div>
              <div className="text-left">
                <h1 className="font-black text-2xl text-slate-800 tracking-tight leading-none">Helpet India</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Professional Home Services</p>
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Connecting you with trusted local professionals for all your home needs. Quality service, guaranteed.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                <Share2 size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                <LinkIcon size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-slate-800 font-black text-sm uppercase tracking-widest mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {["Home", "All Services", "About Us", "Contact Us", "Join as Professional"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-slate-800 font-black text-sm uppercase tracking-widest mb-6">Popular Categories</h3>
            <ul className="space-y-4">
              {["Cleaning Services", "Plumbing", "Electrical Repairs", "Beauty & Salon", "AC Services"].map((cat) => (
                <li key={cat}>
                  <Link href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-slate-800 font-black text-sm uppercase tracking-widest mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3">
                <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-slate-500 text-sm">123 Service Lane, Business Hub,<br />City Center, 110001</span>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3">
                <Phone size={18} className="text-blue-600 shrink-0" />
                <span className="text-slate-500 text-sm">+91 98765 43210</span>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3">
                <Mail size={18} className="text-blue-600 shrink-0" />
                <span className="text-slate-500 text-sm">support@helpet.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Features row */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-t border-slate-50">
          <div className="flex items-center justify-center gap-4 group">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">100% Secure</p>
              <p className="text-xs text-slate-400 font-medium">Safe payments & verified pros</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 group">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">4.9/5 Rating</p>
              <p className="text-xs text-slate-400 font-medium">Trusted by 50k+ customers</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 group">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Expert Pros</p>
              <p className="text-xs text-slate-400 font-medium">Vetted professionals only</p>
            </div>
          </div>
        </div> */}

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400 text-xs font-bold">
            © {currentYear} helpet. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors">Terms of Service</Link>
            <Link href="#" className="text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
