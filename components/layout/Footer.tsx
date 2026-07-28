"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, MessageCircle, Send } from "lucide-react";
import type { CategoryWithCount } from "@/lib/types/category";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSiteSettings } from "@/lib/site-settings-context";
import {
  telHref,
  mailtoHref,
  whatsappHref,
  telegramHref,
  formatWhatsappDisplay,
  formatTelegramDisplay,
  socialHref,
} from "@/lib/contact-links";

export default function Footer() {
  const { t, getCategoryName } = useLanguage();
  const settings = useSiteSettings();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  const corporateLinks = [
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
    { href: "#", label: t.footer.shipping },
    { href: "#", label: t.footer.returns },
    { href: "#", label: t.footer.privacy },
  ];

  const socialLinks = [
    { icon: Facebook, label: "Facebook", href: socialHref(settings.facebook) },
    { icon: Instagram, label: "Instagram", href: socialHref(settings.instagram) },
    { icon: Linkedin, label: "LinkedIn", href: socialHref(settings.linkedin) },
  ].filter((item) => item.href);

  return (
    <footer className="bg-slate-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo-beyaz.png"
                alt="odonexo.com"
                width={260}
                height={72}
                className="h-16 w-auto max-w-[220px] object-contain object-left"
              />
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t.footer.description}
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-6 flex gap-3">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-brand"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              {t.footer.categories}
            </h3>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {getCategoryName(cat.slug, cat.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              {t.footer.corporate}
            </h3>
            <ul className="space-y-2">
              {corporateLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              {t.footer.contact}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
              <li>
                <a
                  href={telHref(settings.phone)}
                  className="flex items-center gap-3 text-sm text-slate-300 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  {settings.phone}
                </a>
              </li>
              {settings.whatsapp && (
                <li>
                  <a
                    href={whatsappHref(settings.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4 flex-shrink-0" />
                    {t.contact.whatsapp}: {formatWhatsappDisplay(settings.whatsapp)}
                  </a>
                </li>
              )}
              {settings.telegram && (
                <li>
                  <a
                    href={telegramHref(settings.telegram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <Send className="h-4 w-4 flex-shrink-0" />
                    {t.contact.telegram}: {formatTelegramDisplay(settings.telegram)}
                  </a>
                </li>
              )}
              <li>
                <a
                  href={mailtoHref(settings.email)}
                  className="flex items-center gap-3 text-sm text-slate-300 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} odonexo.com. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Troy</span>
            <span>{t.footer.ssl}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
