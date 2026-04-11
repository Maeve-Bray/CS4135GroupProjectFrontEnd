import { useEffect, useMemo, useState } from "react";
import { createBooking } from "../api/bookingAPI";
import { getTutorSkillNames, getTutors } from "../api/tutorAPI";
import {
  bookingSkillDisplayLabel,
  filterTutorsByStudentSearch,
  tutorSkillsForBooking,
} from "../data/skillCategories";
import {
  getTutorReviews,
  getTutorAverageRating,
} from "../api/reviewAPI";
import "../styles/style.css";

const SKILL_AREA_TAXONOMY = [
  {
    key: "academic",
    label: "Academic Skills",
    subcategories: [
      { key: "all", label: "All" },
      {
        key: "math",
        label: "Mathematics",
        hints: [
          "math",
          "algebra",
          "calculus",
          "geometry",
          "statistics",
          "trigonometry",
        ],
      },
      {
        key: "science",
        label: "Science",
        hints: [
          "science",
          "biology",
          "chemistry",
          "physics",
          "organic",
          "lab",
        ],
      },
      {
        key: "languages",
        label: "Languages & writing",
        hints: [
          "english",
          "spanish",
          "french",
          "german",
          "writing",
          "literature",
          "reading",
          "grammar",
        ],
      },
      {
        key: "humanities",
        label: "Humanities",
        hints: ["history", "geography", "philosophy", "economics", "politics"],
      },
    ],
  },
  {
    key: "nonacademic",
    label: "Non-Academic Skills",
    subcategories: [
      { key: "all", label: "All" },
      {
        key: "arts",
        label: "Arts & music",
        hints: ["art", "music", "piano", "guitar", "design", "drama", "dance"],
      },
      {
        key: "fitness",
        label: "Sports & fitness",
        hints: ["yoga", "fitness", "sport", "running", "swimming", "gym"],
      },
      {
        key: "life",
        label: "Life & hobbies",
        hints: ["cooking", "photography", "media", "wellness", "mindfulness"],
      },
    ],
  },
];

function collectHintsInCategory(category) {
  return category.subcategories.flatMap((s) => s.hints ?? []);
}

function ReviewsModal({
  open,
  tutor,
  reviews,
  loading,
  error,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="reviews-modal-overlay" onClick={onClose}>
      <div
        className="reviews-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reviews-modal-title"
      >
        <div className="reviews-modal__header">
          <div>
            <h3 id="reviews-modal-title" className="reviews-modal__title">
              Reviews for {tutor?.email ?? `Tutor #${tutor?.userId ?? ""}`}
            </h3>
            <p className="reviews-modal__subtitle">
              Student feedback
            </p>
          </div>

          <button
            type="button"
            className="reviews-modal__close"
            onClick={onClose}
            aria-label="Close reviews"
          >
            ×
          </button>
        </div>

        <div className="reviews-modal__body">
          {loading ? (
            <p className="empty-skills-text">Loading reviews…</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : reviews.length > 0 ? (
            <div className="reviews-modal__list">
              {reviews.map((review, index) => (
                <div
                  key={review.id ?? review.reviewId ?? index}
                  className="reviews-modal__card"
                >
                  <div className="reviews-modal__card-header">
                    <span className="reviews-modal__hearts">
                      {renderHearts(Number(review.rating || 0))}
                    </span>
                    <span className="reviews-modal__score">
                      {Number(review.rating || 0)}/5
                    </span>
                  </div>

                  {review.comment ? (
                    <p className="reviews-modal__comment">{review.comment}</p>
                  ) : (
                    <p className="reviews-modal__comment reviews-modal__comment--empty">
                      No written comment.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-skills-text">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
function activeAreaHints(categoryKey, subcategoryKey) {
  if (!categoryKey) return null;

  const cat = SKILL_AREA_TAXONOMY.find((c) => c.key === categoryKey);
  if (!cat) return null;

  const sub =
    cat.subcategories.find((s) => s.key === subcategoryKey) ??
    cat.subcategories[0];

  if (sub.key === "all") {
    const merged = collectHintsInCategory(cat);
    return merged.length > 0 ? merged : null;
  }

  return sub.hints ?? null;
}

function renderHearts(rating = 0) {
  return Array.from({ length: 5 }, (_, index) =>
    index < Math.round(rating) ? "♥" : "♡"
  ).join("");
}

function TutorPickCard({
  tutor,
  averageRating = 0,
  reviewCount = 0,
  ratingLoaded = false,
  ratingError = "",
  selected,
  onSelect,
}) {
  const email = tutor.email ?? `Tutor #${tutor.userId}`;
  const bio = (tutor.biography ?? "").trim();
  const skills = Array.isArray(tutor.skills) ? tutor.skills : [];

  return (
    <button
      type="button"
      className={
        "tutor-pick-card" + (selected ? " tutor-pick-card--selected" : "")
      }
      onClick={() => onSelect(tutor.userId)}
      aria-pressed={selected}
    >
      <div className="tutor-pick-card__body">
        <p className="tutor-pick-card__email">{email}</p>

        <div className="tutor-pick-card__meta">
          {tutor.verificationStatus === "VERIFIED" && (
            <span className="tutor-pick-card__badge tutor-pick-card__badge--verified">
              Verified
            </span>
          )}

          {tutor.verificationStatus &&
            tutor.verificationStatus !== "VERIFIED" && (
              <span className="tutor-pick-card__badge">
                {tutor.verificationStatus}
              </span>
            )}
        </div>

        <p className="tutor-pick-card__rating">
          <strong>♥</strong>{" "}
          {!ratingLoaded
            ? "Loading rating…"
            : ratingError
            ? `Could not load rating (${ratingError})`
            : reviewCount > 0
            ? `${averageRating.toFixed(
                1
              )} · ${reviewCount} review${reviewCount !== 1 ? "s" : ""}`
            : "No reviews yet"}
        </p>

        {bio ? (
          <p className="tutor-pick-card__bio">{bio}</p>
        ) : (
          <p className="tutor-pick-card__bio tutor-pick-card__bio--empty">
            No biography yet.
          </p>
        )}

        <p className="tutor-pick-card__skills-title">Skills</p>

        {skills.length > 0 ? (
          <ul className="tutor-pick-card__skills">
            {skills.map((s, i) => (
              <li key={`${s.name}-${i}`}>
                <strong>{s.name || "(unnamed)"}</strong>
                {s.proficiencyLevel ? ` · ${String(s.proficiencyLevel)}` : ""}
                {s.experienceNote ? ` · ${s.experienceNote}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="tutor-pick-card__bio tutor-pick-card__bio--empty">
            No skills listed.
          </p>
        )}
      </div>

      <div className="tutor-pick-card__footer">
        {selected ? "Selected" : "Select this tutor"}
      </div>
    </button>
  );
}

export default function BookSession({
  studentId,
  tutorId,
  initialSkillSearch = "",
}) {
  const [tutorSkillNames, setTutorSkillNames] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubcategory, setFilterSubcategory] = useState("all");
  const [filterSkill, setFilterSkill] = useState(initialSkillSearch);
  const [filterProficiency, setFilterProficiency] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [minRatingInput, setMinRatingInput] = useState("");
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
const [reviewsModalTutor, setReviewsModalTutor] = useState(null);
const [modalReviews, setModalReviews] = useState([]);
const [modalReviewsLoading, setModalReviewsLoading] = useState(false);
const [modalReviewsError, setModalReviewsError] = useState("");

  const [formData, setFormData] = useState({
    studentId,
    tutorId: tutorId ?? "",
    skill: "",
    sessionDate: "",
    startTime: "",
    endTime: "",
    durationMinutes: "",
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [tutors, setTutors] = useState([]);
  const [tutorSearchLoading, setTutorSearchLoading] = useState(false);
  const [tutorSearchError, setTutorSearchError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [tutorAverageRatings, setTutorAverageRatings] = useState({});
  const [tutorReviewCounts, setTutorReviewCounts] = useState({});
  const [tutorRatingErrors, setTutorRatingErrors] = useState({});

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCategory) count += 1;
    if (filterCategory && filterSubcategory !== "all") count += 1;
    if (filterSkill.trim()) count += 1;
    if (filterProficiency) count += 1;

    const mr = parseFloat(minRatingInput);
    if (minRatingInput !== "" && Number.isFinite(mr) && mr > 0) count += 1;

    return count;
  }, [
    filterCategory,
    filterSubcategory,
    filterSkill,
    filterProficiency,
    minRatingInput,
  ]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await getTutorSkillNames();
        if (!cancelled && Array.isArray(data)) {
          setTutorSkillNames(data);
        }
      } catch {
        /* non-fatal */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, studentId }));
  }, [studentId]);

  useEffect(() => {
    const handle = setTimeout(async () => {
      const filters = {};
      const skillTrim = filterSkill.trim();
      if (skillTrim) filters.skill = skillTrim;

      const qTrim = searchQuery.trim();
      if (qTrim) filters.q = qTrim;

      if (filterProficiency && !filterCategory) {
        filters.proficiencyLevel = filterProficiency;
      }

      const mr = parseFloat(minRatingInput);
      if (minRatingInput !== "" && Number.isFinite(mr) && mr > 0) {
        filters.minRating = mr;
      }

      setTutorSearchLoading(true);
      setTutorSearchError("");

      try {
        const { data } = await getTutors(filters);
        const list = Array.isArray(data) ? data : [];
        setTutors(list);

        setFormData((prev) => {
          const tid = String(prev.tutorId ?? "");
          if (tid && !list.some((t) => String(t.userId) === tid)) {
            return { ...prev, tutorId: "" };
          }
          return prev;
        });
      } catch (err) {
        setTutorSearchError(
          err.response?.data?.message ||
            err.message ||
            "Could not load tutors."
        );
        setTutors([]);
      } finally {
        setTutorSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [
    filterSkill,
    filterProficiency,
    filterCategory,
    filterSubcategory,
    searchQuery,
    minRatingInput,
  ]);

  const displayTutors = useMemo(
    () =>
        filterTutorsByStudentSearch(
        tutors,
        filterCategory,
        filterSubcategory,
        activeAreaHints,
        filterProficiency
      ),
   [tutors, filterCategory, filterSubcategory, filterProficiency],
    );

  useEffect(() => {
    let cancelled = false;

    async function loadTutorRatings() {
      if (displayTutors.length === 0) {
        setTutorAverageRatings({});
        setTutorReviewCounts({});
        setTutorRatingErrors({});
        return;
      }

      try {
        const entries = await Promise.all(
          displayTutors.map(async (tutor) => {
            try {
              const [reviewsRes, averageRes] = await Promise.all([
                getTutorReviews(tutor.userId),
                getTutorAverageRating(tutor.userId),
              ]);

              const reviews = Array.isArray(reviewsRes?.data)
                ? reviewsRes.data
                : [];
              const average = Number(averageRes?.data?.averageRating || 0);

              return {
                tutorId: String(tutor.userId),
                averageRating: Number.isFinite(average) ? average : 0,
                reviewCount: reviews.length,
                error: "",
              };
            } catch (error) {
              return {
                tutorId: String(tutor.userId),
                averageRating: 0,
                reviewCount: 0,
                error:
                  error.response?.data?.message ||
                  error.message ||
                  "Could not load rating.",
              };
            }
          })
        );

        if (cancelled) return;

        const nextRatings = {};
        const nextCounts = {};
        const nextErrors = {};

        entries.forEach((entry) => {
          nextRatings[entry.tutorId] = entry.averageRating;
          nextCounts[entry.tutorId] = entry.reviewCount;
          nextErrors[entry.tutorId] = entry.error;
        });

        setTutorAverageRatings(nextRatings);
        setTutorReviewCounts(nextCounts);
        setTutorRatingErrors(nextErrors);
      } catch {
        if (!cancelled) {
          setTutorAverageRatings({});
          setTutorReviewCounts({});
          setTutorRatingErrors({});
        }
      }
    }

    loadTutorRatings();

    return () => {
      cancelled = true;
    };
  }, [displayTutors]);

  const tutorSessionSkills = useMemo(() => {
    const t = displayTutors.find(
      (x) => String(x.userId) === String(formData.tutorId ?? "")
    );
    return tutorSkillsForBooking(t);
  }, [displayTutors, formData.tutorId]);

  useEffect(() => {
    setFormData((prev) => {
      const tid = String(prev.tutorId ?? "");
      if (tid && !displayTutors.some((t) => String(t.userId) === tid)) {
        return { ...prev, tutorId: "" };
      }
      return prev;
    });
  }, [displayTutors]);

  useEffect(() => {
    setFilterSkill(initialSkillSearch || "");
  }, [initialSkillSearch]);

  useEffect(() => {
    const tid = String(formData.tutorId ?? "");
    const names = tutorSessionSkills.map((s) => s.name.trim());

    setFormData((prev) => {
      const cur = (prev.skill ?? "").trim();

      if (!tid || names.length === 0) {
        return cur ? { ...prev, skill: "" } : prev;
      }
      if (names.includes(cur)) return prev;
      if (names.length === 1) return { ...prev, skill: names[0] };

      return { ...prev, skill: "" };
    });
  }, [formData.tutorId, tutorSessionSkills]);

  const subcategoriesForCategory =
    SKILL_AREA_TAXONOMY.find((c) => c.key === filterCategory)?.subcategories ??
    [];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const selectTutor = (userId) => {
    setFormData((prev) => ({
      ...prev,
      tutorId: userId != null ? String(userId) : "",
    }));
  };
const openReviewsModal = async (tutor) => {
  if (!tutor) return;

  setReviewsModalTutor(tutor);
  setReviewsModalOpen(true);
  setModalReviews([]);
  setModalReviewsError("");
  setModalReviewsLoading(true);

  try {
    const res = await getTutorReviews(tutor.userId);
    const reviews = Array.isArray(res?.data) ? res.data : [];
    setModalReviews(reviews);
  } catch (error) {
    setModalReviews([]);
    setModalReviewsError(
      error.response?.data?.message ||
        error.message ||
        "Could not load reviews."
    );
  } finally {
    setModalReviewsLoading(false);
  }
};

const closeReviewsModal = () => {
  setReviewsModalOpen(false);
  setReviewsModalTutor(null);
  setModalReviews([]);
  setModalReviewsError("");
  setModalReviewsLoading(false);
};

useEffect(() => {
  if (!reviewsModalOpen) return;

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeReviewsModal();
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [reviewsModalOpen]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createBooking(formData);
      setMessage("Booking request submitted successfully.");
      setFormData((prev) => ({
        ...prev,
        skill: "",
        sessionDate: "",
        startTime: "",
        endTime: "",
        durationMinutes: "",
        notes: "",
      }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to submit booking.");
    }
  };

  const selectedTutor = displayTutors.find(
    (t) => String(t.userId) === String(formData.tutorId ?? "")
  );

  const selectedTutorKey = String(formData.tutorId ?? "");
  const selectedTutorAverageRating =
    tutorAverageRatings[selectedTutorKey] ?? 0;
  const selectedTutorReviewCount = tutorReviewCounts[selectedTutorKey] ?? 0;
  const selectedTutorRatingLoaded =
    selectedTutor != null &&
    Object.prototype.hasOwnProperty.call(tutorReviewCounts, selectedTutorKey);
  const selectedTutorRatingError = tutorRatingErrors[selectedTutorKey] ?? "";

  const messageIsError = message && !message.includes("successfully");

  return (
    <div className="book-session">
      <div className="student-welcome-section">
        <h2 className="student-welcome-heading">Hello!</h2>
        <p className="student-welcome-subheading">
          What would you like to learn today?
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset
          style={{
            border: "1px solid #ddd",
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "16px",
          }}
        >
          <legend>Find tutors</legend>

          <datalist id="tutor-skill-suggestions">
            {tutorSkillNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <div className="tutor-search-toolbar">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tutors by email, profile, or skills"
              className="tutor-search-toolbar__input"
              aria-label="Search tutors"
            />

            <button
              type="button"
              className="tutor-search-toolbar__filter-btn"
              onClick={() => setFiltersOpen((prev) => !prev)}
              aria-expanded={filtersOpen}
              aria-controls="tutor-filter-panel"
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          </div>

          {filtersOpen && (
            <div id="tutor-filter-panel" className="tutor-filter-panel">
              <div className="tutor-filter-grid">
                <label style={{ display: "block" }}>
                  Category
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setFilterSubcategory("all");
                    }}
                    style={{ display: "block", width: "100%" }}
                  >
                    <option value="">All areas (no category filter)</option>
                    {SKILL_AREA_TAXONOMY.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "block" }}>
                  Subcategory
                  <select
                    value={filterSubcategory}
                    onChange={(e) => setFilterSubcategory(e.target.value)}
                    disabled={!filterCategory}
                    style={{ display: "block", width: "100%" }}
                  >
                    {!filterCategory ? (
                      <option value="all">—</option>
                    ) : (
                      subcategoriesForCategory.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label style={{ display: "block" }}>
                  Skill
                  <input
                    type="text"
                    list="tutor-skill-suggestions"
                    value={filterSkill}
                    onChange={(e) => setFilterSkill(e.target.value)}
                    placeholder="e.g. Python"
                    style={{ display: "block", width: "100%" }}
                  />
                </label>

                <label style={{ display: "block" }}>
                  Tutor proficiency
                  <select
                    value={filterProficiency}
                    onChange={(e) => setFilterProficiency(e.target.value)}
                    style={{ display: "block", width: "100%" }}
                  >
                    <option value="">Any</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </label>

                <label style={{ display: "block" }}>
                  Minimum rating (optional)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={minRatingInput}
                    onChange={(e) => setMinRatingInput(e.target.value)}
                    placeholder="e.g. 4"
                    style={{ display: "block", width: "100%" }}
                  />
                </label>
              </div>

              {filterCategory && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#64748b",
                    marginTop: "12px",
                    marginBottom: 0,
                    maxWidth: "40rem",
                  }}
                >
                  Showing tutors whose skills match this area. Choose{" "}
                  <strong>All areas</strong> above if the list is empty.
                </p>
              )}

              <div style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory("");
                    setFilterSubcategory("all");
                    setFilterSkill(initialSkillSearch || "");
                    setFilterProficiency("");
                    setMinRatingInput("");
                  }}
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}

          {tutorSearchLoading && <p>Loading tutors…</p>}
          {tutorSearchError && (
            <p style={{ color: "crimson" }}>{tutorSearchError}</p>
          )}
        </fieldset>

        <h3 className="tutor-cards-heading">Choose a tutor</h3>

        {!tutorSearchLoading &&
          displayTutors.length === 0 &&
          !tutorSearchError &&
          tutors.length > 0 && (
            <p className="tutor-cards-empty">
              No tutors match this <strong>category</strong> and your other
              filters. Set Category to <strong>All areas</strong>, or widen the
              skill / keyword search.
            </p>
          )}

        {!tutorSearchLoading && tutors.length === 0 && !tutorSearchError && (
          <p className="tutor-cards-empty">
            No tutors match these filters. Try clearing the skill or keyword
            search.
          </p>
        )}

        {displayTutors.length > 0 && (
          <div className="tutor-card-grid">
            {displayTutors.map((t) => {
              const tutorKey = String(t.userId);
              const ratingLoaded = Object.prototype.hasOwnProperty.call(
                tutorReviewCounts,
                tutorKey
              );

              return (
                <TutorPickCard
                  key={t.userId}
                  tutor={t}
                  averageRating={tutorAverageRatings[tutorKey] ?? 0}
                  reviewCount={tutorReviewCounts[tutorKey] ?? 0}
                  ratingLoaded={ratingLoaded}
                  ratingError={tutorRatingErrors[tutorKey] ?? ""}
                  selected={String(formData.tutorId) === String(t.userId)}
                  onSelect={selectTutor}
                />
              );
            })}
          </div>
        )}

        {selectedTutor && (
  <div style={{ marginBottom: "12px", color: "#374151" }}>
    <p style={{ marginBottom: "6px" }}>
      <strong>Booking with:</strong>{" "}
      {selectedTutor.email ?? `Tutor #${selectedTutor.userId}`}
    </p>

    {!selectedTutorRatingLoaded ? (
      <p className="selected-tutor-rating">Loading rating…</p>
    ) : selectedTutorRatingError ? (
      <p className="selected-tutor-rating selected-tutor-rating--empty">
        <strong>♥</strong> Could not load rating (
        {selectedTutorRatingError})
      </p>
    ) : selectedTutorReviewCount > 0 ? (
      <p className="selected-tutor-rating">
        <strong>♥</strong>{" "}
        {selectedTutorAverageRating.toFixed(1)} ·{" "}
        {selectedTutorReviewCount} review
        {selectedTutorReviewCount !== 1 ? "s" : ""}
      </p>
    ) : (
      <p className="selected-tutor-rating selected-tutor-rating--empty">
        <strong>Rating:</strong> No reviews yet
      </p>
    )}

    <button
      type="button"
      className="secondary-button"
      onClick={() => openReviewsModal(selectedTutor)}
      style={{ marginTop: "8px" }}
    >
      Reviews
    </button>
  </div>
)}

        {selectedTutor && (
          <div className="book-session-details">
            <h3>Session details</h3>

            <label style={{ display: "block", marginBottom: "4px" }}>
              Session skill
            </label>

            {tutorSessionSkills.length === 0 ? (
              <p
                style={{
                  marginBottom: "12px",
                  color: "#b45309",
                  fontSize: "0.9rem",
                }}
              >
                This tutor has no skills on their profile. They need to add at
                least one before you can request a session.
              </p>
            ) : (
              <select
                name="skill"
                value={formData.skill}
                onChange={handleChange}
                required
                style={{
                  display: "block",
                  marginBottom: "12px",
                  maxWidth: "22rem",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                }}
              >
                <option value="">Choose a skill…</option>
                {tutorSessionSkills.map((s, i) => (
                  <option key={`${s.name}-${i}`} value={s.name.trim()}>
                    {bookingSkillDisplayLabel(s)}
                  </option>
                ))}
              </select>
            )}

            <div className="book-session-row">
              <label>
                Date
                <br />
                <input
                  type="date"
                  name="sessionDate"
                  value={formData.sessionDate}
                  onChange={handleChange}
                />
              </label>

              <label>
                Start
                <br />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </label>

              <label>
                End
                <br />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label style={{ display: "block" }}>
              Notes
              <textarea
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </label>

            <div className="book-session-submit">
              <button
                type="submit"
                disabled={
                  !formData.tutorId ||
                  tutorSessionSkills.length === 0 ||
                  !(formData.skill ?? "").trim()
                }
              >
                Request Session
              </button>
            </div>
          </div>
        )}
      </form>
<ReviewsModal
  open={reviewsModalOpen}
  tutor={reviewsModalTutor}
  reviews={modalReviews}
  loading={modalReviewsLoading}
  error={modalReviewsError}
  onClose={closeReviewsModal}
/>
      {message && (
        <p
          className={
            "book-session-message" +
            (messageIsError ? " book-session-message--error" : "")
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}