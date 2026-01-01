import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import Matter from 'matter-js';
import { sounds } from '../audio/sounds';

export function makeTextCreep(textNodes: Text[]) {
  textNodes.forEach((node, idx) => {
    node.eventMode = 'dynamic';
    node.cursor = 'help';
    node.on('pointerover', () => {
      const delta = (idx % 2 === 0 ? 1 : -1) * (3 + Math.random() * 6);
      gsap.to(node, { x: node.x + delta, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' });
      node.alpha = 0.9;
    });
    node.on('pointerout', () => {
      gsap.to(node, { alpha: 1, duration: 0.25 });
    });
  });
}

export function makeStampMagnetic(stamp: Container, forbiddenZones: Graphics[], engine: Matter.Engine) {
  stamp.eventMode = 'dynamic';
  stamp.cursor = 'grab';
  const body = Matter.Bodies.circle(stamp.x, stamp.y, 26, { friction: 0.3, restitution: 0.1 });
  Matter.World.add(engine.world, body);

  let dragging = false;
  stamp.on('pointerdown', () => {
    dragging = true;
    stamp.cursor = 'grabbing';
  });
  stamp.on('pointerupoutside', () => (dragging = false));
  stamp.on('pointerup', () => {
    dragging = false;
    stamp.cursor = 'grab';
    sounds.stamp.play();
    const zone = forbiddenZones.find((z) => z.getBounds().contains(stamp.x, stamp.y));
    if (zone) {
      const b = zone.getBounds();
      gsap.to(stamp, { x: b.x + b.width / 2, y: b.y + b.height / 2, duration: 0.25, ease: 'back.out(2)' });
    }
  });
  stamp.on('pointermove', (e) => {
    if (!dragging) return;
    const pos = e.getLocalPosition(stamp.parent);
    Matter.Body.setPosition(body, { x: pos.x, y: pos.y });
    stamp.position.copyFrom(pos);
  });
}

export function makeSignatureScratch(area: Graphics, signature: Text) {
  area.eventMode = 'dynamic';
  area.cursor = 'cell';
  const mask = new Graphics().rect(area.x, area.y, area.width, area.height).fill({ color: 0x000000 });
  signature.mask = mask;
  let revealed = 0;
  area.on('pointermove', (e) => {
    if (e.buttons === 0) return;
    const p = e.getLocalPosition(area.parent);
    mask.beginFill(0xffffff, 1);
    mask.drawCircle(p.x, p.y, 10 + Math.random() * 6);
    mask.endFill();
    revealed += 1;
    if (revealed > 20) signature.alpha = 1;
  });
  area.parent?.addChild(mask);
}

export function makePhotoStain(photo: Graphics, clip: Graphics, options: { onFix: () => void }) {
  const stain = new Graphics().circle(photo.x + photo.width / 2, photo.y + photo.height / 2, 6).fill({ color: 0x5c3b2e, alpha: 0.65 });
  photo.parent?.addChild(stain);
  let pinned = false;
  let grow = false;
  photo.eventMode = 'dynamic';
  photo.on('pointerover', () => {
    grow = true;
    const loop = () => {
      if (!grow || pinned) return;
      stain.scale.x += 0.02;
      stain.scale.y += 0.02;
      requestAnimationFrame(loop);
    };
    loop();
  });
  photo.on('pointerout', () => (grow = false));

  clip.eventMode = 'dynamic';
  clip.cursor = 'pointer';
  clip.on('pointerdown', () => {
    pinned = true;
    gsap.to(stain.scale, { x: 1, y: 1, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
    sounds.clip.play();
    options.onFix();
  });
}

export function makeUVOverlay(layer: Container, label: Text) {
  label.alpha = 0;
  const bounds = layer.getBounds();
  const scrim = new Graphics().rect(0, 0, bounds.width || 860, bounds.height || 560).fill({ color: 0x9b7bf0, alpha: 0.08 });
  scrim.visible = false;
  layer.addChild(scrim);
  return {
    show() {
      scrim.visible = true;
      gsap.to(label, { alpha: 1, duration: 0.2 });
    },
    hide() {
      scrim.visible = false;
      gsap.to(label, { alpha: 0.2, duration: 0.2 });
    }
  };
}
