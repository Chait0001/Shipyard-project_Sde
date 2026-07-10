# Changelog

All notable changes to the Shipyard frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
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
