# Tietokonelepuski CRM – Backend

Backend service for the Repair Management CRM system.  
Built with NestJS + PostgreSQL + Prisma.

---

## 🚀 Tech Stack

- Node.js
- NestJS
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Docker Compose

---

## ✅ What Has Been Implemented

### 1. Database & Prisma
- PostgreSQL via Docker
- Prisma schema with relations
- Enums (UserRole, RepairStatus, etc.)
- Migrations
- Prisma Client
- Transaction-safe operations

### 2. Authentication
- `POST /auth/register`
- `POST /auth/login`
- Password hashing (bcrypt)
- JWT token generation
- JWT-based protected routes

### 3. Customers Module
- Create customer
- Get all customers (with search query)
- Get single customer (with related devices)
- Update customer
- Delete customer
- Proper validation & error handling

### 4. Devices Module
- Create device for a customer
- Get devices by customer
- Get single device
- Update device
- Delete device
- Validation + relation checks

### 5. Repair Tickets Module
- Create repair ticket
- Ensure:
  - Customer exists
  - Device exists
  - Device belongs to customer
- Automatic history entry on ticket creation
- Update ticket status
- Transaction-based status update + history log
- Full relational includes (customer, device, history, estimate)

---

## 📦 Requirements

- Node.js (LTS recommended)
- Docker Desktop
- Git

---

## 🛠 Local Setup

### 1️⃣ Clone Repository

```bash
git clone <REPOSITORY_URL>
cd tietokonelepuski-bc/backend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create .env File

Create a `.env` file inside the `backend/` folder:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tietokonelepuksi?schema=public"
JWT_SECRET="dev_secret"
JWT_EXPIRES_IN="7d"
```

⚠️ `.env` must NOT be committed to Git.

---

### 4️⃣ Start Database

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

---

### 5️⃣ Run Prisma Migrations

```bash
npx prisma migrate dev
npx prisma generate
```

---

### 6️⃣ Start Backend Server

```bash
npm run start:dev
```

Server runs at:

```
http://localhost:3000
```

---

## 🧪 API Example

### Register

```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"admin@test.com","password":"123456","role":"TECHNICIAN"}'
```

---

## 🗄 Prisma Studio

```bash
npx prisma studio
```

Runs at:

```
http://localhost:5555
```

---

## 🔁 Git Workflow

Before starting work:

```bash
git pull
```

Create feature branch:

```bash
git checkout -b feature/<feature-name>
```

Commit changes:

```bash
git add .
git commit -m "feat: short description"
git push
```

Then open a Pull Request.



