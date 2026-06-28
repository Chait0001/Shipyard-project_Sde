# Shipyard

Shipyard is a high-performance web platform designed to streamline and automate deployment orchestration. Built with the MERN (MongoDB, Express, React, Node) stack, it provides engineering teams with a centralized console to manage build environments, configure environment variables, and monitor pipeline metrics in real-time.

---

## Key Features

*   **Centralized Orchestration Console**: Verify, manage, and monitor multi-tier builds from a single dashboard.
*   **Secure Credential Store**: Configure encryption keys and isolate sensitive environment variables.
*   **Role-Based Access Control (RBAC)**: Support secure multi-user environments with signed JSON Web Tokens (JWT).
*   **Real-Time Activity Logs**: View live terminal output and event streams for rapid troubleshooting.
*   **Scalable & Cloud-Ready**: Stateless API design optimized for containerized deployments (Docker, Kubernetes).

---

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Vanilla CSS | Interactive single-page application & scoped styling |
| **Backend** | Node.js, Express | RESTful API routing, controller logic, & middleware |
| **Database** | MongoDB, Mongoose | NoSQL document storage & Object Document Mapping (ODM) |
| **DevOps** | GitHub Actions | Automated continuous integration (CI) workflow |

---

## Directory Layout

A high-level view of the project structure:

```text
Shipyard-project_Sde/
├── Client/                      # React frontend codebase
├── Server/                      # Express backend codebase
├── docs/                        # Technical documentation
│   ├── API.md                   # REST API endpoints and schemas
│   ├── ARCHITECTURE.md          # Architecture overview and design patterns
│   └── SETUP.md                 # System requirements and installation instructions
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI pipeline
├── .gitignore                   # Version control exclusions
├── CONTRIBUTING.md              # Contribution standards and Git practices
├── LICENSE                      # MIT License file
└── README.md                    # Project landing page (this document)
```

For a detailed analysis of the directory structure and data flows, please refer to the [System Architecture Guide](docs/ARCHITECTURE.md).

---

## Quick Start

Detailed instructions for setup and troubleshooting can be found in the [Setup & Installation Guide](docs/SETUP.md).

### 1. Prerequisites
Ensure you have [Node.js (v18+)](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) running locally.

### 2. Dependency Installation
Run the following commands in the respective directories:
```bash
# Frontend
cd Client && npm install

# Backend
cd ../Server && npm install
```

### 3. Running Locally
Start the development servers:
```bash
# Frontend (typically runs on http://localhost:3000)
cd Client && npm start

# Backend (runs on http://localhost:5000)
cd Server && npm run dev
```

---

## Environment Configuration

Both the frontend and backend require environmental variables to be defined in `.env` files within their respective root directories. Refer to the [Setup Guide (Environment Variables)](docs/SETUP.md#environment-variables) for standard configuration examples.

---

## Contribution & Git Workflow

We welcome contributions to Shipyard! Please review our [Contributing Guidelines](CONTRIBUTING.md) for details on:
*   Branch naming conventions (`feature/*`, `bugfix/*`)
*   Conventional commit message formats (`feat(...)`, `fix(...)`)
*   Pull Request and code review processes
*   Coding standards

---

## Team

*   **Chaitanya Kumar** - *Lead DevOps Engineer & Full-Stack Developer* - [GitHub Profile](https://github.com/Chait0001)

---

## Future Roadmap

1.  **WebSocket Integration**: Enable real-time log streaming for active build sequences.
2.  **Containerization**: Implement Docker and Docker Compose configurations for containerized local setups.
3.  **Enhanced Security**: Add rate-limiting, double-submit cookie protection, and automated dependency scanning.
4.  **Continuous Deployment**: Establish automated CD pipelines targeting cloud environments.

---

## License

This project is licensed under the terms of the **MIT License**. For the full license text, see [LICENSE](LICENSE).
