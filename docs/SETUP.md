# Setup and Installation Guide

This guide describes the step-by-step instructions required to set up a local development environment for **Shipyard**.

---

## Prerequisites

Before setting up, ensure your development machine has the following tools installed:

1.  **Git**: For version control. ([Download Git](https://git-scm.com/))
2.  **Node.js**: Long-Term Support (LTS) version (v18.x or v20.x recommended). ([Download Node.js](https://nodejs.org/))
3.  **MongoDB Community Server**: Database engine (local service or remote Atlas connection string). ([Download MongoDB](https://www.mongodb.com/try/download/community))
4.  **Terminal & Node Package Manager (npm)**: Command line utility to run dependency installation commands.

---

## Installation Verification

Confirm that Node.js and npm are installed correctly:

```bash
node --version
npm --version
```

*Required: Node.js version `v18.0.0` or higher; npm version `9.0.0` or higher.*

---

## Initial Clone

Clone the repository to your local system and navigate to the project directory:

```bash
git clone https://github.com/Chait0001/Shipyard-project_Sde.git
cd Shipyard-project_Sde
```

---

## Environment Variables

Both the client and server components rely on environment configuration files (`.env`) to resolve network APIs and configuration variables.

### 1. Client Environment Configuration
Create a `.env` file in the root of the [Client](../Client) directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. Server Environment Configuration
Create a `.env` file in the root of the [Server](../Server) directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shipyard
JWT_SECRET=replace_with_a_secure_random_string_in_production
NODE_ENV=development
```

---

## Dependency Setup & Execution

### 1. Backend Server Setup
To configure the Express backend:
```bash
# Navigate to the Server directory
cd Server

# Install backend dependencies
npm install

# Run the development server
npm run dev
```
*The backend server will bootstrap and listen on the configured PORT (default `5000`).*

### 2. Frontend Client Setup
To configure the React frontend:
```bash
# Navigate to the Client directory from the project root
cd Client

# Install frontend dependencies
npm install

# Start the React development server
npm start
```
*The React application will compile and open in your default web browser at `http://localhost:3000`.*

---

## Common Errors & Troubleshooting

### MongoDB Connection Refused
*   **Symptom**: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`
*   **Cause**: The local MongoDB database daemon is inactive.
*   **Resolution**:
    *   **macOS (Homebrew)**: Start the service: `brew services start mongodb-community`
    *   **Windows**: Press `Win + R`, type `services.msc`, locate `MongoDB Server`, right-click and click **Start**.
    *   **Linux**: Run `sudo systemctl start mongod`.

### Port Collision
*   **Symptom**: `Error: listen EADDRINUSE: address already in use :::5000`
*   **Cause**: Another process is listening on the server's default port (`5000`).
*   **Resolution**: Free the port by terminating the blocking process:
    *   **macOS / Linux**:
        ```bash
        lsof -i :5000
        kill -9 <PID>
        ```
    *   **Windows (Command Prompt)**:
        ```cmd
        netstat -ano | findstr :5000
        taskkill /PID <PID> /F
        ```

### Package Cache Corruption
*   **Symptom**: Unresolved imports or install script failures.
*   **Resolution**: Clean the dependency workspace and re-run NPM package resolution:
    ```bash
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm install
    ```
