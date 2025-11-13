# Migration Checklist: API Key to User Authentication

## Quick Start

This checklist helps you migrate from API key authentication to user authentication for custom pieces upload in Community Edition.

---

## ✅ Pre-Migration Checklist

- [ ] Verify you're running Community Edition (no `api_key` table in database)
- [ ] Have admin user credentials ready
- [ ] Backup current configuration
- [ ] Review custom pieces in `/usr/src/app/dist/packages/pieces/custom/`

---

## ✅ Environment Variables to Change

### Remove (Old)
```bash
❌ AP_API_KEY="sk-..."
```

### Add (New)
```bash
✅ AP_ADMIN_EMAIL="admin@example.com"
✅ AP_ADMIN_PASSWORD="your_secure_password"
```

### Verify
```bash
✅ AP_PIECES_SOURCE='DB'  # For production (not 'FILE')
```

---

## ✅ Update Configuration Files

### Option 1: .env file
```bash
# Edit your .env file
nano .env

# Remove:
# AP_API_KEY="..."

# Add:
AP_ADMIN_EMAIL="admin@example.com"
AP_ADMIN_PASSWORD="your_password"
AP_PIECES_SOURCE='DB'
```

### Option 2: docker-compose.yml
```yaml
services:
  activepieces:
    environment:
      # Remove:
      # - AP_API_KEY=sk-...

      # Add:
      - AP_ADMIN_EMAIL=admin@example.com
      - AP_ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - AP_PIECES_SOURCE=DB
```

### Option 3: Kubernetes ConfigMap/Secret
```yaml
# In Secret
apiVersion: v1
kind: Secret
metadata:
  name: activepieces-credentials
stringData:
  admin-email: admin@example.com
  admin-password: your_secure_password

# In Deployment
env:
  - name: AP_ADMIN_EMAIL
    valueFrom:
      secretKeyRef:
        name: activepieces-credentials
        key: admin-email
  - name: AP_ADMIN_PASSWORD
    valueFrom:
      secretKeyRef:
        name: activepieces-credentials
        key: admin-password
  - name: AP_PIECES_SOURCE
    value: "DB"
```

---

## ✅ Testing

### 1. Test Login Credentials
```bash
# Test authentication before deployment
curl -X POST "http://your-api-url/api/v1/authentication/sign-in" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'

# Should return JSON with "token" field
```

### 2. Dry Run (Optional)
```bash
# Test the upload script manually
export AP_ADMIN_EMAIL="admin@example.com"
export AP_ADMIN_PASSWORD="your_password"
export AP_FRONTEND_URL="http://localhost:8080"

bash /usr/src/app/scripts/upload-custom-pieces.sh
```

### 3. Deploy and Monitor
```bash
# Deploy your application
docker-compose up -d
# or
kubectl apply -f your-deployment.yaml

# Check logs for upload status
docker-compose logs -f activepieces
# or
kubectl logs -f deployment/activepieces
```

### 4. Verify Pieces Uploaded
```bash
# Check API for uploaded pieces
curl -X GET "http://your-api-url/api/v1/pieces" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Or check via UI:
# Login → Pieces → Should see your custom pieces
```

---

## ✅ Expected Output

When successful, you should see:

```
========================================
B4AI Custom Pieces Uploader
========================================
API URL: http://localhost:8080/api
Pieces directory: /usr/src/app/dist/packages/pieces/custom
Admin email: admin@example.com

Waiting for API to be ready...
✓ API is ready

Logging in to get authentication token...
✓ Authentication successful

Processing: @activepieces/piece-b4ai-common@0.0.1
  ✓ Uploaded successfully

Processing: @activepieces/piece-b4ai-hub@0.0.1
  ✓ Uploaded successfully

Processing: @activepieces/piece-b4ai-memory@0.0.1
  ✓ Uploaded successfully

========================================
Upload Summary
========================================
Uploaded: 3
Skipped:  0
Errors:   0
========================================
✓ Custom pieces upload completed successfully
```

---

## ⚠️ Troubleshooting

### Error: "Failed to authenticate"
- [ ] Double-check email and password are correct
- [ ] Verify user exists and is admin
- [ ] Check API server logs for detailed error

### Error: "Environment variables must be set"
- [ ] Verify `AP_ADMIN_EMAIL` is set
- [ ] Verify `AP_ADMIN_PASSWORD` is set
- [ ] Check environment variable escaping in your deployment system

### Error: "API did not become ready"
- [ ] Check backend server is starting correctly
- [ ] Verify database connection
- [ ] Check `AP_FRONTEND_URL` is correct
- [ ] Increase wait time if needed (edit script)

### Pieces Not Showing in UI
- [ ] Verify `AP_PIECES_SOURCE='DB'` (not 'FILE')
- [ ] Check upload script completed successfully
- [ ] Query database: `SELECT * FROM piece_metadata WHERE "pieceType" = 'CUSTOM';`
- [ ] Restart application

---

## 📝 Rollback Plan (If Needed)

If you need to rollback to FILE mode:

```bash
# Temporary rollback to FILE mode
AP_PIECES_SOURCE='FILE'
AP_DEV_PIECES="piece1,piece2,piece3"

# Comment out upload script in docker-entrypoint.sh
# Pieces will load from filesystem instead
```

**Note**: FILE mode is development-only and doesn't support multiple versions.

---

## ✨ Post-Migration

- [ ] Remove old `AP_API_KEY` from all configuration files
- [ ] Update documentation for your team
- [ ] Set up secrets management for `AP_ADMIN_PASSWORD`
- [ ] Monitor first few deployments for issues
- [ ] Consider creating dedicated upload user (not main admin)

---

## 📚 Additional Documentation

For more details, see:
- `docs/CUSTOM_PIECES_UPLOAD.md` - Complete documentation
- Activepieces environment variables docs
- Your CI/CD pipeline documentation

---

## 🎉 Success Criteria

You've successfully migrated when:

- ✅ Upload script runs without errors
- ✅ Custom pieces appear in UI
- ✅ Pieces are usable in flows
- ✅ No references to `AP_API_KEY` remain
- ✅ Authentication uses `AP_ADMIN_EMAIL` and `AP_ADMIN_PASSWORD`
