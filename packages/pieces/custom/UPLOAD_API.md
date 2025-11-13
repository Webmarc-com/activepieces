# File Upload API Documentation

## Overview

This document provides comprehensive documentation for the File Upload API endpoints. These endpoints allow developers to upload, manage, and download files using Google Cloud Storage as the backend.

## Authentication

All endpoints require authentication using API keys. Include the following headers in every request:

```
x-api-key: YOUR_API_KEY
x-api-secret: YOUR_API_SECRET
```

### API Key Types

The API supports two types of authentication:

1. **HMAC-based API Keys**: Contains a period (`.`) in the key and uses cryptographic validation
2. **Database-based API Keys**: Traditional keys validated against the database

Both types use the same header format.

## Base URL

```
/api/upload
```

## Endpoints

### 1. List All File Uploads

Retrieve all file uploads with optional filtering by owner.

**Endpoint:** `GET /api/upload/files`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| ownerId   | string | No       | Filter file uploads by owner ID (User ID)      |

**Response Schema (200 OK):**

```json
{
  "fileUploads": [
    {
      "id": "uuid",
      "filename": "string",
      "originalName": "string",
      "mimeType": "string",
      "size": "number",
      "path": "string",
      "url": "string | null",
      "status": "PENDING | PROCESSING | COMPLETED | ERROR",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "storageConfigId": "uuid",
      "storageConfig": {
        "id": "string",
        "name": "string",
        "provider": "string"
      },
      "owner": {
        "id": "string",
        "email": "string"
      }
    }
  ]
}
```

**Example Request:**

```bash
curl -X GET "https://your-domain.com/api/upload/files" \
  -H "x-api-key: your-api-key" \
  -H "x-api-secret: your-api-secret"
```

**Example Request with Filter:**

```bash
curl -X GET "https://your-domain.com/api/upload/files?ownerId=123e4567-e89b-12d3-a456-426614174000" \
  -H "x-api-key: your-api-key" \
  -H "x-api-secret: your-api-secret"
```

**Response Codes:**

- `200` - Success
- `400` - Bad Request (invalid query parameters)
- `401` - Unauthorized (invalid or missing API key)

---

### 2. Get File Upload by ID

Retrieve details of a specific file upload by its ID.

**Endpoint:** `GET /api/upload/files/:id`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type   | Required | Description                     |
|-----------|--------|----------|---------------------------------|
| id        | uuid   | Yes      | The unique identifier of the file upload |

**Response Schema (200 OK):**

```json
{
  "success": true,
  "message": "File upload retrieved successfully",
  "fileUpload": {
    "id": "uuid",
    "filename": "string",
    "originalName": "string",
    "mimeType": "string",
    "size": "number",
    "path": "string",
    "url": "string | null",
    "status": "PENDING | PROCESSING | COMPLETED | ERROR",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "storageConfigId": "uuid",
    "storageConfig": {
      "id": "string",
      "name": "string",
      "provider": "string"
    },
    "owner": {
      "id": "string",
      "email": "string"
    }
  }
}
```

**Example Request:**

```bash
curl -X GET "https://your-domain.com/api/upload/files/123e4567-e89b-12d3-a456-426614174000" \
  -H "x-api-key: your-api-key" \
  -H "x-api-secret: your-api-secret"
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "File upload not found!"
}
```

**Response Codes:**

- `200` - Success
- `400` - Bad Request (invalid UUID format)
- `401` - Unauthorized (invalid or missing API key)
- `404` - Not Found (file upload does not exist)

---

### 3. Upload File to Google Cloud Storage

Upload a new file to Google Cloud Storage. The file is associated with the authenticated user's organization.

**Endpoint:** `POST /api/upload/files`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**

Send the file as a multipart form upload with the file field.

**Request Headers:**

```
Content-Type: multipart/form-data
x-api-key: YOUR_API_KEY
x-api-secret: YOUR_API_SECRET
```

**Response Schema (201 Created):**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "fileUpload": {
    "id": "uuid",
    "filename": "string",
    "originalName": "string",
    "mimeType": "string",
    "size": "number",
    "path": "string",
    "url": "string | null",
    "status": "PENDING | PROCESSING | COMPLETED | ERROR",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "storageConfigId": "uuid",
    "storageConfig": {
      "id": "string",
      "name": "string",
      "provider": "string"
    },
    "owner": {
      "id": "string",
      "email": "string"
    }
  }
}
```

**Example Request (curl):**

```bash
curl -X POST "https://your-domain.com/api/upload/files" \
  -H "x-api-key: your-api-key" \
  -H "x-api-secret: your-api-secret" \
  -F "file=@/path/to/your/file.pdf"
```

**Example Request (JavaScript/Fetch):**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('https://your-domain.com/api/upload/files', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-api-key',
    'x-api-secret': 'your-api-secret'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

**Example Request (Python):**

```python
import requests

url = "https://your-domain.com/api/upload/files"
headers = {
    "x-api-key": "your-api-key",
    "x-api-secret": "your-api-secret"
}

with open('/path/to/your/file.pdf', 'rb') as file:
    files = {'file': file}
    response = requests.post(url, headers=headers, files=files)
    print(response.json())
```

**Error Responses:**

**400 Bad Request - No File:**
```json
{
  "success": false,
  "message": "No file provided in the request"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "User authentication required"
}
```

**400 Bad Request - No Organization:**
```json
{
  "success": false,
  "message": "User does not have an organization"
}
```

**Response Codes:**

- `201` - Created (file uploaded successfully)
- `400` - Bad Request (no file provided or user has no organization)
- `401` - Unauthorized (invalid or missing API key, or user not authenticated)
- `500` - Internal Server Error

**Upload Behavior:**

- Files are uploaded to Google Cloud Storage
- Files are **not** made public by default (for security)
- The file is associated with the authenticated user's organization
- Original filename and MIME type are preserved
- A unique filename is generated to avoid conflicts

---

### 4. Download File from Google Cloud Storage

Download a file from Google Cloud Storage. The file is streamed directly to the client.

**Endpoint:** `GET /api/upload/files/:id/download`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type   | Required | Description                     |
|-----------|--------|----------|---------------------------------|
| id        | uuid   | Yes      | The unique identifier of the file upload |

**Response:**

The file is returned as a binary stream with appropriate headers:

- `Content-Disposition: attachment; filename="original-filename"`
- `Content-Type: <file-mime-type>`
- `Content-Length: <file-size>`

**Example Request:**

```bash
curl -X GET "https://your-domain.com/api/upload/files/123e4567-e89b-12d3-a456-426614174000/download" \
  -H "x-api-key: your-api-key" \
  -H "x-api-secret: your-api-secret" \
  -o downloaded-file.pdf
```

**Example Request (JavaScript/Fetch):**

```javascript
fetch('https://your-domain.com/api/upload/files/123e4567-e89b-12d3-a456-426614174000/download', {
  headers: {
    'x-api-key': 'your-api-key',
    'x-api-secret': 'your-api-secret'
  }
})
.then(response => response.blob())
.then(blob => {
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'downloaded-file.pdf';
  a.click();
})
.catch(error => console.error('Error:', error));
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "Error downloading file"
}
```

**Response Codes:**

- `200` - Success (file stream returned)
- `400` - Bad Request (invalid UUID format)
- `401` - Unauthorized (invalid or missing API key)
- `404` - Not Found (file upload does not exist)
- `500` - Internal Server Error

---

### 5. Delete File Upload

Delete a file upload and remove it from Google Cloud Storage.

**Endpoint:** `DELETE /api/upload/files/:id`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type   | Required | Description                     |
|-----------|--------|----------|---------------------------------|
| id        | uuid   | Yes      | The unique identifier of the file upload |

**Response Schema (200 OK):**

```json
{
  "success": true,
  "message": "File upload deleted successfully"
}
```

**Example Request:**

```bash
curl -X DELETE "https://your-domain.com/api/upload/files/123e4567-e89b-12d3-a456-426614174000" \
  -H "x-api-key: your-api-key" \
  -H "x-api-secret: your-api-secret"
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "File upload not found!"
}
```

**Response Codes:**

- `200` - Success (file deleted)
- `400` - Bad Request (invalid UUID format)
- `401` - Unauthorized (invalid or missing API key)
- `404` - Not Found (file upload does not exist)
- `500` - Internal Server Error

---

## Data Schemas

### FileUpload Object

| Field           | Type     | Description                                              |
|-----------------|----------|----------------------------------------------------------|
| id              | uuid     | Unique identifier for the file upload                    |
| filename        | string   | Stored filename in GCS (may differ from original)        |
| originalName    | string   | Original filename as uploaded by the user                |
| mimeType        | string   | MIME type of the file (e.g., "application/pdf")          |
| size            | number   | File size in bytes                                       |
| path            | string   | Storage path in Google Cloud Storage                     |
| url             | string\|null | Public URL if file is made public, null otherwise    |
| status          | enum     | File status: PENDING, PROCESSING, COMPLETED, ERROR       |
| createdAt       | datetime | Timestamp when the file was uploaded                     |
| updatedAt       | datetime | Timestamp when the file record was last updated          |
| storageConfigId | uuid     | ID of the storage configuration used                     |
| storageConfig   | object   | (Optional) Storage configuration details                 |
| owner           | object   | (Optional) Owner user details                            |

### StorageConfig Object

| Field    | Type   | Description                          |
|----------|--------|--------------------------------------|
| id       | string | Unique identifier for storage config |
| name     | string | Name of the storage configuration    |
| provider | string | Storage provider (e.g., "GCS")       |

### Owner Object

| Field | Type   | Description           |
|-------|--------|-----------------------|
| id    | string | User ID               |
| email | string | User email address    |

### File Status Enum

- `PENDING` - File upload initiated but not processed
- `PROCESSING` - File is being processed
- `COMPLETED` - File successfully uploaded and available
- `ERROR` - Error occurred during upload or processing

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {} // Only in development mode
}
```

### Common Error Codes

| Status Code | Description                                      |
|-------------|--------------------------------------------------|
| 400         | Bad Request - Invalid parameters or missing data |
| 401         | Unauthorized - Invalid or missing API credentials|
| 404         | Not Found - Resource does not exist              |
| 500         | Internal Server Error - Server-side error        |

---

## Best Practices

1. **File Size Limits**: Check with your administrator for maximum file size limits
2. **Supported File Types**: While any MIME type is accepted, verify with your use case requirements
3. **Error Handling**: Always implement proper error handling for network failures and API errors
4. **API Key Security**:
   - Never expose API keys in client-side code
   - Store API keys securely (environment variables, secrets management)
   - Rotate API keys regularly
5. **Rate Limiting**: Be aware of any rate limits imposed on the API
6. **File Cleanup**: Delete unused files to optimize storage costs

---

## Code Examples

### Complete Upload Workflow (Node.js)

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'https://your-domain.com/api/upload';
const API_KEY = 'your-api-key';
const API_SECRET = 'your-api-secret';

// Upload a file
async function uploadFile(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post(`${API_BASE_URL}/files`, formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': API_KEY,
        'x-api-secret': API_SECRET
      }
    });

    console.log('File uploaded:', response.data);
    return response.data.fileUpload;
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    throw error;
  }
}

// Get file details
async function getFileDetails(fileId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/files/${fileId}`, {
      headers: {
        'x-api-key': API_KEY,
        'x-api-secret': API_SECRET
      }
    });

    console.log('File details:', response.data);
    return response.data.fileUpload;
  } catch (error) {
    console.error('Get file failed:', error.response?.data || error.message);
    throw error;
  }
}

// Download a file
async function downloadFile(fileId, outputPath) {
  try {
    const response = await axios.get(`${API_BASE_URL}/files/${fileId}/download`, {
      headers: {
        'x-api-key': API_KEY,
        'x-api-secret': API_SECRET
      },
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Download failed:', error.response?.data || error.message);
    throw error;
  }
}

// Delete a file
async function deleteFile(fileId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/files/${fileId}`, {
      headers: {
        'x-api-key': API_KEY,
        'x-api-secret': API_SECRET
      }
    });

    console.log('File deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Delete failed:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    // Upload
    const file = await uploadFile('./document.pdf');
    console.log('Uploaded file ID:', file.id);

    // Get details
    const details = await getFileDetails(file.id);
    console.log('File size:', details.size, 'bytes');

    // Download
    await downloadFile(file.id, './downloaded-document.pdf');
    console.log('File downloaded successfully');

    // Delete
    await deleteFile(file.id);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

---

## Support

For additional support or questions about the File Upload API, please contact your system administrator or refer to the main API documentation.
