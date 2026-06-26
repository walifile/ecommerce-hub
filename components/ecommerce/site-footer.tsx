import type { SVGProps } from "react";
import Link from "next/link";
import { Mail, Phone, ShieldCheck, Store } from "lucide-react";
import { NewsletterForm } from "@/components/ecommerce/newsletter-form";

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.8-.1-1.6-.15-2.4-.15-2.4 0-4.05 1.45-4.05 4.15v2.3H7.5V13h2.75v8h3.25z" />
    </svg>
  );
}

function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.5 7.2a2.7 2.7 0 0 0-1.9-1.9C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.6.5A2.7 2.7 0 0 0 1.5 7.2 28 28 0 0 0 1.1 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a2.7 2.7 0 0 0 1.9-1.9 28 28 0 0 0 .4-4.8 28 28 0 0 0-.4-4.8zM9.9 15.3V8.7l5.7 3.3z" />
    </svg>
  );
}

function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.25-.13-1.5-.74-1.7-.82-.23-.08-.4-.13-.56.13-.16.25-.64.82-.78.99-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-2-1.23 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.5-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.11-.23-.17-.48-.29z" />
    </svg>
  );
}

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Best Sellers", href: "/shop" },
      { label: "New Arrivals", href: "/shop" },
      { label: "Gift Ideas", href: "/shop" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Info", href: "/contact" },
      { label: "Returns & Refunds", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About ToyVerse", href: "/about-us" },
      { label: "Careers", href: "/contact" },
      { label: "Reviews", href: "/shop" },
      { label: "Blog", href: "/shop" },
    ],
  },
];

const socials = [
  { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "YouTube", href: "#", icon: YoutubeIcon },
  { label: "WhatsApp", href: "#", icon: WhatsappIcon },
];

const paymentMethods = ["COD", "Easypaisa", "JazzCash", "Visa", "Mastercard"];

export function SiteFooter() {
  return (
    <footer id="footer" className="relative border-t border-white/8 bg-surface-deep">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/80 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 border-b border-white/8 pb-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
              Get 10% off
            </span>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
              10% off your first order.
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/50">
              Join the list for new drops, restocks and gift picks, plus a welcome
              code for your first purchase.
            </p>
          </div>
          <div className="w-full lg:max-w-sm">
            <NewsletterForm />
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-brand to-brand-strong shadow-[0_0_18px_color-mix(in_srgb,var(--brand)_40%,transparent)]">
                <Store className="size-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand/70">
                  Play · Learn · Repeat
                </p>
                <p className="text-base font-black leading-tight text-white">ToyVerse</p>
              </div>
            </Link>

            <p className="max-w-xs text-sm leading-7 text-white/50">
              Premium toys for curious kids, with cleaner discovery, faster
              checkout, and a calmer shopping experience for modern parents.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {socials.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/55 transition-all hover:border-brand/40 hover:bg-brand/10 hover:text-brand"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-sm text-white/55">
              <Link
                href="mailto:hello@toyverse.shop"
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail className="size-4 text-brand" />
                hello@toyverse.shop
              </Link>
              <Link
                href="tel:+15551234567"
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Phone className="size-4 text-brand" />
                +1 (555) 123-4567
              </Link>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                {column.title}
              </p>
              <div className="grid gap-3">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 border-t border-white/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              We accept
            </span>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/70"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-white/45">
            <ShieldCheck className="size-4 text-brand-3" />
            Secure SSL-encrypted checkout
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/8 pt-6 text-sm text-white/35 md:flex-row md:items-center md:justify-between">
          <p>© 2026 ToyVerse. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy-policy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-white">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
