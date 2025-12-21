import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import moment from 'moment';

const WeightChart = ({ vetVisits }) => {
    // Filter visits that have weight data and sort by date
    const data = vetVisits
        .filter(visit => visit.Weight)
        .sort((a, b) => new Date(a.VisitDate) - new Date(b.VisitDate))
        .map(visit => ({
            date: moment(visit.VisitDate).format('MM/DD/YYYY'),
            weight: visit.Weight
        }));

    if (data.length === 0) {
        return (
            <div className="card m-2 shadow rounded" id="petDashCard">
                <div className="card-body text-center">
                    <h3 className="card-title">Weight History</h3>
                    <p className="empty-list-msg">No weight data recorded in Vet Visits.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card m-2 shadow rounded" id="petDashCard">
            <div className="card-body text-center">
                <h3 className="card-title">Weight History</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default WeightChart;
