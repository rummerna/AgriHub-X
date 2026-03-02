import { useState } from "react";
import Lightbox from "./Lightbox";

interface ImageGridProps {
  images: string[];
  maxVisible?: number;
}

const ImageGrid = ({ images, maxVisible = 3 }: ImageGridProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  if (images.length === 0) return null;

  const visible = images.slice(0, maxVisible);
  const remaining = images.length - maxVisible;

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="flex gap-1.5 mb-2">
        {visible.map((url, idx) => (
          <button
            key={url}
            onClick={() => openLightbox(idx)}
            className="relative rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity"
            style={{ width: images.length === 1 ? "100%" : `${100 / Math.min(images.length, maxVisible)}%`, maxHeight: 200 }}
          >
            <img src={url} alt="" className="w-full h-full object-cover" style={{ minHeight: 80, maxHeight: 200 }} />
            {idx === maxVisible - 1 && remaining > 0 && (
              <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                <span className="text-background font-bold text-lg">+{remaining}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <Lightbox
        images={images}
        initialIndex={lightboxIdx}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};

export default ImageGrid;
