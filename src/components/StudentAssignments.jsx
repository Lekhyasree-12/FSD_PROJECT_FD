import { useState, useEffect } from "react";
import "./StudentAssignments.css";

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({});
  const [messages, setMessages] = useState({}); // To store success/error msgs per assignment { id: { type: 'error', text: '...' } }

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
      setMessages({ ...messages, [assignmentId]: { type: "error", text: "Please select a file first." } });
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
        setMessages({ ...messages, [assignmentId]: { type: "success", text: "Assignment submitted successfully!" } });
        setSelectedFiles(prev => {
          const updated = { ...prev };
          delete updated[assignmentId];
          return updated;
        });
        loadSubmissions();
        setTimeout(() => setMessages(prev => ({...prev, [assignmentId]: null})), 3000);
      })
      .catch(err => {
        console.error("Submit error:", err);
        setMessages({ ...messages, [assignmentId]: { type: "error", text: "Failed to submit assignment." } });
      });
  };

  // 🔥 DELETE
  const handleDelete = (submissionId, assignmentId) => {
    fetch(`http://localhost:8080/submissions/${submissionId}`, {
      method: "DELETE"
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete");
        return res.text();
      })
      .then(() => {
        setMessages({ ...messages, [assignmentId]: { type: "success", text: "Submission deleted!" } });
        loadSubmissions();
        setTimeout(() => setMessages(prev => ({...prev, [assignmentId]: null})), 3000);
      })
      .catch(err => {
        console.error("Delete error:", err);
        setMessages({ ...messages, [assignmentId]: { type: "error", text: "Failed to delete submission." } });
      });
  };

  // 🔥 UPDATE (re-upload)
  const handleUpdate = (submissionId, assignmentId) => {
    const file = selectedFiles[assignmentId];

    if (!file) {
      setMessages({ ...messages, [assignmentId]: { type: "error", text: "Please choose a new file to update." } });
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
        setMessages({ ...messages, [assignmentId]: { type: "success", text: "Assignment updated successfully!" } });
        setSelectedFiles(prev => {
          const updated = { ...prev };
          delete updated[assignmentId];
          return updated;
        });
        loadSubmissions();
        setTimeout(() => setMessages(prev => ({...prev, [assignmentId]: null})), 3000);
      })
      .catch(err => {
        console.error("Update error:", err);
        setMessages({ ...messages, [assignmentId]: { type: "error", text: "Failed to update assignment." } });
      });
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

            {messages[a.id] && (
              <div style={{
                padding: "8px", 
                borderRadius: "6px", 
                marginTop: "10px",
                fontSize: "14px",
                backgroundColor: messages[a.id].type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                color: messages[a.id].type === "error" ? "#ef4444" : "#16a34a",
                border: `1px solid ${messages[a.id].type === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)"}`
              }}>
                {messages[a.id].text}
              </div>
            )}

            {submission ? (
              <div style={{ marginTop: "15px", padding: "15px", background: "rgba(0,0,0,0.02)", borderRadius: "8px", border: "1px dashed #ccc" }}>
                <p style={{ fontWeight: "bold", color: "#16a34a" }}>✅ Submitted: {submission.fileName}</p>
                
                <div style={{ marginTop: "15px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "5px" }}>
                    Select new file to update:
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(a.id, e.target.files[0])}
                    style={{ marginBottom: "10px" }}
                  />
                  <br />
                  <button onClick={() => handleUpdate(submission.id, a.id)} className="btn-primary" style={{ marginRight: "10px" }}>
                    Update File
                  </button>
                  <button onClick={() => handleDelete(submission.id, a.id)} className="btn-secondary" style={{ background: "#ef4444" }}>
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: "15px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "5px" }}>
                  Select file to submit:
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(a.id, e.target.files[0])}
                  style={{ marginBottom: "10px" }}
                />
                <br />
                <button onClick={() => handleSubmit(a.id)} className="btn-primary">
                  Submit Assignment
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StudentAssignments;