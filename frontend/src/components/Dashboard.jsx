import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} from "../api";
import ExpenseForm from "./ExpenseForm";

const CATEGORIES = [
  "Groceries", "Utilities", "Medical", "Transportation", "Dining Out",
  "Household", "Personal Care", "Entertainment", "Insurance", "Taxes",
  "Gifts & Donations", "Other",
];

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmtDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: iso(start), end: iso(end) };
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: iso(start), end: iso(end) };
}

function iso(d) {
  return d.toISOString().slice(0, 10);
}

function paymentBadge(method) {
  let cls = "badge-other";
  if (method === "Cash") cls = "badge-cash";
  else if (method === "Check") cls = "badge-check";
  else if (method.includes("Card")) cls = "badge-card";
  return <span className={`badge ${cls}`}>{method}</span>;
}

export default function Dashboard() {
  const { user, signout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [view, setView] = useState("week"); // week | month | all
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const dateRange = useCallback(() => {
    if (view === "week") return getWeekRange();
    if (view === "month") return getMonthRange();
    return {};
  }, [view]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const range = dateRange();
      const params = { ...range };
      if (categoryFilter) params.category = categoryFilter;

      const [expData, sumData] = await Promise.all([
        getExpenses(params),
        getExpenseSummary(range),
      ]);
      setExpenses(expData);
      setSummary(sumData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, data);
      } else {
        await createExpense(data);
      }
      setShowForm(false);
      setEditingExpense(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEdit = (exp) => {
    setEditingExpense(exp);
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>SimpleBank</h1>
        <div className="user-info">
          <span>Hello, {user?.name?.split(" ")[0]}</span>
          <button
            className="btn-small theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button className="btn-small btn-signout" onClick={signout}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Summary cards */}
        {summary && (
          <div className="summary-row">
            <div className="summary-card">
              <div className="label">
                {view === "week" ? "This Week" : view === "month" ? "This Month" : "All Time"}
              </div>
              <div className="value">{fmt(summary.total)}</div>
            </div>
            <div className="summary-card">
              <div className="label">Transactions</div>
              <div className="value">{summary.count}</div>
            </div>
            <div className="summary-card">
              <div className="label">Cash Spent</div>
              <div className="value">{fmt(summary.by_payment_method["Cash"] || 0)}</div>
            </div>
            <div className="summary-card">
              <div className="label">Checks Written</div>
              <div className="value">{fmt(summary.by_payment_method["Check"] || 0)}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-bar">
          <div className="view-toggle">
            <button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>This Week</button>
            <button className={view === "month" ? "active" : ""} onClick={() => setView("month")}>This Month</button>
            <button className={view === "all" ? "active" : ""} onClick={() => setView("all")}>All</button>
          </div>

          <div className="form-group">
            <label htmlFor="filter-cat">Category</label>
            <select id="filter-cat" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <button className="btn-primary" onClick={openAdd}>
              + Add Expense
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="ledger-wrapper">
            {loading ? (
              <div className="card-body" style={{ textAlign: "center", padding: "3rem" }}>
                Loading...
              </div>
            ) : expenses.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📒</div>
                <p>No expenses recorded yet for this period.</p>
                <button className="btn-primary" onClick={openAdd}>Add Your First Expense</button>
              </div>
            ) : (
              <table className="ledger">
                <thead>
                  <tr>
                    <th className="col-date">Date</th>
                    <th>Description</th>
                    <th>Paid To</th>
                    <th>Category</th>
                    <th>Payment</th>
                    <th className="col-amount">Amount</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="col-date">{fmtDate(exp.date)}</td>
                      <td>
                        {exp.description}
                        {exp.notes && (
                          <div style={{ fontSize: "0.8rem", color: "var(--color-text-soft)", marginTop: "0.15rem" }}>
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td>{exp.payee || "—"}</td>
                      <td>{exp.category}</td>
                      <td>
                        {paymentBadge(exp.payment_method)}
                        {exp.check_number && (
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-soft)", marginLeft: "0.4rem" }}>
                            #{exp.check_number}
                          </span>
                        )}
                      </td>
                      <td className="col-amount">{fmt(exp.amount)}</td>
                      <td className="col-actions">
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(exp)}>✎</button>
                        {deleteConfirm === exp.id ? (
                          <>
                            <button className="btn-icon" style={{ color: "var(--color-danger)" }} title="Confirm delete" onClick={() => handleDelete(exp.id)}>✓</button>
                            <button className="btn-icon" title="Cancel" onClick={() => setDeleteConfirm(null)}>✕</button>
                          </>
                        ) : (
                          <button className="btn-icon" title="Delete" onClick={() => setDeleteConfirm(exp.id)}>🗑</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{ textAlign: "right" }}>Total</td>
                    <td className="col-amount">{fmt(total)}</td>
