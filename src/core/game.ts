import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import Matter from 'matter-js';
import { createScene } from '../render/scene';
import { CaseDeck } from '../cases';
import type { CaseDecision, CaseFile, GameState, SessionMetrics } from './state';
import { createOverlay } from '../ui/overlay';
import { createPhysicsWorld } from '../physics/world';
import { makePhotoStain, makeSignatureScratch, makeStampMagnetic, makeTextCreep, makeUVOverlay } from '../fx/anomalies';
import { sounds } from '../audio/sounds';
import { loadProgress, saveProgress } from '../utils/storage';

export class Game {
  private state: GameState = 'Boot';
  private deck = new CaseDeck();
  private currentCase: CaseFile | null = null;
  private sessionGoal = 6;
  private trust = 1;
  private anomaly = 0;
  private processed = 0;
  private startTime = Date.now();
  private uvActive = false;
  private uvUsedThisCase = false;
  private uvOverlay?: { show: () => void; hide: () => void };
  private performance = false;
  private log: string[] = [];

  private scene!: Awaited<ReturnType<typeof createScene>>;
  private overlay!: ReturnType<typeof createOverlay>;
  private physics!: ReturnType<typeof createPhysicsWorld>;
  private ticker?: number;

  async boot(root: HTMLElement) {
    const save = loadProgress();
    this.trust = save.trust;
    this.anomaly = save.anomaly;
    if (save.bestEnding) {
      localStorage.setItem('bureau-of-anomalies-best', save.bestEnding);
    }
    this.overlay = createOverlay(root);
    this.scene = await createScene(1180, 740);
    this.physics = createPhysicsWorld(1180, 740);

    this.overlay.shell.prepend(this.scene.app.canvas as HTMLCanvasElement);

    this.bindControls();
    this.setState('Boot');
    this.logMessage('Добро пожаловать в бюро. 60-секундный вводный режим.');
    this.runTutorial();
    this.startTicker();
  }

  private bindControls() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.uvActive) {
        this.uvActive = true;
        this.overlay.handles.setUV(true);
        sounds.lamp.play();
        this.uvUsedThisCase = true;
        this.uvOverlay?.show();
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space' && this.uvActive) {
        this.uvActive = false;
        this.overlay.handles.setUV(false);
        sounds.lamp.stop();
        this.uvOverlay?.hide();
      }
    });

    this.overlay.shell.addEventListener('case-action', (e: Event) => {
      const detail = (e as CustomEvent).detail as CaseDecision;
      this.resolveCase(detail);
    });

    this.overlay.perfToggle.addEventListener('performance-toggle', (e: Event) => {
      this.performance = Boolean((e as CustomEvent).detail);
      this.overlay.handles.setPerformance(this.performance);
    });

    this.overlay.tutorialBtn.addEventListener('restart-tutorial', () => this.runTutorial());
  }

  private runTutorial() {
    this.setState('Boot');
    this.logMessage('Туториал: перетащите печать, потрите подпись, включайте УФ (Space), закрепите пятно скрепкой.');
    setTimeout(() => this.setState('Desk'), 1500);
    setTimeout(() => this.nextCase(), 2600);
  }

  private setState(state: GameState) {
    this.state = state;
    this.overlay.handles.setStateLabel(state);
  }

  private startTicker() {
    const loop = () => {
      const now = Date.now();
      const elapsed = (now - this.startTime) / 1000;
      const timeLeft = Math.max(0, 12 * 60 - elapsed);
      this.overlay.handles.setMetrics({
        trust: this.trust,
        anomaly: this.anomaly,
        processed: this.processed,
        remaining: Math.max(0, this.sessionGoal - this.processed),
        timeLeft
      });
      Matter.Engine.update(this.physics.engine, 16);
      this.ticker = requestAnimationFrame(loop);
      if (timeLeft <= 0 && this.state !== 'Ending') {
        this.finishSession();
      }
    };
    this.ticker = requestAnimationFrame(loop);
  }

  private nextCase() {
    if (this.processed >= this.sessionGoal) {
      this.finishSession();
      return;
    }
    const next = this.deck.next();
    if (!next) {
      this.finishSession();
      return;
    }
    this.currentCase = next;
    this.uvUsedThisCase = false;
    this.state = 'CaseReview';
    this.overlay.handles.setStateLabel('CaseReview');
    this.renderCase(next);
    this.logMessage(`Новое дело ${next.id}: ${next.anomalies.join(', ')}.`);
  }

  private renderCase(file: CaseFile) {
    this.scene.layers.papers.removeChildren();
    const card = new Container();
    card.position.set(160, 80);

    const paper = new Graphics()
      .roundRect(0, 0, 860, 560, 22)
      .fill({ color: 0xf4f0e4 })
      .stroke({ color: 0x0f0d0b, width: 2, alpha: 0.12 });
    paper.alpha = 0.97;
    paper.filters = [];
    card.addChild(paper);

    const title = new Text({
      text: `Case ${file.id} — ${file.classification}`,
      style: new TextStyle({ fontFamily: 'Spectral SC', fontSize: 26, fill: 0x1f1b14 })
    });
    title.position.set(24, 20);
    card.addChild(title);

    const meta = new Text({
      text: `Дата: ${file.date}  |  Риск: ${file.risk}  |  UV обязательно: ${file.needsUV ? 'да' : 'нет'}`,
      style: new TextStyle({ fontFamily: 'Inter', fontSize: 14, fill: 0x2a2620 })
    });
    meta.position.set(24, 60);
    card.addChild(meta);

    const body = new Container();
    body.position.set(24, 100);
    card.addChild(body);

    const textNodes: Text[] = [];
    file.pages.forEach((page, idx) => {
      const paragraph = new Text({
        text: `${idx + 1}. ${page}`,
        style: new TextStyle({ fontFamily: 'Inter', fontSize: 15, fill: 0x211d16, wordWrap: true, wordWrapWidth: 480 })
      });
      paragraph.y = idx * 80;
      textNodes.push(paragraph);
      body.addChild(paragraph);
    });
    makeTextCreep(textNodes);

    const stamp = new Graphics()
      .circle(0, 0, 28)
      .fill({ color: 0xb03a48, alpha: 0.9 })
      .stroke({ color: 0x1e1c1a, width: 3, alpha: 0.6 });
    stamp.position.set(760, 420);
    stamp.alpha = 0.88;
    const forbidden = new Graphics()
      .rect(40, 40, 120, 120)
      .fill({ color: 0xe3a63b, alpha: 0.05 })
      .stroke({ color: 0xb03a48, width: 2, alpha: 0.4 });
    body.addChild(forbidden);
    card.addChild(stamp);
    makeStampMagnetic(stamp, [forbidden], this.physics.engine);

    const signature = new Text({
      text: file.signatureHint,
      style: new TextStyle({ fontFamily: 'Spectral SC', fontSize: 16, fill: 0x1a1410 })
    });
    signature.alpha = 0.12;
    signature.position.set(520, 120);
    const scratchArea = new Graphics().rect(500, 110, 200, 60).fill({ color: 0x0f0d0b, alpha: 0.04 });
    card.addChild(scratchArea, signature);
    makeSignatureScratch(scratchArea, signature);

    const photo = new Graphics().roundRect(520, 220, 220, 140, 10).fill({ color: 0x24201c, alpha: 0.18 });
    const clip = new Graphics().roundRect(730, 210, 24, 64, 6).fill({ color: 0xe3a63b, alpha: 0.7 });
    card.addChild(photo, clip);
    makePhotoStain(photo, clip, { onFix: () => (this.anomaly = Math.max(0, this.anomaly - 0.02)) });

    const uvLabel = new Text({
      text: 'UV активирован — скрытые отметки видны',
      style: new TextStyle({ fontFamily: 'Inter', fontSize: 14, fill: 0x9b7bf0 })
    });
    uvLabel.position.set(500, 380);
    card.addChild(uvLabel);
    this.uvOverlay = makeUVOverlay(card, uvLabel);

    const decisionHint = new Text({
      text: 'Решение: перетяните штамп и выберите кнопкой. УФ-лампа удержанием Space.',
      style: new TextStyle({ fontFamily: 'Inter', fontSize: 13, fill: 0x2b2620 })
    });
    decisionHint.position.set(24, 500);
    card.addChild(decisionHint);

    this.scene.layers.papers.addChild(card);
  }

  private resolveCase(decision: CaseDecision) {
    if (!this.currentCase) return;
    const usedUV = this.uvUsedThisCase;
    const resolved = this.deck.markResolution(this.currentCase, decision, usedUV);
    this.processed += 1;

    if (resolved.needsUV && !usedUV) {
      this.trust -= 0.08;
      this.anomaly += 0.12;
      this.logMessage('Решение без УФ: доверие снизилось, фон вырос.');
      sounds.warning.play();
    } else {
      this.trust = Math.min(1, this.trust + 0.02);
    }

    if (resolved.requiresClip && !usedUV) {
      this.anomaly += 0.04;
    }

    if (decision === 'Destroy' && resolved.classification !== 'Gamma') {
      this.trust -= 0.05;
      this.anomaly += 0.05;
    }

    if (this.trust < 0.1) {
      this.logMessage('Доверие критически низкое.');
    }

    saveProgress({
      bestEnding: localStorage.getItem('bureau-of-anomalies-best'),
      completedCases: this.processed,
      trust: this.trust,
      anomaly: this.anomaly
    });

    this.currentCase = null;
    this.scene.layers.papers.removeChildren();
    this.state = 'Desk';
    this.overlay.handles.setStateLabel('Desk');
    this.logMessage(`Дело ${resolved.id} закрыто решением ${decision}.`);
    setTimeout(() => this.nextCase(), 900);
  }

  private finishSession() {
    this.state = 'Ending';
    this.overlay.handles.setStateLabel('Ending');
    const ending = this.pickEnding();
    localStorage.setItem('bureau-of-anomalies-best', ending);
    this.logMessage(`Сессия завершена. Итог: ${ending}`);
    this.showEndingCard(ending);
  }

  private pickEnding() {
    if (this.anomaly > 0.8) return 'Бюро заражено';
    if (this.trust > 0.85 && this.anomaly < 0.35) return 'Бюро стабильно';
    if (this.processed >= this.sessionGoal && this.trust > 0.6 && this.anomaly > 0.4) return 'Бюро приняло вас';
    return 'Неопределённый итог';
  }

  private showEndingCard(label: string) {
    this.scene.layers.papers.removeChildren();
    const card = new Container();
    card.position.set(240, 180);
    const panel = new Graphics()
      .roundRect(0, 0, 640, 360, 22)
      .fill({ color: 0xf4f0e4 })
      .stroke({ color: 0x0f0d0b, width: 2, alpha: 0.15 });
    const title = new Text({ text: 'Итоговая сводка', style: new TextStyle({ fontFamily: 'Spectral SC', fontSize: 28, fill: 0x1f1b14 }) });
    title.position.set(32, 24);
    const summary = new Text({
      text: `${label}. Дел: ${this.processed}/${this.sessionGoal}. Доверие ${(this.trust * 100).toFixed(0)}%. Фон ${(this.anomaly * 100).toFixed(0)}%.`,
      style: new TextStyle({ fontFamily: 'Inter', fontSize: 16, fill: 0x211d16, wordWrap: true, wordWrapWidth: 560 })
    });
    summary.position.set(32, 90);
    card.addChild(panel, title, summary);
    this.scene.layers.papers.addChild(card);
  }

  private logMessage(message: string) {
    this.log.unshift(message);
    this.overlay.handles.pushLog(message);
    while (this.log.length > 16) this.log.pop();
  }
}
