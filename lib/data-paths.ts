import path from "path";

/** Vercel'de kalıcı yazma yok; /tmp kullanılır. Yerelde data/ kullanılır. */
export function getWritableDataDir(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join("/tmp", "odonexo-data");
  }
  return path.join(process.cwd(), "data");
}

export function getReadableDataDir(): string {
  return path.join(process.cwd(), "data");
}
