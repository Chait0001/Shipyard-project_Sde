# Shipyard Components Library

This document lists all reusable UI components in the Shipyard frontend. All components should be built with maximum reusability and adhere to the Design System.

---

## Core UI Components

### Buttons
- **Purpose:** Trigger actions across the app (forms, links, destructive actions).
- **Props:** `variant` (primary, secondary, ghost, destructive), `size` (sm, md, lg, icon), `isLoading`, `disabled`, `iconLeft`, `iconRight`.
- **Reusability:** High (Used on every page).
- **Dependencies:** Radix UI Slot, Tailwind Variants.

### Cards
- **Purpose:** Container for isolated information (projects, tasks, settings).
- **Props:** `title`, `description`, `footer`, `padding` (none, sm, md).
- **Reusability:** High.
- **Dependencies:** None.

### Dialogs / Modals
- **Purpose:** Intercept user flow for focused tasks (creating projects, inviting users).
- **Props:** `isOpen`, `onClose`, `title`, `description`, `trigger`, `size`.
- **Reusability:** High.
- **Dependencies:** Radix UI Dialog.

### Badges
- **Purpose:** Display status, priority, or labels.
- **Props:** `variant` (success, warning, error, neutral, outline), `text`, `icon`.
- **Reusability:** High.
- **Dependencies:** None.

### Tabs
- **Purpose:** Switch between contextual views within the same page (e.g., Kanban vs List).
- **Props:** `defaultValue`, `tabs` (Array of objects with label and value).
- **Reusability:** Medium.
- **Dependencies:** Radix UI Tabs.

### Tables
- **Purpose:** Display structured data (Team members, repos, releases).
- **Props:** `columns`, `data`, `sortable`, `pagination`.
- **Reusability:** Medium.
- **Dependencies:** TanStack Table.

---

## Layout Components

### Sidebar
- **Purpose:** Primary application navigation.
- **Props:** `collapsible`, `activeRoute`, `teams`.
- **Reusability:** Singular (App Layout).
- **Dependencies:** Next/Link, Lucide Icons.

### Navbar
- **Purpose:** Contextual top bar with global actions (Search, Profile).
- **Props:** `breadcrumbs`, `user`.
- **Reusability:** Singular (App Layout).
- **Dependencies:** None.

---

## Domain-Specific Components

### Issue Cards
- **Purpose:** Represent a single task on a Kanban board or list.
- **Props:** `issueId`, `title`, `status`, `priority`, `assignee`, `githubSyncState`.
- **Reusability:** High (Board, Lists, Workspace).
- **Dependencies:** DnD Kit (for Kanban).

### Project Cards
- **Purpose:** Display high-level project status and progress bar.
- **Props:** `projectName`, `progress`, `dueDate`, `lead`.
- **Reusability:** Medium.
- **Dependencies:** Progress component.

### Analytics Cards
- **Purpose:** Display metric summaries (e.g., "Avg PR Merge Time").
- **Props:** `title`, `value`, `trend` (up, down, neutral), `chartData`.
- **Reusability:** Medium.
- **Dependencies:** Recharts.

### Kanban Board
- **Purpose:** Drag-and-drop interface for workflows.
- **Props:** `columns`, `items`, `onDragEnd`.
- **Reusability:** Low.
- **Dependencies:** DnD Kit.

### Activity Timeline
- **Purpose:** Display chronological events for issues/projects.
- **Props:** `events` (Array of action, user, timestamp).
- **Reusability:** Medium.
- **Dependencies:** None.
