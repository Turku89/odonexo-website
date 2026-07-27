"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSiteSettings } from "@/lib/site-settings-context";
import {
  telHref,
  mailtoHref,
  whatsappHref,
  telegramHref,
  formatWhatsappDisplay,
  formatTelegramDisplay,
} from "@/lib/contact-links";

export default function ContactPageContent() {
  const { t } = useLanguage();
  const settings = useSiteSettings();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactItems = [
    {
      icon: MapPin,
      title: t.contact.address,
      content: settings.address,
    },
    {
      icon: Phone,
      title: t.contact.phone,
      content: settings.phone,
      href: telHref(settings.phone),
    },
    ...(settings.whatsapp
      ? [
          {
            icon: MessageCircle,
            title: t.contact.whatsapp,
            content: formatWhatsappDisplay(settings.whatsapp),
            href: whatsappHref(settings.whatsapp),
          },
        ]
      : []),
    ...(settings.telegram
      ? [
          {
            icon: Send,
            title: t.contact.telegram,
            content: formatTelegramDisplay(settings.telegram),
            href: telegramHref(settings.telegram),
          },
        ]
      : []),
    {
      icon: Mail,
      title: t.contact.email,
      content: settings.email,
      href: mailtoHref(settings.email),
    },
    {
      icon: Clock,
      title: t.contact.hours,
      content: settings.hours,
    },
  ];

  return (
    <>
      <section className="bg-brand py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            {t.contact.title}
          </h1>
          <p className="mt-4 text-lg text-blue-100">{t.contact.subtitle}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-6">
              {contactItems.map(({ icon: Icon, title, content, href }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-muted">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    {href ? (
                      <a
                        href={href}
                        target={
                          href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="mt-1 text-sm text-neutral hover:text-brand whitespace-pre-line"
                      >
                        {content}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-neutral whitespace-pre-line">
                        {content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-3">
              <div className="card p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                  {t.contact.formTitle}
                </h2>

                {submitted ? (
                  <div className="rounded-lg bg-green-50 p-6 text-center">
                    <p className="font-semibold text-green-800">
                      {t.contact.successTitle}
                    </p>
                    <p className="mt-2 text-sm text-green-700">
                      {t.contact.successDesc}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {t.contact.name}
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full rounded-lg border border-neutral-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {t.contact.emailLabel}
                        </label>
                        <input
                          type="email"
                          required
                          className="w-full rounded-lg border border-neutral-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {t.contact.subject}
                      </label>
                      <select className="w-full rounded-lg border border-neutral-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20">
                        <option>{t.contact.subjects.general}</option>
                        <option>{t.contact.subjects.product}</option>
                        <option>{t.contact.subjects.corporate}</option>
                        <option>{t.contact.subjects.support}</option>
                        <option>{t.contact.subjects.feedback}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {t.contact.message}
                      </label>
                      <textarea
                        required
                        rows={5}
                        className="w-full rounded-lg border border-neutral-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
                      />
                    </div>
                    <button type="submit" className="btn-primary">
                      {t.contact.send}
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
