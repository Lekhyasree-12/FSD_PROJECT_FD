import { useEffect, useState } from "react";
import "./TeacherDashboard.css";
import { useNavigate } from "react-router-dom";
function TeacherSubmissions({ onGrade }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // 🔥 Load assignments
  const loadAssignments = () => {
    fetch("http://localhost:8080/assignments")
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(err => console.error(err));
  };

  // 🔥 Load submissions
  const loadSubmissions = () => {
    fetch("http://localhost:8080/submissions")
      .then(res => res.json())
      .then(data => setSubmissions(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadAssignments();
    loadSubmissions();
  }, []);

  // 🔥 Combine data
  const allSubmissions = submissions.map((s) => {
    const assignment = assignments.find(a => a.id === s.assignmentId);

    return {
      ...s,
      assignmentTitle: assignment ? assignment.title : "Unknown"
    };
  });

  // 🔥 Filtering (FIXED)
  const filtered = allSubmissions.filter((s) => {
    const matchesSearch =
      (s.fileName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.assignmentTitle || "").toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && s.score == null) ||
      (filter === "graded" && s.score != null);

    return matchesSearch && matchesFilter;
  });

  const total = allSubmissions.length;
  const pending = allSubmissions.filter((s) => s.score == null).length;
  const graded = allSubmissions.filter((s) => s.score != null).length;

  // TEMP grading
  const handleGrade = () => {
    alert("Grading feature will be added in backend next");
  };

  return (
    <div className="submissions-container">
      <h2>Submissions</h2>
      <p className="sub-text">Review student submissions</p>

      {/* SEARCH + FILTER */}
      <div className="submission-controls">
        <input
          type="text"
          placeholder="Search by file or assignment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-buttons">
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("pending")}>Pending</button>
          <button onClick={() => setFilter("graded")}>Graded</button>
        </div>
      </div>

      {/* STATS */}
      <div className="submission-stats">
        <div className="stat-card">
          <h3>{total}</h3>
          <p>Total Submissions</p>
        </div>

        <div className="stat-card">
          <h3>{pending}</h3>
          <p>Pending</p>
        </div>

        <div className="stat-card">
          <h3>{graded}</h3>
          <p>Graded</p>
        </div>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <p>No submissions found</p>
      ) : (
        filtered.map((s) => (
          <div key={s.id} className="submission-card">

            <h3>Student ID: {s.studentId}</h3>
            <p>Assignment: {s.assignmentTitle}</p>

            {/* 🔥 SHOW FILE NAME */}
            <p><strong>File:</strong> {s.fileName || "Not available"}</p>

            <div className="submission-actions">

              {/* VIEW */}
              <button
                onClick={() => {
                  if (!s.fileName) {
                    alert("File not available");
                    return;
                  }

                  window.open(
                    `http://localhost:8080/files/${encodeURIComponent(s.fileName)}`,
                    "_blank"
                  );
                }}
              >
                View
              </button>

              {/* DOWNLOAD */}
              <button
                onClick={() => {
                  if (!s.fileName) {
                    alert("File not available");
                    return;
                  }

                  const link = document.createElement("a");
                  link.href = `http://localhost:8080/files/${encodeURIComponent(s.fileName)}`;
                  link.download = s.fileName;
                  link.click();
                }}
              >
                Download
              </button>

              {/* GRADE */}
             <button
                onClick={() => {
                  if (onGrade) onGrade(s);
                }}
              >
                Grade
              </button>

            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default TeacherSubmissions;