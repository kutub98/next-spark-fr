"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  stats: {
    studentCount: number;
    volunteerCount: number;
    representativeCount: number;
    recognition: number;
    adminCount: number;
  };
}

const COLORS = ["#4CAF50", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"];

export const UsersCharts = ({ stats }: Props) => {
  const data = [
    { name: "Student", value: stats.studentCount },
    { name: "Volunteer", value: stats.volunteerCount },
    { name: "Representative", value: stats.representativeCount },
    { name: "Recognition", value: stats.recognition },
    { name: "Admin", value: stats.adminCount },
  ];

  return (
    <div className="w-full h-screen bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Users Role Distribution</h2>

      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="40%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(Number(percent) * 100).toFixed(1)}%`
            }
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
