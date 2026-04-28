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
          <div style={styles.avatar}>
            {sellerEmail ? sellerEmail.charAt(0).toUpperCase() : "S"}
          </div>

          <div style={styles.profileInfo}>
            <h1 style={styles.title}>Seller Profile</h1>

            <p style={styles.emailText}>
              {sellerEmail || "Seller email not available"}
            </p>

            <p style={styles.statsText}>
              {sellerListings.length} active listing
              {sellerListings.length === 1 ? "" : "s"}
            </p>

            <div style={styles.ratingBox}>
              <span style={styles.ratingText}>
                ⭐{" "}
                {reviews.length === 0
                  ? "No ratings yet"
                  : `${averageRating.toFixed(1)} / 5`}
              </span>

              <span style={styles.ratingSubText}>
                {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Leave a Review</h2>

          {!currentUser ? (
            <div style={styles.reviewNotice}>
              <p>Please login before leaving a review.</p>
              <button onClick={() => navigate("/login")} style={styles.loginButton}>
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

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Reviews</h2>

          {reviews.length === 0 ? (
            <div style={styles.emptyState}>
              <h3>No reviews yet</h3>
              <p>This seller has not received any reviews yet.</p>
            </div>
          ) : (
            <div style={styles.reviewsList}>
              {reviews.map((review) => (
                <div key={review.id} style={styles.reviewCard}>
                  <div style={styles.reviewTopRow}>
                    <strong>{review.reviewerEmail || "Anonymous user"}</strong>
                    <span style={styles.reviewRating}>
                      {"⭐".repeat(Number(review.rating))}
                    </span>
                  </div>

                  <p style={styles.reviewComment}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Seller Listings</h2>

          {sellerListings.length === 0 ? (
            <div style={styles.emptyState}>
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

                    <p style={styles.infoText}>
                      📍 {item.location || "Location not provided"}
                    </p>

                    <p style={styles.infoText}>
                      ⭐ {item.condition || "Condition not provided"}
                    </p>

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
    backgroundColor: "#f4f6f8",
    fontFamily: "Arial, sans-serif",
    padding: "30px 20px",
    color: "#111827",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  backButton: {
    marginBottom: "20px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },

  profileHeader: {
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: "22px",
    marginBottom: "32px",
  },

  avatar: {
    width: "86px",
    height: "86px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "bold",
    flexShrink: 0,
  },

  profileInfo: {
    flex: 1,
  },

  title: {
    fontSize: "34px",
    margin: "0 0 8px",
  },

  emailText: {
    color: "#374151",
    margin: "0 0 8px",
    fontSize: "16px",
  },

  statsText: {
    color: "#6b7280",
    margin: "0 0 12px",
  },

  ratingBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "10px 12px",
    display: "inline-flex",
    flexDirection: "column",
    gap: "4px",
  },

  ratingText: {
    fontWeight: "700",
    color: "#111827",
  },

  ratingSubText: {
    fontSize: "13px",
    color: "#6b7280",
  },

  section: {
    marginTop: "28px",
  },

  sectionTitle: {
    fontSize: "28px",
    marginBottom: "20px",
  },

  reviewForm: {
    backgroundColor: "white",
    padding: "22px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
  },

  submitReviewButton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "700",
  },

  reviewNotice: {
    backgroundColor: "white",
    padding: "22px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    textAlign: "center",
  },

  loginButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "11px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
  },

  reviewsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  reviewCard: {
    backgroundColor: "white",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
  },

  reviewTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "8px",
  },

  reviewRating: {
    color: "#f59e0b",
    whiteSpace: "nowrap",
  },

  reviewComment: {
    color: "#4b5563",
    lineHeight: "1.6",
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
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
  },

  imageBox: {
    height: "180px",
    backgroundColor: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    overflow: "hidden",
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
    fontWeight: "600",
  },

  noImageIcon: {
    fontSize: "28px",
  },

  cardBody: {
    padding: "18px",
    minHeight: "250px",
    display: "flex",
    flexDirection: "column",
  },

  category: {
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "800",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  itemTitle: {
    fontSize: "20px",
    margin: "12px 0 8px",
  },

  description: {
    color: "#6b7280",
    minHeight: "44px",
    lineHeight: "1.5",
    marginBottom: "10px",
  },

  infoText: {
    color: "#374151",
    fontSize: "14px",
    margin: "5px 0",
  },

  price: {
    fontSize: "22px",
    fontWeight: "800",
    marginTop: "auto",
    marginBottom: "12px",
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
    padding: "36px 20px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
  },

  loadingCard: {
    backgroundColor: "white",
    padding: "28px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    maxWidth: "500px",
    margin: "80px auto",
    textAlign: "center",
  },

  loadingText: {
    textAlign: "center",
    fontSize: "18px",
  },
};

export default SellerProfile;