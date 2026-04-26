# ERP Project Progress

## Tech Stack

- Frontend: Next 16, React, Ant Design, SCSS
- Backend: NestJS
- Database: PostgreSQL via Prisma ORM 7
- Architecture: NPM workspaces monorepo

## Completed

- Created monorepo structure:
  - `apps/frontend`
  - `apps/backend`
  - `docs`
- Added root workspace scripts for dev/build/lint.
- Added Docker Compose for PostgreSQL.
- Added `.env.example`.
- Built frontend Login page:
  - Ant Design form loaded through a dynamic client chunk so the form appears after AntD is ready
  - Email/password validation
  - Demo credential prefill
  - Uses NextAuth Credentials provider
  - Calls backend `/auth/login` from the NextAuth authorize callback
  - Stores auth state in NextAuth JWT session cookies instead of `localStorage`
- Built frontend Register page:
  - Ant Design form loaded through a dynamic client chunk
  - Calls backend `/auth/register`
  - Signs in through NextAuth after successful registration
  - Links between Login and Register pages
  - Scoped AntD React 19 patch to client chunks that import AntD
  - Replaced login background with a generated formal corporate ERP image stored locally
  - Added inline critical CSS to reduce first-reload FOUC in development
  - Replaced initial page-ready gate with an SSR overlay to avoid hydration mismatches
- Built frontend Main Menu page:
  - ERP sidebar layout
  - User/profile area
  - Logout action
  - Protected by NextAuth proxy
  - ERP module tiles
  - Loads menu from backend `/menu` with fallback data
  - Sends NextAuth access token to backend so menus can be filtered by department permissions
- Built backend base:
  - NestJS bootstrap
  - CORS for frontend
  - Global validation pipe
  - Config module
  - Prisma ORM 7 setup
  - PostgreSQL connection via `DATABASE_URL`
  - Auth module with demo login
  - Register endpoint with Prisma user creation and bcrypt password hashing
  - Menu module with ERP menu list
  - Department table and department-menu permission model
  - `/menu` filters visible menu items by the logged-in user's department

## Demo Account

- Email: `admin@erp.local`
- Password: `admin123`

## Next Tasks

- Add real User records and PostgreSQL-backed authentication.
- Add password hashing and user seed script.
- Add JWT guard for protected backend endpoints.
- Add frontend route guard for pages that need login.
- Add persistent NextAuth database sessions after real users are stored in PostgreSQL.
- Add ERP module pages:
  - Sales
  - Inventory
  - Purchase
  - Accounting
  - HR
  - Reports
- Add role and permission management.
- Add department management screens and menu permission assignment UI.
- Add and run Prisma migrations for the initial schema.

## Notes

- Backend now uses Prisma Client generated from `apps/backend/prisma/schema.prisma`.
- Prisma reads PostgreSQL connection from `apps/backend/.env` through `DATABASE_URL`.
- Current login still supports demo credentials so the UI/backend flow can be tested quickly.
- Frontend also accepts the demo login when the backend is not running yet.
- Ant Design uses `@ant-design/v5-patch-for-react-19` because the project runs on React 19 through Next 16.
- Run `npm run prisma:migrate -w apps/backend` to create/update database tables.
