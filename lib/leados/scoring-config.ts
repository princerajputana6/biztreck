// LeadOS — scoring configuration. Weights and thresholds live here (not scattered
// through the scoring logic) so they can be tuned without touching the algorithm,
// and later be driven from a DB/UI setting or per-campaign override.
//
// `LEADOS_SCORE_WEIGHTS` (env, JSON) can override the overall-score blend, e.g.
//   LEADOS_SCORE_WEIGHTS='{"quality":0.35,"software":0.3,"ai":0.2,"website":0.15}'

export type OverallWeights = {
  quality: number;
  software: number;
  ai: number;
  website: number;
};

export type ScoreConfig = {
  /** Blend for the base opportunity `overall` score. Should sum to ~1. */
  overall: OverallWeights;
  /** Priority cut-offs on the overall score. */
  priority: { hot: number; warm: number; cold: number; ignoreQualityBelow: number };
  /** Premium-tier cut-offs on the premium score. */
  premium: { premiumAt: number; standardAt: number };
  /** Buying-intent score at/above which a prospect is "high intent". */
  intent: { highAt: number };
};

const DEFAULTS: ScoreConfig = {
  overall: { quality: 0.4, software: 0.25, ai: 0.2, website: 0.15 },
  priority: { hot: 70, warm: 50, cold: 30, ignoreQualityBelow: 25 },
  premium: { premiumAt: 65, standardAt: 40 },
  intent: { highAt: 60 },
};

let cached: ScoreConfig | undefined;

/** The active scoring config (defaults, with an optional env override of weights). */
export function getScoreConfig(): ScoreConfig {
  if (cached) return cached;
  let overall = DEFAULTS.overall;
  const raw = process.env.LEADOS_SCORE_WEIGHTS;
  if (raw) {
    try {
      const w = JSON.parse(raw);
      overall = {
        quality: Number(w.quality ?? overall.quality),
        software: Number(w.software ?? overall.software),
        ai: Number(w.ai ?? overall.ai),
        website: Number(w.website ?? overall.website),
      };
    } catch {
      /* keep defaults on bad JSON */
    }
  }
  cached = { ...DEFAULTS, overall };
  return cached;
}
