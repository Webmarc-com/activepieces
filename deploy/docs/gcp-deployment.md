# Activepieces GCP Deployment Guide

This guide explains how to deploy Activepieces to Google Kubernetes Engine (GKE) using Cloud Build, Artifact Registry, and ArgoCD.

## Architecture Overview

```
┌─────────────────┐
│ GitHub Repo     │
│ (qa/staging     │
│  branches)      │
└────────┬────────┘
         │ push
         ▼
┌─────────────────┐
│ Cloud Build     │
│ Triggers        │
└────────┬────────┘
         │ build & push
         ▼
┌─────────────────┐      ┌──────────────────┐
│ Artifact        │      │ surfsite-CI-CD   │
│ Registry        │      │ GitHub Repo      │
│ (Images)        │      │ (Manifests)      │
└─────────────────┘      └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ ArgoCD           │
                         │ (GitOps)         │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ GKE Cluster      │
                         │ (QA/Staging)     │
                         └──────────────────┘
```

## Prerequisites

### 1. Google Cloud Setup

- **Project ID**: `surfsite-development`
- **Artifact Registry Repositories**:
  - QA: `europe-west3-docker.pkg.dev/surfsite-development/surfsite-qa`
  - Staging: `europe-west3-docker.pkg.dev/surfsite-development/surfsite-staging`
- **Secret Manager**: SSH key secret already configured (`cloud-build-charger-ssh-key`)
- **GKE Cluster**: Running with ArgoCD installed

### 2. GitHub Repositories

- **Source Repository**: This repository (activepieces)
  - `qa` branch → triggers QA builds
  - `staging` branch → triggers Staging builds
- **CI/CD Repository**: `Webmarc-com/surfsite-CI-CD`
  - Contains Kubernetes manifests
  - ArgoCD syncs from this repo

### 3. External Services

You need existing PostgreSQL and Redis instances accessible from your GKE cluster:
- **PostgreSQL 14.4+** with connection details
- **Redis 7.0.7+** with connection details

## Step 1: Set Up Cloud Build Triggers

### Create QA Trigger

```bash
gcloud builds triggers create github \
  --name="activepieces-qa" \
  --repo-name="activepieces" \
  --repo-owner="YOUR_GITHUB_ORG" \
  --branch-pattern="^qa$" \
  --build-config="cloudbuild-qa.yaml" \
  --project="surfsite-development"
```

### Create Staging Trigger

```bash
gcloud builds triggers create github \
  --name="activepieces-staging" \
  --repo-name="activepieces" \
  --repo-owner="YOUR_GITHUB_ORG" \
  --branch-pattern="^staging$" \
  --build-config="cloudbuild-staging.yaml" \
  --project="surfsite-development"
```

## Step 2: Generate Required Secrets

Activepieces requires several secrets for security and encryption. Generate them using OpenSSL:

```bash
# Generate encryption key (32 characters hex = 16 bytes)
export AP_ENCRYPTION_KEY=$(openssl rand -hex 16)
echo "AP_ENCRYPTION_KEY: $AP_ENCRYPTION_KEY"

# Generate JWT secret (64 characters hex = 32 bytes)
export AP_JWT_SECRET=$(openssl rand -hex 32)
echo "AP_JWT_SECRET: $AP_JWT_SECRET"

# Optional: Generate webhook secret
export AP_WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "AP_WEBHOOK_SECRET: $AP_WEBHOOK_SECRET"
```

**IMPORTANT**: Save these secrets securely! You'll need the same values for both QA and Staging, or generate separate ones for each environment.

## Step 3: Create Kubernetes Manifests

In your `surfsite-CI-CD` repository, create the following directory structure:

```
surfsite-CI-CD/
├── surfsite/
│   ├── qa/
│   │   └── activepieces/
│   │       ├── namespace.yaml
│   │       ├── secret.yaml
│   │       ├── configmap.yaml
│   │       ├── pvc.yaml
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       └── ingress.yaml
│   └── staging/
│       └── activepieces/
│           ├── namespace.yaml
│           ├── secret.yaml
│           ├── configmap.yaml
│           ├── pvc.yaml
│           ├── deployment.yaml
│           ├── service.yaml
│           └── ingress.yaml
```

Refer to the `k8s-manifests-examples.md` file in this directory for complete manifest templates.

## Step 4: Configure Secrets in Kubernetes

Create Kubernetes secrets with your actual values:

### For QA Environment

```bash
kubectl create secret generic activepieces-secrets \
  --namespace=surfsite-qa \
  --from-literal=AP_ENCRYPTION_KEY="your-32-char-hex-key" \
  --from-literal=AP_JWT_SECRET="your-64-char-hex-secret" \
  --from-literal=AP_POSTGRES_PASSWORD="your-postgres-password" \
  --from-literal=AP_REDIS_PASSWORD="your-redis-password" \
  --dry-run=client -o yaml > surfsite/qa/activepieces/secret.yaml
```

### For Staging Environment

```bash
kubectl create secret generic activepieces-secrets \
  --namespace=surfsite-staging \
  --from-literal=AP_ENCRYPTION_KEY="your-32-char-hex-key" \
  --from-literal=AP_JWT_SECRET="your-64-char-hex-secret" \
  --from-literal=AP_POSTGRES_PASSWORD="your-postgres-password" \
  --from-literal=AP_REDIS_PASSWORD="your-redis-password" \
  --dry-run=client -o yaml > surfsite/staging/activepieces/secret.yaml
```

**Security Note**: Consider using sealed-secrets or SOPS to encrypt these secrets in Git.

## Step 5: Configure ArgoCD Application

Create an ArgoCD Application to watch the manifests:

### QA Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: activepieces-qa
  namespace: argocd
spec:
  project: default
  source:
    repoURL: 'git@github.com:Webmarc-com/surfsite-CI-CD.git'
    targetRevision: main
    path: surfsite/qa/activepieces
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: surfsite-qa
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### Staging Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: activepieces-staging
  namespace: argocd
spec:
  project: default
  source:
    repoURL: 'git@github.com:Webmarc-com/surfsite-CI-CD.git'
    targetRevision: main
    path: surfsite/staging/activepieces
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: surfsite-staging
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

Apply these to your cluster:

```bash
kubectl apply -f argocd-activepieces-qa.yaml
kubectl apply -f argocd-activepieces-staging.yaml
```

## Step 6: Deploy to QA

1. **Push to QA branch**:
   ```bash
   git checkout qa
   git merge main  # or your feature branch
   git push origin qa
   ```

2. **Monitor Cloud Build**:
   ```bash
   gcloud builds list --project=surfsite-development --limit=5
   # Or view in console: https://console.cloud.google.com/cloud-build/builds
   ```

3. **Verify ArgoCD Sync**:
   - Check ArgoCD UI for the `activepieces-qa` application
   - Or use CLI:
     ```bash
     argocd app get activepieces-qa
     argocd app sync activepieces-qa  # if not auto-syncing
     ```

4. **Check Deployment Status**:
   ```bash
   kubectl get pods -n surfsite-qa -l app=activepieces
   kubectl logs -n surfsite-qa -l app=activepieces --tail=100
   ```

## Step 7: Deploy to Staging

Same process as QA, but using the `staging` branch:

```bash
git checkout staging
git merge qa  # promote from QA
git push origin staging
```

## Environment Configuration Reference

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AP_ENCRYPTION_KEY` | 32-character hex key for data encryption | `0123456789abcdef0123456789abcdef` |
| `AP_JWT_SECRET` | 64-character hex secret for JWT signing | `0123456789abcdef...` |
| `AP_FRONTEND_URL` | Public URL where Activepieces is accessible | `https://activepieces-qa.surfsite.ai` |
| `AP_ENVIRONMENT` | Environment type | `prod` |
| `AP_EDITION` | Edition type | `ce` (Community) or `ee` (Enterprise) |
| `AP_POSTGRES_HOST` | PostgreSQL hostname | `postgres.surfsite-qa.svc.cluster.local` |
| `AP_POSTGRES_PORT` | PostgreSQL port | `5432` |
| `AP_POSTGRES_DATABASE` | Database name | `activepieces` |
| `AP_POSTGRES_USERNAME` | Database username | `activepieces` |
| `AP_POSTGRES_PASSWORD` | Database password (secret) | From secret |
| `AP_REDIS_HOST` | Redis hostname | `redis.surfsite-qa.svc.cluster.local` |
| `AP_REDIS_PORT` | Redis port | `6379` |
| `AP_REDIS_PASSWORD` | Redis password (secret) | From secret |

### Recommended Production Settings (Aligned with Helm Chart)

| Variable | Description | QA Value | Staging Value |
|----------|-------------|----------|---------------|
| `AP_EXECUTION_MODE` | Sandboxing mode | `SANDBOX_CODE_ONLY` | `SANDBOX_CODE_ONLY` |
| `AP_LOG_LEVEL` | Logging level | `info` | `info` |
| `AP_LOG_PRETTY` | Pretty print logs (false for production) | `false` | `false` |
| `AP_SHOW_CHANGELOG` | Show changelog to users | `true` | `true` |
| `AP_ENABLE_FLOW_ON_PUBLISH` | Auto-enable flows when published | `true` | `true` |
| `AP_ENGINE_EXECUTABLE_PATH` | Engine executable path | `dist/packages/engine/main.js` | `dist/packages/engine/main.js` |
| `AP_FLOW_WORKER_CONCURRENCY` | Flow worker threads | `5` | `10` |
| `AP_SCHEDULED_WORKER_CONCURRENCY` | Scheduled worker threads | `5` | `10` |
| `AP_MAX_CONCURRENT_JOBS_PER_PROJECT` | Max jobs per project | `50` | `100` |
| `AP_SANDBOX_MEMORY_LIMIT` | Memory limit per execution (KB) | `524288` (512MB) | `524288` (512MB) |
| `AP_FLOW_TIMEOUT_SECONDS` | Flow execution timeout | `600` (10 min) | `600` (10 min) |
| `AP_REDIS_FAILED_JOB_RETENTION_DAYS` | Failed job retention | `7` | `7` |
| `AP_REDIS_FAILED_JOB_RETENTION_MAX_COUNT` | Max failed jobs to keep | `100` | `100` |
| `AP_TEMPLATES_SOURCE_URL` | Template source URL | `https://cloud.activepieces.com/api/v1/flow-templates` | `https://cloud.activepieces.com/api/v1/flow-templates` |

### Optional Features

| Variable | Description | Default |
|----------|-------------|---------|
| `AP_TELEMETRY_ENABLED` | Enable telemetry | `true` |
| `AP_TEMPLATES_SOURCE_URL` | Template source | Activepieces default |
| `AP_TRIGGER_DEFAULT_POLL_INTERVAL` | Default poll interval (minutes) | `5` |
| `AP_EXECUTION_DATA_RETENTION_DAYS` | Keep execution data for X days | `30` |

## Troubleshooting

### Build Fails

1. **Check Cloud Build logs**:
   ```bash
   gcloud builds log <BUILD_ID> --project=surfsite-development
   ```

2. **Common issues**:
   - SSH key not configured correctly in Secret Manager
   - Insufficient permissions on Artifact Registry
   - Build timeout (increase in cloudbuild.yaml)

### Deployment Issues

1. **Pod not starting**:
   ```bash
   kubectl describe pod -n surfsite-qa -l app=activepieces
   kubectl logs -n surfsite-qa -l app=activepieces
   ```

2. **Common issues**:
   - Missing secrets (encryption key, JWT secret)
   - Database connection failure (check credentials and network)
   - Redis connection failure
   - Insufficient memory (increase resource limits)

### Database Migration Issues

Activepieces automatically runs migrations on startup. If migrations fail:

```bash
# Check logs for migration errors
kubectl logs -n surfsite-qa -l app=activepieces | grep -i migration

# Manual migration (if needed)
kubectl exec -it -n surfsite-qa <pod-name> -- sh
# Inside pod:
cd /usr/src/app
node dist/packages/server/api/main.cjs migrate
```

### Health Check Endpoint

Test if the application is healthy:

```bash
# From inside the cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://activepieces.surfsite-qa.svc.cluster.local/v1/health

# Expected response: {"status":"ok"}
```

### Performance Tuning

If experiencing slow performance:

1. **Check cache volume**:
   ```bash
   kubectl exec -n surfsite-qa <pod-name> -- du -sh /usr/src/app/cache
   ```
   Cache should build up over time as flows are executed.

2. **Monitor resource usage**:
   ```bash
   kubectl top pods -n surfsite-qa -l app=activepieces
   ```

3. **Adjust concurrency settings** in ConfigMap if needed.

### ArgoCD Sync Issues

If ArgoCD doesn't sync:

1. **Check application status**:
   ```bash
   argocd app get activepieces-qa
   ```

2. **Force sync**:
   ```bash
   argocd app sync activepieces-qa --force
   ```

3. **Check for drift**:
   ```bash
   argocd app diff activepieces-qa
   ```

## Maintenance

### Updating to a New Version

1. Merge changes to `qa` branch
2. Cloud Build automatically builds and updates manifests
3. ArgoCD automatically syncs to cluster
4. Monitor rollout:
   ```bash
   kubectl rollout status deployment/activepieces -n surfsite-qa
   ```

### Rollback

If a deployment fails:

```bash
# Via kubectl
kubectl rollout undo deployment/activepieces -n surfsite-qa

# Via ArgoCD
argocd app rollback activepieces-qa <REVISION>
```

### Scaling

To scale the deployment:

```bash
# Edit deployment.yaml in surfsite-CI-CD repo
# Or scale directly (temporary):
kubectl scale deployment activepieces -n surfsite-qa --replicas=3
```

**Note**: For horizontal scaling with multiple replicas:
- Use external PostgreSQL and Redis (already configured)
- Consider using S3-compatible storage instead of PersistentVolume
- Ensure session affinity is configured in the Service if needed

## Monitoring

### Key Metrics to Monitor

1. **Pod Health**:
   ```bash
   kubectl get pods -n surfsite-qa -l app=activepieces -w
   ```

2. **Resource Usage**:
   ```bash
   kubectl top pods -n surfsite-qa -l app=activepieces
   ```

3. **Application Logs**:
   ```bash
   kubectl logs -n surfsite-qa -l app=activepieces --tail=100 -f
   ```

4. **Database Connections**:
   Check PostgreSQL for active connections and query performance

5. **Redis Queue**:
   Monitor Redis for queue depth and memory usage

### Setting Up Alerts

Consider setting up alerts for:
- Pod restarts > 3 in 10 minutes
- Memory usage > 80%
- CPU usage > 80%
- Failed health checks
- High error rate in logs

## Security Best Practices

1. **Secrets Management**:
   - Never commit unencrypted secrets to Git
   - Use Sealed Secrets, SOPS, or external secret management
   - Rotate secrets regularly

2. **Network Policies**:
   - Restrict pod-to-pod communication
   - Only allow necessary ingress/egress

3. **RBAC**:
   - Use least-privilege service accounts
   - Limit who can deploy to production

4. **Image Security**:
   - Scan images for vulnerabilities
   - Use specific tags (SHA) instead of `latest`
   - Enable Binary Authorization if available

5. **TLS/SSL**:
   - Always use HTTPS in production
   - Use cert-manager for automatic certificate renewal

## Cost Optimization

1. **Right-size resources**: Start small and scale based on actual usage
2. **Use Spot/Preemptible nodes**: For non-production environments
3. **Enable cluster autoscaling**: Scale nodes based on demand
4. **Clean up old images**: Set retention policies in Artifact Registry
5. **Use external services wisely**: Consider Cloud SQL and Memorystore pricing

## Support and Resources

- **Activepieces Documentation**: https://www.activepieces.com/docs
- **Helm Chart**: `/deploy/activepieces-helm/`
- **GitHub Issues**: Report issues in the Activepieces repository
- **Community**: Join Activepieces Discord/Slack

## Appendix: Quick Reference

### Useful Commands

```bash
# View logs from all pods
kubectl logs -n surfsite-qa -l app=activepieces --all-containers=true --tail=100

# Port-forward to access locally
kubectl port-forward -n surfsite-qa svc/activepieces 8080:80

# Get pod details
kubectl describe pod -n surfsite-qa <pod-name>

# Check events
kubectl get events -n surfsite-qa --sort-by='.lastTimestamp'

# View ConfigMap
kubectl get configmap activepieces-config -n surfsite-qa -o yaml

# Restart deployment
kubectl rollout restart deployment activepieces -n surfsite-qa
```

### Environment URLs

- **QA**: https://activepieces-qa.surfsite.ai (configure in ingress)
- **Staging**: https://activepieces-staging.surfsite.ai (configure in ingress)

---

## Document Updates

- **v1.1.0** (2025-01-12): Updated environment variable recommendations to align with official Helm chart production defaults
- **v1.0.0** (2025-01-12): Initial version

**Last Updated**: 2025-01-12
**Version**: 1.1.0
