# Manufacturing & Supply Company ERP System

Production-quality ERP application for manufacturing and supply chain workflows:

**Customer Enquiry → Quotation → Sales Order → Inventory Reservation → Dispatch**

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express.js, PostgreSQL, Prisma ORM |
| Auth | JWT, bcrypt password hashing, role-based access control |
| Testing | Jest, Supertest |
| Docs | Swagger OpenAPI |

## Architecture

```
┌─────────────┐     JWT      ┌──────────────┐     Prisma     ┌────────────┐
│  React SPA  │ ──────────► │ Express API  │ ────────────► │ PostgreSQL │
│  (Vite)     │ ◄────────── │ + Services   │ ◄──────────── │            │
└─────────────┘             └──────────────┘               └────────────┘
```

### Folder Structure

```
├── backend/
│   ├── prisma/          # Schema, migrations, seed
│   ├── src/
│   │   ├── config/      # Environment, database, Swagger
│   │   ├── controllers/ # HTTP handlers
│   │   ├── middleware/  # Auth, RBAC, validation, errors
│   │   ├── routes/      # REST route definitions
│   │   ├── services/    # Business logic & transactions
│   │   ├── utils/       # Helpers (calculator, number gen)
│   │   └── validators/  # Zod schemas
│   └── tests/           # Jest + Supertest integration tests
├── frontend/
│   └── src/
│       ├── api/         # Axios instance with JWT interceptors
│       ├── context/     # Auth context
│       ├── pages/       # Login, Enquiries, Quotations, Sales Orders
│       └── components/  # Layout, badges, alerts
└── docker-compose.yml   # PostgreSQL container
```

## ER Diagram

```
users ──────────────► enquiries ◄──── customers
  │                      │                  ▲
  │                      ▼                  │
  └──────────────► quotations ──────────────┘
                       │
                       ▼ (1:1 unique)
                  sales_orders ──────► dispatches
                       │                    │
                       ▼                    ▼
                 sales_order_items    dispatch_items
                       │
                       ▼
                    products ◄──── inventory (physical - reserved = available)
```

### Key Relationships

- **Enquiry → Quotation**: One enquiry can have multiple quotations
- **Quotation → Sales Order**: One-to-one (unique `quotation_id` constraint prevents duplicates)
- **Sales Order → Dispatch**: One order can have multiple partial dispatches
- **Product → Inventory**: One-to-one; available = `physical_quantity - reserved_quantity`

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm

## Installation

### 1. Start PostgreSQL

**Option A — Docker (recommended):**

```bash
docker compose up -d
```

**Option B — Local PostgreSQL:**

Create database `manufacturing_erp` and update connection string in `backend/.env`.

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # if .env doesn't exist
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API runs at **http://localhost:5000**
Swagger docs at **http://localhost:5000/api/docs**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

## Deployed Application

The production ERP application is available at:

- Frontend: **https://mini-erp-crm-eqcw.vercel.app**
- Backend API: **https://erp-application-production.up.railway.app**
- Health check: **https://erp-application-production.up.railway.app/health**
- Swagger docs: **https://erp-application-production.up.railway.app/api/docs**

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/manufacturing_erp` |
| `JWT_SECRET` | Secret for signing JWT tokens | Strong random string |
| `JWT_EXPIRES_IN` | Token expiry | `8h` |
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Environment | `development` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

For the production frontend build, use `frontend/.env.production`:

```env
VITE_API_URL=https://erp-application-production.up.railway.app/api
```

## Login Credentials (Seed Data)

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@erp.com | Admin@123 |
| SALES_USER | sales@erp.com | Sales@123 |

## Seeded Products

6 industrial products with inventory:

- Structural Steel I-Beam 200mm
- Aluminium Sheet 3mm
- Ball Bearing 6205-2RS
- Hydraulic Cylinder 100mm Bore
- Industrial V-Belt B85
- Welding Electrode 3.2mm

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/customers` | SALES, ADMIN | Create customer |
| GET | `/api/customers` | SALES, ADMIN | List customers |
| POST | `/api/enquiries` | SALES, ADMIN | Create enquiry |
| GET | `/api/enquiries` | SALES, ADMIN | List enquiries |
| POST | `/api/quotations` | SALES, ADMIN | Create quotation |
| GET | `/api/quotations` | SALES, ADMIN | List quotations |
| PATCH | `/api/quotations/:id/status` | SALES, ADMIN | Accept/Reject/Send |
| POST | `/api/quotations/:id/convert` | SALES, ADMIN | Convert to sales order |
| GET | `/api/sales-orders` | SALES, ADMIN | List sales orders |
| GET | `/api/sales-orders/inventory` | SALES, ADMIN | View inventory |
| POST | `/api/sales-orders/:id/confirm` | **ADMIN only** | Confirm & reserve stock |
| POST | `/api/sales-orders/:id/dispatch` | **ADMIN only** | Dispatch order |
| GET | `/api/products` | SALES, ADMIN | Products with availability |

Full Swagger documentation:

- Development: **http://localhost:5000/api/docs**
- Production: **https://erp-application-production.up.railway.app/api/docs**

## Business Rules

### Quotation Calculation (server-side)

```
Base Amount     = quantity × unit price
Discount Amount = base amount × discount% / 100
After Discount  = base amount - discount amount
GST Amount      = after discount × GST% / 100
Final Amount    = after discount + GST amount
Grand Total     = sum of all line final amounts
```

### Inventory Reservation

On order confirmation (ADMIN):
1. `SELECT ... FOR UPDATE` locks inventory row
2. Checks `physical_quantity - reserved_quantity >= required`
3. Increments `reserved_quantity` atomically within transaction

### Dispatch

On dispatch (ADMIN):
1. Validates against reserved quantity
2. Decrements both `physical_quantity` and `reserved_quantity`
3. Updates order status to DISPATCHED when fully dispatched

## Testing

Ensure PostgreSQL is running, then:

```bash
cd backend
npm test
```

### Test Coverage

1. Quotation total calculation is correct
2. Draft/rejected quotation cannot create sales order
3. Same quotation cannot create duplicate sales orders
4. Cannot reserve more stock than available
5. Unauthorized user cannot perform ADMIN operation
6. **Bonus:** Simultaneous inventory reservation race condition

## Migration Instructions

```bash
cd backend
npx prisma migrate dev --name init    # Create migration
npx prisma db push                      # Push schema without migration
npm run db:seed                         # Seed data
npm run db:reset                        # Reset DB and re-seed
```

## Workflow Example

1. **Sales User** logs in → Creates customer enquiry with products
2. **Sales User** creates quotation against enquiry with pricing
3. **Sales User** marks quotation as ACCEPTED
4. **Sales User** converts accepted quotation to sales order (PENDING)
5. **Admin** confirms order → inventory reserved with row-level locking
6. **Admin** dispatches order → physical stock reduced, reserved released

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT bearer token authentication
- Role-based authorization on every sensitive endpoint (backend enforced)
- Input validation via Zod schemas
- SQL injection protection via Prisma parameterized queries
- Row-level locking prevents inventory race conditions

## License

MIT
