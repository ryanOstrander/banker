#!/bin/bash
set -e

echo "⏳ Waiting for database to be ready..."

# Wait for postgres
until python -c "
import asyncio, asyncpg, os
async def check():
    url = os.environ['DATABASE_URL'].replace('+asyncpg', '')
    conn = await asyncpg.connect(url)
    await conn.close()
asyncio.run(check())
" 2>/dev/null; do
  echo "  Database not ready yet — retrying in 2s..."
  sleep 2
done

echo "✅ Database is ready."

echo "🔄 Running database migrations..."
python -c "
import asyncio
from app.database import engine, Base
from app.models import User, Expense

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('  Tables created / verified.')

asyncio.run(init())
"

echo "🚀 Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
