import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, RadialLinearScale,
  ArcElement, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import "./StudentGrades.css";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, RadialLinearScale,
  ArcElement, Tooltip, Legend, Filler
);

function StudentGrades() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const studentId = 1;

  useEffect(() => {
    fetch("https://fsd-project-bd.onrender.com/assignments")
      .then(res => res.json()).then(setAssignments).catch(console.error);
    fetch("https://fsd-project-bd.onrender.com/submissions")
      .then(res => res.json()).then(setSubmissions).catch(console.error);
  }, []);

  const myGraded = submissions
    .filter(s => s.studentId === studentId && s.score != null)
    .map(s => ({
      ...s,
      assignmentTitle: assignments.find(a => a.id === s.assignmentId)?.title || "Unknown"
    }));

  const scores = myGraded.map(s => Number(s.score));
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const highest = scores.length ? Math.max(...scores) : 0;
  const lowest = scores.length ? Math.min(...scores) : 0;

  const getLetter = (s) => s >= 90 ? "A" : s >= 80 ? "B" : s >= 70 ? "C" : s >= 60 ? "D" : "F";
  const getColor = (s) => s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : "#ef4444";

  // Bar chart — score per assignment
  const barData = {
    labels: myGraded.map(s => s.assignmentTitle),
    datasets: [{
      label: "Score",
      data: scores,
      backgroundColor: scores.map(s =>
        s >= 80 ? "rgba(34,197,94,0.7)" : s >= 60 ? "rgba(245,158,11,0.7)" : "rgba(239,68,68,0.7)"
      ),
      borderColor: scores.map(s =>
        s >= 80 ? "#16a34a" : s >= 60 ? "#d97706" : "#dc2626"
      ),
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  // Line chart — performance trend
  const lineData = {
    labels: myGraded.map((_, i) => `Assignment ${i + 1}`),
    datasets: [{
      label: "Score Trend",
      data: scores,
      borderColor: "#4F7C82",
      backgroundColor: "rgba(79,124,130,0.1)",
      borderWidth: 2.5,
      pointBackgroundColor: "#0B2E33",
      pointRadius: 5,
      tension: 0.4,
      fill: true,
    }]
  };

  // Doughnut — grade distribution
  const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  scores.forEach(s => { dist[getLetter(s)]++; });
  const doughnutData = {
    labels: ["A (90-100)", "B (80-89)", "C (70-79)", "D (60-69)", "F (<60)"],
    datasets: [{
      data: [dist.A, dist.B, dist.C, dist.D, dist.F],
      backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#f97316", "#ef4444"],
      borderWidth: 2,
      borderColor: "#fff",
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } }
    }
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="sg-page">
      <header className="sg-header">
        <h1>📊 Grade Analytics</h1>
        <p>Track your academic performance</p>
      </header>

      {/* Stats Row */}
      <div className="sg-stats">
        {[
          { label: "Average Score", value: avg + "%", color: getColor(avg) },
          { label: "Highest Score", value: highest + "%", color: "#22c55e" },
          { label: "Lowest Score",  value: lowest + "%", color: "#ef4444" },
          { label: "Grade",         value: scores.length ? getLetter(avg) : "N/A", color: getColor(avg) },
          { label: "Assignments",   value: myGraded.length, color: "#3b82f6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="sg-stat-card">
            <span className="sg-stat-value" style={{ color }}>{value}</span>
            <span className="sg-stat-label">{label}</span>
          </div>
        ))}
      </div>

      {scores.length === 0 ? (
        <div className="sg-empty">No graded assignments yet. Check back after your teacher grades your submissions.</div>
      ) : (
        <>
          {/* Charts Row 1 */}
          <div className="sg-charts-row">
            <div className="sg-chart-card">
              <h3>📈 Score per Assignment</h3>
              <Bar data={barData} options={chartOptions} />
            </div>
            <div className="sg-chart-card">
              <h3>📉 Performance Trend</h3>
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="sg-charts-row">
            <div className="sg-chart-card sg-doughnut-card">
              <h3>🎯 Grade Distribution</h3>
              <div className="sg-doughnut-wrap">
                <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: "right" } } }} />
              </div>
            </div>

            {/* Grade Table */}
            <div className="sg-chart-card">
              <h3>📋 Detailed Scores</h3>
              <table className="sg-table">
                <thead>
                  <tr><th>Assignment</th><th>Score</th><th>Grade</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {myGraded.map(s => (
                    <tr key={s.id}>
                      <td>{s.assignmentTitle}</td>
                      <td><strong>{s.score}/100</strong></td>
                      <td>
                        <span className="sg-grade-badge" style={{ background: getColor(s.score) }}>
                          {getLetter(s.score)}
                        </span>
                      </td>
                      <td>
                        <span className={`sg-status ${s.score >= 40 ? "pass" : "fail"}`}>
                          {s.score >= 40 ? "Pass" : "Fail"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentGrades;
