# Despliegue a Staging (Cloud Run)

## Requisitos Previos

1. **Proyecto GCP configurado**
2. **APIs habilitadas:**
   - Cloud Build API
   - Cloud Run API
   - Artifact Registry API

3. **Permisos de Cloud Build:**

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# Permiso para desplegar en Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

# Permiso para actuar como Service Account
gcloud iam service-accounts add-iam-policy-binding \
  ${PROJECT_NUMBER}-compute@developer.gserviceaccount.com \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

4. **Artifact Registry repository:**

```bash
gcloud artifacts repositories create real-state \
  --repository-format=docker \
  --location=us-central1 \
  --description="Real State Next.js application"
```

## Despliegue Manual

### Opción 1: Con variables en línea

```bash
gcloud builds submit --config=cloudbuild.staging.yaml \
  --substitutions="\
_DATABASE_URL=postgresql://user:pass@host:5432/db,\
_AUTH_SECRET=your-secret-key-min-32-chars"
```

### Opción 2: Desde archivo de variables (recomendado)

```bash
# Crear archivo .env.staging (NO COMMITEAR)
cat > .env.staging <<EOF
_DATABASE_URL=postgresql://user:pass@host:5432/db
_AUTH_SECRET=your-secret-key-min-32-chars
EOF

# Ejecutar build
source .env.staging
gcloud builds submit --config=cloudbuild.staging.yaml \
  --substitutions="_DATABASE_URL=${_DATABASE_URL},_AUTH_SECRET=${_AUTH_SECRET}"
```

## Configurar Trigger Automático

### 1. Crear trigger en Cloud Build

```bash
gcloud builds triggers create github \
  --name="deploy-staging" \
  --repo-name=real-state-next \
  --repo-owner=your-org \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.staging.yaml
```

### 2. Configurar variables en el trigger

**Desde la consola de GCP:**

1. Ir a Cloud Build > Triggers
2. Seleccionar el trigger "deploy-staging"
3. Editar > Substitution variables
4. Agregar:
   - `_DATABASE_URL`: `postgresql://...`
   - `_AUTH_SECRET`: `your-secret-key`

**Desde CLI:**

```bash
gcloud builds triggers update deploy-staging \
  --substitutions="\
_DATABASE_URL=postgresql://user:pass@host:5432/db,\
_AUTH_SECRET=your-secret-key"
```

## Variables de Entorno

| Variable        | Descripción                  | Ejemplo                               |
| --------------- | ---------------------------- | ------------------------------------- |
| `_REGION`       | Región de GCP                | `us-east1`                            |
| `_SERVICE_NAME` | Nombre del servicio          | `real-state-staging`                  |
| `_REPOSITORY`   | Artifact Registry repo       | `real-state`                          |
| `_DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `_AUTH_SECRET`  | NextAuth secret (32+ chars)  | `openssl rand -base64 32`             |

## Verificar Despliegue

```bash
# Ver logs de Cloud Build
gcloud builds list --limit=5

# Ver logs de Cloud Run
gcloud run services logs read real-state-staging \
  --region=us-central1 \
  --limit=50

# Obtener URL del servicio
gcloud run services describe real-state-staging \
  --region=us-central1 \
  --format='value(status.url)'
```

## Troubleshooting

### Error: Permission denied

```bash
# Verificar permisos de Cloud Build
gcloud projects get-iam-policy $(gcloud config get-value project) \
  --flatten="bindings[].members" \
  --filter="bindings.members:*cloudbuild*"
```

### Error: Service not found

```bash
# Listar servicios de Cloud Run
gcloud run services list --region=us-central1
```

### Error de conexión a base de datos

- Verificar que la IP de Cloud Run esté permitida en PostgreSQL
- Para Cloud SQL: usar Cloud SQL Proxy o conexión privada
- Verificar formato del DATABASE_URL

## Arquitectura

```
┌─────────────────┐
│  GitHub Repo    │
└────────┬────────┘
         │ push
         ▼
┌─────────────────┐
│  Cloud Build    │◄─── Variables inyectadas
│  - Build image  │      (_DATABASE_URL, _AUTH_SECRET)
│  - Push to AR   │
│  - Deploy CR    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Artifact        │
│ Registry        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Cloud Run      │─────▶│  PostgreSQL  │
│  (Staging)      │      │  Database    │
└─────────────────┘      └──────────────┘
```

## Seguridad

- ❌ **NO commitear** archivos `.env.staging` o `.env.production`
- ✅ Usar variables inyectadas desde el pipeline de CI/CD
- ✅ Rotar `_AUTH_SECRET` periódicamente
- ✅ Usar Cloud SQL con conexión privada en producción
- ✅ Limitar acceso al servicio de Cloud Run con IAM
