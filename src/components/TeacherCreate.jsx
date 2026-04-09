import { useState, useEffect } from "react";
import "./TeacherDashboard.css";

function TeacherCreate() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState(100);

  // 🔥 LOAD SUBJECTS FROM BACKEND (FIXED)
  useEffect(() => {
    fetch("http://localhost:8080/subjects")
      .then((res) => res.json())
      .then((data) => {
        console.log("Subjects:", data);
        setSubjects(data);
      })
      .catch((err) => console.error("Error loading subjects:", err));
  }, []);

  // ✅ CREATE ASSIGNMENT
  const handlePublish = () => {
    if (!title || !selectedSubjectId || !dueDate) {
      alert("Please fill all required fields");
      return;
    }

    fetch("http://localhost:8080/assignments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        description,
        dueDate,
        points: Number(points),
        subjectId: Number(selectedSubjectId) // 🔥 IMPORTANT FIX
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create assignment");
        return res.json();
      })
      .then(() => {
        alert("Assignment Created Successfully!");

        // 🔥 RESET FORM
        setTitle("");
        setDescription("");
        setDueDate("");
        setPoints(100);
        setSelectedSubjectId("");

        // 🔥 OPTIONAL: refresh dashboard
        window.location.reload(); 
      })
      .catch((err) => {
        console.error("ERROR:", err);
        alert("Error creating assignment");
      });
  };

  return (
    <div className="create-layout">
      <h2>Create Assignment</h2>

      <label>Title *</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Subject *</label>
      <select
        value={selectedSubjectId}
        onChange={(e) => setSelectedSubjectId(e.target.value)}
      >
        <option value="">Select Subject</option>

        {/* 🔥 BACKEND SUBJECTS */}
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
        onChange={(e) => setDueDate(e.target.value)}
      />

      <label>Points</label>
      <input
        type="number"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
      />

      <button onClick={handlePublish}>
        Publish Assignment
      </button>
    </div>
  );
}

export default TeacherCreate;