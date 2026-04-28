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
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");

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

  const clearFilters = () => {
    setSearchText("");
    setCategoryFilter("");
    setLocationFilter("");
    setConditionFilter("");
  };

  const filteredListings = listings.filter((item) => {
    const search = searchText.toLowerCase();

    const matchesSearch =
      item.title?.toLowerCase().includes(search) ||
      item.category?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.location?.toLowerCase().includes(search) ||
      item.condition?.toLowerCase().includes(search);

    const matchesCategory =
      categoryFilter === "" || item.category === categoryFilter;

    const matchesLocation =
      locationFilter === "" || item.location === locationFilter;

    const matchesCondition =
      conditionFilter === "" || item.condition === conditionFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesCondition
    );
  });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logoBox} onClick={() => navigate("/")}>
          <div style={styles.logoIcon}>U</div>
          <div>
            <h1 style={styles.logo}>UniCircle</h1>
            <p style={styles.tagline}>Student marketplace</p>
          </div>
        </div>

        <nav style={styles.nav}>
          <button onClick={() => navigate("/")} style={styles.navButton}>
            Home
          </button>

          {user ? (
            <>
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
        <div style={styles.heroContent}>
          <p style={styles.heroBadge}>University of Brighton Marketplace</p>

          <h2 style={styles.heroTitle}>
            Buy and sell student essentials safely
          </h2>

          <p style={styles.heroText}>
            Find affordable books, electronics, furniture, clothes, and more from
            students around Brighton campuses.
          </p>

          <div style={styles.searchPanel}>
            <input
              type="text"
              placeholder="Search for laptops, books, furniture..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={styles.searchInput}
            />

            <div style={styles.filtersRow}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Furniture">Furniture</option>
                <option value="Clothing">Clothing</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Locations</option>
                <option value="Moulsecoomb Campus">Moulsecoomb Campus</option>
                <option value="Falmer Campus">Falmer Campus</option>
                <option value="City Campus">City Campus</option>
                <option value="Varley Park">Varley Park</option>
                <option value="Other Brighton Area">Other Brighton Area</option>
              </select>

              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Conditions</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Used">Used</option>
                <option value="Needs Repair">Needs Repair</option>
              </select>

              <button onClick={clearFilters} style={styles.clearButton}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Latest Listings</h2>
            <p style={styles.sectionSubtitle}>
              {loadingListings
                ? "Loading marketplace items..."
                : `${filteredListings.length} item${
                    filteredListings.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          <button
            onClick={() => navigate(user ? "/create" : "/login")}
            style={styles.secondarySellButton}
          >
            + Add Listing
          </button>
        </div>

        {loadingListings ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>Loading listings...</h3>
            <p style={styles.emptyText}>Please wait while we load the marketplace.</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No listings found</h3>
            <p style={styles.emptyText}>
              Try changing your search or clearing the filters.
            </p>
            <button onClick={clearFilters} style={styles.emptyButton}>
              Clear Filters
            </button>
          </div>
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
                    <div style={styles.noImageBox}>
                      <span style={styles.noImageIcon}>📦</span>
                      <span>No Image</span>
                    </div>
                  )}

                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        item.status === "sold" ? "#fee2e2" : "#dcfce7",
                      color: item.status === "sold" ? "#991b1b" : "#166534",
                    }}
                  >
                    {item.status || "active"}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.cardTopRow}>
                    <p style={styles.category}>{item.category}</p>
                    <p style={styles.price}>£{item.price}</p>
                  </div>

                  <h3 style={styles.itemTitle}>{item.title}</h3>

                  <p style={styles.description}>
                    {item.description?.length > 90
                      ? item.description.slice(0, 90) + "..."
                      : item.description}
                  </p>

                  <div style={styles.infoBox}>
                    <p style={styles.infoText}>📍 {item.location}</p>
                    <p style={styles.infoText}>⭐ {item.condition}</p>
                  </div>

                  <button
                    style={styles.viewButton}
                    onClick={() => navigate(`/listing/${item.id}`)}
                  >
                    View Details
                  </button>
                </div>
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
    backgroundColor: "#f4f6f8",
    fontFamily: "Arial, sans-serif",
    color: "#111827",
  },
  header: {
    backgroundColor: "white",
    padding: "18px 48px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 12px rgba(15, 23, 42, 0.08)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  logoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "22px",
  },
  logo: {
    margin: 0,
    fontSize: "25px",
    color: "#111827",
  },
  tagline: {
    margin: 0,
    color: "#6b7280",
    fontSize: "13px",
  },
  nav: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  navButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#374151",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    padding: "10px 12px",
  },
  profileButton: {
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  sellButton: {
    textDecoration: "none",
    backgroundColor: "#2563eb",
    color: "white",
    padding: "11px 16px",
    borderRadius: "8px",
    fontWeight: "600",
  },
  hero: {
    background:
      "linear-gradient(135deg, #dbeafe 0%, #eef2ff 45%, #f8fafc 100%)",
    padding: "70px 20px",
  },
  heroContent: {
    maxWidth: "1000px",
    margin: "0 auto",
    textAlign: "center",
  },
  heroBadge: {
    display: "inline-block",
    backgroundColor: "white",
    color: "#2563eb",
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "14px",
    marginBottom: "18px",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.12)",
  },
  heroTitle: {
    fontSize: "44px",
    lineHeight: "1.1",
    margin: "0 0 16px",
    color: "#111827",
  },
  heroText: {
    fontSize: "18px",
    color: "#4b5563",
    maxWidth: "720px",
    margin: "0 auto 28px",
    lineHeight: "1.6",
  },
  searchPanel: {
    backgroundColor: "white",
    padding: "18px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
    maxWidth: "900px",
    margin: "0 auto",
  },
  searchInput: {
    width: "100%",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
    boxSizing: "border-box",
    marginBottom: "12px",
  },
  filtersRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr auto",
    gap: "10px",
  },
  filterSelect: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    backgroundColor: "white",
  },
  clearButton: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "#f9fafb",
    color: "#374151",
    fontWeight: "600",
    cursor: "pointer",
  },
  section: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "44px 20px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
  },
  sectionTitle: {
    fontSize: "30px",
    margin: "0 0 6px",
  },
  sectionSubtitle: {
    margin: 0,
    color: "#6b7280",
  },
  secondarySellButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
  },
  imagePlaceholder: {
    height: "180px",
    backgroundColor: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    position: "relative",
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImageBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    fontWeight: "600",
  },
  noImageIcon: {
    fontSize: "28px",
  },
  statusBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  cardBody: {
    padding: "18px",
  },
  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  category: {
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "800",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  price: {
    fontSize: "22px",
    fontWeight: "800",
    margin: 0,
    color: "#111827",
  },
  itemTitle: {
    fontSize: "20px",
    margin: "12px 0 8px",
    color: "#111827",
  },
  description: {
    color: "#6b7280",
    minHeight: "44px",
    lineHeight: "1.5",
    marginBottom: "14px",
  },
  infoBox: {
    backgroundColor: "#f9fafb",
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "14px",
  },
  infoText: {
    color: "#374151",
    fontSize: "14px",
    margin: "4px 0",
  },
  viewButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
  },
  emptyState: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "40px 20px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
  },
  emptyTitle: {
    fontSize: "24px",
    margin: "0 0 8px",
  },
  emptyText: {
    color: "#6b7280",
    marginBottom: "18px",
  },
  emptyButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default Home;