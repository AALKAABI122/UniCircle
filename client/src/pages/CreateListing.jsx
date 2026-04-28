import React, { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";

function CreateListing() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");

  const [seller, setSeller] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setSeller(currentUser);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (checkingAuth) {
      return;
    }

    if (!seller) {
      alert("You must be logged in to create a listing.");
      navigate("/login");
      return;
    }

    if (Number(price) <= 0) {
      alert("Price must be greater than 0.");
      return;
    }

    if (
      !title.trim() ||
      !category ||
      !location ||
      !condition ||
      !description.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const newListing = {
        title: title.trim(),
        price: Number(price),
        category,
        location,
        condition,
        description: description.trim(),
        sellerId: seller.uid,
        sellerEmail: seller.email,
        status: "active",
        imageUrl: "",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "listings"), newListing);

      setTitle("");
      setPrice("");
      setCategory("");
      setLocation("");
      setCondition("");
      setDescription("");

      navigate("/");
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Error creating listing: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.subtitle}>Checking login status...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sell an Item</h1>
        <p style={styles.subtitle}>
          Create a listing for other Brighton students to see.
        </p>

        {!seller && (
          <div style={styles.warningBox}>
            You need to log in before creating a listing.
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Item Title</label>
            <input
              type="text"
              placeholder="e.g. MacBook Pro 2020"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Price (£)</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="1"
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={styles.input}
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Furniture">Furniture</option>
              <option value="Clothing">Clothing</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
              style={styles.input}
            >
              <option value="">Select condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Used">Used</option>
              <option value="Needs Repair">Needs Repair</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              style={styles.input}
            >
              <option value="">Select location</option>
              <option value="Moulsecoomb Campus">Moulsecoomb Campus</option>
              <option value="Falmer Campus">Falmer Campus</option>
              <option value="City Campus">City Campus</option>
              <option value="Varley Park">Varley Park</option>
              <option value="Other Brighton Area">Other Brighton Area</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Description</label>
            <textarea
              placeholder="Describe the condition, reason for selling, collection details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="5"
              style={styles.textarea}
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
            {loading ? "Creating..." : "Create Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "650px",
  },
  title: {
    fontSize: "30px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#666",
    textAlign: "center",
    marginBottom: "28px",
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
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
  textarea: {
    width: "100%",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "17px",
  },
};

export default CreateListing;