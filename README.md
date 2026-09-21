# NestJS E-Commerce & Authentication API

A robust, enterprise-ready RESTful backend application built with [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), and [PostgreSQL](https://www.postgresql.org/). Features complete JWT authentication, role-based authorization, email verification, password recovery with transactional EJS templates, product and review management, and file storage.

---

## 🚀 Key Features

### 1. Authentication & Security
- **Registration**: Hashed passwords with `bcryptjs`, cryptographically secure 32-byte hex verification tokens, and automatic verification email dispatch.
- **Email Verification**: Token-based link verification (`GET /api/user/verify-email/:id/:token`) activating user accounts.
- **Login Safeguards**: Prevents unverified users from acquiring JWTs; automatically regenerates/resends verification emails upon unverified sign-in attempts.
- **Forgot & Reset Password**: Secure token-based password reset flow (`POST /users/forgot-password`, `GET /users/reset-password/:userId/:token`, `POST /users/reset-password`) with automatic token invalidation.
- **JWT & Role-Based Access Control (RBAC)**: Custom `@CurrentUser()` parameter decorator, `AuthGuard`, and `AuthRolesGuard` protecting endpoints by user role (`ADMIN`, `NORMAL_USER`).

### 2. Transactional Mail System
- Powered by `@nestjs-modules/mailer` and Nodemailer.
- **EJS Templates** with automatic CSS inlining (`@css-inline/css-inline`):
  - `verify-email.ejs`: Account activation email with branded call-to-action button and fallback link.
  - `reset-password.ejs`: Password reset request email with secure frontend link.
  - `login.ejs`: Security alert notification on new account logins.
- Non-blocking error handling ensures external mail transport hiccups do not fail primary database transactions.

### 3. User & Profile Image Management
- Profile management: Update username and password, view profile, and administrative user deletion.
- **Profile Image Storage**: Upload, replace, delete, and public streaming of user avatars stored on disk in `./images`. Old images are automatically unlinked upon replacement or deletion.

### 4. Products & Reviews Catalog
- **Products**: Full CRUD operations. Public filtering by title (substring search) and price range (`minPrice`, `maxPrice`). Creation, update, and deletion restricted to `ADMIN`.
- **Reviews**: Product rating system (1–5 scale) and comments. Authenticated users can review products and update/delete their own reviews. Administrative paginated listing.

### 5. File Uploads
- Dedicated module-level `MulterModule` disk storage configuration.
- Single (`POST /api/upload`) and multiple (`POST /api/upload/multiple`) file upload endpoints.

### 6. Interactive Swagger Documentation
- Fully documented OpenAPI 3.0 specification available at `/api/docs` and `/swagger`.
- Interactive testing with Bearer token authentication and file upload schemas.

---

## 🛠 Tech Stack

- **Runtime**: Node.js v20+ / v24 (ESM `nodenext` modules)
- **Framework**: [NestJS](https://nestjs.com/) v12
- **Database ORM**: [TypeORM](https://typeorm.io/) with [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: `@nestjs/jwt`, `passport`, `bcryptjs`
- **Validation**: `class-validator`, `class-transformer`
- **Mailing**: `@nestjs-modules/mailer`, `nodemailer`, `ejs`, `@css-inline/css-inline`
- **File Uploads**: `multer`, `@nestjs/platform-express`
- **API Documentation**: `@nestjs/swagger`, Swagger UI
- **Testing**: [Vitest](https://vitest.dev/)

---

## 📁 Project Structure

```text
src/
├── app.module.ts              # Root application module
├── main.ts                    # Bootstrap: CORS, Global Validation Pipe, Swagger UI
├── utils/                     # Constants, enums (UserType), and TypeScript types
├── mail/                      # Transactional mailer module & templates
│   ├── mail.module.ts         # MailerModule.forRootAsync with EjsAdapter & inlineCss
│   ├── mail.service.ts        # Reusable email dispatch service
│   └── templates/             # EJS email templates
│       ├── login.ejs
│       ├── reset-password.ejs
│       └── verify-email.ejs
├── products/                  # Product catalog management
│   ├── product.entity.ts
│   ├── products.controller.ts
│   ├── products.module.ts
│   ├── products.service.ts
│   └── dtos/
├── reviews/                   # Customer review system
│   ├── review.entity.ts
│   ├── reviews.controller.ts
│   ├── reviews.module.ts
│   ├── reviews.service.ts
│   └── dtos/
├── uploads/                   # Generic file upload module
│   ├── upload.controller.ts
│   └── upload.module.ts
└── users/                     # Users, authentication, and security
    ├── auth.provider.ts       # Auth logic (hashing, JWT, token & link generation)
    ├── user.entity.ts         # User entity definition
    ├── users.controller.ts    # User & auth routes
    ├── users.module.ts        # UsersModule with Multer & Jwt registration
    ├── users.service.ts       # User service orchestrator
    ├── decorators/            # @CurrentUser(), @Roles()
    ├── dtos/                  # Registration, Login, ForgotPassword, ResetPassword
    └── guards/                # AuthGuard (JWT), AuthRolesGuard (RBAC)
```

---

## ⚙️ Environment Variables

Create or edit your `.env.development` file in the project root:

```env
# Database configuration
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_DATABASE=nestjs-app-db
DB_PORT=5432

# JWT configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d

# App & Frontend configuration
DOMAIN=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# SMTP / Mailtrap configuration
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USERNAME=your_mailtrap_username
SMTP_PASSWORD=your_mailtrap_password
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
Ensure PostgreSQL is running and create the database:
```sql
CREATE DATABASE "nestjs-app-db";
```
*(In development, TypeORM automatically synchronizes your entity schemas to PostgreSQL).*

### 3. Run the Application
```bash
# Development mode with watch
npm run start:dev

# Production build & start
npm run build
npm run start:prod
```
The server will start listening on **http://localhost:5000**.

---

## 📖 Interactive API Documentation (Swagger)

Open your browser and navigate to:
- **http://localhost:5000/api/docs**
- or **http://localhost:5000/swagger**

Swagger UI allows you to explore all endpoints, view request/response schemas, and authenticate requests using the **Authorize** button with a JWT Bearer token.

---

## 📡 API Reference

### 🔐 Authentication & Password Recovery

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/auth/register` | Public | Register new user. Sends verification email link. |
| `POST` | `/api/users/auth/login` | Public | Log in user. Returns JWT if email is verified. |
| `GET` | `/api/user/verify-email/:id/:token` | Public | Verify account email via link token. |
| `POST` | `/users/forgot-password` | Public | Request a password reset email. |
| `GET` | `/users/reset-password/:userId/:token` | Public | Validate password reset link token. |
| `POST` | `/users/reset-password` | Public | Set new password using valid reset token. |

### 👤 User Profiles & Avatars

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/auth/profile` | Authenticated | Retrieve current user's profile. |
| `GET` | `/api/users` | Admin | Get list of all registered users. |
| `PUT` | `/api/users/:id` | Owner / Admin | Update username or password. |
| `DELETE` | `/api/users/:id` | Owner / Admin | Delete user account. |
| `POST` | `/api/users/profile-image` | Authenticated | Upload or replace user profile picture. |
| `DELETE` | `/api/users/profile-image` | Authenticated | Delete profile image from disk. |
| `GET` | `/api/users/profile-image/:id` | Public | Stream user profile image file. |

### 📦 Products

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/products` | Admin | Create a new product. |
| `GET` | `/api/products` | Public | List products (supports `?title=`, `?minPrice=`, `?maxPrice=`). |
| `GET` | `/api/products/:id` | Public | Get single product by ID. |
| `PUT` | `/api/products/:id` | Admin | Fully update product. |
| `PATCH` | `/api/products/:id` | Admin | Partially update product. |
| `DELETE` | `/api/products/:id` | Admin | Delete product. |

### ⭐ Reviews

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews/:productId` | Authenticated | Submit a product review (rating 1-5, comment). |
| `GET` | `/api/reviews` | Admin | Paginated list of all reviews (`?pageNumber=&reviewsPerPage=`). |
| `GET` | `/api/reviews/:id` | Public | Get single review by ID. |
| `PUT` | `/api/reviews/:id` | Owner / Admin | Fully update review. |
| `PATCH` | `/api/reviews/:id` | Owner / Admin | Partially update review. |
| `DELETE` | `/api/reviews/:id` | Owner / Admin | Delete review. |

### 📁 Uploads

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | Public | Upload a single file (Field: `file`). |
| `POST` | `/api/upload/multiple` | Public | Upload multiple files simultaneously (Field: `files`). |

---

## 🧪 Testing

The project uses [Vitest](https://vitest.dev/) for unit and integration testing:

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Generate test coverage
npm run test:cov
```

---

## 📄 License

This project is [UNLICENSED](LICENSE) — created for educational and self-study purposes.
