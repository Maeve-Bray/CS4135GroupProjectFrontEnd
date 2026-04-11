import { useEffect, useMemo, useState } from "react";
import { createBooking } from "../api/bookingAPI";
import { getTutorSkillNames, getTutors } from "../api/tutorAPI";
import {
  bookingSkillDisplayLabel,
  tutorFitsStudentAreaSearch,
  tutorSkillsForBooking,
} from "../data/skillCategories";

/**
 * Optional client-side narrow of API results (skill name substring match, case-insensitive).
 * Backend has no category field; this keeps the UX aligned with tutor “areas.”
 */
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
        hints: ["science", "biology", "chemistry", "physics", "organic", "lab"],
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

function TutorPickCard({ tutor, selected, onSelect }) {
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
          {tutor.averageRating != null && (
            <span className="tutor-pick-card__badge tutor-pick-card__badge--rating">
              {Number(tutor.averageRating).toFixed(1)}★
            </span>
          )}
          {tutor.verificationStatus &&
            tutor.verificationStatus !== "VERIFIED" && (
              <span className="tutor-pick-card__badge">
                {tutor.verificationStatus}
              </span>
            )}
        </div>
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
        {selected ? "Selected · click to keep" : "Select this tutor"}
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
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRatingInput, setMinRatingInput] = useState("");

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getTutorSkillNames();
        if (!cancelled && Array.isArray(data)) setTutorSkillNames(data);
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
      const mr = parseFloat(minRatingInput, 10);
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
            "Could not load tutors.",
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
    searchQuery,
    minRatingInput,
  ]);

  const displayTutors = useMemo(() => {
    return tutors.filter((t) =>
      tutorFitsStudentAreaSearch(
        t,
        filterCategory,
        filterSubcategory,
        activeAreaHints,
      ),
    );
  }, [tutors, filterCategory, filterSubcategory]);

  const tutorSessionSkills = useMemo(() => {
    const t = displayTutors.find(
      (x) => String(x.userId) === String(formData.tutorId ?? ""),
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectTutor = (userId) => {
    setFormData((prev) => ({
      ...prev,
      tutorId: userId != null ? String(userId) : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createBooking(formData);
      setMessage("Booking request submitted successfully.");
      setFormData({
        ...formData,
        skill: "",
        sessionDate: "",
        startTime: "",
        endTime: "",
        durationMinutes: "",
        notes: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to submit booking.");
    }
  };

  const selectedTutor = displayTutors.find(
    (t) => String(t.userId) === String(formData.tutorId ?? ""),
  );
  const messageIsError = message && !message.includes("successfully");

  return (
    <div className="book-session">
      <h2>Book a Session</h2>
      <form onSubmit={handleSubmit}>
        <fieldset
          style={{
            border: "1px solid #ddd",
            padding: "12px",
            marginBottom: "16px",
          }}
        >
          <legend>Find tutors</legend>
          <datalist id="tutor-skill-suggestions">
            {tutorSkillNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Category
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubcategory("all");
              }}
              style={{ display: "block", width: "100%", maxWidth: "22rem" }}
            >
              <option value="">All areas (no category filter)</option>
              {SKILL_AREA_TAXONOMY.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Subcategory
            <select
              value={filterSubcategory}
              onChange={(e) => setFilterSubcategory(e.target.value)}
              disabled={!filterCategory}
              style={{ display: "block", width: "100%", maxWidth: "22rem" }}
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
          {filterCategory && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                marginTop: 0,
                marginBottom: "12px",
                maxWidth: "28rem",
              }}
            >
              Showing tutors whose skills match this area. Choose{" "}
              <strong>All areas</strong> above if the list is empty.
            </p>
          )}
          <label style={{ display: "block", marginBottom: "8px" }}>
            Skill (matches tutors teaching this skill — pick or type)
            <input
              type="text"
              list="tutor-skill-suggestions"
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              placeholder="e.g. Python (substring match)"
              style={{ display: "block", width: "100%", maxWidth: "22rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Keyword (email, profile, skills)
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ display: "block", width: "100%", maxWidth: "22rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Tutor proficiency
            <select
              value={filterProficiency}
              onChange={(e) => setFilterProficiency(e.target.value)}
              style={{ display: "block", width: "100%", maxWidth: "22rem" }}
            >
              <option value="">Any</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>

          <label style={{ display: "block", marginTop: "8px" }}>
            Minimum rating (optional)
            <input
              type="number"
              min="0"
              step="0.1"
              value={minRatingInput}
              onChange={(e) => setMinRatingInput(e.target.value)}
              placeholder="e.g. 4"
              style={{ marginLeft: "8px", width: "5rem" }}
            />
          </label>

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
            search.a
          </p>
        )}
        {displayTutors.length > 0 && (
          <div className="tutor-card-grid">
            {displayTutors.map((t) => (
              <TutorPickCard
                key={t.userId}
                tutor={t}
                selected={String(formData.tutorId) === String(t.userId)}
                onSelect={selectTutor}
              />
            ))}
          </div>
        )}

        {selectedTutor && (
          <p style={{ marginBottom: "12px", color: "#374151" }}>
            <strong>Booking with:</strong>{" "}
            {selectedTutor.email ?? `Tutor #${selectedTutor.userId}`}
          </p>
        )}

        <div className="book-session-details">
          <h3>Session details</h3>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Session skill
          </label>
          {!selectedTutor ? (
            <p
              style={{
                marginBottom: "12px",
                color: "#64748b",
                fontSize: "0.9rem",
              }}
            >
              Select a tutor above to choose a skill.
            </p>
          ) : tutorSessionSkills.length === 0 ? (
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
      </form>

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
