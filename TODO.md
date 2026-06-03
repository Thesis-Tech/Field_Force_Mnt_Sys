# Field Force Management System - TODO & Pending Issues

This document tracks the pending issues, broken logic, and features required to achieve a fully functional application across the Mobile App, Backend, and Frontend Monorepo.

## *Pending Issues / Need to Resolve*

### 1. Authentication & Session Management
- [ ] Fix frequent login/logout issues.
- [ ] Improve authentication reliability across devices.
- [ ] Review current JWT/session handling implementation for token expiration edge cases.

### 2. Dashboard Issues
- [ ] Fix Insight Overview page returning 404 error.
- [ ] Verify and fix Insight Attendance Analytics.
- [ ] Verify and fix Insight Expense Audit.

### 3. Attendance Management
- [ ] Update attendance calculation logic:
  - [ ] Less than 4 hours → Absent
  - [ ] 4 to 7 hours → Half Day
  - [ ] More than 7 hours → Present
- [ ] Add working hour calculation display to the UI.
- [ ] Add attendance filters (Date, Status, Employee).
- [ ] Improve attendance UI/UX on web and mobile.
- [ ] Add attendance graph/analytics for individual employees.

### 4. Notification Module
- [ ] Fix outgoing notifications not working properly.
- [ ] Fix broadcast notification sending failure.
- [ ] Fix simulated incoming notification events not working.
- [ ] Verify notification popup functionality (Toast/Snackbars).

### 5. Leave Management
- [ ] Add "View Report" option in leave applications.
- [ ] Improve leave action/report workflow.

### 6. Employee Feedback
- [ ] Make employee feedback anonymous.

### 7. UI/UX Improvements
- [ ] Add skeleton loading across all pages (Web and Mobile).
- [ ] Improve dashboard loading experience (Lazy loading, better state management).
- [ ] Improve attendance page UI.

### 8. Team Hierarchy
- [ ] Add organizational hierarchy structure mapping.
- [ ] Add expand/collapse team view in the UI.
- [ ] Ensure managers can view their entire reporting structure.

### 9. Reports & Export
- [ ] Generate CSV export functionality for tables (Attendance, Expenses, Visits, etc.).

### 10. Payroll Policy Automation
- [ ] Implement late attendance policy:
  - [ ] If an employee is late for 3 consecutive days, deduct 2.5-day salary.
- [ ] Add automated late-arrival tracking.
