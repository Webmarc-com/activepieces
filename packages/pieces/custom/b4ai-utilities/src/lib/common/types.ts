/**
 * B4AI Utilities API Type Definitions
 */

/**
 * Authentication credentials for B4AI Upload API
 */
export interface B4AIUtilitiesAuth {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Status of a file upload
 */
export type FileUploadStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

/**
 * Storage configuration details
 */
export interface StorageConfig {
  id: string;
  name: string;
  provider: string;
}

/**
 * File owner details
 */
export interface FileOwner {
  id: string;
  email: string;
}

/**
 * File upload object representing an uploaded file
 */
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string | null;
  status: FileUploadStatus;
  createdAt: string;
  updatedAt: string;
  storageConfigId: string;
  storageConfig?: StorageConfig;
  owner?: FileOwner;
}

/**
 * Response from list files endpoint
 */
export interface ListFilesResponse {
  fileUploads: FileUpload[];
}

/**
 * Response from upload/get file endpoints
 */
export interface FileUploadResponse {
  success: boolean;
  message: string;
  fileUpload: FileUpload;
}

/**
 * Response from delete file endpoint
 */
export interface DeleteFileResponse {
  success: boolean;
  message: string;
}

/**
 * Query parameters for list files
 */
export interface ListFilesQuery {
  ownerId?: string;
}
