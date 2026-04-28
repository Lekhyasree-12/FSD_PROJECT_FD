import { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function AdminDashboard() {

  // 🔥 SUBJECT STATES
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const navigate = useNavigate();

  // 🔥 USER STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const { logout } = useAuth();

  // 🔥 LOGOUT FUNCTION (ADDED)
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ================= LOAD SUBJECTS =================
  useEffect(() => {
    loadSubjects();
    fetch("https://fsd-project-bd.onrender.com/assignments")
      .then(res => res.json()).then(setAssignments).catch(console.error);
    fetch("https://fsd-project-bd.onrender.com/submissions")
      .then(res => res.json()).then(setSubmissions).catch(console.error);
  }, []);

  const loadSubjects = () => {
    fetch("https://fsd-project-bd.onrender.com/subjects")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSubjects(data);
        } else {
          setSubjects([]);
        }
      })
      .catch(err => console.error(err));
  };

  // ================= ADD USER =================
  const handleAddUser = () => {
    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    fetch("https://fsd-project-bd.onrender.com/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: email,
        email,
        password,
        role: role.toUpperCase()
      })
    })
      .then(res => res.json())
      .then(() => {
        alert("User added!");
        setEmail("");
        setPassword("");
        setRole("student");
      })
      .catch(err => console.error(err));
  };

  // ================= ADD SUBJECT =================
  const handleAddSubject = () => {
    if (!subjectName.trim()) {
      alert("Enter subject name");
      return;
    }

    fetch("https://fsd-project-bd.onrender.com/subjects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: subjectName })
    })
      .then(res => res.json())
      .then(() => {
        alert("Subject added!");
        setSubjectName("");
        loadSubjects();
      })
      .catch(err => console.error(err));
  };

  // ================= DELETE SUBJECT =================
  const handleDelete = (id) => {
    fetch(`https://fsd-project-bd.onrender.com/subjects/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        alert("Deleted!");
        loadSubjects();
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="admin-container">

      {/* HEADER */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>

        {/* 🔥 LOGOUT BUTTON (ADDED) */}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* ANALYTICS SECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Subjects", value: subjects.length, color: "#3b82f6" },
          { label: "Total Assignments", value: assignments.length, color: "#22c55e" },
          { label: "Total Submissions", value: submissions.length, color: "#f59e0b" },
          { label: "Graded", value: submissions.filter(s => s.score != null).length, color: "#8b5cf6" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            padding: "20px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color, marginBottom: "6px" }}>{value}</div>
            <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      {subjects.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
          <div style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            padding: "24px"
          }}>
            <h3 style={{ marginBottom: "16px", color: "#0B2E33" }}>📊 Assignments per Subject</h3>
            <Bar
              data={{
                labels: subjects.map(s => s.name),
                datasets: [{
                  label: "Assignments",
                  data: subjects.map(s => assignments.filter(a => a.subjectId === s.id).length),
                  backgroundColor: "rgba(79,124,130,0.7)",
                  borderRadius: 8,
                }]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
          <div style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            padding: "24px"
          }}>
            <h3 style={{ marginBottom: "16px", color: "#0B2E33" }}>🎯 Submission Status</h3>
            <div style={{ maxWidth: "320px", margin: "0 auto" }}>
              <Pie
                data={{
                  labels: ["Graded", "Pending"],
                  datasets: [{
                    data: [
                      submissions.filter(s => s.score != null).length,
                      submissions.filter(s => s.score == null).length
                    ],
                    backgroundColor: ["#22c55e", "#f59e0b"],
                    borderWidth: 2,
                    borderColor: "#fff",
                  }]
                }}
                options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD USER ================= */}
      <div className="subject-section">
        <h2>Add New User</h2>

        <div className="input-row">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>

          <button className="add-btn" onClick={handleAddUser}>
            Add User
          </button>
        </div>
      </div>

      {/* ================= ADD SUBJECT ================= */}
      <div className="subject-section">
        <h2>Add New Subject</h2>

        <div className="input-row">
          <input
            type="text"
            placeholder="Enter subject name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />

          <button className="add-btn" onClick={handleAddSubject}>
            Add
          </button>
        </div>
      </div>

      {/* ================= SUBJECT LIST ================= */}
      <div className="subject-list">
        <h2>All Subjects</h2>

        {subjects.length === 0 ? (
          <p className="empty-text">No subjects added yet.</p>
        ) : (
          subjects.map((sub) => (
            <div key={sub.id} className="subject-card">
              <span>{sub.name}</span>

              <button
                className="delete-btn"
                onClick={() => handleDelete(sub.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default AdminDashboard;