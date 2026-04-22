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
    loadUsers();
  }, []);

  useEffect(() => {
    if (userId) {
      loadExpenses();
      loadBudgets();
      loadStats();
      loadLeaderboard();
    }
  }, [userId]);

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
      if (data.length > 0) setUserId(data[0].id);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadExpenses = async () => {
    try {
      const res = await fetch(`${API_URL}/expenses/${userId}`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error('Error loading expenses:', err);
    }
  };

  const loadBudgets = async () => {
    try {
      const res = await fetch(`${API_URL}/budgets/${userId}`);
      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      console.error('Error loading budgets:', err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats/${userId}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
  };

  const addExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) {
      alert('Fill all fields');
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
      loadExpenses();
      loadStats();
      loadLeaderboard();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const saveBudget = async () => {
    if (!budgetForm.budget_amount) {
      alert('Enter budget amount');
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
      loadBudgets();
      loadStats();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const removeExpense = async (id) => {
    try {
      await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
      loadExpenses();
      loadStats();
      loadLeaderboard();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (!userId) return <div><p>Loading...</p></div>;

  return (
    <div className="app">
      <header>
        <h1>💰 Expense Tracker</h1>
        <select value={userId} onChange={(e) => setUserId(parseInt(e.target.value))}>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </header>

      <div className="nav">
        <button onClick={() => setTab('home')} className={tab === 'home' ? 'active' : ''}>🏠 Home</button>
        <button onClick={() => setTab('budget')} className={tab === 'budget' ? 'active' : ''}>💳 Budget</button>
        <button onClick={() => setTab('stats')} className={tab === 'stats' ? 'active' : ''}>📊 Stats</button>
        <button onClick={() => setTab('leader')} className={tab === 'leader' ? 'active' : ''}>🏆 Leaderboard</button>
      </div>

      <div className="content">
        {tab === 'home' && (
          <div>
            <h2>Add Expense</h2>
            <div className="form">
              <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} />
              <select value={expenseForm.category} onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}>
                <option>Food</option>
                <option>Travel</option>
                <option>Entertainment</option>
                <option>Shopping</option>
                <option>Snacks</option>
                <option>Other</option>
              </select>
              <input type="text" placeholder="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} />
              <input type="number" placeholder="Amount" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} />
              <select value={expenseForm.payment_mode} onChange={(e) => setExpenseForm({...expenseForm, payment_mode: e.target.value})}>
                <option>UPI</option>
                <option>CASH</option>
                <option>OTHER</option>
              </select>
              <button onClick={addExpense}>Add</button>
            </div>

            <h3>Expenses</h3>
            <div className="list">
              {expenses.map(e => (
                <div key={e.id} className="item">
                  <div>
                    <strong>{e.category}</strong> - ₹{e.amount}
                    <p>{e.description} ({e.date})</p>
                  </div>
                  <button onClick={() => removeExpense(e.id)} className="delete">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'budget' && (
          <div>
            <h2>Set Budget</h2>
            <div className="form">
              <select value={budgetForm.category} onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}>
                <option>Food</option>
                <option>Travel</option>
                <option>Entertainment</option>
                <option>Shopping</option>
                <option>Snacks</option>
              </select>
              <input type="number" placeholder="Amount" value={budgetForm.budget_amount} onChange={(e) => setBudgetForm({...budgetForm, budget_amount: e.target.value})} />
              <button onClick={saveBudget}>Set</button>
            </div>

            <h3>Budget Status</h3>
            {budgets.map(b => {
              const spent = expenses.filter(e => e.category === b.category).reduce((s, e) => s + parseFloat(e.amount), 0);
              const pct = (spent / b.budget_amount) * 100;
              const color = pct > 100 ? 'red' : pct > 80 ? 'orange' : 'green';
              return (
                <div key={b.id} style={{padding: '10px', border: '1px solid #ccc', margin: '10px 0', borderLeft: `5px solid ${color}`}}>
                  <h4>{b.category}</h4>
                  <p>Budget: ₹{b.budget_amount} | Spent: ₹{spent.toFixed(2)} | {pct.toFixed(0)}%</p>
                  <div style={{width: '100%', height: '20px', backgroundColor: '#eee', borderRadius: '5px', overflow: 'hidden'}}>
                    <div style={{width: `${Math.min(pct, 100)}%`, height: '100%', backgroundColor: color}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'stats' && (
          <div>
            <h2>Statistics</h2>
            {stats && (
              <div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
                  <div style={{padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '5px', textAlign: 'center'}}>
                    <p>Total Spent</p>
                    <h3>₹{stats.total_spent || 0}</h3>
                  </div>
                  <div style={{padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '5px', textAlign: 'center'}}>
                    <p>Budget</p>
                    <h3>₹{stats.monthly_budget || 0}</h3>
                  </div>
                  <div style={{padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '5px', textAlign: 'center'}}>
                    <p>Remaining</p>
                    <h3>₹{(stats.monthly_budget || 0) - (stats.total_spent || 0)}</h3>
                  </div>
                </div>

                <h3>By Category</h3>
                {stats.by_category && Object.entries(stats.by_category).map(([cat, amt]) => (
                  <div key={cat} style={{display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee'}}>
                    <span>{cat}</span>
                    <strong>₹{amt}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'leader' && (
          <div>
            <h2>Leaderboard</h2>
            {leaderboard.map((u, i) => (
              <div key={u.user_id} style={{padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between'}}>
                <span>#{i + 1} {u.user_name}</span>
                <strong>{u.savings_rate}% saved</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;