import React, { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";

function CreateListing() {
  const navigate = useNavigate();

  const CLOUDINARY_CLOUD_NAME = "ddupw7rbg";
  const CLOUDINARY_UPLOAD_PRESET = "unicircle-listings";

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please choose a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) {
      return "";
    }

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Image upload failed.");
    }

    return data.secure_url;
  };

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
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const uploadedImageUrl = await uploadImageToCloudinary();

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
        imageUrl: uploadedImageUrl,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "listings"), newListing);

      setTitle("");
      setPrice("");
      setCategory("");
      setLocation("");
      setCondition("");
      setDescription("");
      setImageFile(null);
      setImagePreview("");

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
          <button onClick={() => navigate("/")} style={styles.backButton}>
            ← Back to Home
          </button>

          <p style={styles.subtitle}>Checking login status...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← Back to Home
        </button>

        <div style={styles.headerBox}>
          <p style={styles.badge}>Create Listing</p>

          <h1 style={styles.title}>Sell an Item</h1>

          <p style={styles.subtitle}>
            Add your item details and upload a clear product photo so other
            Brighton students can see the real condition.
          </p>
        </div>

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
            <label style={styles.label}>Product Image</label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={styles.fileInput}
            />

            <p style={styles.helpText}>
              Optional, but recommended. Upload a clear photo under 5MB.
            </p>
          </div>

          {imagePreview && (
            <div style={styles.previewBox}>
              <p style={styles.previewLabel}>Image Preview</p>

              <img
                src={imagePreview}
                alt="Listing preview"
                style={styles.previewImage}
              />

              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview("");
                }}
                style={styles.removeImageButton}
              >
                Remove Image
              </button>
            </div>
          )}

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
            {loading ? "Creating Listing..." : "Create Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #dbeafe 0%, #eef2ff 45%, #f8fafc 100%)",
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
    color: "#111827",
  },

  card: {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
    width: "100%",
    maxWidth: "700px",
    border: "1px solid #e5e7eb",
  },

  backButton: {
    marginBottom: "20px",
    padding: "10px 14px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
    fontWeight: "700",
  },

  headerBox: {
    textAlign: "center",
    marginBottom: "28px",
  },

  badge: {
    display: "inline-block",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "7px 12px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "13px",
    margin: "0 0 12px",
  },

  title: {
    fontSize: "34px",
    fontWeight: "800",
    textAlign: "center",
    margin: "0 0 8px",
  },

  subtitle: {
    color: "#6b7280",
    textAlign: "center",
    margin: 0,
    lineHeight: "1.6",
  },

  warningBox: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "600",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "700",
    color: "#111827",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "16px",
    boxSizing: "border-box",
    outlineColor: "#2563eb",
    backgroundColor: "white",
  },

  fileInput: {
    width: "100%",
    padding: "12px",
    border: "1px dashed #93c5fd",
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    fontSize: "15px",
    boxSizing: "border-box",
    cursor: "pointer",
  },

  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "16px",
    resize: "vertical",
    boxSizing: "border-box",
    outlineColor: "#2563eb",
  },

  helpText: {
    color: "#6b7280",
    fontSize: "13px",
    margin: "7px 0 0",
    lineHeight: "1.5",
  },

  previewBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "14px",
  },

  previewLabel: {
    margin: "0 0 10px",
    fontWeight: "700",
    color: "#374151",
  },

  previewImage: {
    width: "100%",
    maxHeight: "320px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    display: "block",
  },

  removeImageButton: {
    marginTop: "12px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    cursor: "pointer",
    fontWeight: "700",
  },

  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "17px",
    fontWeight: "800",
    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.25)",
  },
};

export default CreateListing;