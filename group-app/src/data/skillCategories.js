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
    const area = b.areas.find((a) => a.label === subTrim || a.key === subTrim);
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
    (t) =>
      t.label === nl ||
      t.key === nl ||
      t.label.toLowerCase() === nl.toLowerCase(),
  );
  if (topic) {
    return { topicKey: topic.key, name: topic.label };
  }
  return { topicKey: CUSTOM_TOPIC, name: nl };
}

export function tutorSkillsForBooking(tutor) {
  const list = tutor?.skills;
  if (!Array.isArray(list)) return [];
  return list.filter((s) => (s?.name ?? "").trim());
}

/** Dropdown label: skill name plus optional proficiency. */
export function bookingSkillDisplayLabel(skill) {
  const name = (skill?.name ?? "").trim() || "(unnamed)";
  const lvl = skill?.proficiencyLevel;
  return lvl ? `${name} (${String(lvl)})` : name;
}

// --- Find-a-tutor filter (Academic / Non-academic) ---
// Rule: show a tutor if at least one of their skills fits what the student picked.

function parseAcademicBranchKey(raw) {
  if (raw == null || !String(raw).trim()) return null;
  const k = String(raw).trim().toLowerCase().replace(/-/g, "_");
  if (k === "nonacademic" || k === "non_academic") return "non_academic";
  if (k === "academic") return "academic";
  return null;
}

const ACADEMIC_MENU_SUBTOPIC_TO_AREAS = {
  math: ["mathematics"],
  science: ["science"],
  languages: ["languages"],
  humanities: ["business_finance", "exam_preparation"],
};

const NON_ACADEMIC_MENU_SUBTOPIC_TO_AREAS = {
  arts: ["music", "creative_arts"],
  fitness: ["sports_fitness"],
  life: ["lifestyle", "hobbies"],
};

function menuSubtopicToTutorAreaKeys(branch, subtopicKey) {
  if (!subtopicKey || subtopicKey === "all") return null;
  const table =
    branch === "academic"
      ? ACADEMIC_MENU_SUBTOPIC_TO_AREAS
      : NON_ACADEMIC_MENU_SUBTOPIC_TO_AREAS;
  return table[subtopicKey] ?? null;
}

function skillTextMatchesKeywords(skill, keywords) {
  if (!keywords?.length) return false;
  const text = [
    skill?.name,
    skill?.subcategoryKey,
    skill?.subcategory,
    skill?.categoryKey,
    skill?.category,
    skill?.experienceNote,
  ]
    .filter(Boolean)
    .map((x) => String(x).toLowerCase())
    .join(" ");
  if (!text.trim()) return false;
  return keywords.some((word) => text.includes(String(word).toLowerCase()));
}

/**
 * Search API returns `category` / `subcategory` (labels); tutor form may use keys.
 * Map to branch + area key so filters match stored data.
 */
function resolvedSkillBranchAndAreaKey(skill) {
  const cat = String(skill?.categoryKey ?? skill?.category ?? "").trim();
  const sub = String(skill?.subcategoryKey ?? skill?.subcategory ?? "").trim();
  if (!cat && !sub) {
    return { branch: null, areaKey: "" };
  }
  const { categoryKey, subcategoryKey } = findCategoryKeysFromLabels(cat, sub);
  let branch =
    parseAcademicBranchKey(categoryKey) || parseAcademicBranchKey(cat);
  let areaKey = (subcategoryKey ?? "").trim().toLowerCase();
  if (branch && !areaKey && sub) {
    const areas = areasForBranch(branch);
    const match = areas.find(
      (a) =>
        a.key.toLowerCase() === sub.toLowerCase() ||
        a.label.toLowerCase() === sub.toLowerCase(),
    );
    if (match) {
      areaKey = match.key.toLowerCase();
    }
  }
  return { branch, areaKey };
}

function skillTopicLabelFitsAreas(branch, areaKeys, skill) {
  const nameLow = (skill?.name ?? "").trim().toLowerCase();
  if (!nameLow) return false;
  for (const areaKey of areaKeys) {
    const topicList = topicsFor(branch, areaKey);
    if (
      topicList.some(
        (t) =>
          t.label.toLowerCase() === nameLow ||
          t.key.toLowerCase() === nameLow ||
          nameLow.includes(t.label.toLowerCase()) ||
          t.label.toLowerCase().includes(nameLow),
      )
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Tutors with multiple skills are handled by the caller
 */
function skillMatchesCategoryFilter(
  skill,
  studentBranch,
  studentSubtopicKey,
  menuHintKeywords,
) {
  const { branch: skillBranch, areaKey: skillAreaKey } =
    resolvedSkillBranchAndAreaKey(skill);
  if (skillBranch) {
    if (skillBranch !== studentBranch) return false;
    if (!studentSubtopicKey || studentSubtopicKey === "all") return true;

    const areaKeys = menuSubtopicToTutorAreaKeys(
      studentBranch,
      studentSubtopicKey,
    );
    if (!areaKeys?.length) {
      return skillTextMatchesKeywords(skill, menuHintKeywords);
    }

    const area = skillAreaKey;
    if (areaKeys.some((a) => area === String(a).toLowerCase())) return true;
    if (skillTextMatchesKeywords(skill, menuHintKeywords)) return true;
    if (skillTopicLabelFitsAreas(studentBranch, areaKeys, skill)) return true;
    return false;
  }

  return skillTextMatchesKeywords(skill, menuHintKeywords);
}

function skillProficiencyMatchesFilter(skill, proficiencyUpper) {
  if (!proficiencyUpper) return true;
  const level = skill?.proficiencyLevel;
  if (level == null || !String(level).trim()) return false;
  const l = String(level).trim().toUpperCase();
  return l === proficiencyUpper;
}

/**
 * Tutor list filter: area (Academic / Non-academic) + optional proficiency.
 * - With a category: at least one skill must match that category and the proficiency (if any).
 * - With no category: any skill can satisfy proficiency (if any); area does not apply.
 */
export function tutorFitsStudentAreaSearch(
  tutor,
  studentCategoryKey,
  studentSubtopicKey,
  getHintKeywordsForMenu,
  proficiencyLevelFilter = "",
) {
  const skills = tutor?.skills ?? [];
  if (!skills.length) return false;

  const profUpper = (proficiencyLevelFilter ?? "").trim().toUpperCase() || null;

  const studentBranch = studentCategoryKey
    ? parseAcademicBranchKey(studentCategoryKey)
    : null;
  const menuHintKeywords =
    studentCategoryKey && studentBranch
      ? getHintKeywordsForMenu(studentCategoryKey, studentSubtopicKey)
      : [];

  return skills.some((skill) => {
    const matchesArea =
      !studentCategoryKey ||
      !studentBranch ||
      skillMatchesCategoryFilter(
        skill,
        studentBranch,
        studentSubtopicKey,
        menuHintKeywords,
      );

    if (!matchesArea) return false;
    return skillProficiencyMatchesFilter(skill, profUpper);
  });
}

/** Narrow API tutor list by the same rules as the student area + proficiency UI. */
export function filterTutorsByStudentSearch(
  tutors,
  studentCategoryKey,
  studentSubtopicKey,
  getHintKeywordsForMenu,
  proficiencyLevelFilter = "",
) {
  const list = Array.isArray(tutors) ? tutors : [];
  return list.filter((t) =>
    tutorFitsStudentAreaSearch(
      t,
      studentCategoryKey,
      studentSubtopicKey,
      getHintKeywordsForMenu,
      proficiencyLevelFilter,
    ),
  );
}
