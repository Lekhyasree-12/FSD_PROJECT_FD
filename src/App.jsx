import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { useAuth } from "./context/AuthContext";

function App() {
  const { role } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/student"
        element={
          role === "student" ? <StudentDashboard /> : <Navigate to="/" />
        }
      />

      <Route
        path="/teacher"
        element={
          role === "teacher" ? <TeacherDashboard /> : <Navigate to="/" />
        }
      />

      <Route
        path="/admin"
        element={
          role === "admin" ? <AdminDashboard /> : <Navigate to="/" />
        }
      />
    </Routes>
  );
}

export default App;