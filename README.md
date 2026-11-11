# 🏨 LuxuryStay Hospitality — Enterprise Hotel Management System
> **Aptech eProject**: LuxuryStay Hospitality MERN Enterprise Hotel Management System  
> **Brand Design System**: Luxury Teal (`#0D9488`) & Crisp White (`#FFFFFF`) with Live Theme Studio Customization  
> **Design Inspiration**: [Pearl Continental Hotels & Resorts (PC Hotels)](https://www.pchotels.com/)  
> **Architecture**: Full-Stack MERN (MongoDB 4.4+ / Atlas, Express 5, React 19, Node.js 24)

---

## 🌟 Project Overview

**LuxuryStay Hospitality** is an enterprise-grade full-stack MERN Hotel Management System built for luxury multi-property hospitality networks. The system features:

- **6 Distinct Luxury Properties across Pakistan**: Karachi, Lahore, Islamabad, Bhurban, Gwadar, and Malam Jabba.
- **Real-Time Room Availability Engine**: Server-side collision detection preventing double-booking and room overlap conflicts.
- **Dynamic Pricing & Transparent Tax Breakdown**: Nights × Base rate - promo discounts + 13% GST & service charges in PKR.
- **Promo Code Engine**: Live server-side validation (`WEEKEND20`, `NORTH25`, `BIZFLAT5K`, `HONEYMOON15`).
- **Express QR-Code Self-Check-In**: Secure mobile scanning for arrival at reception.
- **Downloadable PDF Tax Invoices**: Automatic generation of branded folios via PDFKit.
- **Centralized Live Theme Studio**: Change primary, secondary, and background palettes live with dynamic high-contrast text adaptation across the entire guest site and admin portal. Default brand palette: **Luxury Teal (`#0D9488`) & Crisp White (`#FFFFFF`)**.
- **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for Administrator, Manager, Receptionist, Housekeeping, Maintenance, Kitchen, and Registered Guests.

---

## 💻 System Prerequisites (Requirements)

Before running the project on any machine (Examiner / Evaluator / Developer), ensure the following software is installed:

| Component | Required Version | Purpose |
|---|---|---|
| **Node.js** | `v18.0.0` or higher (tested on `v24.x`) | JavaScript runtime for backend API and frontend bundling |
| **npm** | `v9.0.0` or higher | Package manager for dependency resolution |
| **MongoDB** | `v4.4` or higher (Local) **OR** MongoDB Atlas (Cloud) | Document database engine |
| **Modern Web Browser** | Chrome, Edge, Firefox, or Safari | Guest and Admin interfaces |

---

## 🚀 Quick Start Guide (How to Run / Open the Project)

Follow these 4 simple steps to open and evaluate the complete project on any computer:

### Step 1: Start MongoDB Database

You can run the project using either **Local MongoDB** or **MongoDB Atlas Cloud**:

#### Option A: Local MongoDB (Recommended for offline evaluation)
If MongoDB is installed locally on your system, start the daemon:

```bash
# Windows Command Prompt / PowerShell:
mongod --dbpath "C:\mongodb4\data" --port 27017

# Or if installed as a Windows Service:
net start MongoDB
```

> **Note**: Verify MongoDB is listening on `127.0.0.1:27017`.

#### Option B: MongoDB Atlas (Cloud)
If you prefer cloud database hosting, obtain your Atlas connection string:
```
mongodb+srv://<username>:<password>@cluster0.mongodb.net/hotel_db?retryWrites=true&w=majority
```

---

### Step 2: Environment Configuration (`.env`)

Verify or create the environment configuration files:

#### 1. Backend Environment: `backend/.env`
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/hotel_management
# (Or use your Atlas URI: mongodb+srv://<user>:<pass>@cluster0.mongodb.net/hotel_db)

JWT_SECRET=super_secret_jwt_key_luxurystay_2026
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_luxurystay_2026
JWT_EXPIRES_IN=1d

EMAIL_USER=reservations@theluxurystay.com
EMAIL_PASS=your_email_app_password

ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### 2. Frontend Environment: `frontend/.env`
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SERVER_URL=http://localhost:5001
```

---

### Step 3: Seed Database with Demo Data

Before opening the site for the first time, populate the database with 6 luxury properties, 24 rooms, 6 5-star hotel services, special offer packages, guest reviews, and staff accounts:

```bash
npm run seed
```

*This command automatically initializes:*
- 6 Luxury Hotels (Karachi, Lahore, Islamabad, Bhurban, Gwadar, Malam Jabba)
- 24 Dedicated Property Rooms (Standard, Deluxe, Executive Suite, Presidential Suite)
- 6 5-Star Hotel Services (Royal Banquets, Oasis Spa & Pool, Gourmet Dining, VIP Fleet, 24/7 Butler, Technogym)
- 4 Active Promotional Packages with discount vouchers
- Complete Staff & Administrator demo accounts

---

### Step 4: Launch the Project (Single Command)

From the project root directory, run:

```bash
npm run dev
```

> `npm run dev` uses `concurrently` to launch both the **Express Backend Server** (Port `5001`) and the **React Client** (Port `3000`) simultaneously!

#### Alternative: Running Backend and Frontend Separately

If you prefer two separate terminal tabs:

**Terminal 1 (Backend):**
```bash
npm run server
# Server will run on: http://localhost:5001
```

**Terminal 2 (Frontend):**
```bash
npm run client
# Client will open on: http://localhost:3000
```

---

## 🔑 Default Login Credentials (Role-Based Portals)

The application comes pre-loaded with verified user and staff accounts for all roles:

| Role | Email Address | Password | Portal Access URL | Permissions / Capabilities |
|---|---|---|---|---|
| **Administrator** | `admin@hotel.com` | `admin123` | `http://localhost:3000/admin/login` | Full system control, revenue analytics, audit logs, staff management, room creation |
| **General Manager** | `manager@hotel.com` | `Staff123!` | `http://localhost:3000/admin/login` | BI analytics, occupancy rates, pricing rules, daily reporting |
| **Receptionist** | `reception@hotel.com` | `Staff123!` | `http://localhost:3000/admin/login` | Walk-in reservations, guest check-in/out, QR scanning, room key assignment |
| **Housekeeping** | `housekeeping@hotel.com` | `Staff123!` | `http://localhost:3000/admin/login` | Live room cleaning status updates (Clean, In-Progress, Dirty) |
| **Maintenance** | `maintenance@hotel.com` | `Staff123!` | `http://localhost:3000/admin/login` | Equipment & facility repair ticketing, room maintenance flags |
| **Restaurant / Kitchen** | `kitchen@hotel.com` | `Staff123!` | `http://localhost:3000/admin/login` | Dining order queue, live status updates (Pending, Cooking, Served) |
| **Registered Guest** | `guest@hotel.com` | `Guest123!` | `http://localhost:3000/user-login` | Reservation history, downloadable PDF invoices, room service requests, QR folio |

---

## 🎨 Theme Studio & Brand Customization

LuxuryStay Hospitality features a **Centralized Theme System**:

- **Default Theme**: Signature **Luxury Teal (`#0D9488`) & Crisp White (`#FFFFFF`)**.
- **Floating Theme Studio**: Located as a left-side floating palette launcher on all pages.
- **8 Signature Palettes**:
  1. *Luxury Teal & Crisp White (Default)* — `#0D9488` / `#14B8A6`
  2. *Regal Navy & Crisp White* — `#1B365D` / `#2563EB`
  3. *Deep Midnight Navy & Ice Blue* — `#0F294A` / `#38BDF8`
  4. *Warm Taupe & Ivory* — `#A58D72` / `#C5AD91`
  5. *Royal Gold & Champagne* — `#B89B62` / `#D9C59A`
  6. *Emerald Luxe & Mint* — `#166534` / `#4ADE80`
  7. *Sapphire Ocean & Silver* — `#1E40AF` / `#94A3B8`
  8. *Burgundy Velvet & Rose* — `#831843` / `#F472B6`
- **Custom Color Picker**: Enter any hex code (`#0D9488`) or CSS color name (`teal`, `navy`, `white`) to re-theme the entire website live.
- **Dynamic Contrast Engine**: Automatically adjusts text and icon colors to pure white (`#FFFFFF`) on dark backgrounds or deep slate on light backgrounds using ITU-R BT.709 perceived luminance.

---

## 📂 Project Directory Structure

```
hotel-management-system-main/
├── README.md                      # Complete Project & Submission Guide
├── package.json                   # Root orchestrator scripts (dev, server, client, seed, build)
│
├── backend/                       # Express.js REST API Server
│   ├── Index.js                   # Server entry point & Socket.IO initialization
│   ├── package.json               # Backend dependencies
│   ├── .env                       # Environment variables (MongoDB, JWT, Ports)
│   ├── Controllers/               # Business logic controllers (auth, bookings, rooms, hotels, etc.)
│   ├── Models/                    # Mongoose database schemas (Hotel, Room, Booking, User, Service, etc.)
│   ├── Middleware/                # JWT Auth, RBAC role guard, rate limiters, validation
│   ├── routes/                    # API route declarations
│   └── scripts/
│       ├── seedRealisticData.js   # Database auto-population script
│       └── backupDb.js            # Automated database backup script
│
└── frontend/                      # React 19 Client Application
    ├── package.json               # Frontend dependencies
    ├── .env                       # Frontend environment configuration
    ├── public/                    # Static assets, HTML template, manifest, favicons
    │   └── assets/images/         # LuxuryStay transparent logos, favicons, emblems
    └── src/
        ├── App.js                 # App routes and Layout wrappers
        ├── Context/
        │   ├── ThemeContext.js    # Theme engine & dynamic contrast calculator
        │   └── AuthContext.js     # User session & token state management
        ├── Component/
        │   ├── User/              # Public guest portal, booking engine, profile
        │   │   ├── Home/sections/ # Hero slider, services, rooms, amenities, testimonials
        │   │   └── Layout/        # Responsive Header, Navbar, Footer, BackToTop
        │   └── Admin/             # Operations portals & analytics dashboards
        │       ├── Dashboard.jsx  # Revenue & Occupancy visual charts
        │       ├── sidebar.jsx    # Role-based admin navigation
        │       └── ThemePanel.jsx # Floating live Theme Studio
        └── styles/
            ├── theme.css          # Core CSS custom properties & global scrollbar
            └── admin-premium.css  # Admin dashboard styling
```

---

## 🛠️ Common Troubleshooting & FAQs

### 1. Error: `503 Service Unavailable` or `MongoDB connection refused`
- **Cause**: The local MongoDB service is not running on port `27017`.
- **Solution**: Open PowerShell / Terminal and run:
  ```bash
  mongod --dbpath "C:\mongodb4\data" --port 27017
  ```
  Or check your MongoDB Windows Service in `services.msc` and click **Start**.

### 2. Error: `Port 5001 is already in use`
- **Cause**: A previous Node.js server process is still running in the background.
- **Solution** (Windows):
  ```bash
  netstat -ano | findstr :5001
  taskkill /PID <PID_NUMBER> /F
  ```

### 3. How to Reset the Theme to Default Teal?
- Click the floating palette icon on the left of any screen to open **Theme Studio**, then click **Reset**. The application will instantly return to **Luxury Teal (`#0D9488`) & Crisp White (`#FFFFFF`)**.

---

## 🎓 Aptech eProject Evaluation Checklist

- [x] **Full-Stack Architecture**: Complete MERN stack implementation with separated concerns.
- [x] **Database Design**: Normalized schemas with validation, timestamps, and indexes.
- [x] **State Management**: React Context API for centralized Theme and Authentication.
- [x] **Security**: Bcrypt password hashing, JWT authentication with refresh tokens, rate limiting, and input sanitization.
- [x] **Responsive UI**: Fully mobile-responsive layouts tested across mobile, tablet, and desktop viewports.
- [x] **Production Ready**: Verified zero syntax errors, cleanly compiling production build.

---
**Project Author**: Aptech eProject Hospitality Team  
**Evaluation Support**: For any questions regarding review or live defense, refer to the credentials and commands above.
