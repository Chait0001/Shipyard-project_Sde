# Contributing Guidelines

Thank you for contributing to **Shipyard**! Adhering to these guidelines ensures a clean, maintainable, and robust codebase for all team members.

---

## Branch Naming Convention

We use a structured branch naming convention to categorize contributions. Branch names must be lowercase and use hyphens as word separators.

| Branch Prefix | Purpose | Example |
| :--- | :--- | :--- |
| `feature/` | New functionality or enhancement | `feature/user-authentication` |
| `bugfix/` | Resolution of a known bug or issue | `bugfix/login-session-error` |
| `hotfix/` | Urgent production patch | `hotfix/session-vulnerability` |
| `docs/` | Documentation additions or updates | `docs/api-endpoints` |
| `refactor/` | Code structure improvements (no behavior changes) | `refactor/clean-database-routes` |
| `chore/` | Maintenance tasks, dependency updates, CI/CD tweaks | `chore/bump-dependencies` |

---

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This enforces a clear commit history and enables automated changelog generation.

### Commit Format
```text
<type>(<scope>): <description>
```

*   **Type**: Must be one of the following:
    *   `feat`: A new feature.
    *   `fix`: A bug fix.
    *   `docs`: Documentation changes.
    *   `style`: White-space, formatting, semicolons, etc. (no business logic changes).
    *   `refactor`: A code change that neither fixes a bug nor adds a feature.
    *   `perf`: A code change that improves execution performance.
    *   `test`: Adding missing tests or correcting existing tests.
    *   `chore`: Updates to build scripts, configurations, or auxiliary tools.
*   **Scope (Optional)**: A context indicating the affected part of the system (e.g., `auth`, `database`, `client`).
*   **Description**: A concise summary of the change, written in the imperative, present tense (e.g., "add registration validation" instead of "added registration validation").

### Examples
*   `feat(auth): implement JWT token generation`
*   `fix(client): resolve blank screen on dashboard load`
*   `docs(api): update user registration payload details`

---

## Pull Request Process

1.  **Branch Creation**: Create a branch off the latest state of the `main` branch.
2.  **Formatting and Tests**: Format your code (using standard ESLint/Prettier settings) and run all local tests.
3.  **Submit PR**: Open a Pull Request targeting the `main` branch.
4.  **PR Description**: Fill out the PR template completely:
    *   **Overview**: What changes were made and why.
    *   **Testing**: Details on how the changes were verified.
    *   **Visuals**: Include screenshots or screen recordings for frontend UI modifications.
    *   **Issue Reference**: Link any related issue or tracking ticket numbers.
5.  **Review Resolution**: Coordinate with the designated reviewer to address feedback.

---

## Code Review Process

*   **Approval Requirement**: All Pull Requests require at least **one approved review** from a Senior Engineer or maintainer before merging.
*   **Feedback Resolution**: Address all code review comments. Discussions or disagreements should be resolved constructively within the PR comments.
*   **Merging**: Once approval is granted and the CI pipeline passes, PRs should be merged using **Squash and Merge** to maintain a linear and clean git history on the `main` branch.

---

## Coding & Architectural Standards

### Clean Code Principles
*   Write clear, readable, and self-documenting code. Prefer code clarity over clever micro-optimizations.
*   Keep functions small and focused on a single responsibility (Single Responsibility Principle).
*   Use standard camelCase for variables/functions and PascalCase for React components/classes.

### React Standards
*   Use functional components and Hooks.
*   Separate state-management configurations from presentation layouts.
*   Wrap asynchronous network interactions in `try/catch` handlers.

### Styling Standards
*   Use Vanilla CSS or CSS Modules to prevent global selector pollution.
*   Implement responsive layouts using relative units (e.g., `rem`, `em`, `%`) and media queries.

---

## Workspace Directory Conventions

Organize new files in accordance with the following layouts:
*   [Client Components](./Client): Place reusable UI elements in `src/components/`, pages in `src/pages/`, and state providers in `src/context/`.
*   [Server Controllers](./Server): Define route logic in `src/controllers/`, database schemas in `src/models/`, and endpoints in `src/routes/`.

---

## Do's and Don'ts

### Do's
*   Write unit tests for utility functions and API route handlers.
*   Verify your code builds successfully locally before pushing.
*   Maintain the latest changes from `main` in your working branch.
*   Keep PR scope focused; smaller PRs are approved faster.

### Don'ts
*   **Do NOT** commit credentials, access keys, or `.env` files.
*   **Do NOT** force push (`git push -f`) directly to the `main` branch.
*   **Do NOT** bypass automated CI/CD pipeline checks.
*   **Do NOT** leave dead code, commented-out debugger statements, or unnecessary `console.log` statements in production files.
