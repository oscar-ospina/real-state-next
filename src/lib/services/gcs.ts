import "server-only";
import { Storage } from "@google-cloud/storage";

export {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_DOCUMENT_SIZE,
} from "./upload-constants";

let _storage: Storage | null = null;

function getStorage() {
  if (!_storage) {
    _storage = new Storage({ projectId: process.env.GCS_PROJECT_ID });
  }
  return _storage;
}

function getBucket() {
  return getStorage().bucket(process.env.GCS_BUCKET_NAME!);
}

interface SignedUrlOptions {
  fileName: string;
  contentType: string;
  folder: "properties" | "documents" | "user-documents";
  entityId: string;
}

export async function generateUploadSignedUrl(options: SignedUrlOptions) {
  const { fileName, contentType, folder, entityId } = options;
  const ext = fileName.split(".").pop();
  const uniqueName = `${folder}/${entityId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const [url] = await getBucket().file(uniqueName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  });

  const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${uniqueName}`;

  return { uploadUrl: url, publicUrl, filePath: uniqueName };
}

export async function deleteFile(filePath: string) {
  await getBucket().file(filePath).delete({ ignoreNotFound: true });
}
