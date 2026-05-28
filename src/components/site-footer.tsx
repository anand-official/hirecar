"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, ShieldCheck } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  customers: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "FAQs", href: "/faq" },
    { label: "Support", href: "/contact" },
    { label: "Privacy Policy", href: "/legal/privacy" },
  ],
  vendors: [
    { label: "List Your Fleet", href: "/vendor/onboarding" },
    { label: "Pricing", href: "/pricing" },
    { label: "Success Stories", href: "/success-stories" },
    { label: "Vendor Dashboard", href: "/vendor/dashboard" },
  ],
  locations: [
    { label: "Sydney", href: "/search?city=Sydney" },
    { label: "Melbourne", href: "/search?city=Melbourne" },
    { label: "Brisbane", href: "/search?city=Brisbane" },
    { label: "Perth", href: "/search?city=Perth" },
    { label: "Adelaide", href: "/search?city=Adelaide" },
    { label: "Gold Coast", href: "/search?city=Gold%20Coast" },
  ],
};

const socialLinks = [
  { name: "FB", href: "#", label: "Facebook" },
  { name: "IG", href: "#", label: "Instagram" },
  { name: "X", href: "#", label: "Twitter" },
  { name: "LI", href: "#", label: "LinkedIn" },
  { name: "YT", href: "#", label: "YouTube" },
];

export function SiteFooter() {
  return (
    <footer className="bg-slate-950 relative overflow-hidden text-slate-300">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Main Footer Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-white group">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck className="h-7 w-7" aria-hidden />
              </span>
              <span className="font-heading tracking-tight">Carhire</span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400 font-medium">
              Australia&apos;s trusted premium marketplace for verified car rental operators. 
              Connect with local fleet owners for your next journey.
            </p>
            
            {/* Contact Info */}
            <div className="mt-8 space-y-4">
              <a href="tel:+611800123456" className="flex items-center gap-4 text-sm font-semibold hover:text-white group transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 group-hover:border-primary/50 transition-colors">
                  <Phone className="h-4.5 w-4.5 text-primary" />
                </div>
                <span>1800 123 456</span>
              </a>
              <a href="mailto:support@carhire.com.au" className="flex items-center gap-4 text-sm font-semibold hover:text-white group transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 group-hover:border-primary/50 transition-colors">
                  <Mail className="h-4.5 w-4.5 text-primary" />
                </div>
                <span>support@carhire.com.au</span>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-6">Company</h3>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm font-medium text-slate-400 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-6">For Customers</h3>
              <ul className="space-y-4">
                {footerLinks.customers.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm font-medium text-slate-400 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-6">For Vendors</h3>
              <ul className="space-y-4">
                {footerLinks.vendors.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm font-medium text-slate-400 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter & Locations */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-white">Stay Updated</h3>
              <p className="mt-2 text-sm text-slate-400 font-medium">
                Get exclusive deals and premium travel tips.
              </p>
              <form className="mt-5 flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-5">Popular Locations</h3>
              <ul className="grid grid-cols-2 gap-3">
                {footerLinks.locations.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-slate-800/60 bg-slate-950/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-sm font-medium text-slate-500">
              &copy; {new Date().getFullYear()} Carhire Marketplace. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-xs font-bold shadow-sm"
                  aria-label={social.label}
                >
                  {social.name}
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-8 text-sm font-medium text-slate-500">
              <Link href="/legal/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/legal/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}