# EVOX Design System

**Version:** 2.0
**Date:** 2026-02-06
**Architect:** MAX (Claude Opus 4.6)
**References:** Linear Design System, Vercel Geist Design System

---

## 1. Design Philosophy

Seven principles govern every pixel in EVOX.

**1. Mission Control, Not Control Panel** -- CEO sees system health in 3 seconds. Every screen answers one question instantly. If it takes reading, it is wrong.

**2. Speed Is a Feature** -- Sub-100ms perceived latency. Optimistic updates, skeleton states, prefetching. Nothing should feel like it is loading.

**3. Color for Meaning, Not Decoration** -- Neutral palette by default. Color appears only to encode status, urgency, or interactivity. If you remove the color and lose no information, the color should not be there.

**4. Restraint Over Flexibility** -- Fewer options, better defaults. One way to do each thing. Consistency across every screen without configuration.

**5. Keyboard-First** -- Every action reachable via keyboard. Mouse is supported, never required. Power users never lift their hands.

**6. Density Without Overwhelm** -- More data, less chrome. Compact layouts with generous whitespace between sections. Information-dense but never cluttered.

**7. No Purely Decorative Elements** -- Every border, shadow, and animation serves a functional purpose. If it does not aid comprehension or interaction, remove it.

---

## 2. Color System

### 2.1 Background Layers (Dark Mode)

Elevation is communicated through background lightness, not shadows.

| Token | Hex | Use |
|-------|-----|-----|
| `--bg-base` | `#0A0A0A` | Page background |
| `--bg-surface-1` | `#111111` | Cards, panels |
| `--bg-surface-2` | `#171717` | Active sidebar item, hover cards |
| `--bg-surface-3` | `#1A1A1A` | Dropdowns, popovers |
| `--bg-surface-4` | `#222222` | Modal background |

### 2.2 Text Colors

| Token | Hex | Contrast on base | Use |
|-------|-----|-------------------|-----|
| `--text-primary` | `#EDEDED` | 16.5:1 | Headings, primary content |
| `--text-secondary` | `#A1A1A1` | 8.3:1 | Body text, descriptions |
| `--text-tertiary` | `#666666` | 4.0:1 | Timestamps, captions (large text only) |

### 2.3 Border Colors

| Token | Hex | Use |
|-------|-----|-----|
| `--border-default` | `#222222` | Card borders, dividers |
| `--border-hover` | `#333333` | Hover state borders |
| `--border-focus` | `#0070F3` | Focus rings, active inputs |

### 2.4 Ten-Step Hue Scales (Geist Pattern)

Each hue provides 10 steps from subtle background to high-contrast foreground.

**Gray**

| Step | Hex | Use |
|------|-----|-----|
| gray-100 | `#111111` | Component bg |
| gray-200 | `#1A1A1A` | Hover bg |
| gray-300 | `#222222` | Active bg |
| gray-400 | `#2E2E2E` | Default border |
| gray-500 | `#3A3A3A` | Hover border |
| gray-600 | `#4A4A4A` | Active border |
| gray-700 | `#6B6B6B` | High-contrast bg |
| gray-800 | `#7A7A7A` | Hover high-contrast bg |
| gray-900 | `#A1A1A1` | Secondary text/icons |
| gray-1000 | `#EDEDED` | Primary text/icons |

**Blue (Accent)**

| Step | Hex |
|------|-----|
| blue-100 | `#0A1A2F` |
| blue-200 | `#0D2847` |
| blue-300 | `#10365F` |
| blue-400 | `#1A4B8A` |
| blue-500 | `#2563A8` |
| blue-600 | `#3178C6` |
| blue-700 | `#0070F3` |
| blue-800 | `#2E8AFF` |
| blue-900 | `#6DB3F8` |
| blue-1000 | `#B4D9FF` |

**Green (Success)**

| Step | Hex |
|------|-----|
| green-100 | `#0A1F15` |
| green-200 | `#0D2E1E` |
| green-300 | `#113D28` |
| green-400 | `#1A5C3A` |
| green-500 | `#22794B` |
| green-600 | `#2B965D` |
| green-700 | `#10B981` |
| green-800 | `#34D399` |
| green-900 | `#6EE7B7` |
| green-1000 | `#A7F3D0` |

**Red (Error)**

| Step | Hex |
|------|-----|
| red-100 | `#1F0A0A` |
| red-200 | `#2E0D0D` |
| red-300 | `#3D1111` |
| red-400 | `#5C1A1A` |
| red-500 | `#7F2222` |
| red-600 | `#A12B2B` |
| red-700 | `#EF4444` |
| red-800 | `#F87171` |
| red-900 | `#FCA5A5` |
| red-1000 | `#FEE2E2` |

**Amber (Warning)**

| Step | Hex |
|------|-----|
| amber-100 | `#1F1A0A` |
| amber-200 | `#2E260D` |
| amber-300 | `#3D3311` |
| amber-400 | `#5C4D1A` |
| amber-500 | `#7F6A22` |
| amber-600 | `#A1882B` |
| amber-700 | `#F59E0B` |
| amber-800 | `#FBBF24` |
| amber-900 | `#FCD34D` |
| amber-1000 | `#FEF3C7` |

**Purple (Highlight)**

| Step | Hex |
|------|-----|
| purple-100 | `#150A1F` |
| purple-200 | `#1E0D2E` |
| purple-300 | `#27113D` |
| purple-400 | `#3B1A5C` |
| purple-500 | `#4E227F` |
| purple-600 | `#622BA1` |
| purple-700 | `#8B5CF6` |
| purple-800 | `#A78BFA` |
| purple-900 | `#C4B5FD` |
| purple-1000 | `#EDE9FE` |

### 2.5 Semantic Status Mapping

| Semantic | Color Token | Hex | Use |
|----------|-------------|-----|-----|
| online / success | green-700 | `#10B981` | Agent online, task completed |
| error / offline | red-700 | `#EF4444` | Agent offline, build failed |
| warning | amber-700 | `#F59E0B` | SLA approaching, degraded |
| info / accent | blue-700 | `#0070F3` | Links, active states, focus |
| neutral | gray-700 | `#6B6B6B` | Disabled, archived |

### 2.6 Alpha Variants

For overlays and subtle borders, use alpha channels on white:

```css
--alpha-subtle:   rgba(255, 255, 255, 0.04);  /* overlay tint */
--alpha-border:   rgba(255, 255, 255, 0.08);  /* subtle border */
--alpha-hover:    rgba(255, 255, 255, 0.12);  /* hover overlay */
--alpha-backdrop: rgba(0, 0, 0, 0.60);        /* modal backdrop */
```

---

## 3. Typography

### 3.1 Font Stack

```css
--font-sans: 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace;
```

Load Geist via `next/font/local` or the `geist` npm package. Fallback to Inter for environments without Geist installed.

### 3.2 Semantic Type Scale

| Token | Size | Line Height | Weight | Use |
|-------|------|-------------|--------|-----|
| `heading-48` | 48px | 1.1 | 700 | Page title (Dashboard, Agents) |
| `heading-32` | 32px | 1.2 | 700 | Section header |
| `heading-24` | 24px | 1.3 | 600 | Card title, dialog title |
| `heading-20` | 20px | 1.3 | 600 | Sub-section, sidebar group |
| `label-14` | 14px | 1.4 | 500 | Form labels, column headers |
| `label-12` | 12px | 1.4 | 500 | Small labels, badge text |
| `copy-16` | 16px | 1.5 | 400 | Body text |
| `copy-14` | 14px | 1.5 | 400 | Secondary body, descriptions |
| `copy-13` | 13px | 1.5 | 400 | Compact body (tables, feeds) |
| `mono-14` | 14px | 1.5 | 400 | Code, data values, IDs |
| `mono-12` | 12px | 1.5 | 400 | Small code, timestamps |

### 3.3 Modifiers

| Modifier | CSS | When |
|----------|-----|------|
| Strong | `font-weight: 600` or `700` | Emphasis within body text |
| Subtle | `font-weight: 300` | De-emphasized text alongside bold values |
| CAPS | `text-transform: uppercase; letter-spacing: 0.05em` | Section labels, status badges |
| Tabular | `font-variant-numeric: tabular-nums` | Numbers in tables, metrics, counters |

---

## 4. Spacing System

Base unit: **4px**.

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `--space-1` | 4px | `p-1` | Tight: icon padding, inline gaps |
| `--space-2` | 8px | `p-2` | Compact: badge padding, small gaps |
| `--space-3` | 12px | `p-3` | Default: input padding |
| `--space-4` | 16px | `p-4` | Card padding, list item spacing |
| `--space-5` | 20px | `p-5` | Section gap within card |
| `--space-6` | 24px | `p-6` | Large card padding |
| `--space-8` | 32px | `p-8` | Section margin |
| `--space-10` | 40px | `p-10` | Page section gap |
| `--space-12` | 48px | `p-12` | Major section divider |
| `--space-16` | 64px | `p-16` | Page margin top |

Rule: Use `gap` for flex/grid children. Use `padding` for container internals. Use `margin` only for page-level section separation.

---

## 5. Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 6px | Badges, inputs, small buttons |
| `--radius-md` | 8px | Cards, panels, dropdowns |
| `--radius-lg` | 12px | Modals, dialogs, large panels |
| `--radius-full` | 9999px | Pills, avatars, status dots |

Rule: Never use `border-radius` values outside this scale. Consistency matters more than pixel-perfection per component.

---

## 6. Shadows and Elevation

Dark mode uses background layering, not box-shadows. Reserve shadows for floating elements only.

| Level | Implementation | Use |
|-------|----------------|-----|
| elevation-1 | `bg-surface-1` + `1px border-default` | Cards, list items |
| elevation-2 | `bg-surface-2` + `1px border-default` | Active panels, selected items |
| elevation-3 | `bg-surface-3` + `1px border-default` + subtle shadow | Dropdowns, popovers |
| overlay | `backdrop-filter: blur(8px)` + `--alpha-backdrop` | Modal backdrop |

The one shadow we use:

```css
--shadow-float: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-default);
```

Applied only to dropdowns, command palette, and tooltips.

---

## 7. Layout System

### 7.1 Container

```css
--container-max: 1280px;
--sidebar-expanded: 240px;
--sidebar-collapsed: 48px;
```

### 7.2 Page Structure

```
+--sidebar--+----main-content-area---+
|            |                        |
| 240px      |  max-width: 1280px     |
| (or 48px)  |  padding: 24px         |
|            |                        |
+------------+------------------------+
```

Main content fills available width with `flex: 1` and centers content with `max-width` + `margin: 0 auto`.

### 7.3 Grid

Use CSS Grid with 12 columns for desktop layouts:

```css
.grid-page {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
```

Common column spans: 3 (metric card), 4 (agent card), 6 (half), 12 (full).

### 7.4 Breakpoints

| Token | Width | Layout |
|-------|-------|--------|
| `sm` | 640px | Single column, bottom nav |
| `md` | 768px | Two columns, sidebar collapses |
| `lg` | 1024px | Full sidebar, 3-column grid |
| `xl` | 1280px | Max-width container reached |

---

## 8. Navigation

### 8.1 Sidebar (Primary Nav)

Collapsible sidebar on the left. Keyboard shortcut: `[` to toggle.

**Sections:**
- Overview (Dashboard)
- Messages
- Agents
- Tasks
- Loop
- Settings

**States:**
- Default: `copy-14`, `text-secondary`, no background
- Hover: `bg-surface-1`
- Active: `bg-surface-2` + 2px left border in `blue-700` + `text-primary`
- Collapsed: Icons only, 48px wide, tooltip on hover

**Anatomy:**
```
+-----------------------------------------+
| [Logo]  EVOX                     [ < ]  |
+-----------------------------------------+
|                                         |
|   [icon] Overview                       |
|   [icon] Messages              (3)      |  <-- unread badge
|   [icon] Agents                         |
|   [icon] Tasks                          |
|   [icon] Loop                           |
|                                         |
+-----------------------------------------+
|   [icon] Settings                       |
+-----------------------------------------+
```

### 8.2 Command Palette (Cmd+K)

Global fuzzy search overlay. Centered modal with backdrop blur.

**Sections:**
1. Recent actions (last 5)
2. Navigation (pages)
3. Agents (jump to agent profile)
4. Actions (new message, create task)

**Keyboard:** Arrow keys to navigate, Enter to select, Esc to close. Type to filter.

**Anatomy:**
```
+--------------------------------------+
| [search icon] Search or jump to...   |
+--------------------------------------+
| RECENT                               |
|   Dashboard                    G D   |
|   Messages                     G M   |
|--------------------------------------+
| AGENTS                               |
|   SAM                                |
|   LEO                                |
+--------------------------------------+
```

### 8.3 Tabs (Page-Level)

Underline style following Vercel convention.

- Active: `text-primary` + 2px bottom border in `blue-700`
- Inactive: `text-tertiary`, no border
- Hover (inactive): `text-secondary`
- Keyboard: Left/Right arrows to switch tabs

---

## 9. Component Specifications

### 9.1 Metric Card

**Purpose:** Display a single KPI with trend.

**Anatomy:**
```
+---------------------------+
|  LABEL              14px  |  label-12, CAPS, text-secondary
|                           |
|  42                 48px  |  heading-48, tabular-nums
|  tasks/day          16px  |  copy-14, text-secondary
|                           |
|  +12% vs last week  14px  |  copy-14, green/red by direction
+---------------------------+
```

**Tailwind:**
```
bg-surface-1 border border-default rounded-md p-6
hover:bg-surface-2 transition-colors duration-150
```

**States:**
- Default: surface-1 background
- Hover: surface-2 background
- Loading: skeleton shimmer replacing value and trend
- Error: "--" as value, text-tertiary

---

### 9.2 Agent Card

**Purpose:** Show agent identity, status, and current task at a glance.

**Anatomy:**
```
+---------------------------+
|  [*] SAM          online  |  status dot (8px) + heading-20 + label-12 badge
|  Backend Agent            |  copy-13, text-secondary
|                           |
|  Working on AGT-345       |  copy-14, text-secondary, link in blue-700
|  3h 12m active            |  mono-12, text-tertiary
+---------------------------+
```

**Status dot colors:**
- online: green-700, with pulse animation
- offline: red-700, static
- idle: amber-700, static

**Tailwind:**
```
bg-surface-1 border border-default rounded-md p-4
hover:bg-surface-2 hover:-translate-y-0.5 transition-all duration-200
cursor-pointer
```

**States:**
- Default, Hover (lift + surface-2), Selected (border-focus), Loading (skeleton)

---

### 9.3 Message Card

**Purpose:** Message preview in a list with read/unread distinction.

**Anatomy:**
```
+--------------------------------------+
|  MAX -> EVOX                  5:48PM |  label-14 bold + mono-12
|  AGT-332 implementation started.     |  copy-14, text-secondary, truncated
+--------------------------------------+
```

**Unread:** Left border 2px in blue-700, slightly brighter background (alpha-subtle overlay).

**Tailwind:**
```
bg-surface-1 border border-default rounded-md p-3
hover:bg-surface-2 cursor-pointer transition-colors duration-150
```

---

### 9.4 Activity Feed Item

**Purpose:** Single entry in the activity timeline.

**Anatomy:**
```
18:02   SAM committed to AGT-345          copy-13
        "Fix message routing for Loop"     copy-13, text-secondary
```

Left column: timestamp in mono-12, text-tertiary, fixed 60px width.
Right column: agent name bold, action description, optional detail line.

Separator: 1px border-default between items, or use gap with no borders for cleaner look.

---

### 9.5 Status Badge

**Purpose:** Compact status indicator. Dot + text, or text-only in colored pill.

**Variant A -- Dot + Text:**
```
[*] Online    <- 6px dot + label-12
```

**Variant B -- Pill:**
```
[ Online ]    <- label-12, CAPS, rounded-full, colored bg at step-100, colored text at step-900
```

Color mapping uses the semantic status colors from section 2.5.

---

### 9.6 Data Table

**Purpose:** Sortable, filterable tabular data.

**Structure:**
```
+------+--------+--------+--------+
| Name | Status | Tasks  | Last   |  <- label-12, CAPS, text-tertiary, sticky header
+------+--------+--------+--------+
| SAM  | Online |   12   | 2m ago |  <- copy-13, alternating bg-surface-1 / bg-base
| LEO  | Online |    8   | 5m ago |
| QUINN| Idle   |    3   | 1h ago |
+------+--------+--------+--------+
```

**Features:**
- Sortable columns: click header to sort, arrow indicator for direction
- Row hover: bg-surface-2
- Selected row: bg-blue-100 + border-left blue-700
- Numbers use `tabular-nums` for alignment
- Pagination or infinite scroll, never both

**Tailwind:**
```
Table: w-full border-collapse
Header: bg-surface-1 border-b border-default px-4 py-2 text-left
Cell: px-4 py-3 border-b border-default
Row hover: hover:bg-surface-2 transition-colors
```

---

### 9.7 Empty State

**Purpose:** Guide user when a section has no data.

**Anatomy:**
```
+---------------------------+
|                           |
|      [icon / illo]        |  24px icon, text-tertiary
|                           |
|   No messages yet         |  heading-20
|   Send your first message |  copy-14, text-secondary
|   to get started.         |
|                           |
|   [ Send Message ]        |  Primary button
|                           |
+---------------------------+
```

Centered, max-width 320px, generous vertical padding (space-16 top and bottom).

---

### 9.8 Toast Notification

**Purpose:** Ephemeral feedback for actions.

**Position:** Top-right on desktop, top-center on mobile.
**Duration:** 5 seconds auto-dismiss. Error toasts require manual dismiss.
**Stack:** Maximum 3 visible, newest on top.

**Anatomy:**
```
+-----------------------------------+
| [icon]  Message sent to SAM   [x] |  copy-14 + dismiss button
+-----------------------------------+
```

**Type colors:**
- Info: blue-700 left border
- Success: green-700 left border
- Warning: amber-700 left border
- Error: red-700 left border

**Background:** surface-3 with shadow-float. 3px left border in type color.

**Animation:** Slide in from right, 300ms ease-out. Fade out on dismiss.

---

### 9.9 Modal / Dialog

**Purpose:** Focused interaction requiring user attention.

**Anatomy:**
```
+---------- backdrop blur ----------+
|                                   |
|   +---------------------------+   |
|   | Dialog Title          [x] |   |  heading-20
|   +---------------------------+   |
|   |                           |   |
|   | Content area              |   |  copy-14
|   |                           |   |
|   +---------------------------+   |
|   | [Cancel]      [Confirm]   |   |  ghost + primary buttons
|   +---------------------------+   |
|                                   |
+-----------------------------------+
```

**Specs:**
- Max-width: 480px (small), 640px (medium), 800px (large)
- Background: surface-3
- Border: 1px border-default
- Radius: radius-lg (12px)
- Backdrop: alpha-backdrop + backdrop-filter blur(8px)
- Animation: fade in + scale from 0.95, 200ms ease-out
- Close: Esc key, click backdrop, or X button

---

### 9.10 Input / Form

**Purpose:** Low-profile inputs that blend with dark surfaces.

**Anatomy:**
```
Label                          <- label-14, text-secondary
+---------------------------+
| Placeholder text          |  <- copy-14, bg-surface-1
+---------------------------+
Helper or error text           <- copy-13, text-tertiary or red-700
```

**States:**
- Default: bg-surface-1, border-default, text-primary
- Hover: border-hover
- Focus: border-focus (blue-700), subtle blue-100 glow via box-shadow
- Error: border red-700, error text below
- Disabled: opacity 0.5, cursor not-allowed

**Tailwind:**
```
bg-surface-1 border border-default rounded-sm px-3 py-2
text-primary placeholder:text-tertiary
hover:border-hover focus:border-focus focus:ring-1 focus:ring-blue-700
transition-colors duration-150
```

---

### 9.11 Button

Four variants, each with clear hierarchy.

| Variant | Background | Text | Border | Use |
|---------|------------|------|--------|-----|
| Primary | blue-700 | white | none | Primary action (Send, Create) |
| Secondary | surface-2 | text-primary | border-default | Secondary action (Cancel, Back) |
| Ghost | transparent | text-secondary | none | Tertiary action, toolbar |
| Danger | red-700 | white | none | Destructive (Delete, Remove) |

**Shared specs:**
- Height: 36px (default), 32px (small), 40px (large)
- Padding: 0 16px (default), 0 12px (small), 0 20px (large)
- Radius: radius-sm (6px)
- Font: label-14, weight 500
- Hover: darken 10% or lighten bg
- Active: darken 15%
- Disabled: opacity 0.5, pointer-events none
- Loading: spinner replaces text, same dimensions

---

### 9.12 Skeleton Loader

**Purpose:** Placeholder while content loads. Maintains layout dimensions.

**Implementation:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-surface-1) 0%,
    var(--bg-surface-2) 50%,
    var(--bg-surface-1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Rules:**
- Match the exact dimensions of the content being loaded
- Use rounded rectangles for text lines, circles for avatars
- Group skeletons to match component anatomy
- No skeleton should last more than 3 seconds -- if it does, the query is too slow

---

## 10. Animation and Motion

### 10.1 Duration Tiers

| Tier | Duration | Easing | Use |
|------|----------|--------|-----|
| Micro | 150ms | ease-out | Hover, focus, toggle, color change |
| Standard | 200ms | ease-in-out | Expand, collapse, slide, tab switch |
| Emphasis | 300ms | ease-out | Modal open, panel slide, toast appear |

### 10.2 Specific Animations

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Card hover | `translateY(-2px)` | 200ms | ease-out |
| Status dot (online) | pulse (scale 1 to 1.5 opacity 0.4 to 0) | 2s infinite | ease-in-out |
| Skeleton shimmer | background-position slide | 2s infinite | linear |
| Toast enter | `translateX(100%) to translateX(0)` | 300ms | ease-out |
| Toast exit | `opacity 1 to 0` | 150ms | ease-in |
| Modal enter | `opacity 0 + scale(0.95)` to `opacity 1 + scale(1)` | 200ms | ease-out |
| Modal exit | `opacity 1 to 0` | 150ms | ease-in |
| Sidebar toggle | width transition | 200ms | ease-in-out |
| Tab underline | left + width transition | 200ms | ease-in-out |

### 10.3 Rules

- No motion in data-dense areas (tables, feeds) unless it communicates state change.
- Respect `prefers-reduced-motion`: disable all animations except opacity fades.
- Never animate layout properties (width, height) on elements with children -- use transform instead.
- Loading spinners use 16px diameter, 2px stroke, blue-700 color.

---

## 11. Keyboard Shortcuts

### 11.1 Navigation (G + Key)

| Shortcut | Action |
|----------|--------|
| `G` then `D` | Go to Dashboard |
| `G` then `M` | Go to Messages |
| `G` then `A` | Go to Agents |
| `G` then `T` | Go to Tasks |
| `G` then `L` | Go to Loop |
| `G` then `S` | Go to Settings |

### 11.2 Actions

| Shortcut | Action |
|----------|--------|
| `N` | New message |
| `/` | Focus search |
| `?` | Show shortcut reference |
| `Esc` | Close modal / deselect / go back |
| `Cmd+K` | Open command palette |
| `[` | Toggle sidebar |

### 11.3 List Navigation

| Shortcut | Action |
|----------|--------|
| `J` | Move down |
| `K` | Move up |
| `X` | Toggle select current item |
| `Shift+Down` | Extend selection down |
| `Shift+Up` | Extend selection up |
| `Enter` | Open selected item |
| `Backspace` | Go back to list from detail |

### 11.4 Implementation Notes

- Use a two-key sequence system for navigation (G is the leader key, with 500ms timeout).
- Shortcuts should not fire when an input or textarea is focused (except Esc and Cmd+K).
- Show shortcut hints in tooltips and in the command palette results.

---

## 12. Dark Mode Implementation

### 12.1 Architecture

CSS custom properties are the single source of truth. Define all colors as custom properties on `:root` (dark) and `.light` (light mode override).

```css
:root {
  color-scheme: dark;
  --bg-base: #0A0A0A;
  --bg-surface-1: #111111;
  --bg-surface-2: #171717;
  --bg-surface-3: #1A1A1A;
  --bg-surface-4: #222222;
  --text-primary: #EDEDED;
  --text-secondary: #A1A1A1;
  --text-tertiary: #666666;
  --border-default: #222222;
  --border-hover: #333333;
  --border-focus: #0070F3;
  /* ...all other tokens */
}
```

### 12.2 User Preference

1. Check `localStorage` for explicit user choice.
2. Fall back to `prefers-color-scheme` media query.
3. Default to dark if neither is set.

Toggle applies a class on `<html>`: `class="dark"` or `class="light"`.

### 12.3 Rules

- Never invert colors programmatically. Each mode is designed independently.
- Elevation layering: each surface step is 1-3% lighter than the previous in dark mode.
- Images and icons: use SVGs with `currentColor` so they adapt automatically.
- Test all components in both modes before shipping (even though dark is primary).

---

## 13. Accessibility (WCAG 2.1 AA)

### 13.1 Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Normal text (< 24px) | 4.5:1 |
| Large text (>= 24px or >= 18.66px bold) | 3:1 |
| Interactive components (borders, focus rings) | 3:1 |
| Non-text content (icons, charts) | 3:1 |

All token pairs in this system meet these thresholds. Verify with contrast checker when combining non-standard pairs.

### 13.2 Focus Management

- Every interactive element must have a visible focus indicator.
- Focus ring: 2px solid blue-700, 2px offset.
- Focus should be trapped inside modals and dialogs.
- On modal close, return focus to the trigger element.

### 13.3 Touch Targets

Minimum interactive area: 44x44px. For dense layouts (tables), use 32px minimum height with 44px minimum click area via padding.

### 13.4 Semantic HTML

- Use `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>` landmarks.
- Use `<h1>` through `<h4>` in logical order (never skip levels).
- Use `<button>` for actions, `<a>` for navigation. Never use `<div onClick>`.
- Tables use `<th scope="col">` for column headers.

### 13.5 ARIA

- Status indicators: `aria-label="Agent SAM is online"`
- Live regions: `aria-live="polite"` for toast notifications
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Loading states: `aria-busy="true"` on the loading container

### 13.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 14. Implementation Guide

### 14.1 Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS 3.4+ |
| Components | shadcn/ui (Radix primitives) |
| Font | Geist Sans + Geist Mono via `geist` package |
| Animation | CSS transitions (prefer) or Framer Motion (complex sequences) |
| Icons | Lucide React |

### 14.2 File Structure

```
components/
  ui/                    # shadcn/ui base components (Button, Input, Dialog, etc.)
  metrics/
    MetricCard.tsx
    MetricGrid.tsx
  agents/
    AgentCard.tsx
    AgentGrid.tsx
    AgentStatusDot.tsx
  feed/
    ActivityFeed.tsx
    FeedItem.tsx
  messages/
    MessageCard.tsx
    MessageList.tsx
    MessageThread.tsx
  navigation/
    Sidebar.tsx
    CommandPalette.tsx
    TabNav.tsx
  shared/
    StatusBadge.tsx
    EmptyState.tsx
    SkeletonLoader.tsx
    Toast.tsx

lib/
  design-tokens.ts       # Exported token constants for JS usage
  cn.ts                  # clsx + tailwind-merge utility
```

### 14.3 Tailwind Config Extensions

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        base: "var(--bg-base)",
        "surface-1": "var(--bg-surface-1)",
        "surface-2": "var(--bg-surface-2)",
        "surface-3": "var(--bg-surface-3)",
        "surface-4": "var(--bg-surface-4)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "border-default": "var(--border-default)",
        "border-hover": "var(--border-hover)",
        "border-focus": "var(--border-focus)",
        accent: {
          DEFAULT: "#0070F3",
          hover: "#2E8AFF",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#0A1F15",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#1F0A0A",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#1F1A0A",
        },
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        full: "9999px",
      },
      fontSize: {
        "heading-48": ["48px", { lineHeight: "1.1", fontWeight: "700" }],
        "heading-32": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "heading-24": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "heading-20": ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        "label-14": ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        "label-12": ["12px", { lineHeight: "1.4", fontWeight: "500" }],
        "copy-16": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "copy-14": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "copy-13": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "mono-14": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "mono-12": ["12px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "pulse-dot": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.4" },
          "50%": { transform: "scale(1.5)", opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        "pulse-dot": "pulse-dot 2s infinite ease-in-out",
        "slide-in-right": "slide-in-right 300ms ease-out",
        "fade-scale-in": "fade-scale-in 200ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 14.4 Design Tokens in JS

```typescript
// lib/design-tokens.ts
export const STATUS_COLORS = {
  online: { dot: "#10B981", bg: "#0A1F15", text: "#6EE7B7" },
  offline: { dot: "#EF4444", bg: "#1F0A0A", text: "#FCA5A5" },
  idle: { dot: "#F59E0B", bg: "#1F1A0A", text: "#FCD34D" },
  disabled: { dot: "#6B6B6B", bg: "#111111", text: "#A1A1A1" },
} as const;

export const ELEVATION = {
  1: "bg-surface-1 border border-border-default",
  2: "bg-surface-2 border border-border-default",
  3: "bg-surface-3 border border-border-default shadow-float",
} as const;

export type StatusType = keyof typeof STATUS_COLORS;
```

---

## 15. Migration from V1

### 15.1 Breaking Changes

| Area | V1 | V2 | Action |
|------|----|----|--------|
| Font | System fonts only | Geist Sans / Geist Mono | Install `geist` package, update font-family |
| Base unit | 8px | 4px | Audit all spacing, half values where 8px was too large |
| Radius | 16px cards, 12px other | 8px cards, 6px inputs, 12px modals | Replace all border-radius values |
| Color tokens | `--bg-secondary`, `--bg-tertiary` | `--bg-surface-1` through `--bg-surface-4` | Find-replace all CSS variable references |
| Text tokens | `--text-primary: #e5e5e5` | `--text-primary: #EDEDED` | Slight brightness increase, update token |
| Accent | `--accent-primary: #3b82f6` | `--accent: #0070F3` (Vercel blue) | Update all accent references |
| Shadows | 4-tier shadow system | Minimal (elevation via bg) | Remove most box-shadows, use bg layering |
| Emoji | Used in section headers | Not used anywhere | Remove all emoji from UI and docs |

### 15.2 Migration Checklist

1. Install Geist font package and configure in `next/font`.
2. Update `tailwind.config.ts` with new tokens from section 14.3.
3. Create CSS custom properties block in `globals.css` per section 12.1.
4. Find-replace old color tokens (`--bg-secondary` to `--bg-surface-1`, etc).
5. Audit all `border-radius` values against new scale.
6. Audit all spacing values; convert 8px-based to 4px-based where appropriate.
7. Replace emoji icons with Lucide icons in all components.
8. Remove decorative box-shadows; use bg elevation pattern.
9. Verify WCAG contrast for all text-on-background combinations.
10. Test keyboard navigation on every page.
11. Run `npx next build` to verify no broken references.

---

**Status:** READY FOR IMPLEMENTATION
**Architect:** MAX (Claude Opus 4.6)
**For:** LEO (Frontend Agent) -- this is your canonical reference for all UI decisions.
