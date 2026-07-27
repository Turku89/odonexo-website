"use client";

import { Truck, ShieldCheck, Headphones, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function TrustBadges() {
  const { t } = useLanguage();

  const badges = [
    { icon: Truck, title: t.trust.fastShipping, description: t.trust.fastShippingDesc },
    { icon: ShieldCheck, title: t.trust.securePayment, description: t.trust.securePaymentDesc },
    { icon: Headphones, title: t.trust.support, description: t.trust.supportDesc },
    { icon: RotateCcw, title: t.trust.easyReturn, description: t.trust.easyReturnDesc },
  ];

  return (
    <section className="border-y border-neutral-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-muted">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{title}</h3>
                <p className="mt-1 text-sm text-neutral">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
