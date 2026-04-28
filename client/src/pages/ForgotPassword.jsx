import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase(), {
        url: `${window.location.origin}/login`,
      });

      setMessage(
        "Password reset email sent. Please check your inbox and follow the link to reset your password."
      );
    } catch (error) {
      console.error("Password reset error:", error);

      if (error.code === "auth/user-not-found") {
        alert("No account found with this email address.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else {
        alert("Error sending password reset email: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => navigate("/login")} style={styles.backButton}>
          ← Back to Login
        </button>

        <h1 style={styles.title}>Reset Password</h1>

        <p style={styles.subtitle}>
          Enter your account email and we will send you a password reset link.
        </p>

        {message && <div style={styles.successBox}>{message}</div>}

        <form onSubmit={handleResetPassword} style={styles.form}>
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

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        <p style={styles.footerText}>
          Remembered your password?{" "}
          <button onClick={() => navigate("/login")} style={styles.linkButton}>
            Login here
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
    maxWidth: "430px",
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
    lineHeight: "1.5",
  },
  successBox: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "18px",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
    boxSizing: "border-box",
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

export default ForgotPassword;