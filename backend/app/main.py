import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, expenses

app = FastAPI(title="Expense Ledger", version="1.0.0")

origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(expenses.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
