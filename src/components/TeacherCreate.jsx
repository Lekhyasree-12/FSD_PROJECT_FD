import { useState, useEffect } from "react";
import { SubjectsAPI, AssignmentsAPI } from "../services/api";
import "./TeacherDashboard.css";

function TeacherCreate() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState(100);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // LOAD SUBJECTS FROM API
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await SubjectsAPI.getAll();
        setSubjects(data);
      } catch (err) {
        console.error("Error loading subjects:", err);
        setError("Failed to load subjects");
      }
    };
    loadSubjects();
  }, []);

  // CREATE ASSIGNMENT
  const handlePublish = async () => {
    setError("");
    setSuccess("");

    if (!title || !selectedSubjectId || !dueDate) {
      setError("Please fill all required fields: Title, Subject, and Due Date.");
      return;
    }

    if (points <= 0) {
      setError("Points must be greater than 0.");
      return;
    }

    try {
      await AssignmentsAPI.create({
        title,
        description,
        dueDate,
        points: Number(points),
        subjectId: Number(selectedSubjectId)
      });

      setSuccess("Assignment Created Successfully!");

      // RESET FORM
      setTitle("");
      setDescription("");
      setDueDate("");
      setPoints(100);
      setSelectedSubjectId("");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("ERROR:", err);
      setError("Failed to create assignment. Please try again.");
    }
  };

  return (
    <div className="create-layout">
      <h2>Create Assignment</h2>

      {error && <div className="error-message" style={{ marginBottom: "15px" }}>{error}</div>}
      {success && <div className="success-message" style={{ padding: "12px", background: "rgba(34, 197, 94, 0.1)", color: "#16a34a", borderRadius: "8px", border: "1px solid rgba(34, 197, 94, 0.2)", marginBottom: "15px", fontWeight: "500" }}>{success}</div>}

      <label>Title *</label>
      <input
        type="text"
        value={title}
        onChange={(e) => { setTitle(e.target.value); setError(""); }}
        className={error && !title ? "input-error" : ""}
      />

      <label>Subject *</label>
      <select
        value={selectedSubjectId}
        onChange={(e) => { setSelectedSubjectId(e.target.value); setError(""); }}
        className={error && !selectedSubjectId ? "input-error" : ""}
      >
        <option value="">Select Subject</option>
        {subjects.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {sub.name}
          </option>
        ))}
      </select>

      <label>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>Due Date *</label>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => { setDueDate(e.target.value); setError(""); }}
        className={error && !dueDate ? "input-error" : ""}
      />

      <label>Points</label>
      <input
        type="number"
        value={points}
        onChange={(e) => { setPoints(e.target.value); setError(""); }}
        className={error && points <= 0 ? "input-error" : ""}
      />

      <button onClick={handlePublish}>
        Publish Assignment
      </button>
    </div>
  );
}

export default TeacherCreate;