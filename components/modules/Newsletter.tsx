"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function Newsletter() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-brand-dark px-8 py-12 md:px-16 md:py-16">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[20px] border-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full border-[15px] border-white/5" />

          <div className="relative mx-auto max-w-2xl text-center">
            <Mail className="mx-auto h-10 w-10 text-blue-200" />
            <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
              {t.newsletter.title}
            </h2>
            <p className="mt-3 text-blue-100">{t.newsletter.description}</p>

            {submitted ? (
              <p className="mt-8 rounded-lg bg-white/10 px-6 py-4 text-white">
                {t.newsletter.success}
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.newsletter.placeholder}
                  required
                  className="flex-1 rounded-lg border-0 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button type="submit" className="btn-primary bg-white text-brand hover:bg-blue-50">
                  {t.newsletter.subscribe}
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
