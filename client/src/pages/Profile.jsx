import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
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
      const listingsRef = collection(db, "listings");

      const q = query(
        listingsRef,
        where("sellerId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const userListings = querySnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      setListings(userListings);
    } catch (error) {
      alert(error.message);
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
      alert(error.message);
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
        <h1 style={styles.title}>My Profile</h1>

        {user && (
          <div style={styles.profileCard}>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>User ID:</strong> {user.uid}
            </p>
          </div>
        )}

        <h2 style={styles.sectionTitle}>My Listings</h2>

        {listings.length === 0 ? (
          <p style={styles.emptyText}>You have not created any listings yet.</p>
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

                <button
                  onClick={() => handleDelete(listing.id)}
                  style={styles.deleteButton}
                >
                  Delete Listing
                </button>
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
  title: {
    fontSize: "32px",
    marginBottom: "20px",
    color: "#111827",
  },
  profileCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "26px",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "10px",
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
  deleteButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "12px",
  },
  emptyText: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    color: "#666",
  },
  loadingText: {
    textAlign: "center",
    fontSize: "18px",
  },
};

export default Profile;