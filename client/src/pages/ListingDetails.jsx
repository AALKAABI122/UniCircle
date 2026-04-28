import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listingRef = doc(db, "listings", id);
        const listingSnap = await getDoc(listingRef);

        if (listingSnap.exists()) {
          setListing({
            id: listingSnap.id,
            ...listingSnap.data(),
          });
        } else {
          setListing(null);
        }
      } catch (error) {
        alert("Error loading listing: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const copySellerEmail = async () => {
    if (!listing?.sellerEmail) return;

    try {
      await navigator.clipboard.writeText(listing.sellerEmail);
      alert("Seller email copied: " + listing.sellerEmail);
    } catch (error) {
      alert("Seller email: " + listing.sellerEmail);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>⏳</div>
          <p style={styles.loadingText}>Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={styles.page}>
        <div style={styles.notFoundCard}>
          <div style={styles.emptyIcon}>🔍</div>
          <h1 style={styles.notFoundTitle}>Listing not found</h1>
          <p style={styles.notFoundText}>
            This item may have been removed or the link may be incorrect.
          </p>

          <button onClick={() => navigate("/")} style={styles.primaryButton}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const emailSubject = encodeURIComponent(`Interest in ${listing.title}`);
  const emailBody = encodeURIComponent(
    `Hi, I saw your listing "${listing.title}" on UniCircle and I am interested. Is it still available?`
  );

  const mailtoLink = `mailto:${listing.sellerEmail}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← Back to listings
        </button>

        <div style={styles.grid}>
          <div style={styles.imagePanel}>
            <div style={styles.imageBox}>
              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  style={styles.image}
                />
              ) : (
                <div style={styles.noImageBox}>
                  <span style={styles.noImageIcon}>📦</span>
                  <span>No Image Available</span>
                </div>
              )}

              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor:
                    (listing.status || "active") === "sold"
                      ? "#fee2e2"
                      : "#dcfce7",
                  color:
                    (listing.status || "active") === "sold"
                      ? "#991b1b"
                      : "#166534",
                }}
              >
                {listing.status || "active"}
              </span>
            </div>

            <div style={styles.quickInfoGrid}>
              <div style={styles.quickInfoCard}>
                <p style={styles.quickInfoLabel}>Condition</p>
                <h3 style={styles.quickInfoValue}>
                  {listing.condition || "Not provided"}
                </h3>
              </div>

              <div style={styles.quickInfoCard}>
                <p style={styles.quickInfoLabel}>Location</p>
                <h3 style={styles.quickInfoValue}>
                  {listing.location || "Not provided"}
                </h3>
              </div>
            </div>
          </div>

          <div style={styles.detailsCard}>
            <p style={styles.category}>{listing.category || "Uncategorised"}</p>

            <h1 style={styles.title}>{listing.title || "Untitled Listing"}</h1>

            <p style={styles.price}>£{listing.price || 0}</p>

            <div style={styles.infoList}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Condition</span>
                <span style={styles.infoValue}>
                  {listing.condition || "Not provided"}
                </span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Location</span>
                <span style={styles.infoValue}>
                  {listing.location || "Not provided"}
                </span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Status</span>
                <span style={styles.infoValue}>{listing.status || "active"}</span>
              </div>
            </div>

            <div style={styles.descriptionBox}>
              <h2 style={styles.subheading}>Description</h2>

              <p style={styles.description}>
                {listing.description || "No description provided."}
              </p>
            </div>

            <div style={styles.sellerBox}>
              <h2 style={styles.subheading}>Seller Information</h2>

              <div style={styles.sellerEmailBox}>
                <span style={styles.sellerEmailLabel}>Email</span>
                <span style={styles.sellerEmail}>
                  {listing.sellerEmail || "No seller email provided"}
                </span>
              </div>

              {listing.sellerId && (
                <button
                  type="button"
                  onClick={() => navigate(`/seller/${listing.sellerId}`)}
                  style={styles.sellerProfileButton}
                >
                  View Seller Profile
                </button>
              )}

              {listing.sellerEmail ? (
                <>
                  <a href={mailtoLink} style={styles.contactButton}>
                    Contact Seller
                  </a>

                  <button
                    type="button"
                    onClick={copySellerEmail}
                    style={styles.copyButton}
                  >
                    Copy Seller Email
                  </button>

                  <p style={styles.helpText}>
                    If the contact button does not open an email app, copy the
                    seller email instead.
                  </p>
                </>
              ) : (
                <button style={styles.disabledButton} disabled>
                  Contact unavailable
                </button>
              )}
            </div>

            <div style={styles.safetyBox}>
              <h2 style={styles.safetyTitle}>Safety Tips</h2>

              <ul style={styles.safetyList}>
                <li>Meet in a public place on campus.</li>
                <li>Do not send money before seeing the item.</li>
                <li>Do not share bank details or passwords.</li>
                <li>Check the item condition before paying.</li>
                <li>Use your university email when contacting sellers.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #dbeafe 0%, transparent 30%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "32px 20px",
    color: "#0f172a",
  },

  container: {
    maxWidth: "1160px",
    margin: "0 auto",
  },

  backButton: {
    marginBottom: "22px",
    padding: "11px 15px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    backgroundColor: "white",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: "800",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.06)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "30px",
    alignItems: "start",
  },

  imagePanel: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  imageBox: {
    minHeight: "500px",
    background:
      "linear-gradient(135deg, #e2e8f0 0%, #f8fafc 55%, #e0f2fe 100%)",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "20px",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
    border: "1px solid #e2e8f0",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  noImageBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    fontWeight: "800",
  },

  noImageIcon: {
    fontSize: "46px",
  },

  statusBadge: {
    position: "absolute",
    top: "18px",
    right: "18px",
    padding: "8px 13px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "900",
    textTransform: "capitalize",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.12)",
  },

  quickInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  quickInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
  },

  quickInfoLabel: {
    margin: "0 0 6px",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  quickInfoValue: {
    margin: 0,
    fontSize: "18px",
    color: "#0f172a",
  },

  detailsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    padding: "30px",
    borderRadius: "24px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
    border: "1px solid #e2e8f0",
  },

  category: {
    display: "inline-block",
    color: "#2563eb",
    backgroundColor: "#dbeafe",
    fontWeight: "900",
    margin: "0 0 14px",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  title: {
    fontSize: "42px",
    lineHeight: "1.05",
    margin: "0 0 14px",
    letterSpacing: "-0.05em",
    color: "#0f172a",
  },

  price: {
    fontSize: "38px",
    fontWeight: "950",
    color: "#0f172a",
    margin: "0 0 24px",
  },

  infoList: {
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    overflow: "hidden",
    marginBottom: "24px",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 16px",
    gap: "20px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
  },

  infoLabel: {
    color: "#64748b",
    fontWeight: "800",
  },

  infoValue: {
    color: "#0f172a",
    fontWeight: "800",
    textAlign: "right",
    textTransform: "capitalize",
  },

  descriptionBox: {
    marginBottom: "22px",
  },

  subheading: {
    fontSize: "21px",
    marginTop: 0,
    marginBottom: "10px",
    letterSpacing: "-0.03em",
  },

  description: {
    color: "#475569",
    lineHeight: "1.75",
    margin: 0,
  },

  sellerBox: {
    backgroundColor: "#f8fafc",
    padding: "18px",
    borderRadius: "18px",
    marginTop: "20px",
    border: "1px solid #e2e8f0",
  },

  sellerEmailBox: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "13px",
    marginBottom: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  sellerEmailLabel: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  sellerEmail: {
    color: "#0f172a",
    fontWeight: "800",
    wordBreak: "break-word",
  },

  sellerProfileButton: {
    marginTop: "6px",
    width: "100%",
    padding: "13px",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "900",
  },

  contactButton: {
    marginTop: "10px",
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "16px",
    textDecoration: "none",
    display: "block",
    textAlign: "center",
    boxSizing: "border-box",
    fontWeight: "900",
  },

  copyButton: {
    marginTop: "10px",
    width: "100%",
    padding: "13px",
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "900",
  },

  helpText: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "10px",
    marginBottom: 0,
    lineHeight: "1.5",
  },

  disabledButton: {
    marginTop: "10px",
    width: "100%",
    padding: "13px",
    backgroundColor: "#94a3b8",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontSize: "16px",
    cursor: "not-allowed",
    fontWeight: "900",
  },

  safetyBox: {
    backgroundColor: "#fff7ed",
    padding: "18px",
    borderRadius: "18px",
    marginTop: "20px",
    border: "1px solid #fed7aa",
  },

  safetyTitle: {
    fontSize: "19px",
    marginTop: 0,
    marginBottom: "10px",
    color: "#9a3412",
    letterSpacing: "-0.02em",
  },

  safetyList: {
    color: "#7c2d12",
    lineHeight: "1.75",
    marginBottom: 0,
    paddingLeft: "22px",
  },

  loadingCard: {
    backgroundColor: "white",
    padding: "36px",
    borderRadius: "22px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
    maxWidth: "480px",
    margin: "90px auto",
    textAlign: "center",
  },

  loadingIcon: {
    fontSize: "34px",
    marginBottom: "10px",
  },

  loadingText: {
    textAlign: "center",
    fontSize: "18px",
    color: "#475569",
    margin: 0,
  },

  notFoundCard: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "22px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
    maxWidth: "620px",
    margin: "90px auto",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "38px",
    marginBottom: "12px",
  },

  notFoundTitle: {
    margin: "0 0 10px",
    fontSize: "32px",
    letterSpacing: "-0.04em",
  },

  notFoundText: {
    color: "#64748b",
    marginBottom: "22px",
  },

  primaryButton: {
    padding: "13px 18px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "15px",
  },
};

export default ListingDetails;