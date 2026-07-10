# Changelog

All notable changes to the Shipyard frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Implemented teams overview page at `/dashboard/teams` displaying a grid of organisation team cards, including search filters, loading skeleton states, and a graceful fallback to rich mockup data when connection is offline.
- Implemented `ThemeContext` state provider to manage, persist, and apply dark/light styling preferences across components.
- Created `ThemeToggle` action button rendering dynamic Sun/Moon icons in the Navbar right actions section.
- Implemented `OrganisationContext` state provider to fetch, store, and persist active organization workspace selections across platform sections.
- Created `WorkspaceSwitcher` dropdown component displaying selectable organization workspaces inside the collapsible `Sidebar` header.
- Implemented `UserProfileDropdown` menu displaying the active user's details (name, email, role badge), action link placeholders, and a functional log out trigger.
- Added mouse click-outside triggers and keyboard Escape key listeners to close the `UserProfileDropdown` dynamically.
- Created reusable `Breadcrumb` component that dynamically reads location pathname, maps path segments to clean text values, and renders them in semantic lists.
- Implemented `Navbar` header component with custom styling, left slots for future Breadcrumbs, right slots for user dropdowns, and a centered Global Search field.
- Integrated keyboard listener in `Navbar` to automatically focus the search field upon pressing `⌘K` (on macOS) or `Ctrl+K` (on Windows/Linux) shortcut keys.
- Implemented `DashboardLayout` container with collapsible sidebar navigation, including full mobile responsiveness (overlay navigation drawer on screens <= 768px).
- Created reusable `Sidebar` navigation component with route active states, collapsible controls, and user profile footer matching the design system.
- Scaffolded React + Vite + TypeScript project inside `Client/` directory.
- Configured path aliases (`@/`) in both Vite and TypeScript configs.
- Implemented global CSS stylesheet with full design token system (colors, typography, spacing, radius, shadows) for both light and dark mode.
- Updated `index.html` with Inter and JetBrains Mono font loading, Shipyard meta tags.
- Replaced Vite boilerplate with clean Shipyard root shell.
- Added Vite dev server proxy to backend (`/api` → `localhost:5000`).
- Installed core dependencies: `react-router-dom` v7, `axios` v1, `lucide-react` v1.
- Configured ESLint (flat config) with `typescript-eslint`, `react-hooks`, `react-refresh`, and Prettier integration.
- Configured Prettier with project code style rules (no semicolons, single quotes, 100 char width).
- Added `lint`, `lint:fix`, `format`, and `format:check` npm scripts.
- Created core application folder structure (`components`, `pages`, `context`, `utils`, `hooks`, `styles`).
- Configured custom Axios instance with JWT request interceptor and 401 response error handler.
- Created reusable `Button` component (variants: primary, secondary, ghost, destructive; sizes: sm, md, lg, icon; loading state).
- Created reusable `Input` component (label, inline error, aria-invalid, aria-describedby support).
- Created `/login` page with email/password form, client-side validation, inline errors, GitHub OAuth button, and responsive mobile layout.
- Created `/signup` page with form validation, confirmation checks, and GitHub OAuth registration.
- Extracted shared auth CSS styles into a common `src/styles/auth.css` file reused by both auth pages.
- Wired `BrowserRouter`, `/login`, and `/signup` routes into `App.tsx`.
- Created `AuthContext` provider handling global state (`user`, `isAuthenticated`, `isLoading`), Axios API integration, JWT local storage persistence, and authentication mount check.
- Wired `useAuth` authentication hook into the `LoginPage` and `SignupPage` forms.
- Implemented GitHub OAuth login flow with CSRF-safe state parameter and `redirectToGitHub()` helper utility (`src/utils/github.ts`).
- Added `loginWithGitHub(code)` method to `AuthContext` that exchanges a GitHub authorisation code for a JWT via `POST /api/v1/auth/github`.
- Created `OAuthCallbackPage` (`/oauth/github/callback`) with processing spinner, CSRF state validation, error display with back-to-login link, and responsive styling.
- Wired GitHub OAuth buttons in `LoginPage` and `SignupPage` to trigger the GitHub authorisation redirect.
- Added `/oauth/github/callback` route to `App.tsx`.
- Created `ProtectedRoute` wrapper component (`src/components/ProtectedRoute/`) with full-page loading spinner during auth check, automatic redirect to `/login` for unauthenticated users, and `<Outlet />` rendering for authenticated child routes.
- Wrapped all dashboard routes inside `<ProtectedRoute />` layout route in `App.tsx`, separating public and protected route groups.
- Added redirect-back-after-login support to `LoginPage` — reads `location.state.from` (set by `ProtectedRoute`) and navigates to the originally requested URL after successful sign-in.
- Created `Role` type and hierarchical permission utilities (`src/utils/roles.ts`) with `hasMinimumRole()` and `hasRole()` functions for RBAC checks.
- Created `useRole` hook (`src/hooks/useRole.ts`) providing the current user's role, convenience booleans (`isAdmin`, `isManager`, `isEngineer`, etc.), and `isAtLeast()`/`is()` check methods.
- Created `useRequireRole` hook (`src/hooks/useRequireRole.ts`) for imperative page-level role guards with automatic redirect on insufficient permissions.
- Created `RoleGate` component (`src/hooks/RoleGate.tsx`) for declarative conditional rendering based on role, with optional fallback content.
- Extended `ProtectedRoute` with optional `allowedRoles` prop for route-level RBAC, displaying an access-denied screen with lock icon when the user lacks the required role.
- Created `src/hooks/index.ts` barrel export for all RBAC hooks and components.

### Changed
- Nothing yet.

### Deprecated
- Nothing yet.

### Removed
- Nothing yet.

### Fixed
- Nothing yet.

### Security
- Nothing yet.
