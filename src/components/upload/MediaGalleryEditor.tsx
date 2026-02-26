"use client";

import { useState } from "react";
import { Star, Trash2, ArrowUp, ArrowDown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MediaItem {
  id?: string;
  url: string;
  mediaType: "image" | "video";
  mimeType: string;
  sizeBytes: number;
  isPrimary: boolean;
  order: number;
}

interface MediaGalleryEditorProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  onDelete?: (item: MediaItem) => void;
  propertyId: string;
  className?: string;
}

export function MediaGalleryEditor({
  items,
  onChange,
  onDelete,
  className,
}: MediaGalleryEditorProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  const setPrimary = (index: number) => {
    const updated = sortedItems.map((item, i) => ({
      ...item,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sortedItems.length) return;

    const updated = [...sortedItems];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated.map((item, i) => ({ ...item, order: i })));
  };

  const handleDelete = async (item: MediaItem, index: number) => {
    const key = item.id || item.url;
    setDeleting(key);

    try {
      if (item.id && onDelete) {
        await onDelete(item);
      }

      const updated = sortedItems
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, order: i }));

      // If we deleted the primary, set the first item as primary
      if (item.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }

      onChange(updated);
    } finally {
      setDeleting(null);
    }
  };

  if (sortedItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-gray-700">
        {sortedItems.length} archivo{sortedItems.length !== 1 ? "s" : ""} subido{sortedItems.length !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {sortedItems.map((item, index) => {
          const key = item.id || item.url;
          const isDeleting = deleting === key;

          return (
            <div
              key={key}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border transition-all duration-200",
                item.isPrimary && "ring-2 ring-blue-500",
                isDeleting && "opacity-50"
              )}
            >
              {item.mediaType === "video" ? (
                <div className="flex h-full items-center justify-center bg-gray-100">
                  <Play className="size-10 text-gray-400" />
                  <video
                    src={item.url}
                    className="absolute inset-0 h-full w-full object-cover"
                    muted
                  />
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              )}

              {item.isPrimary && (
                <span className="absolute top-1 left-1 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Principal
                </span>
              )}

              {/* Controls overlay */}
              <div className="absolute inset-0 flex items-end justify-center gap-1 bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                {!item.isPrimary && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-xs"
                    onClick={() => setPrimary(index)}
                    title="Establecer como principal"
                  >
                    <Star className="size-3" />
                  </Button>
                )}

                {index > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-xs"
                    onClick={() => moveItem(index, "up")}
                    title="Mover arriba"
                  >
                    <ArrowUp className="size-3" />
                  </Button>
                )}

                {index < sortedItems.length - 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-xs"
                    onClick={() => moveItem(index, "down")}
                    title="Mover abajo"
                  >
                    <ArrowDown className="size-3" />
                  </Button>
                )}

                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  onClick={() => handleDelete(item, index)}
                  disabled={isDeleting}
                  title="Eliminar"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
