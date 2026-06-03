# FFMS Monorepo: Production Readiness TODO List

This document outlines the pending logic, feature enhancements, and QA checks required to make the Field Force Management System (FFMS) fully functional and production-ready across the Backend, Frontend Dashboard, and Mobile App.

## 📱 Mobile App (Flutter)
- [ ] **Background Location Tracking (Critical):** Implement a persistent foreground service (e.g., using `flutter_background_service`) so that `geolocator` can continuously track agents' live locations even when the app is minimized or killed by the OS.
- [ ] **Offline Synchronization (Critical):** Use `sqflite` or `hive` to cache Tasks, Visit Reports, and Location telemetry when offline. Implement a background queue to push this data to the server once the network is restored.
- [ ] **Map Token Refresh Logic:** Ensure the Mappls map token is fetched robustly and refreshed if it expires during an active session, preventing map rendering failures.
- [ ] **Push Notification Setup (FCM):** Integrate Firebase Cloud Messaging (FCM) so the app can receive notifications via Apple Push Notification service (APNs) and Firebase when completely terminated (currently relies on active Socket connection).
- [ ] **Camera Quality Optimization:** Optimize the `image_picker` logic in `submit_report_screen.dart` and `apply_leave_screen.dart` to strictly limit image resolution before Base64 encoding to prevent heavy payload failures over 2G/3G networks.

## 🖥️ Web Dashboard (Next.js)
- [ ] **Live Map Interpolation:** Update `LiveMap.tsx` to use smooth interpolation (animations) for marker movements instead of snapping instantly to new coordinates when socket telemetry arrives.
- [ ] **Role-Based Access Control (RBAC):** Ensure that the frontend tightly locks down administrative views (e.g., `GeofenceMap`, User Management) based on the user's JWT role.
- [ ] **Export Loading States:** Add visual loading spinners and toast notifications when an Admin clicks the "Export CSV/PDF" buttons, as large exports can take a few seconds to stream from the backend.
- [ ] **Global Error Boundary:** Wrap the Next.js app in a global error boundary to gracefully catch any React rendering errors without crashing the entire dashboard.

## ⚙️ Backend API (Node.js/Express)
- [ ] **Socket Authentication Strengthening:** Verify that the `socket.io` middleware actively disconnects any clients that fail to provide a valid JWT upon connection (currently, tokens are passed but strict expiration handling should be enforced).
- [ ] **Rate Limiting Refinement:** Fine-tune the `express-rate-limit` middleware for the telemetry endpoint (`/map/telemetry`), as continuous background GPS pings from many agents might trigger false-positive rate limits.
- [ ] **Geofence Auto-Checkout:** Implement a cron job (using BullMQ) to automatically "Check Out" agents or send anomaly alerts if they leave their assigned geofence for more than X minutes without an active task.
- [ ] **Image Cloud Storage Migration:** Refactor the Base64 image payload logic in `submitVisitReport` and `applyLeave` to stream directly to Cloudinary (or AWS S3) via `multer`, rather than loading massive Base64 strings into Node's memory.

## 🔐 DevOps & Deployment
- [ ] **Production Environment Variables:** Set up production `.env` files for the backend server and frontend deployments, ensuring all DB strings, JWT secrets, and Mappls API keys are secured.
- [ ] **Mobile CI/CD:** Set up Fastlane or GitHub Actions to automatically build and sign the Android `.apk` / `.aab` and iOS `.ipa` on successful pushes to the `main` branch.
