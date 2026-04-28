import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser || !currentUser.emailVerified) {
        navigate("/login");
        return;
      }

      setUser(currentUser);
      await fetchUserListings(currentUser.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserListings = async (userId) => {
    try {
      const listingsRef = collection(db, "listings");

      const q = query(
        listingsRef,
        where("sellerId", "==", userId)
      );

      const querySnapshot = await getDocs(q);

      const userListings = querySnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      userListings.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setListings(userListings);
    } catch (error) {
      alert("Error loading your listings: " + error.message);
    }
  };

  const handleDelete = async (listingId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "listings", listingId));

      setListings((prevListings) =>
        prevListings.filter((listing) => listing.id !== listingId)
      );

      alert("Listing deleted successfully.");
    } catch (error) {
      alert("Error deleting listing: " + error.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← Back to Home
        </button>

        <h1 style={styles.title}>My Profile</h1>

        {user && (
          <div style={styles.profileCard}>
            <h2 style={styles.cardTitle}>Account Details</h2>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>User ID:</strong> {user.uid}
            </p>
          </div>
        )}

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Listings</h2>

          <button onClick={() => navigate("/create")} style={styles.createButton}>
            Create New Listing
          </button>
        </div>

        {listings.length === 0 ? (
          <div style={styles.emptyBox}>
            <h3>No listings yet</h3>
            <p>You have not created any listings yet.</p>
            <button onClick={() => navigate("/create")} style={styles.createButton}>
              Sell an Item
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {listings.map((listing) => (
              <div key={listing.id} style={styles.card}>
                <div style={styles.imageBox}>
                  {listing.imageUrl ? (
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      style={styles.image}
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </div>

                <p style={styles.category}>{listing.category}</p>
                <h3 style={styles.itemTitle}>{listing.title}</h3>
                <p style={styles.description}>{listing.description}</p>

                <p style={styles.info}>
                  <strong>Location:</strong> {listing.location}
                </p>

                <p style={styles.info}>
                  <strong>Condition:</strong> {listing.condition}
                </p>

                <p style={styles.price}>£{listing.price}</p>
                <p style={styles.status}>Status: {listing.status}</p>

                <div style={styles.buttonRow}>
                  <button
                    onClick={() => navigate(`/listing/${listing.id}`)}
                    style={styles.viewButton}
                  >
                    View
                  </button>

                  <button
                    onClick={() => handleDelete(listing.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  backButton: {
    marginBottom: "20px",
    padding: "10px 14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
  },
  title: {
    fontSize: "34px",
    marginBottom: "20px",
    color: "#111827",
  },
  profileCard: {
    backgroundColor: "white",
    padding: "22px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: "30px",
  },
  cardTitle: {
    marginTop: 0,
    fontSize: "22px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "26px",
    margin: 0,
  },
  createButton: {
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  imageBox: {
    height: "160px",
    backgroundColor: "#d1d5db",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#555",
    marginBottom: "14px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  category: {
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "bold",
  },
  itemTitle: {
    fontSize: "20px",
    marginBottom: "8px",
  },
  description: {
    color: "#666",
    minHeight: "40px",
  },
  info: {
    color: "#444",
    fontSize: "14px",
  },
  price: {
    fontSize: "22px",
    fontWeight: "bold",
    marginTop: "10px",
  },
  status: {
    fontSize: "14px",
    color: "#555",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },
  viewButton: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteButton: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  emptyBox: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    color: "#666",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  loadingText: {
    textAlign: "center",
    fontSize: "18px",
  },
};

export default Profile;