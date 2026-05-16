/**
 * Browser → Cloudinary unsigned upload. The backend has no Cloudinary
 * creds — the frontend uploads directly with the unsigned preset, then
 * registers the resulting metadata via POST /api/v1/media.
 *
 * Env vars consumed (must be exposed to the browser):
 *   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   - NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET
 */

import type { MediaType } from "@/lib/types/media";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET ?? "";

/** Minimal subset of the Cloudinary upload response we care about. */
export interface CloudinaryAsset {
  type: MediaType;
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
}

/** Cloudinary uses 'image' / 'video' / 'raw' resource types. We never use raw. */
export type CloudinaryResource = "image" | "video";

interface CloudinaryRawResponse {
  secure_url?: string;
  public_id?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
  resource_type?: string;
  error?: { message?: string };
  message?: string;
}

export class CloudinaryUploadError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "CloudinaryUploadError";
  }
}

export interface UploadOptions {
  /** Forces the resource type endpoint. Auto-detected from MIME if omitted. */
  resourceType?: CloudinaryResource;
  /** 0–1 progress callback driven by XHR upload events. */
  onProgress?: (fraction: number) => void;
  /** Optional AbortSignal — calls xhr.abort() when fired. */
  signal?: AbortSignal;
}

function detectResource(file: File): CloudinaryResource {
  if (file.type.startsWith("video/")) return "video";
  return "image";
}

function detectMediaType(resource: CloudinaryResource): MediaType {
  // Backend's `type` enum is image/video/audio. We only upload via the image +
  // video endpoints, so the backend type matches the resource type 1:1.
  return resource;
}

function ensureConfig(): void {
  if (!CLOUD_NAME || !PRESET) {
    throw new CloudinaryUploadError(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET.",
      0,
    );
  }
}

/**
 * Uploads a single file to Cloudinary. Returns the asset metadata you can
 * forward to `registerMedia` (POST /api/v1/media).
 *
 * Uses XMLHttpRequest to surface real progress events — `fetch` doesn't
 * expose them on the upload side.
 */
export function uploadToCloudinary(
  file: File,
  opts: UploadOptions = {},
): Promise<CloudinaryAsset> {
  ensureConfig();
  const resource = opts.resourceType ?? detectResource(file);
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource}/upload`;

  return new Promise<CloudinaryAsset>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", PRESET);

    xhr.open("POST", url);

    if (opts.onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          opts.onProgress?.(event.loaded / event.total);
        }
      };
    }

    xhr.onload = () => {
      let parsed: CloudinaryRawResponse | null = null;
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch {
        reject(
          new CloudinaryUploadError(
            "Cloudinary returned an invalid response.",
            xhr.status,
          ),
        );
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(
          new CloudinaryUploadError(
            parsed?.error?.message ??
              parsed?.message ??
              `Cloudinary upload failed (status ${xhr.status})`,
            xhr.status,
          ),
        );
        return;
      }
      if (!parsed?.secure_url || !parsed?.public_id) {
        reject(
          new CloudinaryUploadError(
            "Cloudinary response missing secure_url or public_id.",
            xhr.status,
          ),
        );
        return;
      }
      resolve({
        type: detectMediaType(resource),
        url: parsed.secure_url,
        publicId: parsed.public_id,
        format: parsed.format,
        bytes: parsed.bytes,
        width: parsed.width,
        height: parsed.height,
        duration: parsed.duration,
      });
    };

    xhr.onerror = () => {
      reject(new CloudinaryUploadError("Network error contacting Cloudinary.", 0));
    };
    xhr.onabort = () => {
      reject(new CloudinaryUploadError("Upload cancelled.", 0));
    };

    if (opts.signal) {
      if (opts.signal.aborted) {
        xhr.abort();
        return;
      }
      opts.signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(form);
  });
}
