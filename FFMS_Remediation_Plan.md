# FFMS Post-Implementation Remediation Plan
## Gaps & Risks — Detailed Fix Instructions

> This document covers every item flagged in the audit report. Each fix follows the same format as the original task list: file path, why, what to do, code, and how to verify. Work in order. One item at a time. Do not move to the next until the current one is verified.

---

## PRIORITY ORDER

**Do the four Critical Risks first. Then work through the Gaps top to bottom.**

```
CRITICAL RISKS (data loss / broken core features)
  Risk 1 — Task 1  : DB backfill for sessionNumber
  Risk 2 — Task 5  : Build parseCoordinate.js
  Risk 3 — Task 7B : Foreground service for background GPS
  Risk 4 — Task 8  : BullMQ retry for async DB write

GAPS (missing or unconfirmed pieces)
  Gap 1  — Task 1  : Verify shift status sums both sessions
  Gap 2  — Task 2  : Zero-coordinate guard + zoom preservation
  Gap 3  — Task 4  : Disable playback controls on empty logs
  Gap 4  — Task 6  : Coordinate precision validator
  Gap 5  — Task 6  : Reverse geocode on pin drag
  Gap 6  — Task 7B : Confirm GPS interval and distance filter
  Gap 7  — Task 7B : Offline location buffer
  Gap 8  — Task 7B : Battery level in payload and schema
  Gap 9  — Task 7C : Dashboard greeting simplification
  Gap 10 — Task 7C : Shimmer loading placeholders
  Gap 11 — Task 8  : Build GET /api/v1/location/live endpoint
```

---

## CRITICAL RISK 1 — Task 1: DB backfill for sessionNumber

**Why this is critical:**
The Prisma migration adds `sessionNumber Int @default(1)` to the schema. However, PostgreSQL does not retroactively apply column defaults to rows that existed before the migration ran. Any historical attendance row will have `sessionNumber = NULL`. When `checkIn` counts today's sessions with `findMany({ where: { userId, date: today } })`, a NULL sessionNumber causes unpredictable ordering and the count logic breaks silently — a user with an old record may be blocked from checking in, or allowed a third session.

**File to check:**
`prisma/migrations/<timestamp>_add_attendance_sessions/migration.sql`

Open that file and confirm whether it contains:
```sql
ALTER TABLE "Attendance" ALTER COLUMN "sessionNumber" SET DEFAULT 1;
```

If the column was added as nullable first, existing rows have NULL. You must backfill.

---

**STEP R1A — Run the backfill SQL**

Connect to your PostgreSQL database and run:

```sql
-- Backfill all existing rows to sessionNumber = 1
UPDATE "Attendance"
SET "sessionNumber" = 1
WHERE "sessionNumber" IS NULL;
```

Then confirm zero NULLs remain:

```sql
SELECT COUNT(*)
FROM "Attendance"
WHERE "sessionNumber" IS NULL;
```

Expected result: `0`

---

**STEP R1B — Make the column non-nullable**

If the migration created the column as nullable (`Int?`), create a new migration to enforce NOT NULL:

Open `prisma/schema.prisma` and confirm the field is:
```prisma
sessionNumber  Int  @default(1)
```

Not:
```prisma
sessionNumber  Int?
```

If it shows `Int?`, change it to `Int @default(1)` and run:
```bash
npx prisma migrate dev --name enforce_session_number_not_null
```

---

**STEP R1C — Verify**

1. Check a sample of existing rows: `SELECT id, "sessionNumber" FROM "Attendance" LIMIT 20;` — all should show `1`.
2. Have a test user check in. Confirm the new record shows `sessionNumber = 1`.
3. Have the same user check out then check in again. Confirm the second record shows `sessionNumber = 2`.
4. Attempt a third check-in. Confirm HTTP 400 `"Daily attendance limit reached"` is returned.

---

**ROOT CAUSE:** PostgreSQL column defaults do not backfill existing rows.
**FILES CHANGED:** `prisma/schema.prisma`, database directly via SQL.
**NOTES:** This must run against the production database before any field staff use the app on a day when they have existing attendance records.

---

## CRITICAL RISK 2 — Task 5: Build parseCoordinate.js

**Why this is critical:**
The territory editor currently accepts coordinates only in plain decimal format (e.g. `22.7915, 86.2296`). GPS devices, Google Maps, and survey tools all export coordinates in DMS format (e.g. `22° 47' 29.4" N 86° 13' 46.56" E`). Any territory manager who copies coordinates from a standard source and pastes them into the form will get a silent failure — the field will show `NaN` or `0`, the territory will be saved with wrong coordinates, and geofence checks will silently fail for every agent in that territory.

**File to create:**
`FFMS_NANDINI/backend/src/utils/parseCoordinate.js`

Also copy or import into the frontend for the territory editor component.

---

**STEP R2A — Create the utility file**

Create `src/utils/parseCoordinate.js`:

```js
/**
 * parseCoordinate
 * Parses a coordinate string in any of 5 standard formats.
 * Returns { lat: number, lng: number } or null if parsing fails.
 *
 * Supported formats:
 *   40° 26' 46" N 79° 58' 56" W      (DMS with hemisphere)
 *   48°51'12.28" 2°20'55.68"         (DMS without hemisphere)
 *   40° 26.767' N 79° 58.933' W      (DDM with hemisphere)
 *   40.446° N 79.982° W              (Decimal with hemisphere)
 *   48.85341, 2.3488                 (Plain decimal pair)
 */
function parseCoordinate(input) {
  if (!input || typeof input !== 'string') return null;
  const s = input.trim();

  // FORMAT 5: plain decimal pair — "48.85341, 2.3488" or "48.85341 2.3488"
  const decimalPair = s.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (decimalPair) {
    const lat = parseFloat(decimalPair[1]);
    const lng = parseFloat(decimalPair[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // FORMATS 1–4: DMS, DDM, and decimal-with-hemisphere
  // Matches: degrees [minutes [seconds]] [hemisphere] for both lat and lng
  const dmsPattern = new RegExp(
    // Latitude part
    '(\\d+)[°\\s]+' +           // degrees
    '(\\d+\\.?\\d*)?[\'\\s]*' + // optional minutes
    '(\\d+\\.?\\d*)?["\\s]*' +  // optional seconds
    '([NS]?)[,\\s]+' +          // optional hemisphere, separator
    // Longitude part
    '(\\d+)[°\\s]+' +
    '(\\d+\\.?\\d*)?[\'\\s]*' +
    '(\\d+\\.?\\d*)?["\\s]*' +
    '([EW]?)',
    'i'
  );

  const m = s.match(dmsPattern);
  if (m) {
    let lat = parseFloat(m[1]);
    if (m[2]) lat += parseFloat(m[2]) / 60;
    if (m[3]) lat += parseFloat(m[3]) / 3600;
    if (m[4].toUpperCase() === 'S') lat = -lat;

    let lng = parseFloat(m[5]);
    if (m[6]) lng += parseFloat(m[6]) / 60;
    if (m[7]) lng += parseFloat(m[7]) / 3600;
    if (m[8].toUpperCase() === 'W') lng = -lng;

    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

function isValidLatLng(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

module.exports = { parseCoordinate };
```

---

**STEP R2B — Wire into the territory editor coordinate inputs**

Open the territory editor component (search for `centerLat` or `centerLng` in the frontend).

Find the coordinate input fields. Add an `onChange` handler that calls `parseCoordinate` on paste:

```ts
import { parseCoordinate } from '@/utils/parseCoordinate'; // or copy the file to frontend/src/utils/

// On the lat/lng input field:
<input
  type="text"
  placeholder="Paste any coordinate format"
  onChange={(e) => {
    const raw = e.target.value;
    const parsed = parseCoordinate(raw);
    if (parsed) {
      form.setValue('centerLat', parsed.lat);
      form.setValue('centerLng', parsed.lng);
      // Also move the map marker to the parsed position
      markerRef.current?.setPosition({ lat: parsed.lat, lng: parsed.lng });
      mapRef.current?.panTo({ lat: parsed.lat, lng: parsed.lng });
    }
    // If parsed is null, let the user keep typing — do not clear the field
  }}
/>
```

---

**STEP R2C — Verify**

Test each of the five formats. Paste the input, confirm the lat/lng fields update correctly:

| Input | Expected lat | Expected lng |
|---|---|---|
| `40° 26' 46" N 79° 58' 56" W` | `40.4461` | `-79.9822` |
| `48°51'12.28" 2°20'55.68"` | `48.8534` | `2.3488` |
| `40° 26.767' N 79° 58.933' W` | `40.4461` | `-79.9822` |
| `40.446° N 79.982° W` | `40.446` | `-79.982` |
| `48.85341, 2.3488` | `48.85341` | `2.3488` |

Also confirm: pasting garbage like `"hello world"` returns `null` and the fields do not change.

---

**ROOT CAUSE:** No coordinate format parser existed. Only plain decimal input was accepted.
**FILES CHANGED:** `src/utils/parseCoordinate.js` (new), territory editor component.
**NOTES:** Copy or symlink this file to the frontend `utils/` folder. Do not duplicate the logic — maintain one source of truth.

---

## CRITICAL RISK 3 — Task 7B: Foreground service for background GPS

**Why this is critical:**
Android's Doze mode and battery optimiser kill background processes that do not hold a foreground service wakelock. Without `flutter_foreground_task`, the GPS location stream in `location_service.dart` stops emitting after roughly 10 minutes of the screen being locked. This means:
- Live map dots on the admin dashboard go offline for every agent whose phone is locked.
- Redis keys expire after 120 seconds and agents appear offline.
- Location history has gaps in every playback route.

This is the single most impactful missing item in the entire mobile implementation. Zomato, Swiggy, and FieldSense all work because they run a foreground service. Without it, FFMS does not work reliably in the field.

**Files to change:**
- `pubspec.yaml`
- `lib/services/location_service.dart`
- `lib/main.dart`
- `android/app/src/main/AndroidManifest.xml`

---

**STEP R3A — Add the package**

In `pubspec.yaml`, under `dependencies`:

```yaml
dependencies:
  flutter_foreground_task: ^8.0.0
  geolocator: ^12.0.0        # confirm you already have this
  battery_plus: ^6.0.0       # confirm you already have this
```

Run:
```bash
flutter pub get
```

---

**STEP R3B — Add Android manifest permissions**

Open `android/app/src/main/AndroidManifest.xml`.

Inside `<manifest>`, add these permissions if not already present:

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

Inside `<application>`, add the service declaration:

```xml
<service
    android:name="com.pravera.flutter_foreground_task.service.ForegroundTaskService"
    android:foregroundServiceType="location"
    android:exported="false"/>
```

---

**STEP R3C — Wrap location service in foreground task**

Open `lib/services/location_service.dart`.

Replace the top-level location stream setup with a foreground task wrapper:

```dart
import 'package:flutter_foreground_task/flutter_foreground_task.dart';

class LocationService {

  static void initForegroundTask() {
    FlutterForegroundTask.init(
      androidNotificationOptions: AndroidNotificationOptions(
        channelId: 'fieldtrack_location',
        channelName: 'FieldTrack Location Tracking',
        channelDescription: 'Keeps GPS active while you are on duty.',
        channelImportance: NotificationChannelImportance.LOW,
        priority: NotificationPriority.LOW,
        iconData: const NotificationIconData(
          resType: ResourceType.mipmap,
          resPrefix: ResourcePrefix.ic,
          name: 'launcher',
        ),
      ),
      iosNotificationOptions: const IOSNotificationOptions(
        showNotification: true,
        playSound: false,
      ),
      foregroundTaskOptions: const ForegroundTaskOptions(
        interval: 5000,           // matches our GPS ping interval
        isOnceEvent: false,
        autoRunOnBoot: false,
        allowWifiLock: true,
      ),
    );
  }

  static Future<void> startForegroundTask(String shiftStatus) async {
    if (await FlutterForegroundTask.isRunningService) return;

    await FlutterForegroundTask.startService(
      notificationTitle: 'FieldTrack — On Duty',
      notificationText: 'Tracking your location. Status: $shiftStatus',
      callback: startLocationCallback,
    );
  }

  static Future<void> stopForegroundTask() async {
    await FlutterForegroundTask.stopService();
  }

  static Future<void> updateNotification(String shiftStatus) async {
    await FlutterForegroundTask.updateService(
      notificationTitle: 'FieldTrack — On Duty',
      notificationText: 'Tracking your location. Status: $shiftStatus',
    );
  }
}

// Top-level callback — must be a top-level function, not a class method
@pragma('vm:entry-point')
void startLocationCallback() {
  FlutterForegroundTask.setTaskHandler(LocationTaskHandler());
}

class LocationTaskHandler extends TaskHandler {
  @override
  Future<void> onStart(DateTime timestamp, SendPort? sendPort) async {
    // GPS stream starts here — runs inside the foreground service process
    _startGpsStream();
  }

  @override
  Future<void> onRepeatEvent(DateTime timestamp, SendPort? sendPort) async {
    // Called every 5000ms by foregroundTaskOptions.interval
    // GPS stream handles its own emit via distanceFilter — this is just a keepalive
  }

  @override
  Future<void> onDestroy(DateTime timestamp, SendPort? sendPort) async {
    _stopGpsStream();
  }
}
```

---

**STEP R3D — Call initForegroundTask in main.dart**

Open `lib/main.dart`. Before `runApp()`:

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  LocationService.initForegroundTask(); // add this line
  runApp(const MyApp());
}
```

---

**STEP R3E — Start the service on check-in, stop on check-out**

In `attendance_screen.dart`, after a successful check-in API response:

```dart
// On check-in success:
await LocationService.startForegroundTask(attendanceStatus);

// On check-out success (Session 2 closed / day complete):
await LocationService.stopForegroundTask();
```

---

**STEP R3F — Verify (15-minute background test)**

1. Build a release APK or use `flutter run --release`.
2. Log in as a field staff user, check in.
3. Confirm the persistent notification appears: `"FieldTrack — On Duty · Tracking your location"`.
4. Lock the phone screen.
5. Wait 15 minutes.
6. Check the backend location logs: `SELECT COUNT(*), MAX(timestamp) FROM "LocationLog" WHERE "userId" = '<test_user_id>' AND timestamp > NOW() - INTERVAL '20 minutes';`
7. Confirm logs continued arriving throughout the 15-minute window with no gap longer than 15 seconds.
8. Check Redis: `GET user:<test_user_id>:location` — key should be fresh (timestamp within last 10 seconds).

If pings stopped before 15 minutes: the foreground service is not running. Check `adb logcat` for `ForegroundTaskService` and confirm the service started.

---

**ROOT CAUSE:** No foreground service wakelock → Android Doze kills the GPS stream after ~10 minutes.
**FILES CHANGED:** `pubspec.yaml`, `AndroidManifest.xml`, `location_service.dart`, `main.dart`, `attendance_screen.dart`.
**NOTES:** iOS does not require a foreground service but does require `NSLocationAlwaysAndWhenInUseUsageDescription` in `Info.plist`. Confirm this key is present with a clear description.

---

## CRITICAL RISK 4 — Task 8: BullMQ retry for async DB write

**Why this is critical:**
The current fire-and-forget implementation discards location data permanently on any DB write failure. A single connection pool exhaustion event, a PostgreSQL restart, or a 30-second network blip will silently drop every location log that arrived during that window. Route playback history will have permanent holes that cannot be recovered.

**Current broken pattern:**
```js
// This loses data permanently on failure
prisma.locationLog.create({ data: payload })
  .catch(err => logger.error('locationLog write failed', err));
```

**Files to change:**
- `src/services/location.service.js`
- `src/jobs/locationWrite.job.js` (new file)
- `src/server.js`

---

**STEP R4A — Create the BullMQ write job**

Create `src/jobs/locationWrite.job.js`:

```js
const { Worker, Queue } = require('bullmq');
const { prisma } = require('../config/db');
const logger = require('../config/logger');
const { redisConnection } = require('../config/redis');

// The queue — producers add jobs here
const locationWriteQueue = new Queue('locationWrite', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,       // 2s, 4s, 8s between retries
    },
    removeOnComplete: 100,  // keep last 100 completed jobs for debugging
    removeOnFail: 500,      // keep last 500 failed jobs for inspection
  },
});

// The worker — consumes jobs and writes to PostgreSQL
const locationWriteWorker = new Worker(
  'locationWrite',
  async (job) => {
    const { userId, orgId, lat, lng, speed, accuracy, timestamp, batteryLevel } = job.data;

    await prisma.locationLog.create({
      data: {
        userId,
        organizationId: orgId,
        latitude: lat,
        longitude: lng,
        speed: speed ?? 0,
        accuracy: accuracy ?? 0,
        timestamp: new Date(timestamp),
        batteryLevel: batteryLevel ?? null,
      },
    });

    logger.info('locationLog written', { userId, timestamp });
  },
  {
    connection: redisConnection,
    concurrency: 10,   // process 10 writes in parallel
  }
);

locationWriteWorker.on('failed', (job, err) => {
  logger.error('locationWrite job failed after all retries', {
    jobId: job.id,
    userId: job.data.userId,
    timestamp: job.data.timestamp,
    error: err.message,
  });
  // At this point the job moves to the failed queue.
  // Ops can inspect and replay via Bull Board or the BullMQ dashboard.
});

module.exports = { locationWriteQueue };
```

---

**STEP R4B — Update location.service.js to enqueue instead of direct write**

Open `src/services/location.service.js`. Find the current location write code.

Replace the direct `prisma.locationLog.create` call with a queue enqueue:

```js
const { locationWriteQueue } = require('../jobs/locationWrite.job');

async function saveLocationLog(userId, orgId, lat, lng, speed, accuracy, timestamp, batteryLevel) {

  // Guard: never process zero or null coordinates
  if (!lat || !lng || lat === 0 || lng === 0) {
    throw new AppError('Invalid coordinates — lat/lng must be non-zero', 400);
  }

  // 1. Write live location to Redis immediately (sub-millisecond)
  const livePayload = JSON.stringify({
    lat, lng, speed, accuracy, timestamp, batteryLevel, online: true,
  });
  await redisClient.set(`user:${userId}:location`, livePayload, { EX: 120 });

  // 2. Emit Socket.IO event immediately — no waiting for DB
  io.to(`org:${orgId}:admins`).emit('location:update', {
    userId, lat, lng, speed, accuracy, timestamp, batteryLevel,
  });

  // 3. Enqueue DB write with retry — never fire-and-forget
  await locationWriteQueue.add('write', {
    userId, orgId, lat, lng, speed, accuracy, timestamp, batteryLevel,
  });
}
```

---

**STEP R4C — Start the worker in server.js**

Open `src/server.js`. Import and start the worker alongside the other BullMQ workers:

```js
const { locationWriteQueue } = require('./jobs/locationWrite.job');
// The worker starts automatically when the module is imported.
// Just importing it is enough — the Worker constructor begins consuming.
logger.info('locationWrite worker started');
```

---

**STEP R4D — Verify**

1. Send a GPS ping from the mobile app. Confirm:
   - Redis key `user:{id}:location` is set with a fresh timestamp.
   - Socket.IO `location:update` fires immediately.
   - A BullMQ job appears in the `locationWrite` queue (use Bull Board or `locationWriteQueue.getJobCounts()`).
   - The job completes and the record appears in `LocationLog`.

2. Simulate a DB failure: temporarily set a wrong DB password in `.env`. Send a GPS ping. Confirm:
   - Redis is still updated (location tracking continues).
   - The BullMQ job retries 3 times with exponential backoff.
   - After 3 failures the job moves to the failed queue.
   - Restore the DB password. Replay the failed job. Confirm it writes successfully.

---

**ROOT CAUSE:** Fire-and-forget drops location data permanently on any transient DB failure.
**FILES CHANGED:** `src/jobs/locationWrite.job.js` (new), `src/services/location.service.js`, `src/server.js`.
**NOTES:** Install Bull Board (`@bull-board/express`) for a visual failed-job dashboard. One afternoon of setup saves hours of debugging data gaps in production.

---

---

## GAP 1 — Task 1: Verify shift status sums both sessions

**Why this matters:**
A field worker who takes a lunch break will have two sessions. If the status is calculated per-session, both sessions will individually show `ABSENT` (under 4 hours each) even if the combined total is 5 hours (`HALF_DAY`) or 8 hours (`PRESENT`). The worker's payroll and performance record will be wrong.

**File to check:**
`src/services/attendance.service.js` — find the `recalculateDailyStatus` function (or wherever checkout calls the status update).

---

**STEP G1A — Confirm the aggregation logic**

The function must look like this — it must sum ALL sessions for the day, not just the session being checked out:

```js
async function recalculateDailyStatus(userId, orgId, date) {
  // Fetch ALL closed sessions for the day (checkOutTime is not null)
  const allSessions = await prisma.attendance.findMany({
    where: {
      userId,
      organizationId: orgId,
      date,
      checkOutTime: { not: null },
    },
  });

  // Sum total working minutes across ALL sessions
  const totalMinutes = allSessions.reduce(
    (sum, session) => sum + (session.durationMinutes ?? 0),
    0
  );

  const firstSession = allSessions
    .sort((a, b) => new Date(a.checkInTime) - new Date(b.checkInTime))[0];

  // Determine if the first check-in was late
  // Adjust this threshold to your org's shift start time
  const LATE_THRESHOLD_HOUR = 9; // 9:00 AM
  const isLate =
    firstSession &&
    new Date(firstSession.checkInTime).getHours() >= LATE_THRESHOLD_HOUR;

  let status;
  if (totalMinutes < 240) {
    status = 'ABSENT';       // under 4 hours
  } else if (totalMinutes < 420) {
    status = 'HALF_DAY';     // 4 to 7 hours
  } else {
    status = isLate ? 'LATE' : 'PRESENT';  // 7+ hours
  }

  // Update status on ALL attendance records for this day
  await prisma.attendance.updateMany({
    where: { userId, organizationId: orgId, date },
    data: { status },
  });

  return { totalMinutes, status };
}
```

---

**STEP G1B — Verify with the test case**

Write a test (or manually test via API):

```
Session 1: checkIn 09:00, checkOut 11:00 → durationMinutes = 120
Session 2: checkIn 12:00, checkOut 15:00 → durationMinutes = 180
Total: 300 minutes = 5 hours → expected status: HALF_DAY
```

Call `recalculateDailyStatus(userId, orgId, today)` after Session 2 checkout. Confirm the returned status is `HALF_DAY`. Confirm both session records in the DB show `status = 'HALF_DAY'`.

---

**ROOT CAUSE:** Per-session status calculation ignores the other session's time.
**FILES CHANGED:** `src/services/attendance.service.js`.

---

## GAP 2 — Task 2: Zero-coordinate guard and zoom preservation

**Why this matters:**
GPS receivers emit `[0, 0]` coordinates during cold start and when the signal is lost. Without a guard, a single bad log point causes the map to snap to the ocean at 0°N, 0°E — exactly the blue-screen bug from the original screenshots. Zoom resetting on every tick makes the map feel broken during playback.

**File to change:**
The playback component — search for `panTo` in `FFMS_FRONTEND_ADIT/frontend`.

---

**STEP G2A — Add the zero-coordinate guard to panTo**

Find the playback ticker function. It likely looks like:

```ts
// Current — no guard
marker.setPosition({ lat: log.lat, lng: log.lng });
map.panTo({ lat: log.lat, lng: log.lng });
```

Replace with:

```ts
function onPlaybackTick(currentIndex: number, logs: LocationLog[], map: any, marker: any) {
  const log = logs[currentIndex];

  // Guard 1: skip missing or zero coordinates silently
  if (!log) return;
  if (log.lat == null || log.lng == null) return;
  if (log.lat === 0 && log.lng === 0) return;

  // Move marker
  marker.setPosition({ lat: log.lat, lng: log.lng });

  // Pan map — do NOT call setZoom here
  map.panTo({ lat: log.lat, lng: log.lng });

  // Update info row
  updatePlaybackInfo(log);
}
```

Apply the same guard to the scrubber `onChange` handler.

---

**STEP G2B — Confirm zoom is not being reset per tick**

Search the playback component for `setZoom`, `setCenter`, or any combined call that looks like:

```ts
// BAD — resets zoom on every tick
map.setCenter([log.lat, log.lng]);
map.setZoom(15);
```

If you find this pattern, remove `setZoom`. The zoom must only be set once, by `fitBounds` when a new agent is selected or play is first pressed. During playback, only `panTo` runs.

---

**STEP G2C — Verify**

1. Manually insert a `{ lat: 0, lng: 0 }` entry into a test agent's logs array in the frontend state.
2. Press Play. Confirm the map does not snap to the ocean at that log point — the tick is skipped silently.
3. Play a full route. Confirm the map follows the marker without zoom level changing.
4. Drag the scrubber. Confirm the map pans to the correct position and zoom stays consistent.

---

**ROOT CAUSE:** No null/zero guard on panTo; zoom reset inside ticker.
**FILES CHANGED:** Playback component (`PlaybackMap.tsx` or `playback/page.tsx`).

---

## GAP 3 — Task 4: Disable playback controls when logs are empty

**Why this matters:**
If the Play button is enabled with `logs.length === 0`, an admin can press Play and the ticker will immediately throw a runtime error trying to access `logs[0]` on an empty array. This crashes the playback component and may crash the entire page.

**File to change:**
Playback component — wherever the Play button, slider, and log counter are rendered.

---

**STEP G3A — Disable Play button**

Find the Play History button. Add the disabled condition:

```tsx
<button
  onClick={handlePlay}
  disabled={!logs || logs.length === 0 || isPlaying}
  style={{
    opacity: (!logs || logs.length === 0) ? 0.4 : 1,
    cursor: (!logs || logs.length === 0) ? 'not-allowed' : 'pointer',
  }}
>
  ▶ Play History
</button>
```

---

**STEP G3B — Disable and reset slider**

Find the timeline slider. Add the disabled state:

```tsx
<input
  type="range"
  min={0}
  max={logs?.length > 0 ? logs.length - 1 : 0}
  value={logs?.length > 0 ? currentIndex : 0}
  disabled={!logs || logs.length === 0}
  onChange={(e) => onSliderChange(parseInt(e.target.value), logs, mapRef.current, markerRef.current)}
  style={{
    opacity: (!logs || logs.length === 0) ? 0.4 : 1,
    cursor: (!logs || logs.length === 0) ? 'not-allowed' : 'pointer',
  }}
/>
```

---

**STEP G3C — Show "Log Point 0 of 0" counter**

Find the log point counter. Update its render logic:

```tsx
<span>
  Log Point {logs?.length > 0 ? currentIndex + 1 : 0} of {logs?.length ?? 0}
</span>
```

---

**STEP G3D — Verify**

1. Select Field Staff 8 (no logs). Confirm:
   - Play button is visually dimmed and clicking it does nothing.
   - Slider shows `0` and is not draggable.
   - Counter reads `Log Point 0 of 0`.
   - No JS errors in the browser console.
2. Select an agent with logs. Confirm all controls re-enable correctly.

---

**ROOT CAUSE:** Controls not guarded against empty logs array — runtime crash risk.
**FILES CHANGED:** Playback component.

---

## GAP 4 — Task 6: Coordinate precision validator

**Why this matters:**
A coordinate stored as `22.79, 86.22` (2 decimal places) is only accurate to ~1.1 km. A territory geofence defined with that precision will include or exclude thousands of square metres incorrectly. The attendance geofence check in `attendance.service.js` uses the territory polygon coordinates for the ray-casting check — if those coordinates are imprecise, field staff inside the territory will be rejected and staff outside will be accepted.

**Files to change:**
`src/services/territory.service.js` (or wherever territories are created/updated), `src/services/visitReport.service.js`.

---

**STEP G4A — Create the precision validator**

Add this helper to `src/utils/validateCoordinatePrecision.js`:

```js
/**
 * Validates that lat/lng have at least 4 decimal places.
 * 4 decimal places = ~11 metre accuracy.
 * Fewer = pincode or street-centre level — insufficient for geofencing.
 */
function validateCoordinatePrecision(lat, lng) {
  const latStr = parseFloat(lat).toString();
  const lngStr = parseFloat(lng).toString();

  const latDecimals = latStr.includes('.') ? latStr.split('.')[1].length : 0;
  const lngDecimals = lngStr.includes('.') ? lngStr.split('.')[1].length : 0;

  if (latDecimals < 4 || lngDecimals < 4) {
    throw new AppError(
      `Coordinate precision too low (lat: ${latDecimals} dp, lng: ${lngDecimals} dp). ` +
      `Minimum 4 decimal places required for accurate geofencing.`,
      400
    );
  }
}

module.exports = { validateCoordinatePrecision };
```

---

**STEP G4B — Wire into territory and visit report services**

In `territory.service.js`, before any `prisma.territory.create` or `prisma.territory.update`:

```js
const { validateCoordinatePrecision } = require('../utils/validateCoordinatePrecision');

// Inside createTerritory and updateTerritory:
validateCoordinatePrecision(centerLat, centerLng);
// Also validate each polygon vertex coordinate:
polygonCoords.forEach(([lat, lng]) => validateCoordinatePrecision(lat, lng));
```

In `visitReport.service.js`, before saving the visit location:

```js
validateCoordinatePrecision(visitLat, visitLng);
```

---

**STEP G4C — Verify**

1. Try to save a territory with `centerLat: 22.79, centerLng: 86.22` (2 dp). Confirm HTTP 400 with the precision error message.
2. Save a territory with `centerLat: 22.7915, centerLng: 86.2296` (4 dp). Confirm it saves successfully.

---

**ROOT CAUSE:** No precision check allowed low-accuracy coordinates to corrupt geofence definitions.
**FILES CHANGED:** `src/utils/validateCoordinatePrecision.js` (new), `territory.service.js`, `visitReport.service.js`.

---

## GAP 5 — Task 6: Reverse geocode on pin drag in territory editor

**Why this matters:**
When a territory manager drags a pin to set a precise building location, the address field currently stays empty or shows the old search result. The manager has to manually type the address, which introduces typos and mismatches between the stored address and the actual coordinates.

**File to change:**
Territory editor component.

---

**STEP G5A — Add reverse geocode call on marker dragend**

Find the Mappls marker drag handler. If it currently only captures coordinates:

```ts
// Current — captures lat/lng but does not fetch address
markerRef.current.on('dragend', (e) => {
  const { lat, lng } = e.target.getLngLat();
  form.setValue('centerLat', lat);
  form.setValue('centerLng', lng);
});
```

Update to also call the Mappls Reverse Geocode API:

```ts
markerRef.current.on('dragend', async (e) => {
  const { lat, lng } = e.target.getLngLat();

  // Update form coordinates immediately
  form.setValue('centerLat', parseFloat(lat.toFixed(6)));
  form.setValue('centerLng', parseFloat(lng.toFixed(6)));

  // Fetch the human-readable address for this exact point
  try {
    const response = await fetch(
      `https://apis.mappls.com/advancedmaps/v1/${process.env.NEXT_PUBLIC_MAPPLS_KEY}/rev_geocode?lat=${lat}&lng=${lng}`
    );
    const data = await response.json();
    const address = data?.results?.[0]?.formatted_address ?? '';
    if (address) {
      form.setValue('address', address);
    }
  } catch (err) {
    console.error('Reverse geocode failed:', err);
    // Non-fatal: coordinates are already saved, address is optional
  }
});
```

---

**STEP G5B — Verify**

1. Open territory editor. Drag the map pin to a specific building entrance.
2. Confirm `centerLat` and `centerLng` fields update immediately with 6 decimal places.
3. Confirm the `address` field populates with the correct street address within 1–2 seconds.
4. Confirm dragging to a different location updates all three fields correctly.

---

**ROOT CAUSE:** Dragend handler captured coordinates but did not reverse-geocode the address.
**FILES CHANGED:** Territory editor component.

---

## GAP 6 — Task 7B: Confirm GPS interval and distance filter

**Why this matters:**
If the GPS polling rate is still at the old value (commonly 30 seconds or 100 metres), the live map on the admin dashboard will update every 30 seconds — visible as the agent dot jumping rather than moving smoothly. The Redis 120-second TTL will cause agents to flicker offline and back online.

**File to check:**
`ffms_mobile/lib/services/location_service.dart`

---

**STEP G6A — Confirm LocationSettings values**

Find the `LocationSettings` or `LocationOptions` configuration. It must be:

```dart
const LocationSettings locationSettings = LocationSettings(
  accuracy: LocationAccuracy.bestForNavigation,
  distanceFilter: 5,    // emit only if moved 5 metres — filters GPS jitter
  // Android-specific time interval:
);

// Or for Android specifically:
AndroidSettings(
  accuracy: LocationAccuracy.bestForNavigation,
  distanceFilter: 5,
  intervalDuration: const Duration(milliseconds: 5000),
  foregroundNotificationConfig: const ForegroundNotificationConfig(
    notificationText: 'FieldTrack is tracking your location.',
    notificationTitle: 'FieldTrack — On Duty',
    enableWakeLock: true,
  ),
),
```

If the values differ, update them to match the above exactly.

---

**STEP G6B — Verify**

1. Run the app on a physical device (emulators give unreliable GPS timing).
2. Walk 10 metres. Confirm a location POST fires within 5 seconds.
3. Stand still for 30 seconds. Confirm no unnecessary pings are sent (distanceFilter prevents noise).
4. Check the admin dashboard live map. Confirm the agent dot moves within 5 seconds of the device moving.

---

**ROOT CAUSE:** Old polling interval too slow for real-time tracking requirements.
**FILES CHANGED:** `lib/services/location_service.dart`.

---

## GAP 7 — Task 7B: Offline location buffer

**Why this matters:**
Field staff operate in areas with poor connectivity — tunnels, basements, rural roads. Without an offline buffer, every ping that fails to POST is lost permanently. When the agent returns to connectivity, the map will show a jump between the last successful ping and the current position, making route history useless for that period.

**File to change:**
`ffms_mobile/lib/services/location_service.dart`

---

**STEP G7A — Add the offline queue**

Add these two functions to `location_service.dart`:

```dart
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

// Call this when a POST fails due to network error
Future<void> _queueFailedPing(Map<String, dynamic> payload) async {
  final prefs = await SharedPreferences.getInstance();
  final queue = prefs.getStringList('locationQueue') ?? [];
  queue.add(jsonEncode(payload));
  await prefs.setStringList('locationQueue', queue);
  debugPrint('locationQueue: stored ${queue.length} pending ping(s)');
}

// Call this when network is restored (app resume / connectivity change)
Future<void> drainLocationQueue() async {
  final prefs = await SharedPreferences.getInstance();
  final queue = prefs.getStringList('locationQueue') ?? [];
  if (queue.isEmpty) return;

  debugPrint('locationQueue: draining ${queue.length} pending ping(s)');
  final remaining = <String>[];

  for (final item in queue) {
    try {
      final payload = jsonDecode(item) as Map<String, dynamic>;
      await _postLocationToServer(payload); // your existing HTTP POST function
    } catch (e) {
      debugPrint('locationQueue: POST failed, keeping for next retry: $e');
      remaining.add(item);
      break; // still offline — stop draining, try again later
    }
  }

  await prefs.setStringList('locationQueue', remaining);
}
```

---

**STEP G7B — Wire into the location ping flow**

In your existing location POST function, wrap the HTTP call:

```dart
Future<void> sendLocationPing(Map<String, dynamic> payload) async {
  try {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/location'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: jsonEncode(payload),
    ).timeout(const Duration(seconds: 8));

    if (response.statusCode != 200 && response.statusCode != 201) {
      await _queueFailedPing(payload);
    }
  } catch (e) {
    // Network error — queue for retry
    debugPrint('locationPing: network error, queuing: $e');
    await _queueFailedPing(payload);
  }
}
```

---

**STEP G7C — Drain on app resume**

In `main.dart` or the top-level widget's `didChangeAppLifecycleState`:

```dart
@override
void didChangeAppLifecycleState(AppLifecycleState state) {
  if (state == AppLifecycleState.resumed) {
    LocationService.drainLocationQueue();
  }
}
```

---

**STEP G7D — Verify**

1. Enable airplane mode on the test device.
2. Move the device. Confirm pings are queued locally (check `SharedPreferences` `locationQueue` key via a debug print).
3. Disable airplane mode. Confirm the queue drains and all queued pings POST successfully.
4. Check backend logs: confirm no gap in location timestamps corresponding to the offline period.

---

**ROOT CAUSE:** No local buffer — failed pings were silently dropped.
**FILES CHANGED:** `lib/services/location_service.dart`, `lib/main.dart`.

---

## GAP 8 — Task 7B: Battery level in payload and schema

**Why this matters:**
Battery level is one of the most useful pieces of operational data for field managers. Seeing that an agent's device is at 8% battery lets a manager call them before they go offline rather than chasing a ghost dot on the map. Without it in the payload and schema, the data is lost.

**Files to change:**
`ffms_mobile/pubspec.yaml`, `lib/services/location_service.dart`, `FFMS_NANDINI/backend/prisma/schema.prisma`, location controller.

---

**STEP G8A — Confirm battery_plus is in pubspec.yaml**

```yaml
dependencies:
  battery_plus: ^6.0.0
```

Run `flutter pub get` if not already done.

---

**STEP G8B — Confirm batteryLevel is captured and sent**

In `location_service.dart`, find the payload construction. It must include:

```dart
import 'package:battery_plus/battery_plus.dart';

final Battery _battery = Battery();

// Inside the location ping builder:
final batteryLevel = await _battery.batteryLevel; // returns 0–100 int

final payload = {
  'lat': position.latitude,
  'lng': position.longitude,
  'speed': position.speed,
  'accuracy': position.accuracy,
  'timestamp': DateTime.now().toIso8601String(),
  'batteryLevel': batteryLevel,
};
```

If `batteryLevel` is missing from the payload map, add it now.

---

**STEP G8C — Confirm schema has batteryLevel field**

Open `prisma/schema.prisma`. Find the `LocationLog` model. Confirm:

```prisma
model LocationLog {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  latitude       Float
  longitude      Float
  speed          Float?
  accuracy       Float?
  timestamp      DateTime
  batteryLevel   Int?     // ← this field must exist
  createdAt      DateTime @default(now())
}
```

If `batteryLevel` is missing, add it and run:

```bash
npx prisma migrate dev --name add_battery_level_to_location_log
```

---

**STEP G8D — Confirm controller stores batteryLevel**

In the location controller, find where the payload is read from `req.body`. Confirm `batteryLevel` is extracted and passed to the service:

```js
const { lat, lng, speed, accuracy, timestamp, batteryLevel } = req.body;
await locationService.saveLocationLog(
  req.user.id, req.user.orgId,
  lat, lng, speed, accuracy, timestamp, batteryLevel
);
```

---

**STEP G8E — Verify**

1. Send a GPS ping from the mobile app.
2. Check the DB: `SELECT "batteryLevel", "timestamp" FROM "LocationLog" ORDER BY "timestamp" DESC LIMIT 5;`
3. Confirm `batteryLevel` is a number between 0 and 100, not `null`.
4. Check the admin dashboard — if it has a battery indicator, confirm it shows the correct value.

---

**ROOT CAUSE:** Battery capture not wired end-to-end through payload → controller → schema.
**FILES CHANGED:** `pubspec.yaml`, `location_service.dart`, `schema.prisma`, location controller.

---

## GAP 9 — Task 7C: Dashboard greeting simplification

**Why this matters:**
This is a small change but it removes unnecessary computation and eliminates the risk of a wrong greeting (e.g. showing "Good morning" at 11:59 PM if the time zone is misread). Simple is correct.

**File to change:**
`ffms_mobile/lib/screens/dashboard_screen.dart`

---

**STEP G9A — Remove time-based greeting logic**

Search for `DateTime.now().hour` in `dashboard_screen.dart`. Find code that looks like:

```dart
// Remove this entire block:
String getGreeting() {
  final hour = DateTime.now().hour;
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
```

Replace the greeting widget with:

```dart
Text(
  'Hello, ${user.displayName ?? user.name}',
  style: const TextStyle(
    fontFamily: 'PlusJakartaSans',
    fontSize: 24,
    fontWeight: FontWeight.w700,
    color: Color(0xFF191C1E),
    height: 1.33,
  ),
)
```

---

**STEP G9B — Verify**

Open the app at 7 AM, 2 PM, and 10 PM. Confirm the greeting always shows `"Hello, [Name]"` regardless of time.

---

**ROOT CAUSE:** Time-based greeting adds computation on every rebuild with no user benefit.
**FILES CHANGED:** `lib/screens/dashboard_screen.dart`.

---

## GAP 10 — Task 7C: Shimmer loading placeholders

**Why this matters:**
A blank white screen during API load reads as broken to field staff. A shimmer skeleton communicates that content is loading and gives the app a polished, responsive feel. It also allows you to serve cached stale data immediately and refresh in the background, cutting perceived load time to near-zero.

**Files to change:**
`pubspec.yaml`, `lib/screens/dashboard_screen.dart`, `lib/screens/attendance_screen.dart`.

---

**STEP G10A — Add the shimmer package**

In `pubspec.yaml`:

```yaml
dependencies:
  shimmer: ^3.0.0
  shared_preferences: ^2.2.0   # for startup cache
```

Run `flutter pub get`.

---

**STEP G10B — Add shimmer to dashboard**

In `dashboard_screen.dart`, wrap the main content with a loading state:

```dart
import 'package:shimmer/shimmer.dart';

// In the build method:
if (isLoading) {
  return _buildShimmerSkeleton();
}
return _buildDashboardContent();

Widget _buildShimmerSkeleton() {
  return Padding(
    padding: const EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Name placeholder
        Shimmer.fromColors(
          baseColor: const Color(0xFFE0E3E5),
          highlightColor: const Color(0xFFF2F4F6),
          child: Container(
            width: 180,
            height: 28,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        const SizedBox(height: 24),
        // Stats card placeholder row
        Row(
          children: List.generate(3, (_) =>
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 8),
                child: Shimmer.fromColors(
                  baseColor: const Color(0xFFE0E3E5),
                  highlightColor: const Color(0xFFF2F4F6),
                  child: Container(
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        // Task list placeholder cards
        ...List.generate(3, (_) =>
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Shimmer.fromColors(
              baseColor: const Color(0xFFE0E3E5),
              highlightColor: const Color(0xFFF2F4F6),
              child: Container(
                height: 72,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );
}
```

---

**STEP G10C — Cache user profile and attendance state on startup**

In `main.dart` or the dashboard provider, load from cache first:

```dart
Future<void> loadDashboardWithCache() async {
  final prefs = await SharedPreferences.getInstance();

  // Load stale data immediately so UI renders without waiting
  final cachedUser = prefs.getString('cachedUserProfile');
  final cachedAttendance = prefs.getString('cachedAttendanceState');

  if (cachedUser != null) {
    setState(() {
      user = UserModel.fromJson(jsonDecode(cachedUser));
      attendance = AttendanceState.fromJson(jsonDecode(cachedAttendance ?? '{}'));
      isLoading = false; // show real content immediately from cache
    });
  }

  // Then fetch fresh data in the background
  try {
    final freshUser = await apiService.getProfile();
    final freshAttendance = await apiService.getTodayAttendance();

    await prefs.setString('cachedUserProfile', jsonEncode(freshUser.toJson()));
    await prefs.setString('cachedAttendanceState', jsonEncode(freshAttendance.toJson()));

    setState(() {
      user = freshUser;
      attendance = freshAttendance;
    });
  } catch (e) {
    debugPrint('Dashboard refresh failed, showing cached data: $e');
    // Non-fatal: stale data is better than a blank screen
  }
}
```

---

**STEP G10D — Verify**

1. Fresh install: app loads, shimmer appears for 1–2 seconds, then real content fades in.
2. Second launch: cached data renders immediately (no shimmer), then silently refreshes.
3. Offline launch: cached data renders. No crash. A small banner can say "Last updated [time]" if desired.

---

**ROOT CAUSE:** No loading state UI and no startup cache — blank screen during API calls.
**FILES CHANGED:** `pubspec.yaml`, `dashboard_screen.dart`, `main.dart`.

---

## GAP 11 — Task 8: Build GET /api/v1/location/live endpoint

**Why this matters:**
Without this endpoint, the admin dashboard's real-time agent dots are still querying the main `LocationLog` PostgreSQL table. This defeats the entire Redis architecture from Risk 4. The Socket.IO events fire immediately, but if the dashboard ever polls for current location (on page load, on agent select, on reconnect), it goes to the DB and gets stale data.

**File to change:**
`src/controllers/location.controller.js` (or the route file — wherever location routes are defined).

---

**STEP G11A — Add the endpoint**

In the location router file, add:

```js
const { redisClient } = require('../config/redis');
const { prisma } = require('../config/db');

// GET /api/v1/location/live?userId=:targetUserId
router.get('/location/live', authMiddleware, async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.query;

    if (!targetUserId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    // Security: confirm the target user belongs to the requesting admin's org
    const targetUser = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        organizationId: req.user.organizationId,
      },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found in your organization' });
    }

    // 1. Try Redis first — sub-millisecond, < 2 minutes fresh
    const cached = await redisClient.get(`user:${targetUserId}:location`);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.json({
        ...parsed,
        online: true,
        source: 'live',
      });
    }

    // 2. Redis miss — agent is offline or TTL expired, fall back to DB
    const lastLog = await prisma.locationLog.findFirst({
      where: {
        userId: targetUserId,
        organizationId: req.user.organizationId,
      },
      orderBy: { timestamp: 'desc' },
      select: {
        latitude: true,
        longitude: true,
        speed: true,
        batteryLevel: true,
        timestamp: true,
      },
    });

    if (!lastLog) {
      return res.json({ online: false, lastSeen: null, source: 'db' });
    }

    return res.json({
      lat: lastLog.latitude,
      lng: lastLog.longitude,
      speed: lastLog.speed,
      batteryLevel: lastLog.batteryLevel,
      timestamp: lastLog.timestamp,
      online: false,
      lastSeen: lastLog.timestamp,
      source: 'db',
    });

  } catch (err) {
    next(err);
  }
});
```

---

**STEP G11B — Update the admin dashboard to use this endpoint**

In the admin dashboard frontend, find where agent live locations are fetched. Replace the old DB-backed location query with a call to the new endpoint:

```ts
// On agent select or dashboard load:
async function fetchLiveLocation(agentId: string) {
  const res = await fetch(`/api/v1/location/live?userId=${agentId}`, {
    credentials: 'include',
  });
  const data = await res.json();

  if (data.online) {
    // Agent is live — update map dot to data.lat, data.lng
    updateAgentDot(agentId, data.lat, data.lng, 'online');
  } else {
    // Agent is offline — show grey dot, show lastSeen timestamp
    updateAgentDot(agentId, data.lat, data.lng, 'offline');
    showLastSeen(agentId, data.lastSeen);
  }
}
```

---

**STEP G11C — Verify**

1. Agent A is active on a device — sending pings. Call `GET /api/v1/location/live?userId=<A.id>`. Confirm `{ online: true, source: 'live', lat: ..., lng: ... }` is returned.
2. Stop Agent A's pings. Wait 2 minutes 10 seconds (TTL expires). Call the endpoint again. Confirm `{ online: false, source: 'db', lastSeen: <timestamp> }`.
3. Admin dashboard loads with Agent A selected. Confirm the map dot position matches what the live endpoint returns.
4. Agent B has never sent a ping. Call the endpoint. Confirm `{ online: false, lastSeen: null }`.

---

**ROOT CAUSE:** No Redis-first live location endpoint — dashboard polled stale DB data on load and reconnect.
**FILES CHANGED:** Location router/controller, admin dashboard frontend.

---

## Final Checklist

Work through this in order. Check each item off only after running the verify steps.

```
CRITICAL RISKS
  [ ] Risk 1 — Backfill sessionNumber = 1 for all existing Attendance rows
  [ ] Risk 2 — Build and wire parseCoordinate.js (all 5 formats)
  [ ] Risk 3 — Add flutter_foreground_task, run 15-min background GPS test
  [ ] Risk 4 — Replace fire-and-forget with BullMQ locationWrite job (3 retries)

GAPS
  [ ] Gap 1  — recalculateDailyStatus sums both sessions; test 2h + 3h = HALF_DAY
  [ ] Gap 2  — panTo zero-coordinate guard; confirm zoom not reset per tick
  [ ] Gap 3  — Play button + slider + counter disabled when logs.length === 0
  [ ] Gap 4  — validateCoordinatePrecision: reject < 4 decimal places
  [ ] Gap 5  — Reverse geocode on marker dragend in territory editor
  [ ] Gap 6  — GPS distanceFilter: 5, interval: 5000 confirmed in location_service.dart
  [ ] Gap 7  — Offline location buffer: SharedPreferences queue + drain on resume
  [ ] Gap 8  — batteryLevel in POST payload + LocationLog schema + migration
  [ ] Gap 9  — Dashboard greeting: Text('Hello, ${user.name}') — no hour logic
  [ ] Gap 10 — Shimmer placeholders + SharedPreferences startup cache
  [ ] Gap 11 — GET /api/v1/location/live endpoint (Redis-first, DB fallback)
```

---

*Share the next code scan when all 15 items are checked off.*
