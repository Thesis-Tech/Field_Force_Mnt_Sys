# Live Feed Feature

## Overview

The **Live Feed** feature provides a real-time CCTV-style monitoring view of all field employees — showing which employee is present where, at any given time.

---

## Navigation

- A **"Live Feed"** option will be added to the **sidebar**.
- On clicking it, a **new dedicated screen** opens.

---

## UI Layout

### Filters Bar (Top Section)

Four filter/control dropdowns will be displayed at the top of the screen:

| # | Filter | Description |
|---|--------|-------------|
| 1 | **Territory Filter** | Filter employees by assigned territory/zone |
| 2 | **Role Filter** | Filter by Employee or Manager |
| 3 | **Status/Other Filter** | Additional filter dropdown (e.g., active/inactive, department) |
| 4 | **Grid View Selector** | Dropdown to select number of grid boxes to display |

### Grid Display (Main Section)

- Employee location cards are displayed in a **responsive grid layout**.
- User can switch between the following grid views:

| Grid Option | Cards Displayed |
|-------------|-----------------|
| 4-grid      | 2 × 2           |
| 8-grid      | 2 × 4           |
| 12-grid     | 3 × 4           |
| 16-grid     | 4 × 4           |

Each card in the grid shows:
- **Mini map** (Mappls/map embed) with a **pointer/marker showing the employee's current location**
  - Marker displays the **employee's initials** (e.g., `AD` for Adi) instead of a generic pin
- Employee name
- Current location / territory
- Status (present/active)

### Past Feed / Audit Filter

- A dedicated filter option to **view past day(s) feed data** for any employee.
- Purpose: to detect and verify if an employee **faked their location or was inactive** during work hours.
- Behavior:
  - Admin selects a specific employee + date range
  - The card/map shows the **historical location trail** of that employee for the selected period
  - Location path is plotted on the map so movement (or lack of it) is clearly visible
  - Useful for **attendance fraud detection** — e.g., employee marked present but didn't move all day

### Fullscreen Mode

- A **Fullscreen button** will be available to expand the live feed to full screen — useful for monitoring dashboards and wall displays.

---

## Behavior

- The feed updates in **real-time** (or near real-time), similar to a CCTV monitor.
- Filters apply **instantly** without page reload.
- Grid layout adjusts responsively based on selected grid option.

---

## Component Breakdown (Frontend)

| Component | Description |
|-----------|-------------|
| `LiveFeedPage` | Main page/screen component |
| `FilterBar` | Top bar with all 4 filter dropdowns |
| `GridView` | Renders employee cards in selected grid layout |
| `EmployeeCard` | Individual card with mini map + employee info |
| `MapMarker` | Custom map marker showing employee initials |
| `PastFeedFilter` | Date/employee selector for historical location audit |
| `FullscreenToggle` | Button to enter/exit fullscreen mode |

---

## Notes

- This feature is **frontend-only scoped** — backend API for live location data will be integrated separately.
- Grid view preference can optionally be saved to local storage for persistence.
- Fullscreen mode should use the browser's native **Fullscreen API** (`element.requestFullscreen()`).
- Mini maps inside cards use **Mappls SDK** (already integrated in FFMS) — each card renders a small map instance.
- Custom initials marker can be created using Mappls's custom marker/icon support.
- Past feed data will require backend to store **location history logs** with timestamps per employee.