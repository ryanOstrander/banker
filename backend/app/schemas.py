import uuid
from datetime import date as Date, datetime
from pydantic import BaseModel, EmailStr, Field

# ── Categories & Payment Methods ────────────────────────────
CATEGORIES = [
    "Groceries",
    "Utilities",
    "Medical",
    "Transportation",
    "Dining Out",
    "Household",
    "Personal Care",
    "Entertainment",
    "Insurance",
    "Taxes",
    "Gifts & Donations",
    "Other",
]

PAYMENT_METHODS = ["Cash", "Check", "Debit Card", "Credit Card", "Other"]


# ── User ────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., max_length=254)
    password: str = Field(..., min_length=6)


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Expense ─────────────────────────────────────────────────
class ExpenseCreate(BaseModel):
    date: Date
    description: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0)
    category: str = Field(default="Other")
    payment_method: str = Field(default="Cash")
    check_number: str | None = None
    payee: str = Field(default="", max_length=200)
    notes: str | None = None


class ExpenseUpdate(BaseModel):
    date: Date | None = None
    description: str | None = None
    amount: float | None = Field(default=None, gt=0)
    category: str | None = None
    payment_method: str | None = None
    check_number: str | None = None
    payee: str | None = None
    notes: str | None = None


class ExpenseOut(BaseModel):
    id: uuid.UUID
    date: Date
    description: str
    amount: float
    category: str
    payment_method: str
    check_number: str | None
    payee: str
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExpenseSummary(BaseModel):
    total: float
    count: int
    by_category: dict[str, float]
    by_payment_method: dict[str, float]
