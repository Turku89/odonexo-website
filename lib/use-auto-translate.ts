"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { translateText } from "@/lib/translate";

/**
 * Dil SQ iken manuel çeviri yoksa Türkçe metni otomatik çevirir.
 * TR dilinde her zaman Türkçe metni döner.
 */
export function useAutoTranslate(
  textTr: string,
  textSq?: string | null
): { text: string; translating: boolean } {
  const { locale } = useLanguage();
  const trimmedSq = textSq?.trim() || "";
  const trimmedTr = textTr?.trim() || "";

  const manual =
    locale === "sq" && trimmedSq ? trimmedSq : textTr || "";

  const needsAuto =
    locale === "sq" && !trimmedSq && Boolean(trimmedTr);

  const [text, setText] = useState(manual);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!needsAuto) {
        setText(manual);
        setTranslating(false);
        return;
      }

      setTranslating(true);
      setText(manual);

      const translated = await translateText(trimmedTr, "tr", "sq");
      if (cancelled) return;

      setText(translated);
      setTranslating(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [locale, manual, needsAuto, trimmedTr]);

  return { text, translating };
}
