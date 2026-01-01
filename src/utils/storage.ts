export type SavePayload = {
  bestEnding: string | null;
  completedCases: number;
  trust: number;
  anomaly: number;
};

const KEY = 'bureau-of-anomalies-save-v1';

export function loadProgress(): SavePayload {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return { bestEnding: null, completedCases: 0, trust: 1, anomaly: 0 };
    }
    const parsed = JSON.parse(raw) as SavePayload;
    return {
      bestEnding: parsed.bestEnding ?? null,
      completedCases: parsed.completedCases ?? 0,
      trust: parsed.trust ?? 1,
      anomaly: parsed.anomaly ?? 0
    };
  } catch (err) {
    console.warn('Failed to load save', err);
    return { bestEnding: null, completedCases: 0, trust: 1, anomaly: 0 };
  }
}

export function saveProgress(payload: SavePayload) {
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to persist save', err);
  }
}
