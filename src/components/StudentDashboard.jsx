import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentAssignments from "./StudentAssignments";
import StudentGrades from "./StudentGrades";
import StudentCalendar from "./StudentCalendar";
import { useAuth } from "../context/AuthContext";
import "./StudentDashboard.css";

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();

  // 🔥 LOAD ALL DATA (ASSIGNMENTS + SUBMISSIONS + SUBJECTS)
  const loadData = () => {
    fetch("https://fsd-project-bd.onrender.com/assignments")
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(err => console.error(err));

    fetch("https://fsd-project-bd.onrender.com/submissions")
      .then(res => res.json())
      .then(data => setSubmissions(data))
      .catch(err => console.error(err));

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

  // 🔥 INITIAL LOAD
  useEffect(() => {
    loadData();
  }, []);

  // 🔥 AUTO REFRESH (fix submission update issue)
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // 🔥 HELPER: GET SUBJECT NAME
  const getSubjectName = (subjectId) => {
    const sub = subjects.find(s => s.id === subjectId);
    return sub ? sub.name : "Unknown";
  };

  // ✅ Compute stats
  const studentId = 1;
  const mySubmissions = submissions.filter(s => s.studentId === studentId);

  const submitted = mySubmissions.length;
  const pending = Math.max(0, assignments.length - submitted);

  const overdue = assignments.filter(a => {
    if (!a.dueDate) return false;
    const isSubmitted = mySubmissions.some(s => s.assignmentId === a.id);
    return !isSubmitted && new Date(a.dueDate) < new Date();
  }).length;

  const average = 0;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-box">🎓</div>
          <div>
            <h3>Student</h3>
            <p>Portal</p>
          </div>
        </div>

        <nav>
          <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
            ⊞ Dashboard
          </li>
          <li className={activeTab === "assignments" ? "active" : ""} onClick={() => setActiveTab("assignments")}>
            📄 Assignments
          </li>
          <li className={activeTab === "grades" ? "active" : ""} onClick={() => setActiveTab("grades")}>
            🏅 Grades
          </li>
          <li className={activeTab === "calendar" ? "active" : ""} onClick={() => setActiveTab("calendar")}>
            📅 Calendar
          </li>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main */}
      <main className="main-view">
        {activeTab === "dashboard" ? (
          <div className="dashboard-grid">
            <div className="center-col">
              <header className="welcome-header">
                <h1>Welcome Back 👋</h1>
                <p>Here's what's happening with your studies today</p>
              </header>

              {/* Stats */}
              <div className="stats-row">
                <div className="stat-card">
                  <h3>{assignments.length}</h3>
                  <p>Total Assignments</p>
                </div>

                <div className="stat-card">
                  <h3>{submitted}</h3>
                  <p>Submitted</p>
                </div>

                <div className="stat-card">
                  <h3>{pending}</h3>
                  <p>Pending</p>
                </div>

                <div className="stat-card">
                  <h3>{overdue}</h3>
                  <p>Overdue</p>
                </div>
              </div>

              {/* 🔥 Assignment List WITH SUBJECT */}
              <section className="assignments-list-card">
                <h2>Assignments</h2>

                {assignments.length === 0 ? (
                  <p>No assignments available</p>
                ) : (
                  assignments.map((a) => (
                    <div key={a.id} className="assignment-list-item">
                      <h4>{a.title}</h4>

                      {/* 🔥 SUBJECT NAME ADDED */}
                      <p><strong>Subject:</strong> {getSubjectName(a.subjectId)}</p>

                      <p>{a.description}</p>
                    </div>
                  ))
                )}
              </section>
            </div>

            {/* Right Side */}
            <aside className="right-col">
              <div className="subjects-card">
                <h3>📚 Subjects</h3>

                {subjects.length === 0 ? (
                  <p>No subjects available</p>
                ) : (
                  subjects.map((sub) => (
                    <div key={sub.id}>{sub.name}</div>
                  ))
                )}
              </div>

              <div className="performance-card">
                <h3>Performance</h3>
                <h2>{average}%</h2>
              </div>
            </aside>
          </div>
        ) : (
          <div className="tab-content">
            {activeTab === "assignments" && <StudentAssignments />}
            {activeTab === "grades" && <StudentGrades />}
            {activeTab === "calendar" && <StudentCalendar />}
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;