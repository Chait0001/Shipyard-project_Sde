# Shipyard API Contracts

This document outlines the expected API contracts between the Shipyard frontend and the backend.

Assume endpoints are prefixed with `/api/v1`.

---

## 1. Authentication & Identity

### Get Current User
- **Method:** `GET`
- **Endpoint:** `/auth/me`
- **Response (200 OK):**
  ```json
  {
    "id": "usr_123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatarUrl": "https://...",
    "globalRole": "admin"
  }
  ```
- **Loading State:** Skeleton avatar and name block in Sidebar.
- **Error State:** Redirect to `/login`.

---

## 2. Organisation & Teams

### Get User Organisations
- **Method:** `GET`
- **Endpoint:** `/organisations`
- **Response (200 OK):**
  ```json
  [
    {
      "id": "org_1",
      "name": "Acme Corp",
      "slug": "acme",
      "role": "admin"
    }
  ]
  ```
- **Loading State:** Skeleton list in workspace switcher.
- **Error State:** Empty state asking to create an org.

### Get Teams in Organisation
- **Method:** `GET`
- **Endpoint:** `/organisations/:orgId/teams`
- **Response (200 OK):**
  ```json
  [
    {
      "id": "team_1",
      "name": "Frontend Platform",
      "slug": "frontend",
      "memberCount": 12
    }
  ]
  ```

---

## 3. GitHub Integration

### Connect Repository
- **Method:** `POST`
- **Endpoint:** `/github/installations/:installId/repositories`
- **Request:**
  ```json
  {
    "repositoryId": 98765432,
    "teamId": "team_1"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "repo_1",
    "status": "syncing"
  }
  ```

---

## 4. Workflows & Issues

### Get Project Issues
- **Method:** `GET`
- **Endpoint:** `/projects/:projectId/issues`
- **Response (200 OK):**
  ```json
  [
    {
      "id": "iss_1",
      "title": "Build Auth Middleware",
      "status": "in_progress",
      "priority": "high",
      "assignee": {
        "id": "usr_123",
        "name": "Jane Doe"
      },
      "githubPr": {
        "number": 42,
        "state": "open"
      }
    }
  ]
  ```
- **Loading State:** Kanban board skeleton columns or list view skeleton rows.
- **Error State:** Toast notification.

### Update Issue Status
- **Method:** `PATCH`
- **Endpoint:** `/issues/:issueId`
- **Request:**
  ```json
  {
    "status": "completed"
  }
  ```
- **Response (200 OK):** Updated issue object.
- **Loading State:** Optimistic UI update (immediately move card on frontend).
- **Error State:** Revert optimistic update, show toast error.
