# Kubernetes Manifests Examples for Activepieces

This document provides complete Kubernetes manifest templates for deploying Activepieces in your `surfsite-CI-CD` repository.

## Directory Structure

```
surfsite-CI-CD/
└── surfsite/
    ├── qa/
    │   └── activepieces/
    │       ├── namespace.yaml
    │       ├── secret.yaml
    │       ├── configmap.yaml
    │       ├── pvc.yaml
    │       ├── deployment.yaml
    │       ├── service.yaml
    │       └── ingress.yaml
    └── staging/
        └── activepieces/
            ├── namespace.yaml
            ├── secret.yaml
            ├── configmap.yaml
            ├── pvc.yaml
            ├── deployment.yaml
            ├── service.yaml
            └── ingress.yaml
```

---

## QA Environment Manifests

### 1. namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: surfsite-qa
  labels:
    environment: qa
    app: activepieces
```

### 2. secret.yaml

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: activepieces-secrets
  namespace: surfsite-qa
type: Opaque
stringData:
  # Generate using: openssl rand -hex 16
  AP_ENCRYPTION_KEY: "REPLACE_WITH_32_CHAR_HEX_KEY"

  # Generate using: openssl rand -hex 32
  AP_JWT_SECRET: "REPLACE_WITH_64_CHAR_HEX_SECRET"

  # Your PostgreSQL password
  AP_POSTGRES_PASSWORD: "REPLACE_WITH_POSTGRES_PASSWORD"

  # Your Redis password (if required)
  AP_REDIS_PASSWORD: "REPLACE_WITH_REDIS_PASSWORD"

  # Optional: Webhook secret
  AP_WEBHOOK_SECRET: "REPLACE_WITH_WEBHOOK_SECRET"
```

**Security Note**: Use sealed-secrets, SOPS, or external secret operators in production instead of committing plain secrets.

### 3. configmap.yaml

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: activepieces-config
  namespace: surfsite-qa
data:
  # Environment
  AP_ENVIRONMENT: "prod"
  AP_EDITION: "ce"  # or "ee" for Enterprise Edition

  # Frontend URL - IMPORTANT: Must be the public URL where users access Activepieces
  AP_FRONTEND_URL: "https://activepieces-qa.surfsite.ai"

  # Execution Mode
  # Options: UNSANDBOXED, SANDBOX_CODE_ONLY, SANDBOX_PROCESS, SANDBOX_CODE_AND_PROCESS
  AP_EXECUTION_MODE: "SANDBOX_CODE_ONLY"

  # Logging Configuration
  AP_LOG_LEVEL: "info"        # info, debug, warn, error
  AP_LOG_PRETTY: "false"      # Set to false for production (JSON logs)

  # UI and Behavior
  AP_SHOW_CHANGELOG: "true"           # Show changelog to users
  AP_ENABLE_FLOW_ON_PUBLISH: "true"   # Auto-enable flows when published

  # Engine Configuration
  AP_ENGINE_EXECUTABLE_PATH: "dist/packages/engine/main.js"

  # Database Configuration
  AP_DB_TYPE: "POSTGRES"
  AP_POSTGRES_HOST: "your-postgres-host.example.com"
  AP_POSTGRES_PORT: "5432"
  AP_POSTGRES_DATABASE: "activepieces_qa"
  AP_POSTGRES_USERNAME: "activepieces"
  AP_POSTGRES_USE_SSL: "true"

  # Redis Configuration
  AP_REDIS_TYPE: "DEFAULT"  # or SENTINEL for Redis Sentinel
  AP_REDIS_HOST: "your-redis-host.example.com"
  AP_REDIS_PORT: "6379"
  AP_REDIS_DB: "0"
  AP_REDIS_USE_SSL: "true"

  # Redis Failed Job Settings (aligned with Helm defaults)
  AP_REDIS_FAILED_JOB_RETENTION_DAYS: "7"
  AP_REDIS_FAILED_JOB_RETENTION_MAX_COUNT: "100"

  # Performance Tuning - QA (Lower values)
  AP_FLOW_WORKER_CONCURRENCY: "5"
  AP_SCHEDULED_WORKER_CONCURRENCY: "5"
  AP_MAX_CONCURRENT_JOBS_PER_PROJECT: "50"
  AP_SANDBOX_MEMORY_LIMIT: "524288"  # 512 MB in KB
  AP_FLOW_TIMEOUT_SECONDS: "600"     # 10 minutes

  # Data Retention
  AP_EXECUTION_DATA_RETENTION_DAYS: "30"

  # Telemetry
  AP_TELEMETRY_ENABLED: "true"

  # Trigger Settings
  AP_TRIGGER_DEFAULT_POLL_INTERVAL: "5"  # minutes

  # Templates
  AP_TEMPLATES_SOURCE_URL: "https://cloud.activepieces.com/api/v1/flow-templates"

  # Optional: Custom piece repository
  # AP_PIECES_SOURCE: "DB"

  # Optional: S3/GCS for file storage (recommended for multi-replica)
  # AP_FILE_STORAGE_LOCATION: "GCS"
  # AP_GCS_BUCKET: "activepieces-qa-files"
  # AP_GCS_PROJECT_ID: "surfsite-development"
```

### 4. pvc.yaml

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: activepieces-cache
  namespace: surfsite-qa
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
  storageClassName: standard-rwo  # Adjust based on your GKE storage class
```

**Note**: If running multiple replicas, consider using GCS instead of PVC for cache storage.

### 5. deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: activepieces
  namespace: surfsite-qa
  labels:
    app: activepieces
    environment: qa
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: activepieces
  template:
    metadata:
      labels:
        app: activepieces
        environment: qa
    spec:
      # Optional: Use a service account with workload identity for GCS access
      # serviceAccountName: activepieces-sa

      containers:
      - name: activepieces
        image: europe-west3-docker.pkg.dev/surfsite-development/surfsite-qa/activepieces:PLACEHOLDER_SHA
        imagePullPolicy: Always

        ports:
        - name: http
          containerPort: 80
          protocol: TCP

        # Environment variables from ConfigMap
        envFrom:
        - configMapRef:
            name: activepieces-config

        # Sensitive environment variables from Secret
        env:
        - name: AP_ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: activepieces-secrets
              key: AP_ENCRYPTION_KEY
        - name: AP_JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: activepieces-secrets
              key: AP_JWT_SECRET
        - name: AP_POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: activepieces-secrets
              key: AP_POSTGRES_PASSWORD
        - name: AP_REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: activepieces-secrets
              key: AP_REDIS_PASSWORD
              optional: true

        # Resource limits and requests
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"

        # Volume mounts
        volumeMounts:
        - name: cache
          mountPath: /usr/src/app/cache

        # Health checks (aligned with Helm chart defaults)
        livenessProbe:
          httpGet:
            path: /v1/health
            port: http
            scheme: HTTP
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3

        readinessProbe:
          httpGet:
            path: /v1/health
            port: http
            scheme: HTTP
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3

        # Startup probe for initial startup (can take longer)
        startupProbe:
          httpGet:
            path: /v1/health
            port: http
            scheme: HTTP
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 12  # Allow up to 2 minutes for startup

      volumes:
      - name: cache
        persistentVolumeClaim:
          claimName: activepieces-cache

      # Optional: Security context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
```

### 6. service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: activepieces
  namespace: surfsite-qa
  labels:
    app: activepieces
spec:
  type: ClusterIP
  selector:
    app: activepieces
  ports:
  - name: http
    port: 80
    targetPort: 80
    protocol: TCP
  # Optional: Session affinity for sticky sessions
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800  # 3 hours
```

### 7. ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: activepieces
  namespace: surfsite-qa
  labels:
    app: activepieces
  annotations:
    # For GCE/GKE Ingress
    kubernetes.io/ingress.class: "gce"

    # For NGINX Ingress Controller (alternative)
    # kubernetes.io/ingress.class: "nginx"
    # nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    # nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
    # nginx.ingress.kubernetes.io/proxy-send-timeout: "600"

    # SSL/TLS with cert-manager
    cert-manager.io/cluster-issuer: "letsencrypt-prod"

    # Optional: Force HTTPS redirect
    # nginx.ingress.kubernetes.io/force-ssl-redirect: "true"

    # Optional: CORS settings
    # nginx.ingress.kubernetes.io/enable-cors: "true"
    # nginx.ingress.kubernetes.io/cors-allow-origin: "*"
spec:
  tls:
  - hosts:
    - activepieces-qa.surfsite.ai
    secretName: activepieces-qa-tls

  rules:
  - host: activepieces-qa.surfsite.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: activepieces
            port:
              number: 80
```

---

## Staging Environment Manifests

For the **Staging** environment, create similar files in `surfsite/staging/activepieces/` with the following changes:

### Key Differences from QA:

1. **namespace.yaml**:
   ```yaml
   metadata:
     name: surfsite-staging
     labels:
       environment: staging
   ```

2. **secret.yaml**:
   - Use different secrets (or same if acceptable)
   - Namespace: `surfsite-staging`

3. **configmap.yaml**:
   ```yaml
   data:
     # Same base configuration as QA, with these differences:
     AP_FRONTEND_URL: "https://activepieces-staging.surfsite.ai"
     AP_POSTGRES_DATABASE: "activepieces_staging"

     # Higher performance settings for staging
     AP_FLOW_WORKER_CONCURRENCY: "10"
     AP_SCHEDULED_WORKER_CONCURRENCY: "10"
     AP_MAX_CONCURRENT_JOBS_PER_PROJECT: "100"

     # All other values should match QA configuration:
     # - AP_ENVIRONMENT: "prod"
     # - AP_EDITION: "ce"
     # - AP_EXECUTION_MODE: "SANDBOX_CODE_ONLY"
     # - AP_LOG_LEVEL: "info"
     # - AP_LOG_PRETTY: "false"
     # - AP_SHOW_CHANGELOG: "true"
     # - AP_ENABLE_FLOW_ON_PUBLISH: "true"
     # - AP_ENGINE_EXECUTABLE_PATH: "dist/packages/engine/main.js"
     # - AP_REDIS_FAILED_JOB_RETENTION_DAYS: "7"
     # - AP_REDIS_FAILED_JOB_RETENTION_MAX_COUNT: "100"
     # - AP_TEMPLATES_SOURCE_URL: "https://cloud.activepieces.com/api/v1/flow-templates"
     # ... and all other settings from QA
   ```

4. **pvc.yaml**:
   ```yaml
   metadata:
     namespace: surfsite-staging
   ```

5. **deployment.yaml**:
   ```yaml
   metadata:
     namespace: surfsite-staging
     labels:
       environment: staging
   spec:
     replicas: 2  # Can run more replicas in staging
     template:
       spec:
         containers:
         - name: activepieces
           image: europe-west3-docker.pkg.dev/surfsite-development/surfsite-staging/activepieces:PLACEHOLDER_SHA
           resources:
             requests:
               memory: "1Gi"
               cpu: "500m"
             limits:
               memory: "4Gi"
               cpu: "2000m"
   ```

6. **service.yaml**:
   ```yaml
   metadata:
     namespace: surfsite-staging
   ```

7. **ingress.yaml**:
   ```yaml
   metadata:
     namespace: surfsite-staging
   spec:
     tls:
     - hosts:
       - activepieces-staging.surfsite.ai
       secretName: activepieces-staging-tls
     rules:
     - host: activepieces-staging.surfsite.ai
   ```

---

## Optional: Separate Worker Deployment

For better security and scalability, you can deploy workers separately:

### worker-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: activepieces-worker
  namespace: surfsite-qa
  labels:
    app: activepieces-worker
    component: worker
spec:
  replicas: 2
  selector:
    matchLabels:
      app: activepieces-worker
  template:
    metadata:
      labels:
        app: activepieces-worker
        component: worker
    spec:
      containers:
      - name: worker
        image: europe-west3-docker.pkg.dev/surfsite-development/surfsite-qa/activepieces:PLACEHOLDER_SHA

        # Worker-specific environment variables
        env:
        - name: AP_CONTAINER_TYPE
          value: "WORKER"
        - name: AP_INTERNAL_URL
          value: "http://activepieces.surfsite-qa.svc.cluster.local"
        - name: AP_WORKER_TOKEN
          valueFrom:
            secretKeyRef:
              name: activepieces-secrets
              key: AP_WORKER_TOKEN

        # Include all other env variables from configmap and secrets
        envFrom:
        - configMapRef:
            name: activepieces-config

        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "2000m"

        volumeMounts:
        - name: cache
          mountPath: /usr/src/app/cache

      volumes:
      - name: cache
        persistentVolumeClaim:
          claimName: activepieces-cache
```

**Note**: When using separate workers:
- Update the main deployment with `AP_CONTAINER_TYPE: "APP"`
- Generate a worker token: `openssl rand -hex 32`
- Add the token to secrets as `AP_WORKER_TOKEN`

---

## Optional: HorizontalPodAutoscaler

For automatic scaling based on CPU/Memory:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: activepieces-hpa
  namespace: surfsite-qa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: activepieces
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
```

---

## Optional: NetworkPolicy

For enhanced security, restrict network access:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: activepieces-network-policy
  namespace: surfsite-qa
spec:
  podSelector:
    matchLabels:
      app: activepieces
  policyTypes:
  - Ingress
  - Egress
  ingress:
  # Allow ingress from ingress controller
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80
  egress:
  # Allow DNS
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: UDP
      port: 53
  # Allow PostgreSQL
  - to:
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 5432
  # Allow Redis
  - to:
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 6379
  # Allow HTTPS for external API calls
  - to:
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 443
```

---

## Deployment Checklist

Before deploying, ensure:

- [ ] All secrets are generated and stored securely
- [ ] PostgreSQL database is created and accessible
- [ ] Redis is accessible from the cluster
- [ ] Domain DNS is configured (A/CNAME records)
- [ ] cert-manager is installed (for TLS)
- [ ] Ingress controller is installed and configured
- [ ] Storage class exists for PVC
- [ ] Resource quotas are appropriate
- [ ] Namespaces exist or will be created by ArgoCD
- [ ] Image placeholder `PLACEHOLDER_SHA` will be replaced by Cloud Build

---

## Testing the Deployment

After deployment:

1. **Check pods**:
   ```bash
   kubectl get pods -n surfsite-qa -l app=activepieces
   ```

2. **Check logs**:
   ```bash
   kubectl logs -n surfsite-qa -l app=activepieces --tail=100
   ```

3. **Test health endpoint**:
   ```bash
   kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
     curl http://activepieces.surfsite-qa.svc.cluster.local/v1/health
   ```

4. **Access via ingress**:
   ```bash
   curl https://activepieces-qa.surfsite.ai/v1/health
   ```

5. **Open in browser**:
   Navigate to `https://activepieces-qa.surfsite.ai`

---

## Additional Resources

- **Activepieces Documentation**: https://www.activepieces.com/docs
- **Existing Helm Chart**: `/deploy/activepieces-helm/` (for reference)
- **Environment Variables**: See main deployment guide for full list

---

## Version History

- **v1.1.0** (2025-01-12): Updated configuration to align with official Helm chart production recommendations
  - Added logging configuration (`AP_LOG_LEVEL`, `AP_LOG_PRETTY`)
  - Added UI behavior settings (`AP_SHOW_CHANGELOG`, `AP_ENABLE_FLOW_ON_PUBLISH`)
  - Added engine configuration (`AP_ENGINE_EXECUTABLE_PATH`)
  - Updated Redis failed job settings to match Helm defaults (7 days, 100 max count)
  - Added template source URL configuration
  - Updated health probe timings to match Helm chart (liveness: 30s, readiness: 5s)
  - Ensured QA and Staging configurations are consistent
- **v1.0.0** (2025-01-12): Initial version

**Last Updated**: 2025-01-12
**Version**: 1.1.0
