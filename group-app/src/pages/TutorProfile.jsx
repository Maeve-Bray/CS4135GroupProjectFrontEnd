import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
  createTutorProfile,
  getTutorProfile,
  updateTutorProfile,
} from "../api/tutorAPI";
import { getMyProfile, updateMyProfile } from "../api/authAPI";
import {
  CUSTOM_TOPIC,
  SKILL_BRANCHES,
  areasForBranch,
  findCategoryKeysFromLabels,
  resolveTopicFromName,
  topicsFor,
} from "../data/skillCategories";
import {
  getTutorReviews,
  getTutorAverageRating,
} from "../api/reviewAPI";
import "../styles/dashboard.css";

const resolveName = (user) =>
  user?.name || user?.fullName || user?.email?.split("@")[0] || "Your Name";

const emptySkill = () => ({
  categoryKey: "",
  subcategoryKey: "",
  topicKey: "",
  name: "",
  proficiencyLevel: "",
  experienceNote: "",
});

const PROFICIENCY_OPTIONS = [
  { value: "", label: "Select proficiency" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

function getSkillCardClass(skillName = "") {
  const lower = skillName.toLowerCase();

  if (
    lower.includes("math") ||
    lower.includes("algebra") ||
    lower.includes("geometry") ||
    lower.includes("calculus")
  ) {
    return "skill-card skill-card--math";
  }

  if (
    lower.includes("science") ||
    lower.includes("chemistry") ||
    lower.includes("physics") ||
    lower.includes("biology")
  ) {
    return "skill-card skill-card--science";
  }

  return "skill-card skill-card--default";
}

function renderHearts(rating = 0) {
  return Array.from({ length: 5 }, (_, index) =>
    index < Math.round(rating) ? "♥" : "♡"
  ).join(" ");
}

export default function TutorProfile({ tutorId }) {
  const { auth, setAuth } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [biography, setBiography] = useState("");
  const [skills, setSkills] = useState([emptySkill()]);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(resolveName(auth));

  const [tutorReviews, setTutorReviews] = useState([]);
const [averageRating, setAverageRating] = useState(0);
const [reviewsLoading, setReviewsLoading] = useState(false);



  const applyProfile = (profile) => {
    if (!profile) {
      setBiography("");
      setSkills([emptySkill()]);
      return;
    }

    setBiography(profile.biography ?? "");

    const apiSkills = profile.skills;
    if (Array.isArray(apiSkills) && apiSkills.length > 0) {
      setSkills(
        apiSkills.map((item) => {
          const { categoryKey, subcategoryKey } = findCategoryKeysFromLabels(
            item.category,
            item.subcategory
          );

          const { topicKey, name } = resolveTopicFromName(
            categoryKey,
            subcategoryKey,
            item.name
          );

          return {
            categoryKey,
            subcategoryKey,
            topicKey,
            name,
            proficiencyLevel:
              item.proficiencyLevel ?? item.proficiency ?? "",
            experienceNote: item.experienceNote ?? "",
          };
        })
      );
    } else {
      setSkills([emptySkill()]);
    }
  };

  const loadProfile = useCallback(async () => {
    if (!tutorId) return;

    setIsLoading(true);
    setLoadError("");

    try {
      const [userRes, tutorRes] = await Promise.all([
        getMyProfile(tutorId),
        getTutorProfile(tutorId),
      ]);

      setName(resolveName(userRes.data));
      setProfileData(tutorRes.data);
      applyProfile(tutorRes.data);

      if (typeof setAuth === "function") {
        setAuth((prev) => ({
          ...prev,
          ...userRes.data,
        }));
      }
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const userRes = await getMyProfile(tutorId);

          setName(resolveName(userRes.data));

          if (typeof setAuth === "function") {
            setAuth((prev) => ({
              ...prev,
              ...userRes.data,
            }));
          }
        } catch (userErr) {
          console.error("Error loading user profile", userErr);
        }

        setProfileData(null);
        applyProfile(null);
      } else {
        console.error("Error loading tutor profile", err);
        setLoadError("Unable to load profile right now.");
        setProfileData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [tutorId, setAuth]);

  const loadReviews = useCallback(async () => {
  if (!tutorId) return;

  setReviewsLoading(true);

  try {
    const [reviewsRes, averageRes] = await Promise.all([
      getTutorReviews(tutorId),
      getTutorAverageRating(tutorId),
    ]);

    const reviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
    setTutorReviews(reviews);
    setAverageRating(Number(averageRes.data?.averageRating || 0));
  } catch (err) {
    console.error("Error loading tutor reviews", err);
    setTutorReviews([]);
    setAverageRating(0);
  } finally {
    setReviewsLoading(false);
  }
}, [tutorId]);

useEffect(() => {
  if (tutorId) {
    loadReviews();
  }
}, [loadReviews, tutorId]);

  useEffect(() => {
    if (tutorId) {
      loadProfile();
    }
  }, [loadProfile, tutorId]);

  const addSkill = () => {
    setSkills([...skills, emptySkill()]);
  };

  const removeSkill = (index) => {
    if (skills.length <= 1) return;
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index, field, value) => {
    const next = [...skills];
    const row = { ...next[index], [field]: value };

    if (field === "categoryKey") {
      row.subcategoryKey = "";
      row.topicKey = "";
      row.name = "";
    }

    if (field === "subcategoryKey") {
      row.topicKey = "";
      row.name = "";
    }

    next[index] = row;
    setSkills(next);
  };

  const updateTopicSelection = (index, topicKey) => {
    setSkills((prev) => {
      const next = [...prev];
      const row = { ...next[index] };
      const topicList = topicsFor(row.categoryKey, row.subcategoryKey);

      if (!topicKey) {
        row.topicKey = "";
        row.name = "";
      } else if (topicKey === CUSTOM_TOPIC) {
        row.topicKey = CUSTOM_TOPIC;
        row.name = "";
      } else {
        const t = topicList.find((x) => x.key === topicKey);
        row.topicKey = topicKey;
        row.name = t?.label ?? "";
      }

      next[index] = row;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSuccessMessage("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setSaveError("Name cannot be empty.");
      return;
    }

    const skillsPayload = skills
      .filter((row) => row.name.trim())
      .map((row) => {
        const branch = SKILL_BRANCHES.find((b) => b.key === row.categoryKey);
        const area = branch?.areas.find((a) => a.key === row.subcategoryKey);

        return {
          name: row.name.trim(),
          proficiencyLevel: (row.proficiencyLevel || "").trim() || undefined,
          category: branch?.label,
          subcategory: area?.label,
          experienceNote: (row.experienceNote || "").trim() || undefined,
        };
      });

    if (skillsPayload.length === 0) {
      setSaveError(
        "Add at least one skill: choose Academic or Non-academic, an area, and a topic (or Other)."
      );
      return;
    }

    const profilePayload = {
      userId: tutorId,
      biography: biography.trim(),
      skills: skillsPayload,
    };

    try {
      const authRes = await updateMyProfile(auth.userId, {
        name: trimmedName,
      });

      if (profileData) {
        await updateTutorProfile(tutorId, profilePayload);
      } else {
        await createTutorProfile(profilePayload);
      }

      if (typeof setAuth === "function") {
        setAuth((prev) => ({
          ...prev,
          ...authRes.data,
          name: trimmedName,
        }));
      }

      setName(trimmedName);
      setSuccessMessage("Profile saved successfully.");
      await loadProfile();
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save profile.");
    }
  };

  const handleCancel = async () => {
    setSaveError("");
    setSuccessMessage("");
    await loadProfile();
    setIsEditing(false);
  };

  if (isLoading) {
    return <p>Loading profile…</p>;
  }

  if (loadError) {
    return <p className="error-text">{loadError}</p>;
  }

  const displayName = name || "Tutor";
  const displayRole =
    auth?.role === "TUTOR" ? "Tutor" : auth?.role || "Tutor";
  const displayStatus = auth?.status || "Active";
  const listedSkills = skills.filter((skill) => skill.name.trim());

  if (!isEditing) {
    return (
      <section className="profile-page">
        <h1 className="brand-title">ShareCraft</h1>

        <div className="profile-content">
          <div className="profile-row">
            <span className="profile-label">Name:</span>
            <span className="profile-value">{displayName}</span>
          </div>

          <div className="profile-row">
            <span className="profile-label">Role:</span>
            <span className="profile-value">{displayRole}</span>
          </div>

          <div className="profile-row profile-row--bio">
            <span className="profile-label">Bio:</span>
            <div className="bio-box">
              {biography || "Add a short tutor bio here."}
            </div>
          </div>

          <div className="profile-row">
            <span className="profile-label">Account status:</span>
            <span className="profile-value">{displayStatus}</span>
          </div>

<div className="profile-row profile-row--reviews">
  <span className="profile-label">Rating:</span>
  <div className="profile-value profile-value--reviews">
    <div className="profile-rating-summary">
      <span className="profile-rating-hearts">
        {renderHearts(averageRating)}
      </span>
      <span className="profile-rating-number">
        {tutorReviews.length > 0
          ? `${averageRating.toFixed(1)} / 5`
          : "No ratings yet"}
      </span>
      {tutorReviews.length > 0 && (
        <span className="profile-rating-count">
          ({tutorReviews.length} review{tutorReviews.length !== 1 ? "s" : ""})
        </span>
      )}
    </div>
  </div>
</div>
          <div className="skills-section">
            <h2 className="skills-heading">Current listed skills:</h2>

            {listedSkills.length > 0 ? (
              <div className="skills-grid">
                {listedSkills.map((skill, index) => (
                  <div
                    key={`${skill.name}-${index}`}
                    className={getSkillCardClass(skill.name)}
                  >
                    <div className="skill-card-image" />
                    <div className="skill-card-body">
                      <h3>{skill.name}</h3>
                      {skill.proficiencyLevel && (
                        <p>{skill.proficiencyLevel.toLowerCase()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-skills-text">No skills added yet.</p>
            )}
<div className="skills-section">
  <h2 className="skills-heading">Student reviews</h2>

  {reviewsLoading ? (
    <p className="empty-skills-text">Loading reviews…</p>
  ) : tutorReviews.length > 0 ? (
    <div className="profile-reviews-list">
      {tutorReviews.map((review) => (
        <div key={review.id} className="profile-review-card">
          <div className="profile-review-header">
            <span className="profile-review-hearts">
              {renderHearts(review.rating)}
            </span>
            <span className="profile-review-score">{review.rating}/5</span>
          </div>

          

          {review.comment ? (
            <p className="profile-review-comment">{review.comment}</p>
          ) : (
            <p className="profile-review-comment profile-review-comment--empty">
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
            <button
              type="button"
              className="edit-profile-button"
              onClick={() => setIsEditing(true)}
            >
              Edit profile
            </button>
          </div>

          {successMessage && <p className="success-text">{successMessage}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <h1 className="brand-title">ShareCraft</h1>

      <div className="profile-content">
        <h2 className="edit-form-title">
          {profileData ? "Edit Tutor Profile" : "Create Tutor Profile"}
        </h2>

        <form onSubmit={handleSubmit} className="profile-edit-form">
          <label className="profile-field">
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>

          <label className="profile-field">
            <span>Biography</span>
            <textarea
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              rows={4}
              placeholder="Tell students about your experience and teaching style."
            />
          </label>

          <div className="skills-edit-section">
            <h3>Skills</h3>

            {skills.map((row, index) => {
              const areas = areasForBranch(row.categoryKey);
              const topicList = topicsFor(row.categoryKey, row.subcategoryKey);

              return (
                <div key={index} className="tutor-profile-skill-block">
                  <div className="tutor-profile-skill-grid">
                    <label>
                      Category
                      <select
                        value={row.categoryKey}
                        onChange={(e) =>
                          updateSkill(index, "categoryKey", e.target.value)
                        }
                      >
                        <option value="">Academic or Non-academic</option>
                        {SKILL_BRANCHES.map((b) => (
                          <option key={b.key} value={b.key}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Subcategory
                      <select
                        value={row.subcategoryKey}
                        onChange={(e) =>
                          updateSkill(index, "subcategoryKey", e.target.value)
                        }
                        disabled={!row.categoryKey}
                      >
                        <option value="">Select skill area</option>
                        {areas.map((a) => (
                          <option key={a.key} value={a.key}>
                            {a.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="tutor-profile-skill-span2">
                      Specific topic
                      <select
                        value={
                          topicList.some((t) => t.key === row.topicKey)
                            ? row.topicKey
                            : row.topicKey === CUSTOM_TOPIC
                            ? CUSTOM_TOPIC
                            : ""
                        }
                        onChange={(e) =>
                          updateTopicSelection(index, e.target.value)
                        }
                        disabled={!row.subcategoryKey}
                      >
                        <option value="">Select topic</option>
                        {topicList.map((t) => (
                          <option key={t.key} value={t.key}>
                            {t.label}
                          </option>
                        ))}
                        <option value={CUSTOM_TOPIC}>Other (type below)</option>
                      </select>
                    </label>

                    {row.topicKey === CUSTOM_TOPIC && row.subcategoryKey && (
                      <label className="tutor-profile-skill-span2">
                        Describe your topic
                        <input
                          type="text"
                          placeholder="e.g. a topic not listed above"
                          value={row.name}
                          onChange={(e) =>
                            updateSkill(index, "name", e.target.value)
                          }
                        />
                      </label>
                    )}

                    <label>
                      Proficiency
                      <select
                        value={row.proficiencyLevel}
                        onChange={(e) =>
                          updateSkill(index, "proficiencyLevel", e.target.value)
                        }
                      >
                        {PROFICIENCY_OPTIONS.map((o) => (
                          <option key={o.value || "empty"} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="tutor-profile-skill-span2">
                      Experience note (optional)
                      <textarea
                        rows={2}
                        placeholder="Optional context"
                        value={row.experienceNote}
                        onChange={(e) =>
                          updateSkill(index, "experienceNote", e.target.value)
                        }
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => removeSkill(index)}
                  >
                    Remove skill
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              className="secondary-button"
              onClick={addSkill}
            >
              Add skill
            </button>
          </div>

          <div className="profile-form-actions">
            <button type="submit" className="primary-button">
              {profileData ? "Update profile" : "Create profile"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>

        {successMessage && <p className="success-text">{successMessage}</p>}
        {saveError && <p className="error-text">{saveError}</p>}
      </div>
    </section>
  );
}