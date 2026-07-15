# Shipyard Routes

This document outlines the routing structure for the Shipyard Next.js application.

---

## Public & Authentication Routes

### `/` (Landing Page)
- **Description:** Marketing page for the open-source platform.
- **Access:** Public.

### `/login`
- **Description:** User authentication portal (Email/Password & GitHub OAuth).
- **Access:** Public.

### `/signup`
- **Description:** New user and organisation registration flow.
- **Access:** Public.

---

## Application Routes (Protected)

### `/dashboard`
- **Description:** The Personal Developer Workspace. Shows assigned issues, pending PR reviews, and immediate priorities across all teams.
- **Access:** Authenticated Users.

### `/dashboard/projects`
- **Description:** List of all active engineering projects within the current team/organisation.
- **Access:** Authenticated Users.

### `/dashboard/projects/[id]`
- **Description:** Detailed view of a single project. Contains Tabs for: Overview, Board (Kanban), List, and Timeline.
- **Access:** Project Members / Managers.

### `/dashboard/teams`
- **Description:** Directory of all teams within the organisation. Allows viewing team workload and structure.
- **Access:** Authenticated Users.

### `/dashboard/teams/[id]`
- **Description:** Specific team hub showing team members, active sprints/cycles, and team-specific analytics.
- **Access:** Team Members / Managers.

### `/dashboard/repos`
- **Description:** GitHub integration hub. Connect, disconnect, and manage repository sync status.
- **Access:** Organisation Admins / Engineering Managers.

### `/dashboard/releases`
- **Description:** Timeline and catalog of shipped software. Connects deployed versions to closed issues.
- **Access:** Authenticated Users.

### `/dashboard/analytics`
- **Description:** Engineering Intelligence Dashboard. Velocity charts, PR bottlenecks, and team health metrics.
- **Access:** Managers / Leads (configurable via RBAC).

### `/dashboard/settings`
- **Description:** User preferences (Theme, Notifications).
- **Access:** Authenticated Users.

### `/dashboard/settings/organisation`
- **Description:** Org-wide configuration, billing, and global permissions.
- **Access:** Organisation Admins.
