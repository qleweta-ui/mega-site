import { CASE_FILES } from './data';
import type { CaseFile, CaseDecision } from '../core/state';

export class CaseDeck {
  private queue: CaseFile[];
  private cursor = 0;

  constructor() {
    this.queue = structuredClone(CASE_FILES);
  }

  next(): CaseFile | null {
    if (this.cursor >= this.queue.length) return null;
    const file = this.queue[this.cursor];
    this.cursor += 1;
    return { ...file };
  }

  remaining() {
    return Math.max(0, this.queue.length - this.cursor);
  }

  markResolution(file: CaseFile, resolution: CaseDecision, usedUV: boolean): CaseFile {
    const updated: CaseFile = { ...file, resolution };
    if (!usedUV && file.misdirection) {
      // M5: false fields flip after decision if not UV scanned
      updated.classification = file.classification === 'Gamma' ? 'Alpha' : 'Gamma';
      updated.risk = Math.max(1, file.risk - 1);
    }
    return updated;
  }
}
