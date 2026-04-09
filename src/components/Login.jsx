import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "./logo.png";

function Login({ setRole }) {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // ================= MAIN HANDLER =================
  const handleAuth = () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (isSignUp) {
      registerUser();
    } else {
      loginUser();
    }
  };

  // ================= REGISTER =================
  const registerUser = () => {
    fetch("http://localhost:8080/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: email,
        email: email,
        password: password,
        role: selectedRole.toUpperCase()
      })
    })
      .then(res => res.json())
      .then(user => {
        console.log("REGISTERED:", user);
        alert("Account created successfully!");

        // 🔥 directly navigate after register
        localStorage.setItem("loggedInUser", user.email);
        localStorage.setItem("role", user.role.toLowerCase());

        setRole(user.role.toLowerCase());

        navigate(`/${user.role.toLowerCase()}`);
      })
      .catch(err => {
        console.error(err);
        alert("Registration failed");
      });
  };

  // ================= LOGIN =================
  const loginUser = () => {
    fetch("http://localhost:8080/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
      .then(res => res.text())
      .then(text => {
        console.log("RAW RESPONSE:", text);

        if (!text || text === "null") {
          alert("Invalid email or password");
          return;
        }

        const user = JSON.parse(text);

        // 🔥 ROLE CHECK (IMPORTANT)
        if (user.role.toLowerCase() !== selectedRole) {
          alert(`You are registered as ${user.role}`);
          return;
        }

        console.log("LOGIN SUCCESS:", user);

        localStorage.setItem("loggedInUser", user.email);
        localStorage.setItem("role", user.role.toLowerCase());

        setRole(user.role.toLowerCase());

        navigate(`/${user.role.toLowerCase()}`);
      })
      .catch(err => {
        console.error(err);
        alert("Login failed");
      });
  };

  return (
    <div className="login-page">
      <div className="brand">
        <img src={logo} alt="logo" />
        <h2>GradeSphere</h2>
      </div>

      <div className="login-card">
        <h1>{isSignUp ? "Sign Up" : "Sign In"}</h1>

        <p className="subtitle">
          {isSignUp ? "Create your account" : "Login to continue"}
        </p>

        <label>I am a:</label>
        <div className="role-toggle">
          <button
            className={selectedRole === "student" ? "active" : ""}
            onClick={() => setSelectedRole("student")}
          >
            Student
          </button>

          <button
            className={selectedRole === "teacher" ? "active" : ""}
            onClick={() => setSelectedRole("teacher")}
          >
            Teacher
          </button>

          <button
            className={selectedRole === "admin" ? "active" : ""}
            onClick={() => setSelectedRole("admin")}
          >
            Admin
          </button>
        </div>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleAuth}>
          {isSignUp ? "Create Account" : "Login"}
        </button>

        <p className="signup-text">
          {isSignUp
            ? "Already have an account?"
            : "Don't have an account?"}

          <span onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? " Sign In" : " Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;