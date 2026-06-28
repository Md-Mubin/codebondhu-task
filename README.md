# 🏗️ CodebondHuit Test

> Full-stack inventory and sales management system built with **React**, **TypeScript**, **Express**, and **MongoDB**.

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square)
![Express](https://img.shields.io/badge/Backend-Express-000000?style=flat-square)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind-06B6D4?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [API Routes](#api-routes)
- [Authentication & Authorization](#authentication--authorization)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## 🎯 Overview

A production-ready management system for **inventory control**, **point-of-sale transactions**, **purchase orders**, **customer & supplier management**, and **business analytics**. Designed with a modular monorepo architecture, role-based access control, and a responsive admin dashboard.

---

## 🏗️ Architecture

```
codebondhuit-test/
├── client/                  # React SPA (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── features/        # Modular feature directories
│   │   ├── components/      # Shared UI components
│   │   ├── layouts/         # App shell & routing layout
│   │   ├── providers/       # Auth, Query, Toast context providers
│   │   ├── routes/          # Protected route guards
│   │   ├── services/        # Axios API service layer
│   │   └── lib/             # Utilities, query client setup
│   └── ...
├── server/                  # Express REST API (TypeScript + MongoDB)
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── modals/          # Mongoose schemas & models
│   │   ├── routes/          # Express route definitions
│   │   ├── middlewares/     # Auth, RBAC, validation, error handling
│   │   ├── config/          # Database connection
│   │   └── types/           # TypeScript declarations
│   └── ...
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend (`client/`)

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | Component-based UI |
| **TypeScript** | ~6.0 | Static type checking |
| **Vite** | 8.1 | Fast build tool & dev server |
| **Tailwind CSS** | 4.3 | Utility-first styling |
| **React Router** | 7.18 | Client-side routing |
| **TanStack Query** | 5.101 | Server state management |
| **React Hook Form** | 7.80 | Form handling |
| **Zod** | 4.4 | Schema validation |
| **Radix UI** | Latest | Accessible UI primitives |
| **Axios** | 1.18 | HTTP client |
| **Recharts** | 3.9 | Charts & analytics |
| **Sonner** | 2.0 | Toast notifications |
| **Lucide React** | 1.21 | Icon library |

### Backend (`server/`)

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | Latest | Runtime |
| **Express** | 5.2 | Web framework |
| **TypeScript** | 5.5 | Type safety |
| **MongoDB** | 7.3 | Database driver |
| **Mongoose** | 9.7 | ODM for MongoDB |
| **JWT** | 9.0 | Authentication tokens |
| **Bcrypt** | 6.0 | Password hashing |
| **Helmet** | 8.2 | Security headers |
| **CORS** | 2.8 | Cross-origin handling |
| **PDFKit** | 0.13 | PDF generation |

---

## 📁 Project Structure

### Client

```
client/
├── src/
│   ├── features/
│   │   ├── auth/                  # Login, Register, Forgot Password
│   │   ├── dashboard/             # KPI cards, charts, overview
│   │   ├── users/                 # User management (admin only)
│   │   ├── products/              # Product CRUD & stock
│   │   ├── customers/             # Customer management
│   │   ├── suppliers/             # Supplier management
│   │   ├── purchases/             # Purchase orders & history
│   │   ├── sales/                 # POS, sales transactions, receipts
│   │   └── reports/               # Analytics & visual reports
│   ├── layouts/
│   │   └── MainLayout.tsx         # Sidebar, header, content shell
│   ├── providers/
│   │   ├── AuthProvider.tsx        # Auth state & token management
│   │   ├── QueryProvider.tsx       # TanStack Query configuration
│   │   └── ToastProvider.tsx       # Global toast notifications
│   ├── routes/
│   │   ├── PrivateRoute.tsx        # Auth guard component
│   │   └── RequireRole.tsx         # Role-based access control
│   ├── services/
│   │   ├── api.ts                  # Axios instance with interceptors
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── customer.service.ts
│   │   ├── supplier.service.ts
│   │   ├── purchase.service.ts
│   │   ├── sale.service.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── ui/                    # Button, Input, Card, Dialog, Tabs...
│   │   ├── DataTable.tsx          # Reusable data table
│   │   ├── PageHeader.tsx         # Page title & actions
│   │   └── StatCard.tsx           # Dashboard metric card
│   ├── lib/
│   │   ├── query-client.ts         # React Query client setup
│   │   └── utils.ts                # cn(), formatting utilities
│   ├── App.tsx                     # Route configuration
│   └── main.tsx                    # Entry point
```

### Server

```
server/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts      # Login, register, profile
│   │   ├── users.controller.ts
│   │   ├── products.controller.ts
│   │   ├── customers.controller.ts
│   │   ├── suppliers.controller.ts
│   │   ├── purchases.controller.ts
│   │   ├── sales.controller.ts
│   │   ├── inventory.controller.ts
│   │   ├── dashboard.controller.ts
│   │   └── reports.controller.ts
│   ├── modals/
│   │   ├── user.model.ts           # Admin, manager, clerk roles
│   │   ├── product.model.ts        # Inventory items
│   │   ├── customer.model.ts
│   │   ├── supplier.model.ts
│   │   ├── purchase.model.ts       # Purchase order header
│   │   ├── sale.model.ts           # Sales transaction
│   │   └── inventoryTransaction.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── products.routes.ts
│   │   ├── customers.routes.ts
│   │   ├── suppliers.routes.ts
│   │   ├── purchases.routes.ts
│   │   ├── sales.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── dashboard.routes.ts
│   │   └── reports.routes.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── rbac.middleware.ts      # Role-based access
│   │   ├── validate.middleware.ts  # Zod schema validation
│   │   ├── error.middleware.ts     # Global error handler
│   │   └── requestLogger.middleware.ts
│   ├── config/
│   │   └── db.ts                   # MongoDB connection
│   └── app.ts                      # Express app setup
└── index.ts                        # Server entry point
```

---

## ✅ Prerequisites

- **Node.js** `>= 18.0.0`
- **npm** `>= 9.0.0` (or **yarn** / **pnpm**)
- **MongoDB** (local instance or MongoDB Atlas connection string)

---

## 🎬 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/codebondhuit-test.git
cd codebondhuit-test
```

### 2. Install Dependencies

Install dependencies for both client and server:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

#### Server (`server/.env`)

```env
PORT=8000
JWT_SECRET=your_jwt_secret_key_here
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
```

#### Client (`client/.env.local`)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

> 💡 **Important:** All Vite environment variables must be prefixed with `VITE_` to be exposed to the client.

---

## 🚀 Running the Application

### Start Backend Server

```bash
cd server
npm run dev
```

Server will run at [http://localhost:8000](http://localhost:8000)

### Start Frontend Client

Open a new terminal:

```bash
cd client
npm run dev
```

Client will run at [http://localhost:5173](http://localhost:5173)

---

## 📡 API Routes

Prefix: `/api/v1`

| Module | Path | Description |
|---|---|---|
| **Auth** | `/auth` | Login, register, profile |
| **Users** | `/users` | User management (admin) |
| **Products** | `/products` | Product CRUD |
| **Customers** | `/customers` | Customer management |
| **Suppliers** | `/suppliers` | Supplier management |
| **Purchases** | `/purchases` | Purchase orders |
| **Sales** | `/sales` | Sales transactions |
| **Inventory** | `/inventory` | Stock tracking |
| **Dashboard** | `/dashboard` | KPIs & summaries |
| **Reports** | `/reports` | Analytics data |

Health check: `GET /health`

---

## 🔐 Authentication & Authorization

- **JWT-based authentication**: Users receive a bearer token on login.
- **Role-based access control (RBAC)**:
  - `admin` — Full access
  - `manager` — Purchase, supplier, report management
  - `clerk` — Sales entry & customer management

Middleware pipeline:
1. `auth.middleware` — Verifies JWT from `Authorization: Bearer <token>`
2. `rbac.middleware` — Checks user role against required permissions

---

## 📦 Available Scripts

### Server

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run production server |

### Client

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check & build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

---

## 🔧 Environment Variables

### Server

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `8000`) |
| `JWT_SECRET` | **Yes** | Secret key for signing JWTs |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `CORS_ORIGIN` | No | Allowed client origin (default: `http://localhost:5173`) |

### Client

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes** | Backend API base URL |

---

## 🚢 Deployment

### Build for Production

```bash
# Build server
cd server
npm run build

# Build client
cd ../client
npm run build
```

### Deploy

- **Server**: Deploy compiled `server/dist/` to any Node.js host (Heroku, Render, AWS EC2, etc.)
- **Client**: Deploy `client/dist/` static files to any static host (Netlify, Vercel, Nginx, Cloudflare Pages)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">Built with ❤️ by Md Irfan Rahman Mubin</p>
