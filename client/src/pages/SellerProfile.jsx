import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";

function SellerProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerListings, setSellerListings] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const listingsRef = collection(db, "listings");

        const sellerQuery = query(
          listingsRef,
          where("sellerId", "==", sellerId)
        );

        const querySnapshot = await getDocs(sellerQuery);

        const listingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        listingsData.sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });

        setSellerListings(listingsData);

        if (listingsData.length > 0) {
          setSellerEmail(listingsData[0].sellerEmail || "");
        }

        const reviewsRef = collection(db, "reviews");

        const reviewsQuery = query(
          reviewsRef,
          where("sellerId", "==", sellerId)
        );

        const reviewsSnapshot = await getDocs(reviewsQuery);

        const reviewsData = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        reviewsData.sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });

        setReviews(reviewsData);
      } catch (error) {
        console.error("Error loading seller profile:", error);
        alert("Error loading seller profile: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  const averageRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((total, review) => total + Number(review.rating), 0) /
        reviews.length;

  const alreadyReviewed = reviews.some(
    (review) => review.reviewerId === currentUser?.uid
  );

  const isOwnProfile = currentUser?.uid === sellerId;

  const renderStars = (value) => {
    const number = Math.round(Number(value || 0));
    return "★".repeat(number) + "☆".repeat(5 - number);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please login before leaving a review.");
      navigate("/login");
      return;
    }

    if (isOwnProfile) {
      alert("You cannot review your own seller profile.");
      return;
    }

    if (alreadyReviewed) {
      alert("You have already reviewed this seller.");
      return;
    }

    if (!comment.trim()) {
      alert("Please write a short review comment.");
      return;
    }

    setSubmittingReview(true);

    try {
      const newReview = {
        sellerId,
        sellerEmail,
        reviewerId: currentUser.uid,
        reviewerEmail: currentUser.email,
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "reviews"), newReview);

      setReviews([
        {
          id: Date.now().toString(),
          ...newReview,
          createdAt: { seconds: Math.floor(Date.now() / 1000) },
        },
        ...reviews,
      ]);

      setRating("5");
      setComment("");

      alert("Review submitted successfully.");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review: " + error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>⭐</div>
          <p style={styles.loadingText}>Loading seller profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← Back to Home
        </button>

        <div style={styles.profileHeader}>
          <div style={styles.profileLeft}>
            <div style={styles.avatar}>
              {sellerEmail ? sellerEmail.charAt(0).toUpperCase() : "S"}
            </div>

            <div style={styles.profileInfo}>
              <p style={styles.badge}>Seller Profile</p>

              <h1 style={styles.title}>
                {sellerEmail ? sellerEmail.split("@")[0] : "UniCircle Seller"}
              </h1>

              <p style={styles.emailText}>
                {sellerEmail || "Seller email not available"}
              </p>

              <div style={styles.ratingLine}>
                <span style={styles.bigStars}>
                  {reviews.length === 0 ? "☆☆☆☆☆" : renderStars(averageRating)}
                </span>

                <span style={styles.ratingText}>
                  {reviews.length === 0
                    ? "No ratings yet"
                    : `${averageRating.toFixed(1)} out of 5`}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Listings</p>
              <h2 style={styles.statNumber}>{sellerListings.length}</h2>
            </div>

            <div style={styles.statCard}>
              <p style={styles.statLabel}>Reviews</p>
              <h2 style={styles.statNumber}>{reviews.length}</h2>
            </div>

            <div style={styles.statCard}>
              <p style={styles.statLabel}>Rating</p>
              <h2 style={styles.statNumber}>
                {reviews.length === 0 ? "—" : averageRating.toFixed(1)}
              </h2>
            </div>
          </div>
        </div>

        <div style={styles.contentGrid}>
          <section style={styles.reviewPanel}>
            <h2 style={styles.sectionTitle}>Leave a Review</h2>
            <p style={styles.sectionSubtitle}>
              Help other students know whether this seller is reliable.
            </p>

            {!currentUser ? (
              <div style={styles.reviewNotice}>
                <p>Please login before leaving a review.</p>
                <button
                  onClick={() => navigate("/login")}
                  style={styles.loginButton}
                >
                  Login
                </button>
              </div>
            ) : isOwnProfile ? (
              <div style={styles.reviewNotice}>
                <p>You cannot review your own seller profile.</p>
              </div>
            ) : alreadyReviewed ? (
              <div style={styles.reviewNotice}>
                <p>You have already reviewed this seller.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
                <div>
                  <label style={styles.label}>Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    style={styles.input}
                  >
                    <option value="5">5 stars - Excellent</option>
                    <option value="4">4 stars - Good</option>
                    <option value="3">3 stars - Okay</option>
                    <option value="2">2 stars - Poor</option>
                    <option value="1">1 star - Bad</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Review Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write about your experience with this seller..."
                    rows="4"
                    style={styles.textarea}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    ...styles.submitReviewButton,
                    opacity: submittingReview ? 0.7 : 1,
                    cursor: submittingReview ? "not-allowed" : "pointer",
                  }}
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </section>

          <section style={styles.reviewsPanel}>
            <h2 style={styles.sectionTitle}>Reviews</h2>
            <p style={styles.sectionSubtitle}>
              Feedback from students who interacted with this seller.
            </p>

            {reviews.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>💬</div>
                <h3>No reviews yet</h3>
                <p>This seller has not received any reviews yet.</p>
              </div>
            ) : (
              <div style={styles.reviewsList}>
                {reviews.map((review) => (
                  <div key={review.id} style={styles.reviewCard}>
                    <div style={styles.reviewTopRow}>
                      <div>
                        <strong style={styles.reviewerEmail}>
                          {review.reviewerEmail || "Anonymous user"}
                        </strong>

                        <p style={styles.reviewDate}>
                          Student marketplace review
                        </p>
                      </div>

                      <span style={styles.reviewRating}>
                        {renderStars(review.rating)}
                      </span>
                    </div>

                    <p style={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Seller Listings</h2>
              <p style={styles.sectionSubtitle}>
                Other active items from this seller.
              </p>
            </div>
          </div>

          {sellerListings.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📦</div>
              <h3>No listings found</h3>
              <p>This seller does not have any active listings right now.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {sellerListings.map((item) => (
                <div key={item.id} style={styles.card}>
                  <div style={styles.imageBox}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={styles.image}
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
                    <p style={styles.category}>
                      {item.category || "Uncategorised"}
                    </p>

                    <h3 style={styles.itemTitle}>
                      {item.title || "Untitled Listing"}
                    </h3>

                    <p style={styles.description}>
                      {item.description?.length > 90
                        ? item.description.slice(0, 90) + "..."
                        : item.description || "No description provided."}
                    </p>

                    <div style={styles.infoBox}>
                      <p style={styles.infoText}>
                         {item.location || "Location not provided"}
                      </p>

                      <p style={styles.infoText}>
                        ⭐ {item.condition || "Condition not provided"}
                      </p>
                    </div>

                    <p style={styles.price}>£{item.price || 0}</p>

                    <button
                      onClick={() => navigate(`/listing/${item.id}`)}
                      style={styles.viewButton}
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
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #dbeafe 0%, transparent 32%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
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

  profileHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    borderRadius: "26px",
    padding: "30px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "28px",
    marginBottom: "32px",
    flexWrap: "wrap",
  },

  profileLeft: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
    minWidth: "280px",
  },

  avatar: {
    width: "96px",
    height: "96px",
    borderRadius: "26px",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    fontWeight: "950",
    flexShrink: 0,
    boxShadow: "0 16px 30px rgba(37, 99, 235, 0.28)",
  },

  profileInfo: {
    flex: 1,
  },

  badge: {
    display: "inline-block",
    margin: "0 0 10px",
    padding: "7px 12px",
    borderRadius: "999px",
    backgroundColor: "#dbeafe",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  title: {
    fontSize: "38px",
    lineHeight: "1.05",
    margin: "0 0 8px",
    letterSpacing: "-0.05em",
    color: "#0f172a",
  },

  emailText: {
    color: "#475569",
    margin: "0 0 12px",
    fontSize: "15px",
    wordBreak: "break-word",
  },

  ratingLine: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  bigStars: {
    color: "#f59e0b",
    fontSize: "22px",
    letterSpacing: "1px",
  },

  ratingText: {
    color: "#334155",
    fontWeight: "800",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(110px, 1fr))",
    gap: "14px",
    flex: 1,
    minWidth: "320px",
  },

  statCard: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
    textAlign: "center",
  },

  statLabel: {
    color: "#64748b",
    fontSize: "13px",
    margin: "0 0 8px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  statNumber: {
    fontSize: "30px",
    margin: 0,
    color: "#0f172a",
    letterSpacing: "-0.04em",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: "24px",
    alignItems: "start",
    marginBottom: "32px",
  },

  reviewPanel: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 14px 32px rgba(15, 23, 42, 0.08)",
  },

  reviewsPanel: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 14px 32px rgba(15, 23, 42, 0.08)",
  },

  section: {
    marginTop: "28px",
  },

  sectionHeader: {
    marginBottom: "18px",
  },

  sectionTitle: {
    fontSize: "28px",
    margin: "0 0 6px",
    letterSpacing: "-0.04em",
    color: "#0f172a",
  },

  sectionSubtitle: {
    color: "#64748b",
    margin: "0 0 18px",
    lineHeight: "1.6",
  },

  reviewForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "900",
    color: "#0f172a",
  },

  input: {
    width: "100%",
    padding: "13px",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    fontSize: "15px",
    boxSizing: "border-box",
    backgroundColor: "white",
  },

  textarea: {
    width: "100%",
    padding: "13px",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  submitReviewButton: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: "900",
  },

  reviewNotice: {
    backgroundColor: "#f8fafc",
    padding: "22px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
    color: "#475569",
  },

  loginButton: {
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    border: "none",
    padding: "11px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "900",
  },

  reviewsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  reviewCard: {
    backgroundColor: "#f8fafc",
    padding: "18px",
    borderRadius: "18px",
    border: "1px solid #e2e8f0",
  },

  reviewTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
    alignItems: "flex-start",
  },

  reviewerEmail: {
    color: "#0f172a",
    wordBreak: "break-word",
  },

  reviewDate: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  reviewRating: {
    color: "#f59e0b",
    whiteSpace: "nowrap",
    letterSpacing: "1px",
  },

  reviewComment: {
    color: "#475569",
    lineHeight: "1.7",
    margin: 0,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    alignItems: "start",
  },

  card: {
    backgroundColor: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 14px 32px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e2e8f0",
  },

  imageBox: {
    height: "190px",
    backgroundColor: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    overflow: "hidden",
    position: "relative",
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
    gap: "6px",
    fontWeight: "800",
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
    fontWeight: "900",
    textTransform: "capitalize",
    backgroundColor: "#dcfce7",
    color: "#166534",
  },

  cardBody: {
    padding: "18px",
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
  },

  category: {
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "900",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  itemTitle: {
    fontSize: "20px",
    margin: "12px 0 8px",
    letterSpacing: "-0.03em",
  },

  description: {
    color: "#64748b",
    minHeight: "44px",
    lineHeight: "1.5",
    marginBottom: "12px",
  },

  infoBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "10px",
    marginBottom: "12px",
  },

  infoText: {
    color: "#334155",
    fontSize: "14px",
    margin: "5px 0",
  },

  price: {
    fontSize: "24px",
    fontWeight: "950",
    marginTop: "auto",
    marginBottom: "12px",
    color: "#0f172a",
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
    backgroundColor: "#f8fafc",
    borderRadius: "18px",
    padding: "34px 20px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },

  emptyIcon: {
    fontSize: "32px",
    marginBottom: "8px",
  },

  loadingCard: {
    backgroundColor: "white",
    padding: "34px",
    borderRadius: "22px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
    maxWidth: "500px",
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
};

export default SellerProfile;