# My Expense Ledger

A simple, accessible expense tracking application designed for people who prefer managing their spending in a familiar spreadsheet-like format. Built with cash and check users in mind.

## Features

- **User accounts** — register and log in to keep your expenses private
- **Spreadsheet-style ledger** — see all your expenses in a clear table with running totals
- **Weekly & monthly views** — toggle between time periods to review spending
- **Category tracking** — groceries, utilities, medical, transportation, and more
- **Payment method tracking** — cash, check (with check number), debit/credit card
- **Summary cards** — see totals at a glance, broken down by cash vs. checks
- **Filter by category** — quickly narrow down to specific expense types
- **Edit & delete** — fix mistakes easily with inline controls
- **Large, readable text** — designed for comfortable reading without squinting

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React 18                |
| Backend   | FastAPI (Python 3.12)   |
| Database  | PostgreSQL 16           |
| Auth      | JWT (7-day tokens)      |
| Infra     | Docker Compose          |

## Quick Start

### Prerequisites

- Docker and Docker Compose installed

### Run the app

```bash
# Build and start all services
make up-build

# Or step by step:
make build
make up
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API docs:** http://localhost:8000/docs

### Common commands

```bash
make up          # Start services
make down        # Stop services
make restart     # Restart services
make logs        # Follow all logs
make logs-backend   # Follow backend logs only
make db-shell    # Open a psql shell
make clean       # Stop and remove volumes (resets database)
make reset       # Clean + rebuild + start
```

## Project Structure

```
expense-ledger/
├── docker-compose.yml
├── Makefile
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh        # Waits for DB, runs migrations, starts server
│   ├── requirements.txt
│   └── app/
│       ├── main.py           # FastAPI app
│       ├── database.py       # Async SQLAlchemy setup
│       ├── models.py         # User & Expense tables
│       ├── schemas.py        # Pydantic models
│       ├── auth.py           # JWT + password hashing
│       └── routers/
│           ├── users.py      # Register / login / me
│           └── expenses.py   # CRUD + summary + options
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── public/index.html
    └── src/
        ├── index.js
        ├── index.css         # All styles (accessible, large type)
        ├── App.jsx
        ├── api.js            # API client
        ├── context/
        │   └── AuthContext.jsx
        └── components/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx  # Main view with table + filters + summary
            └── ExpenseForm.jsx # Add/edit modal
```

## API Endpoints

| Method | Path                    | Description               |
|--------|-------------------------|---------------------------|
| POST   | /api/auth/register      | Create account            |
| POST   | /api/auth/login         | Sign in (returns JWT)     |
| GET    | /api/auth/me            | Current user info         |
| GET    | /api/expenses           | List expenses (filterable)|
| POST   | /api/expenses           | Add expense               |
| PUT    | /api/expenses/{id}      | Update expense            |
| DELETE | /api/expenses/{id}      | Delete expense            |
| GET    | /api/expenses/summary   | Spending summary          |
| GET    | /api/expenses/options   | Category & method lists   |

## Configuration

Environment variables (set in `docker-compose.yml`):

- `DATABASE_URL` — PostgreSQL connection string
- `SECRET_KEY` — JWT signing key (change in production!)
- `ALLOWED_ORIGINS` — CORS origins
- `REACT_APP_API_URL` — Backend URL for the frontend
