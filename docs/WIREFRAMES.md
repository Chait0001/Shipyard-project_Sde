# Shipyard Wireframes

This document provides ASCII representations of the core page layouts to guide the UI implementation.

---

## 1. Global Application Layout

```text
+-------------------------------------------------------------+
| [Org Switcher] | Search (Cmd+K)              [Profile] [🌙] |
|----------------+--------------------------------------------|
| Team A         |                                            |
|  - Projects    |  +--------------------------------------+  |
|  - Issues      |  |                                      |  |
|  - Analytics   |  |        Main Content Area             |  |
|                |  |                                      |  |
| Team B         |  |                                      |  |
|  - Projects    |  |                                      |  |
|  - Issues      |  |                                      |  |
|                |  +--------------------------------------+  |
|                |                                            |
| Settings       |                                            |
+-------------------------------------------------------------+
```
**Notes:** 
- The Sidebar on the left is collapsible.
- The Top Navbar contains global context (Breadcrumbs, Search, Profile).

---

## 2. Developer Workspace (`/dashboard`)

```text
+-------------------------------------------------------------+
| Good morning, Jane.                                         |
|                                                             |
| [ Your Active PRs (3) ]        [ Blocked Issues (1) ]       |
| +-------------------------+    +-------------------------+  |
| | Fix Navbar (#42)        |    | DB Migration pending    |  |
| | Reviewing...            |    | Needs @backend-team     |  |
| +-------------------------+    +-------------------------+  |
|                                                             |
| Your Assigned Issues                                        |
| ----------------------------------------------------------- |
| [ ] High  | Implement OAuth        | Frontend Team | Today  |
| [ ] Med   | Create User Settings   | Frontend Team | Jan 12 |
| [ ] Low   | Update Readme          | Platform Team | Jan 15 |
|                                                             |
+-------------------------------------------------------------+
```

---

## 3. Project Detail Kanban Board (`/dashboard/projects/[id]`)

```text
+-------------------------------------------------------------+
| Auth System Rewrite                        [Filter] [New +] |
| [Overview] [Board] [List] [Timeline]                        |
| ----------------------------------------------------------- |
| Todo (2)            In Progress (1)       Done (5)          |
| +---------------+   +---------------+     +---------------+ |
| | Setup DB      |   | OAuth Flow    |     | Login UI      | |
| | [P1] [@jane]  |   | [P2] [@john]  |     | [P2] [@jane]  | |
| +---------------+   +---------------+     +---------------+ |
| | JWT Hooks     |                         | Signup UI     | |
| | [P2] [@alex]  |                         | [P1] [@john]  | |
| +---------------+                         +---------------+ |
+-------------------------------------------------------------+
```

---

## 4. Analytics Dashboard (`/dashboard/analytics`)

```text
+-------------------------------------------------------------+
| Team Velocity & Health                       [Date Picker]  |
|                                                             |
| [ Issues Closed: 45 ^ ]       [ Avg Merge Time: 2.1d v ]    |
|                                                             |
| Velocity (Chart)              Pull Request Bottlenecks      |
| +----------------------+      +-------------------------+   |
| |   _/\_         _     |      | Auth Service: 4 waiting |   |
| | _/    \_/\____/ \    |      | UI Library: 1 waiting   |   |
| |/                 \   |      |                         |   |
| +----------------------+      +-------------------------+   |
|                                                             |
+-------------------------------------------------------------+
```
