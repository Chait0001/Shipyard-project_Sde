# Shipyard Design System

Shipyard utilizes a premium, high-density SaaS aesthetic inspired by tools like Linear and Vercel. The UI should feel fast, highly functional, and engineering-native.

---

## 1. Typography

**Font Family:** Inter (Primary for UI), JetBrains Mono (for Code/Monospace elements).

- **H1:** 24px, Semi-Bold, tracking-tight.
- **H2:** 20px, Medium.
- **H3:** 16px, Medium.
- **Body:** 14px, Regular (High density).
- **Small:** 12px, Regular (For metadata, timestamps).

---

## 2. Colors

A monochromatic foundation with subtle, deliberate accent colors.

### Light Mode
- **Background:** `#FFFFFF` (App), `#F9FAFB` (Subtle panels).
- **Foreground (Text):** `#111827` (Primary), `#4B5563` (Secondary).
- **Borders:** `#E5E7EB`.
- **Primary Action:** `#000000` (Solid black for high contrast).
- **Accents:** 
  - Success (Merged/Done): `#10B981`
  - Warning (In Progress): `#F59E0B`
  - Error (Blocked/Failed): `#EF4444`
  - Info (Draft/New): `#3B82F6`

### Dark Mode
- **Background:** `#09090B` (App), `#18181B` (Subtle panels).
- **Foreground (Text):** `#FAFAFA` (Primary), `#A1A1AA` (Secondary).
- **Borders:** `#27272A`.
- **Primary Action:** `#FFFFFF` (Solid white).

---

## 3. Spacing & Grid

We use an 4pt grid system.
- **Micro:** 4px (`gap-1`)
- **Small:** 8px (`gap-2`)
- **Medium:** 16px (`gap-4`) - Default padding for cards.
- **Large:** 24px (`gap-6`) - Section spacing.
- **X-Large:** 32px (`gap-8`) - Page margins.

---

## 4. Radius (Border Radius)

- **Buttons & Inputs:** `6px` (`rounded-md`) - Slightly crisp edges.
- **Cards & Dialogs:** `12px` (`rounded-xl`) - Smooth container edges.
- **Badges:** `9999px` (`rounded-full`) - Pill shape.

---

## 5. UI Elements

### Button Variants
- **Primary:** Solid background, inverted text. No borders.
- **Secondary:** Transparent background, subtle border, secondary text color.
- **Ghost:** No background, no border, hovers to subtle background.
- **Destructive:** Red background, white text.

### Card Styles
- Flat design. No heavy drop shadows by default.
- Use a 1px border (`border-border`) with a subtle background change on hover for interactive cards.
- Selected state uses an inner ring (`ring-2 ring-primary`).

### Forms
- Inputs have subtle borders and clear focus rings (`focus:ring-2 focus:ring-primary focus:ring-offset-background`).
- Labels are 14px, medium weight, slightly muted.

---

## 6. Animations

Keep animations fast and purposeful. Total duration should rarely exceed 150ms.
- **Hovers:** Color fade (Duration: `100ms`, Easing: `linear`).
- **Modals/Dialogs:** Quick fade and slide up (`ease-out`, `150ms`).
- **Dropdowns:** Scale in from origin point (`ease-out`, `100ms`).

---

## 7. Icons

**Library:** Lucide React.
- Default size: `16px` for inline, `20px` for standalone buttons.
- Stroke width: `2px`.

---

## 8. Responsive Breakpoints

- **sm:** `640px` (Mobile landscape)
- **md:** `768px` (Tablets - sidebar becomes drawer)
- **lg:** `1024px` (Small laptops - default desktop view)
- **xl:** `1280px` (Large displays - expand max-widths)
