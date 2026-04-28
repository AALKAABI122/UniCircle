import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsQuery = query(
          collection(db, "listings"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(listingsQuery);

        const listingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setListings(listingsData);
      } catch (error) {
        alert("Error loading listings: " + error.message);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchListings();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    alert("Logged out successfully.");
    navigate("/");
  };

  const handleSellClick = (e) => {
    if (!user) {
      e.preventDefault();
      alert("Please login with a verified email before selling an item.");
      navigate("/login");
    }
  };

  const filteredListings = listings.filter((item) => {
    const search = searchText.toLowerCase();

    return (
      item.title?.toLowerCase().includes(search) ||
      item.category?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.location?.toLowerCase().includes(search) ||
      item.condition?.toLowerCase().includes(search)
    );
  });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>UniCircle</h1>
          <p style={styles.tagline}>Buy and sell items with Brighton students</p>
        </div>

        <nav style={styles.nav}>
          {user ? (
            <>
              <span style={styles.userText}>{user.email}</span>

              <button
                onClick={() => navigate("/profile")}
                style={styles.profileButton}
              >
                My Profile
              </button>

              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/login")} style={styles.navButton}>
              Login
            </button>
          )}

          <a href="/create" onClick={handleSellClick} style={styles.sellButton}>
            Sell Item
          </a>
        </nav>
      </header>

      <section style={styles.hero}>
        <h2 style={styles.heroTitle}>Find affordable student essentials</h2>
        <p style={styles.heroText}>
          Browse second-hand items from students around the University of Brighton.
        </p>

        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search for laptops, books, furniture..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={styles.searchInput}
          />
          <button style={styles.searchButton}>Search</button>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Latest Listings</h2>

        {loadingListings ? (
          <p>Loading listings...</p>
        ) : filteredListings.length === 0 ? (
          <p>No listings found.</p>
        ) : (
          <div style={styles.grid}>
            {filteredListings.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.imagePlaceholder}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={styles.itemImage}
                    />
                  ) : (
                    "No Image"
                  )}
                </div>

                <p style={styles.category}>{item.category}</p>
                <h3 style={styles.itemTitle}>{item.title}</h3>
                <p style={styles.description}>{item.description}</p>
                <p style={styles.location}>{item.location}</p>
                <p style={styles.condition}>Condition: {item.condition}</p>
                <p style={styles.price}>£{item.price}</p>

                <button
                  style={styles.viewButton}
                  onClick={() => navigate(`/listing/${item.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    backgroundColor: "white",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  logo: {
    margin: 0,
    fontSize: "28px",
    color: "#2563eb",
  },
  tagline: {
    margin: 0,
    color: "#666",
  },
  nav: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  navButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#333",
    fontWeight: "500",
    fontSize: "16px",
    cursor: "pointer",
  },
  userText: {
    color: "#333",
    fontSize: "14px",
  },
  profileButton: {
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  sellButton: {
    textDecoration: "none",
    backgroundColor: "#2563eb",
    color: "white",
    padding: "10px 16px",
    borderRadius: "6px",
  },
  hero: {
    padding: "60px 20px",
    textAlign: "center",
    backgroundColor: "#e0ecff",
  },
  heroTitle: {
    fontSize: "36px",
    marginBottom: "12px",
  },
  heroText: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "24px",
  },
  searchBox: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  searchInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  searchButton: {
    padding: "12px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  section: {
    padding: "40px",
  },
  sectionTitle: {
    fontSize: "26px",
    marginBottom: "24px",
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
  imagePlaceholder: {
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
  itemImage: {
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
  location: {
    color: "#444",
    fontSize: "14px",
  },
  condition: {
    color: "#444",
    fontSize: "14px",
  },
  price: {
    fontSize: "22px",
    fontWeight: "bold",
    marginTop: "10px",
  },
  viewButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Home;