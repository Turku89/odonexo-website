"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface ProductImageViewerProps {
  images: string[];
  alt: string;
  priority?: boolean;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export default function ProductImageViewer({
  images,
  alt,
  priority = false,
}: ProductImageViewerProps) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const stageRef = useRef<HTMLDivElement>(null);

  const gallery = images.length > 0 ? images : ["/products/placeholder.png"];
  const currentSrc = gallery[activeIndex] || gallery[0];

  const resetZoom = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    resetZoom();
  }, [resetZoom]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + gallery.length) % gallery.length);
    resetZoom();
  }, [gallery.length, resetZoom]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % gallery.length);
    resetZoom();
  }, [gallery.length, resetZoom]);

  const clampOffset = useCallback((x: number, y: number, z: number) => {
    if (z <= 1) return { x: 0, y: 0 };
    const el = stageRef.current;
    if (!el) return { x, y };
    const maxX = (el.clientWidth * (z - 1)) / 2;
    const maxY = (el.clientHeight * (z - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  const setZoomAt = useCallback(
    (next: number, clientX?: number, clientY?: number) => {
      const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(next.toFixed(2))));
      if (z <= 1) {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        return;
      }

      setZoom((prev) => {
        if (Math.abs(z - prev) < 0.01) return prev;
        const el = stageRef.current;
        if (el && clientX != null && clientY != null) {
          const rect = el.getBoundingClientRect();
          const cx = clientX - rect.left - rect.width / 2;
          const cy = clientY - rect.top - rect.height / 2;
          const nx = offset.x - (cx * (z - prev)) / prev;
          const ny = offset.y - (cy * (z - prev)) / prev;
          setOffset(clampOffset(nx, ny, z));
        } else {
          setOffset((o) => clampOffset(o.x, o.y, z));
        }
        return z;
      });
    },
    [clampOffset, offset.x, offset.y]
  );

  const zoomIn = useCallback(
    () => setZoomAt(zoom + ZOOM_STEP),
    [setZoomAt, zoom]
  );
  const zoomOut = useCallback(
    () => setZoomAt(zoom - ZOOM_STEP),
    [setZoomAt, zoom]
  );

  useEffect(() => {
    if (activeIndex >= gallery.length) setActiveIndex(0);
  }, [activeIndex, gallery.length]);

  useEffect(() => {
    if (!isOpen) return;
    const el = stageRef.current;
    if (!el) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setZoomAt(zoom + delta, e.clientX, e.clientY);
    };

    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, [isOpen, zoom, setZoomAt]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, goPrev, goNext, zoomIn, zoomOut, resetZoom]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || zoom <= 1) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(
      clampOffset(
        dragStart.current.ox + dx,
        dragStart.current.oy + dy,
        zoom
      )
    );
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(false);
    }
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoom > 1) resetZoom();
    else setZoomAt(2.5, e.clientX, e.clientY);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
        aria-label={t.products.clickToEnlarge}
      >
        <div className="relative aspect-[4/3] w-full sm:aspect-square lg:aspect-[4/3]">
          <Image
            src={currentSrc}
            alt={alt}
            fill
            priority={priority}
            className="object-contain p-6 sm:p-8 transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-slate-700 shadow-md">
            <ZoomIn className="h-4 w-4 text-brand" />
            {t.products.clickToEnlarge}
          </span>
        </div>
      </button>

      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {gallery.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                resetZoom();
              }}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                index === activeIndex
                  ? "border-brand ring-2 ring-brand/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              aria-label={`Görsel ${index + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} ${index + 1}`}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className="relative z-20 flex items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="min-w-0 truncate text-sm text-white/80">
              {alt}
              {gallery.length > 1 && (
                <span className="ml-2 text-white/50">
                  ({activeIndex + 1} / {gallery.length})
                </span>
              )}
            </p>
            <div className="flex flex-shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= MIN_ZOOM}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
                aria-label={t.products.zoomOut}
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="min-w-[3.5rem] text-center text-sm tabular-nums text-white/80">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
                aria-label={t.products.zoomIn}
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                disabled={zoom === 1}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
                aria-label={t.products.zoomReset}
              >
                <Maximize2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={close}
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                aria-label={t.products.closeImage}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Önceki görsel"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Sonraki görsel"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div
              ref={stageRef}
              className={`relative h-full max-h-[calc(100vh-5.5rem)] w-full max-w-5xl overflow-hidden rounded-2xl bg-black/40 ${
                zoom > 1
                  ? dragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : "cursor-zoom-in"
              }`}
              onClick={(e) => {
                if (e.target === e.currentTarget && zoom <= 1) close();
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onDoubleClick={onDoubleClick}
            >
              <div
                className="absolute inset-0 origin-center will-change-transform"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transition: dragging ? "none" : "transform 0.15s ease-out",
                }}
              >
                <Image
                  src={currentSrc}
                  alt={alt}
                  fill
                  className="object-contain p-4 sm:p-6 pointer-events-none select-none"
                  sizes="90vw"
                  priority
                  draggable={false}
                />
              </div>
            </div>
          </div>

          <p className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/70">
            {t.products.zoomHint}
          </p>
        </div>
      )}
    </>
  );
}
