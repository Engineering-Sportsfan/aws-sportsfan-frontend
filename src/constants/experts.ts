export const EXPERT_USERNAMES = ["Anand Vasu", "Gaurav Kalra", "G Rajaraman"] as const;

export type ExpertUsername = typeof EXPERT_USERNAMES[number];

export const EXPERT_BIOS: Record<string, string> = {
  "Anand Vasu":
    "Veteran cricket journalist and commentator, providing ball-by-ball coverage and analysis across formats.",
  "Gaurav Kalra":
    "Veteran sports journalist, editor, broadcaster and content strategist with over three decades of experience. He has reported on multiple sporting events and interviewed some of the world's leading sportspersons.",
  "G Rajaraman":
    "Senior sports journalist with 43 years' experience but considers himself a student of sport and continues learning from the sports ecosystem.",
};

export const EXPERT_ROLES: Record<string, string> = {
  "Anand Vasu": "Cricket Journalist & Commentator",
  "Gaurav Kalra": "Sports Journalist, Editor & Broadcaster",
  "G Rajaraman": "Senior Sports Journalist",
};

export const EXPERT_AVATARS: Record<string, string> = {
  "Anand Vasu": "/images/anandvasu.jpeg",
  // "Gaurav Kalra": "...",
  // "G Rajaraman": "...",
};

export const EXPERT_TAGS: Record<string, string[]> = {
  "Anand Vasu": ["Cricket", "Commentary", "Match Analysis"],
  "Gaurav Kalra": ["Cricket", "Sports Media", "Broadcasting", "Insider Insights"],
  "G Rajaraman": ["Sports Journalism", "Multi-Sport", "Analysis"],
};

// Strip everything but letters and lowercase, so "Gaurav Kalra", "Gauravkalra",
// "gaurav_kalra", and "Kalra Gaurav" all collapse to comparable strings.
function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

export function getExpertCanonicalName(name?: string | null): string | null {
  if (!name) return null;
  const clean = normalizeName(name);
  if (!clean) return null;

  for (const expert of EXPERT_USERNAMES) {
    const parts = expert.split(" ");
    const forward = normalizeName(expert);
    const reversed = normalizeName([...parts.slice(1), parts[0]].join(" "));
    if (clean === forward || clean === reversed) return expert;
  }
  return null;
}

export function isExpertName(name?: string | null): boolean {
  return getExpertCanonicalName(name) !== null;
}