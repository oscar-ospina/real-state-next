"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  propertyFormSchema,
  propertyTypeLabels,
} from "@/lib/validations/property";
import { FileUploader } from "@/components/upload/FileUploader";
import {
  MediaGalleryEditor,
  type MediaItem,
} from "@/components/upload/MediaGalleryEditor";
import { DocumentUploader } from "@/components/upload/DocumentUploader";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "@/lib/services/upload-constants";

interface UploadedDocument {
  documentType: string;
  url: string;
  fileName: string;
  sizeBytes?: number;
}

interface PropertyData {
  id?: string;
  title: string;
  description?: string | null;
  propertyType: string;
  price: string;
  currency: string;
  address: string;
  city: string;
  neighborhood?: string | null;
  bedrooms: number;
  bathrooms: number;
  areaSqm?: string | null;
  isFurnished: boolean;
  isAvailable?: boolean;
  publisherRole?: string;
  isNegotiable?: boolean;
  minPrice?: string | null;
  isHorizontalProperty?: boolean;
  status?: string;
}

interface PropertyFormProps {
  initialData?: PropertyData;
  initialMedia?: MediaItem[];
  initialDocuments?: UploadedDocument[];
  mode?: "create" | "edit";
}

export function PropertyForm({
  initialData,
  initialMedia = [],
  initialDocuments = [],
  mode = "create",
}: PropertyFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [propertyType, setPropertyType] = useState(
    initialData?.propertyType || "apartment",
  );
  const [currency, setCurrency] = useState(initialData?.currency || "COP");
  const [isAvailable, setIsAvailable] = useState(
    initialData?.isAvailable ?? true,
  );
  const [publisherRole, setPublisherRole] = useState<"owner" | "mandatario">(
    (initialData?.publisherRole as "owner" | "mandatario") || "owner",
  );
  const [isNegotiable, setIsNegotiable] = useState(
    initialData?.isNegotiable ?? false,
  );
  const [isHorizontalProperty, setIsHorizontalProperty] = useState(
    initialData?.isHorizontalProperty ?? false,
  );

  // Media and documents state (edit mode only)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia);
  const [uploadedDocuments, setUploadedDocuments] =
    useState<UploadedDocument[]>(initialDocuments);

  const isEditMode = mode === "edit";
  const propertyId = initialData?.id;

  const handleMediaUploadComplete = async (
    url: string,
    metadata: { mimeType: string; sizeBytes: number; fileName: string },
  ) => {
    const mediaType = metadata.mimeType.startsWith("video/")
      ? ("video" as const)
      : ("image" as const);
    const isPrimary = mediaItems.length === 0;
    const order = mediaItems.length;

    const newItem: MediaItem = {
      url,
      mediaType,
      mimeType: metadata.mimeType,
      sizeBytes: metadata.sizeBytes,
      isPrimary,
      order,
    };

    // Save to DB
    if (propertyId) {
      try {
        const res = await fetch(`/api/properties/${propertyId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });
        if (res.ok) {
          const saved = await res.json();
          newItem.id = saved.id;
        }
      } catch (err) {
        console.error("Error saving media:", err);
      }
    }

    setMediaItems((prev) => [...prev, newItem]);
  };

  const handleMediaDelete = async (item: MediaItem) => {
    if (item.id && propertyId) {
      await fetch(`/api/properties/${propertyId}/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: item.id }),
      });
    }
  };

  const handleDocumentUploaded = async (doc: UploadedDocument) => {
    // Save to DB
    if (propertyId) {
      try {
        await fetch(`/api/properties/${propertyId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(doc),
        });
      } catch (err) {
        console.error("Error saving document:", err);
      }
    }

    setUploadedDocuments((prev) => [...prev, doc]);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    const data = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      propertyType: propertyType,
      price: formData.get("price") as string,
      currency: currency,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      neighborhood: (formData.get("neighborhood") as string) || undefined,
      bedrooms: parseInt(formData.get("bedrooms") as string) || 0,
      bathrooms: parseInt(formData.get("bathrooms") as string) || 1,
      areaSqm: (formData.get("areaSqm") as string) || undefined,
      isFurnished: formData.get("isFurnished") === "on",
      publisherRole,
      isNegotiable,
      minPrice: isNegotiable
        ? (formData.get("minPrice") as string) || undefined
        : undefined,
      isHorizontalProperty,
      ...(isEditMode && { isAvailable }),
    };

    // Validacion client-side
    const result = propertyFormSchema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    // Enviar al API
    try {
      const url = isEditMode
        ? `/api/properties/${initialData?.id}`
        : "/api/properties";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...result.data,
          ...(isEditMode && { isAvailable }),
        }),
      });

      if (!res.ok) {
        const responseData = await res.json();
        setError(
          responseData.error ||
            `Error al ${isEditMode ? "actualizar" : "crear"} la propiedad`,
        );
        setLoading(false);
        return;
      }

      if (isEditMode) {
        router.push("/dashboard");
        router.refresh();
      } else {
        // After creating, redirect to edit page to add media/docs
        const newProperty = await res.json();
        router.push(`/dashboard/edit-property/${newProperty.id}`);
        router.refresh();
      }
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error general */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Seccion: Rol del Publicador */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Rol del Publicador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Indica si eres el propietario directo del inmueble o un mandatario
            autorizado.
          </p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="publisherRole"
                value="owner"
                checked={publisherRole === "owner"}
                onChange={() => setPublisherRole("owner")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Propietario</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="publisherRole"
                value="mandatario"
                checked={publisherRole === "mandatario"}
                onChange={() => setPublisherRole("mandatario")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Mandatario</span>
            </label>
          </div>
          {publisherRole === "mandatario" && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              Como mandatario, deberas subir el contrato de mandato que te
              autoriza a administrar este inmueble.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Seccion: Informacion Basica */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Informacion Basica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo de la propiedad *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ej: Apartamento moderno en Chapinero"
              required
              defaultValue={initialData?.title}
              className={fieldErrors.title ? "border-red-500" : ""}
            />
            {fieldErrors.title && (
              <p className="text-sm text-red-600">{fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe las caracteristicas de tu propiedad..."
              rows={4}
              defaultValue={initialData?.description || ""}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de propiedad *</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(propertyTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isFurnished"
                  defaultChecked={initialData?.isFurnished}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                />
                <span className="text-sm font-medium">Amoblado</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Precio y Caracteristicas */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Precio y Caracteristicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio mensual *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="1500000"
                required
                min="0"
                defaultValue={initialData?.price}
                className={fieldErrors.price ? "border-red-500" : ""}
              />
              {fieldErrors.price && (
                <p className="text-sm text-red-600">{fieldErrors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COP">COP (Pesos)</SelectItem>
                  <SelectItem value="USD">USD (Dolares)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Precio negociable */}
          <div className="space-y-3 pt-2 border-t">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
              />
              <span className="text-sm font-medium">
                Precio negociable
              </span>
            </label>

            {isNegotiable && (
              <div className="space-y-2 pl-8">
                <Label htmlFor="minPrice">
                  Precio minimo aceptable (opcional)
                </Label>
                <Input
                  id="minPrice"
                  name="minPrice"
                  type="number"
                  placeholder="1200000"
                  min="0"
                  defaultValue={initialData?.minPrice || ""}
                />
                <p className="text-xs text-gray-500">
                  Los interesados podran proponer un precio a partir de este
                  valor.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Habitaciones *</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                defaultValue={initialData?.bedrooms ?? 1}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Banos *</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="1"
                defaultValue={initialData?.bathrooms ?? 1}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaSqm">Area (m2)</Label>
              <Input
                id="areaSqm"
                name="areaSqm"
                type="number"
                placeholder="80"
                min="1"
                defaultValue={initialData?.areaSqm || ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Ubicacion */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Ubicacion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Direccion *</Label>
            <Input
              id="address"
              name="address"
              placeholder="Calle 100 # 15-20"
              required
              defaultValue={initialData?.address}
              className={fieldErrors.address ? "border-red-500" : ""}
            />
            {fieldErrors.address && (
              <p className="text-sm text-red-600">{fieldErrors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                name="city"
                placeholder="Bogota"
                required
                defaultValue={initialData?.city}
                className={fieldErrors.city ? "border-red-500" : ""}
              />
              {fieldErrors.city && (
                <p className="text-sm text-red-600">{fieldErrors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Barrio</Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                placeholder="Chapinero"
                defaultValue={initialData?.neighborhood || ""}
              />
            </div>
          </div>

          {/* Propiedad horizontal */}
          <div className="pt-2 border-t">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isHorizontalProperty}
                onChange={(e) => setIsHorizontalProperty(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
              />
              <span className="text-sm font-medium">
                Propiedad Horizontal
              </span>
            </label>
            {isHorizontalProperty && (
              <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                Deberas subir el reglamento de propiedad horizontal y el paz y
                salvo de administracion en la seccion de documentos.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Fotos y Videos (solo en modo edicion) */}
      {isEditMode && propertyId && (
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Fotos y Videos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Sube fotos (JPG, PNG, WebP) y videos (MP4) de tu propiedad. La
              primera imagen sera la principal.
            </p>

            <MediaGalleryEditor
              items={mediaItems}
              onChange={setMediaItems}
              onDelete={handleMediaDelete}
              propertyId={propertyId}
            />

            <FileUploader
              allowedTypes={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]}
              maxSize={MAX_VIDEO_SIZE}
              maxFiles={20}
              folder="properties"
              entityId={propertyId}
              onUploadComplete={handleMediaUploadComplete}
              label="Arrastra fotos y videos aqui o haz clic para seleccionar"
              description={`Imagenes: max ${MAX_IMAGE_SIZE / (1024 * 1024)}MB cada una. Videos MP4: max ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`}
            />
          </CardContent>
        </Card>
      )}

      {/* Seccion: Documentos de Verificacion (solo en modo edicion) */}
      {isEditMode && propertyId && (
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              Documentos de Verificacion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Estos documentos son necesarios para verificar la propiedad y
              evitar fraudes. Tu publicacion quedara pendiente de aprobacion.
            </p>

            <DocumentUploader
              publisherRole={publisherRole}
              isHorizontalProperty={isHorizontalProperty}
              propertyId={propertyId}
              uploadedDocuments={uploadedDocuments}
              onDocumentUploaded={handleDocumentUploaded}
            />
          </CardContent>
        </Card>
      )}

      {/* Nota para modo creacion */}
      {!isEditMode && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm border border-blue-200">
          Despues de crear la propiedad, podras subir fotos, videos y los
          documentos de verificacion requeridos.
        </div>
      )}

      {/* Seccion: Estado (solo en modo edicion) */}
      {isEditMode && (
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Estado de la Propiedad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                />
                <span className="text-sm font-medium">
                  Disponible para arriendo
                </span>
              </label>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isAvailable ? "Visible" : "Oculta"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de accion */}
      <div className="flex gap-4 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? isEditMode
              ? "Guardando..."
              : "Creando..."
            : isEditMode
              ? "Guardar Cambios"
              : "Crear Propiedad"}
        </Button>
      </div>
    </form>
  );
}
