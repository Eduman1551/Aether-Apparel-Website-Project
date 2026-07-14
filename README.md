# Aether Apparel

A full-stack e-commerce web app built to practice end-to-end product development — from database design to a fully functional storefront with an admin dashboard. Inspired by minimal, editorial fashion sites like Zara and Uniqlo. Currently runs locally.

## Overview

Aether Apparel is a fictional clothing brand storefront featuring product browsing with filters and sorting, a full cart and checkout flow, user accounts with order history, product reviews, and an admin dashboard for managing products, inventory, and orders.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (Pages Router) + TypeScript + Tailwind CSS |
| Backend | Express + TypeScript |
| ORM / Database | Prisma + PostgreSQL |
| Auth | JWT (httpOnly cookies) |
| Package Manager | pnpm |

## Features

- Product catalog with category, price, gender, color, size, and stock filters
- Sorting by newest, price, and best-selling
- Product detail pages with multiple images, variants, quantity selector, and related products
- Customer reviews and ratings
- Cart and checkout with UPI / Cash on Delivery
- User accounts with order history and saved addresses
- Admin dashboard: manage products & inventory, update order status, view sales reports
- Responsive, minimal UI built with Tailwind CSS

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
| Customer | aarav@example.com | password123 |

## Notes

- Payment is limited to UPI and Cash on Delivery — no live payment gateway is integrated.
- Product images are placeholder stock photography sourced from Unsplash.
- This is a personal/portfolio project and is not affiliated with any real clothing brand.

## License

This project is for educational and portfolio purposes.