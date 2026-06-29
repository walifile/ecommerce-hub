"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImageAction } from "@/app/admin/actions";

export function ImageInput({
  value,
  onChange,
  onFileSelect,
  folder = "misc",
  placeholder = "https://… or upload",
}: {
  value: string;
  onChange: (url: string) => void;
  /** When provided, file selection shows a local preview instead of uploading immediately. */
  onFileSelect?: (file: File | null) => void;
  /** Storage subfolder for immediate uploads (e.g. "products", "categories"). */
  folder?: string;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayUrl = localPreview ?? value;

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    if (onFileSelect) {
      // Deferred mode: show local preview, upload happens on form submit
      if (localPreview) URL.revokeObjectURL(localPreview);
      const blob = URL.createObjectURL(file);
      setLocalPreview(blob);
      onFileSelect(file);
      return;
    }

    // Immediate upload mode (legacy)
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", folder);
    const result = await uploadImageAction(fd);
    setUploading(false);
    if (result.status === "success") {
      onChange(result.url);
      toast.success("Image uploaded.");
    } else {
      toast.error(result.message);
    }
  }

  function handleClear() {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
    onChange("");
    onFileSelect?.(null);
  }

  return (
    <div className="flex items-start gap-3">
      {/* Thumbnail */}
      <div
        className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-border/70 bg-muted bg-cover bg-center"
        style={displayUrl ? { backgroundImage: `url(${displayUrl})` } : undefined}
      >
        {!displayUrl && <ImagePlus className="size-5 text-muted-foreground" />}
        {localPreview && (
          <span className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center text-[9px] font-medium text-white">
            Preview
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <Input
          value={localPreview ? "(local file — will upload on save)" : value}
          readOnly={Boolean(localPreview)}
          onChange={(e) => !localPreview && onChange(e.target.value)}
          placeholder={placeholder}
          className={localPreview ? "text-muted-foreground italic" : ""}
        />
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </>
            ) : displayUrl ? (
              <>
                <Pencil className="size-4" />
                Change
              </>
            ) : (
              <>
                <ImagePlus className="size-4" />
                Upload
              </>
            )}
          </Button>
          {displayUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-md text-muted-foreground"
              onClick={handleClear}
            >
              <X className="size-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
