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
  const [filter, setFilter] = useState("all");

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

  const activeListings = listings.filter(
    (listing) => (listing.status || "active") === "active"
  );

  const soldListings = listings.filter((listing) => listing.status === "sold");

  const totalValue = listings.reduce((total, listing) => {
    return total + Number(listing.price || 0);
  }, 0);

  const filteredListings = listings.filter((listing) => {
    const status = listing.status || "active";

    if (filter === "all") return true;
    return status === filter;
  });

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <p style={styles.loadingText}>Loading your seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Seller Dashboard</h1>
            <p style={styles.subtitle}>
              Manage your UniCircle listings and track your selling activity.
            </p>
          </div>

          <div style={styles.headerButtons}>
            <a href="/" style={styles.darkButton}>
              Back to Home
            </a>

            <a href="/create" style={styles.primaryButton}>
              Create Listing
            </a>
          </div>
        </div>

        <div style={styles.profilePanel}>
          <div>
            <h2 style={styles.profileTitle}>Profile Summary</h2>
            <p style={styles.profileText}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={styles.profileText}>
              <strong>Account status:</strong>{" "}
              {user?.emailVerified ? "Verified seller" : "Not verified"}
            </p>
          </div>

          <div style={styles.sellerBadge}>
            {user?.emailVerified ? "Verified" : "Unverified"}
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Listings</p>
            <h2 style={styles.statNumber}>{listings.length}</h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>Active Listings</p>
            <h2 style={styles.statNumber}>{activeListings.length}</h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>Sold Listings</p>
            <h2 style={styles.statNumber}>{soldListings.length}</h2>
          </div>

          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Listed Value</p>
            <h2 style={styles.statNumber}>£{totalValue}</h2>
          </div>
        </div>

        <div style={styles.managementBar}>
          <div>
            <h2 style={styles.sectionTitle}>My Listings</h2>
            <p style={styles.sectionSubtitle}>
              View, update, mark as sold, or delete your listings.
            </p>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Listings</option>
            <option value="active">Active Only</option>
            <option value="sold">Sold Only</option>
          </select>
        </div>

        {filteredListings.length === 0 ? (
          <div style={styles.emptyBox}>
            <h2 style={styles.emptyTitle}>No listings found</h2>
            <p style={styles.emptyText}>
              You do not have any listings in this category yet.
            </p>
            <a href="/create" style={styles.primaryButton}>
              Sell Your First Item
            </a>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredListings.map((listing) => {
              const status = listing.status || "active";

              return (
                <div key={listing.id} style={styles.card}>
                  <div style={styles.imageBox}>
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.placeholderContent}>
                        <span style={styles.imageText}>No Image</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.cardContent}>
                    <div style={styles.cardTop}>
                      <p style={styles.category}>
                        {listing.category || "Uncategorised"}
                      </p>

                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            status === "sold" ? "#fee2e2" : "#dcfce7",
                          color: status === "sold" ? "#991b1b" : "#166534",
                        }}
                      >
                        {status}
                      </span>
                    </div>

                    <h3 style={styles.itemTitle}>
                      {listing.title || "Untitled Listing"}
                    </h3>

                    <p style={styles.price}>£{listing.price || 0}</p>

                    <div style={styles.infoBox}>
                      <p style={styles.info}>
                        <strong>Location:</strong>{" "}
                        {listing.location || "Not provided"}
                      </p>

                      <p style={styles.info}>
                        <strong>Condition:</strong>{" "}
                        {listing.condition || "Not provided"}
                      </p>
                    </div>

                    <p style={styles.description}>
                      {listing.description || "No description provided."}
                    </p>

                    <div style={styles.buttonGroup}>
                      <button
                        onClick={() => handleViewListing(listing.id)}
                        style={styles.viewButton}
                      >
                        View Listing
                      </button>

                      <button
                        onClick={() => handleToggleStatus(listing)}
                        style={
                          status === "sold"
                            ? styles.activeButton
                            : styles.statusButton
                        }
                      >
                        {status === "sold" ? "Mark as Active" : "Mark as Sold"}
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
              );
            })}
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
    maxWidth: "1180px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  title: {
    fontSize: "36px",
    margin: 0,
    color: "#111827",
  },
  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "15px",
  },
  headerButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryButton: {
    textDecoration: "none",
    backgroundColor: "#2563eb",
    color: "white",
    padding: "11px 16px",
    borderRadius: "8px",
    fontWeight: "bold",
    display: "inline-block",
  },
  darkButton: {
    textDecoration: "none",
    backgroundColor: "#111827",
    color: "white",
    padding: "11px 16px",
    borderRadius: "8px",
    fontWeight: "bold",
  },
  profilePanel: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  profileTitle: {
    margin: "0 0 10px",
    fontSize: "23px",
    color: "#111827",
  },
  profileText: {
    margin: "6px 0",
    color: "#374151",
  },
  sellerBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "10px 14px",
    borderRadius: "999px",
    fontWeight: "bold",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "18px",
    marginBottom: "30px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "22px",
    borderRadius: "14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  },
  statNumber: {
    fontSize: "30px",
    margin: "8px 0 0",
    color: "#111827",
  },
  managementBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "27px",
    margin: 0,
    color: "#111827",
  },
  sectionSubtitle: {
    marginTop: "6px",
    color: "#6b7280",
  },
  filterSelect: {
    padding: "11px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    fontSize: "15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 3px 12px rgba(0,0,0,0.09)",
    display: "flex",
    flexDirection: "column",
  },
  imageBox: {
    height: "185px",
    backgroundColor: "#d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#555",
  },
  placeholderContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    color: "#6b7280",
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardContent: {
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
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
    padding: "5px 10px",
    borderRadius: "999px",
    textTransform: "capitalize",
  },
  itemTitle: {
    fontSize: "21px",
    margin: "12px 0 8px",
    color: "#111827",
  },
  price: {
    fontSize: "25px",
    fontWeight: "bold",
    margin: "0 0 12px",
    color: "#111827",
  },
  infoBox: {
    backgroundColor: "#f9fafb",
    padding: "10px",
    borderRadius: "8px",
  },
  info: {
    fontSize: "14px",
    color: "#4b5563",
    margin: "5px 0",
  },
  description: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "12px",
    lineHeight: "1.5",
    minHeight: "48px",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    marginTop: "auto",
    paddingTop: "16px",
  },
  viewButton: {
    padding: "10px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  statusButton: {
    padding: "10px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  activeButton: {
    padding: "10px",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  deleteButton: {
    padding: "10px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  emptyBox: {
    backgroundColor: "white",
    padding: "36px",
    borderRadius: "14px",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  emptyTitle: {
    marginTop: 0,
    color: "#111827",
  },
  emptyText: {
    color: "#6b7280",
    marginBottom: "20px",
  },
  loadingCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    maxWidth: "420px",
    margin: "100px auto",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  loadingText: {
    fontSize: "18px",
    color: "#374151",
  },
};

export default Profile;