# Shipyard UI & UX Guidelines

This document defines the behavioral and visual rules for building the Shipyard frontend. It ensures consistency across all contributions.

---

## 1. Consistency Rules

- **Don't reinvent components:** Always check `COMPONENTS.md` or the `components/ui` folder before creating a new button, card, or input.
- **Language:** Use British/International English for internal code naming (e.g., `Organisation` instead of `Organization`, `Colour` instead of `Color`), unless using external libraries that enforce US spelling. User-facing text should be consistent.
- **Destructive Actions:** Any action that deletes data (repositories, users, projects) MUST require a confirmation dialog with a red "Confirm" button.

---

## 2. Layout & Spacing (Padding/Margins)

- **Page Layout:** Pages should have `padding-8` (`p-8`) on desktop, and `padding-4` (`p-4`) on mobile.
- **Card Layout:** Cards should have internal `padding-6` (`p-6`). If the card has a header, the header is separated by a 1px border.
- **Forms:** Space between form fields should be `gap-4` or `mb-4`.
- **Flexbox/Grid:** Prefer CSS Grid for page layouts and Flexbox for component alignment. Use `gap` over explicit margins when using flex/grid.

---

## 3. Empty States & Loading States

### Empty States
Never show a blank white screen. If a list is empty, provide:
1. An icon representing the entity.
2. A clear message (e.g., "No projects found").
3. A Call to Action (CTA) button (e.g., "Create your first project").

### Loading States
- **Initial Page Load:** Use Skeleton screens that mimic the final layout. Avoid full-page spinners.
- **Button Actions:** When a user clicks a submit button, disable the button and show an inline spinner on the button itself.
- **Optimistic UI:** For common actions (e.g., moving a Kanban card, checking a checkbox), update the UI immediately without waiting for the server. Revert if the server request fails.

---

## 4. Accessibility (a11y)

- **Keyboard Navigation:** Every interactive element must be focusable via the `Tab` key.
- **Focus Rings:** Maintain visible focus rings (`focus:ring-2`) on all inputs and buttons. Do not remove them.
- **ARIA Labels:** Use `aria-label` for icon-only buttons (e.g., the Theme Toggle button).
- **Color Contrast:** Ensure text meets WCAG AA standards for contrast against its background in both light and dark modes.

---

## 5. Error Handling

- **Form Errors:** Display error messages inline, directly below the specific input field, in red (`text-red-500`).
- **Global Errors:** Use Toast notifications (bottom right) for background sync errors or API failures.
- **Crash States:** Implement a React Error Boundary at the layout level to catch unexpected crashes and display a "Something went wrong" fallback UI instead of a blank screen.
