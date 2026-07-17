# Aether Apparel

A full-stack e-commerce web app built to practice end-to-end product development — from database design to a fully functional storefront with an AI-assisted admin dashboard. Inspired by minimal, editorial fashion sites like Zara and Uniqlo. Currently runs locally.

## Overview

Aether Apparel is a fictional clothing brand storefront featuring category-based product browsing with filters and search, a full cart and checkout flow with UPI (via Razorpay) and Cash on Delivery, user accounts with order history and address management, product reviews, promo codes, and a complete admin dashboard — including an AI-powered "describe it, we'll list it" product creation tool.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (Pages Router) + TypeScript + Tailwind CSS |
| Backend | Express + TypeScript |
| ORM / Database | Prisma + PostgreSQL |
| Auth | JWT (httpOnly cookies) |
| Payments | Razorpay (UPI) + Cash on Delivery |
| AI | Google Gemini (function calling) for AI-assisted product creation |
| Package Manager | pnpm |

## Features

### Storefront
- Category-based product browsing (browse one category at a time, like a real clothing site)
- Search, gender/price/stock filters, and sorting (newest, price, best-selling)
- Product detail pages with multiple images, variants (size/color), quantity selector, and related products
- Customer reviews and star ratings — users can post one review per product and delete their own (admins can delete any)
- Cart with live item count in the navbar, promo code validation, and order summary
- Checkout with **UPI (via Razorpay)** or **Cash on Delivery**
- Dynamic, admin-editable promotional banners on the homepage

### User Accounts
- Register / login with JWT-based auth (httpOnly cookies)
- Add a phone number post-registration if not provided at signup
- Manage saved delivery addresses
- Order history with the ability to **cancel** an order (before it ships)
- Admins see a shortcut into the admin dashboard directly from their profile

### Admin Dashboard
- **Products** — add, edit, delete, and manage inventory
- **AI Product Creation** — describe a product in plain English (e.g. *"black cotton oversized hoodie for men, sizes M/L/XL, ₹2499, 20 in stock"*) and Gemini extracts structured product data via function calling, which is validated and saved directly to the catalog
- **Orders** — view all customer orders and update order status
- **Promo Codes** — create percent or flat-amount discount codes, activate/deactivate, set expiry
- **Banners** — create and manage homepage promotional banners (only one active at a time)
- **Sales Reports** — total revenue, total orders, and top-selling products

## Project Structure

```
Aether-Apparel-Website-Project/
├── database/     # Prisma schema, migrations, and seed script
├── backend/      # Express API server
└── frontend/     # Next.js client application
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm
- A local PostgreSQL instance (or any PostgreSQL database you have access to)
- A [Razorpay](https://razorpay.com) account (free test mode) for UPI payments
- A [Google AI Studio](https://aistudio.google.com) API key for the Gemini-powered AI product creation tool

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Aether-Apparel-Website-Project.git
cd Aether-Apparel-Website-Project
```

### 2. Set up the database

```bash
cd database
pnpm install
```

Create a `.env` file in `database/`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/aether_apparel
```

Run migrations and seed sample data:
```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

### 3. Set up the backend

```bash
cd ../backend
pnpm install
```

Create a `.env` file in `backend/`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/aether_apparel
JWT_SECRET=your_random_secret_string
GEMINI_API_KEY=your_google_ai_studio_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the server:
```bash
pnpm dev
```

The API will run on `http://localhost:5000`.

### 4. Set up the frontend

```bash
cd ../frontend
pnpm install
```

Create a `.env.local` file in `frontend/`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Start the dev server:
```bash
pnpm dev
```

The app will run on `http://localhost:3000`.

## Seeded Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@aetherapparel.com | password123 |
| Admin | ops@aetherapparel.com | password123 |
| Customer | john@example.com | password123 |
| Customer | snow@example.com | password123 |

## Notes on API Keys

- **Razorpay** and **Gemini** features will not work without your own API keys — the app will still run and browse fine without them, but UPI checkout and the "Add with AI" admin tool will return errors until valid keys are added to the backend `.env`.
- Razorpay keys used here should be **test mode** keys during local development — no real transactions occur.
- Product images throughout the seed data are placeholder stock photography sourced from Unsplash.
- This is a personal/portfolio project and is not affiliated with any real clothing brand.

## License

This project is for educational and portfolio purposes.