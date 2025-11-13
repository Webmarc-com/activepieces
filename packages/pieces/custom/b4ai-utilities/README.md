# B4AI Utilities

File upload and management utilities for the B4AI platform. Upload, download, list, and manage files stored in Google Cloud Storage via the B4AI Upload API.

## Features

This piece provides comprehensive file management capabilities:

- **Upload File** - Upload files to Google Cloud Storage
- **List Files** - List all uploaded files with optional filtering by owner
- **Get File Details** - Retrieve detailed information about a specific file
- **Download File** - Download files as base64-encoded data
- **Delete File** - Remove files from storage

## Authentication

To use this piece, you need:

1. **Base URL** - Your B4AI server base URL (e.g., `https://your-server.com`)
2. **API Key** - Your B4AI API Key
3. **API Secret** - Your B4AI API Secret

### How to Obtain API Credentials

1. Log in to your B4AI platform
2. Navigate to **Settings > API Keys**
3. Generate a new API key pair (key + secret)
4. Copy both the API Key and API Secret
5. Keep your credentials secure - never expose them in client-side code

## Actions

### 1. Upload File

Upload a file to Google Cloud Storage via the B4AI Upload API.

**Parameters:**
- `file` (required) - The file to upload

**Returns:**
```json
{
  "success": true,
  "fileUpload": {
    "id": "uuid",
    "filename": "generated-filename.ext",
    "originalName": "myfile.pdf",
    "mimeType": "application/pdf",
    "size": 12345,
    "path": "path/in/storage",
    "url": "https://storage.url/file",
    "status": "COMPLETED",
    "createdAt": "2025-01-13T10:00:00Z",
    "updatedAt": "2025-01-13T10:00:00Z",
    "storageConfigId": "uuid",
    "storageConfig": {
      "id": "uuid",
      "name": "Main Storage",
      "provider": "google-cloud-storage"
    },
    "owner": {
      "id": "uuid",
      "email": "user@example.com"
    }
  },
  "message": "File uploaded successfully"
}
```

**Notes:**
- Files are stored in Google Cloud Storage
- Files are NOT public by default (security)
- A unique filename is generated to avoid conflicts
- The original filename and MIME type are preserved
- Check file size limits with your administrator

---

### 2. List Files

List all uploaded files, optionally filtered by owner ID.

**Parameters:**
- `ownerId` (optional) - Filter files by owner ID (UUID). Leave empty to list all files.

**Returns:**
```json
{
  "success": true,
  "fileUploads": [
    {
      "id": "uuid",
      "filename": "file1.pdf",
      "originalName": "document.pdf",
      "mimeType": "application/pdf",
      "size": 12345,
      "status": "COMPLETED",
      ...
    }
  ],
  "count": 1,
  "message": "Found 1 file(s)"
}
```

---

### 3. Get File Details

Get detailed information about a specific file by its ID.

**Parameters:**
- `fileId` (required) - The UUID of the file to retrieve

**Returns:**
```json
{
  "success": true,
  "fileUpload": {
    "id": "uuid",
    "filename": "file.pdf",
    "originalName": "document.pdf",
    ...
  },
  "message": "Retrieved details for file \"document.pdf\""
}
```

---

### 4. Download File

Download a file by its ID and return it as base64-encoded data.

**Parameters:**
- `fileId` (required) - The UUID of the file to download

**Returns:**
```json
{
  "success": true,
  "file": {
    "filename": "document.pdf",
    "contentType": "application/pdf",
    "base64": "JVBERi0xLjQKJeLjz9...",
    "size": 123456
  },
  "message": "File downloaded successfully"
}
```

**Notes:**
- The file is returned as base64-encoded data
- You can decode and save the file or pass it to other actions
- Large files may take longer to download

---

### 5. Delete File

Delete a file by its ID from Google Cloud Storage.

**Parameters:**
- `fileId` (required) - The UUID of the file to delete

**Returns:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Warning:** This action permanently removes the file from storage and cannot be undone.

---

## File Upload Object Schema

All file upload responses include a file upload object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string (UUID) | Unique identifier for the file |
| `filename` | string | Generated filename in storage |
| `originalName` | string | Original filename when uploaded |
| `mimeType` | string | MIME type of the file |
| `size` | number | File size in bytes |
| `path` | string | Path in storage system |
| `url` | string \| null | Public URL (if configured) |
| `status` | string | Status: PENDING, PROCESSING, COMPLETED, ERROR |
| `createdAt` | string (datetime) | When the file was uploaded |
| `updatedAt` | string (datetime) | Last update timestamp |
| `storageConfigId` | string (UUID) | Storage configuration ID |
| `storageConfig` | object | Storage configuration details |
| `owner` | object | File owner details |

## Error Handling

The piece handles various error scenarios:

- **400 Bad Request** - Invalid parameters or no file provided
- **401 Unauthorized** - Invalid API credentials
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - File does not exist
- **500 Server Error** - Internal server error

All errors include descriptive messages to help troubleshoot issues.

## Best Practices

1. **File Size** - Check file size limits with your administrator
2. **Cleanup** - Delete unused files to optimize storage costs
3. **Security** - Never expose API keys in client-side code
4. **Validation** - Validate file types before upload if needed
5. **Error Handling** - Always handle errors gracefully in your flows

## API Reference

For detailed API documentation, see `UPLOAD_API.md` in the project root.

## Support

For issues, questions, or feature requests, contact the B4AI Team.

---

**Version:** 1.0.0
**Author:** B4AI Team
**License:** Proprietary
