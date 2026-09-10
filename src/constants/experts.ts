

export const EXPERT_USERNAMES = ["Anand Vasu", "Gaurav Kalra", "G Rajaraman", "Amieyra Khoslla"] as const;

export type ExpertUsername = typeof EXPERT_USERNAMES[number];

export const EXPERT_BIOS: Record<string, string> = {
    "Anand Vasu":
        "Veteran cricket journalist and commentator, providing ball-by-ball coverage and analysis across formats.",
    "Gaurav Kalra":
        "Veteran sports journalist, editor, broadcaster and content strategist with over three decades of experience. He has reported on multiple sporting events and interviewed some of the world's leading sportspersons.",
    "G Rajaraman":
        "Senior sports journalist with 43 years' experience but considers himself a student of sport and continues learning from the sports ecosystem.",
    "Amieyra Khoslla": "India's 15-year-old speed climbing sensation. Set a new Indian National Youth Record at the IFSC World Youth Climbing Championships 2026, clocking 7.60 seconds and finishing 6th in the world. Also a promising sprinter — Delhi State Champion in the 60m for three consecutive years.",
};

export const EXPERT_ROLES: Record<string, string> = {
    "Anand Vasu": "Cricket Journalist & Commentator",
    "Gaurav Kalra": "Sports Journalist, Editor & Broadcaster",
    "G Rajaraman": "Senior Sports Journalist",
    "Amieyra Khoslla": "Speed Climber & Sprinter",
};

export const EXPERT_AVATARS: Record<string, string> = {
    "Anand Vasu": "/images/anandvasu.jpeg",
    "Gaurav Kalra": "/images/gauravkalra.jpeg",
    "G Rajaraman": "/images/grajaraman.jpeg",
    "Amieyra Khoslla": "/images/amieyrakhoslla.jpg",
};

export const EXPERT_TAGS: Record<string, string[]> = {
    "Anand Vasu": ["Cricket", "Commentary", "Match Analysis"],
    "Gaurav Kalra": ["Cricket", "Sports Media", "Broadcasting", "Insider Insights"],
    "G Rajaraman": ["Sports Journalism", "Multi-Sport", "Analysis"],
    "Amieyra Khoslla": ["Speed Climbing", "Sprinting", "National Record Holder"],

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