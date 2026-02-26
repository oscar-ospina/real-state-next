"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileImage, FileVideo, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  publicUrl?: string;
  error?: string;
}

interface FileUploaderProps {
  allowedTypes: string[];
  maxSize: number;
  maxFiles?: number;
  folder: "properties" | "documents" | "user-documents";
  entityId: string;
  onUploadComplete: (url: string, metadata: { mimeType: string; sizeBytes: number; fileName: string }) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  label?: string;
  description?: string;
}

export function FileUploader({
  allowedTypes,
  maxSize,
  maxFiles = 10,
  folder,
  entityId,
  onUploadComplete,
  onUploadError,
  className,
  label = "Arrastra archivos aqui o haz clic para seleccionar",
  description,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return FileImage;
    if (mimeType.startsWith("video/")) return FileVideo;
    return File;
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido: ${file.type}`;
    }
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      return `El archivo excede el tamano maximo de ${maxMB}MB`;
    }
    return null;
  };

  const uploadFile = async (uploadedFile: UploadedFile, index: number) => {
    try {
      // Step 1: Get signed URL
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "uploading" as const, progress: 10 } : f))
      );

      const signedUrlRes = await fetch("/api/upload/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadedFile.file.name,
          contentType: uploadedFile.file.type,
          folder,
          entityId,
        }),
      });

      if (!signedUrlRes.ok) {
        const err = await signedUrlRes.json();
        throw new Error(err.error || "Error al obtener URL de carga");
      }

      const { uploadUrl, publicUrl } = await signedUrlRes.json();

      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, progress: 30 } : f))
      );

      // Step 2: Upload directly to GCS
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": uploadedFile.file.type },
        body: uploadedFile.file,
      });

      if (!uploadRes.ok) {
        throw new Error("Error al subir el archivo a almacenamiento");
      }

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "done" as const, progress: 100, publicUrl } : f
        )
      );

      onUploadComplete(publicUrl, {
        mimeType: uploadedFile.file.type,
        sizeBytes: uploadedFile.file.size,
        fileName: uploadedFile.file.name,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "error" as const, error: message } : f
        )
      );
      onUploadError?.(message);
    }
  };

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const remaining = maxFiles - files.filter((f) => f.status !== "error").length;

      if (remaining <= 0) {
        onUploadError?.(`Maximo ${maxFiles} archivos permitidos`);
        return;
      }

      const toProcess = fileArray.slice(0, remaining);

      toProcess.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          onUploadError?.(error);
          return;
        }

        const preview = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined;

        const uploadedFile: UploadedFile = {
          file,
          preview,
          progress: 0,
          status: "pending",
        };

        setFiles((prev) => {
          const newIndex = prev.length;
          const updated = [...prev, uploadedFile];
          // Start upload async
          setTimeout(() => uploadFile(uploadedFile, newIndex), 0);
          return updated;
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files, maxFiles, folder, entityId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-all duration-200",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        )}
      >
        <Upload className="size-8 text-gray-400" />
        <p className="text-sm text-gray-600 text-center">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 text-center">{description}</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={allowedTypes.join(",")}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => {
            const Icon = getFileIcon(f.file.type);
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {f.preview ? (
                  <img
                    src={f.preview}
                    alt={f.file.name}
                    className="size-10 rounded object-cover"
                  />
                ) : (
                  <Icon className="size-10 text-gray-400" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatSize(f.file.size)}
                    {f.status === "error" && (
                      <span className="text-red-500 ml-2">{f.error}</span>
                    )}
                  </p>

                  {f.status === "uploading" && (
                    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {f.status === "done" && (
                    <span className="text-xs text-green-600 font-medium">Listo</span>
                  )}
                  {f.status !== "uploading" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                    >
                      <X className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
