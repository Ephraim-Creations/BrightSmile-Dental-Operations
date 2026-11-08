# 🦷 BrightSmile Dental Clinic & Appointment Management System

A full-stack, enterprise-grade clinical web application and appointment management system designed for modern dental practices. Built with a high-trust, clinical aesthetic (teal, cyan, soft navy, clean typography, modular card layouts) replicating premier dental healthcare platforms.

---

## 🌟 Key Features

### 1. Patient-Facing Web Experience
- **Top Utility Bar:** Global announcement badge ("*New Patient Special: Get 15% Off on Your First Visit!*"), clinic address, business hours, and click-to-call phone number.
- **Hero Section:** High-converting patient banner with dual call-to-actions ("Book Appointment" and "Our Services"), patient photo in modern clinical operatory, verified 4.9-star review badge, and floating feature checklist.
- **Value Proposition Cards:** 5 modular feature cards (*Comprehensive Care*, *Advanced Technology*, *Expert Dentists*, *Patient Comfort*, *Flexible Scheduling*).
- **Interactive Services Grid:** 6 core dental services (*General Dentistry*, *Cosmetic Dentistry*, *Dental Implants*, *Orthodontics*, *Pediatric Dentistry*, *Emergency Care*) with high-resolution imagery, floating icon badges, and one-click booking pre-selection.
- **Clinical Excellence & About Section:** Facility showcase, clinic stats counter (15+ Years Experience, 20+ Expert Dentists, 5K+ Happy Patients, 4.9 Rating), and clinical safety protocols.
- **Social Proof & Testimonials:** Patient review carousel with 5-star ratings, verified badges, and quotes.
- **Pre-Footer CTA Banner:** Cyan/Teal gradient banner prompting appointment bookings.
- **Comprehensive Footer:** Multi-column layout with quick links, service catalog, contact hours, newsletter subscription, and HIPAA compliance badges.
- **Sticky Mobile Bar:** Persistent bottom action bar for mobile viewports featuring **Call Now** and **Book Online** buttons.
- **Booking Flow with Optimistic UI:** TanStack Query mutation with client-side validation, appointment scheduling, and celebration feedback with confirmation codes.

---

### 2. Admin Dashboard & Strict Authentication
- **Admin Management at `/admin`:** Protected, responsive management console with sidebar navigation.
- **Strict Identity Enforcement:**
  - Administrative login is **strictly restricted to `ephraimcreations254@gmail.com`**.
  - The Express backend **physically rejects** OTP requests, login attempts, or access requests from any other email address with an HTTP `403 Forbidden` security response.
  - Sends a secure 6-digit OTP code with a 10-minute expiry via **Nodemailer**.
  - Issues HTTP-only JWT session cookies upon OTP verification.
- **Appointment Management:**
  - Real-time data table powered by TanStack Query.
  - Status management: One-click actions to **Confirm**, **Complete**, or **Cancel** appointments.
  - Multi-criteria search (patient name, phone, service, email) and status filtering (*All, Pending, Confirmed, Completed, Cancelled*).
  - Detailed modal view with patient clinical notes.
- **Services Content Management:**
  - Full CRUD: Add new dental treatments, edit existing titles/descriptions/icons/images, toggle publication (*Active/Draft*), or delete.
- **Clinic Settings Editor:**
  - Real-time editing of clinic name, phone, address, email, operating hours, and the global announcement banner.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TanStack Router (declarative routing), TanStack Query v5 (state & cache management), Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend** | Express.js, Node.js (ESM), TypeScript |
| **Database** | SQLite with `better-sqlite3` (WAL mode enabled for durability and performance) |
| **Authentication** | JSON Web Tokens (JWT) in HTTP-only cookies + 6-digit OTP email verification via Nodemailer |
| **Tooling** | Vite, tsx, PostCSS, Autoprefixer, Concurrently |

---

## 🗄️ SQLite Database Schema

```sql
-- Users (Admin)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  otp_code TEXT,
  otp_expires_at INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Patient Appointments
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_requested TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Dental Services
CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_reference TEXT NOT NULL,
  image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Clinic Global Settings
CREATE TABLE settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  working_hours TEXT NOT NULL,
  email TEXT NOT NULL,
  announcement TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18.0.0` or later (tested on Node v22)
- npm `v9.0.0` or later

### Quick Start (Run Both Frontend & Backend)
From the root folder:

```bash
# 1. Install dependencies (root, backend, and frontend)
npm install
cd server && npm install
cd ../client && npm install
cd ..

# 2. Seed database with default clinic data & services
npm run seed

# 3. Start development servers concurrently
npm run dev
```

The frontend will run at **`http://localhost:5173`** and the backend API at **`http://localhost:5000`**.

---

## 🔒 Administrative Authentication Guide

1. Navigate to **`http://localhost:8000/admin`** (or click **Admin Portal** in the top utility bar or footer).
2. Enter your credentials:
   - **Email:** `ephraimcreations254@gmail.com`
   - **Initial Password:** `12345678`
   > *Note: Access is strictly gated on the backend exclusively to `ephraimcreations254@gmail.com`. Any other email is physically rejected with HTTP 403 Forbidden.*
3. Click **Sign In as Admin** to immediately access the management dashboard.
4. **Changing your password:**
   - Inside the dashboard, go to **Clinic Settings**.
   - Use the **Administrator Password & Security** panel to enter your current password and your new password.
   - Click **Change Password** to update your password in the SQLite database.

---

## 📡 API Reference

### Authentication
- `POST /api/auth/request-verification` — Checks email strictly against `ephraimcreations254@gmail.com`, generates OTP, and dispatches email via Nodemailer.
- `POST /api/auth/verify` — Validates OTP, issues HTTP-only JWT cookie & response token.
- `GET /api/auth/me` — Protected admin endpoint to verify the current session.
- `POST /api/auth/logout` — Clears authentication cookie.

### Appointments
- `POST /api/appointments` — Public patient booking form submission.
- `GET /api/appointments` — Protected admin endpoint to fetch appointments (supports `?status=` and `?search=`).
- `GET /api/appointments/stats` — Protected admin summary statistics (total, pending, confirmed, completed, cancelled).
- `PUT /api/appointments/:id` — Protected admin endpoint to update status or appointment details.
- `DELETE /api/appointments/:id` — Protected admin endpoint to delete an appointment.

### Services & Settings
- `GET /api/services` — Public endpoint to populate the patient-facing grid.
- `POST /api/services` — Protected admin endpoint to create a service.
- `PUT /api/services/:id` — Protected admin endpoint to update a service.
- `DELETE /api/services/:id` — Protected admin endpoint to delete a service.
- `GET /api/settings` — Public endpoint for clinic contact information and hours.
- `PUT /api/settings` — Protected admin endpoint to update clinic settings.

---

## 🧪 Testing

Run the automated end-to-end test suite:

```bash
npm test
```
Verifies all public routes, booking flows, strict security rejections, OTP generation, token issuance, and protected operations.
