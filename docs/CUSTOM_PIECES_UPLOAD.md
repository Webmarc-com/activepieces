# Custom Pieces Upload Configuration

## Overview

The custom pieces upload script has been updated to work with **Community Edition** (CE) which does not support API keys. Instead, it now uses **user authentication** (email/password) to upload custom pieces to the database.

## Changes Made

### 1. Modified Script
- **File**: `/scripts/upload-custom-pieces.sh`
- **Change**: Now uses user login (JWT token) instead of API keys

### 2. Authentication Flow
```bash
1. Wait for API to be ready
2. Login with admin credentials → Get JWT token
3. Upload pieces using JWT token
4. Report results
```

## Required Environment Variables

### For Production/CI-CD (DB Mode)

```bash
# Pieces configuration
AP_PIECES_SOURCE='DB'              # Use database mode (supports multiple versions)

# Admin credentials for uploading pieces
AP_ADMIN_EMAIL="admin@example.com"      # Admin user email
AP_ADMIN_PASSWORD="your_secure_password" # Admin user password

# Optional: API URL (defaults to http://localhost:8080/api)
AP_FRONTEND_URL="http://your-domain.com"

# Remove this (not used in CE):
# AP_API_KEY="..."  ❌ Not needed anymore
```

### For Development (FILE Mode)

```bash
# Pieces configuration
AP_PIECES_SOURCE='FILE'            # Load pieces from filesystem
AP_DEV_PIECES="google-sheets,store,webhook"  # Comma-separated list of pieces to load

# No authentication needed for FILE mode
# Pieces are loaded directly from: /usr/src/app/dist/packages/pieces/custom/
```

## Migration Guide

### If you were using API keys before:

**Old configuration:**
```bash
AP_PIECES_SOURCE='DB'
AP_API_KEY="sk-..."
```

**New configuration:**
```bash
AP_PIECES_SOURCE='DB'
AP_ADMIN_EMAIL="admin@example.com"
AP_ADMIN_PASSWORD="your_password"
```

### Update your .env or deployment configuration:

1. **Remove**:
   ```bash
   AP_API_KEY="..."
   ```

2. **Add**:
   ```bash
   AP_ADMIN_EMAIL="your_admin_email@example.com"
   AP_ADMIN_PASSWORD="your_admin_password"
   ```

3. **Ensure**:
   ```bash
   AP_PIECES_SOURCE='DB'  # For production
   ```

## Docker Deployment

### Environment Variables in docker-compose.yml

```yaml
services:
  activepieces:
    image: your-image:latest
    environment:
      # Database configuration
      AP_DB_TYPE: POSTGRES
      AP_POSTGRES_URL: postgresql://user:pass@postgres:5432/activepieces

      # Pieces configuration
      AP_PIECES_SOURCE: 'DB'
      AP_PIECES_SYNC_MODE: 'NONE'

      # Authentication for piece upload
      AP_ADMIN_EMAIL: admin@example.com
      AP_ADMIN_PASSWORD: ${ADMIN_PASSWORD}  # Use secrets management!

      # Other settings
      AP_FRONTEND_URL: https://your-domain.com
```

### Best Practices for Credentials

**DO NOT** hardcode passwords in configuration files. Use:

1. **Docker Secrets** (Docker Swarm):
   ```yaml
   secrets:
     - admin_password

   environment:
     AP_ADMIN_PASSWORD_FILE: /run/secrets/admin_password
   ```

2. **Kubernetes Secrets**:
   ```yaml
   env:
     - name: AP_ADMIN_PASSWORD
       valueFrom:
         secretKeyRef:
           name: activepieces-secrets
           key: admin-password
   ```

3. **Environment variable from CI/CD**:
   ```bash
   # In GitHub Actions, GitLab CI, etc.
   AP_ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
   ```

## How It Works

### Initialization Sequence

When the container starts:

1. **Nginx** starts (serves frontend)
2. **Upload script** runs in background:
   - Waits for API server to be ready (max 60 seconds)
   - Logs in with provided credentials
   - Gets JWT authentication token
   - Uploads each piece from `/usr/src/app/dist/packages/pieces/custom/`
   - Reports success/failure
3. **Backend server** starts (API)

### Upload Process Per Piece

For each custom piece:

1. Read `package.json` to get name and version
2. Create npm package archive using `npm pack`
3. Upload via API: `POST /v1/pieces`
   - Header: `Authorization: Bearer {jwt_token}`
   - Form data: pieceArchive, packageType, scope, pieceName, pieceVersion
4. Handle response:
   - **200/201**: Successfully uploaded
   - **409**: Already exists (skipped)
   - **Other**: Error reported

### Script Output

```
========================================
B4AI Custom Pieces Uploader
========================================
API URL: http://localhost:8080/api
Pieces directory: /usr/src/app/dist/packages/pieces/custom
Admin email: admin@example.com

Waiting for API to be ready...
  Attempt 1/30... (waiting 2s)
✓ API is ready

Logging in to get authentication token...
✓ Authentication successful

Processing: @activepieces/piece-b4ai-common@0.0.1
  ✓ Uploaded successfully

Processing: @activepieces/piece-b4ai-hub@0.0.1
  ✓ Uploaded successfully

========================================
Upload Summary
========================================
Uploaded: 2
Skipped:  0
Errors:   0
========================================
✓ Custom pieces upload completed successfully
```

## Troubleshooting

### Error: "AP_ADMIN_EMAIL and AP_ADMIN_PASSWORD environment variables must be set"

**Solution**: Add the environment variables to your deployment configuration.

### Error: "Failed to authenticate. Please check your credentials."

**Possible causes**:
1. Wrong email or password
2. User doesn't exist
3. User is not an admin/platform owner
4. API server not fully initialized

**Solution**:
- Verify credentials are correct
- Ensure the user exists and has admin privileges
- Check API server logs for authentication errors

### Error: "API did not become ready after 30 attempts"

**Possible causes**:
1. API server failed to start
2. Database connection issues
3. Wrong API URL

**Solution**:
- Check backend server logs
- Verify database is running and accessible
- Check `AP_FRONTEND_URL` is correct

### Pieces Upload Fails with 401 Unauthorized

**Possible causes**:
1. JWT token expired (shouldn't happen immediately)
2. User permissions changed during upload
3. Platform configuration issues

**Solution**:
- Check that the user is a platform owner (not just a member)
- Verify CE edition is running (not requiring EE features)

### Pieces Upload Fails with 403 Forbidden

**Possible causes**:
1. User doesn't have permission to upload pieces
2. Platform feature flags restrict piece uploads

**Solution**:
- Ensure user is platform owner/admin
- Check platform settings in database

## Development vs Production

### Development Setup

```bash
# .env for development
AP_ENVIRONMENT="dev"
AP_DB_TYPE=SQLITE3
AP_PIECES_SOURCE='FILE'
AP_DEV_PIECES="google-sheets,store,webhook"

# No upload needed - pieces load from filesystem
```

### Production Setup

```bash
# Environment variables for production
AP_ENVIRONMENT="production"
AP_DB_TYPE=POSTGRES
AP_POSTGRES_URL="postgresql://..."
AP_PIECES_SOURCE='DB'
AP_ADMIN_EMAIL="admin@example.com"
AP_ADMIN_PASSWORD="${SECURE_PASSWORD}"

# Upload script will run automatically on container start
```

## Edition Compatibility

| Edition | API Keys | User Auth | FILE Mode | DB Mode |
|---------|----------|-----------|-----------|---------|
| **Community (CE)** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Enterprise (EE)** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Cloud** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |

This solution is designed for **Community Edition** but also works with Enterprise Edition.

## Security Considerations

1. **Credentials in Transit**: Uses HTTPS in production (configure `AP_FRONTEND_URL` with https://)
2. **Credentials Storage**: Store passwords in secrets management systems
3. **Token Security**: JWT tokens are short-lived and used only for upload process
4. **Least Privilege**: Consider creating a dedicated admin user for automated uploads
5. **Audit Logging**: Check API logs for upload activity

## Additional Resources

- [Activepieces Environment Variables](https://www.activepieces.com/docs/install/configurations/environment-variables)
- [Activepieces Custom Pieces](https://www.activepieces.com/docs/developers/building-pieces)
- [Docker Secrets Documentation](https://docs.docker.com/engine/swarm/secrets/)
- [Kubernetes Secrets Documentation](https://kubernetes.io/docs/concepts/configuration/secret/)
