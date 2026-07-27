"use client";

import Link from "next/link";
import Image from "next/image";
import { Share2, Mail, Phone, MapPin, MapPinned } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

const COMPANY_LINKS = [
  { label: "Home", href: "/" },
  { label: "All services", href: "/categories" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms and conditions", href: "/terms" },
];

const SERVICE_LINKS = ["Cleaning", "Plumbing", "Electrical repairs", "Carpentry"];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleShare = async () => {
    const shareData = {
      title: "Helpet",
      text: "Book trusted home services in Dehradun with Helpet",
      url: "https://helpet.in",
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText("https://helpet.in");
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const socialBtn =
    "w-10 h-10 rounded-[10px] border border-line flex items-center justify-center text-ink-soft hover:text-brand-600 hover:border-brand-300 transition-colors";

  return (
    <footer className="bg-white border-t border-line pt-10 md:pt-14 pb-6">
      <div className="container-fluid">
        {/* Brand */}
        <div className="flex flex-col gap-4 mb-8 md:mb-10">
          <Link href="/home" className="flex items-center gap-2.5 w-fit">
            <div className="w-9 h-9 rounded-lg overflow-hidden">
              <Image
                src="/assets/helpet-logo-v2.png"
                alt="Helpet Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xl text-ink tracking-tight">helpet</span>
          </Link>
          <p className="text-ink-soft text-sm leading-relaxed max-w-xs">
            Verified professionals for every job around your home. Trusted across Dehradun.
          </p>
          <div className="flex items-center gap-2.5">
            <a
              href="https://www.instagram.com/helpet.india/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className={socialBtn}
            >
              <FaInstagram size={17} />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61588929685126"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className={socialBtn}
            >
              <FaFacebook size={17} />
            </a>
            <a
              href="https://maps.app.goo.gl/5p59cymFbuSnV8Wu9"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Maps"
              className={socialBtn}
            >
              <MapPinned size={17} />
            </a>
            <button onClick={handleShare} aria-label="Share Helpet" className={`${socialBtn} cursor-pointer`}>
              <Share2 size={17} />
            </button>
          </div>
        </div>

        {/* Links — 2 columns on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pb-8 mb-8 border-b border-line">
          <div>
            <h3 className="text-ink font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-ink-soft hover:text-brand-600 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-ink font-semibold text-sm mb-4">Services</h3>
            <ul className="space-y-3">
              {SERVICE_LINKS.map((cat) => (
                <li key={cat}>
                  <Link href="/categories" className="text-ink-soft hover:text-brand-600 text-sm transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="text-ink font-semibold text-sm mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-brand-600 shrink-0 mt-0.5" />
                <span className="text-ink-soft text-sm">Keserwala, Raipur, Dehradun, 248008</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-brand-600 shrink-0" />
                <a href="tel:+916203260694" className="text-ink-soft hover:text-brand-600 text-sm transition-colors">
                  +91 6203 260 694
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-brand-600 shrink-0" />
                <a href="mailto:support@helpet.com" className="text-ink-soft hover:text-brand-600 text-sm transition-colors">
                  support@helpet.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center">
          <p className="text-ink-soft text-xs">© {currentYear} Helpet India. All rights reserved.</p>
          <a
            href="https://github.com/surajkr97"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-soft text-xs hover:text-brand-600 transition-colors"
          >
            Built by surajkr97
          </a>
        </div>
      </div>
    </footer>
  );
}
