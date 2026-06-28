# Shipyard API Reference

This document outlines the API endpoints, request payloads, response structures, and error states for the **Shipyard** backend service.

---

## Configuration

*   **Base URL (Development)**: `http://localhost:5000/api`
*   **Base URL (Production)**: `https://api.shipyard-app.com/api`
*   **Request/Response Format**: `application/json`

---

## Authentication

Routes designated with a lock symbol 🔒 require a JSON Web Token (JWT) provided in the `Authorization` header.

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication Endpoints

### Register User
Creates a new user account.

*   **Endpoint**: `/auth/register`
*   **Method**: `POST`
*   **Authentication**: None

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | The user's full name. |
| `email` | `string` | Yes | A unique email address. |
| `password` | `string` | Yes | Minimum 6 characters. |

```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDA3ZTYwMGE0ZDFkMmI3OGIwZjhlOSJ9...",
  "user": {
    "id": "60d07e600a4d1d2b78b0f8e9",
    "name": "John Doe",
    "email": "johndoe@example.com",
    "createdAt": "2026-06-28T09:21:38.000Z"
  }
}
```

---

### Login User
Authenticates an existing user and returns a JSON Web Token (JWT).

*   **Endpoint**: `/auth/login`
*   **Method**: `POST`
*   **Authentication**: None

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | The user's registered email address. |
| `password` | `string` | Yes | The user's password. |

```json
{
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDA3ZTYwMGE0ZDFkMmI3OGIwZjhlOSJ9...",
  "user": {
    "id": "60d07e600a4d1d2b78b0f8e9",
    "name": "John Doe",
    "email": "johndoe@example.com"
  }
}
```

---

## Project Endpoints

### Create Project 🔒
Initializes a new project tracking registry in the shipyard database.

*   **Endpoint**: `/projects`
*   **Method**: `POST`
*   **Authentication**: Required

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Yes | The project's unique title name. |
| `description` | `string` | No | Narrative description of the project goal. |
| `status` | `string` | No | Options: `pending`, `active`, `completed` (default: `pending`). |

```json
{
  "title": "Alpha Deployment Pipeline",
  "description": "Primary deployment flow for internal tracking and diagnostics.",
  "status": "pending"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "60d07e600a4d1d2b78b0f8f1",
    "title": "Alpha Deployment Pipeline",
    "description": "Primary deployment flow for internal tracking and diagnostics.",
    "status": "pending",
    "owner": "60d07e600a4d1d2b78b0f8e9",
    "createdAt": "2026-06-28T09:21:38.000Z",
    "updatedAt": "2026-06-28T09:21:38.000Z"
  }
}
```

---

### Get All Projects 🔒
Retrieves all projects owned by the authenticated user.

*   **Endpoint**: `/projects`
*   **Method**: `GET`
*   **Authentication**: Required

#### Response (200 OK)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d07e600a4d1d2b78b0f8f1",
      "title": "Alpha Deployment Pipeline",
      "description": "Primary deployment flow for internal tracking and diagnostics.",
      "status": "pending",
      "owner": "60d07e600a4d1d2b78b0f8e9",
      "createdAt": "2026-06-28T09:21:38.000Z",
      "updatedAt": "2026-06-28T09:21:38.000Z"
    }
  ]
}
```

---

### Get Project by ID 🔒
Retrieves a specific project by its ID.

*   **Endpoint**: `/projects/:id`
*   **Method**: `GET`
*   **Authentication**: Required

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "60d07e600a4d1d2b78b0f8f1",
    "title": "Alpha Deployment Pipeline",
    "description": "Primary deployment flow for internal tracking and diagnostics.",
    "status": "pending",
    "owner": "60d07e600a4d1d2b78b0f8e9",
    "createdAt": "2026-06-28T09:21:38.000Z",
    "updatedAt": "2026-06-28T09:21:38.000Z"
  }
}
```

---

## Global Error Responses

Standard structured error payloads are returned for invalid operations.

### Error Schema
```json
{
  "success": false,
  "error": "Detailed error string description"
}
```

### HTTP Status Error Meanings
*   **400 Bad Request**: Input validation failed or required JSON properties are missing.
*   **401 Unauthorized**: Missing, structurally invalid, or expired authorization headers.
*   **403 Forbidden**: Token verified, but the requester lacks ownership permissions for the object.
*   **404 Not Found**: Endpoint route or MongoDB object ID does not exist.
*   **500 Internal Server Error**: An unhandled runtime error occurred on the application server.
