export function telHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

export function whatsappHref(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}`;
}

export function formatWhatsappDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/\D/g, "")}`;
}

export function telegramHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (/^t\.me\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  if (trimmed.includes(".") || trimmed.includes("/")) {
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }
  return `https://t.me/${trimmed.replace(/^@/, "")}`;
}

export function formatTelegramDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("@")) return trimmed;
  const tmeMatch = trimmed.match(/t\.me\/([^/?]+)/i);
  if (tmeMatch) return `@${tmeMatch[1]}`;
  if (!trimmed.includes(".") && !trimmed.includes("/")) {
    return `@${trimmed.replace(/^@/, "")}`;
  }
  return trimmed;
}

export function mailtoHref(email: string): string {
  return `mailto:${email.trim()}`;
}

export function socialHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

/** @user, tiktok.com/@user veya tam URL kabul eder. */
export function tiktokHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (/^(www\.)?tiktok\.com\//i.test(trimmed)) {
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }
  const handle = trimmed.replace(/^@/, "");
  if (!handle.includes(".") && !handle.includes("/")) {
    return `https://www.tiktok.com/@${handle}`;
  }
  return socialHref(trimmed);
}
