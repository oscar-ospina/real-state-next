# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real estate rental application (Zillow-like) for landlords and tenants in Colombia. Built as a Next.js monolith with PostgreSQL.

## Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # Run ESLint

# Database (requires .env file with DATABASE_URL)
npm run db:push          # Push schema changes to DB
npm run db:generate      # Generate migration files
npm run db:studio        # Open Drizzle Studio
npm run db:seed          # Create test users (admin + regular)

# Docker
docker-compose up -d     # Start PostgreSQL (port 5433)
docker-compose down      # Stop containers
```

## Architecture

### Stack
- Next.js 16 with App Router and React 19
- NextAuth v5 (beta) with credentials provider
- Drizzle ORM with PostgreSQL
- Tailwind CSS 4 + shadcn/ui
- Zod for validation

### Route Groups
- `src/app/(auth)/` - Login and register pages (client components)
- `src/app/(main)/` - Protected routes: dashboard, properties
- `src/app/api/` - API routes for CRUD operations

### Key Files
- `src/lib/db/schema.ts` - Drizzle schema (users, properties, property_images)
- `src/lib/db/index.ts` - Database client export
- `src/lib/db/seed.ts` - Database seed script (test users)
- `src/lib/auth.ts` - NextAuth configuration and exports (auth, signIn, signOut)
- `src/lib/validations/property.ts` - Zod schema for property form validation
- `src/types/next-auth.d.ts` - Extended session types with roles

### Database Schema
Three main tables with relations:
- **users**: id, email, passwordHash, roles (array: admin/landlord/tenant)
- **properties**: id, ownerId (FK), title, price, address, city, bedrooms, etc.
- **property_images**: id, propertyId (FK), url, isPrimary, order

### Seed Users
Run `npm run db:seed` to create test users:
- **Admin**: admin@realstate.com / admin123 (roles: admin, landlord)
- **User**: usuario@realstate.com / user123 (roles: tenant)

### Auth Pattern
```typescript
import { auth } from "@/lib/auth";
const session = await auth();
// session.user.id, session.user.roles available
```

### Role System
Users can have multiple roles simultaneously. Available roles: `admin`, `landlord`, `tenant`. Check with:
```typescript
session.user.roles?.includes("admin")    // Check if admin
session.user.roles?.includes("landlord") // Check if landlord
```

## Environment Variables

Required in `.env` or `.env.local`:
```
DATABASE_URL="postgresql://realstate:realstate123@localhost:5433/realstate"
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

Note: drizzle-kit reads from `.env` (not `.env.local`).

## UI Components

### Interactive States Pattern
All UI components include hover, focus, and active states. When adding new components:

```typescript
// Use transition-all duration-200 for smooth animations
className="transition-all duration-200 ease-out"

// Buttons use scale on active
className="active:scale-[0.98]"

// Cards use elevation and translate on hover
className="hover:shadow-xl hover:-translate-y-1"

// Use group for parent-child hover effects
<div className="group">
  <span className="group-hover:text-blue-600">...</span>
</div>
```

### Component Files
- `src/components/ui/button.tsx` - Button with variants (default, destructive, outline, secondary, ghost, link)
- `src/components/ui/input.tsx` - Input with hover and focus states
- `src/components/ui/card.tsx` - Card with transition support
- `src/components/properties/PropertyCard.tsx` - Property listing card with image zoom effect
- `src/components/properties/PropertyForm.tsx` - Form for creating new properties (landlord only)

### Property Publishing
Landlords can publish properties at `/dashboard/new-property`:
- Server-side auth and role verification
- Client-side form with Zod validation
- POST to `/api/properties` (existing endpoint)
- Redirect to dashboard on success
