import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";
import TeacherCreate from "./TeacherCreate";
import TeacherSubmissions from "./TeacherSubmissions";
import TeacherGrades from "./TeacherGrades";

function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const navigate = useNavigate();

  // 🔥 Load assignments and submissions from backend
  const loadData = () => {
    fetch("http://localhost:8080/assignments")
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(err => console.error(err));

    fetch("http://localhost:8080/submissions")
      .then(res => res.json())
      .then(data => setSubmissions(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔥 Reload when coming back to dashboard
  useEffect(() => {
    if (activeTab === "dashboard") {
      loadData();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  return (
    <div className="teacher-container">

      {/* ================= SIDEBAR ================= */}
      <div className="teacher-sidebar">
        <h2>GradeSphere</h2>

        <ul>
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </li>

          <li
            className={activeTab === "create" ? "active" : ""}
            onClick={() => setActiveTab("create")}
          >
            Create Assignment
          </li>

          <li
            className={activeTab === "submissions" ? "active" : ""}
            onClick={() => setActiveTab("submissions")}
          >
            Submissions
          </li>

          <li
            className={activeTab === "grades" ? "active" : ""}
            onClick={() => setActiveTab("grades")}
          >
            Grades
          </li>

          <li className="logout" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="teacher-main">

        {/* ===== DASHBOARD VIEW ===== */}
        {activeTab === "dashboard" && (
          <>
            <div className="dashboard-header">
              <h1>Welcome back 👋</h1>
              <p>Here's what's happening in your classes today</p>
            </div>

            {/* ===== STATS ===== */}
            <div className="teacher-stats">
              <div className="stat-card">
                <div>
                  <h3>{assignments.length}</h3>
                  <p>Total Assignments</p>
                </div>
              </div>

              <div className="stat-card">
                <div>
                  <h3>{submissions.length}</h3>
                  <p>Total Submissions</p>
                </div>
              </div>
            </div>

            {/* 🔥 NEW: SHOW ASSIGNMENTS LIST */}
            <div style={{ marginTop: "20px" }}>
              <h2>All Assignments</h2>

              {assignments.length === 0 ? (
                <p>No assignments available</p>
              ) : (
                assignments.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: "10px",
                      margin: "10px 0",
                      border: "1px solid #ccc",
                      borderRadius: "8px"
                    }}
                  >
                    <h4>{a.title}</h4>
                    <p>{a.description}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ===== OTHER TABS ===== */}
        {activeTab === "create" && <TeacherCreate />}
        {activeTab === "submissions" && (
          <TeacherSubmissions
            onGrade={(submission) => {
              setActiveSubmission(submission);
              setActiveTab("grades");
            }}
          />
        )}
        {activeTab === "grades" && <TeacherGrades selectedSubmission={activeSubmission} />}
      </div>
    </div>
  );
}

export default TeacherDashboard;