# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 16 blog application using Convex as the real-time backend, Better Auth for authentication, and Tailwind CSS for styling. The project demonstrates modern full-stack architecture with React Server Components, Server Actions, and role-based access control.

## Development Commands

### Running the Application
```bash
# Install dependencies
pnpm install  # or npm install

# Start Next.js dev server
pnpm dev

# Start Convex backend (in separate terminal)
npx convex dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

### Environment Setup
Required environment variables in `.env.local`:
- `CONVEX_DEPLOYMENT` - Convex deployment name
- `NEXT_PUBLIC_CONVEX_URL` - Convex URL (from `npx convex dev`)
- `NEXT_PUBLIC_CONVEX_SITE_URL` - Convex site URL
- `BETTER_AUTH_SECRET` - Secret for Better Auth
- `SITE_URL` - Application URL (e.g., http://localhost:3000)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - For Google OAuth

Initialize Convex deployment: `npx convex dev`

## Architecture

### Backend: Convex Functions

All backend logic lives in the `/convex` directory as query/mutation functions:

- **Schema** ([convex/schema.ts](convex/schema.ts)) - Defines tables: posts, comments, projects, tasks, images
- **Queries/Mutations** - Each resource has its own file (posts.ts, comments.ts, projects.ts, tasks.ts, images.ts)
- **Authentication Component** ([convex/betterAuth/auth.ts](convex/betterAuth/auth.ts)) - Better Auth integration via Convex component
- **HTTP Router** ([convex/http.ts](convex/http.ts)) - Handles auth routes via httpRouter
- **Convex Config** ([convex/convex.config.ts](convex/convex.config.ts)) - Mounts betterAuth and presence components

### Frontend: Next.js App Router

**Route Structure:**
- `app/(shared-layout)/` - Routes with shared navbar layout
  - `/` - Home page
  - `/blog` - Blog list
  - `/blog/[postId]` - Individual blog post
  - `/create` - Create new post
  - `/projects` - Projects list
  - `/projects/[projectId]` - Project detail with tasks
  - `/projects/create` - Create new project
- `app/auth/` - Authentication routes (login, sign-up) with separate layout

**Server Actions** ([app/actions.ts](app/actions.ts)) - All data mutations happen through server actions:
- `createBlogAction` - Creates post with image upload
- `createCommentAction` - Adds comment to post
- `deletePostAction` - Deletes post
- `createProjectAction` - Creates project with optional image
- `createTaskAction` - Creates task for project
- `deleteProjectAction` / `deleteTaskAction` - Delete operations

All actions use `getToken()` from auth-server to pass auth context to Convex mutations.

**Validation Schemas** (`app/schemas/`) - Zod schemas for form validation (auth.ts, blog.ts, comment.ts, project.ts, task.ts)

### Authentication Architecture

**Better Auth + Convex Integration:**
- Auth logic runs through Convex component at [convex/betterAuth/auth.ts](convex/betterAuth/auth.ts)
- Client-side: [lib/auth-client.ts](lib/auth-client.ts) exports `authClient` for React hooks
- Server-side: [lib/auth-server.ts](lib/auth-server.ts) exports helpers (`getToken`, `isAuthenticated`, `fetchAuthQuery`, etc.)
- Auth routes registered via HTTP router in [convex/http.ts](convex/http.ts)

**Role-Based Access Control:**
- Roles defined in [lib/auth/permissions.ts](lib/auth/permissions.ts): user, admin, owner
- Admin/owner required to create posts (enforced in convex/posts.ts mutations)
- Authors can delete their own posts; admins/owners can delete any post

### Data Flow Pattern

1. **Client Component** renders form with React Hook Form + Zod validation
2. **Form submission** calls Server Action from [app/actions.ts](app/actions.ts)
3. **Server Action**:
   - Validates input with Zod schema
   - Gets auth token via `getToken()`
   - Calls Convex mutation via `fetchMutation(api.*.*, args, { token })`
   - Handles image uploads by generating upload URL, uploading to Convex storage
   - Revalidates cache with `revalidatePath()` or `updateTag()`
   - Redirects on success
4. **Convex Mutation** ([convex/*.ts](convex/)):
   - Validates auth via `authComponent.safeGetAuthUser(ctx)`
   - Enforces role-based permissions
   - Performs database operations
   - Returns result

### Image Handling

- Images uploaded to Convex storage via `generateUploadUrl` mutations
- Storage IDs stored in database tables
- URLs retrieved via `ctx.storage.getUrl(storageId)` in queries
- Allowed image domains configured in [next.config.ts](next.config.ts)

### Convex Real-time Features

- Presence tracking via `@convex-dev/presence` component (see [convex/presence.ts](convex/presence.ts))
- All Convex queries are reactive - UI auto-updates when data changes
- Client Provider: [components/web/ConvexClientProvider.tsx](components/web/ConvexClientProvider.tsx) wraps app with `ConvexBetterAuthProvider`

### Component Organization

- `components/web/` - Web-specific components (Navbar, PostPresence, SearchInput, etc.)
- `components/ui/` - Shadcn UI primitives
- Client components use Convex hooks (`useQuery`, `useMutation`) for real-time data
- Server components use `fetchQuery` from auth-server for initial data

## Key Technical Details

- **Next.js 16 Features**: App Router, Server Actions, React Server Components, enhanced caching
- **Tailwind v4**: Uses `@tailwindcss/postcss` (check [postcss.config.mjs](postcss.config.mjs))
- **Search**: Full-text search implemented via Convex search indexes on posts (title/body), projects (title/description), and tasks (title/description)
- **Cache Management**: Uses both `revalidatePath()` and `updateTag()` for cache invalidation - tags like "blog" and "projects" are used
