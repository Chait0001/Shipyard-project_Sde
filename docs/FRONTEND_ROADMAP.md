# Shipyard Frontend Roadmap

Shipyard is built in four distinct phases to ensure stability, continuous delivery, and iterative testing.

---

## Phase 1: Foundation & Identity (Weeks 1-2)
**Goal:** Establish the core infrastructure, routing, and access control.

**What gets built:**
- Next.js application scaffolding with Tailwind and shadcn/ui.
- Authentication flows (Login, Signup, GitHub OAuth).
- Global layout (Sidebar, Navbar, Layout structure).
- Organisation and Team management capabilities.
- The fundamental routing system and RBAC middleware.

---

## Phase 2: Execution & Workflows (Weeks 3-4)
**Goal:** Enable developers and managers to interact with real engineering tasks.

**What gets built:**
- GitHub App integration flows and repository linking UI.
- Personal Developer Workspace (My Issues, PRs).
- Project Management Layer (Projects listing, creation).
- Issue tracking interfaces (Kanban boards, List views).
- Detailed issue panels with markdown editors and metadata selectors.

---

## Phase 3: Analytics & Intelligence (Weeks 5-6)
**Goal:** Deliver the "Intelligence" part of Shipyard for managers and leads.

**What gets built:**
- Analytics Dashboard with interactive charts.
- Delivery analytics (planned vs completed).
- Pull Request analytics (merge times, review bottlenecks).
- Team capacity and repository health metrics.
- Release Intelligence tracking and timeline views.

---

## Phase 4: Polish, Performance & Open Source (Weeks 7-8)
**Goal:** Refine the user experience to meet premium SaaS expectations and prepare for community contributions.

**What gets built:**
- Command-K palette for rapid navigation.
- Real-time UI updates and optimistic rendering.
- Comprehensive loading states (Skeletons) and empty states.
- Accessibility (a11y) improvements and keyboard navigation.
- Extensibility hooks for Open Source developers.
