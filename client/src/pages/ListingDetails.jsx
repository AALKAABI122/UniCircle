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
        <div style={styles.card}>
          <p>Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1>Listing not found</h1>
          <p>This item may have been removed or the link may be incorrect.</p>

          <button onClick={() => navigate("/")} style={styles.backButton}>
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

          <div style={styles.detailsCard}>
            <p style={styles.category}>{listing.category || "Uncategorised"}</p>

            <h1 style={styles.title}>{listing.title || "Untitled Listing"}</h1>

            <p style={styles.price}>£{listing.price || 0}</p>

            <div style={styles.infoRow}>
              <strong>Condition:</strong>
              <span>{listing.condition || "Not provided"}</span>
            </div>

            <div style={styles.infoRow}>
              <strong>Location:</strong>
              <span>{listing.location || "Not provided"}</span>
            </div>

            <div style={styles.infoRow}>
              <strong>Status:</strong>
              <span>{listing.status || "active"}</span>
            </div>

            <h2 style={styles.subheading}>Description</h2>

            <p style={styles.description}>
              {listing.description || "No description provided."}
            </p>

            <div style={styles.sellerBox}>
              <h2 style={styles.subheading}>Seller Information</h2>

              <p>
                <strong>Email:</strong>{" "}
                {listing.sellerEmail || "No seller email provided"}
              </p>

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
    backgroundColor: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
    padding: "30px",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  card: {
    backgroundColor: "white",
    padding: "28px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    maxWidth: "600px",
    margin: "80px auto",
    textAlign: "center",
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

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "28px",
  },

  imageBox: {
    minHeight: "420px",
    backgroundColor: "#d1d5db",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#555",
    fontSize: "20px",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  detailsCard: {
    backgroundColor: "white",
    padding: "28px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  category: {
    color: "#2563eb",
    fontWeight: "bold",
    marginBottom: "8px",
  },

  title: {
    fontSize: "34px",
    margin: "0 0 12px",
  },

  price: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "24px",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px 0",
    gap: "20px",
  },

  subheading: {
    fontSize: "20px",
    marginTop: "24px",
    marginBottom: "10px",
  },

  description: {
    color: "#555",
    lineHeight: "1.6",
  },

  sellerBox: {
    backgroundColor: "#f9fafb",
    padding: "16px",
    borderRadius: "10px",
    marginTop: "20px",
  },

  sellerProfileButton: {
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },

  contactButton: {
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    textDecoration: "none",
    display: "block",
    textAlign: "center",
    boxSizing: "border-box",
  },

  copyButton: {
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },

  helpText: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "10px",
    marginBottom: 0,
    lineHeight: "1.5",
  },

  disabledButton: {
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#9ca3af",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "not-allowed",
  },

  safetyBox: {
    backgroundColor: "#fff7ed",
    padding: "16px",
    borderRadius: "10px",
    marginTop: "20px",
  },

  safetyTitle: {
    fontSize: "18px",
    marginTop: 0,
    color: "#9a3412",
  },

  safetyList: {
    color: "#7c2d12",
    lineHeight: "1.7",
    marginBottom: 0,
  },
};

export default ListingDetails;