```markdown
# 📋 FFMS Dashboard & Admin — Full Feature Update Prompt

> **Project:** FFMS_FRONTEND_ADIT (Admin/Manager Web Dashboard)
> **Scope:** Frontend only — `FFMS_FRONTEND_ADIT/frontend/` folder.
>
> **STRICT RULES — READ BEFORE STARTING:**
> - ✅ You may ONLY edit files inside `FFMS_FRONTEND_ADIT/frontend/`
> - ❌ DO NOT touch any backend file — `FFMS_NANDINI/` is READ ONLY
> - ❌ DO NOT touch `ffms_mobile/` — mobile app is READ ONLY
> - ❌ DO NOT hardcode any values — use constants, config, or API responses
> - ❌ DO NOT create backend routes, controllers, models, or schema changes
> - ✅ If a backend API is missing — show a placeholder UI with comment:
>   `// TODO: Backend API needed — endpoint not yet available`
> - ✅ Read backend routes first (read-only) before calling any API
> - ✅ Add clear comments to every component, function, and logic block
> - ✅ Use existing API base URL and auth token patterns already in the project
> - ✅ If unsure about any backend endpoint — ask, do not guess
> - ✅ Work on ONE task at a time. Stop after each task and wait for approval.

---

## 🔄 WORKFLOW FOR EVERY TASK

```
Inspect → Analyze → Implement → Verify → Report → Stop
```

Every response must follow this output format:

```
## ROOT CAUSE / GOAL
## IMPACT ANALYSIS
## FILES CHANGED
## CHANGES IMPLEMENTED
## WHY IT WORKS
## EDGE CASES TESTED
## RISKS
## ROLLBACK PLAN
## VERIFICATION STEPS
## STATUS
```

---

## 📋 TASK LIST

---

## 📺 Task 1 — Live Feed Feature (Fix + Complete Implementation)

**Context:** Live Feed section exists in the dashboard sidebar but is not working properly.
Read `live-feed-feature.md` for full design spec before starting.

### 1a — Scan First (Do not edit yet)
* [x] Locate the existing `LiveFeed` component or page in `FFMS_FRONTEND_ADIT/frontend/`
* [x] Check what is currently broken — list all errors or missing pieces
* [x] Read backend (read-only) — search for any live location API endpoint
  * Look for: `GET /api/v1/location/live` or similar
  * Check what data it returns (employee ID, coordinates, last seen time)
* [x] Check if Mappls SDK is already imported and configured in the project
* [x] Report all findings — wait for approval before writing any code

### 1b — Filter Bar (Top Section)
* [x] Build a `FilterBar` component with four dropdowns:
  * [x] **Territory Filter** — filter employees by territory/zone (fetch from API)
  * [x] **Role Filter** — options: `All`, `Employee`, `Manager`
  * [x] **Status Filter** — options: `All`, `Active`, `Inactive`
  * [x] **Grid View Selector** — options: `4-grid`, `8-grid`, `12-grid`, `16-grid`
* [x] Filters apply instantly — no page reload or submit button
* [x] Save selected grid size preference to localStorage
* [x] Add comment: `// Filters are applied client-side on fetched employee data`

### 1c — Grid Layout
* [x] Build a `GridView` component that renders employee cards in selected layout:

| Grid Option | Columns × Rows |
|---|---|
| 4-grid | 2 × 2 |
| 8-grid | 2 × 4 |
| 12-grid | 3 × 4 |
| 16-grid | 4 × 4 |

* [x] Grid layout must be responsive — no overflow or broken layout at any grid size
* [x] When filter changes — grid re-renders instantly with filtered employees

### 1d — Employee Card (Per Grid Cell)
Each card has two panels side by side:

**Left Panel:**
* [x] Circular profile photo — fetch from employee data
* [x] If no photo — show initials (e.g. `NK`) in a colored circle
  * Color must be consistent per employee (use name-based color hash)
* [x] Employee name below avatar

**Right Panel — Top (Mini Map):**
* [x] Render a Mappls SDK mini map inside each card
* [x] Show employee's last known GPS location as a marker
* [x] Marker must show employee initials as custom icon (use Mappls custom marker)
* [x] If no location data — show grey placeholder with text `"Location unavailable"`
* [x] Add comment: `// Mini map uses Mappls SDK — one instance per card`

**Right Panel — Bottom (Info Strip):**
* [x] `In Time` — show today's punch-in time (e.g. `09:00 AM`) or `--`
* [x] `Out Time` — show today's punch-out time or `--` if still active
* [x] `Tasks Today` — show format `completed/total` (e.g. `2/5`)
* [x] All data fetched from existing attendance and task APIs

### 1e — Real-Time Updates
* [x] Poll the live location API every **30 seconds** to refresh employee locations
* [x] Update only the map marker position — do not re-render the full card
* [x] Show a small indicator: `🟢 Live` when data is fresh (within last 2 minutes)
* [x] Show `🔴 Offline` when last update is older than 5 minutes
* [x] Add comment: `// Polling every 30s — replace with WebSocket when backend supports it`

### 1f — Past Feed / Audit Filter
* [x] Add a `Past Feed` toggle button at the top of the live feed page
* [x] When toggled ON — show additional inputs:
  * [x] Employee selector dropdown (all employees list)
  * [x] Date range picker (start date — end date)
  * [x] `View History` button
* [x] On click View History:
  * [x] Fetch location history for selected employee + date range
  * [x] Plot the movement path as a **polyline** on the Mappls map
  * [x] Show timestamp dots at each recorded GPS point
  * [x] If employee did not move — show alert: `"No movement detected — possible fraud"`
* [x] Add comment: `// Past feed uses GET /api/v1/location/:userId/history — ADMIN/MANAGER only`

### 1g — Fullscreen Mode
* [x] Add a fullscreen toggle button (top right of live feed page)
* [x] Use browser native Fullscreen API: `element.requestFullscreen()`
* [x] On fullscreen — hide sidebar and top nav, show only the grid
* [x] Add Escape key listener to exit fullscreen
* [x] Add comment: `// Uses browser native Fullscreen API`

---

## 🗺️ Task 2 — Geofence — Per Employee Setting (Not Global)

**Context:** Geofence is currently blocking all punch-ins if employee is outside perimeter.
Fix: Geofence must only apply to employees where manager has explicitly enabled it.

### 2a — Scan First
* [x] Find existing geofence logic in frontend and read backend geofence routes (read-only)
* [x] Check if there is a per-employee geofence flag in backend schema
* [x] Search schema.prisma for `geofence` or `geofenceEnabled` field on User model
* [x] Report findings — wait for approval

### 2b — Per Employee Geofence Toggle
* [x] In the **Team / Employee Edit screen** — add a toggle:
  * [x] Label: `Enable Geofence for this Employee`
  * [x] Default: **OFF**
* [x] When ON: allow manager to set geofence center and radius for that employee
* [x] When OFF: employee can punch in from anywhere — no perimeter check
* [x] Save setting via API (find correct endpoint — read backend first)
* [x] Add comment: `// Geofence is per-employee — not a global setting`

### 2c — Geofence Display on Map
* [x] When geofence is enabled for an employee — show the geofence circle on their map card in Live Feed
* [x] Circle color: green if inside, red if outside
* [x] Add comment: `// Geofence circle only shown for employees with geofence enabled`

---

## 💰 Task 3 — Salary Slip Configuration (Expense + Travel Included)

**Context:** Salary slip should include expense claims and travel allowance data sent from mobile app.

### 3a — Scan First
* [x] Find salary slip component or page in frontend
* [x] Read backend salary/payroll endpoints (read-only)
* [x] Check if expense and travel data are already linked to salary in backend
* [x] Report findings — wait for approval

### 3b — Salary Slip Builder
* [x] In salary slip view — add configurable sections:
  * [x] Basic Salary (always shown)
  * [x] Travel Allowance (from TravelLog — distance × rate)
  * [x] Expense Reimbursements (from approved Expense claims)
  * [x] Advance Deductions (if advance was taken — deduct from salary)
  * [x] Total Net Payable = Basic + Travel + Expenses − Advances
* [x] Each section must be toggleable by admin (show/hide per slip)
* [x] Add comment: `// Salary slip pulls from attendance, travel, expense, and advance APIs`

---

## ⏰ Task 4 — Admin Settings — Shift Timing Configuration

**Context:** Admin settings has timing options but shift is not showing in team edit.
Fix: General 1, General 2, A, B, C shifts must be configurable and selectable per employee.

### 4a — Scan First
* [x] Find admin settings timing page in frontend
* [x] Find team edit screen in frontend
* [x] Read backend (read-only) — search for shift or timing model in schema.prisma
* [x] Report findings — wait for approval

### 4b — Shift Configuration in Admin Settings
* [x] In Admin Settings → Timing section — allow creating/editing these shifts:

| Shift | Default Timing |
|---|---|
| General 1 | 09:00 AM — 06:00 PM |
| General 2 | 10:00 AM — 07:00 PM |
| A | 06:00 AM — 02:00 PM |
| B | 02:00 PM — 10:00 PM |
| C | 10:00 PM — 06:00 AM |

* [x] Each shift must have: Name, Start Time, End Time, Break Duration (minutes)
* [x] Admin can edit any shift timing
* [x] Save via API — if API missing add TODO comment
* [x] Add comment: `// Shift configs saved to backend — used for attendance validation`

### 4c — Shift Selection in Team Edit
* [x] In Team → Edit Employee screen:
  * [x] Add a `Shift` dropdown field
  * [x] Dropdown must show all configured shifts from admin settings
  * [x] Currently this field is missing — add it
* [x] Save selected shift with employee record via API
* [x] Add comment: `// Shift dropdown was missing from team edit — added per v2 spec`

---

## 👥 Task 5 — Inactive Employees — Show Only in Inactive Section

**Context:** Inactive employees are showing in active lists. Fix this.

### 5a — Fix Employee List Filtering
* [x] In every employee list view across the dashboard:
  * [x] Active list — show ONLY employees where `status === 'ACTIVE'`
  * [x] Inactive list / section — show ONLY employees where `status === 'INACTIVE'`
* [x] Search all components that render employee lists and fix the filter in each
* [x] Add comment: `// Inactive employees filtered out of all active views`

### 5b — Inactive Section
* [x] Ensure there is a dedicated `Inactive` tab or section in the Team page
* [x] Inactive employees must show with a clear `Inactive` badge
* [x] Admin can reactivate an employee from the inactive section

---

## 🏷️ Task 6 — Employee Roles — Full Time, Part Time, Intern

**Context:** New roles need to be added with correct timing management per role type.

### 6a — Scan First
* [x] Read backend schema.prisma for existing role/employment type fields (read-only)
* [x] Check if `employmentType` field exists on User model
* [x] Report findings — wait for approval

### 6b — Role Types and Timing Rules
* [x] Add employment type selector in employee profile/edit:
  * Options: `Full Time`, `Part Time`, `Intern`
* [x] Each type has different working hour expectations:

| Role | Expected Daily Hours | Leave Entitlement |
|---|---|---|
| Full Time | 9 hours | Full leave policy |
| Part Time | 4-5 hours | 50% leave entitlement |
| Intern | 6 hours | No paid leave |

* [x] These rules must be shown in the employee profile
* [x] Add comment: `// Employment type determines working hours and leave policy`

### 6c — Time Duration Tracking Per Role
* [x] In attendance reports — show actual vs expected hours per employee
* [x] Color code: Green if met target, Yellow if slightly under, Red if significantly under
* [x] Calculate leave balance based on employment type rules
* [x] Add comment: `// Duration tracking used for leave allotment calculation`

---

## 🧪 Task 7 — Testing Checklist

**Happy Path Tests:**
* [ ] Live Feed loads with correct grid layout per selected grid size
* [ ] Employee cards show profile photo or initials correctly
* [ ] Mini map shows correct last known location
* [ ] Filters update grid instantly
* [ ] Past feed plots location history on map
* [ ] Fullscreen mode works and exits on Escape key
* [ ] Geofence toggle saves per employee — not globally
* [ ] Salary slip shows travel and expense data
* [ ] Shift dropdown shows in team edit with all configured shifts
* [ ] Inactive employees do not appear in active lists
* [ ] Employment type saves and correct hours shown in reports



**Edge Case Tests:**
* [ ] Employee with no profile photo — initials shown correctly
* [ ] Employee with no GPS data — location unavailable placeholder shown
* [ ] Employee with no punch-in today — In Time shows `--`
* [ ] Geofence OFF employee — can punch in from anywhere
* [ ] Past feed with no movement — fraud warning shown
* [ ] Part time employee leave balance calculated at 50%
* [ ] Intern shows zero paid leave balance

**Quality Checks:**
* [ ] No hardcoded values anywhere
* [ ] All new components have comments
* [ ] No backend files modified — confirm with `git diff --name-only`
* [ ] No console errors in browser

---

## 📦 Task 8 — Final Steps

* [ ] Confirm all changes are inside `FFMS_FRONTEND_ADIT/frontend/` only
* [ ] Confirm zero backend files were modified
* [ ] Run lint check — fix all warnings
* [ ] Build frontend: `npm run build` — confirm zero errors
* [ ] Git commit with message:
  `feat: dashboard v2 — live feed, geofence per employee, salary slip, shifts, roles`
* [ ] Push to GitHub branch: `temp`
* [ ] Do NOT merge to `main`

---

# 📋 Mobile App — Task 9: Full Feature Update

> **Scope:** Flutter mobile app code ONLY — inside `ffms_mobile/` folder.
>
> **STRICT RULES — READ BEFORE STARTING:**
> - ✅ You may ONLY edit files inside `ffms_mobile/`
> - ❌ DO NOT touch any backend file — `FFMS_NANDINI/` is READ ONLY
> - ❌ DO NOT touch `FFMS_FRONTEND_ADIT/` — web dashboard is READ ONLY
> - ❌ DO NOT hardcode any values — use constants, config, or API responses
> - ❌ DO NOT create backend routes, controllers, models, or schema changes
> - ✅ If a backend API is missing — show placeholder UI with comment:
>   `// TODO: Backend API needed — endpoint not yet available`
> - ✅ Read backend routes first (read-only) before calling any API
> - ✅ Add clear comments to every function, widget, and logic block
> - ✅ Use existing API base URL and auth token patterns already in the app
> - ✅ If unsure about any backend endpoint — ask, do not guess
> - ✅ Work on ONE sub-task at a time. Stop after each and wait for approval.

---

## 🔄 WORKFLOW FOR EVERY SUB-TASK

```
Inspect → Analyze → Implement → Verify → Report → Stop
```

Every response must follow this exact output format:

```
## ROOT CAUSE / GOAL
## IMPACT ANALYSIS
## FILES CHANGED
## CHANGES IMPLEMENTED
## WHY IT WORKS
## EDGE CASES TESTED
## RISKS
## ROLLBACK PLAN
## VERIFICATION STEPS
## STATUS
```

---

## 📸 Task 9a — Profile Photo: Show in Dashboard & Replace All Initials

### Context
Employee sets a profile photo in the mobile app.
Currently the app shows initials (e.g. `NK`) in many places instead of
the actual profile photo. This must be fixed everywhere in the app.

### Step 1 — Scan First (Do NOT edit yet)
* [x] Search entire `ffms_mobile/lib/` for all places that show
      initials or avatar circles
* [x] Search for `CircleAvatar`, `Text(initials)`, `_getInitials`,
      `profilePhoto`, `profilePhotoUrl`, `avatarUrl`
* [x] List every file and line number where initials are shown
      instead of the actual photo
* [x] Check what field name the backend returns for profile photo URL
      (e.g. `profilePhotoUrl`, `avatarUrl`, `photo`)
* [x] Report all findings — wait for approval before editing

### Step 2 — Fix Profile Photo Display
Fix in `ffms_mobile/` only:

* [x] Create a reusable widget:
  `ffms_mobile/lib/widgets/user_avatar.dart`

```dart
// UserAvatar widget — shows profile photo if available,
// falls back to initials if photo URL is null or fails to load
// Used everywhere in the app that shows an employee avatar
```

* [x] Widget accepts:
  * `photoUrl` — nullable String (Cloudinary URL)
  * `name` — String (used to generate initials fallback)
  * `size` — double (radius of circle)
  * `backgroundColor` — optional color override

* [x] Logic inside widget:
  * If `photoUrl` is not null → show `CircleAvatar` with `NetworkImage`
  * If image fails to load → fall back to initials automatically
  * If `photoUrl` is null → show initials directly
  * Generate initials from name: first letter of first + last word
  * Background color: generate consistent color from name hash
  * Add comment:
    `// Falls back to initials if photo URL is null or image fails to load`

* [x] Replace ALL existing initials/avatar code across the app
      with this `UserAvatar` widget:
  * [x] Home screen — greeting avatar (top of dashboard)
  * [x] Profile screen — main profile photo
  * [x] Task cards — assigned employee avatar (verified: not shown in layout)
  * [x] Navigation drawer — logged-in user avatar (verified: no drawer in mobile layout)
  * [x] Any other screen showing employee initials (verified: none found)

### Step 3 — Home Screen Greeting Avatar
* [x] In home screen — after `"Good Morning, [Name]"` greeting:
  * [x] Show the employee's profile photo using `UserAvatar` widget
  * [x] Fetch from logged-in user session data
  * [x] Tapping the avatar navigates to the profile screen
  * [x] Add comment:
    `// Profile photo shown in greeting — fetched from logged-in user session`

### Verification Steps
* [x] Profile photo shows correctly after employee sets it
* [x] Initials shown as fallback when no photo is set
* [x] Image load failure shows initials — no broken image icon
* [x] Photo visible on home screen greeting
* [x] Photo visible on profile screen
* [x] Photo visible in navigation drawer (not applicable)
* [x] Run `flutter analyze` — zero errors

---

## 📍 Task 9b — Enhanced GPS Payload (Motion Sensor + Speed + Displacement)

### Context
Currently GPS sends coordinates every 5 minutes.
New requirement: Send enhanced payload every **2 minutes** with:
- GPS coordinates
- Motion sensor data (accelerometer)
- Speed (calculated from distance / time)
- Displacement from Point 1 to Point 2
- Battery percentage
- All existing fields (WiFi, Bluetooth, phone model, etc.)

### Step 1 — Scan First (Do NOT edit yet)
* [ ] Find existing GPS background service in `ffms_mobile/`
* [ ] Find where GPS payload is built and posted
* [ ] Check what packages are already installed:
  * `sensors_plus` (accelerometer/gyroscope)
  * `geolocator` (speed is available in Position object)
  * `battery_plus`
* [ ] Read backend GPS endpoint (read-only) — check if it accepts
      new fields or only existing fields
* [ ] Report findings — wait for approval

### Step 2 — Update GPS Background Service
Fix in `ffms_mobile/` only:

* [ ] Change polling interval from **5 minutes to 2 minutes**
* [ ] Update payload to include new fields:

```dart
// Enhanced GPS payload — sent every 2 minutes while punched in
// All values collected from real device sensors — nothing hardcoded
{
  "gps_coordinates": {
    "latitude": <real>,        // from geolocator
    "longitude": <real>,       // from geolocator
    "accuracy": <real>,        // GPS accuracy in meters
    "altitude": <real>         // altitude in meters
  },
  "speed_kmh": <real>,         // from Position.speed (m/s × 3.6)
  "displacement_km": <real>,   // distance from last GPS point to current
  "motion": {
    "is_moving": <bool>,       // true if speed > 0.5 m/s
    "accelerometer_x": <real>, // from sensors_plus
    "accelerometer_y": <real>,
    "accelerometer_z": <real>
  },
  "battery_level": <int>,      // from battery_plus
  "battery_charging": <bool>,
  "phone_model": <string>,     // from device_info_plus
  "phone_brand": <string>,
  "location_enabled": <bool>,
  "wifi_enabled": <bool>,
  "bluetooth_enabled": <bool>,
  "timestamp": <ISO8601>,      // DateTime.now().toUtc().toIso8601String()
  "user_id": <string>          // from logged-in session
}
```

* [ ] Displacement calculation:
  * Store last known coordinates in SharedPreferences
  * On each ping: calculate distance from last point to current point
    using Haversine formula (implement in mobile — do not call backend)
  * Update stored last point after each successful ping
  * Add comment:
    `// Displacement calculated client-side using Haversine formula`

* [ ] Speed calculation:
  * Read `Position.speed` from geolocator (returns m/s)
  * Convert to km/h: `speed_kmh = position.speed * 3.6`
  * If speed < 0.3 m/s → set `is_moving: false`
  * Add comment:
    `// Speed from geolocator Position.speed — converted from m/s to km/h`

* [ ] Motion sensor:
  * Use `sensors_plus` package — read accelerometer stream
  * Take one reading per GPS ping cycle
  * Add comment:
    `// Accelerometer from sensors_plus — one sample per GPS ping`

* [ ] If backend does not accept new fields yet:
  * Still send them in payload
  * Add comment:
    `// TODO: Backend needs to store speed, displacement, motion fields`
    `// New fields are sent now — backend team to add column support`

* [ ] Failed payload queue:
  * If POST fails — store in local queue
  * Retry on next successful ping
  * Add comment:
    `// Failed payloads queued locally — retried on next successful ping`

### Verification Steps
* [ ] GPS service runs every 2 minutes (verify in server logs)
* [ ] Speed shows correct value when moving
* [ ] Displacement increases correctly between pings
* [ ] Motion sensor data shows in payload
* [ ] Battery level correct
* [ ] Service continues when app is in background
* [ ] Service resumes after phone restart if punched in
* [ ] Run `flutter analyze` — zero errors

---

## 💸 Task 9c — Expenses: View All Submissions + Salary Impact (Employee View)

### Context
Employee must be able to see all their submitted expenses in the app,
grouped by category. Salary impact must be visible per expense.

### Step 1 — Scan First (Do NOT edit yet)
* [x] Find existing expense screen in `ffms_mobile/`
* [x] Read backend expense endpoint (read-only):
  * `GET /api/v1/expenses` or `GET /api/v1/expenses/my`
  * Check response fields: category, amount, status, date
* [x] Check if salary/payroll API returns expense breakdown
* [x] Report findings — wait for approval

### Step 2 — Expense List Screen
Fix in `ffms_mobile/` only:

* [x] In expense screen — show all submitted expenses grouped by category:

```
FOOD & MEALS
  • 2026-06-01  Lunch with client    ₹450   ✅ Approved
  • 2026-06-03  Team dinner          ₹1200  ⏳ Pending
  Total: ₹1650

TRANSPORT
  • 2026-06-02  Cab to site          ₹320   ✅ Approved
  Total: ₹320

ACCOMMODATION
  • 2026-06-05  Hotel stay           ₹3500  ❌ Rejected
  Total: ₹3500
```

* [x] Each category shows:
  * [x] Category header with total amount
  * [x] List of expense items under it
  * [x] Each item: date | description | amount | status badge
  * [x] Status badge colors:
    * `APPROVED` → green
    * `PENDING` → yellow/orange
    * `REJECTED` → red

* [x] At the bottom of screen — show summary card:
  * Total Submitted: ₹X
  * Total Approved: ₹X
  * Total Pending: ₹X
  * Total Rejected: ₹X

* [x] Manager name shown per expense:
  * `Submitted to: [Manager Name]`
  * Fetch from expense record or user profile

* [x] Add comment:
  `// Expenses grouped by category client-side from API response`

### Step 3 — Salary Impact Display
* [x] Below the expense summary — show a `Salary Impact` card:
  * Approved Expenses: `+₹X` (will be added to salary)
  * Travel Allowance: `+₹X` (from travel logs)
  * Total Addition to Salary: `+₹X`
* [x] Data fetched from payroll/salary API
* [x] If API not available add comment:
  `// TODO: Backend API needed — GET /api/v1/payroll/my/breakdown`
* [x] Add comment:
  `// Salary impact card shows how expenses affect net pay`

### Verification Steps
* [x] Expenses show grouped by category
* [x] Status badges show correct colors
* [x] Manager name shown on each expense
* [x] Summary totals calculate correctly
* [x] Salary impact card shows correct amounts
* [x] Run `flutter analyze` — zero errors

---

## 🧪 Task 9d — Testing Checklist

### Profile Photo Tests
* [ ] Set profile photo — appears on home screen greeting immediately
* [ ] Profile photo appears in navigation drawer
* [ ] No photo set — initials shown correctly
* [ ] Network image fails — initials shown as fallback
* [ ] Different employees show different avatar colors

### GPS Enhanced Payload Tests
* [ ] Ping sent every 2 minutes (check server logs)
* [ ] Speed shows `0` when stationary
* [ ] Speed shows correct value when moving in vehicle
* [ ] Displacement increases correctly between pings
* [ ] Motion `is_moving: false` when sitting still
* [ ] Motion `is_moving: true` when walking or driving
* [ ] Battery level matches phone's actual battery
* [ ] Payload sent only when punched in
* [ ] Payload stops when punched out
* [ ] App killed mid-shift — resumes on reopen

### Expense Tests
* [ ] All expenses show in correct categories
* [ ] Approved expenses show green badge
* [ ] Pending expenses show yellow badge
* [ ] Rejected expenses show red badge
* [ ] Summary totals match individual amounts
* [ ] Manager name shows correctly
* [ ] Salary impact card shows correct addition

### Quality Checks
* [ ] No hardcoded values anywhere in Task 9 changes
* [ ] All new code has comments
* [ ] No backend files modified
* [ ] Run `flutter analyze` — zero errors
* [ ] Run `flutter run -d <device>` — no runtime crashes

---

## 📦 Task 9e — Build & Push

* [ ] Confirm all changes inside `ffms_mobile/` only
* [ ] Confirm zero backend files modified:
  `git diff --name-only` — verify only `ffms_mobile/` files appear
* [ ] Bump version in `pubspec.yaml`:
  `version: X.X.X+XX` — increment build number
* [ ] Run `flutter pub get`
* [ ] Run `flutter analyze` — zero errors
* [ ] Run `flutter build apk --release`
* [ ] Confirm APK builds without errors
* [ ] Git commit all changes:
  `feat: mobile task 9 — profile photo, GPS enhanced, expense view`
* [ ] Push to GitHub branch: `temp`
* [ ] Do NOT merge to `main`
* [ ] Share APK file path for QA testing

---
```markdown
# 📋 Task 10 — Cloudinary Media Routing: Mobile → Backend → Admin Panel

> **Scope:** All three projects — `ffms_mobile/`, `FFMS_NANDINI/backend/`, 
> and `FFMS_FRONTEND_ADIT/frontend/`
>
> **STRICT RULES — READ BEFORE STARTING:**
> - ✅ Work on ONE sub-task at a time — stop and wait for approval after each
> - ✅ Read all relevant files before editing anything
> - ✅ Add clear comments to every function, widget, and component you touch
> - ❌ DO NOT hardcode any Cloudinary credentials — read from .env only
> - ❌ DO NOT expose CLOUDINARY_API_SECRET in any frontend or mobile code
> - ❌ DO NOT call Cloudinary directly from mobile — always go via backend
> - ✅ Mobile → Backend (Base64 in JSON) → Backend uploads to Cloudinary
>   → Backend stores URL → Frontend fetches URL from API → displays image
> - ✅ If a backend field is missing — add TODO comment, do not create backend
> - ✅ Run flutter analyze (mobile) and npm run build (frontend) before reporting

---

## 🏗️ ARCHITECTURE — HOW IMAGES FLOW IN THIS SYSTEM

```
MOBILE APP                 BACKEND (Node.js)           CLOUDINARY
──────────                 ─────────────────           ──────────
Pick image (camera/gallery)
↓
Compress to max 800×800px, quality 70
↓
Convert to Base64 string
↓
Send Base64 in JSON payload  →  Receive Base64 string
to API endpoint                 ↓
                                cloudinary.uploader.upload(base64)
                                ↓
                                Store returned URL in database
                                ↓
                                Return URL in API response

ADMIN WEB PANEL
───────────────
Fetch data from API  →  Response includes Cloudinary URL
↓
Display image using <img src={url} /> or CachedNetworkImage
```

---

## 🔑 CLOUDINARY CONFIGURATION REFERENCE

```
Your Cloudinary credentials are in:
FFMS_NANDINI/backend/.env

CLOUDINARY_CLOUD_NAME = dljetsmfv
CLOUDINARY_API_KEY    = 373983514644273
CLOUDINARY_API_SECRET = (in .env — never expose in frontend or mobile)
CLOUDINARY_URL        = cloudinary://key:secret@dljetsmfv

Config file: FFMS_NANDINI/backend/src/config/cloudinary.js

Upload method used: cloudinary.uploader.upload(base64String, {
  folder: 'ffms/<folder-name>',
  resource_type: 'image'
})

Returns: { secure_url: 'https://res.cloudinary.com/dljetsmfv/...' }
```

---

## 📋 COMPLETE IMAGE UPLOAD MAP

| Feature | Mobile Sends | Backend Field | Cloudinary Folder | DB Field |
|---|---|---|---|---|
| Profile Photo | `profilePhotoBase64` | `POST /api/v1/users/profile-photo` | `ffms/profiles` | `profilePhotoUrl` |
| Punch-In Selfie | `selfieBase64` | `POST /api/v1/attendance/check-in` | `ffms/selfies` | `checkInSelfieUrl` |
| Punch-Out Selfie | `selfieBase64` | `POST /api/v1/attendance/check-out` | `ffms/selfies` | `checkOutSelfieUrl` |
| Task Proof Photo | `proofPhotoBase64` | `POST /api/v1/tasks/:id/complete` | `ffms/task-proofs` | `proofPhotoUrl` |
| Task Completion Selfie | `selfieBase64` | `POST /api/v1/tasks/:id/complete` | `ffms/task-selfies` | `completionSelfieUrl` |
| Travel Meter Photo | `proofImageBase64` | `PATCH /api/v1/travel/my/today` | `ffms/travel-proof` | `proofImageUrl` |
| Expense Receipt | `receiptBase64` | `POST /api/v1/expenses` | `ffms/receipts` | `receiptUrl` |

---

## 🔍 Sub-Task 10a — Scan All Three Projects (Do NOT edit yet)

### Mobile App Scan (`ffms_mobile/`)
* [ ] Find `image_upload_util.dart` — check current implementation
* [ ] Check every screen that uploads an image — list file + line number:
  * [ ] Profile photo upload screen
  * [ ] Punch-in selfie capture
  * [ ] Task completion — proof photo + selfie
  * [ ] Travel modal — Point A and Point B meter photos
  * [ ] Expense receipt photo
* [ ] For each — check:
  * Is image compressed before sending?
  * Is it converted to Base64?
  * Is Base64 sent in correct field name matching backend expectation?
* [ ] Report any mismatch between field names mobile sends vs backend expects

### Backend Scan (`FFMS_NANDINI/backend/` — READ ONLY)
* [ ] For each endpoint in the image upload map above:
  * Find the controller and service handling it
  * Confirm the exact Base64 field name expected in request body
  * Confirm which Cloudinary folder it uploads to
  * Confirm the DB field where URL is stored
  * Confirm the URL is returned in API response
* [ ] Check `GET /api/v1/users/me` — does it return `profilePhotoUrl`?
* [ ] Check attendance GET endpoints — do they return selfie URLs?
* [ ] Check task GET endpoints — do they return proof photo URLs?
* [ ] Check travel GET endpoint — does it return `proofImageUrl`?
* [ ] Check expense GET endpoint — does it return `receiptUrl`?
* [ ] Report any endpoint that stores image but does NOT return URL

### Frontend Scan (`FFMS_FRONTEND_ADIT/frontend/` — READ ONLY during scan)
* [ ] Find every place that shows an employee avatar or profile photo
* [ ] Find attendance log / daily detail view
* [ ] Find task detail view
* [ ] Find travel log view
* [ ] Find expense claim detail view
* [ ] Check if Cloudinary URLs from API are being rendered or ignored
* [ ] Report all findings with file names and line numbers

### Report Format for Scan
```
MOBILE FINDINGS:
- [file:line] — what is wrong

BACKEND FINDINGS:
- [endpoint] — field name confirmed / missing / URL not returned

FRONTEND FINDINGS:
- [file:line] — URL available but not shown / field missing
```

* [ ] Wait for approval before editing any file

---

## 📱 Sub-Task 10b — Mobile: Fix image_upload_util.dart

Fix in `ffms_mobile/lib/utils/image_upload_util.dart` only:

```dart
// image_upload_util.dart
// Shared utility for all image uploads in FFMS mobile app
// Method: Pick → Compress → Convert to Base64 → Return string
// Backend handles actual Cloudinary upload — mobile never calls Cloudinary directly
```

* [ ] Function signature:
  ```dart
  Future<String?> pickAndConvertToBase64({
    required ImageSource source, // camera or gallery
    int maxWidth = 800,           // max width in pixels
    int maxHeight = 800,          // max height in pixels  
    int quality = 70,             // JPEG compression quality 0-100
  })
  ```
* [ ] Steps inside function:
  1. Request camera or gallery permission using `permission_handler`
  2. Open picker using `image_picker` package
  3. If user cancels — return null
  4. Compress image using `flutter_image_compress` package:
     * Max width: 800px
     * Max height: 800px
     * Quality: 70
     * Format: JPEG
  5. Convert compressed bytes to Base64 string:
     ```dart
     final base64String = base64Encode(compressedBytes);
     // Add data URI prefix for backend compatibility
     final formatted = 'data:image/jpeg;base64,$base64String';
     return formatted;
     ```
  6. Return formatted Base64 string
  7. On any error — show SnackBar with message and return null
* [ ] Add `flutter_image_compress` to `pubspec.yaml` if not present
* [ ] Add comments on every step
* [ ] Add comment:
  ```dart
  // IMPORTANT: Never call Cloudinary directly from mobile
  // Always send Base64 to backend endpoint
  // Backend: cloudinary.uploader.upload(base64, { folder: 'ffms/...' })
  ```

---

## 📱 Sub-Task 10c — Mobile: Fix Each Upload Point

Fix in `ffms_mobile/` only.
Use `image_upload_util.dart` for ALL image conversions.

### Profile Photo Upload
* [ ] File: `lib/screens/profile_screen.dart` (or wherever profile photo upload exists)
* [ ] On image selected — call `pickAndConvertToBase64(source: ImageSource.gallery)`
* [ ] Send Base64 to backend:
  ```dart
  // POST /api/v1/users/profile-photo
  // Body: { "profilePhotoBase64": "<base64 string>" }
  ```
* [ ] On success — update `profilePhotoUrl` in `AuthProvider`
* [ ] Trigger rebuild of all avatar widgets via provider notify
* [ ] Add comment:
  ```dart
  // Profile photo → backend → Cloudinary folder: ffms/profiles
  // URL stored in DB as profilePhotoUrl
  // URL propagated to all avatar widgets via AuthProvider
  ```

### Punch-In Selfie
* [ ] File: wherever punch-in / attendance check-in is handled
* [ ] On punch-in — open front camera automatically
* [ ] Call `pickAndConvertToBase64(source: ImageSource.camera)`
* [ ] Include `selfieBase64` in punch-in payload:
  ```dart
  // POST /api/v1/attendance/check-in
  // Body: { "selfieBase64": "<base64>", ...other fields }
  ```
* [ ] Add comment:
  ```dart
  // Selfie captured on punch-in → backend → Cloudinary folder: ffms/selfies
  ```

### Task Completion — Proof Photo + Selfie
* [ ] File: wherever Complete Task modal is implemented
* [ ] Two separate image pickers:
  * Proof photo — camera or gallery
  * Selfie — camera only
* [ ] Both converted to Base64 using `pickAndConvertToBase64`
* [ ] Validate both are selected before allowing submit
* [ ] Include in task completion payload:
  ```dart
  // POST /api/v1/tasks/:id/complete
  // Body: {
  //   "notes": "...",
  //   "proofPhotoBase64": "<base64>",
  //   "selfieBase64": "<base64>"
  // }
  // Scan task.service.js (read-only) to confirm exact field names
  ```
* [ ] Add comment:
  ```dart
  // Proof photo → ffms/task-proofs
  // Completion selfie → ffms/task-selfies
  ```

### Travel Meter Photos
* [ ] File: wherever travel modal form is implemented in `home_screen.dart`
* [ ] Point A photo and Point B photo — each uses `pickAndConvertToBase64`
* [ ] Include in travel submit payload:
  ```dart
  // PATCH /api/v1/travel/my/today
  // Body: {
  //   "meterStart": <number>,
  //   "meterEnd": <number>,
  //   "proofImageBase64": "<base64 of Point B photo>"
  // }
  // Note: backend currently supports one proof image
  // If Point A photo also needed — add TODO comment
  ```
* [ ] Add comment:
  ```dart
  // Meter photo → backend → Cloudinary folder: ffms/travel-proof
  // URL stored as proofImageUrl in TravelLog
  ```

### Expense Receipt Photo
* [ ] File: `lib/screens/add_expense_screen.dart`
* [ ] Receipt image picker uses `pickAndConvertToBase64`
* [ ] Include in expense payload:
  ```dart
  // POST /api/v1/expenses
  // Body: {
  //   "category": "...",
  //   "amount": <number>,
  //   "description": "...",
  //   "receiptBase64": "<base64>"
  // }
  // Scan expense.controller.js to confirm exact field name
  ```
* [ ] Add comment:
  ```dart
  // Receipt photo → backend → Cloudinary folder: ffms/receipts
  // URL stored as receiptUrl in Expense
  ```

---

## 🌐 Sub-Task 10d — Frontend: Display All Images in Admin Panel

Fix in `FFMS_FRONTEND_ADIT/frontend/` only.

### Reusable MediaViewer Component
* [ ] Create: `src/components/common/MediaViewer.jsx` (or `.tsx`)
* [ ] Props:
  ```js
  {
    url: string | null,        // Cloudinary HTTPS URL
    placeholder: string,       // text when url is null
    label: string,             // caption below image
    size: 'thumb' | 'full',    // display size
    onClick: function          // open lightbox on click
  }
  ```
* [ ] If `url` is valid — render `<img>` with lazy loading
* [ ] If `url` is null — render placeholder div with placeholder text
* [ ] On click — open full-size modal/lightbox
* [ ] Add comment:
  ```js
  // All Cloudinary URLs served over HTTPS — no CORS issues
  // Use this component everywhere an image is displayed
  // Never render raw <img> tags directly for user-uploaded content
  ```

### Profile Photo — Show Everywhere in Admin
* [ ] Find every place in the frontend that shows employee avatar:
  * Employee list table
  * Employee detail / profile page
  * Manager → Employee list under their team
  * Live Feed grid cards
  * Attendance log rows
  * Task assignment views
* [ ] Replace initials circle with `<EmployeeAvatar>` component:
  ```js
  // EmployeeAvatar component
  // If profilePhotoUrl → show circular image from Cloudinary
  // If null → show initials in colored circle (keep existing behavior)
  // Used everywhere an employee is referenced in the UI
  ```
* [ ] Add comment on every usage:
  ```js
  // profilePhotoUrl from GET /api/v1/users or GET /api/v1/users/:id
  ```

### Attendance Log — Show Punch-In Selfie
* [ ] In attendance detail / daily log view:
  * Show selfie thumbnail next to punch-in record
  * Click thumbnail → open full size in lightbox
  * If null → show `"No selfie captured"`
* [ ] Add comment:
  ```js
  // checkInSelfieUrl from GET /api/v1/attendance — stored in Cloudinary
  ```

### Task Detail — Show Proof Photo + Selfie
* [ ] In task detail view when status is COMPLETED:
  * Show proof photo thumbnail
  * Show completion selfie thumbnail
  * Show completion notes text
  * Click any thumbnail → full size lightbox
  * If null → show `"No proof submitted"`
* [ ] Add comment:
  ```js
  // proofPhotoUrl and completionSelfieUrl from GET /api/v1/tasks/:id
  ```

### Travel Log — Show Meter Photos
* [ ] In travel log detail view:
  * Show meter photo thumbnail
  * Show: distance travelled, amount earned
  * Click thumbnail → full size
  * If null → show `"No meter photo uploaded"`
* [ ] Add comment:
  ```js
  // proofImageUrl from GET /api/v1/travel — stored in Cloudinary ffms/travel-proof
  ```

### Expense Claim — Show Receipt Photo
* [ ] In expense claim detail view:
  * Show receipt photo thumbnail
  * Click → full size lightbox
  * If null → show `"No receipt attached"`
* [ ] Add comment:
  ```js
  // receiptUrl from GET /api/v1/expenses — stored in Cloudinary ffms/receipts
  ```

---

## 🧪 Sub-Task 10e — Testing Checklist

**Mobile Upload Tests:**
* [ ] Profile photo — pick from gallery → uploads → shows in app immediately
* [ ] Profile photo — take with camera → uploads → shows in app immediately
* [ ] Punch-in selfie — captured → sent with attendance → no error
* [ ] Task completion — both proof photo and selfie required → submit works
* [ ] Travel modal — Point B meter photo uploads → travel log saved
* [ ] Expense — receipt photo attaches → expense submits without error
* [ ] All images compressed before upload — file size under 300KB
* [ ] No raw Cloudinary calls from mobile — all go via backend

**Admin Panel Display Tests:**
* [ ] Employee list shows profile photo — not initials — for employees with photo set
* [ ] Employee with no photo — initials shown correctly
* [ ] Manager view of team — employee profile photos visible
* [ ] Attendance log — selfie thumbnail visible next to punch-in record
* [ ] Completed task — proof photo and selfie thumbnails visible
* [ ] Travel log — meter photo visible with distance and amount
* [ ] Expense claim — receipt photo visible
* [ ] All null/missing photos show correct placeholder text
* [ ] Click any thumbnail → full size opens in lightbox
* [ ] No broken image icons anywhere
* [ ] No console errors related to image loading

**Quality Checks:**
* [ ] No Cloudinary credentials in any mobile or frontend file
* [ ] No hardcoded Cloudinary URLs
* [ ] All image field names match exactly between mobile and backend
* [ ] All new code has comments
* [ ] `flutter analyze` — zero errors
* [ ] `npm run build` — zero errors

---

## 📦 Sub-Task 10f — Push ALL Projects to GitHub `temp` Branch

This is the FINAL step — do this only after all above sub-tasks are verified.

### Mobile App
* [ ] Confirm all changes inside `ffms_mobile/` only
* [ ] Run `flutter pub get`
* [ ] Run `flutter analyze` — zero errors
* [ ] Bump version in `pubspec.yaml`
* [ ] Run `flutter build apk --release`
* [ ] Confirm APK builds successfully
* [ ] Git add + commit:
  ```
  git add .
  git commit -m "feat: task 10 — cloudinary image routing, profile photos, all upload fixes"
  ```
* [ ] Push to `temp` branch:
  ```
  git push origin temp
  ```

### Backend
* [ ] Confirm NO backend files were modified (backend is read-only)
* [ ] Run `git diff --name-only` inside `FFMS_NANDINI/` — must show no changes
* [ ] If any backend files were accidentally changed — revert them:
  ```
  git checkout -- .
  ```
* [ ] Push only if backend changes were intentionally approved:
  ```
  git push origin temp
  ```

### Frontend (Admin Panel)
* [ ] Confirm all changes inside `FFMS_FRONTEND_ADIT/frontend/` only
* [ ] Run `npm install`
* [ ] Run `npm run build` — zero errors
* [ ] Git add + commit:
  ```
  git add .
  git commit -m "feat: task 10 — profile photos admin panel, image display all views"
  ```
* [ ] Push to `temp` branch:
  ```
  git push origin temp
  ```

### Final Verification After Push
* [ ] Confirm all three repos pushed to `temp` branch
* [ ] Do NOT merge any branch to `main`
* [ ] Share GitHub `temp` branch links for QA review
* [ ] Share APK file path for mobile QA

---

## 📊 Task 10 Summary

| Sub-Task | Scope | What It Does |
|---|---|---|
| 10a | All 3 — Scan only | Find all gaps in image upload chain |
| 10b | Mobile only | Fix `image_upload_util.dart` — compress + Base64 |
| 10c | Mobile only | Fix all 5 upload points — correct field names |
| 10d | Frontend only | Display all Cloudinary images in admin panel |
| 10e | All 3 — Testing | Verify full upload → display chain works |
| 10f | All 3 — Git | Push all projects to GitHub `temp` branch |

---

*Last updated: 2026-06-09 | Author: Antigravity Dev Team*
*Cloudinary cloud: `dljetsmfv` | Upload method: Base64 via backend only*
*Never expose API Secret in frontend or mobile code*


---

*Last updated: 2026-06-09 | Author: Antigravity Dev Team*
*Scope: Task 9 only — Tasks 1–8 already completed*
*Frontend project: `FFMS_FRONTEND_ADIT/frontend/` | No backend changes permitted*
*Reference document: `live-feed-feature.md`*