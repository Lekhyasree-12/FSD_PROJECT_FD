import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {

  // 🔥 SUBJECT STATES
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");

  const navigate = useNavigate();

  // 🔥 USER STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  // 🔥 LOGOUT FUNCTION (ADDED)
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("role");
    navigate("/");
  };

  // ================= LOAD SUBJECTS =================
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = () => {
    fetch("http://localhost:8080/subjects")
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

    fetch("http://localhost:8080/users/register", {
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

    fetch("http://localhost:8080/subjects", {
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
    fetch(`http://localhost:8080/subjects/${id}`, {
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