import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

function Profile() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }

      setUser(currentUser);
      await fetchUserListings(currentUser.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserListings = async (userId) => {
    try {
      const q = query(
        collection(db, "listings"),
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
      alert(error.message);
    }
  };

  const handleViewListing = (listingId) => {
    window.location.href = `/listing/${listingId}`;
  };

  const handleToggleStatus = async (listing) => {
    try {
      const newStatus = listing.status === "sold" ? "active" : "sold";

      await updateDoc(doc(db, "listings", listing.id), {
        status: newStatus,
      });

      setListings((prevListings) =>
        prevListings.map((item) =>
          item.id === listing.id ? { ...item, status: newStatus } : item
        )
      );

      alert(`Listing marked as ${newStatus}.`);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteListing = async (listingId) => {
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
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.loadingText}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Profile</h1>
            <p style={styles.subtitle}>Manage your UniCircle listings</p>
          </div>

          <a href="/" style={styles.homeButton}>
            Back to Home
          </a>
        </div>

        <div style={styles.profileCard}>
          <h2 style={styles.profileTitle}>Account Details</h2>
          <p style={styles.profileText}>
            <strong>Email:</strong> {user?.email}
          </p>
        </div>

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Listings</h2>
          <a href="/create" style={styles.createButton}>
            Create New Listing
          </a>
        </div>

        {listings.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>You have not created any listings yet.</p>
            <a href="/create" style={styles.emptyButton}>
              Sell Your First Item
            </a>
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
                    <span style={styles.imageText}>No Image</span>
                  )}
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.cardTop}>
                    <p style={styles.category}>{listing.category}</p>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          listing.status === "sold" ? "#fee2e2" : "#dcfce7",
                        color:
                          listing.status === "sold" ? "#991b1b" : "#166534",
                      }}
                    >
                      {listing.status || "active"}
                    </span>
                  </div>

                  <h3 style={styles.itemTitle}>{listing.title}</h3>

                  <p style={styles.price}>£{listing.price}</p>

                  <p style={styles.info}>
                    <strong>Location:</strong> {listing.location}
                  </p>

                  <p style={styles.info}>
                    <strong>Condition:</strong> {listing.condition}
                  </p>

                  <p style={styles.description}>{listing.description}</p>

                  <div style={styles.buttonGroup}>
                    <button
                      onClick={() => handleViewListing(listing.id)}
                      style={styles.viewButton}
                    >
                      View Listing
                    </button>

                    <button
                      onClick={() => handleToggleStatus(listing)}
                      style={styles.statusButton}
                    >
                      {listing.status === "sold"
                        ? "Mark as Active"
                        : "Mark as Sold"}
                    </button>

                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      style={styles.deleteButton}
                    >
                      Delete Listing
                    </button>
                  </div>
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
    maxWidth: "1150px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "34px",
    margin: 0,
    color: "#111827",
  },
  subtitle: {
    marginTop: "6px",
    color: "#6b7280",
  },
  homeButton: {
    textDecoration: "none",
    backgroundColor: "#111827",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
  },
  profileCard: {
    backgroundColor: "white",
    padding: "22px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: "30px",
  },
  profileTitle: {
    marginTop: 0,
    marginBottom: "10px",
    fontSize: "22px",
  },
  profileText: {
    margin: 0,
    color: "#374151",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  sectionTitle: {
    fontSize: "26px",
    margin: 0,
  },
  createButton: {
    textDecoration: "none",
    backgroundColor: "#2563eb",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 3px 12px rgba(0,0,0,0.09)",
  },
  imageBox: {
    height: "180px",
    backgroundColor: "#d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#555",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imageText: {
    color: "#6b7280",
    fontWeight: "500",
  },
  cardContent: {
    padding: "18px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  category: {
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "bold",
    margin: 0,
  },
  statusBadge: {
    fontSize: "12px",
    fontWeight: "bold",
    padding: "5px 9px",
    borderRadius: "999px",
    textTransform: "capitalize",
  },
  itemTitle: {
    fontSize: "21px",
    margin: "12px 0 8px",
    color: "#111827",
  },
  price: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 12px",
    color: "#111827",
  },
  info: {
    fontSize: "14px",
    color: "#4b5563",
    margin: "6px 0",
  },
  description: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "12px",
    minHeight: "45px",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    marginTop: "16px",
  },
  viewButton: {
    padding: "10px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  },
  statusButton: {
    padding: "10px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "10px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  },
  emptyBox: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  emptyText: {
    color: "#6b7280",
    marginBottom: "18px",
  },
  emptyButton: {
    textDecoration: "none",
    backgroundColor: "#2563eb",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
  },
  loadingText: {
    textAlign: "center",
    fontSize: "18px",
    color: "#374151",
  },
};

export default Profile;