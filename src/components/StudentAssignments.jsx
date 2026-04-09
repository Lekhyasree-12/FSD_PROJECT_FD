import { useState, useEffect } from "react";
import "./StudentAssignments.css";

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({});

  const studentId = 1;

  // Load data
  const loadAssignments = () => {
    fetch("http://localhost:8080/assignments")
      .then(res => res.json())
      .then(data => setAssignments(data));
  };

  const loadSubmissions = () => {
    fetch("http://localhost:8080/submissions")
      .then(res => res.json())
      .then(data => setSubmissions(data));
  };

  useEffect(() => {
    loadAssignments();
    loadSubmissions();
  }, []);

  // File select
  const handleFileChange = (assignmentId, file) => {
    setSelectedFiles(prev => ({
      ...prev,
      [assignmentId]: file
    }));
  };

  // 🔥 SUBMIT
  const handleSubmit = (assignmentId) => {
    const file = selectedFiles[assignmentId];

    if (!file) {
      alert("Select file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", studentId);
    formData.append("assignmentId", assignmentId);

    fetch("http://localhost:8080/submissions", {
      method: "POST",
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to submit");
        return res.text();
      })
      .then(() => {
        alert("Submitted!");
        setSelectedFiles(prev => {
          const updated = { ...prev };
          delete updated[assignmentId];
          return updated;
        });
        loadSubmissions();
      })
      .catch(err => console.error("Submit error:", err));
  };

  // 🔥 DELETE
  const handleDelete = (submissionId) => {
    fetch(`http://localhost:8080/submissions/${submissionId}`, {
      method: "DELETE"
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete");
        return res.text();
      })
      .then(() => {
        alert("Deleted!");
        loadSubmissions();
      })
      .catch(err => console.error("Delete error:", err));
  };

  // 🔥 UPDATE (re-upload)
  const handleUpdate = (submissionId, assignmentId) => {
    const file = selectedFiles[assignmentId];

    if (!file) {
      alert("Select new file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch(`http://localhost:8080/submissions/${submissionId}`, {
      method: "PUT",
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update");
        return res.text();
      })
      .then(() => {
        alert("Updated!");
        setSelectedFiles(prev => {
          const updated = { ...prev };
          delete updated[assignmentId];
          return updated;
        });
        loadSubmissions();
      })
      .catch(err => console.error("Update error:", err));
  };

  const filteredAssignments = assignments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="assignments-container">
      <h1>Assignments</h1>

      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {filteredAssignments.map((a) => {
        const submission = submissions.find(
          (s) => s.assignmentId === a.id && s.studentId === studentId
        );

        return (
          <div key={a.id} className="assignment-card">
            <h3>{a.title}</h3>
            <p>{a.description}</p>

            {/* FILE INPUT ALWAYS AVAILABLE */}
            <input
              type="file"
              onChange={(e) =>
                handleFileChange(a.id, e.target.files[0])
              }
            />

            {submission ? (
              <>
                <p>Submitted: {submission.fileName}</p>

                <button
                  onClick={() =>
                    handleUpdate(submission.id, a.id)
                  }
                >
                  Update
                </button>

                <button
                  onClick={() =>
                    handleDelete(submission.id)
                  }
                >
                  Delete
                </button>
              </>
            ) : (
              <button onClick={() => handleSubmit(a.id)}>
                Submit
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StudentAssignments;