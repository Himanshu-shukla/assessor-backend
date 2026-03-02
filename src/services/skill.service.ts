import { Skill } from "../models/Skill";

export async function extractTopSkills(resumeText: string) {
  const skills = await Skill.find();
  const text = resumeText.toLowerCase();
  const scores: Record<string, number> = {};

  for (const skill of skills) {
    let score = 0;
    for (const alias of skill.aliases) {
      // 🔥 FIX: Escaping all regex characters securely (e.g., C++, C#)
      const safeAlias = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${safeAlias}\\b`, "gi");
      
      const matches = text.match(regex);
      if (matches) score += matches.length * skill.weight;
    }
    if (score > 0) scores[skill.name] = score;
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);
}