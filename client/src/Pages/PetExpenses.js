import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import moment from 'moment';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const PetExpenses = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newExpense, setNewExpense] = useState({
        Category: 'Food',
        Amount: '',
        Date: moment().format('YYYY-MM-DD'),
        Description: ''
    });

    // Stats State
    const [stats, setStats] = useState({ pieData: [], barData: [], total: 0 });

    useEffect(() => {
        getPetExpenses();
    }, [id]);

    const getPetExpenses = async () => {
        try {
            const token = localStorage.getItem("auth-token");
            const res = await axios.get(`/api/pet/${id}`, {
                headers: { "x-auth-token": token },
            });
            setExpenses(res.data.Expenses || []);
            calculateStats(res.data.Expenses || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load expenses");
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        if (!data || data.length === 0) {
            setStats({ pieData: [], barData: [], total: 0 });
            return;
        }

        // 1. Total
        const total = data.reduce((acc, curr) => acc + (parseFloat(curr.Amount) || 0), 0);

        // 2. Pie Chart (Category Breakdown)
        const categoryMap = {};
        data.forEach(e => {
            const amount = parseFloat(e.Amount) || 0;
            if (categoryMap[e.Category]) {
                categoryMap[e.Category] += amount;
            } else {
                categoryMap[e.Category] = amount;
            }
        });
        const pieData = Object.keys(categoryMap).map(key => ({
            name: key,
            value: categoryMap[key]
        }));

        // 3. Bar Chart (Monthly Trends - Last 6 Months)
        const monthsMap = {};
        for (let i = 5; i >= 0; i--) {
            const monthKey = moment().subtract(i, 'months').format('MMM YYYY');
            monthsMap[monthKey] = 0;
        }
        data.forEach(e => {
            const monthKey = moment(e.Date).format('MMM YYYY');
            if (monthsMap.hasOwnProperty(monthKey)) {
                monthsMap[monthKey] += parseFloat(e.Amount) || 0;
            }
        });
        const barData = Object.keys(monthsMap).map(key => ({
            name: key,
            amount: monthsMap[key]
        }));

        setStats({ pieData, barData, total });
    };

    const handleChange = (e) => {
        setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!newExpense.Amount || isNaN(newExpense.Amount)) {
                toast.error("Please enter a valid amount");
                return;
            }

            const token = localStorage.getItem("auth-token");
            const payload = { ...newExpense };

            await axios.put(`/api/addPetExpense/${id}`, payload, {
                headers: { "x-auth-token": token },
            });

            toast.success("Expense added!");
            setNewExpense({
                Category: 'Food',
                Amount: '',
                Date: moment().format('YYYY-MM-DD'),
                Description: ''
            });
            getPetExpenses(); // Refresh data
        } catch (err) {
            console.error(err);
            toast.error("Failed to add expense");
        }
    };

    const handleDelete = async (expenseId) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            const token = localStorage.getItem("auth-token");
            await axios.delete(`/api/deletePetExpense/${id}/${expenseId}`, {
                headers: { "x-auth-token": token },
            });
            toast.success("Expense deleted");
            getPetExpenses(); // Refresh list
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete expense");
        }
    };

    return (
        <div className="container py-4">
            <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
            </button>

            <h2 className="text-center mb-4 myPet-header" style={{ color: 'var(--text-expense-theme)', WebkitTextFillColor: 'var(--text-expense-theme)' }}>Expense Tracker</h2>

            {/* Stats Overview */}
            <div className="row mb-4">
                <div className="col-md-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-body text-center">
                            <h5 className="text-muted">Total Spend</h5>
                            <h1 className="display-4 fw-bold" style={{ color: 'var(--text-expense-theme)' }}>₹{stats.total.toFixed(2)}</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphs */}
            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <div className="card shadow h-100">
                        <div className="card-header border-0 bg-transparent">Category Breakdown</div>
                        <div className="card-body" style={{ height: '300px' }}>
                            {stats.pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.pieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label
                                        >
                                            {stats.pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-muted mt-5">No data available</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <div className="card shadow h-100">
                        <div className="card-header border-0 bg-transparent">Monthly Trends</div>
                        <div className="card-body" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.barData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                    <Bar dataKey="amount" fill="#82ca9d" name="Spent (₹)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add & List Section */}
            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card shadow border-0">
                        <div className="card-header border-0 bg-transparent">
                            <h5 className="mb-0" style={{ color: 'var(--text-expense-theme)' }}><i className="bi bi-plus-circle me-2"></i>Add Expense</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        name="Category"
                                        value={newExpense.Category}
                                        onChange={handleChange}
                                    >
                                        <option value="Food">Food</option>
                                        <option value="Vet">Vet Bill</option>
                                        <option value="Grooming">Grooming</option>
                                        <option value="Toys">Toys</option>
                                        <option value="Medication">Medication</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Amount (₹)</label>
                                    <div className="input-group">
                                        <span className="input-group-text">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            name="Amount"
                                            placeholder="0.00"
                                            value={newExpense.Amount}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="Date"
                                        value={newExpense.Date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description (Optional)</label>
                                    <textarea
                                        className="form-control"
                                        name="Description"
                                        rows="2"
                                        value={newExpense.Description}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2">
                                    Save Expense
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card shadow border-0">
                        <div className="card-header border-0 bg-transparent">
                            <h5 className="mb-0" style={{ color: 'var(--text-expense-theme)' }}>History</h5>
                        </div>
                        <div className="card-body p-0">
                            {expenses.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle" style={{ color: 'var(--text-primary)' }}>
                                        <thead>
                                            <tr>
                                                <th className="ps-3">Date</th>
                                                <th>Category</th>
                                                <th>Description</th>
                                                <th className="text-end pe-3">Amount</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...expenses].sort((a, b) => new Date(b.Date) - new Date(a.Date)).map((e, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-3">{moment(e.Date).format('MMM DD, YYYY')}</td>
                                                    <td>
                                                        <span className="badge bg-secondary">{e.Category}</span>
                                                    </td>
                                                    <td className="text-muted small">{e.Description || '-'}</td>
                                                    <td className="text-end pe-3 fw-bold">₹{parseFloat(e.Amount).toFixed(2)}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(e._id)}
                                                            title="Delete Expense"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <p>No transactions found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetExpenses;
