import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    description: '',
    amount: '',
    payment_mode: 'UPI'
  });

  const [budgetForm, setBudgetForm] = useState({
    category: 'Food',
    budget_amount: 2000
  });

  // Fetch users on app load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
      fetchBudgets();
      fetchStats();
      fetchLeaderboard();
    }
  }, [currentUser]);

  // API Functions
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(data);
      if (data.length > 0) {
        setCurrentUser(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses/${currentUser}`);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`${API_URL}/budgets/${currentUser}`);
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats/${currentUser}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/leaderboard`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser,
          date: newExpense.date,
          category: newExpense.category,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          payment_mode: newExpense.payment_mode
        })
      });

      if (response.ok) {
        setNewExpense({
          date: new Date().toISOString().split('T')[0],
          category: 'Food',
          description: '',
          amount: '',
          payment_mode: 'UPI'
        });
        fetchExpenses();
        fetchStats();
        fetchLeaderboard();
        alert('Expense added!');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense');
    }
  };

  const setBudget = async () => {
    if (!budgetForm.budget_amount) {
      alert('Please enter budget amount');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser,
          category: budgetForm.category,
          budget_amount: parseFloat(budgetForm.budget_amount)
        })
      });

      if (response.ok) {
        fetchBudgets();
        fetchStats();
        alert('Budget set!');
      }
    } catch (error) {
      console.error('Error setting budget:', error);
      alert('Error setting budget');
    }
  };

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchExpenses();
        fetchStats();
        fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>💰 Expense Tracker</h1>
        <select value={currentUser} onChange={(e) => setCurrentUser(parseInt(e.target.value))}>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </header>

      <div className="tabs">
        <button 
          className={currentTab === 'home' ? 'active' : ''} 
          onClick={() => setCurrentTab('home')}
        >
          🏠 Home
        </button>
        <button 
          className={currentTab === 'budget' ? 'active' : ''} 
          onClick={() => setCurrentTab('budget')}
        >
          💳 Budget
        </button>
        <button 
          className={currentTab === 'stats' ? 'active' : ''} 
          onClick={() => setCurrentTab('stats')}
        >
          📊 Stats
        </button>
        <button 
          className={currentTab === 'leaderboard' ? 'active' : ''} 
          onClick={() => setCurrentTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
      </div>

      <div className="container">
        {/* HOME TAB */}
        {currentTab === 'home' && (
          <div>
            <h2>Add Expense</h2>
            <div className="form">
              <input 
                type="date" 
                value={newExpense.date} 
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})} 
              />
              
              <select 
                value={newExpense.category} 
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
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
                placeholder="Description" 
                value={newExpense.description} 
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} 
              />
              
              <input 
                type="number" 
                placeholder="Amount" 
                value={newExpense.amount} 
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} 
              />
              
              <select 
                value={newExpense.payment_mode} 
                onChange={(e) => setNewExpense({...newExpense, payment_mode: e.target.value})}
              >
                <option>UPI</option>
                <option>CASH</option>
                <option>OTHER</option>
              </select>

              <button onClick={addExpense}>Add Expense</button>
            </div>

            <h3>Recent Expenses</h3>
            <div className="list">
              {expenses.map(expense => (
                <div key={expense.id} className="item">
                  <div>
                    <strong>{expense.category}</strong> - ₹{expense.amount}
                    <p>{expense.description} ({expense.date})</p>
                  </div>
                  <button onClick={() => deleteExpense(expense.id)} className="delete">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BUDGET TAB */}
        {currentTab === 'budget' && (
          <div>
            <h2>Set Budget</h2>
            <div className="form">
              <select 
                value={budgetForm.category} 
                onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Entertainment</option>
                <option>Shopping</option>
                <option>Snacks</option>
              </select>
              <input 
                type="number" 
                placeholder="Budget Amount" 
                value={budgetForm.budget_amount} 
                onChange={(e) => setBudgetForm({...budgetForm, budget_amount: e.target.value})} 
              />
              <button onClick={setBudget}>Set Budget</button>
            </div>

            <h3>Budget Status</h3>
            <div className="budgets">
              {budgets.map(budget => {
                const spent = expenses
                  .filter(e => e.category === budget.category)
                  .reduce((sum, e) => sum + parseFloat(e.amount), 0);
                
                const percentage = budget.budget_amount > 0 
                  ? (spent / budget.budget_amount) * 100 
                  : 0;
                
                let status = 'good';
                if (percentage > 100) status = 'danger';
                else if (percentage > 80) status = 'warning';

                return (
                  <div key={budget.id} className={`budget ${status}`}>
                    <h4>{budget.category}</h4>
                    <p>Budget: ₹{budget.budget_amount}</p>
                    <p>Spent: ₹{spent.toFixed(2)}</p>
                    <div className="progress-bar">
                      <div className="progress" style={{width: `${Math.min(percentage, 100)}%`}}></div>
                    </div>
                    <p>{percentage.toFixed(0)}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {currentTab === 'stats' && (
          <div>
            <h2>Monthly Statistics</h2>
            {stats && (
              <div className="stats">
                <div className="stat-card">
                  <h4>Total Spent</h4>
                  <p className="big">₹{stats.total_spent || 0}</p>
                </div>
                <div className="stat-card">
                  <h4>Monthly Budget</h4>
                  <p className="big">₹{stats.monthly_budget || 0}</p>
                </div>
                <div className="stat-card">
                  <h4>Remaining</h4>
                  <p className="big">₹{(stats.monthly_budget || 0) - (stats.total_spent || 0)}</p>
                </div>
              </div>
            )}

            <h3>Spending by Category</h3>
            <div className="categories">
              {stats && stats.by_category && Object.entries(stats.by_category).map(([category, amount]) => (
                <div key={category} className="category">
                  <span>{category}</span>
                  <span>₹{amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {currentTab === 'leaderboard' && (
          <div>
            <h2>🏆 Leaderboard - Savings Rate</h2>
            <div className="leaderboard">
              {leaderboard.length > 0 ? (
                leaderboard.map((user, index) => (
                  <div key={user.user_id} className="rank">
                    <span className="rank-num">#{index + 1}</span>
                    <span className="rank-name">{user.user_name}</span>
                    <span className="rank-rate">{user.savings_rate}% saved</span>
                  </div>
                ))
              ) : (
                <p>No leaderboard data yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
