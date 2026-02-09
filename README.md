# RealState

Aplicación de arriendo de propiedades inmobiliarias (estilo Zillow) para Colombia. Conecta arrendadores con arrendatarios de forma fácil y segura.

## Stack Tecnológico

- **Framework**: Next.js 16 con App Router y React 19
- **Base de datos**: PostgreSQL con Drizzle ORM
- **Autenticación**: NextAuth v5 (beta) con credenciales
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Validación**: Zod

## Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env`:

```env
DATABASE_URL="postgresql://realstate:realstate123@localhost:5433/realstate"
AUTH_SECRET="tu-clave-secreta"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Iniciar PostgreSQL

```bash
docker-compose up -d
```

### 4. Inicializar base de datos

```bash
npm run db:push
```

### 5. Ejecutar servidor de desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm run db:push` | Push de schema a BD |
| `npm run db:generate` | Generar migraciones |
| `npm run db:studio` | Abrir Drizzle Studio |

## Características

- Búsqueda avanzada de propiedades
- Sistema de roles (arrendador/arrendatario)
- Gestión de propiedades con imágenes
- UI responsiva con estados interactivos (hover, focus, active)
- Modo oscuro (próximamente)

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/          # Páginas de login y registro
│   ├── (main)/          # Rutas protegidas
│   └── api/             # API routes
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   └── properties/      # Componentes de propiedades
├── lib/
│   ├── db/              # Schema y cliente Drizzle
│   └── auth.ts          # Configuración NextAuth
└── types/               # Definiciones TypeScript
```

## UI/UX

Los componentes incluyen estados interactivos mejorados:

- **Botones**: Hover con cambio de color y sombra, estado active con scale
- **Inputs**: Hover con borde resaltado, focus con ring y sombra
- **Cards**: Transiciones suaves, efecto de elevación en hover
- **PropertyCard**: Imagen con zoom, título con color en hover, badge animado
