# FinTrack - Personal Finance Tracker

## Overview

FinTrack is a personal finance management application that helps users track income and expenses, view financial summaries, and analyze spending by category. The app features a modern fintech-style UI with a dashboard showing key metrics, transaction management, and data visualizations using charts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom fintech-themed design tokens
- **Charts**: Recharts for data visualization (pie charts, bar charts)
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in shared route contracts
- **Build Tool**: esbuild for server bundling, Vite for client

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` with Zod integration via drizzle-zod
- **Current Storage**: JSON file-based storage (`data.json`) as fallback
- **Database Ready**: PostgreSQL configuration in place via `DATABASE_URL` environment variable

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and TypeScript types
- `routes.ts`: API contract definitions with Zod schemas for request/response validation

### Key Design Decisions

1. **Type-Safe API Contract**: Routes are defined with Zod schemas in `shared/routes.ts`, enabling runtime validation and TypeScript inference on both client and server.

2. **Dual Storage Strategy**: The app uses `JsonStorage` class that reads/writes to `data.json` for development, but the schema and database configuration support PostgreSQL for production.

3. **Component-Driven UI**: Uses shadcn/ui's "new-york" style with custom CSS variables for theming. Components are in `client/src/components/ui/`.

4. **Monorepo Structure**: Single package with `client/`, `server/`, and `shared/` directories. Path aliases (`@/`, `@shared/`) configured in TypeScript and Vite.

## External Dependencies

### Database
- **PostgreSQL**: Required for production. Set `DATABASE_URL` environment variable.
- **Drizzle Kit**: Used for schema migrations (`npm run db:push`)

### Key npm Packages
- `drizzle-orm` / `drizzle-zod`: Database ORM and schema-to-Zod conversion
- `@tanstack/react-query`: Data fetching and caching
- `recharts`: Chart visualizations
- `date-fns`: Date formatting
- `zod`: Schema validation throughout the stack

### Development Tools
- Vite dev server with HMR for frontend
- tsx for running TypeScript server directly
- Replit-specific plugins for dev experience (@replit/vite-plugin-*)