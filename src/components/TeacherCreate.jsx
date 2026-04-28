import { useState, useEffect } from "react";
import { SubjectsAPI, AssignmentsAPI } from "../services/api";
import "./TeacherCreate.css";

function TeacherCreate() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState(100);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    SubjectsAPI.getAll()
      .then(data => setSubjects(data))
      .catch(() => setError("Failed to load subjects"));
  }, []);

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

    setLoading(true);
    try {
      await AssignmentsAPI.create({
        title,
        description,
        dueDate,
        points: Number(points),
        subjectId: Number(selectedSubjectId)
      });

      setSuccess("🎉 Assignment published successfully!");
      setTitle("");
      setDescription("");
      setDueDate("");
      setPoints(100);
      setSelectedSubjectId("");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to create assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = subjects.find(s => String(s.id) === String(selectedSubjectId));
  const formattedDate = dueDate ? new Date(dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <div className="tc-page">

      {/* Header */}
      <div className="tc-header">
        <div className="tc-header-icon">📝</div>
        <div>
          <h1>Create Assignment</h1>
          <p>Fill in the details below to publish a new assignment</p>
        </div>
      </div>

      <div className="tc-body">

        {/* LEFT — Form */}
        <div className="tc-form-card">

          {error && <div className="tc-alert tc-alert-error">⚠️ {error}</div>}
          {success && <div className="tc-alert tc-alert-success">{success}</div>}

          <div className="tc-field">
            <label><span className="tc-label-icon">✏️</span> Assignment Title <span className="tc-required">*</span></label>
            <input
              type="text"
              placeholder="e.g. Chapter 5 Homework"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              className={error && !title ? "tc-input-error" : ""}
            />
          </div>

          <div className="tc-field">
            <label><span className="tc-label-icon">📚</span> Subject <span className="tc-required">*</span></label>
            <select
              value={selectedSubjectId}
              onChange={(e) => { setSelectedSubjectId(e.target.value); setError(""); }}
              className={error && !selectedSubjectId ? "tc-input-error" : ""}
            >
              <option value="">— Select a Subject —</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className="tc-field">
            <label><span className="tc-label-icon">📄</span> Description</label>
            <textarea
              placeholder="Describe what students need to do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="tc-row">
            <div className="tc-field">
              <label><span className="tc-label-icon">📅</span> Due Date <span className="tc-required">*</span></label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); setError(""); }}
                className={error && !dueDate ? "tc-input-error" : ""}
              />
            </div>

            <div className="tc-field">
              <label><span className="tc-label-icon">🏆</span> Points</label>
              <input
                type="number"
                value={points}
                min="1"
                onChange={(e) => { setPoints(e.target.value); setError(""); }}
                className={error && points <= 0 ? "tc-input-error" : ""}
              />
            </div>
          </div>

          <button className="tc-publish-btn" onClick={handlePublish} disabled={loading}>
            {loading ? <span className="tc-spinner" /> : "🚀 Publish Assignment"}
          </button>
        </div>

        {/* RIGHT — Live Preview */}
        <div className="tc-preview-col">

          <div className="tc-preview-card">
            <div className="tc-preview-header">
              <span>👁️ Live Preview</span>
            </div>

            <div className="tc-preview-body">
              <div className="tc-preview-subject">
                {selectedSubject ? selectedSubject.name : "No subject selected"}
              </div>

              <h3 className="tc-preview-title">
                {title || "Assignment title will appear here"}
              </h3>

              <p className="tc-preview-desc">
                {description || "Description will appear here..."}
              </p>

              <div className="tc-preview-meta">
                <div className="tc-meta-item">
                  <span className="tc-meta-icon">📅</span>
                  <div>
                    <span className="tc-meta-label">Due Date</span>
                    <span className="tc-meta-value">{formattedDate || "—"}</span>
                  </div>
                </div>
                <div className="tc-meta-item">
                  <span className="tc-meta-icon">🏆</span>
                  <div>
                    <span className="tc-meta-label">Points</span>
                    <span className="tc-meta-value">{points}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="tc-tips-card">
            <h4>💡 Tips</h4>
            <ul>
              <li>Keep titles short and clear</li>
              <li>Add detailed descriptions so students know exactly what to do</li>
              <li>Set a realistic due date</li>
              <li>Use points to reflect assignment difficulty</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TeacherCreate;
