import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
import logo from "./logo.png";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  // ================= MAIN HANDLER =================
  const handleAuth = () => {
    setError(""); // Clear previous errors

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (isSignUp) {
      registerUser();
    } else {
      loginUser();
    }
  };

  // ================= REGISTER =================
  const registerUser = async () => {
    try {
      const user = await AuthAPI.register({
        name: email,
        email: email,
        password: password,
        role: selectedRole.toUpperCase()
      });

      console.log("REGISTERED:", user);
      
      login({ id: user.email, role: user.role.toLowerCase() });
      navigate(`/${user.role.toLowerCase()}`);
    } catch (err) {
      console.error(err);
      setError("Registration failed. Email might already exist.");
    }
  };

  // ================= LOGIN =================
  const loginUser = async () => {
    try {
      const responseText = await AuthAPI.login({
        email: email,
        password: password
      });

      if (!responseText || responseText === "null") {
        setError("Invalid email or password");
        return;
      }

      let user;
      try {
        user = typeof responseText === "string" ? JSON.parse(responseText) : responseText;
      } catch(e) {
        user = responseText;
      }

      if (!user || !user.role) {
        setError("Invalid email or password");
        return;
      }

      if (user.role.toLowerCase() !== selectedRole) {
        setError(`You are registered as ${user.role}, not ${selectedRole}`);
        return;
      }

      console.log("LOGIN SUCCESS:", user);

      login({ id: user.email, role: user.role.toLowerCase() });
      navigate(`/${user.role.toLowerCase()}`);
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your credentials.");
    }
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

        {error && <div className="error-message">{error}</div>}

        <label>I am a:</label>
        <div className="role-toggle">
          <button
            className={selectedRole === "student" ? "active" : ""}
            onClick={() => { setSelectedRole("student"); setError(""); }}
          >
            Student
          </button>

          <button
            className={selectedRole === "teacher" ? "active" : ""}
            onClick={() => { setSelectedRole("teacher"); setError(""); }}
          >
            Teacher
          </button>

          <button
            className={selectedRole === "admin" ? "active" : ""}
            onClick={() => { setSelectedRole("admin"); setError(""); }}
          >
            Admin
          </button>
        </div>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          className={error && !email.includes("@") ? "input-error" : ""}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          className={error && !password ? "input-error" : ""}
        />

        <button className="login-btn" onClick={handleAuth}>
          {isSignUp ? "Create Account" : "Login"}
        </button>

        <p className="signup-text">
          {isSignUp
            ? "Already have an account?"
            : "Don't have an account?"}

          <span onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}>
            {isSignUp ? " Sign In" : " Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;