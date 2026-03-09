import profileStatsRaw from "../data/profileStats.json";

interface ProfileStat {
  total: number;
  mean: number;
  stdDev: number;
}

const profileStats: Record<string, ProfileStat> = profileStatsRaw;

export interface RankResult {
  rank: number;
  total: number;
  percentile: number;
  profileKey: string;
}

/* -------------------------------------------------------
   Error Function (Abramowitz & Stegun approximation)
------------------------------------------------------- */
function erf(x: number): number {
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p  = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-absX * absX));

  return sign * y;
}

/* -------------------------------------------------------
   Normal CDF  P(X <= x)  given mean and stdDev
------------------------------------------------------- */
function normalCDF(x: number, mean: number, stdDev: number): number {
  return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
}

/* -------------------------------------------------------
   Detect profile from topSkills array
------------------------------------------------------- */
const profileKeywords: Record<string, string[]> = {
  frontend:       ["react", "vue", "angular", "next", "svelte", "html", "css", "tailwind", "typescript", "javascript"],
  backend:        ["node", "express", "django", "spring", "fastapi", "flask", "go", "rust", "php", "ruby", "laravel", "nestjs"],
  data_analytics: ["sql", "tableau", "power bi", "excel", "looker", "data analysis", "analytics", "r", "pandas", "matplotlib"],
  data_science:   ["tensorflow", "pytorch", "machine learning", "deep learning", "nlp", "scikit", "keras", "hugging face", "llm"],
  devops:         ["docker", "kubernetes", "ci/cd", "terraform", "ansible", "aws", "gcp", "azure", "jenkins", "github actions"],
  mobile:         ["flutter", "swift", "kotlin", "react native", "ios", "android", "xamarin"],
};

export function detectProfile(topSkills: string[]): string {
  const skillsLower = topSkills.map((s) => s.toLowerCase());

  const scores: Record<string, number> = {};

  for (const [profile, keywords] of Object.entries(profileKeywords)) {
    scores[profile] = 0;
    for (const skill of skillsLower) {
      for (const kw of keywords) {
        if (skill.includes(kw)) {
          scores[profile]++;
          break;
        }
      }
    }
  }

  // Check for full_stack (both frontend and backend hits)
  if ((scores["frontend"] ?? 0) >= 1 && (scores["backend"] ?? 0) >= 1) {
    return "full_stack";
  }

  // Pick highest scoring profile
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] === 0) return "general";

  return best[0];
}

/* -------------------------------------------------------
   MAIN: Compute rank from AI total_score (0–150 scale)
------------------------------------------------------- */
export function computeRank(
  totalScore: number,
  topSkills: string[]
): RankResult {
  const profileKey = detectProfile(topSkills);
  const stats: ProfileStat =
    profileStats[profileKey] ?? profileStats["general"] ?? { total: 50000, mean: 70, stdDev: 18 };

  // Convert 0-150 score to 0-100 percentage (same scale as mean/stdDev)
  const scorePct = (totalScore / 150) * 100;

  // percentile = fraction of candidates who scored BELOW this user
  const cdf = normalCDF(scorePct, stats.mean, stats.stdDev);

  // Clamp percentile to 1–99 for UX sanity
  const percentile = Math.min(Math.max(Math.round(cdf * 100), 1), 99);

  // rank = how many candidates are ranked ABOVE + 1
  const rank = Math.max(1, Math.round((1 - cdf) * stats.total) + 1);

  return {
    rank,
    total: stats.total,
    percentile,
    profileKey,
  };
}
