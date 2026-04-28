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
  const [sortOption, setSortOption] = useState("newest");

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
        console.error("Error loading listings:", error);
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
    setSortOption("newest");
  };

  const filteredListings = listings
    .filter((item) => {
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

      const isActive = !item.status || item.status === "active";

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesCondition &&
        isActive
      );
    })
    .sort((a, b) => {
      if (sortOption === "priceLow") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortOption === "priceHigh") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      return 0;
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
        <div style={styles.heroDecorOne}></div>
        <div style={styles.heroDecorTwo}></div>

        <div style={styles.heroContent}>
          <p style={styles.heroBadge}>University of Brighton Marketplace</p>

          <h2 style={styles.heroTitle}>
            Buy and sell student essentials with confidence
          </h2>

          <p style={styles.heroText}>
            Discover affordable books, electronics, furniture, clothes, kitchen
            items, and more from students around Brighton campuses.
          </p>

          <div style={styles.heroActions}>
            <button
              onClick={() => navigate(user ? "/create" : "/login")}
              style={styles.heroPrimaryButton}
            >
              Start Selling
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("latest-listings")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={styles.heroSecondaryButton}
            >
              Browse Items
            </button>
          </div>

          <div style={styles.searchPanel}>
            <div style={styles.searchInputWrap}>
              

              <input
                type="text"
                placeholder="Search for laptops, books, furniture..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={styles.searchInput}
              />
            </div>

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

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="newest">Newest First</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>

              <button onClick={clearFilters} style={styles.clearButton}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="latest-listings" style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.sectionEyebrow}>Marketplace</p>

            <h2 style={styles.sectionTitle}>Latest Listings</h2>

            <p style={styles.sectionSubtitle}>
              {loadingListings
                ? "Loading marketplace items..."
                : `${filteredListings.length} active item${
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
            <div style={styles.emptyIcon}>⏳</div>
            <h3 style={styles.emptyTitle}>Loading listings...</h3>
            <p style={styles.emptyText}>
              Please wait while we load the marketplace.
            </p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
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

                  <span style={styles.statusBadge}>
                    {item.status || "active"}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.cardTopRow}>
                    <p style={styles.category}>
                      {item.category || "Uncategorised"}
                    </p>

                    <p style={styles.price}>£{item.price || 0}</p>
                  </div>

                  <h3 style={styles.itemTitle}>
                    {item.title || "Untitled Listing"}
                  </h3>

                  <p style={styles.description}>
                    {item.description?.length > 95
                      ? item.description.slice(0, 95) + "..."
                      : item.description || "No description provided."}
                  </p>

                  <div style={styles.infoBox}>
                    <p style={styles.infoText}>
                      <b>Location:</b>  {item.location || "Location not provided"}
                    </p>

                    <p style={styles.infoText}>
                      <b>Condition: </b> {item.condition || "Condition not provided"}
                    </p>
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
    backgroundColor: "#f8fafc",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#0f172a",
  },

  header: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(14px)",
    padding: "16px 48px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 0 rgba(226, 232, 240, 0.9)",
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
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "22px",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.22)",
  },

  logo: {
    margin: 0,
    fontSize: "25px",
    color: "#0f172a",
    letterSpacing: "-0.04em",
  },

  tagline: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  nav: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  navButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#334155",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    padding: "10px 12px",
    borderRadius: "10px",
  },

  profileButton: {
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  logoutButton: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  sellButton: {
    textDecoration: "none",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    padding: "11px 16px",
    borderRadius: "10px",
    fontWeight: "800",
    boxShadow: "0 10px 18px rgba(37, 99, 235, 0.22)",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at top left, #dbeafe 0%, transparent 34%), linear-gradient(135deg, #eff6ff 0%, #eef2ff 45%, #ffffff 100%)",
    padding: "82px 20px 76px",
  },

  heroDecorOne: {
    position: "absolute",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    top: "-90px",
    right: "-60px",
  },

  heroDecorTwo: {
    position: "absolute",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    backgroundColor: "rgba(124, 58, 237, 0.1)",
    bottom: "-100px",
    left: "8%",
  },

  heroContent: {
    position: "relative",
    maxWidth: "1050px",
    margin: "0 auto",
    textAlign: "center",
  },

  heroBadge: {
    display: "inline-block",
    backgroundColor: "white",
    color: "#2563eb",
    padding: "9px 16px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "14px",
    marginBottom: "20px",
    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.12)",
    border: "1px solid #dbeafe",
  },

  heroTitle: {
    fontSize: "56px",
    lineHeight: "1.03",
    margin: "0 auto 18px",
    color: "#0f172a",
    letterSpacing: "-0.06em",
    maxWidth: "850px",
  },

  heroText: {
    fontSize: "19px",
    color: "#475569",
    maxWidth: "730px",
    margin: "0 auto 28px",
    lineHeight: "1.7",
  },

  heroActions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "30px",
  },

  heroPrimaryButton: {
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    padding: "13px 20px",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "15px",
    boxShadow: "0 14px 24px rgba(37, 99, 235, 0.25)",
  },

  heroSecondaryButton: {
    border: "1px solid #cbd5e1",
    backgroundColor: "white",
    color: "#0f172a",
    padding: "13px 20px",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "15px",
  },

  searchPanel: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    backdropFilter: "blur(14px)",
    padding: "18px",
    borderRadius: "22px",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.14)",
    border: "1px solid rgba(226, 232, 240, 0.9)",
    maxWidth: "980px",
    margin: "0 auto",
  },

  searchInputWrap: {
    position: "relative",
    marginBottom: "12px",
  },

  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "16px",
  },

  searchInput: {
    width: "100%",
    padding: "16px 16px 16px 44px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "#ffffff",
  },

  filtersRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
    gap: "10px",
  },

  filterSelect: {
    padding: "13px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    backgroundColor: "white",
    color: "#334155",
    outline: "none",
  },

  clearButton: {
    padding: "13px 16px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#334155",
    fontWeight: "800",
    cursor: "pointer",
  },

  section: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "54px 20px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    marginBottom: "26px",
    gap: "16px",
  },

  sectionEyebrow: {
    margin: "0 0 8px",
    color: "#2563eb",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "13px",
  },

  sectionTitle: {
    fontSize: "34px",
    margin: "0 0 6px",
    letterSpacing: "-0.04em",
  },

  sectionSubtitle: {
    margin: 0,
    color: "#64748b",
  },

  secondarySellButton: {
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    border: "none",
    padding: "13px 17px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "800",
    boxShadow: "0 12px 20px rgba(37, 99, 235, 0.2)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "26px",
  },

  card: {
    backgroundColor: "white",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow: "0 14px 35px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e2e8f0",
  },

  imagePlaceholder: {
    height: "190px",
    background:
      "linear-gradient(135deg, #e2e8f0 0%, #f8fafc 55%, #e0f2fe 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
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
    fontWeight: "700",
  },

  noImageIcon: {
    fontSize: "32px",
  },

  statusBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "6px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "900",
    textTransform: "capitalize",
    backgroundColor: "#dcfce7",
    color: "#166534",
    boxShadow: "0 8px 16px rgba(22, 101, 52, 0.12)",
  },

  cardBody: {
    padding: "20px",
  },

  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  category: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "900",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  price: {
    fontSize: "23px",
    fontWeight: "900",
    margin: 0,
    color: "#0f172a",
  },

  itemTitle: {
    fontSize: "21px",
    margin: "13px 0 8px",
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },

  description: {
    color: "#64748b",
    minHeight: "50px",
    lineHeight: "1.55",
    marginBottom: "14px",
  },

  infoBox: {
    backgroundColor: "#f8fafc",
    borderRadius: "14px",
    padding: "11px",
    marginBottom: "15px",
    border: "1px solid #e2e8f0",
  },

  infoText: {
    color: "#334155",
    fontSize: "14px",
    margin: "5px 0",
  },

  viewButton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "15px",
  },

  emptyState: {
    backgroundColor: "white",
    borderRadius: "22px",
    padding: "46px 20px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
    boxShadow: "0 14px 35px rgba(15, 23, 42, 0.08)",
  },

  emptyIcon: {
    fontSize: "34px",
    marginBottom: "12px",
  },

  emptyTitle: {
    fontSize: "25px",
    margin: "0 0 8px",
    letterSpacing: "-0.03em",
  },

  emptyText: {
    color: "#64748b",
    marginBottom: "18px",
  },

  emptyButton: {
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    border: "none",
    padding: "13px 17px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "800",
  },
};

export default Home;