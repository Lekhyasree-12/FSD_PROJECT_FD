import { useEffect, useState } from "react";
import "./TeacherDashboard.css";

function TeacherGrades({ selectedSubmission }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [gradeInputs, setGradeInputs] = useState({});
  const [feedbackInputs, setFeedbackInputs] = useState({});

  useEffect(() => {
    loadData();
    if (selectedSubmission) {
      setSearch(selectedSubmission.studentId ? String(selectedSubmission.studentId) : "");
    }
  }, [selectedSubmission]);

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

  const handleGrade = (submissionId) => {
    const grade = gradeInputs[submissionId];
    const feedback = feedbackInputs[submissionId];

    if (!grade) {
      alert("Please enter a valid score");
      return;
    }

    fetch(`http://localhost:8080/submissions/${submissionId}/grade`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        score: Number(grade),
        feedback: feedback
      })
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Status ${res.status}: ${text}`);
        }
        return res.text();
      })
      .then(() => {
        alert("Grade saved successfully!");
        setGradeInputs(prev => ({ ...prev, [submissionId]: "" }));
        setFeedbackInputs(prev => ({ ...prev, [submissionId]: "" }));
        loadData(); // Refresh UI
      })
      .catch(err => {
        console.error("Grading error:", err);
        alert("Failed to grade. Backend says: " + err.message);
      });
  };

  // Combine data
  const allData = submissions.map(s => {
    const assignment = assignments.find(a => a.id === s.assignmentId);
    return {
      ...s,
      assignmentTitle: assignment ? assignment.title : "Unknown Assignment"
    };
  });

  const filtered = allData.filter((s) => {
    if (!search) return true;
    const sId = s.studentId ? String(s.studentId).toLowerCase() : "";
    const aTit = s.assignmentTitle ? s.assignmentTitle.toLowerCase() : "";
    const q = search.toLowerCase();
    return sId.includes(q) || aTit.includes(q);
  });

  const gradedStudents = allData.filter(s => s.score != null);
  
  const average =
    gradedStudents.length > 0
      ? Math.round(
          gradedStudents.reduce((sum, s) => sum + s.score, 0) /
            gradedStudents.length
        )
      : 0;

  const highest =
    gradedStudents.length > 0
      ? Math.max(...gradedStudents.map((s) => s.score))
      : 0;

  const lowest =
    gradedStudents.length > 0
      ? Math.min(...gradedStudents.map((s) => s.score))
      : 0;

  const passRate =
    gradedStudents.length > 0
      ? Math.round(
          (gradedStudents.filter((s) => s.score >= 40).length /
            gradedStudents.length) *
            100
        )
      : 0;

  const getLetter = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const distribution = {
    A: gradedStudents.filter((s) => s.score >= 90).length,
    B: gradedStudents.filter((s) => s.score >= 80 && s.score < 90).length,
    C: gradedStudents.filter((s) => s.score >= 70 && s.score < 80).length,
    D: gradedStudents.filter((s) => s.score >= 60 && s.score < 70).length,
    F: gradedStudents.filter((s) => s.score < 60).length
  };

  return (
    <div className="grades-container">

      <h2>Grades</h2>
      <p className="sub-text">
        View and manage student grades
      </p>

      {/* GRADING SECTION */}
      {filtered.length === 0 ? (
        <p>No student submissions found matching criteria.</p>
      ) : (
        filtered.map((s) => (
          <div key={s.id} className="assignment-card">

            <p><strong>Assignment:</strong> {s.assignmentTitle}</p>
            <p><strong>Student ID:</strong> {s.studentId}</p>

            <span className={`grade-badge ${s.score != null ? "graded" : "pending"}`}>
              {s.score != null ? "Graded" : "Pending"}
            </span>

            <input
              type="number"
              placeholder="Enter Grade"
              value={gradeInputs[s.id] || ""}
              onChange={(e) =>
                setGradeInputs({
                  ...gradeInputs,
                  [s.id]: e.target.value
                })
              }
            />

            <textarea
              placeholder="Write feedback..."
              value={feedbackInputs[s.id] || ""}
              onChange={(e) =>
                setFeedbackInputs({
                  ...feedbackInputs,
                  [s.id]: e.target.value
                })
              }
              rows="3"
            />

            <button
              onClick={() => handleGrade(s.id)}
            >
              Save Grade
            </button>

            <p><strong>Current Grade:</strong> {s.score ?? "Not graded"}</p>

          </div>
        ))
      )}

      {/* OVERVIEW */}
      <div className="overview-card">
        <div className="overview-stat">
          <span>Graded Students</span>
          <h3>{gradedStudents.length}</h3>
        </div>
        <div className="overview-stat">
          <span>Average</span>
          <h3>{average}%</h3>
        </div>
        <div className="overview-stat">
          <span>Highest</span>
          <h3>{highest}%</h3>
        </div>
        <div className="overview-stat">
          <span>Lowest</span>
          <h3>{lowest}%</h3>
        </div>
        <div className="overview-stat">
          <span>Pass Rate</span>
          <h3>{passRate}%</h3>
        </div>
      </div>

      {/* SEARCH */}
      <div className="grades-controls">
        <input
          type="text"
          placeholder="Search students or assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="grades-table">
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Assignment</th>
              <th>Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {gradedStudents.map((s, idx) => (
              <tr key={idx}>
                <td>{s.studentId}</td>
                <td>{s.assignmentTitle}</td>
                <td>{s.score}</td>
                <td>{getLetter(s.score)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DISTRIBUTION */}
      <div className="distribution-card">
        <h3>Grade Distribution</h3>
        <div className="distribution-grid">
          <div className="dist-box green">
            {distribution.A}
            <span>A (90-100)</span>
          </div>
          <div className="dist-box blue">
            {distribution.B}
            <span>B (80-89)</span>
          </div>
          <div className="dist-box orange">
            {distribution.C}
            <span>C (70-79)</span>
          </div>
          <div className="dist-box red">
            {distribution.D}
            <span>D (60-69)</span>
          </div>
          <div className="dist-box gray">
            {distribution.F}
            <span>F (0-59)</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default TeacherGrades;