import React, { useState, useEffect } from 'react';
import './App.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
function App() {
const [tab, setTab] = useState('home');
const [userId, setUserId] = useState(null);
const [users, setUsers] = useState([]);
const [expenses, setExpenses] = useState([]);
const [budgets, setBudgets] = useState([]);
const [stats, setStats] = useState(null);
const [leaderboard, setLeaderboard] = useState([]);
const [expenseForm, setExpenseForm] = useState({
date: new Date().toISOString().split('T')[0],
category: 'Food',
description: '',
amount: '',
payment_mode: 'UPI'
});
const [budgetForm, setBudgetForm] = useState({
category: 'Food',
budget_amount: ''
});
useEffect(() => {
const loadUsers = async () => {
try {
const res = await fetch(`${API_URL}/users`);
const data = await res.json();
setUsers(data);
if (data.length > 0) setUserId(data[0].id);
} catch (err) {
console.error('Error:', err);
}
};
loadUsers();
}, []);
useEffect(() => {
if (!userId) return;

const loadAllData = async () => {
try {
const [expRes, budRes, statRes, leadRes] = await Promise.all([
fetch(`${API_URL}/expenses/${userId}`),
fetch(`${API_URL}/budgets/${userId}`),
fetch(`${API_URL}/stats/${userId}`),
fetch(`${API_URL}/leaderboard`)
]);
const expData = await expRes.json();
const budData = await budRes.json();
const statData = await statRes.json();
const leadData = await leadRes.json();
setExpenses(expData);
setBudgets(budData);
setStats(statData);
setLeaderboard(leadData);
} catch (err) {
console.error('Error:', err);
}
};
loadAllData();
}, [userId]);
const addExpense = async () => {
if (!expenseForm.description || !expenseForm.amount) {
alert('Please fill all fields');
return;
}
try {
await fetch(`${API_URL}/expenses`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
user_id: userId,
date: expenseForm.date,
category: expenseForm.category,
description: expenseForm.description,
amount: parseFloat(expenseForm.amount),
payment_mode: expenseForm.payment_mode
})
});
setExpenseForm({ date: new Date().toISOString().split('T')[0], category: 'Food', description: '', amount: '', payment_mode: 'UPI' });
const res = await fetch(`${API_URL}/expenses/${userId}`);

const data = await res.json();
setExpenses(data);
const statRes = await fetch(`${API_URL}/stats/${userId}`);
const statData = await statRes.json();
setStats(statData);
const leadRes = await fetch(`${API_URL}/leaderboard`);
const leadData = await leadRes.json();
setLeaderboard(leadData);
} catch (err) {
console.error('Error:', err);
}
};
const saveBudget = async () => {
if (!budgetForm.budget_amount) {
alert('Please enter budget amount');
return;
}
try {
await fetch(`${API_URL}/budgets`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
user_id: userId,
category: budgetForm.category,
budget_amount: parseFloat(budgetForm.budget_amount)
})
});
const budRes = await fetch(`${API_URL}/budgets/${userId}`);
const budData = await budRes.json();
setBudgets(budData);
const statRes = await fetch(`${API_URL}/stats/${userId}`);
const statData = await statRes.json();
setStats(statData);
} catch (err) {
console.error('Error:', err);
}
};
const removeExpense = async (id) => {
try {
await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });

const res = await fetch(`${API_URL}/expenses/${userId}`);
const data = await res.json();
setExpenses(data);
const statRes = await fetch(`${API_URL}/stats/${userId}`);
const statData = await statRes.json();
setStats(statData);
const leadRes = await fetch(`${API_URL}/leaderboard`);
const leadData = await leadRes.json();
setLeaderboard(leadData);
} catch (err) {
console.error('Error:', err);
}
};
if (!userId) return <div className="loading"><p>Loading...</p></div>;
return (
<div className="app">
<header className="header">
<div className="header-content">
<div className="logo-section">
<h1> ExpenseTrack</h1>
<p>Smart Money Management</p>
</div>
<select value={userId} onChange={(e) => setUserId(parseInt(e.target.value))} className="user-select">
{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
</select>
</div>
</header>
<nav className="navbar">
<button
className={`nav-btn ${tab === 'home' ? 'active' : ''}`}
onClick={() => setTab('home')}
>
<span className="nav-icon"> </span>
<span>Home</span>
</button>
<button
className={`nav-btn ${tab === 'budget' ? 'active' : ''}`}
onClick={() => setTab('budget')}
>
<span className="nav-icon"> </span>
<span>Budget</span>
</button>

<button
className={`nav-btn ${tab === 'stats' ? 'active' : ''}`}
onClick={() => setTab('stats')}
>
<span className="nav-icon"> </span>
<span>Stats</span>
</button>
<button
className={`nav-btn ${tab === 'leader' ? 'active' : ''}`}
onClick={() => setTab('leader')}
>
<span className="nav-icon"> </span>
<span>Leaderboard</span>
</button>
</nav>
<main className="main-content">
{tab === 'home' && (
<div className="tab-content">
<div className="section">
<h2>Add New Expense</h2>
<div className="form-container">
<div className="form-group">
<label>Date</label>
<input
type="date"
value={expenseForm.date}
onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
className="input-field"
/>
</div>
<div className="form-group">
<label>Category</label>
<select
value={expenseForm.category}
onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
className="input-field"
>
<option>Food</option>
<option>Travel</option>
<option>Entertainment</option>
<option>Shopping</option>
<option>Snacks</option>
<option>Other</option>
</select>
</div>

<div className="form-group full-width">
<label>Description</label>
<input
type="text"
placeholder="What did you spend on?"
value={expenseForm.description}
onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
className="input-field"
/>
</div>
<div className="form-group">
<label>Amount (₹)</label>
<input
type="number"
placeholder="0.00"
value={expenseForm.amount}
onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
className="input-field"
/>
</div>
<div className="form-group">
<label>Payment Mode</label>
<select
value={expenseForm.payment_mode}
onChange={(e) => setExpenseForm({...expenseForm, payment_mode: e.target.value})}
className="input-field"
>
<option>UPI</option>
<option>CASH</option>
<option>OTHER</option>
</select>
</div>
<button onClick={addExpense} className="btn btn-primary full-width">
Add Expense
</button>
</div>
</div>
<div className="section">
<h2>Recent Expenses</h2>
<div className="expenses-list">
{expenses.length === 0 ? (
<p className="empty-state">No expenses yet. Add one to get started!</p>

) : (
expenses.map(e => (
<div key={e.id} className="expense-card">
<div className="expense-info">
<div className="expense-header">
<span className="category-badge">{e.category}</span>
<span className="amount">₹{e.amount}</span>
</div>
<p className="description">{e.description}</p>
<span className="date">{e.date}</span>
</div>
<button onClick={() => removeExpense(e.id)} className="btn btn-danger">
</button>
</div>
))
)}
</div>
</div>
</div>
)}
{tab === 'budget' && (
<div className="tab-content">
<div className="section">
<h2>Set Budget</h2>
<div className="form-container">
<div className="form-group">
<label>Category</label>
<select
value={budgetForm.category}
onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
className="input-field"
>
<option>Food</option>
<option>Travel</option>
<option>Entertainment</option>
<option>Shopping</option>
<option>Snacks</option>
</select>
</div>
<div className="form-group">
<label>Budget Amount (₹)</label>
<input
type="number"
placeholder="0.00"
value={budgetForm.budget_amount}

onChange={(e) => setBudgetForm({...budgetForm, budget_amount: e.target.value})}
className="input-field"
/>
</div>
<button onClick={saveBudget} className="btn btn-primary full-width">
Save Budget
</button>
</div>
</div>
<div className="section">
<h2>Budget Status</h2>
<div className="budget-list">
{budgets.length === 0 ? (
<p className="empty-state">No budgets set yet. Create one!</p>
) : (
budgets.map(b => {
const spent = expenses.filter(e => e.category === b.category).reduce((s, e) => s + parseFloat(e.amount), 0);
const pct = (spent / b.budget_amount) * 100;
const status = pct > 100 ? 'danger' : pct > 80 ? 'warning' : 'good';
return (
<div key={b.id} className={`budget-card ${status}`}>
<div className="budget-header">
<h3>{b.category}</h3>
<span className={`status-badge ${status}`}>{pct.toFixed(0)}%</span>
</div>
<div className="budget-info">
<div className="info-item">
<span className="label">Budget</span>
<span className="value">₹{b.budget_amount}</span>
</div>
<div className="info-item">
<span className="label">Spent</span>
<span className="value">₹{spent.toFixed(2)}</span>
</div>
<div className="info-item">
<span className="label">Remaining</span>
<span className="value">₹{Math.max(0, b.budget_amount - spent).toFixed(2)}</span>
</div>
</div>
<div className="progress-bar">
<div className="progress" style={{width: `${Math.min(pct, 100)}%`}}></div>
</div>
</div>
);
})

)}
</div>
</div>
</div>
)}
{tab === 'stats' && (
<div className="tab-content">
<div className="section">
<h2>Monthly Statistics</h2>
{stats && (
<>
<div className="stats-grid">
<div className="stat-card total">
<span className="stat-label">Total Spent</span>
<h3 className="stat-value">₹{stats.total_spent || 0}</h3>
</div>
<div className="stat-card budget">
<span className="stat-label">Monthly Budget</span>
<h3 className="stat-value">₹{stats.monthly_budget || 0}</h3>
</div>
<div className="stat-card remaining">
<span className="stat-label">Remaining</span>
<h3 className="stat-value">₹{(stats.monthly_budget || 0) - (stats.total_spent || 0)}</h3>
</div>
</div>
<div className="category-breakdown">
<h3>Spending by Category</h3>
{stats.by_category && Object.entries(stats.by_category).length > 0 ? (
<div className="category-list">
{Object.entries(stats.by_category).map(([cat, amt]) => (
<div key={cat} className="category-item">
<span className="category-name">{cat}</span>
<div className="category-bar">
<div className="category-fill"></div>
</div>
<span className="category-amount">₹{amt}</span>
</div>
))}
</div>
) : (
<p className="empty-state">No spending data yet</p>
)}
</div>
</>
)}

</div>
</div>
)}
{tab === 'leader' && (
<div className="tab-content">
<div className="section">
<h2>Leaderboard - Savings Rate</h2>
<div className="leaderboard-list">
{leaderboard.length === 0 ? (
<p className="empty-state">No leaderboard data yet</p>
) : (
leaderboard.map((u, i) => (
<div key={u.user_id} className={`leaderboard-item rank-${i + 1}`}>
<div className="rank-badge">#{i + 1}</div>
<div className="rank-info">
<span className="rank-name">{u.user_name}</span>
<span className="rank-rate">{u.savings_rate}% saved</span>
</div>
<div className="rank-medal">
{i === 0 && ' '}
{i === 1 && ' '}
{i === 2 && ' '}
</div>
</div>
))
)}
</div>
</div>
</div>
)}
</main>
</div>
);
}
export default App;
