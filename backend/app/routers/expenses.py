from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Expense
from app.schemas import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseOut,
    ExpenseSummary,
    CATEGORIES,
    PAYMENT_METHODS,
)
from app.auth import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


# ── Helpers ─────────────────────────────────────────────────

def _date_filter(start: date | None, end: date | None):
    clauses = []
    if start:
        clauses.append(Expense.date >= start)
    if end:
        clauses.append(Expense.date <= end)
    return clauses


# ── List / filter ───────────────────────────────────────────

@router.get("", response_model=list[ExpenseOut])
async def list_expenses(
    start: date | None = Query(None),
    end: date | None = Query(None),
    category: str | None = Query(None),
    payment_method: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(Expense).where(Expense.user_id == user.id)
    for clause in _date_filter(start, end):
        q = q.where(clause)
    if category:
        q = q.where(Expense.category == category)
    if payment_method:
        q = q.where(Expense.payment_method == payment_method)
    q = q.order_by(Expense.date.desc(), Expense.created_at.desc())
    result = await db.execute(q)
    return result.scalars().all()


# ── Create ──────────────────────────────────────────────────

@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
async def create_expense(
    body: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    expense = Expense(**body.model_dump(), user_id=user.id)
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense


# ── Update ──────────────────────────────────────────────────

@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(
    expense_id: UUID,
    body: ExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Expense).where(Expense.id == expense_id, Expense.user_id == user.id)
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found.")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    await db.commit()
    await db.refresh(expense)
    return expense


# ── Delete ──────────────────────────────────────────────────

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Expense).where(Expense.id == expense_id, Expense.user_id == user.id)
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found.")
    await db.delete(expense)
    await db.commit()


# ── Summary ─────────────────────────────────────────────────

@router.get("/summary", response_model=ExpenseSummary)
async def expense_summary(
    start: date | None = Query(None),
    end: date | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    base = select(Expense).where(Expense.user_id == user.id)
    for clause in _date_filter(start, end):
        base = base.where(clause)

    result = await db.execute(base)
    expenses = result.scalars().all()

    total = sum(e.amount for e in expenses)
    by_cat: dict[str, float] = {}
    by_pm: dict[str, float] = {}
    for e in expenses:
        by_cat[e.category] = by_cat.get(e.category, 0) + e.amount
        by_pm[e.payment_method] = by_pm.get(e.payment_method, 0) + e.amount

    return ExpenseSummary(
        total=round(total, 2),
        count=len(expenses),
        by_category=by_cat,
        by_payment_method=by_pm,
    )


# ── Options ─────────────────────────────────────────────────

@router.get("/options")
async def get_options():
    return {"categories": CATEGORIES, "payment_methods": PAYMENT_METHODS}
