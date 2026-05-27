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
    <footer className="bg-slate-950 text-slate-300">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </span>
              Carhire
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Australia&apos;s trusted marketplace for verified car rental operators. 
              Connect with local fleet owners for your next journey.
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a href="tel:+611800123456" className="flex items-center gap-3 text-sm hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-amber-500" />
                <span>1800 123 456</span>
              </a>
              <a href="mailto:support@carhire.com.au" className="flex items-center gap-3 text-sm hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-amber-500" />
                <span>support@carhire.com.au</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin className="h-4 w-4 text-amber-500" />
                <span>Australia Wide</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-amber-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">For Customers</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.customers.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-amber-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">For Vendors</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.vendors.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-amber-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter & Locations */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Stay Updated</h3>
            <p className="mt-2 text-sm text-slate-400">
              Get exclusive deals and travel tips.
            </p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Subscribe
              </button>
            </form>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-white">Popular Locations</h3>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {footerLinks.locations.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Carhire Marketplace. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-amber-500 hover:text-slate-950 transition-colors text-xs font-bold"
                  aria-label={social.label}
                >
                  {social.name}
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/legal/terms" className="hover:text-slate-300 transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="hover:text-slate-300 transition-colors">
                Privacy
              </Link>
              <Link href="/legal/cookies" className="hover:text-slate-300 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}