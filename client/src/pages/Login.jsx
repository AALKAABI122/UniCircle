import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      if (!userCredential.user.emailVerified) {
        alert("Please verify your email before accessing UniCircle.");
        await signOut(auth);
        return;
      }

      alert("Login successful!");
      window.location.href = "/";
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>

        <p style={styles.subtitle}>Sign in to your UniCircle account</p>

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

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <p style={styles.footerText}>
          Do not have an account?{" "}
          <a href="/register" style={styles.link}>
            Register here
          </a>
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
  },
  card: {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#666",
    textAlign: "center",
    marginBottom: "24px",
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
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  footerText: {
    textAlign: "center",
    marginTop: "20px",
    color: "#666",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};

export default Login;