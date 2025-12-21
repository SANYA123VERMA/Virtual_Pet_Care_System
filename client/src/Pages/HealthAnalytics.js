
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../Context/UserContext";
import PetContext from "../Context/PetContext";
import { getPetData } from "../Components/Helpers/PetFunctions";
import { Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import WeightChart from "../Components/WeightChart";

const HealthAnalytics = () => {
    const { petId, setPetId } = useContext(PetContext);
    const { userData } = useContext(UserContext);
    const [data, setData] = useState();
    const [stats, setStats] = useState({ graphData: [], total: 0, timeUnit: 'Day' });
    const navigate = useNavigate();

    const calculateStats = (petData) => {
        const expenses = petData.Expenses || [];
        if (expenses.length === 0) {
            setStats({ graphData: [], total: 0, timeUnit: 'Day' });
            return;
        }

        // 1. Total
        const total = expenses.reduce((acc, curr) => acc + (parseFloat(curr.Amount) || 0), 0);

        // 2. Dynamic Graph Data (Daily -> Monthly -> Yearly)
        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.Date) - new Date(b.Date));

        // Find date range
        const firstDate = moment(sortedExpenses[0].Date);
        const lastDate = moment(sortedExpenses[sortedExpenses.length - 1].Date);
        const diffMonths = lastDate.diff(firstDate, 'months', true);

        let timeUnit = 'Day';
        if (diffMonths >= 12) {
            timeUnit = 'Year';
        } else if (diffMonths >= 1) {
            timeUnit = 'Month';
        }

        const map = {};

        sortedExpenses.forEach(e => {
            const m = moment(e.Date);
            let key, name;

            if (timeUnit === 'Year') {
                key = m.format('YYYY');
                name = m.format('YYYY');
            } else if (timeUnit === 'Month') {
                key = m.format('YYYY-MM');
                name = m.format('MMM YYYY');
            } else { // Day
                key = m.format('YYYY-MM-DD');
                name = m.format('MMM Do');
            }

            const amount = parseFloat(e.Amount) || 0;
            if (map[key]) {
                map[key].amount += amount;
            } else {
                // Initialize with sortDate for correct ordering
                map[key] = { name, amount, sortDate: m.valueOf() };
            }
        });

        // Convert map to array and sort
        const graphData = Object.values(map).sort((a, b) => a.sortDate - b.sortDate);

        setStats({ graphData, total, timeUnit });
    };

    useEffect(() => {
        if (!petId) {
            const storedPetId = localStorage.getItem("petId");
            if (storedPetId) setPetId(storedPetId);
        }
    }, [petId, setPetId]);

    useEffect(() => {
        const fetchMyAPI = async () => {
            if (petId) {
                const petData = await getPetData(petId);
                if (petData) {
                    setData(petData);
                    calculateStats(petData);
                } else {
                    localStorage.removeItem("petId");
                    setPetId(null);
                    setData(null);
                }
            }
        };
        fetchMyAPI();
    }, [petId, setPetId]);

    useEffect(() => {
        if (!userData.user) navigate("/");
    }, [userData.user, navigate]);

    return (
        <div className="container-fluid">
            <div className="container my-4">
                <h1 className="text-center mb-4">Health Analytics: {data?.PetName}</h1>
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 mb-4">
                        {data && <WeightChart vetVisits={data.VetVisits} />}
                    </div>
                </div>
                {/* Future placeholders for other charts */}
                <div className="row">
                    <div className="col-md-12">
                        <div className="card shadow rounded m-2 p-3">
                            <h4 className="card-header border-0 bg-transparent text-center">Expense Analytics</h4>
                            <div className="card-body" style={{ minHeight: '300px' }}>
                                <h5 className="text-center text-primary fw-bold mb-3">Total Spent: ₹{stats.total.toFixed(2)}</h5>
                                <div style={{ height: '300px' }}>
                                    {stats.graphData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={stats.graphData}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip formatter={(value) => `₹${value.toFixed(2)} `} />
                                                <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Expense" activeDot={{ r: 8 }} strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-center text-muted mt-5">No expense data yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthAnalytics;
