"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { translateText, type Lang } from "@/lib/translate";
import type { Locale } from "@/lib/i18n/translations";

export type LocalizedTexts = {
  tr: string;
  sq?: string | null;
  en?: string | null;
};

function pickManual(texts: LocalizedTexts, locale: Locale): string {
  const tr = texts.tr?.trim() || "";
  const sq = texts.sq?.trim() || "";
  const en = texts.en?.trim() || "";

  if (locale === "sq" && sq) return sq;
  if (locale === "en" && en) return en;
  if (locale === "tr") return tr;
  return tr || sq || en;
}

/**
 * Manuel çeviri varsa onu kullanır; yoksa hedef dile otomatik çevirir.
 * EN için önce Arnavutça (sq), yoksa Türkçe kaynak kullanılır.
 */
export function useAutoTranslate(
  textTrOrTexts: string | LocalizedTexts,
  textSq?: string | null,
  textEn?: string | null
): { text: string; translating: boolean } {
  const { locale } = useLanguage();

  const texts: LocalizedTexts =
    typeof textTrOrTexts === "string"
      ? { tr: textTrOrTexts, sq: textSq, en: textEn }
      : textTrOrTexts;

  const tr = texts.tr?.trim() || "";
  const sq = texts.sq?.trim() || "";
  const en = texts.en?.trim() || "";

  const manual = pickManual(texts, locale);

  const source = useMemo(() => {
    if (locale === "sq" && !sq) {
      if (tr) return { text: tr, from: "tr" as Lang };
      if (en) return { text: en, from: "en" as Lang };
      return null;
    }
    if (locale === "en" && !en) {
      if (sq) return { text: sq, from: "sq" as Lang };
      if (tr) return { text: tr, from: "tr" as Lang };
      return null;
    }
    return null;
  }, [locale, tr, sq, en]);

  const needsAuto = Boolean(source);
  const [text, setText] = useState(manual);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!needsAuto || !source) {
        setText(manual);
        setTranslating(false);
        return;
      }

      setTranslating(true);
      setText(manual || source.text);

      const translated = await translateText(
        source.text,
        source.from,
        locale as Lang
      );
      if (cancelled) return;

      setText(translated);
      setTranslating(false);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [locale, manual, needsAuto, source]);

  return { text, translating };
}
