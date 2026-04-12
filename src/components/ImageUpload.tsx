import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, GripVertical, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  bucket: string;
  folder: string;
  maxImages?: number;
  images: string[];
  onChange: (urls: string[]) => void;
  showMainBadge?: boolean;
  required?: boolean;
  className?: string;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

const ImageUpload = ({
  bucket,
  folder,
  maxImages = 5,
  images,
  onChange,
  showMainBadge = false,
  required = false,
  className = "",
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        toast({ title: "Limit reached", description: `Max ${maxImages} images`, variant: "destructive" });
        return;
      }
      const toUpload = fileArr.slice(0, remaining);

      // Validate
      for (const f of toUpload) {
        if (!ALLOWED_TYPES.includes(f.type)) {
          toast({ title: "Invalid file type", description: `${f.name}: Only JPG, PNG, GIF allowed`, variant: "destructive" });
          return;
        }
        if (f.size > MAX_SIZE) {
          toast({ title: "File too large", description: `${f.name}: Max 5MB`, variant: "destructive" });
          return;
        }
      }

      setUploading(true);
      const newUrls: string[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        setProgress(Math.round(((i + 1) / toUpload.length) * 100));
        const file = toUpload[i];
        const ext = file.name.split(".").pop();
        const path = `${folder}/${Date.now()}_${i}.${ext}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
        if (error) {
          toast({ title: "Upload failed", description: error.message, variant: "destructive" });
          continue;
        }
        // Private buckets need signed URLs; public buckets use public URLs
        const privateBuckets = ["chat-images"];
        if (privateBuckets.includes(bucket)) {
          const { data: signedData } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365);
          if (signedData?.signedUrl) newUrls.push(signedData.signedUrl);
        } else {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
          newUrls.push(urlData.publicUrl);
        }
      }
      onChange([...images, ...newUrls]);
      setUploading(false);
      setProgress(0);
    },
    [bucket, folder, images, maxImages, onChange, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const setAsMain = (idx: number) => {
    if (idx === 0) return;
    const reordered = [...images];
    const [moved] = reordered.splice(idx, 1);
    reordered.unshift(moved);
    onChange(reordered);
  };

  // Simple drag reorder
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOverItem = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    onChange(reordered);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className={className}>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Thumbnails grid */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((url, idx) => (
              <div
                key={url}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group cursor-grab"
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOverItem(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                {showMainBadge && idx === 0 && (
                  <span className="absolute top-0.5 left-0.5 bg-primary text-primary-foreground text-[9px] font-bold px-1 rounded">
                    MAIN
                  </span>
                )}
                <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button onClick={() => removeImage(idx)} className="p-1 bg-background/80 rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                  {showMainBadge && idx !== 0 && (
                    <button onClick={() => setAsMain(idx)} className="p-1 bg-background/80 rounded-full" title="Set as main">
                      <Star className="w-3 h-3" />
                    </button>
                  )}
                  <GripVertical className="w-3 h-3 text-background" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload area */}
        {images.length < maxImages && (
          <div
            className="flex flex-col items-center justify-center py-4 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">Uploading {progress}%</p>
              </div>
            ) : (
              <>
                <Plus className="w-8 h-8 text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Click or drag to upload</p>
                <p className="text-xs text-muted-foreground">
                  {images.length}/{maxImages} images · JPG, PNG, GIF · Max 5MB
                  {required && images.length === 0 && " · Required"}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
