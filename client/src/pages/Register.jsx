import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const lowerEmail = email.toLowerCase();
    const emailDomain = lowerEmail.split("@")[1];

    if (!emailDomain || !emailDomain.includes("uni")) {
      alert("Please use a valid university email address.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(userCredential.user);

      alert("Account created. Please verify your email before logging in.");

      window.location.href = "/login";
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>

        <p style={styles.subtitle}>
          Use your university email to join UniCircle
        </p>

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="email"
            placeholder="University Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>

        <p style={styles.linkText}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  card: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    width: "350px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "8px",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  linkText: {
    marginTop: "15px",
  },
};

export default Register;