import React, { useState, useEffect } from "react";

const CATEGORIES = [
  "Groceries", "Utilities", "Medical", "Transportation", "Dining Out",
  "Household", "Personal Care", "Entertainment", "Insurance", "Taxes",
  "Gifts & Donations", "Other",
];

const PAYMENT_METHODS = ["Cash", "Check", "Debit Card", "Credit Card", "Other"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExpenseForm({ expense, onSave, onClose }) {
  const isEdit = !!expense;

  const [form, setForm] = useState({
    date: todayStr(),
    description: "",
    amount: "",
    category: "Groceries",
    payment_method: "Cash",
    check_number: "",
    payee: "",
    notes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (expense) {
      setForm({
        date: expense.date,
        description: expense.description,
        amount: String(expense.amount),
        category: expense.category,
        payment_method: expense.payment_method,
        check_number: expense.check_number || "",
        payee: expense.payee || "",
        notes: expense.notes || "",
      });
    }
  }, [expense]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = () => {
    setError("");
    if (!form.description.trim()) { setError("Please enter a description."); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError("Please enter a valid amount."); return; }
    if (!form.date) { setError("Please pick a date."); return; }

    onSave({
      ...form,
      amount: parseFloat(form.amount),
      check_number: form.payment_method === "Check" ? form.check_number : null,
      notes: form.notes || null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Edit Expense" : "Add New Expense"}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-msg">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exp-date">Date</label>
              <input id="exp-date" type="date" value={form.date} onChange={set("date")} />
            </div>
            <div className="form-group">
              <label htmlFor="exp-amount">Amount ($)</label>
              <input
                id="exp-amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={set("amount")}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="exp-desc">Description</label>
            <input
              id="exp-desc"
              type="text"
              value={form.description}
              onChange={set("description")}
              placeholder="What was this expense for?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="exp-payee">Paid To</label>
            <input
              id="exp-payee"
              type="text"
              value={form.payee}
              onChange={set("payee")}
              placeholder="Store or person name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exp-cat">Category</label>
              <select id="exp-cat" value={form.category} onChange={set("category")}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="exp-pm">Payment Method</label>
              <select id="exp-pm" value={form.payment_method} onChange={set("payment_method")}>
                {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {form.payment_method === "Check" && (
            <div className="form-group">
              <label htmlFor="exp-check">Check Number</label>
              <input
                id="exp-check"
                type="text"
                value={form.check_number}
                onChange={set("check_number")}
                placeholder="e.g. 1042"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="exp-notes">Notes (optional)</label>
            <textarea
              id="exp-notes"
              rows={3}
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any extra details..."
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
