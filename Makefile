.PHONY: build up down restart logs logs-backend logs-frontend logs-db clean reset db-shell

# ── Build & Run ─────────────────────────────────────────────
build:
	docker compose build

up:
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart

# ── Logs ────────────────────────────────────────────────────
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f db

# ── Database ────────────────────────────────────────────────
db-shell:
	docker compose exec db psql -U ledger -d expense_ledger

# ── Cleanup ─────────────────────────────────────────────────
clean:
	docker compose down -v --remove-orphans

reset: clean up-build
