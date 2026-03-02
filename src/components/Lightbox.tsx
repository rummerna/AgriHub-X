import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  caption?: string;
}

const Lightbox = ({ images, initialIndex = 0, open, onClose, caption }: LightboxProps) => {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => { setCurrent(initialIndex); }, [initialIndex]);

  const prev = useCallback(() => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1)), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0)), [images.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, prev, next]);

  if (!open || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-foreground/90 flex flex-col items-center justify-center" onClick={onClose}>
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <a
          href={images[current]}
          download
          onClick={(e) => e.stopPropagation()}
          className="p-2 bg-background/20 hover:bg-background/40 rounded-full transition-colors"
        >
          <Download className="w-5 h-5 text-background" />
        </a>
        <button onClick={onClose} className="p-2 bg-background/20 hover:bg-background/40 rounded-full transition-colors">
          <X className="w-5 h-5 text-background" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center w-full relative" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <button onClick={prev} className="absolute left-4 p-2 bg-background/20 hover:bg-background/40 rounded-full transition-colors z-10">
            <ChevronLeft className="w-6 h-6 text-background" />
          </button>
        )}

        <img
          src={images[current]}
          alt=""
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />

        {images.length > 1 && (
          <button onClick={next} className="absolute right-4 p-2 bg-background/20 hover:bg-background/40 rounded-full transition-colors z-10">
            <ChevronRight className="w-6 h-6 text-background" />
          </button>
        )}
      </div>

      {/* Info bar */}
      <div className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
        {caption && <p className="text-sm text-background/80 mb-1">{caption}</p>}
        {images.length > 1 && (
          <div className="flex gap-1.5 justify-center">
            {images.map((url, idx) => (
              <button
                key={url}
                onClick={() => setCurrent(idx)}
                className={`w-10 h-10 rounded border-2 overflow-hidden transition-all ${
                  idx === current ? "border-primary scale-110" : "border-background/30 opacity-60"
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lightbox;
