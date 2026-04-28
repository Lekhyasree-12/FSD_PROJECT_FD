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

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    let level = "Weak";
    if (passed >= 5) level = "Strong";
    else if (passed >= 3) level = "Medium";
    return { level, checks, passed };
  };

  const strength = isSignUp ? getPasswordStrength(password) : null;

  // ================= MAIN HANDLER =================
  const handleAuth = () => {
    setError("");

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
        role: selectedRole
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
    const user = await AuthAPI.login({
      email: email,
      password: password
    });

    console.log("LOGIN RESPONSE:", user);

    if (!user || !user.role) {
      setError("Invalid email or password");
      return;
    }

    const role = user.role.toLowerCase();
    login({ id: user.email, role });
    navigate(`/${role}`);

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
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />

        {isSignUp && password && strength && (
          <div className="pwd-strength-box">
            <div className="pwd-bar-row">
              {[1,2,3,4,5].map(i => (
                <div
                  key={i}
                  className={`pwd-bar-seg ${
                    i <= strength.passed
                      ? strength.level === "Strong" ? "seg-strong"
                        : strength.level === "Medium" ? "seg-medium"
                        : "seg-weak"
                      : "seg-empty"
                  }`}
                />
              ))}
              <span className={`pwd-label pwd-label-${
                strength.level === "Strong" ? "strong"
                : strength.level === "Medium" ? "medium"
                : "weak"
              }`}>{strength.level}</span>
            </div>
            <div className="pwd-tips">
              {[
                { key: "length",    text: "At least 8 characters" },
                { key: "uppercase", text: "One uppercase letter (A-Z)" },
                { key: "lowercase", text: "One lowercase letter (a-z)" },
                { key: "number",    text: "One number (0-9)" },
                { key: "special",   text: "One special character (!@#...)" },
              ].map(({ key, text }) => (
                <div key={key} className={`pwd-tip ${ strength.checks[key] ? "tip-pass" : "tip-fail" }`}>
                  {strength.checks[key] ? "✓" : "✗"} {text}
                </div>
              ))}
            </div>
          </div>
        )}

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