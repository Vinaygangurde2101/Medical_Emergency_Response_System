# SMART EMERGENCY MEDICAL ASSISTANCE SYSTEM (MERS) - PROJECT STATUS

**Inspection Date**: September 10, 2026  
**System Architecture**: Node.js/Express Backend + React/Vite Frontend + MongoDB (with Demo fallback) + Google Gemini AI  

---

## 1. Executive Summary & Codebase Audit

A thorough inspection of the repository (`backend` and `frontend`) has been conducted. The current codebase contains initial setup for authentication, patient profile viewing, AI medical report analysis, and a basic emergency QR endpoint. However, major emergency workflows, security controls, role-based authorization, hospital verification, blood bank finder, access logging, and anonymized emergency family notification features are missing or require structural refactoring to satisfy MERS security requirements.

---

## 2. Status Breakdown by Module

### 🟢 IMPLEMENTED (Working & Preserved)
- **Patient Authentication**: Registration & Login routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`) with JWT token generation and bcrypt password hashing.
- **In-Memory Demo Fallback**: Graceful fallback when MongoDB is offline (`global.isDbConnected` flag).
- **AI Medical Report Analyzer**: `/api/analyze` using Google `@google/genai` (Gemini 2.5 Flash model) with multi-language output (`en`, `hi`, `mr`), extracting key findings, recommendations, and disclaimer from uploaded PDFs/images.
- **Frontend Dashboard Shell**: React layout with Sidebar, TopNavbar, SummaryCard, ProgressCard, and QRCard components.
- **QR Code Generation**: Patient profile creation auto-generates a unique `qrId` token via `nanoid(10)`.

---

### 🟡 PARTIALLY IMPLEMENTED (Needs Refactoring & Expansion)
- **Emergency QR Scan Page (`EmergencyView.jsx` & `/api/emergency/:qrId`)**:
  - *Current State*: Displays blood group, allergies, and raw family phone number to anyone who scans the QR.
  - *Defect*: **VIOLATES SECURITY REQUIREMENT 2**. Public scan must NOT reveal blood group, allergies, or private family phone numbers to random scanners.
  - *Action Needed*: Convert public view into a minimal responder screen with "CONTACT FAMILY" (anonymized gateway), "CALL 108", "USE FIRST-AID ASSISTANT", "FIND BLOOD BANK", and "VERIFIED HOSPITAL LOGIN".
- **Patient Profile Management (`Profile.jsx` & `/api/patient/update`)**:
  - *Current State*: Can update blood group and allergies chips.
  - *Defect*: Lacks support for diseases/medical conditions, daily medications editing, emergency contacts registration/removal, medical history summary, and privacy settings.
- **AI First-Aid Assistant (`AIAssistant.jsx`)**:
  - *Current State*: Floating widget present on UI with mock preset buttons ("CPR Help", "Bleeding").
  - *Defect*: Uses static mock responses instead of connecting to backend AI First-Aid service with structured emergency instructions and life-safety warnings.

---

### 🔴 MISSING MODULES (To Be Implemented)
1. **Hospital Portal & Verified Staff Access (No OTP Required)**:
   - Hospital registration and hospital staff login (`/api/hospital/login`).
   - Hospital dashboard for scanning patient QR and viewing full medical record immediately upon verifying hospital staff role (`HOSPITAL_STAFF`).
2. **Anonymized Family Contact Intermediary Gateway**:
   - Backend endpoint (`/api/emergency/contact-family`) that triggers SMS/notification to emergency contacts with emergency geolocation without revealing raw phone numbers on public QR page.
3. **Blood Bank Availability Finder**:
   - Location-based blood bank inventory search (`/api/blood-banks`).
   - Filters for blood group, distance radius, and real-time/demo availability status.
4. **108 Emergency Ambulance Module**:
   - Dedicated `tel:108` action button with live geolocation display and emergency dispatch info.
5. **Access Logging & Audit Trail**:
   - `AccessLog` collection storing viewer IP/role, hospital ID, access type (Public Responder vs Authenticated Verified Hospital), timestamp, and result.
   - Patient Access History UI in Patient Dashboard for complete transparency.
6. **Role-Based Access Control (RBAC)**:
   - Enforcing roles (`PATIENT`, `FIRST_RESPONDER`, `HOSPITAL_STAFF`, `ADMIN`) on backend API endpoints.
7. **Admin Dashboard**:
   - System overview stats, manage users, hospital verification toggles, emergency events, access logs, blood bank inventory.

---

### 🚨 SECURITY CONCERNS & CRITICAL DEFECTS
1. **Data Leakage in Public QR Scan**: `/api/emergency/:qrId` currently exposes patient name, blood group, allergies, and personal phone numbers publicly. Must be stripped for non-authenticated public scans.
2. **Missing Authorization Middleware**: `/api/patient/update` does not check user roles or verify if patient is updating their own account.
3. **Hardcoded API URLs in Frontend**: `ReportAnalyzer.jsx` directly calls `http://localhost:5000/api/analyze` instead of using standard Axios client configured with environment variable support (`VITE_API_URL`).

---

## 3. Recommended Architectural Integration Strategy

```
                          [ QR SCAN (Public) ]
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
       [ Responder Access ]              [ Verified Hospital Access ]
       • Patient ID Only                 • Staff Credentials Verification
       • Contact Family Gateway           • Role & Hospital Approval Check
       • Call 108 Button                            │
       • First-Aid AI Assistant                     ▼
       • Blood Bank Finder                [ Full Medical Profile ]
                                          • Allergies & Blood Group
                                          • Medical History & Reports
                                          • AI Report Summaries
                                          • Log Audit Event
```
