/**
 * Tutor skill taxonomy: Academic vs Non-academic → area → specific topics.
 * Stored on API as category (branch label), subcategory (area label), name (topic).
 */

export const SKILL_BRANCHES = [
  {
    key: "academic",
    label: "Academic",
    areas: [
      {
        key: "mathematics",
        label: "Mathematics",
        topics: [
          { key: "algebra", label: "Algebra" },
          { key: "calculus", label: "Calculus" },
          { key: "statistics", label: "Statistics" },
          { key: "geometry", label: "Geometry" },
        ],
      },
      {
        key: "computer_science_it",
        label: "Computer Science / IT",
        topics: [
          { key: "programming", label: "Programming" },
          { key: "web_development", label: "Web Development" },
          { key: "databases", label: "Databases" },
          {
            key: "data_structures_algorithms",
            label: "Data Structures and Algorithms",
          },
        ],
      },
      {
        key: "science",
        label: "Science",
        topics: [
          { key: "physics", label: "Physics" },
          { key: "chemistry", label: "Chemistry" },
          { key: "biology", label: "Biology" },
        ],
      },
      {
        key: "languages",
        label: "Languages",
        topics: [
          { key: "english", label: "English" },
          { key: "french", label: "French" },
          { key: "spanish", label: "Spanish" },
          { key: "irish", label: "Irish" },
        ],
      },
      {
        key: "business_finance",
        label: "Business and Finance",
        topics: [
          { key: "accounting", label: "Accounting" },
          { key: "economics", label: "Economics" },
          { key: "marketing", label: "Marketing" },
        ],
      },
      {
        key: "exam_preparation",
        label: "Exam Preparation",
        topics: [
          {
            key: "leaving_cert_subjects",
            label: "Leaving Certificate subjects",
          },
          { key: "university_modules", label: "University modules" },
          { key: "assignment_help", label: "Assignment help" },
        ],
      },
    ],
  },
  {
    key: "non_academic",
    label: "Non-academic",
    areas: [
      {
        key: "music",
        label: "Music",
        topics: [
          { key: "guitar", label: "Guitar" },
          { key: "piano", label: "Piano" },
          { key: "singing", label: "Singing" },
          { key: "music_theory", label: "Music Theory" },
        ],
      },
      {
        key: "sports_fitness",
        label: "Sports and Fitness",
        topics: [
          { key: "football", label: "Football" },
          { key: "gym_training", label: "Gym Training" },
          { key: "yoga", label: "Yoga" },
          { key: "running", label: "Running" },
        ],
      },
      {
        key: "creative_arts",
        label: "Creative Arts",
        topics: [
          { key: "drawing", label: "Drawing" },
          { key: "painting", label: "Painting" },
          { key: "photography", label: "Photography" },
          { key: "video_editing", label: "Video Editing" },
        ],
      },
      {
        key: "lifestyle",
        label: "Lifestyle Skills",
        topics: [
          { key: "cooking", label: "Cooking" },
          { key: "time_management", label: "Time Management" },
          { key: "public_speaking", label: "Public Speaking" },
        ],
      },
      {
        key: "hobbies",
        label: "Hobbies",
        topics: [
          { key: "gaming", label: "Gaming" },
          { key: "crafts", label: "Crafts" },
          { key: "diy_projects", label: "DIY Projects" },
        ],
      },
    ],
  },
];

/** @deprecated use SKILL_BRANCHES */
export const SKILL_CATEGORIES = SKILL_BRANCHES;

export function areasForBranch(branchKey) {
  const b = SKILL_BRANCHES.find((x) => x.key === branchKey);
  return b?.areas ?? [];
}

export function topicsFor(branchKey, areaKey) {
  const areas = areasForBranch(branchKey);
  const a = areas.find((x) => x.key === areaKey);
  return a?.topics ?? [];
}

function matchesStoredBranch(catTrim, branch) {
  if (!catTrim) return false;
  if (branch.key === catTrim || branch.label === catTrim) return true;
  const low = catTrim.toLowerCase();
  if (branch.key === "academic") {
    if (low.includes("non-academic") || low.includes("non academic")) {
      return false;
    }
    return (
      low === "academic" ||
      low.includes("academic skills") ||
      low === "academic skills"
    );
  }
  if (branch.key === "non_academic") {
    return (
      low.includes("non-academic") ||
      low.includes("non academic") ||
      low.includes("nonacademic") ||
      low.includes("non-academic skills")
    );
  }
  return false;
}

/**
 * Resolve branch + area keys from saved labels (supports legacy "Academic Skills" etc.).
 */
export function findCategoryKeysFromLabels(categoryLabel, subcategoryLabel) {
  const subTrim = (subcategoryLabel ?? "").trim();
  const catTrim = (categoryLabel ?? "").trim();

  for (const b of SKILL_BRANCHES) {
    if (matchesStoredBranch(catTrim, b)) {
      const area = b.areas.find(
        (a) => a.label === subTrim || a.key === subTrim,
      );
      if (area) {
        return { categoryKey: b.key, subcategoryKey: area.key };
      }
    }
  }

  for (const b of SKILL_BRANCHES) {
    const area = b.areas.find(
      (a) => a.label === subTrim || a.key === subTrim,
    );
    if (area) {
      return { categoryKey: b.key, subcategoryKey: area.key };
    }
  }

  return { categoryKey: "", subcategoryKey: "" };
}

const CUSTOM_TOPIC = "__custom__";
export { CUSTOM_TOPIC };

/**
 * Match saved skill name to a topic key; otherwise treat as custom text.
 */
export function resolveTopicFromName(branchKey, areaKey, nameLabel) {
  const topics = topicsFor(branchKey, areaKey);
  const nl = (nameLabel ?? "").trim();
  if (!nl) {
    return { topicKey: "", name: "" };
  }
  const topic = topics.find(
    (t) => t.label === nl || t.key === nl || t.label.toLowerCase() === nl.toLowerCase(),
  );
  if (topic) {
    return { topicKey: topic.key, name: topic.label };
  }
  return { topicKey: CUSTOM_TOPIC, name: nl };
}
