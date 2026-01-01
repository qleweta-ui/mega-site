export type GameState = 'Boot' | 'Desk' | 'CaseReview' | 'Result' | 'Ending';

export type CaseDecision = 'Approve' | 'Quarantine' | 'Destroy';

export interface CaseFile {
  id: string;
  date: string;
  classification: 'Alpha' | 'Beta' | 'Gamma';
  risk: number;
  pages: string[];
  anomalies: string[];
  photoNote: string;
  needsUV: boolean;
  signatureHint: string;
  resolution: CaseDecision | null;
  requiresClip: boolean;
  misdirection?: string;
}

export interface SessionMetrics {
  trust: number;
  anomaly: number;
  processed: number;
  remaining: number;
  timeLeft: number;
}
