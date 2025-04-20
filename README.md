# README – Recovery Dashboard Web Application

## 🧠 Overview
**Recovery Dashboard** is a full-stack web application that empowers patients to track their recovery journey. Designed with accessibility, security, and clarity in mind, it enables users to log physical and mental health metrics, visualize progress through interactive charts, and manage treatments and appointments.

Built using **Next.js**, **TypeScript**, **TailwindCSS**, and **Supabase**, the app is deployed seamlessly on **Vercel**.

---

## 🚀 Live Demo
[Click to View the Hosted Site](https://health-track-rust.vercel.app/)

---

## 📅 Features

- ✅ User authentication via Supabase Auth
- 📊 Dashboard showing:
  - Pain level
  - Mental wellness
  - Mobility score
  - Active treatments
  - Recovery progress graph
- 📆 Appointment reminder panel
- 📂 Recovery Log form
- 🧬 Profile & treatments management
- 🛡️ RLS (Row-Level Security) protected backend
- 🌙 Accessible, responsive UI (dyslexia-friendly & contrast-friendly)

---

## 🧰 Tech Stack

| Layer     | Tools / Frameworks                                  |
|-----------|------------------------------------------------------|
| Frontend  | Next.js, React, TypeScript, TailwindCSS, ShadCN UI, lenis |
| Backend   | Supabase (PostgreSQL, Auth, RLS, Storage)           |
| Design    | Figma, Custom Components                            |
| Deployment| Vercel                                               |

---

## 🧱 Database Design & DBMS Concepts

### 1. Row-Level Security (RLS)
- Enforced user-specific access with `auth.uid()` on all major tables.
- Used `USING` and `WITH CHECK` for secure `SELECT`, `INSERT`, and `UPDATE` operations.

### 2. Triggers
- Created a `handle_new_user()` trigger on `auth.users` to auto-insert a row into the `patients` table on user signup.

### 3. Normalization
- Designed the database up to **3NF** across tables: `patients`, `recoverylogs`, `treatments`, `appointments`, `healthcareproviders`.

### 4. Auth-Data Binding
- Linked every table to `auth.users` via `user_id` foreign key for contextual scoping.

### 5. Secure Insert & Logging
- Used Supabase RLS policies to ensure users can only log or update their own data.
- Metrics are saved and retrieved with patient-specific filters.

### 6. Advanced Querying
- Recovery trends generated using `select`, `order by date`, and `limit` operations.
- Appointments and logs sorted chronologically with fallback logic.

### 7. Full-Stack Type Safety
- Mapped Supabase tables to TypeScript interfaces to prevent runtime errors.

---

## ⚠️ Problems Faced & Solutions

| Problem | Solution |
|--------|----------|
| **Blocked insertions due to RLS** | Wrote proper RLS policies per table with `auth.uid()` filtering |
| **Missing patient record after signup** | Added trigger to auto-create `patients` row on user creation |
| **TypeScript error on `created_at`** | Explicitly selected `created_at` and typed response correctly |
| **Vite + Lenis build failure** | Replaced Lenis with native `scroll-behavior: smooth` CSS |
| **Dummy data leakage** | Cleaned dummy entries and ensured all access is scoped via RLS |
| **UI lacked visual impact** | Added testimonial section, new layout, and hero imagery |

---

## 🧪 Testing & Deployment

- ✅ Deployed on [Vercel](https://vercel.com)
- 🔐 Supabase RLS manually tested via Postman
- 💻 UI tested across Chrome, Firefox, Safari
- 🧪 Daily logs tested for real-time update and retrieval

---

## 🚀 Future Improvements

- Add role for healthcare providers to monitor patients
- Integrate wearable health data (Fitbit, Apple Health)
- Enable email/SMS-based medication and appointment reminders
- Add multilingual and dark mode support

---
## 🙌 Acknowledgments

- Supabase
- Lucide Icons
- Next.js
- shadcn ui
- lenis

---

## 💬 Feedback
Questions, feedback, or suggestions? Open an issue or PR. Your contribution is welcome!

