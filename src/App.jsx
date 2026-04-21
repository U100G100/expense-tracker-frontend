import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    description: '',
    amount: '',
    payment_mode: 'UPI'
  });

  const [newUser, setNewUser] = useState({
    name: '',
    pocket_money: 5000
  });

  const [budgetForm, setBudgetForm] = useState({
    category: 'Food',
    budget_amount: 2000
  });

  // Fetch user on startup
  useEffect(() => {
    fetchUsers();
  }, []);

  // Load user data when selected
  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
      fetchBudgets();
      fetchStats();
      fetchLeaderboard();
    }, [currentUser, fetchExpenses, fetchBudgets, fetchStats, fetchLeaderboard]);
  }, ;

  // API Calls
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
      if (data.length > 0) {
        setCurrentUser(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchExpenses = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/expenses/${currentUser}`);
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchBudgets = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/budgets/${currentUser}`);
      const data = await res.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const fetchStats = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/stats/${currentUser}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!currentUser || !formData.amount) return;

    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser,
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });

      if (res.ok) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          category: 'Food',
          description: '',
          amount: '',
          payment_mode: 'UPI'
        });
        fetchExpenses();
        fetchStats();
        fetchBudgets();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name) return;

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUser.name,
          pocket_money: parseFloat(newUser.pocket_money)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.id);
        setNewUser({ name: '', pocket_money: 5000 });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!currentUser || !budgetForm.budget_amount) return;

    try {
      const res = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser,
          ...budgetForm,
          budget_amount: parseFloat(budgetForm.budget_amount)
        })
      });

      if (res.ok) {
        fetchBudgets();
        setBudgetForm({ category: 'Food', budget_amount: 2000 });
      }
    } catch (error) {
      console.error('Error setting budget:', error);
    }
  };

  const currentUserData = users.find(u => u.id === currentUser);

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Expense Tracker</h1>
        {currentUser && currentUserData && (
          <div className="user-info">
            <select value={currentUser} onChange={(e) => setCurrentUser(parseInt(e.target.value))}>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} (₹{user.pocket_money})
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {!currentUser ? (
        <div className="setup-screen">
          <h2>Welcome! Create Your Profile</h2>
          <form onSubmit={handleCreateUser}>
            <input
              type="text"
              placeholder="Your name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Pocket money (₹)"
              value={newUser.pocket_money}
              onChange={(e) => setNewUser({ ...newUser, pocket_money: e.target.value })}
            />
            <button type="submit">Create Profile</button>
          </form>
        </div>
      ) : (
        <>
          <nav className="tabs">
            <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
              🏠 Home
            </button>
            <button className={activeTab === 'budget' ? 'active' : ''} onClick={() => setActiveTab('budget')}>
              💳 Budget
            </button>
            <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
              📊 Stats
            </button>
            <button className={activeTab === 'leaderboard' ? 'active' : ''} onClick={() => setActiveTab('leaderboard')}>
              🏆 Leaderboard
            </button>
          </nav>

          <main className="content">
            {/* HOME TAB */}
            {activeTab === 'home' && (
              <div className="tab-content">
                <h2>Add Expense</h2>
                <form onSubmit={handleAddExpense} className="expense-form">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Entertainment</option>
                    <option>Shopping</option>
                    <option>Snacks</option>
                    <option>Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Description (e.g., Coffee at Starbucks)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                  <select
                    value={formData.payment_mode}
                    onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                  >
                    <option>UPI</option>
                    <option>CASH</option>
                    <option>CARD</option>
                    <option>OTHER</option>
                  </select>
                  <button type="submit">➕ Add Expense</button>
                </form>

                <h2>Recent Expenses</h2>
                <div className="expenses-list">
                  {expenses.slice(0, 10).map(exp => (
                    <div key={exp.id} className="expense-item">
                      <div className="expense-main">
                        <h4>{exp.category}</h4>
                        <p>{exp.description}</p>
                        <small>{exp.date}</small>
                      </div>
                      <div className="expense-amount">₹{exp.amount}</div>
                    </div>
                  ))}
                  {expenses.length === 0 && <p className="empty">No expenses yet</p>}
                </div>
              </div>
            )}

            {/* BUDGET TAB */}
            {activeTab === 'budget' && (
              <div className="tab-content">
                <h2>Set Budget</h2>
                <form onSubmit={handleSetBudget} className="budget-form">
                  <select
                    value={budgetForm.category}
                    onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                  >
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Entertainment</option>
                    <option>Shopping</option>
                    <option>Snacks</option>
                    <option>Other</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Budget amount (₹)"
                    value={budgetForm.budget_amount}
                    onChange={(e) => setBudgetForm({ ...budgetForm, budget_amount: e.target.value })}
                    required
                  />
                  <button type="submit">Set Budget</button>
                </form>

                <h2>Your Budgets</h2>
                <div className="budgets-grid">
                  {budgets.map((budget, idx) => (
                    <div key={idx} className={`budget-card ${budget.status}`}>
                      <h3>{budget.category}</h3>
                      <div className="budget-info">
                        <p>Budget: ₹{budget.budget_amount}</p>
                        <p>Spent: ₹{budget.spent}</p>
                        <p>Remaining: ₹{budget.remaining}</p>
                      </div>
                      <div className="progress-bar">
                        <div className="progress" style={{ width: `${Math.min(budget.percentage, 100)}%` }}></div>
                      </div>
                      <p className="percentage">{budget.percentage.toFixed(1)}%</p>
                      {budget.status === 'danger' && <p className="warning">⚠️ Over Budget!</p>}
                      {budget.status === 'warning' && <p className="warning">⚠️ Near Limit</p>}
                    </div>
                  ))}
                  {budgets.length === 0 && <p className="empty">Set a budget to get started</p>}
                </div>
              </div>
            )}

            {/* STATS TAB */}
            {activeTab === 'stats' && (
              <div className="tab-content">
                <h2>Monthly Summary</h2>
                {stats && (
                  <div className="stats-summary">
                    <div className="stat-card">
                      <h4>Total Spent</h4>
                      <p className="big-number">₹{stats.total_spent}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Remaining</h4>
                      <p className="big-number">₹{stats.remaining}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Pocket Money</h4>
                      <p className="big-number">₹{stats.pocket_money}</p>
                    </div>
                  </div>
                )}

                <h3>Spending by Category</h3>
                <div className="category-breakdown">
                  {stats && stats.by_category.map((cat, idx) => (
                    <div key={idx} className="category-item">
                      <span>{cat.category}</span>
                      <span>₹{cat.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LEADERBOARD TAB */}
            {activeTab === 'leaderboard' && (
              <div className="tab-content">
                <h2>🏆 Savings Leaderboard</h2>
                <div className="leaderboard">
                  {leaderboard.map((user, idx) => (
                    <div key={idx} className="leaderboard-item">
                      <span className="rank">#{idx + 1}</span>
                      <span className="name">{user.name}</span>
                      <span className="savings-rate">{user.savings_rate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </>
      )}

      <footer className="app-footer">
        <p>Built with React + Flask | Expense Tracker v1.0</p>
      </footer>
    </div>
  );
}

export default App;
