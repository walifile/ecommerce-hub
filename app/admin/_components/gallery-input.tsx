"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImageAction } from "@/app/admin/actions";

export function GalleryInput({
  value,
  onChange,
  folder = "products",
}: {
  /** Newline-separated image URLs (matches the form field string). */
  value: string;
  onChange: (value: string) => void;
  folder?: string;
}) {
  const [addingNew, setAddingNew] = useState(false);
  const [replacingIdx, setReplacingIdx] = useState<number | null>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRefs = useRef<(HTMLInputElement | null)[]>([]);

  const urls = value
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  function update(newUrls: string[]) {
    onChange(newUrls.join("\n"));
  }

  function remove(index: number) {
    update(urls.filter((_, i) => i !== index));
  }

  async function uploadAndAdd(files: File[]) {
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!validFiles.length) {
      toast.error("Please choose image files.");
      return;
    }
    setAddingNew(true);
    const results = await Promise.all(
      validFiles.map((file) => {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("folder", folder);
        return uploadImageAction(fd);
      })
    );
    setAddingNew(false);
    const uploaded: string[] = [];
    for (const r of results) {
      if (r.status === "success") uploaded.push(r.url);
      else toast.error(r.message);
    }
    if (uploaded.length) {
      update([...urls, ...uploaded]);
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded.`);
    }
  }

  async function uploadAndReplace(file: File, index: number) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setReplacingIdx(index);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", folder);
    const result = await uploadImageAction(fd);
    setReplacingIdx(null);
    if (result.status === "success") {
      const newUrls = [...urls];
      newUrls[index] = result.url;
      update(newUrls);
      toast.success("Image replaced.");
    } else {
      toast.error(result.message);
    }
  }

  const busy = addingNew || replacingIdx !== null;

  return (
    <div className="space-y-3">
      {/* Thumbnail grid */}
      <div className="flex flex-wrap gap-3">
        {urls.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="group relative size-24 overflow-hidden rounded-lg border border-border/70 bg-muted bg-cover bg-center shrink-0"
            style={{ backgroundImage: `url(${url})` }}
          >
            {/* Remove */}
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={busy}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500 disabled:pointer-events-none"
            >
              <X className="size-3" />
            </button>

            {/* Replace */}
            <button
              type="button"
              onClick={() => replaceRefs.current[i]?.click()}
              disabled={busy}
              aria-label="Replace image"
              className="absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary disabled:pointer-events-none"
            >
              {replacingIdx === i ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Pencil className="size-3" />
              )}
            </button>

            <input
              ref={(el) => { replaceRefs.current[i] = el; }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAndReplace(file, i);
                e.target.value = "";
              }}
            />
          </div>
        ))}

        {/* Add slot */}
        <button
          type="button"
          onClick={() => addRef.current?.click()}
          disabled={busy}
          className="flex size-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/70 text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground disabled:opacity-50"
        >
          {addingNew ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <span className="text-[11px] font-medium">
            {addingNew ? "Uploading…" : "Add images"}
          </span>
        </button>
      </div>

      {urls.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No gallery images yet. Click &ldquo;Add images&rdquo; to upload.
        </p>
      )}

      {/* Hidden file input for adding */}
      <input
        ref={addRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) uploadAndAdd(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
