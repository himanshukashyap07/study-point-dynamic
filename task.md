# Execution Plan: Navigation Redesign & Video Reels
- [ ] **1. Schema & API Backend**
  - [ ] Create `lib/models/Reel.ts` with schema for `title`, `videoUrl` and `category` (Enum: `story`, `web-stories`).
  - [ ] Implement `app/api/admin/reels/route.ts` (GET, POST)
  - [ ] Implement `app/api/admin/reels/[id]/route.ts` (DELETE)
  - [ ] Implement `app/api/reels/route.ts` (GET)

- [ ] **2. Admin Dashboard Integration**
  - [ ] Update `app/admin/components/AdminSidebar.tsx` to add `__reels__` menu item below `Manage Navigation`.
  - [ ] Create `app/admin/components/ReelsManager.tsx` UI capable of taking manual video URLs and selecting between categories.
  - [ ] Update `app/admin/page.tsx` to register `__reels__` and render `ReelsManager.tsx`.

- [ ] **3. Navbar Redesign**
  - [ ] Update `app/components/Navbar.tsx` to break into three tiers:
    - Tier 1: Topbar (Privacy, Socials)
    - Tier 2: Middlebar (2 Images + Logo on the left)
    - Tier 3: Menu Nav (Main Links, Home, About, Login, Profile)
  - [ ] Add Vanilla CSS styles in `app/globals.css` for the updated tiered Navbar.

- [ ] **4. Public Pages & Video Grids**
  - [ ] Set up `app/story/page.tsx` fetching and showing `story` videos.
  - [ ] Set up `app/web-stories/page.tsx` fetching and showing `web-stories` videos.
  - [ ] Implement CSS Grid in `app/globals.css` enforcing 5-6 items wide on desktop down to 2 on mobile, framing vertical videos inside a 9:16 aspect ratio.
