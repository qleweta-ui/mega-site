import type { SessionMetrics, GameState } from '../core/state';

export interface OverlayHandles {
  setMetrics: (metrics: SessionMetrics) => void;
  pushLog: (msg: string) => void;
  setStateLabel: (state: GameState) => void;
  setUV: (active: boolean) => void;
  setPerformance: (flag: boolean) => void;
}

export function createOverlay(root: HTMLElement) {
  const shell = document.createElement('div');
  shell.className = 'canvas-shell';

  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  shell.appendChild(tooltip);

  const ui = document.createElement('div');
  ui.className = 'ui-overlay';

  const topRow = document.createElement('div');
  topRow.className = 'ui-row';

  const stateBadge = document.createElement('div');
  stateBadge.className = 'badge';
  stateBadge.textContent = 'Booting';

  const uvBadge = document.createElement('div');
  uvBadge.className = 'badge';
  uvBadge.textContent = 'UV: OFF';

  const perfToggle = document.createElement('button');
  perfToggle.className = 'button secondary';
  perfToggle.textContent = 'Performance mode: OFF';
  let perf = false;
  perfToggle.onclick = () => {
    perf = !perf;
    perfToggle.textContent = `Performance mode: ${perf ? 'ON' : 'OFF'}`;
    perfToggle.dataset.state = perf ? 'on' : 'off';
    perfToggle.dispatchEvent(new CustomEvent('performance-toggle', { bubbles: true, detail: perf }));
  };

  topRow.append(stateBadge, uvBadge, perfToggle);

  const metricsPanel = document.createElement('div');
  metricsPanel.className = 'panel';
  const metricsTitle = document.createElement('h3');
  metricsTitle.textContent = 'Статус бюро';
  const statsGrid = document.createElement('div');
  statsGrid.className = 'stats-grid';
  const fields = ['Доверие', 'Аномальный фон', 'Дел обработано', 'Дел осталось', 'Время', 'Лучший исход'];
  const statValues = fields.map(() => {
    const div = document.createElement('div');
    div.className = 'stat';
    const label = document.createElement('span');
    const value = document.createElement('strong');
    div.append(label, value);
    statsGrid.appendChild(div);
    return value;
  });
  metricsPanel.append(metricsTitle, statsGrid);

  const controls = document.createElement('div');
  controls.className = 'controls';
  const tutorialBtn = document.createElement('button');
  tutorialBtn.className = 'button';
  tutorialBtn.textContent = 'Перезапустить туториал';
  tutorialBtn.onclick = () => tutorialBtn.dispatchEvent(new CustomEvent('restart-tutorial', { bubbles: true }));
  const lampHint = document.createElement('div');
  lampHint.className = 'badge';
  lampHint.textContent = 'Space — УФ-лампа';
  controls.append(tutorialBtn, lampHint);

  const actionPanel = document.createElement('div');
  actionPanel.className = 'controls';
  const approve = document.createElement('button');
  approve.className = 'button secondary';
  approve.textContent = 'Approve';
  approve.onclick = () => approve.dispatchEvent(new CustomEvent('case-action', { bubbles: true, detail: 'Approve' }));
  const quarantine = document.createElement('button');
  quarantine.className = 'button secondary';
  quarantine.textContent = 'Quarantine';
  quarantine.onclick = () => quarantine.dispatchEvent(new CustomEvent('case-action', { bubbles: true, detail: 'Quarantine' }));
  const destroy = document.createElement('button');
  destroy.className = 'button';
  destroy.textContent = 'Destroy';
  destroy.onclick = () => destroy.dispatchEvent(new CustomEvent('case-action', { bubbles: true, detail: 'Destroy' }));
  actionPanel.append(approve, quarantine, destroy);

  const logPanel = document.createElement('div');
  logPanel.className = 'panel';
  const logTitle = document.createElement('h3');
  logTitle.textContent = 'Журнал событий';
  const logArea = document.createElement('div');
  logArea.className = 'log';
  logPanel.append(logTitle, logArea);

  ui.append(topRow, metricsPanel, controls, actionPanel, logPanel);

  shell.appendChild(ui);
  const vignette = document.createElement('div');
  vignette.className = 'vignette-layer';
  shell.appendChild(vignette);
  const grain = document.createElement('div');
  grain.className = 'grain-layer';
  shell.appendChild(grain);

  root.appendChild(shell);

  const handles: OverlayHandles = {
    setMetrics: (metrics) => {
      const [trust, anomaly, done, remaining, timeLeft, ending] = statValues;
      trust.textContent = `${(metrics.trust * 100).toFixed(0)}%`;
      anomaly.textContent = `${(metrics.anomaly * 100).toFixed(0)}%`;
      done.textContent = `${metrics.processed}`;
      remaining.textContent = `${metrics.remaining}`;
      timeLeft.textContent = `${Math.max(0, Math.ceil(metrics.timeLeft))}с`;
      ending.textContent = localStorage.getItem('bureau-of-anomalies-best') || '—';
      fields.forEach((label, idx) => {
        (statsGrid.children[idx].firstChild as HTMLElement).textContent = label;
      });
    },
    pushLog: (msg) => {
      const line = document.createElement('div');
      line.textContent = msg;
      logArea.prepend(line);
      while (logArea.childElementCount > 12) logArea.removeChild(logArea.lastChild!);
    },
    setStateLabel: (state) => {
      stateBadge.innerHTML = `<strong>Состояние:</strong> ${state}`;
    },
    setUV: (active) => {
      uvBadge.innerHTML = `<strong>UV:</strong> ${active ? 'ON' : 'OFF'}`;
      uvBadge.style.color = active ? 'var(--accent-uv)' : '#f5f2eb';
    },
    setPerformance: (flag) => {
      perf = flag;
      perfToggle.textContent = `Performance mode: ${flag ? 'ON' : 'OFF'}`;
      perfToggle.dataset.state = flag ? 'on' : 'off';
    }
  };

  return { shell, tooltip, handles, perfToggle, tutorialBtn };
}
