import { useEffect, useState } from "react";
import "./StudentGrades.css";

function StudentGrades() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const studentId = 1; // Temporary static identity

  useEffect(() => {
    fetch("http://localhost:8080/assignments")
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(err => console.error(err));

    fetch("http://localhost:8080/submissions")
      .then(res => res.json())
      .then(data => setSubmissions(data))
      .catch(err => console.error(err));
  }, []);

  // Filter submissions that belong to student and have a grade
  const myGraded = submissions.filter(
    (s) => s.studentId === studentId && s.score != null
  ).map(s => {
    // join with assignment title
    const assignment = assignments.find(a => a.id === s.assignmentId);
    return {
      ...s,
      assignmentTitle: assignment ? assignment.title : "Unknown Assignment"
    }
  });

  // Since we don't have a Subject API, group by a single "General" subject for now
  const groupedBySubject = myGraded.reduce((acc, curr) => {
    const subject = "General";
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(curr);
    return acc;
  }, {});

  // Calculate stats
  const totalGrades = myGraded.map((s) => Number(s.score));

  const avgGPA = totalGrades.length
    ? (
        totalGrades.reduce((a, b) => a + b, 0) /
        totalGrades.length
      ).toFixed(0)
    : 0;

  const highestGrade = totalGrades.length
    ? Math.max(...totalGrades)
    : "N/A";

  const lowestGrade = totalGrades.length
    ? Math.min(...totalGrades)
    : "N/A";

  return (
    <div className="grades-container">
      <header className="page-header">
        <h1>Grades</h1>
        <p>Track your academic performance</p>
      </header>

      {/* GPA Banner */}
      <div className="gpa-banner">
        <h2>{avgGPA} / 100</h2>
        <p>
          Grade:{" "}
          {avgGPA >= 90
            ? "A"
            : avgGPA >= 80
            ? "B"
            : avgGPA >= 70
            ? "C"
            : avgGPA >= 60
            ? "D"
            : avgGPA > 0
            ? "F"
            : "N/A"}
        </p>
      </div>

      {/* Subjects */}
      <div className="subjects-grid">
        {Object.keys(groupedBySubject).length === 0 ? (
          <p>No graded assignments yet.</p>
        ) : (
          Object.entries(groupedBySubject).map(
            ([subject, items]) => {
              const subjectAvg = (
                items.reduce(
                  (acc, item) =>
                    acc + Number(item.score ?? 0),
                  0
                ) / items.length
              ).toFixed(0);

              return (
                <div key={subject} className="subject-card">
                  <h3>{subject}</h3>
                  <p>Average: {subjectAvg}%</p>

                  {items.map((item) => (
                    <div key={item.id} className="grade-row">
                      <span>{item.assignmentTitle}</span>
                      <span>
                        {item.score ?? 0}/100
                      </span>
                    </div>
                  ))}
                </div>
              );
            }
          )
        )}
      </div>
    </div>
  );
}

export default StudentGrades;