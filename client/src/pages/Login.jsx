import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setLoginError("");
    setShowForgotPassword(false);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        setLoginError("Please verify your email before accessing UniCircle.");
        return;
      }

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setLoginError("Incorrect email or password.");
        setShowForgotPassword(true);
      } else if (error.code === "auth/user-not-found") {
        setLoginError("No account found with this email.");
      } else if (error.code === "auth/invalid-email") {
        setLoginError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setLoginError("Too many failed attempts. Please try again later.");
        setShowForgotPassword(true);
      } else {
        setLoginError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← Back to Home
        </button>

        <h1 style={styles.title}>Login</h1>

        <p style={styles.subtitle}>Sign in to your UniCircle account</p>

        {loginError && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{loginError}</p>

            {showForgotPassword && (
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                style={styles.forgotButton}
              >
                Forgot your password?
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your university email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            style={styles.smallForgotButton}
          >
            Forgot your password?
          </button>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.footerText}>
          Do not have an account?{" "}
          <button onClick={() => navigate("/register")} style={styles.linkButton}>
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "420px",
  },
  backButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "18px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "8px",
    color: "#111827",
  },
  subtitle: {
    color: "#666",
    textAlign: "center",
    marginBottom: "24px",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "18px",
    textAlign: "center",
  },
  errorText: {
    margin: "0 0 8px",
    fontSize: "14px",
  },
  forgotButton: {
    backgroundColor: "#991b1b",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  smallForgotButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "right",
    padding: 0,
    alignSelf: "flex-end",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
  },
  footerText: {
    textAlign: "center",
    marginTop: "20px",
    color: "#666",
  },
  linkButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
};

export default Login;