Users module — Figma design specs

Overview
- Purpose: Provide frames and component specs so designers can create a Figma file matching the existing app style.
- Structure: One Figma frame per page: Users List (Index), Register, Nurse Portal, Pharmacy Portal, Lab Portal, Admin Portal, Accountant Portal, Clinic Manager Portal, Reception Portal, Profile, Notes.

Global tokens
- Colors:
  - Primary: #2563EB (blue-600)
  - Primary-600 hover: #1D4ED8
  - Background: #F3F4F6 (gray-100)
  - Card background: #FFFFFF
  - Muted text: #6B7280 (gray-500)
  - Success: #16A34A
  - Danger: #DC2626

- Typography:
  - Heading: Inter / 20-32px bold
  - Body: Inter / 14px regular
  - Small: Inter / 12px

Layout & spacing
- Page container width: max 1200–1400px centered
- Sidebar width: 256px (match existing app)
- Header height: 64px
- Standard card radius: 12px
- Standard gap: 16px

Components (map to repo)
- Header — use Header component (Header frame)
- Sidebar — Sidebar component (navigation)
- Card — white background, 12px radius, 16px padding
- Form input — replicate Input component styling (label, required indicator, error state)
- Table — simple list rows with small headings and actions on right
- Buttons — Primary (blue 600), Secondary (outline gray)

Per-page frames
- Users Index
  - Table of users, search input at top, "Add user" button on top-right
  - KPI chips (total users, active, inactive)
- Register
  - Two-column form with inputs (first, last, email, role select), photo upload, footer actions (Cancel/Register)
- Role portals (Nurse, Pharmacy, Lab, Admin, Accountant, Clinic Manager, Reception)
  - Each frame is a simple portal home with title, short description and 2–3 quick action cards (e.g., "View queue", "Pending tasks")
- Profile
  - User avatar, personal details, role assignments, change password
- Notes
  - Timeline or list of notes with author, timestamp and content; add-note input at top

Delivery notes for designers
- Use the existing Tailwind palette above and mirror spacing from app components.
- Create components in Figma named: Header, Sidebar, Card, Form/Input, Button/Primary, Button/Secondary, Table/Row.
- Provide component variants for Input (default/error/disabled) and Button (default/hover/disabled).

Developer mapping
- Feed Figma component names back to dev: e.g., Input -> src/components/atoms/forms/Input.tsx, Card -> components/atoms/ui/Card.tsx, Header -> components/layouts/Header.tsx

Next steps (developer)
1. Designer creates Figma file following frames above.
2. Export assets and provide link or exported JSON for review.
3. Developer connects any custom icons or images referenced in Figma.

